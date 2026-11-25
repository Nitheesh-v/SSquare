import {
  bezier,
  clamp,
  mix,
  mixPose,
  modulo,
  smooth,
  type ComponentPose,
} from "@/features/journey/journey-data";
import type {
  JourneyScene,
  RenderItem,
} from "@/features/journey/journey-scene";

export type HomeMotionState = "static" | "loading" | "ready" | "unavailable";
export type HomeMotionController = ReturnType<typeof createHomeMotion>;
type Options = {
  active: number;
  paused: boolean;
  rotation: number;
  entrance: boolean;
  onSelect: (index: number) => void;
  onState: (state: HomeMotionState) => void;
};
const glide = bezier(0.25, 0.75, 0.2, 1);
const flips = [0, 180, 360, 720];
const seeded = (i: number) => {
  const n = Math.sin(i * 127.1 + 311.7) * 43758.5453123;
  return n - Math.floor(n);
};

/**
 * Reference motion, anchored to the photographic page's EXISTING geometry.
 * One persistent Three.js traveller: carousel → material photograph → inspector.
 * No scroll interception, layout spacer, replacement copy or enquiry simulation.
 */
export function createHomeMotion(
  root: HTMLElement,
  canvas: HTMLCanvasElement,
  options: Options,
) {
  const hero = root.querySelector<HTMLElement>(".precision-hero")!;
  const arc = root.querySelector<HTMLElement>(".home-carousel-gesture")!;
  const strip = root.querySelector<HTMLElement>(".hero-material-strip")!;
  const study = root.querySelector<HTMLElement>(".inspector-viewport")!;
  const inspector = root.querySelector<HTMLElement>(".component-inspector")!;
  const cards = Array.from(
    root.querySelectorAll<HTMLElement>(".studio-material-card"),
  );
  const photos = cards.map((card) =>
    card.querySelector<HTMLElement>(".studio-material-photo")!,
  );
  const particles = Array.from(
    root.querySelectorAll<HTMLElement>(".home-motion-particles > span"),
  );
  const header = document.querySelector<HTMLElement>(".site-header");
  const animations = new Set<Animation>();
  const flights = new Set<HTMLElement>();
  const removeListeners: (() => void)[] = [];
  let scene: JourneyScene | undefined;
  let disposed = false,
    failed = false,
    visible = !document.hidden,
    blocked = false,
    paused = options.paused,
    frame = 0,
    autoTimer = 0,
    idleLoader: number | undefined;
  let active = options.active,
    rotation = options.rotation,
    target = active,
    position = active,
    width = innerWidth,
    height = innerHeight,
    headerHeight = 113,
    clock = 0,
    lastTime = performance.now(),
    autoAt = lastTime + 4400,
    settledTarget = Number.NaN,
    flipAngle = 0,
    step = -1,
    signature = "";
  let tween: {
    from: number;
    to: number;
    start: number;
    duration: number;
  } | null = null;
  let flip: { from: number; to: number; start: number } | null = null;
  let drag: {
    x: number;
    y: number;
    from: number;
    pointer: number;
    captured: boolean;
  } | null = null;
  let hoveredControl = false;
  let quoteOrigin: DOMRect | null = null;

  type MotionEvents = HTMLElementEventMap & DocumentEventMap & WindowEventMap;
  const listen = <K extends keyof MotionEvents>(
    node: EventTarget,
    type: K,
    handler: (event: MotionEvents[K]) => void,
    settings?: AddEventListenerOptions,
  ) => {
    node.addEventListener(type, handler as EventListener, settings);
    removeListeners.push(() =>
      node.removeEventListener(type, handler as EventListener, settings),
    );
  };
  const animate = (
    node: Element,
    keyframes: Keyframe[],
    settings: KeyframeAnimationOptions,
  ) => {
    if (paused || disposed) return;
    const animation = node.animate(keyframes, settings);
    animations.add(animation);
    animation.finished
      .catch(() => {})
      .finally(() => animations.delete(animation));
    return animation;
  };
  function cancelAnimations() {
    animations.forEach((animation) => animation.cancel());
    animations.clear();
    flights.forEach((node) => node.remove());
    flights.clear();
  }
  function invalidate() {
    if (!frame && visible && !disposed) frame = requestAnimationFrame(tick);
  }
  function interact() {
    autoAt = performance.now() + 4400;
    window.clearTimeout(autoTimer);
    autoTimer = 0;
    invalidate();
  }
  function choose(to: number, notify = true) {
    interact();
    target = Math.round(to);
    const next = modulo(target);
    if (next !== active) {
      active = next;
      root.dataset.motionSelected = String(active);
      if (notify) options.onSelect(active);
    }
    tween = paused
      ? null
      : {
          from: position,
          to: target,
          start: performance.now(),
          duration: 650 + Math.min(250, Math.abs(target - position) * 100),
        };
    if (paused) position = target;
    signature = "";
    invalidate();
  }
  function configureCanvas() {
    if (paused) {
      // A paused object is in the existing inspector, moving only with the DOM.
      // Native scrolling needs NO redraws, and explicit rotation still works.
      const a = study.getBoundingClientRect(),
        r = root.getBoundingClientRect();
      canvas.dataset.mode = "contained";
      Object.assign(canvas.style, {
        position: "absolute",
        left: `${a.left - r.left}px`,
        top: `${a.top - r.top}px`,
        width: `${a.width}px`,
        height: `${a.height}px`,
      });
      scene?.resize(a.width, a.height);
    } else {
      canvas.dataset.mode = "travelling";
      Object.assign(canvas.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        width: `${width}px`,
        height: `${height}px`,
      });
      scene?.resize(width, height);
    }
    signature = "";
  }
  function resize() {
    width = innerWidth;
    height = innerHeight;
    headerHeight = header?.getBoundingClientRect().height || 113;
    root.style.setProperty("--home-motion-header", `${headerHeight}px`);
    configureCanvas();
    invalidate();
  }
  function carouselPose(index: number): ComponentPose {
    const rect = arc.getBoundingClientRect();
    const k = index - position,
      distance = Math.abs(k),
      unit = Math.min(rect.width / 620, rect.height / 310),
      bob = Math.sin((clock / 4600) * Math.PI * 2 + index * 1.37);
    return {
      x: rect.left + rect.width / 2 + k * 202 * unit,
      y: rect.top + rect.height * 0.46 + distance * 27 * unit + bob * 4 * unit,
      h: mix(265, 175, clamp(distance)) * unit,
      rx: 9 + bob * 1.6,
      ry: Math.sign(k) * Math.min(distance, 2) * 22,
      rz: Math.sign(k) * Math.min(distance, 2) * 9 + bob * 0.5,
      z: -distance * 26 * unit,
      op: 1 - smooth(clamp((distance - 1.05) / 0.45)),
      sx: 1,
      sy: 1,
      shadow: 0.6,
    };
  }
  function cardPose(): ComponentPose {
    const rect = photos[active].getBoundingClientRect();
    return {
      x: rect.right - rect.width * 0.19,
      y: rect.top + rect.height * 0.24,
      h: Math.min(108, rect.width * 0.29),
      rx: 16,
      ry: 360,
      rz: -12,
      z: 0,
      op: 0.92,
      sx: 1,
      sy: 1,
      shadow: 0.45,
    };
  }
  function hideParticles() {
    particles.forEach((particle) => (particle.style.visibility = "hidden"));
  }
  function emitParticles(pose: ComponentPose, progress: number) {
    const q = clamp((progress - 0.18) / 0.7);
    particles.forEach((particle, i) => {
      const t = clamp((q - seeded(i + 1) * 0.24) / 0.76);
      const show = !!scene && !paused && q > 0 && q < 1 && t > 0 && t < 1;
      particle.style.visibility = show ? "visible" : "hidden";
      if (!show) return;
      const angle = seeded(i + 20) * Math.PI * 2,
        radius = 18 + t ** 1.5 * (width < 700 ? 95 : 190),
        size = (width < 700 ? 17 : 25) + seeded(i + 40) * 15;
      particle.style.width = particle.style.height = `${size}px`;
      particle.style.transform = `translate3d(${pose.x + Math.cos(angle) * radius}px,${pose.y + Math.sin(angle) * radius * 0.65}px,0) translate(-50%,-50%) rotate(${t * (i % 2 ? -360 : 360)}deg) scale(${0.5 + t})`;
      particle.style.opacity = String(Math.sin(Math.PI * t) * 0.45);
    });
  }
  function tick(now: number) {
    frame = 0;
    if (disposed || !visible) return;
    const delta = Math.min(64, Math.max(0, now - lastTime));
    lastTime = now;
    if (!paused && !blocked) clock += delta;
    if (tween && !blocked) {
      const t = clamp((now - tween.start) / tween.duration);
      position = mix(tween.from, tween.to, glide(t));
      if (t >= 1) {
        position = target;
        tween = null;
        // The dwell starts AFTER the glide, including on a slow first shader draw.
        autoAt = now + 4400;
      }
    }
    const heroRect = hero.getBoundingClientRect();
    const heroVisible =
      heroRect.bottom > headerHeight &&
      heroRect.top < height &&
      heroRect.bottom - Math.max(headerHeight, heroRect.top) >
        heroRect.height * 0.5;
    const focusedControl =
      root.contains(document.activeElement) &&
      !!(document.activeElement as HTMLElement)?.closest(
        "button,a,input,select,textarea",
      );
    if (
      !paused &&
      !blocked &&
      !drag &&
      !tween &&
      !hoveredControl &&
      !focusedControl &&
      heroVisible &&
      (failed || settledTarget === target) &&
      now >= autoAt
    )
      choose(target + 1);

    let pose: ComponentPose,
      stage = "hero";
    const items: RenderItem[] = [];
    if (paused) {
      const w = study.clientWidth,
        h = study.clientHeight;
      pose = {
        x: w / 2,
        y: h * 0.48,
        h: Math.min(w * 0.66, h * 0.7),
        rx: 14,
        ry: rotation,
        rz: -12,
        z: 0,
        op: 1,
        sx: 1,
        sy: 1,
        shadow: 0.45,
      };
      stage = "study";
      hideParticles();
    } else {
      const rect = study.getBoundingClientRect(),
        photo = photos[active].getBoundingClientRect(),
        available = Math.max(1, height - headerHeight),
        photoDocumentY = scrollY + photo.top + photo.height * 0.24,
        heroExit = scrollY + heroRect.bottom - height * 0.73,
        cardArrival = Math.max(heroExit + 160, photoDocumentY - height * 0.48),
        toCard = clamp((scrollY - heroExit) / (cardArrival - heroExit)),
        studyArrival =
          scrollY +
          rect.top +
          rect.height * 0.48 -
          (headerHeight + available * 0.5),
        toStudy = clamp(
          (scrollY - cardArrival - 50) /
            Math.max(180, studyArrival - cardArrival - 50),
        ),
        progress = clamp((height - rect.top) / (available + rect.height));
      const nextStep = Math.min(3, Math.floor(progress * 4));
      if (nextStep !== step) {
        step = nextStep;
        flip = { from: flipAngle, to: flips[step], start: now };
      }
      if (flip && !blocked) {
        const t = clamp((now - flip.start) / 720);
        flipAngle = mix(flip.from, flip.to, -(Math.cos(Math.PI * t) - 1) / 2);
        if (t >= 1) flip = null;
      }
      root.style.setProperty("--home-study-progress", progress.toFixed(5));
      inspector.dataset.step = String(step + 1);
      const a = carouselPose(target),
        b = cardPose(),
        c: ComponentPose = {
          x: rect.left + rect.width / 2,
          y:
            rect.top +
            rect.height * 0.48 +
            Math.sin((clock / 2600) * Math.PI * 2) * 4,
          h: Math.min(rect.width * 0.66, rect.height * 0.7),
          rx: 14,
          ry: rotation + flipAngle,
          rz: -12,
          z: 0,
          op: 1,
          sx: 1,
          sy: 1,
          shadow: 0.45,
        };
      pose = mixPose(a, b, smooth(toCard));
      if (toStudy > 0) pose = mixPose(b, c, smooth(toStudy));
      if (toCard <= 0) stage = "hero";
      else if (toStudy >= 0.999) stage = "study";
      else if (toStudy > 0) stage = "study-travel";
      else if (toCard >= 0.999) stage = "card";
      else stage = "card-travel";
      for (
        let j = Math.floor(position) - 1;
        j <= Math.floor(position) + 2;
        j++
      ) {
        if (j === target) continue;
        const p = carouselPose(j);
        p.op *= 1 - clamp(toCard * 2.5);
        if (p.op > 0.01) items.push({ slot: j, type: modulo(j), pose: p });
      }
      emitParticles(pose, toStudy);
      canvas.dataset.progress = progress.toFixed(4);
    }
    canvas.dataset.stage = stage;
    canvas.dataset.selected = String(active);
    canvas.dataset.position = position.toFixed(4);
    root.dataset.motionStage = stage;
    const nextSignature = JSON.stringify([
      width,
      height,
      paused,
      active,
      pose,
      items,
    ]);
    let pending = false;
    if (scene && nextSignature !== signature) {
      pending =
        scene.render(items, { slot: target, type: active, pose }) === false;
      if (!pending) {
        signature = nextSignature;
        if (!tween && stage === "hero" && settledTarget !== target) {
          settledTarget = target;
          autoAt = now + 4400;
        }
      }
    }
    const onScreen = pose.y + pose.h > headerHeight && pose.y - pose.h < height;
    if (
      (!paused && !blocked && scene && onScreen) ||
      (tween && !blocked) ||
      (flip && !blocked) ||
      pending
    ) {
      invalidate();
    } else if (
      !paused &&
      !blocked &&
      heroVisible &&
      !hoveredControl &&
      !focusedControl
    ) {
      window.clearTimeout(autoTimer);
      autoTimer = window.setTimeout(invalidate, Math.max(120, autoAt - now));
    }
  }

  function quoteFlight() {
    if (!quoteOrigin || paused) return;
    const dialog = document.querySelector<HTMLDialogElement>(
      "dialog[open].ssq-drawer",
    );
    if (!dialog) return;
    const origin = quoteOrigin;
    quoteOrigin = null;
    const destination = dialog.querySelector("h2")?.getBoundingClientRect();
    if (!destination) return;
    const chip = document.createElement("span");
    chip.className = "home-quote-flight";
    chip.setAttribute("aria-hidden", "true");
    chip.inert = true;
    // An arrow is decorative feedback, never a fabricated enquiry or success state.
    chip.textContent = "↗";
    Object.assign(chip.style, {
      left: `${origin.right - 38}px`,
      top: `${origin.top + 7}px`,
    });
    dialog.appendChild(chip);
    flights.add(chip);
    const dx = destination.right - origin.right + 12,
      dy = destination.top - origin.top;
    const flight = animate(
      chip,
      [
        { transform: "translate3d(0,0,0) scale(1)", opacity: 0.9 },
        {
          transform: `translate3d(${dx * 0.55}px,${dy * 0.4 - 70}px,0) scale(1.15)`,
          opacity: 0.85,
          offset: 0.5,
        },
        { transform: `translate3d(${dx}px,${dy}px,0) scale(.35)`, opacity: 0 },
      ],
      { duration: 650, easing: "cubic-bezier(.25,.75,.2,1)" },
    );
    flight?.finished
      .catch(() => {})
      .finally(() => {
        chip.remove();
        flights.delete(chip);
      });
  }
  function syncBlockers() {
    const next = !!document.querySelector(
      "dialog[open],.site-header [aria-expanded='true']",
    );
    if (next !== blocked) {
      blocked = next;
      if (blocked) {
        window.clearTimeout(autoTimer);
        autoTimer = 0;
        // Finish a glide immediately underneath a modal, without a delayed selection.
        position = target;
        tween = null;
        if (flip) {
          flipAngle = flip.to;
          flip = null;
        }
      } else interact();
      signature = "";
      invalidate();
    }
    quoteFlight();
  }
  const blockers = new MutationObserver(syncBlockers);
  blockers.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ["open", "aria-expanded"],
  });
  syncBlockers();
  listen(
    root,
    "click",
    (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>(
        "button",
      );
      if (!button || !button.textContent?.includes("Request a Quote")) return;
      interact();
      quoteOrigin = button.getBoundingClientRect();
      animate(
        button,
        [{ scale: "1" }, { scale: ".97", offset: 0.3 }, { scale: "1" }],
        { duration: 320, easing: "cubic-bezier(.22,1,.36,1)" },
      );
    },
    { capture: true },
  );
  listen(root, "focusin", interact);
  listen(root, "focusout", interact);
  listen(strip, "pointerenter", () => {
    hoveredControl = true;
    interact();
  });
  listen(strip, "pointerleave", () => {
    hoveredControl = false;
    interact();
  });
  listen(strip, "keydown", (event) => {
    // The adjacent phone link keeps its native keyboard behaviour.
    if (!(event.target as Element).closest("button[aria-pressed]")) return;
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? 2
          : modulo(active + (event.key === "ArrowRight" ? 1 : -1));
    choose(target + (((next - modulo(target) + 4) % 3) - 1));
    strip
      .querySelectorAll<HTMLButtonElement>("button")
      [next]?.focus({ preventScroll: true });
  });
  listen(arc, "pointerdown", (event) => {
    if (event.button !== 0 || paused || blocked || failed) return;
    interact();
    drag = {
      x: event.clientX,
      y: event.clientY,
      from: position,
      pointer: event.pointerId,
      captured: false,
    };
  });
  listen(arc, "pointermove", (event) => {
    if (!drag) return;
    const dx = event.clientX - drag.x,
      dy = event.clientY - drag.y;
    if (!drag.captured && Math.abs(dy) > Math.max(9, Math.abs(dx))) {
      drag = null;
      return;
    }
    if (!drag.captured && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      drag.captured = true;
      tween = null;
      arc.setPointerCapture(event.pointerId);
      arc.dataset.dragging = "true";
    }
    if (!drag.captured) return;
    const spacing = Math.max(70, arc.clientWidth * 0.32);
    position = drag.from - clamp(dx / spacing, -1.2, 1.2);
    signature = "";
    interact();
  });
  function release(event: PointerEvent) {
    if (!drag) return;
    const start = drag;
    drag = null;
    delete arc.dataset.dragging;
    if (arc.hasPointerCapture(start.pointer))
      arc.releasePointerCapture(start.pointer);
    if (start.captured) choose(Math.round(position));
    else if (event.type !== "pointercancel") {
      const hit = scene?.hit(event.clientX, event.clientY);
      if (hit !== null && hit !== undefined) choose(hit);
    }
    interact();
  }
  listen(arc, "pointerup", release);
  listen(arc, "pointercancel", release);
  listen(arc, "lostpointercapture", () => {
    drag = null;
    delete arc.dataset.dragging;
  });

  cards.forEach((card) => {
    listen(card, "pointermove", (event) => {
      if (event.pointerType !== "mouse" || paused || blocked) return;
      const r = card.getBoundingClientRect(),
        x = clamp((event.clientX - r.left) / r.width) - 0.5,
        y = clamp((event.clientY - r.top) / r.height) - 0.5;
      card.style.transform = `perspective(950px) translateY(-8px) rotateX(${-y * 12}deg) rotateY(${x * 12}deg)`;
    });
    listen(card, "pointerleave", () => card.style.removeProperty("transform"));
  });
  listen(
    window,
    "scroll",
    () => {
      if (!paused) invalidate();
    },
    { passive: true },
  );
  listen(window, "resize", resize);
  listen(document, "visibilitychange", () => {
    visible = !document.hidden;
    window.clearTimeout(autoTimer);
    autoTimer = 0;
    if (!visible) {
      cancelAnimationFrame(frame);
      frame = 0;
      animations.forEach((animation) => animation.pause());
    } else {
      lastTime = performance.now();
      animations.forEach((animation) => animation.play());
      if (tween) tween = { ...tween, from: position, start: lastTime };
      if (flip) flip = { ...flip, from: flipAngle, start: lastTime };
      interact();
    }
  });
  const resizes = new ResizeObserver(resize);
  [root, hero, study, ...(header ? [header] : [])].forEach((node) =>
    resizes.observe(node),
  );

  if (options.entrance && !paused) {
    root.querySelectorAll("h1 .home-motion-letter").forEach((letter, i) => {
      animate(
        letter,
        [
          { transform: "translate3d(0,105%,0) rotateX(-35deg)", opacity: 0.05 },
          { transform: "translate3d(0,0,0) rotateX(0deg)", opacity: 1 },
        ],
        {
          duration: 900,
          delay: 80 + i * 22,
          easing: "cubic-bezier(.16,1,.3,1)",
          fill: "backwards",
        },
      );
    });
    root
      .querySelectorAll(".precision-hero-copy > :not(h1)")
      .forEach((node, i) => {
        animate(
          node,
          [
            { transform: "translateY(24px)", opacity: 0.2 },
            { transform: "translateY(0)", opacity: 1 },
          ],
          {
            duration: 800,
            delay: 120 + i * 100,
            easing: "cubic-bezier(.22,1,.36,1)",
            fill: "backwards",
          },
        );
      });
  }
  const detailEntrances = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = Number(
          (entry.target as HTMLElement).dataset.motionOrder || 0,
        );
        animate(
          entry.target,
          [
            { transform: "translateY(24px)", opacity: 0.25 },
            { transform: "translateY(0)", opacity: 1 },
          ],
          {
            duration: 760,
            delay: index * 85,
            easing: "cubic-bezier(.22,1,.36,1)",
            fill: "backwards",
          },
        );
        detailEntrances.unobserve(entry.target);
      });
    },
    { threshold: 0.3 },
  );
  [
    ".studio-workflow > div",
    ".studio-details-copy li",
    ".studio-trust-strip .studio-shell > span",
  ].forEach((selector) => {
    root.querySelectorAll<HTMLElement>(selector).forEach((node, i) => {
      node.dataset.motionOrder = String(i);
      detailEntrances.observe(node);
    });
  });
  function unavailable() {
    failed = true;
    scene?.dispose();
    scene = undefined;
    canvas.style.visibility = "hidden";
    root.dataset.motionWebgl = "unavailable";
    options.onState("unavailable");
    hideParticles();
    invalidate();
  }
  function load() {
    options.onState("loading");
    import("@/features/journey/journey-scene")
      .then(({ createJourneyScene }) => {
        if (disposed) return;
        try {
          scene = createJourneyScene(canvas, unavailable, 3);
          configureCanvas();
          canvas.style.visibility = "visible";
          root.dataset.motionWebgl = "ready";
          options.onState("ready");
          autoAt = performance.now() + 4400;
          if (options.entrance && !paused) {
            position = target - 0.9;
            tween = {
              from: position,
              to: target,
              start: performance.now(),
              duration: 1300,
            };
          }
          invalidate();
        } catch {
          unavailable();
        }
      })
      .catch(() => {
        if (!disposed) unavailable();
      });
  }
  root.dataset.motionWebgl = "loading";
  root.dataset.motionSelected = String(active);
  resize();
  if ("requestIdleCallback" in window)
    idleLoader = requestIdleCallback(load, { timeout: 900 });
  else load();

  return {
    select(index: number) {
      if (active !== index)
        choose(target + (((index - modulo(target) + 4) % 3) - 1), false);
    },
    rotate(angle: number) {
      rotation = angle;
      signature = "";
      interact();
    },
    setPaused(value: boolean) {
      if (paused === value) return;
      paused = value;
      cancelAnimations();
      hideParticles();
      cards.forEach((card) => card.style.removeProperty("transform"));
      tween = null;
      flip = null;
      position = target;
      if (drag && arc.hasPointerCapture(drag.pointer))
        arc.releasePointerCapture(drag.pointer);
      drag = null;
      delete arc.dataset.dragging;
      window.clearTimeout(autoTimer);
      autoTimer = 0;
      configureCanvas();
      interact();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(autoTimer);
      if (idleLoader !== undefined) cancelIdleCallback(idleLoader);
      blockers.disconnect();
      resizes.disconnect();
      detailEntrances.disconnect();
      root
        .querySelectorAll<HTMLElement>("[data-motion-order]")
        .forEach((node) => delete node.dataset.motionOrder);
      removeListeners.forEach((remove) => remove());
      cancelAnimations();
      hideParticles();
      cards.forEach((card) => card.style.removeProperty("transform"));
      if (drag && arc.hasPointerCapture(drag.pointer))
        arc.releasePointerCapture(drag.pointer);
      delete arc.dataset.dragging;
      root.style.removeProperty("--home-study-progress");
      root.style.removeProperty("--home-motion-header");
      root.dataset.motionWebgl = "static";
      scene?.dispose();
    },
  };
}
