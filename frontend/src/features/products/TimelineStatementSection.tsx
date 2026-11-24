"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface ClipConfig {
  id: number;
  track: "V1" | "V2";
  leftPct: number;
  title: string;
}

const CLIPS: ClipConfig[] = [
  { id: 0, track: "V1", leftPct: 9.5, title: "Crimson Gear" },
  { id: 1, track: "V2", leftPct: 22.9, title: "S Square Glow" },
  { id: 2, track: "V1", leftPct: 34.1, title: "Elastomer Matrix" },
  { id: 3, track: "V2", leftPct: 50.6, title: "100% Spec CNC" },
  { id: 4, track: "V1", leftPct: 66.2, title: "Custom Motion" },
];

// Procedural 60fps industrial motion graphics renderer for each of the 5 tiles
function drawTileFrame(
  ctx: CanvasRenderingContext2D,
  size: number,
  tileIndex: number,
  t: number
) {
  ctx.save();
  ctx.clearRect(0, 0, size, size);

  if (tileIndex === 0) {
    // Tile 1: Sky-blue cushion background + rotating glossy crimson 3D gear/star
    const bg = ctx.createLinearGradient(0, 0, size, size);
    bg.addColorStop(0, "#cfe6ff");
    bg.addColorStop(1, "#9bc5f8");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    ctx.translate(size / 2, size / 2);
    ctx.rotate(t * 0.85);
    const spikes = 8;
    const outerR = size * 0.34;
    const innerR = size * 0.21;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i * Math.PI) / spikes;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    const starGrad = ctx.createRadialGradient(
      -size * 0.08,
      -size * 0.08,
      size * 0.03,
      0,
      0,
      outerR
    );
    starGrad.addColorStop(0, "#ff6b6b");
    starGrad.addColorStop(0.55, "#e11d48");
    starGrad.addColorStop(1, "#880d25");
    ctx.fillStyle = starGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, size * 0.09, 0, Math.PI * 2);
    ctx.fillStyle = "#e8f2ff";
    ctx.fill();
  } else if (tileIndex === 1) {
    // Tile 2: Deep cobalt tile with glowing pulsing lowercase "s square"
    const bg = ctx.createRadialGradient(
      size * 0.5,
      size * 0.5,
      size * 0.05,
      size * 0.5,
      size * 0.5,
      size * 0.72
    );
    bg.addColorStop(0, "#2447eb");
    bg.addColorStop(1, "#0b175c");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    const pulse = 0.78 + 0.22 * Math.sin(t * 2.4);
    ctx.save();
    ctx.shadowColor = "rgba(255,255,255,0.95)";
    ctx.shadowBlur = size * 0.12 * pulse;
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 ${Math.round(size * 0.19)}px Poppins, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("s square", size / 2, size / 2);
    ctx.restore();
  } else if (tileIndex === 2) {
    // Tile 3: Crimson & cobalt animated halftone elastomer blob
    ctx.fillStyle = "#101935";
    ctx.fillRect(0, 0, size, size);

    const cols = 11;
    const step = size / cols;
    for (let gy = 0; gy < cols; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const cx = (gx + 0.5) * step;
        const cy = (gy + 0.5) * step;
        const dx = (cx - size / 2) / size;
        const dy = (cy - size / 2) / size;
        const wave = Math.sin(dx * 7 + t * 2.6) * Math.cos(dy * 7 - t * 2.1);
        const r = Math.max(1.2, step * (0.22 + 0.22 * wave));
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = wave > 0 ? "#f43f5e" : "#3b82f6";
        ctx.fill();
      }
    }
  } else if (tileIndex === 3) {
    // Tile 4: Electric cobalt vertical light streaks behind bold "100% / SPEC"
    ctx.fillStyle = "#091026";
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 14; i++) {
      const x = ((i * size) / 14 + ((t * 26 * ((i % 3) + 1)) % size)) % size;
      const g = ctx.createLinearGradient(x, 0, x, size);
      g.addColorStop(0, "rgba(37, 99, 235, 0)");
      g.addColorStop(0.5, "rgba(56, 189, 248, 0.65)");
      g.addColorStop(1, "rgba(37, 99, 235, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(x, 0, Math.max(2, size * 0.045), size);
    }

    ctx.fillStyle = "#fb7185";
    ctx.font = `800 ${Math.round(size * 0.22)}px Poppins, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("100%", size / 2, size * 0.4);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("SPEC", size / 2, size * 0.64);
  } else {
    // Tile 5: Vibrant crimson-ember tile with stacked kinetic "CUSTOM" rows
    const bg = ctx.createLinearGradient(0, 0, 0, size);
    bg.addColorStop(0, "#e11d48");
    bg.addColorStop(1, "#be123c");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${Math.round(size * 0.17)}px Poppins, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let row = 0; row < 4; row++) {
      const y = size * (0.2 + row * 0.2);
      const shift = Math.sin(t * 2.5 + row * 1.1) * size * 0.09;
      ctx.save();
      ctx.globalAlpha = row % 2 === 0 ? 0.96 : 0.65;
      ctx.fillText("CUSTOM", size / 2 + shift, y);
      ctx.restore();
    }
  }

  ctx.restore();
}

function formatTimecode(sec: number): string {
  const clamped = ((sec % 6) + 6) % 6;
  const whole = Math.floor(clamped);
  const cs = Math.floor((clamped - whole) * 100);
  return `00:0${whole}.${cs.toString().padStart(2, "0")}`;
}

export function TimelineStatementSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const timelineBoxRef = useRef<HTMLDivElement | null>(null);
  const statementHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const playheadRef = useRef<HTMLDivElement | null>(null);
  const playheadLabelRef = useRef<HTMLSpanElement | null>(null);

  const timelineSlotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const flyingBlockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const blockInnerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tileCanvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const sentenceSlotRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = paused;

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let sectionVisible = false;
    let rafId = 0;
    let playTime = 2.4;
    let animClock = 0;
    let lastNow = performance.now();
    let inSentence = false;
    let firstRevealDone = false;
    let lastScrollY = window.scrollY;
    let activeFlightTl: gsap.core.Timeline | null = null;

    // Resize internal square canvases cleanly
    function syncCanvasSizes() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      tileCanvasRefs.current.forEach((cv, idx) => {
        if (!cv) return;
        const w = Math.max(64, Math.round((cv.clientWidth || 120) * dpr));
        if (cv.width !== w || cv.height !== w) {
          cv.width = w;
          cv.height = w;
        }
        const ctx = cv.getContext("2d");
        if (ctx) drawTileFrame(ctx, cv.width, idx, animClock);
      });
    }
    syncCanvasSizes();

    // Compute exact FLIP delta from timeline slot i -> sentence slot i
    function computeSlotDelta(i: number) {
      const tSlot = timelineSlotRefs.current[i];
      const sSlot = sentenceSlotRefs.current[i];
      if (!tSlot || !sSlot) return { x: 0, y: 0, scale: 1 };

      const tr = tSlot.getBoundingClientRect();
      const sr = sSlot.getBoundingClientRect();
      const scale = sr.width / Math.max(1, tr.width);
      const x = sr.left - tr.left + (sr.width - tr.width) / 2;
      const y = sr.top - tr.top + (sr.height - tr.height) / 2;
      return { x, y, scale };
    }

    function snapToCurrentState() {
      if (activeFlightTl) {
        activeFlightTl.kill();
        activeFlightTl = null;
      }
      for (let i = 0; i < CLIPS.length; i++) {
        const block = flyingBlockRefs.current[i];
        if (!block) continue;
        if (inSentence) {
          const d = computeSlotDelta(i);
          gsap.set(block, { x: d.x, y: d.y, scale: d.scale, rotation: 0 });
        } else {
          gsap.set(block, { x: 0, y: 0, scale: 1, rotation: 0 });
        }
      }
    }

    function flyToState(targetInSentence: boolean) {
      if (inSentence === targetInSentence) return;
      inSentence = targetInSentence;

      if (prefersReduced) {
        snapToCurrentState();
        return;
      }

      if (activeFlightTl) {
        activeFlightTl.kill();
      }

      const tl = gsap.timeline();
      activeFlightTl = tl;

      for (let i = 0; i < CLIPS.length; i++) {
        const block = flyingBlockRefs.current[i];
        if (!block) continue;

        const startAt = targetInSentence ? i * 0.1 : i * 0.05;
        const target = targetInSentence
          ? computeSlotDelta(i)
          : { x: 0, y: 0, scale: 1 };
        const randomTilt = (Math.random() * 30 - 15) || 8;

        tl.to(
          block,
          {
            x: target.x,
            y: target.y,
            scale: target.scale,
            duration: 1.45,
            ease: "power2.inOut",
          },
          startAt
        );

        tl.to(
          block,
          {
            rotation: randomTilt,
            duration: 0.725,
            ease: "power2.in",
          },
          startAt
        );

        tl.to(
          block,
          {
            rotation: 0,
            duration: 0.725,
            ease: "power2.out",
          },
          startAt + 0.725
        );
      }
    }

    function onScroll() {
      const currentY = window.scrollY;
      const scrollingDown = currentY > lastScrollY;
      const scrollingUp = currentY < lastScrollY;
      lastScrollY = currentY;

      // First reveal drop onto track when timeline enters within 300px of viewport bottom
      if (!firstRevealDone && !inSentence && !prefersReduced && timelineBoxRef.current) {
        const boxRect = timelineBoxRef.current.getBoundingClientRect();
        if (boxRect.top < window.innerHeight - 100) {
          firstRevealDone = true;
          const firstInner = blockInnerRefs.current[0];
          if (firstInner) {
            gsap.fromTo(
              firstInner,
              { y: -240, rotation: 15 },
              { y: 0, rotation: 0, duration: 1.8, ease: "power2.out" }
            );
          }
        }
      }

      if (!statementHeadingRef.current) return;
      const rect = statementHeadingRef.current.getBoundingClientRect();
      const sentenceOnScreen =
        rect.top < window.innerHeight * 0.88 && rect.bottom > 80;

      if (sentenceOnScreen && scrollingDown && !inSentence) {
        flyToState(true);
      } else if (sentenceOnScreen && scrollingUp && inSentence) {
        flyToState(false);
      }
    }

    function onResize() {
      syncCanvasSizes();
      snapToCurrentState();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        sectionVisible = Boolean(entries[0]?.isIntersecting);
        if (sectionVisible) lastNow = performance.now();
      },
      { rootMargin: "200px" }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    function loop(now: number) {
      rafId = requestAnimationFrame(loop);
      if (!sectionVisible) return;

      const dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;

      if (!pausedRef.current && !prefersReduced) {
        playTime = (playTime + dt) % 6;
        animClock += dt;

        if (playheadRef.current) {
          const leftPct = 8 + (89.6 * playTime) / 6;
          playheadRef.current.style.left = `${leftPct}%`;
        }
        if (playheadLabelRef.current) {
          playheadLabelRef.current.textContent = formatTimecode(playTime);
        }

        for (let i = 0; i < CLIPS.length; i++) {
          const cv = tileCanvasRefs.current[i];
          if (!cv) continue;
          const ctx = cv.getContext("2d");
          if (ctx) drawTileFrame(ctx, cv.width, i, animClock);
        }
      }
    }

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (activeFlightTl) activeFlightTl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-x-clip bg-[#f4f7fb] pt-12 pb-20 sm:pt-20 sm:pb-28"
    >
      {/* Block 1: Dark Manufacturing Timeline Panel */}
      <div className="relative z-20 mx-auto max-w-6xl px-4 sm:px-8">
        <div
          ref={timelineBoxRef}
          className="relative w-full aspect-[1372/640] sm:aspect-[1372/500]"
        >
          {/* Panel Surface */}
          <div
            className="absolute inset-0 rounded-2xl sm:rounded-[34px] bg-[#12151b]"
            style={{
              boxShadow:
                "0 32px 64px rgba(20, 35, 75, 0.22), 0 6px 14px rgba(15, 23, 42, 0.18)",
            }}
          />

          {/* Pause / Play Button in Top-Left Gutter */}
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Resume timeline" : "Pause timeline"}
            className="absolute left-[1.8%] top-[4.4%] z-20 flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-[#2a2f39] text-white hover:bg-[#383f4d] transition-colors cursor-pointer"
          >
            {paused ? (
              <svg viewBox="0 0 12 12" fill="currentColor" className="h-3 w-3">
                <path d="M2.5 1.8v8.4L10 6 2.5 1.8Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 12 12" fill="currentColor" className="h-3 w-3">
                <rect x="2" y="1.5" width="3" height="9" rx="0.8" />
                <rect x="7" y="1.5" width="3" height="9" rx="0.8" />
              </svg>
            )}
          </button>

          {/* Time Ruler (0s .. 6s + Minor Ticks) */}
          <div className="absolute left-[8%] right-[2.4%] top-[5.2%] h-6 flex items-center justify-between text-[10px] sm:text-xs font-semibold text-[#e9edf3] select-none">
            {[0, 1, 2, 3, 4, 5, 6].map((sec, idx) => (
              <React.Fragment key={sec}>
                <span>{sec}s</span>
                {idx < 6 && (
                  <>
                    <span className="hidden sm:inline-block h-2 w-px bg-white/20" />
                    <span className="h-2 w-px bg-white/20" />
                  </>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Two Track Lanes: MOLD (V1) and CNC (V2) */}
          <div className="absolute left-[2.2%] top-[32.5%] -translate-y-1/2 text-[9px] sm:text-xs font-semibold tracking-wider text-[#8d97a8] select-none">
            M1
          </div>
          <div className="absolute left-[8%] right-[2.4%] top-[16%] h-[33%] rounded-lg sm:rounded-xl bg-white/[0.05]" />

          <div className="absolute left-[2.2%] top-[72.5%] -translate-y-1/2 text-[9px] sm:text-xs font-semibold tracking-wider text-[#8d97a8] select-none">
            C2
          </div>
          <div className="absolute left-[8%] right-[2.4%] top-[56%] h-[33%] rounded-lg sm:rounded-xl bg-white/[0.05]" />

          {/* Five Staggered Clip Slots */}
          {CLIPS.map((clip, idx) => (
            <div
              key={clip.id}
              ref={(el) => {
                timelineSlotRefs.current[idx] = el;
              }}
              style={{
                left: `${clip.leftPct}%`,
                top: clip.track === "V1" ? "18.5%" : "58.5%",
              }}
              className="absolute h-[28%] aspect-square z-30"
            >
              <div
                ref={(el) => {
                  flyingBlockRefs.current[idx] = el;
                }}
                className="h-full w-full will-change-transform origin-center"
              >
                <div
                  ref={(el) => {
                    blockInnerRefs.current[idx] = el;
                  }}
                  className="relative h-full w-full overflow-hidden rounded-[24%] shadow-md"
                >
                  <canvas
                    ref={(el) => {
                      tileCanvasRefs.current[idx] = el;
                    }}
                    className="h-full w-full block"
                  />
                  {/* Inner Specular Squircle Rim Glow */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-[24%]"
                    style={{
                      boxShadow: "inset 0 0 16px rgba(255, 255, 255, 0.52)",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Sweeping Playhead + Running Timecode Pill */}
          <div
            ref={playheadRef}
            style={{ left: "43.8%" }}
            className="pointer-events-none absolute top-[12.5%] bottom-[4.5%] z-20 w-[2px] bg-[#e11d48]"
          >
            <span
              ref={playheadLabelRef}
              className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-md bg-[#e11d48] px-1.5 py-0.5 text-[9px] sm:text-[11px] font-semibold tabular-nums text-white whitespace-nowrap shadow-xs"
            >
              00:02.40
            </span>
          </div>
        </div>
      </div>

      {/* Block 2: Centred 3-Line Engineering Statement With 5 Inline Landing Slots */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-8 pt-20 sm:pt-28 pb-6 text-center">
        <h2
          ref={statementHeadingRef}
          className="mx-auto max-w-[30ch] font-display text-2xl sm:text-4xl lg:text-[3.25rem] font-medium leading-[1.16] tracking-[-0.015em] text-[#0d1324]"
        >
          S Square{" "}
          <span
            ref={(el) => {
              sentenceSlotRefs.current[0] = el;
            }}
            className="inline-block h-[1em] w-[1em] align-baseline mx-[0.16em] -mb-[0.14em] rounded-[24%] bg-slate-200/60"
          />{" "}
          engineers custom{" "}
          <span
            ref={(el) => {
              sentenceSlotRefs.current[1] = el;
            }}
            className="inline-block h-[1em] w-[1em] align-baseline mx-[0.16em] -mb-[0.14em] rounded-[24%] bg-slate-200/60"
          />{" "}
          rubber, steel
          <br className="hidden sm:inline" /> and{" "}
          <span
            ref={(el) => {
              sentenceSlotRefs.current[2] = el;
            }}
            className="inline-block h-[1em] w-[1em] align-baseline mx-[0.16em] -mb-[0.14em] rounded-[24%] bg-slate-200/60"
          />{" "}
          aluminium parts{" "}
          <span
            ref={(el) => {
              sentenceSlotRefs.current[3] = el;
            }}
            className="inline-block h-[1em] w-[1em] align-baseline mx-[0.16em] -mb-[0.14em] rounded-[24%] bg-slate-200/60"
          />{" "}
          built to 100%
          <br className="hidden sm:inline" /> conformity{" "}
          <span
            ref={(el) => {
              sentenceSlotRefs.current[4] = el;
            }}
            className="inline-block h-[1em] w-[1em] align-baseline mx-[0.16em] -mb-[0.14em] rounded-[24%] bg-slate-200/60"
          />{" "}
          from CAD to delivery.
        </h2>
      </div>
    </section>
  );
}
