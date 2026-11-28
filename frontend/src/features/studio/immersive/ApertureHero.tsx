"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
  Phone,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useReducedMotion } from "@/components/shared/MotionPrimitives";
import { useQuoteModal } from "@/hooks";
import { COMPANY_INFO } from "@/lib/company-data";
import { RING_COUNT, RING_SLIDES, type RingSlide } from "./slides";
import { StationDrawer } from "./StationDrawer";

/* ────────────────────────────────────────────────────────────────────────────
   Geometry — a straight-down view of a giant machined ring whose centre is
   far below the screen. Only its top arc is visible.
   ──────────────────────────────────────────────────────────────────────────── */

type Geom = {
  W: number;
  H: number;
  dpr: number;
  mobile: boolean;
  R: number;
  CX: number;
  CY: number;
  RI: number;
  IW: number;
  IH: number;
  DELTA: number;
  half: number;
};

const TAU = Math.PI * 2;
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function computeGeom(): Geom {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const mobile = W < 860;
  const R = mobile ? 1.5 * W : 1.45 * W;
  const CX = mobile ? 0.5 * W : 0.6 * W;
  const CY = (mobile ? 0.5 : 0.29) * H + R;
  const IW = mobile ? 0.74 * W : 0.31 * W;
  const IH = IW * 0.672;
  const RI = R - (mobile ? 0.2 : 0.27) * H;
  const DELTA = (mobile ? 0.92 * W : 0.47 * W) / RI;
  const half = Math.acos(clamp((CY - H) / R, -1, 1)) + 0.08;
  return { W, H, dpr, mobile, R, CX, CY, RI, IW, IH, DELTA, half };
}

function prepareCanvas(canvas: HTMLCanvasElement, g: Geom) {
  canvas.width = Math.round(g.W * g.dpr);
  canvas.height = Math.round(g.H * g.dpr);
  canvas.style.width = `${g.W}px`;
  canvas.style.height = `${g.H}px`;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.setTransform(g.dpr, 0, 0, g.dpr, 0, 0);
  return ctx;
}

/** Static disc: painted once per resize, never per frame. */
function drawDisc(ctx: CanvasRenderingContext2D, g: Geom) {
  const { W, H, R, CX, CY, half } = g;
  ctx.clearRect(0, 0, W, H);
  ctx.save();

  // Blue glow above the machined disc.
  ctx.shadowColor = "rgba(201,128,63,.3)";
  ctx.shadowBlur = 120;
  ctx.shadowOffsetY = -30;
  const fill = ctx.createRadialGradient(CX, CY - R * 0.22, R * 0.05, CX, CY, R);
  fill.addColorStop(0, "#111216");
  fill.addColorStop(1, "#15161a");
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, TAU);
  ctx.fill();
  ctx.restore();

  // Machining grooves, only across the visible upper half.
  ctx.save();
  ctx.beginPath();
  ctx.arc(CX, CY, R - 2, -Math.PI / 2 - half, -Math.PI / 2 + half);
  ctx.arc(CX, CY, R - 210, -Math.PI / 2 + half, -Math.PI / 2 - half, true);
  ctx.clip();
  for (let r = R - 205; r <= R; r += 4.5) {
    const alpha = 0.018 + ((r % 13.5) / 13.5) * 0.012;
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(CX, CY, r, -Math.PI / 2 - half, -Math.PI / 2 + half);
    ctx.stroke();
  }
  // Fixed white light sweep at the top of the ring.
  const sweep = ctx.createLinearGradient(0, CY - R - 20, 0, CY - R + 190);
  sweep.addColorStop(0, "rgba(255,255,255,.075)");
  sweep.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sweep;
  ctx.fillRect(0, CY - R - 20, W, 230);
  ctx.restore();

  // Two rim hairlines.
  ctx.lineWidth = 1;
  for (const [radius, color] of [
    [R, "rgba(255,255,255,.16)"],
    [R - 7, "rgba(122,164,255,.12)"],
  ] as const) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(CX, CY, radius, -Math.PI / 2 - half, -Math.PI / 2 + half);
    ctx.stroke();
  }
}

/** Rotating knurl / ticks / engraved scales. Only repainted when rot changes. */
function drawRing(ctx: CanvasRenderingContext2D, g: Geom, rot: number) {
  const { W, H, R, CX, CY, half } = g;
  ctx.clearRect(0, 0, W, H);
  ctx.lineCap = "butt";

  // Knurled edge: one radial line every 4.8px of arc.
  ctx.strokeStyle = "#26282d";
  ctx.lineWidth = 1.15;
  const knurlStep = 4.8 / R;
  const lambdaStart = Math.floor((-half - rot) / knurlStep) - 1;
  const lambdaEnd = Math.ceil((half - rot) / knurlStep) + 1;
  for (let n = lambdaStart; n <= lambdaEnd; n += 1) {
    const phi = n * knurlStep + rot;
    if (phi < -half || phi > half) continue;
    const a = -Math.PI / 2 + phi;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    ctx.beginPath();
    ctx.moveTo(CX + (R - 1) * cos, CY + (R - 1) * sin);
    ctx.lineTo(CX + (R - 14) * cos, CY + (R - 14) * sin);
    ctx.stroke();
  }

  // Tick scale: every 1°, longer every 5°.
  const tick = Math.PI / 180;
  const tickStart = Math.floor((-half - rot) / tick) - 1;
  const tickEnd = Math.ceil((half - rot) / tick) + 1;
  for (let n = tickStart; n <= tickEnd; n += 1) {
    const phi = n * tick + rot;
    if (phi < -half || phi > half) continue;
    const a = -Math.PI / 2 + phi;
    const long = n % 5 === 0;
    const inner = long ? R - 34 : R - 27;
    ctx.strokeStyle = long
      ? "rgba(238,240,243,.24)"
      : "rgba(238,240,243,.10)";
    ctx.lineWidth = long ? 1.3 : 1;
    ctx.beginPath();
    ctx.moveTo(CX + (R - 20) * Math.cos(a), CY + (R - 20) * Math.sin(a));
    ctx.lineTo(CX + inner * Math.cos(a), CY + inner * Math.sin(a));
    ctx.stroke();
  }

  // Glyph-by-glyph engraved rim text, tangent to the arc.
  const fontSize = Math.max(13, W * 0.0125);
  const spacing = fontSize * 0.42;
  const engraving =
    "S SQUARE · COIMBATORE · CUSTOM RUBBER STEEL ALUMINIUM · BUILT TO DRAWING OR SAMPLE · ";
  const focusScale = "∞ 10 5 3 2 1.5 1 m · 1.4 2 2.8 4 5.6 8 11 16 · ";

  const drawScale = (text: string, radius: number, color: string, size: number) => {
    ctx.font = `600 ${size}px "Barlow Condensed", "Arial Narrow", sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const chars = Array.from(text);
    const advances = chars.map((ch) => ctx.measureText(ch).width + spacing);
    const period = advances.reduce((sum, a) => sum + a / radius, 0);
    if (period <= 0) return;
    const repeats = Math.ceil((half * 2) / period) + 2;
    const kStart = Math.floor((-half - rot) / period) - 1;
    for (let k = kStart; k <= kStart + repeats + 2; k += 1) {
      let lambda = k * period;
      for (let i = 0; i < chars.length; i += 1) {
        const phi = lambda + rot;
        lambda += advances[i] / radius;
        if (phi < -half || phi > half) continue;
        const a = -Math.PI / 2 + phi;
        const x = CX + radius * Math.cos(a);
        const y = CY + radius * Math.sin(a);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(phi);
        ctx.fillText(chars[i], 0, 0);
        ctx.restore();
      }
    }
  };

  drawScale(engraving.repeat(2), R - 58, "rgba(255,255,255,.24)", fontSize);
  drawScale(focusScale.repeat(2), R - 96, "rgba(122,164,255,.34)", fontSize * 0.78);
}

/* ────────────────────────────────────────────────────────────────────────────
   Component
   ──────────────────────────────────────────────────────────────────────────── */

type Swap = "idle" | "out" | "in";

export function ApertureHero({ paused }: { paused: boolean }) {
  const reduced = useReducedMotion();
  const { openQuoteModal } = useQuoteModal();
  const motionEnabled = !paused && !reduced;

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLCanvasElement>(null);
  const ringRef = useRef<HTMLCanvasElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const accRefs = useRef<(HTMLSpanElement | null)[][]>([]);

  const geomRef = useRef<Geom | null>(null);
  const targetRef = useRef(0);
  const posRef = useRef(0);
  const heroTopRef = useRef(0);
  const segRef = useRef(0);
  /** Station the hero is currently scrolling itself to, and until when. */
  const progScrollRef = useRef<{ target: number; until: number } | null>(null);
  const manualUntilRef = useRef(0);
  const draggingRef = useRef(false);
  const visibleRef = useRef(false);
  const activeRef = useRef(0);
  const motionRef = useRef(motionEnabled);
  const lastRotRef = useRef(Number.NaN);
  const springRef = useRef(
    RING_SLIDES.map((slide) => ({
      s: slide.accessories.map(() => 0),
      v: slide.accessories.map(() => 0),
    })),
  );
  const goToRef = useRef<(index: number, follow?: boolean) => void>(() => {});
  const suppressClickRef = useRef(false);

  const [active, setActive] = useState(0);
  const [display, setDisplay] = useState(0);
  const [swap, setSwap] = useState<Swap>("idle");
  const [aperture, setAperture] = useState(RING_SLIDES[0].aperture);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  activeRef.current = active;
  motionRef.current = motionEnabled;

  const slide: RingSlide = RING_SLIDES[active];
  const readout = `${slide.number} / ${RING_COUNT.toString().padStart(2, "0")} · ${slide.name}`;
  const shown: RingSlide = RING_SLIDES[display];
  /**
   * The hero no longer advances by itself. It used to move the ring every
   * 5.5 s, which fought the reader on a page whose sections are read in order;
   * the stations are now reached by scrolling, the tabs, the arrows or a drag.
   * The attribute is kept (and always false) so the "nothing moves the page
   * under you" contract stays assertable.
   */
  const autoplay = false;

  /**
   * Move the ring to a station.
   *
   * Only explicit user input (`scroll`, the arrows/tabs, wheel or drag) may
   * reposition the document. Autoplay turns the ring in place: hijacking the
   * page scroll from a timer dragged readers away from the hero on load and
   * hid the footer.
   */
  /**
   * Scroll to a station and remember that the hero owns the scroll until it
   * lands. A long smooth scroll outlives the short "manual" guard, and without
   * this flag the snap timer used to interrupt it and dump the reader on a
   * segment boundary instead of the requested station.
   */
  const scrollToStation = useCallback((top: number) => {
    if (!Number.isFinite(top)) return;
    if (!motionRef.current) {
      progScrollRef.current = null;
      window.scrollTo({ top, behavior: "auto" });
      return;
    }
    const distance = Math.abs(top - window.scrollY);
    const duration = Math.min(1400, 260 + distance * 0.45);
    progScrollRef.current = { target: top, until: performance.now() + duration };
    window.scrollTo({ top, behavior: "smooth" });
  }, []);
  const goTo = useCallback((index: number, follow = true) => {
    const next = clamp(Math.round(index), 0, RING_COUNT - 1);
    targetRef.current = next;
    posRef.current = motionRef.current ? posRef.current : next;
    manualUntilRef.current = performance.now() + 1600;
    setActive((current) => (current === next ? current : next));
    setInteracted(true);
    if (!follow) return;
    scrollToStation(heroTopRef.current + next * segRef.current);
  }, []);
  goToRef.current = goTo;

  /** Static layout for reduced motion / paused motion / no canvas. */
  const layoutStatic = useCallback(() => {
    const g = geomRef.current;
    if (!g) return;
    const { CX, CY, RI, IW, IH, DELTA } = g;
    const anchor = activeRef.current;
    RING_SLIDES.forEach((entry, i) => {
      const el = itemRefs.current[i];
      if (!el) return;
      const d = i - anchor;
      const phi = d * DELTA;
      const a = -Math.PI / 2 + phi;
      const x = CX + RI * Math.cos(a);
      const y = CY + RI * Math.sin(a);
      el.style.transform = `translate3d(${x - IW / 2}px, ${y - IW / 2}px, 0) rotate(${phi}rad)`;
      el.style.opacity = i === anchor ? "1" : "0.34";
      el.style.visibility = Math.abs(d) > 1.9 ? "hidden" : "visible";
      el.style.removeProperty("--ar-blur");
      entry.accessories.forEach((accessory, j) => {
        const node = accRefs.current[i]?.[j];
        if (!node) return;
        node.style.transform = `translate(-50%,-50%) translate(${accessory.x * IW}px, ${accessory.y * IW}px) rotate(${accessory.rotate}deg)`;
        node.style.opacity = i === anchor ? "1" : "0";
      });
    });
  }, []);

  /* ── Main engine: geometry, listeners, RAF ─────────────────────────────── */
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    let raf = 0;
    let last = performance.now();
    let snapTimer: ReturnType<typeof setTimeout> | undefined;
    let wheelAccum = 0;
    let wheelLock = 0;
    let pendingDrag = false;
    let dragStarted = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartPos = 0;
    let dragLastX = 0;
    let dragLastT = 0;
    let dragVelocity = 0;

    const inRange = () => {
      const y = window.scrollY;
      return (
        y >= heroTopRef.current - window.innerHeight * 0.4 &&
        y <= heroTopRef.current + (RING_COUNT - 1) * segRef.current + window.innerHeight * 0.4
      );
    };

    const applyGeometry = () => {
      const g = computeGeom();
      geomRef.current = g;
      heroTopRef.current = section.offsetTop;
      // The pinned travel is whatever distance the section keeps the stage
      // stuck for: total height minus one stage. Deriving the segment from the
      // viewport instead over-runs the section once there are four stations,
      // and clicking a later tab scrolled the hero clean out of view.
      const travel = section.offsetHeight - stage.offsetHeight;
      segRef.current =
        RING_COUNT > 1 ? Math.max(120, travel / (RING_COUNT - 1)) : travel;
      stage.style.setProperty("--ar-cx", `${g.CX}px`);
      stage.style.setProperty("--ar-r", `${g.R}px`);
      stage.style.setProperty("--ar-rim-top", `${g.CY - g.R}px`);
      stage.style.setProperty("--ar-iw", `${g.IW}px`);
      stage.style.setProperty("--ar-ih", `${g.IH}px`);
      stage.style.setProperty("--ar-ri", `${g.RI}px`);
      stage.style.setProperty("--ar-delta", `${g.DELTA}rad`);

      if (motionRef.current) {
        if (discRef.current) {
          const ctx = prepareCanvas(discRef.current, g);
          if (ctx) drawDisc(ctx, g);
        }
        if (ringRef.current) {
          const ctx = prepareCanvas(ringRef.current, g);
          if (ctx) drawRing(ctx, g, -posRef.current * g.DELTA);
        }
        lastRotRef.current = -posRef.current * g.DELTA;
      } else {
        layoutStatic();
      }
    };

    const onScroll = () => {
      if (!inRange()) return;
      const now = performance.now();
      const prog = progScrollRef.current;
      if (prog) {
        if (Math.abs(window.scrollY - prog.target) < 2 || now > prog.until + 500) {
          progScrollRef.current = null;
        } else {
          // Let the hero's own scroll animation land before reading position.
          return;
        }
      }
      const g = geomRef.current;
      if (!g) return;
      const pos = clamp(
        (window.scrollY - heroTopRef.current) / segRef.current,
        0,
        RING_COUNT - 1,
      );
      if (now > manualUntilRef.current && !draggingRef.current) {
        targetRef.current = pos;
        const idx = clamp(Math.round(pos), 0, RING_COUNT - 1);
        setActive((current) => (current === idx ? current : idx));
      }
      if (snapTimer) clearTimeout(snapTimer);
      snapTimer = setTimeout(() => {
        if (draggingRef.current || performance.now() < manualUntilRef.current) return;
        const idx = clamp(Math.round(pos), 0, RING_COUNT - 1);
        if (!inRange() || Math.abs(pos - idx) < 0.06) return;
        targetRef.current = idx;
        setActive((current) => (current === idx ? current : idx));
        manualUntilRef.current = performance.now() + 1600;
        scrollToStation(heroTopRef.current + idx * segRef.current);
      }, 170);
    };

    const onWheel = (event: WheelEvent) => {
      if (!inRange() || !motionRef.current) return;
      const now = performance.now();
      if (now < wheelLock) {
        event.preventDefault();
        return;
      }
      wheelAccum += event.deltaY;
      if (Math.abs(wheelAccum) < 24) {
        event.preventDefault();
        return;
      }
      const direction = Math.sign(wheelAccum);
      wheelAccum = 0;
      const current = Math.round(targetRef.current);
      const next = clamp(current + direction, 0, RING_COUNT - 1);
      if (next === current) return; // at the ends, let the page scroll normally
      event.preventDefault();
      wheelLock = now + 620;
      setInteracted(true);
      goToRef.current(next);
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element;
      if (target.closest("button,a,input,select,textarea,[data-no-drag]")) return;
      pendingDrag = true;
      dragStarted = false;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      dragStartPos = targetRef.current;
      dragLastX = event.clientX;
      dragLastT = performance.now();
      dragVelocity = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!pendingDrag) return;
      const dx = event.clientX - dragStartX;
      const dy = event.clientY - dragStartY;
      if (!dragStarted) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
        dragStarted = true;
        draggingRef.current = true;
        setDragging(true);
        setInteracted(true);
        try {
          stage.setPointerCapture(event.pointerId);
        } catch {
          /* capture is best-effort */
        }
      }
      const g = geomRef.current;
      if (!g) return;
      const now = performance.now();
      const dt = Math.max(0.008, (now - dragLastT) / 1000);
      dragVelocity = (event.clientX - dragLastX) / (g.RI * g.DELTA) / dt;
      dragLastX = event.clientX;
      dragLastT = now;
      const pos = clamp(dragStartPos - dx / (g.RI * g.DELTA), 0, RING_COUNT - 1);
      targetRef.current = pos;
      const idx = clamp(Math.round(pos), 0, RING_COUNT - 1);
      setActive((current) => (current === idx ? current : idx));
    };

    const endDrag = (event: PointerEvent) => {
      if (!pendingDrag) return;
      pendingDrag = false;
      try {
        stage.releasePointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
      if (!dragStarted) return;
      dragStarted = false;
      draggingRef.current = false;
      setDragging(false);
      suppressClickRef.current = true;
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 60);
      const fling = clamp(dragVelocity * 0.22, -1.2, 1.2);
      goToRef.current(clamp(Math.round(targetRef.current + fling), 0, RING_COUNT - 1));
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const g = geomRef.current;
      if (!g || !visibleRef.current || document.hidden || !motionRef.current) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;

      const before = posRef.current;
      posRef.current +=
        (targetRef.current - posRef.current) * (1 - Math.exp(-dt * 11));
      const velocity = (posRef.current - before) / dt;
      const rot = -posRef.current * g.DELTA;

      if (Math.abs(rot - lastRotRef.current) > 0.00008) {
        if (ringRef.current) {
          const ctx = ringRef.current.getContext("2d");
          if (ctx) drawRing(ctx, g, rot);
        }
        lastRotRef.current = rot;
      }

      const blur = Math.min(7, Math.abs(velocity) * 2.6);
      const quantised = Math.round(blur * 2) / 2;

      RING_SLIDES.forEach((entry, i) => {
        const el = itemRefs.current[i];
        if (!el) return;
        const d = i - posRef.current;
        const phi = d * g.DELTA;
        const a = -Math.PI / 2 + phi;
        const x = g.CX + g.RI * Math.cos(a);
        const y = g.CY + g.RI * Math.sin(a);
        const lift = i === activeRef.current ? 1.035 : 1;
        el.style.transform = `translate3d(${x - g.IW / 2}px, ${y - g.IW / 2}px, 0) rotate(${phi}rad) scale(${lift})`;
        el.style.opacity = String(Math.max(0, 1 - Math.min(0.72, Math.abs(d) * 0.5)));
        el.style.visibility = Math.abs(d) > 1.9 ? "hidden" : "visible";
        el.style.zIndex = String(100 - Math.round(Math.abs(d) * 10));
        if (quantised > 0) el.style.setProperty("--ar-blur", `${quantised}px`);
        else el.style.removeProperty("--ar-blur");

        // Accessories spring in when a station lands, scatter when it leaves.
        const target = Math.max(0, 1 - Math.abs(d) * 1.15);
        const spring = springRef.current[i];
        entry.accessories.forEach((accessory, j) => {
          const node = accRefs.current[i]?.[j];
          if (!node) return;
          const stiffness = 90 - 12 * j;
          let v = spring.v[j] + (target - spring.s[j]) * stiffness * dt;
          v *= Math.exp(-13 * dt);
          let s = clamp(spring.s[j] + v * dt, 0, 1.4);
          spring.v[j] = v;
          spring.s[j] = s;
          const spread = 1 + (1 - s) * 0.9;
          const spin = (1 - s) * 80 * (j % 2 === 0 ? 1 : -1);
          const sway = Math.sin(now * 0.0016 + j * 1.7) * 2 * s;
          node.style.transform = `translate(-50%,-50%) translate(${accessory.x * g.IW * spread}px, ${accessory.y * g.IW * spread}px) rotate(${accessory.rotate + spin + sway}deg) scale(${0.6 + s * 0.4})`;
          node.style.opacity = String(Math.min(1, s * 1.4));
        });
      });
    };

    applyGeometry();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", applyGeometry);
    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    onScroll();
    if (motionRef.current) raf = requestAnimationFrame(tick);
    // Canvas engraving uses Barlow Condensed; repaint once the webfont lands.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled && motionRef.current) applyGeometry();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (snapTimer) clearTimeout(snapTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", applyGeometry);
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", endDrag);
      stage.removeEventListener("pointercancel", endDrag);
    };
  }, [motionEnabled, layoutStatic]);

  /* ── Keep the pinned stage inside the viewport ─────────────────────────── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const write = () => {
      const header = document.querySelector<HTMLElement>(".site-header");
      const height = header?.getBoundingClientRect().height ?? 0;
      section.style.setProperty("--ar-hdr", `${Math.round(height)}px`);
    };
    write();
    window.addEventListener("resize", write);
    return () => window.removeEventListener("resize", write);
  }, []);

  /* ── Visibility / blockers / hidden tab ────────────────────────────────── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const intersection = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        setVisible(entry.isIntersecting);
      },
      { threshold: [0, 0.15] },
    );
    intersection.observe(section);
    const onVisibility = () => setHidden(document.hidden);
    const blockers = () =>
      setBlocked(
        Boolean(
          document.querySelector(
            "dialog[open],.site-header [aria-expanded='true']",
          ),
        ),
      );
    const observer = new MutationObserver(blockers);
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["open", "aria-expanded"],
    });
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();
    blockers();
    return () => {
      intersection.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  /* ── Copy swap, aperture scramble, accent broadcast ────────────────────── */
  useEffect(() => {
    const next = RING_SLIDES[active];
    document.documentElement.style.setProperty("--ar-accent", next.accent);
    window.dispatchEvent(
      new CustomEvent("ar:accent", { detail: { color: next.accent } }),
    );

    if (!motionRef.current) {
      setDisplay(active);
      setAperture(next.aperture);
      setSwap("idle");
      layoutStatic();
      return;
    }

    setSwap("out");
    const chars = "Ø#/0123456789ABC";
    let ticks = 0;
    const scramble = setInterval(() => {
      ticks += 1;
      if (ticks >= 7) {
        clearInterval(scramble);
        setAperture(next.aperture);
      } else {
        setAperture(
          `Ø ${Array.from({ length: 3 })
            .map(() => chars[Math.floor(Math.random() * chars.length)])
            .join("")}`,
        );
      }
    }, 45);
    const replace = setTimeout(() => {
      setDisplay(active);
      setSwap("in");
    }, 300);
    const settle = setTimeout(() => setSwap("idle"), 950);
    return () => {
      clearInterval(scramble);
      clearTimeout(replace);
      clearTimeout(settle);
    };
  }, [active, motionEnabled, layoutStatic]);

  /* ── Static layout also when the user pauses after motion was running ───── */
  useEffect(() => {
    if (!motionEnabled) layoutStatic();
  }, [motionEnabled, display, active, layoutStatic]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (drawerOpen) return;
    if (event.key === "ArrowRight") {
      goTo((activeRef.current + 1) % RING_COUNT);
      event.preventDefault();
    } else if (event.key === "ArrowLeft") {
      goTo((activeRef.current + RING_COUNT - 1) % RING_COUNT);
      event.preventDefault();
    } else if (event.key === "Home") {
      goTo(0);
      event.preventDefault();
    } else if (event.key === "End") {
      goTo(RING_COUNT - 1);
      event.preventDefault();
    } else if (event.key === "Enter") {
      const target = event.target as Element;
      if (target.closest("button,a,input,select,textarea")) return;
      setDrawerOpen(true);
      event.preventDefault();
    }
  };

  const progressStyle = {
    "--ar-progress": `${((active + 1) / RING_COUNT) * 100}%`,
  } as CSSProperties;

  return (
    <section
      ref={sectionRef}
      className="original-slideshow-hero ar-hero"
      data-testid="original-slideshow-hero"
      data-active-slide={slide.id}
      data-paused={paused}
      data-reduced={reduced}
      data-autoplay={autoplay}
      data-motion={motionEnabled ? "on" : "off"}
      aria-label="Custom rubber, steel and aluminium manufacturing"
      aria-roledescription="carousel"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setHovered(false);
      }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setFocused(false);
      }}
      onKeyDown={onKeyDown}
    >
      <div ref={stageRef} className="ar-stage">
        {/* First impression: the original site's industrial gear language. */}
        <div
          className="ar-gear-backdrop"
          data-active={display === 0}
          aria-hidden="true"
          style={{
            backgroundImage: `url(${RING_SLIDES[0].heroImage ?? RING_SLIDES[0].image})`,
          }}
        />
        {/* Static machined disc + rotating knurl / engraving */}
        <div className="ar-css-ring" aria-hidden="true" />
        {motionEnabled ? (
          <>
            <canvas ref={discRef} className="ar-canvas ar-disc" aria-hidden="true" />
            <canvas ref={ringRef} className="ar-canvas ar-ring" aria-hidden="true" />
          </>
        ) : null}
        <div className="ar-left-shade" aria-hidden="true" />
        <div className="ar-top-fade" aria-hidden="true" />

        {/* Rotating stations */}
        <div className="ar-items" aria-hidden="false">
          {RING_SLIDES.map((entry, i) => (
            <div
              key={entry.id}
              ref={(node) => {
                itemRefs.current[i] = node;
              }}
              className="ar-item"
              data-active={i === active}
              data-station={entry.id}
              onClick={() => {
                if (suppressClickRef.current) return;
                if (i === activeRef.current) {
                  setDrawerOpen(true);
                } else {
                  goTo(i);
                }
              }}
              onPointerMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                event.currentTarget.style.setProperty(
                  "--mx",
                  `${event.clientX - rect.left}px`,
                );
                event.currentTarget.style.setProperty(
                  "--my",
                  `${event.clientY - rect.top}px`,
                );
              }}
            >
              <div className="ar-plate">
                <div className="ar-plate-grooves" aria-hidden="true" />
                <img
                  src={entry.image}
                  alt={entry.alt}
                  aria-hidden={i === display ? "false" : "true"}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                />
                <div className="ar-plate-shade" aria-hidden="true" />
                <span className="ar-plate-code" aria-hidden="true">
                  {entry.number} / {entry.aperture}
                </span>
                <div className="ar-reticle" aria-hidden="true">
                  <span /><span /><span /><span />
                  <i />
                </div>
              </div>
              <span className="ar-item-label" aria-hidden="true">
                {entry.name}
              </span>
              <span className="ar-cursor-pill" aria-hidden="true">
                <b /> VIEW DETAILS
              </span>
              {entry.accessories.map((accessory, j) => (
                <span
                  key={accessory.label}
                  ref={(node) => {
                    if (!accRefs.current[i]) accRefs.current[i] = [];
                    accRefs.current[i][j] = node;
                  }}
                  className="ar-accessory"
                  aria-hidden="true"
                  style={{ fontSize: `${Math.max(8, accessory.size * 42)}px` }}
                >
                  {accessory.label}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* Fixed index mark above the top of the ring */}
        <div className="ar-index-mark" aria-hidden="true">
          <span className="ar-index-triangle" />
          <span className="ar-index-readout">{aperture}</span>
          <span className="ar-index-sub">FOCUS / STATION</span>
        </div>

        {/* Copy column */}
        <div className="ar-copy" data-swap={swap} style={progressStyle}>
          <div className="ar-index ar-fade" style={{ "--i": 0 } as CSSProperties}>
            <span>{shown.number} —— 0{RING_COUNT}</span>
            <span className="ar-index-line"><i /></span>
          </div>
          <p className="ar-overline ar-fade" style={{ "--i": 1 } as CSSProperties}>
            S SQUARE · COIMBATORE, INDIA
          </p>
          <h1 className="ar-h1">
            <span className="ar-h1-fixed">
              Your Trusted Partner in Custom Metal &amp; Rubber Solutions
            </span>
            <span className="ar-title-mask">
              <span key={shown.id} className="ar-title">
                {shown.displayName ?? shown.name}
              </span>
            </span>
          </h1>
          <p className="ar-sub ar-fade" style={{ "--i": 2 } as CSSProperties}>
            {shown.type}
          </p>
          <p className="ar-description ar-fade" style={{ "--i": 3 } as CSSProperties}>
            {shown.description}
          </p>
          <div className="ar-chips ar-fade" style={{ "--i": 4 } as CSSProperties}>
            {shown.chips.map((chip) => (
              <span key={chip}>{chip}</span>
            ))}
          </div>
          <div className="ar-buy ar-fade" style={{ "--i": 5 } as CSSProperties}>
            <span className="ar-buy-tag">
              {slide.intro ? "RFQ / ALL DIVISIONS" : `RFQ / ${shown.number}`}
            </span>
            <button
              type="button"
              className="ar-quote ar-quote-btn"
              onClick={() =>
                openQuoteModal(
                  slide.division ? { division: slide.division } : undefined,
                )
              }
            >
              Request a Quote <ArrowRight size={16} />
            </button>
            <Link href={slide.ctaHref} className="ar-view">
              {slide.ctaLabel} <ArrowUpRight size={15} />
            </Link>
            <button
              type="button"
              className="ar-specs-btn"
              onClick={() => setDrawerOpen(true)}
            >
              View Specs <ArrowUpRight size={14} aria-hidden="true" />
            </button>
          </div>
          <div className="ar-mini-links ar-fade" style={{ "--i": 6 } as CSSProperties}>
            <Link href="/products">Explore Full Catalog</Link>
            <a href={`tel:${COMPANY_INFO.phoneRaw}`}>
              <Phone size={13} aria-hidden="true" /> {COMPANY_INFO.phone}
            </a>
          </div>
          <noscript>
            <a href="/contact#quote" className="ar-noscript-quote">
              Request a Quote <ArrowRight size={15} aria-hidden="true" />
            </a>
          </noscript>
        </div>

        {/* Controls */}
        <div className="ar-arrows" data-slideshow-controls>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo((active + RING_COUNT - 1) % RING_COUNT)}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo((active + 1) % RING_COUNT)}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div
          className="ar-tabs"
          role="group"
          aria-label="Explore manufacturing divisions"
          data-slideshow-controls
        >
          {RING_SLIDES.map((entry, i) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={i === active}
              aria-label={`${entry.number} ${entry.name}`}
              onClick={() => goTo(i)}
            >
              <span>{entry.number}</span>
              {entry.name}
              <i />
            </button>
          ))}
        </div>

        <div className="ar-dots" role="group" aria-label="Slide position">
          {RING_SLIDES.map((entry, i) => (
            <button
              key={entry.id}
              type="button"
              aria-label={`Go to ${entry.name} station`}
              aria-pressed={i === active}
              data-active={i === active}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        <div className="ar-bottom-bar">
          <span className={`ar-hint ${interacted ? "is-faded" : ""}`}>
            <MoveHorizontal size={14} /> SCROLL OR DRAG TO TURN THE RING
          </span>
          <div className="ar-bottom-controls">
            <span className="ar-station-readout">
              <span className="ar-station-dot" aria-hidden="true" />
              STATION {readout}
            </span>
          </div>
        </div>
      </div>

      <StationDrawer
        open={drawerOpen}
        slide={slide}
        index={active}
        onClose={() => setDrawerOpen(false)}
        onQuote={() =>
          openQuoteModal(
            slide.division ? { division: slide.division } : undefined,
          )
        }
      />

      <noscript>
        <style>{`.ar-hero .ar-arrows,.ar-hero .ar-tabs,.ar-hero .ar-dots,.ar-hero button.ar-quote-btn,.ar-hero .ar-specs-btn,.ar-hero .ar-bottom-bar{display:none}.ar-hero{height:auto!important}.ar-hero .ar-stage{position:relative!important;height:auto!important;min-height:0!important;padding-bottom:40px}.ar-hero .ar-copy{position:relative!important;width:auto!important;margin:0 auto!important;left:auto!important;top:auto!important}.ar-hero .ar-items{display:none}`}</style>
      </noscript>
    </section>
  );
}
