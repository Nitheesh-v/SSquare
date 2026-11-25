import {
  MATERIALS as ORIGINAL_MATERIALS,
  STORY_STEPS as ORIGINAL_STEPS,
  bezier,
  clamp,
  mix,
  mixPose,
  modulo,
  smooth,
  type ComponentPose,
} from "./journey-data";
import type { JourneyScene, RenderItem } from "./journey-scene";

export type JourneyController = ReturnType<typeof createJourneyEngine>;
type Callbacks = {
  onSelect: (index: number) => void;
  onAuto: (value: boolean) => void;
  onStep: (index: number) => void;
};
const glide = bezier(0.25, 0.75, 0.2, 1),
  entrance = bezier(0.16, 1, 0.3, 1);
const angles = [0, 180, 360, 720];
const slots = [
  [0, 0, 350, 0, 0],
  [278, 25, 265, 5, 18],
  [500, 50, 245, 10, 28],
  [708, 87, 225, 14, 36],
  [910, 120, 210, 18, 42],
];
const seeded = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};

type JourneyOptions = {
  appearance?: "original" | "reference";
  materials?: readonly {
    name: string;
    color: string;
    part: string;
    slug: string;
  }[];
  steps?: readonly { heading: readonly string[]; caption: string }[];
  nativeScroll?: boolean;
};

/** DOM anchors are the source of truth: one traveller, with native scrolling on the reference home. */
export function createJourneyEngine(
  root: HTMLElement,
  canvas: HTMLCanvasElement | null,
  reduced: boolean,
  initial: number,
  callbacks: Callbacks,
  options: JourneyOptions = {},
) {
  const MATERIALS = options.materials || ORIGINAL_MATERIALS;
  const STORY_STEPS = options.steps || ORIGINAL_STEPS;
  const reference = options.appearance === "reference";
  const hero = root.querySelector<HTMLElement>(".journey-hero")!;
  const arc = root.querySelector<HTMLElement>(".journey-arc")!;
  const inside = root.querySelector<HTMLElement>("#inside")!;
  const front = root.querySelector<HTMLElement>("#inFront")!;
  const insideAnchor = root.querySelector<HTMLElement>("#inBar")!;
  const shop = root.querySelector<HTMLElement>(".journey-shop")!;
  const spotlight = root.querySelector<HTMLElement>(".reference-spotlight");
  const spotlightAnchor = spotlight?.querySelector<HTMLElement>(
    ".spotlight-component-anchor",
  );
  const spotlightPhoto =
    spotlight?.querySelector<HTMLElement>(".spotlight-photo");
  const spotlightGears =
    spotlight?.querySelectorAll<SVGElement>(".spotlight-gear");
  const navLinks = Array.from(
    root.querySelectorAll<HTMLAnchorElement>(".journey-rail a[data-section]"),
  );
  const navSections = navLinks.map((link) =>
    root.querySelector<HTMLElement>(link.getAttribute("href")!),
  );
  const cards = Array.from(root.querySelectorAll<HTMLElement>(".journey-card"));
  const cardAnchors = cards.map((card) =>
    card.querySelector<HTMLElement>(".component-anchor")!,
  );
  const storm = Array.from(front.querySelectorAll<HTMLElement>(".storm-piece"));
  const title = root.querySelector<HTMLElement>("#material-title")!;
  const titleText = title.querySelector<HTMLElement>("[data-title-text]")!;
  const titleLabel = title.querySelector<HTMLElement>("[data-title-label]")!;
  const counter = root.querySelector<HTMLElement>("#material-count")!;
  const heading = front.querySelector<HTMLElement>(".in-head")!;
  const caption = front.querySelector<HTMLElement>(".in-cap")!;
  const number = inside.querySelector<HTMLElement>(".in-num")!;
  const inFrame = front.querySelector<HTMLElement>(".in-front-frame")!;
  const dark = inside.querySelector<HTMLElement>(".in-dark")!;
  const reveal = hero.querySelector<HTMLElement>(".journey-reveal")!;
  const rail = root.querySelector<HTMLElement>(".journey-rail")!;
  const frames = Array.from(
    root.querySelectorAll<HTMLElement>(".in-frame,.in-front-frame"),
  );
  const header = document.querySelector<HTMLElement>(".site-header");
  const measure = document.createElement("canvas").getContext("2d");
  let scene: JourneyScene | undefined;
  let disposed = false,
    frame = 0,
    dirty = true,
    entered = false,
    paused = false,
    visible = !document.hidden;
  let auto = !reduced,
    target = initial,
    pos = initial,
    active = initial,
    step = 0,
    angle = 0;
  let last = performance.now(),
    interaction = last,
    headerHeight = 113,
    vw = innerWidth,
    vh = innerHeight;
  let tween: {
    start: number;
    from: number;
    to: number;
    duration: number;
    entrance?: boolean;
    changed: boolean;
    direction: number;
  } | null = null;
  let flip: {
    start: number;
    from: number;
    to: number;
    duration: number;
    text: boolean;
  } | null = null;
  let colorReveal: { start: number; color: string } | null = null;
  let drag: {
    start: number;
    startY: number;
    pos: number;
    last: number;
    lastPos: number;
    v: number;
    active: boolean;
    pointer: number;
  } | null = null;
  let smoothScroll: { target: number; current: number } | null = null;
  let poke: { start: number; index: number } | null = null;
  let phoneCentered = false;
  let settleUntil = 0;
  let pendingGpu = false;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const animations = new Set<Animation>();
  const tilt = cards.map(() => ({ x: 0, y: 0 }));
  const cleanupListeners: (() => void)[] = [];
  const later = (fn: () => void, delay: number) => {
    const id = setTimeout(() => {
      timers.delete(id);
      if (!disposed) fn();
    }, delay);
    timers.add(id);
    return id;
  };
  const animate = (
    el: HTMLElement,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions,
  ) => {
    if (reduced || paused) return;
    const a = el.animate(keyframes, options);
    animations.add(a);
    a.finished
      .then(() => animations.delete(a))
      .catch(() => animations.delete(a));
    return a;
  };
  const listen = (
    node: EventTarget,
    type: string,
    fn: EventListener,
    options?: AddEventListenerOptions,
  ) => {
    node.addEventListener(type, fn, options);
    cleanupListeners.push(() => node.removeEventListener(type, fn, options));
  };
  const invalidate = () => {
    dirty = true;
    if (!frame && !disposed && visible) frame = requestAnimationFrame(tick);
  };
  const interact = () => {
    interaction = performance.now();
    smoothScroll = null;
    invalidate();
  };
  function finishReveal() {
    if (!colorReveal) return;
    root.style.setProperty("--flav", colorReveal.color);
    colorReveal = null;
    reveal.style.opacity = "0";
    reveal.style.maskImage = "none";
    reveal.style.webkitMaskImage = "none";
  }
  function fitTitle() {
    if (!measure) return;
    measure.font = reference
      ? '700 100px "Barlow Condensed"'
      : '400 100px "Archivo Black"';
    const name = MATERIALS[active].name.toUpperCase();
    const h = hero.getBoundingClientRect().height;
    const u = Math.min(vw / 1440, h / 900);
    const phone = vw < 820;
    const width = measure.measureText(
      phone ? name.split(" ").sort((a, b) => b.length - a.length)[0] : name,
    ).width;
    let size = phone
      ? Math.min(clamp(vw * 0.125, 40, 64), ((vw - 36) * 100) / width)
      : Math.min(96 * u, (760 * u * 100) / width);
    if (reference)
      size = phone
        ? Math.min(clamp(vw * 0.26, 76, 156), ((vw - 40) * 100) / width)
        : Math.min(204 * u, (1040 * u * 100) / width);
    if (vw < 820 && vh < 520)
      size = Math.min(reference ? 90 : 36, ((vw - 40) * 100) / width);
    title.style.fontSize = `${size}px`;
  }
  function setTitle(direction = 1, immediate = false) {
    titleLabel.textContent = MATERIALS[active].name;
    const previous = titleText.cloneNode(true) as HTMLElement;
    previous.removeAttribute("data-title-text");
    previous.className = "title-out";
    previous.setAttribute("aria-hidden", "true");
    root.querySelector(".title-out")?.remove();
    const word = document.createElement("span");
    word.className = "journey-word";
    Array.from(MATERIALS[active].name.toUpperCase()).forEach((letter) => {
      const span = document.createElement("span");
      span.className = "journey-letter";
      span.textContent = letter;
      word.appendChild(span);
    });
    titleText.replaceChildren(word);
    fitTitle();
    if (immediate || reduced || paused) return;
    title.appendChild(previous);
    Array.from(
      previous.querySelectorAll<HTMLElement>(".journey-letter"),
    ).forEach((letter, i) =>
      animate(
        letter,
        [
          { transform: "translateY(0)", opacity: 1 },
          { transform: `translateY(${-110 * direction}%)`, opacity: 0 },
        ],
        {
          duration: 300,
          delay: i * 11,
          easing: "cubic-bezier(.45,0,.75,.3)",
          fill: "both",
        },
      ),
    );
    Array.from(
      titleText.querySelectorAll<HTMLElement>(".journey-letter"),
    ).forEach((letter, i) =>
      animate(
        letter,
        [
          { transform: `translateY(${110 * direction}%)`, opacity: 0 },
          { transform: "translateY(0)", opacity: 1 },
        ],
        {
          duration: 620,
          delay: 120 + i * 22,
          easing: "cubic-bezier(.22,1,.36,1)",
          fill: "both",
        },
      ),
    );
    later(() => previous.remove(), 700);
  }
  function setStepCopy() {
    const lines =
      step === 3 ? [MATERIALS[active].name] : STORY_STEPS[step].heading;
    heading.replaceChildren(
      ...lines.flatMap((line, i) => {
        const s = document.createElement("span");
        s.textContent = line;
        s.style.fontSize = line.length > 9 ? ".72em" : "";
        return i ? [document.createElement("br"), s] : [s];
      }),
    );
    caption.textContent =
      step === 3
        ? `${MATERIALS[active].part}.\nMade to your drawing or sample.`
        : STORY_STEPS[step].caption;
    number.textContent = `0${step + 1}`;
  }
  let copyTimer: ReturnType<typeof setTimeout> | undefined;
  function crossfadeCopy() {
    if (copyTimer) clearTimeout(copyTimer);
    const elements = [heading, caption, number];
    elements.forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    if (reduced || paused) {
      setStepCopy();
      return;
    }
    elements.forEach((el) =>
      animate(
        el,
        [
          { translate: "0 0", opacity: 1 },
          { translate: "0 -10px", opacity: 0 },
        ],
        { duration: 240, easing: "cubic-bezier(.5,0,.75,0)", fill: "forwards" },
      ),
    );
    copyTimer = later(() => {
      setStepCopy();
      elements.forEach((el) => {
        el.getAnimations().forEach((a) => a.cancel());
        animate(
          el,
          [
            { translate: "0 14px", opacity: 0 },
            { translate: "0 0", opacity: 1 },
          ],
          { duration: 460, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" },
        );
      });
    }, 280);
  }
  function change(index: number, direction: number) {
    finishReveal();
    active = modulo(index);
    callbacks.onSelect(active);
    root.dataset.selected = String(active);
    root.dataset.material = MATERIALS[active].slug;
    if (reduced || paused)
      root.style.setProperty("--flav", MATERIALS[active].color);
    else {
      colorReveal = {
        start: performance.now(),
        color: MATERIALS[active].color,
      };
      reveal.style.background = colorReveal.color;
      reveal.style.opacity = "1";
    }
    setTitle(direction);
    counter.getAnimations().forEach((a) => a.cancel());
    if (reduced || paused) counter.textContent = `0${active + 1}`;
    else {
      animate(
        counter,
        [
          { translate: "0 0", opacity: 1 },
          { translate: "0 -10px", opacity: 0 },
        ],
        { duration: 220, easing: "cubic-bezier(.5,0,.75,0)", fill: "forwards" },
      );
      later(() => {
        counter.textContent = `0${active + 1}`;
        counter.getAnimations().forEach((a) => a.cancel());
        animate(
          counter,
          [
            { translate: "0 14px", opacity: 0 },
            { translate: "0 0", opacity: 1 },
          ],
          { duration: 380, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" },
        );
      }, 280);
    }
    if (step === 3) crossfadeCopy();
    phoneCentered = false;
  }
  function goTo(to: number, snap = false) {
    interact();
    finishReveal();
    const direction = to >= pos ? 1 : -1;
    target = Math.round(to);
    if (reduced || paused) {
      pos = target;
      change(target, direction);
      tween = null;
      invalidate();
      return;
    }
    const distance = Math.abs(target - pos);
    tween = {
      start: performance.now(),
      from: pos,
      to: target,
      duration: snap
        ? Math.max(380, 650 * Math.min(1, distance + 0.35))
        : 650 + 160 * Math.max(0, distance - 1),
      changed: modulo(target) === active,
      direction,
    };
    invalidate();
  }
  function arcPose(index: number, rect: DOMRect, now: number): ComponentPose {
    const phone = vw < 820,
      u = phone
        ? Math.min(vw / 560, rect.height / 980)
        : Math.min(vw / 1440, rect.height / 900),
      spread = phone ? 1.02 : 1;
    const k = index - pos,
      abs = Math.min(4, Math.abs(k)),
      low = Math.floor(abs),
      high = Math.min(4, low + 1),
      f = abs - low;
    const values = slots[low].map((v, i) => mix(v, slots[high][i], f));
    const b =
      reduced || paused
        ? 0
        : Math.sin((now / 4600) * Math.PI * 2 + 1.37 * index);
    return {
      x: vw / 2 + Math.sign(k) * values[0] * u * spread,
      y:
        rect.top +
        rect.height * (phone ? 0.36 : 0.4) +
        values[1] * u -
        (reduced || paused ? 0 : (0.5 * b + 0.5) * 9 * u),
      h: values[2] * u,
      rz: Math.sign(k) * values[3] + 0.4 * b,
      ry: Math.sign(k) * values[4],
      rx: 0,
      z: -Math.abs(k) * 34 * u,
      op: 1 - clamp((Math.abs(k) - 3.3) / 0.6),
      sx: 1,
      sy: 1,
      shadow: 1,
    };
  }
  function resize() {
    vw = innerWidth;
    vh = innerHeight;
    headerHeight = header?.getBoundingClientRect().height || 113;
    root.style.setProperty("--journey-header", `${headerHeight}px`);
    root.style.setProperty("--journey-vh", `${vh}px`);
    const h = hero.getBoundingClientRect().height;
    root.style.setProperty("--u", `${Math.min(vw / 1440, h / 900)}px`);
    const phone = vw < 820,
      k = Math.min(
        vw / (phone ? 390 : 1440),
        (vh - headerHeight) / (phone ? 780 : 900),
      );
    frames.forEach(
      (el) => (el.style.transform = `translate(-50%,-50%) scale(${k})`),
    );
    scene?.resize(vw, vh);
    fitTitle();
    invalidate();
  }
  function tick(now: number) {
    frame = 0;
    if (disposed || !visible) return;
    const dt = Math.min(64, now - last);
    last = now;
    if (smoothScroll) {
      smoothScroll.current +=
        (smoothScroll.target - smoothScroll.current) *
        (1 - Math.exp(-dt / 120));
      if (Math.abs(smoothScroll.target - smoothScroll.current) < 0.5) {
        smoothScroll.current = smoothScroll.target;
        window.scrollTo(0, smoothScroll.current);
        smoothScroll = null;
      } else window.scrollTo(0, smoothScroll.current);
    }
    if (tween) {
      const t = clamp((now - tween.start) / tween.duration);
      pos = mix(tween.from, tween.to, (tween.entrance ? entrance : glide)(t));
      if (t >= 0.12 && !tween.changed) {
        tween.changed = true;
        change(tween.to, tween.direction);
      }
      if (t >= 1) {
        pos = tween.to;
        tween = null;
        // Start the dwell after the glide (and any first-frame shader work),
        // not during it. A slow GPU must not immediately skip the first material.
        interaction = now;
      }
    }
    const heroRect = hero.getBoundingClientRect(),
      insideRect = inside.getBoundingClientRect(),
      shopRect = shop.getBoundingClientRect();
    const avail = vh - headerHeight;
    const heroRatio = clamp(
      (Math.min(vh, heroRect.bottom) - Math.max(headerHeight, heroRect.top)) /
        heroRect.height,
    );
    if (
      entered &&
      auto &&
      !paused &&
      !reduced &&
      !drag &&
      !tween &&
      !document.querySelector("dialog[open],.reference-menu") &&
      heroRatio >= 0.6 &&
      now - interaction >= 3200
    )
      goTo(target + 1);
    const p = clamp(
      (headerHeight - insideRect.top) / Math.max(1, insideRect.height - avail),
    );
    const nextStep = Math.floor(Math.min(p, 0.759) / 0.19),
      q = clamp((p - 0.76) / 0.24);
    if (nextStep !== step) {
      step = nextStep;
      callbacks.onStep(step);
      const duration =
        720 * clamp(Math.abs(angles[step] - angle) / 180, 0.4, 2);
      if (reduced || paused) {
        angle = angles[step];
        flip = null;
        setStepCopy();
      } else
        flip = {
          start: now,
          from: angle,
          to: angles[step],
          duration,
          text: false,
        };
    }
    if (flip) {
      const t = clamp((now - flip.start) / flip.duration);
      angle = mix(flip.from, flip.to, -(Math.cos(Math.PI * t) - 1) / 2);
      if (
        !flip.text &&
        now - flip.start >= 0.38 * Math.min(flip.duration, 720)
      ) {
        flip.text = true;
        crossfadeCopy();
      }
      if (t >= 1) flip = null;
    }
    const pinY =
      insideRect.top > headerHeight
        ? insideRect.top - headerHeight
        : Math.min(0, insideRect.bottom - vh);
    const insideVisible =
      insideRect.top < vh && insideRect.bottom > headerHeight;
    front.style.visibility = insideVisible ? "visible" : "hidden";
    front.style.transform = `translateY(${pinY}px)`;
    inFrame.style.opacity = String(1 - clamp(q * 4));
    inside.querySelector<HTMLElement>(".in-frame")!.style.opacity = String(
      1 - clamp(q * 4),
    );
    dark.style.opacity = String(clamp(q * 3.5) * 0.42);
    root.dataset.step = String(step + 1);
    root.dataset.storm = q.toFixed(3);
    const bRect = insideAnchor.getBoundingClientRect(),
      cRect = cardAnchors[active].getBoundingClientRect();
    const p1 = clamp(1 - (insideRect.top - headerHeight) / avail),
      p3 = clamp((vh - shopRect.top) / (0.7 * avail));
    const a = arcPose(target, heroRect, now);
    const b: ComponentPose = {
      x: bRect.left + bRect.width / 2,
      y:
        bRect.top +
        bRect.height / 2 +
        (reduced || paused ? 0 : Math.sin((now / 2600) * Math.PI * 2) * 6),
      h: bRect.height,
      rz: 14,
      ry: angle + (reduced || paused ? 0 : q * 720),
      rx: 0,
      z: 0,
      op: 1,
      sx: 1,
      sy: 1,
      shadow: 1,
    };
    const c: ComponentPose = {
      x: cRect.left + cRect.width / 2,
      y: cRect.top + cRect.height / 2,
      h: cRect.height,
      rz: 0,
      ry: Math.round(b.ry / 360) * 360 + tilt[active].x * 14,
      rx: -tilt[active].y * 14,
      z: 0,
      op: 1,
      sx: 1,
      sy: 1,
      shadow: 0.7,
    };
    let pose = p1 > 0 ? mixPose(a, b, smooth(p1)) : a;
    if (p3 > 0) pose = mixPose(b, c, smooth(p3));
    let spotlightTravel = 0;
    if (spotlight && spotlightAnchor) {
      const rect = spotlight.getBoundingClientRect();
      const anchor = spotlightAnchor.getBoundingClientRect();
      const progress = clamp(
        (headerHeight - rect.top) / Math.max(1, rect.height - avail),
      );
      spotlightTravel = clamp((vh - rect.top) / (avail * 0.85));
      const motion = reduced || paused ? 0 : progress;
      const d: ComponentPose = {
        ...c,
        x: anchor.left + anchor.width / 2,
        y: anchor.top + anchor.height / 2,
        h: anchor.height,
        ry: Math.round(b.ry / 360) * 360 + motion * 720,
        rx: motion * 24,
        rz: -10 + motion * 20,
        shadow: 0.3,
      };
      if (spotlightTravel > 0) pose = mixPose(c, d, smooth(spotlightTravel));
      root.dataset.spotlightProgress = progress.toFixed(4);
      root.style.setProperty("--spotlight-p", progress.toFixed(4));
      spotlightGears?.forEach((gear, i) => {
        gear.style.transform = `rotate(${motion * (i === 0 ? 720 : -960)}deg)`;
      });
      if (spotlightPhoto)
        spotlightPhoto.style.transform =
          reduced || paused
            ? "none"
            : `translate3d(0,${(progress - 0.5) * 70}px,0) scale(1.12)`;
    }
    if (poke && poke.index === active) {
      const t = clamp((now - poke.start) / 500);
      if (t < 0.3) {
        pose.sx = mix(1, 1.06, t / 0.3);
        pose.sy = mix(1, 0.93, t / 0.3);
      } else if (t < 0.6) {
        pose.sx = mix(1.06, 0.97, (t - 0.3) / 0.3);
        pose.sy = mix(0.93, 1.04, (t - 0.3) / 0.3);
      } else {
        pose.sx = mix(0.97, 1, (t - 0.6) / 0.4);
        pose.sy = mix(1.04, 1, (t - 0.6) / 0.4);
      }
      if (t >= 1) poke = null;
    }
    if (vw < 820 && p3 > 0 && !phoneCentered && !reduced) {
      phoneCentered = true;
      const strip = root.querySelector<HTMLElement>(".journey-grid")!;
      strip.scrollTo({
        left:
          cards[active].offsetLeft -
          (strip.clientWidth - cards[active].clientWidth) / 2,
        behavior: paused ? "instant" : "smooth",
      });
    }
    const items: RenderItem[] = [];
    for (let i = -5; i <= 5; i++) {
      const j = Math.floor(pos) + i;
      if (j === target) continue;
      const state = arcPose(j, heroRect, now);
      state.op *= 1 - clamp(p1 * 1.6);
      items.push({ slot: j, type: modulo(j), pose: state });
    }
    storm.forEach((piece, i) => {
      const ph = i / 20 + seeded(i + 1) * 0.03,
        s = clamp((q - 0.45 * ph) / 0.55);
      const show = !reduced && !paused && q > 0 && q < 1 && s > 0 && s < 1;
      piece.style.visibility = show ? "visible" : "hidden";
      if (!show) return;
      const a = seeded(i + 40) * Math.PI * 2,
        R = 0.55 * Math.hypot(vw, avail),
        radius = (0.06 + s ** 1.5 * 0.95) * R,
        size = 0.7 + seeded(i + 80) * 0.7;
      const base = 0.085 * Math.min(vw, avail);
      piece.style.width = piece.style.height = `${base}px`;
      piece.style.transform = `translate(-50%,-50%) translate(${Math.cos(a) * radius}px,${Math.sin(a) * radius * 0.8}px) scale(${(0.2 + 1.7 * s) * size}) rotate(${(seeded(i + 60) > 0.5 ? 360 : -360) * s}deg)`;
      piece.style.opacity = String(
        Math.sin(Math.PI * s) * clamp(5 * q) * clamp(6 * (1 - q)),
      );
    });
    if (colorReveal) {
      const t = clamp((now - colorReveal.start) / 420),
        cx = vw / 2,
        cy = heroRect.height * (vw < 820 ? 0.36 : 0.4);
      const R =
          1.45 *
          Math.max(
            Math.hypot(cx, cy),
            Math.hypot(vw - cx, heroRect.height - cy),
          ),
        r = R * glide(t),
        f = Math.max(60, 0.35 * r);
      const mask = `radial-gradient(circle at ${cx}px ${cy}px, #000 ${Math.max(0, r - f)}px, transparent ${r}px)`;
      reveal.style.maskImage = mask;
      reveal.style.webkitMaskImage = mask;
      if (t >= 1) finishReveal();
    }
    const stage =
      spotlightTravel >= 0.999
        ? "spotlight"
        : spotlightTravel > 0
          ? "spotlight-travelling"
          : p3 >= 0.999
            ? "card"
            : p3 > 0
              ? "landing"
              : p1 >= 0.999
                ? "inside"
                : p1 > 0
                  ? "travelling"
                  : "hero";
    root.dataset.stage = stage;
    root.dataset.position = pos.toFixed(3);
    if (canvas) {
      canvas.dataset.stage = stage;
      canvas.dataset.selected = String(active);
      canvas.dataset.scrollProgress = p.toFixed(4);
    }
    const inViewport = pose.y + pose.h > 0 && pose.y - pose.h < vh;
    if (scene && (dirty || inViewport || tween || flip || pendingGpu))
      pendingGpu =
        scene.render(items, { slot: target, type: modulo(target), pose }) ===
        false;
    rail.style.visibility =
      root.getBoundingClientRect().bottom > vh * 0.2 ? "visible" : "hidden";
    let current = 0;
    navSections.forEach((section, i) => {
      if (section && section.getBoundingClientRect().top < vh * 0.35)
        current = i;
    });
    root.dataset.section = String(current);
    const links = rail.querySelectorAll<HTMLAnchorElement>("a[data-section]");
    links.forEach((link, i) => {
      if (i === current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    const selectedLink = links[current];
    if (selectedLink) {
      const highlight = rail.querySelector<HTMLElement>(
        ".journey-rail-highlight",
      )!;
      highlight.style.left = `${selectedLink.offsetLeft}px`;
      highlight.style.width = `${selectedLink.offsetWidth}px`;
    }
    dirty = false;
    const ambient =
      entered &&
      !reduced &&
      !paused &&
      (heroRatio > 0 || insideVisible) &&
      !document.querySelector("dialog[open]");
    if (
      ambient ||
      tween ||
      flip ||
      colorReveal ||
      smoothScroll ||
      poke ||
      now < settleUntil ||
      pendingGpu
    )
      frame = requestAnimationFrame(tick);
  }

  listen(window, "resize", resize);
  listen(
    window,
    "scroll",
    (() => {
      if (smoothScroll && Math.abs(scrollY - smoothScroll.current) > 80)
        smoothScroll = null;
      invalidate();
    }) as EventListener,
    { passive: true },
  );
  listen(
    root.querySelector<HTMLElement>(".journey-grid")!,
    "scroll",
    invalidate,
    { passive: true },
  );
  listen(document, "visibilitychange", () => {
    visible = !document.hidden;
    interaction = performance.now();
    if (!visible) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      last = performance.now();
      invalidate();
    }
  });
  listen(
    window,
    "wheel",
    ((event: WheelEvent) => {
      if (options.nativeScroll) {
        interaction = performance.now();
        return;
      }
      if (
        reduced ||
        paused ||
        !entered ||
        event.ctrlKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
        matchMedia("(pointer: coarse)").matches ||
        document.querySelector("dialog[open]") ||
        document.body.classList.contains("journey-locked") ||
        !root.contains(event.target as Node)
      )
        return;
      // Keep the horizontal mobile strip and any intentional internal scrolling native.
      if (
        (event.target as HTMLElement).closest(
          "textarea,input,select,.journey-grid",
        )
      )
        return;
      event.preventDefault();
      interaction = performance.now();
      const delta =
        event.deltaY *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? vh : 1);
      smoothScroll = {
        target: clamp(
          (smoothScroll?.target ?? scrollY) + delta,
          0,
          document.documentElement.scrollHeight - vh,
        ),
        current: smoothScroll?.current ?? scrollY,
      };
      invalidate();
    }) as EventListener,
    { passive: false },
  );
  listen(document, "keydown", ((e: KeyboardEvent) => {
    smoothScroll = null;
    if (
      (e.target as HTMLElement).closest(
        "input,textarea,select,[contenteditable],dialog",
      )
    )
      return;
    const rect = hero.getBoundingClientRect();
    if (
      (Math.min(vh, rect.bottom) - Math.max(headerHeight, rect.top)) /
        rect.height <
      0.5
    )
      return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(target + (e.key === "ArrowRight" ? 1 : -1));
    }
  }) as EventListener);
  listen(document, "toggle", invalidate, { capture: true });
  listen(document, "pointerdown", () => {
    smoothScroll = null;
  });
  listen(arc, "pointerdown", ((e: PointerEvent) => {
    if (e.button !== 0) return;
    interact();
    drag = {
      start: e.clientX,
      startY: e.clientY,
      pos,
      last: e.timeStamp,
      lastPos: pos,
      v: 0,
      active: false,
      pointer: e.pointerId,
    };
  }) as EventListener);
  listen(arc, "pointermove", ((e: PointerEvent) => {
    if (!drag) {
      if (e.pointerType === "mouse")
        arc.style.cursor =
          scene && scene.hit(e.clientX, e.clientY) !== null
            ? "pointer"
            : "grab";
      return;
    }
    const dx = e.clientX - drag.start;
    if (
      !drag.active &&
      Math.abs(dx) > 6 &&
      Math.abs(dx) > Math.abs(e.clientY - drag.startY)
    ) {
      drag.active = true;
      tween = null;
      arc.setPointerCapture(e.pointerId);
      document.body.classList.add("journey-dragging");
    }
    if (!drag.active) return;
    const rect = hero.getBoundingClientRect(),
      u =
        vw < 820
          ? Math.min(vw / 560, rect.height / 980)
          : Math.min(vw / 1440, rect.height / 900);
    pos = drag.pos - dx / (278 * u * (vw < 820 ? 1.02 : 1));
    const velocity =
      (pos - drag.lastPos) / Math.max(1, e.timeStamp - drag.last);
    drag.v = mix(drag.v, velocity, 0.4);
    drag.last = e.timeStamp;
    drag.lastPos = pos;
    interaction = performance.now();
    invalidate();
  }) as EventListener);
  const release = (event: PointerEvent) => {
    if (!drag) return;
    const old = drag;
    drag = null;
    document.body.classList.remove("journey-dragging");
    if (arc.hasPointerCapture(old.pointer))
      arc.releasePointerCapture(old.pointer);
    if (old.active) {
      if (
        Math.abs(pos - Math.round(pos)) > 0.02 ||
        event.type !== "pointercancel"
      )
        goTo(Math.round(pos + clamp(old.v * 220, -2, 2)), true);
    } else if (event.type !== "pointercancel") {
      const j = scene?.hit(event.clientX, event.clientY);
      if (j !== null && j !== undefined) goTo(j);
    }
    interaction = performance.now();
    invalidate();
  };
  listen(arc, "pointerup", release as EventListener);
  listen(arc, "pointercancel", release as EventListener);
  cards.forEach((card, index) => {
    // CSS reveal motion moves the DOM anchor too. Keep tracking until it ends,
    // then demand one final draw so the traveller never lands a few pixels adrift.
    listen(card, "animationstart", () => {
      settleUntil = performance.now() + 1200;
      invalidate();
    });
    listen(card, "animationend", () => {
      settleUntil = performance.now() + 100;
      invalidate();
    });
    listen(card, "pointermove", ((e: PointerEvent) => {
      if (e.pointerType !== "mouse" || reduced || paused) return;
      const rect = card.getBoundingClientRect();
      const x = clamp((e.clientX - rect.left) / rect.width) - 0.5,
        y = clamp((e.clientY - rect.top) / rect.height) - 0.5;
      tilt[index] = { x, y };
      settleUntil = performance.now() + 350;
      card.style.transform = `translateY(-8px) rotateX(${-y * 12}deg) rotateY(${x * 12}deg)`;
      invalidate();
    }) as EventListener);
    listen(card, "pointerleave", () => {
      tilt[index] = { x: 0, y: 0 };
      settleUntil = performance.now() + 400;
      card.style.transform = "";
      invalidate();
    });
    listen(card, "pointerdown", () => {
      card.classList.add("pressed");
    });
    listen(window, "pointerup", () => {
      card.classList.remove("pressed");
      invalidate();
    });
  });
  let loadIdle: number | undefined;
  let loadingStarted = false;
  function load() {
    if (disposed || reduced || !canvas) return;
    import("./journey-scene")
      .then(({ createJourneyScene }) => {
        if (disposed) return;
        try {
          scene = createJourneyScene(
            canvas,
            () => {
              scene?.dispose();
              scene = undefined;
              pendingGpu = false;
              root.dataset.webgl = "unavailable";
              canvas.style.visibility = "hidden";
              invalidate();
            },
            11,
            options.appearance,
          );
          scene.resize(vw, vh);
          interaction = performance.now();
          if (tween?.entrance) {
            tween.start = performance.now();
            pos = -2.6;
          }
          root.dataset.webgl = "ready";
          canvas.style.visibility = "visible";
          invalidate();
        } catch {
          root.dataset.webgl = "unavailable";
          canvas.style.visibility = "hidden";
        }
      })
      .catch(() => {
        if (!disposed) root.dataset.webgl = "unavailable";
      });
  }
  function startScene() {
    if (loadingStarted || reduced || !canvas) return;
    loadingStarted = true;
    // Never compile shaders underneath the skip button. The intro stays responsive.
    if ("requestIdleCallback" in window)
      loadIdle = requestIdleCallback(load, { timeout: 700 });
    else later(load, 150);
  }
  root.dataset.webgl = "static";
  document.fonts.ready.then(() => {
    if (!disposed) {
      fitTitle();
      invalidate();
    }
  });
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(hero);
  if (header) resizeObserver.observe(header);
  setTitle(1, true);
  setStepCopy();
  resize();
  return {
    goTo,
    next: (direction = 1) => goTo(target + direction),
    select: (index: number) => {
      const nearest = target + (((index - modulo(target) + 4) % 3) - 1);
      goTo(nearest);
    },
    stepTo: (index: number) => {
      interact();
      const rect = inside.getBoundingClientRect();
      window.scrollTo({
        top:
          scrollY +
          rect.top -
          headerHeight +
          (index * 0.19 + 0.095) * (inside.offsetHeight - (vh - headerHeight)),
        behavior: reduced || paused ? "instant" : "smooth",
      });
    },
    setEntered(value: boolean) {
      if (entered === value) return;
      entered = value;
      if (value) startScene();
      root.dataset.entered = String(value);
      interaction = performance.now();
      if (value && !reduced) {
        pos = -2.6;
        tween = {
          start: performance.now(),
          from: -2.6,
          to: initial,
          duration: 1700,
          entrance: true,
          changed: true,
          direction: 1,
        };
      }
      invalidate();
    },
    setAuto(value: boolean) {
      auto = value && !reduced;
      callbacks.onAuto(auto);
      interaction = performance.now();
      invalidate();
    },
    setPaused(value: boolean) {
      paused = value;
      root.dataset.paused = String(value);
      if (paused) {
        auto = false;
        callbacks.onAuto(false);
        if (tween) {
          pos = tween.to;
          tween = null;
          change(target, 1);
        }
        if (flip) {
          angle = angles[step];
          flip = null;
          setStepCopy();
        }
        finishReveal();
        animations.forEach((a) => a.finish());
      }
      invalidate();
    },
    poke(index: number) {
      if (!reduced && !paused) poke = { start: performance.now(), index };
      invalidate();
    },
    invalidate,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      if (loadIdle !== undefined) cancelIdleCallback(loadIdle);
      timers.forEach(clearTimeout);
      animations.forEach((a) => a.cancel());
      resizeObserver.disconnect();
      cleanupListeners.forEach((fn) => fn());
      scene?.dispose();
      cards.forEach((card) => {
        card.style.transform = "";
        card.classList.remove("pressed");
      });
      root.dataset.webgl = "static";
      document.body.classList.remove("journey-dragging");
    },
  };
}
