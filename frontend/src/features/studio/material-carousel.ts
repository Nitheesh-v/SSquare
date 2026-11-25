import {
  bezier,
  clamp,
  mix,
  modulo,
  type ComponentPose,
} from "@/features/journey/journey-data";
import type {
  JourneyScene,
  RenderItem,
} from "@/features/journey/journey-scene";

export type CarouselState = "static" | "loading" | "ready" | "unavailable";
export type MaterialCarousel = ReturnType<typeof createMaterialCarousel>;
const glide = bezier(0.25, 0.75, 0.2, 1);
// The original material journey's arc, used only inside the restored hero.
const slots = [
  [0, 0, 350, 0, 0],
  [278, 25, 265, 5, 18],
  [500, 50, 245, 10, 28],
  [708, 87, 225, 14, 36],
  [910, 120, 210, 18, 42],
];

/** A contained version of the earlier carousel; never travels over other sections. */
export function createMaterialCarousel(
  root: HTMLElement,
  canvas: HTMLCanvasElement,
  options: {
    initial: number;
    paused: boolean;
    auto: boolean;
    onSelect: (index: number) => void;
    onState: (state: CarouselState) => void;
  },
) {
  const arc = root.querySelector<HTMLElement>(".material-carousel-arc")!;
  const header = document.querySelector<HTMLElement>(".site-header");
  const listeners: (() => void)[] = [];
  let scene: JourneyScene | undefined;
  let disposed = false,
    failed = false,
    hidden = document.hidden,
    blocked = false,
    paused = options.paused,
    auto = options.auto,
    hovered = false,
    frame = 0,
    timer = 0,
    loader: number | undefined;
  let target = options.initial,
    position = target,
    selected = modulo(target),
    settled = Number.NaN,
    width = 0,
    height = 0,
    dpr = 0,
    headerHeight = 113,
    clock = 0,
    lastTime = performance.now(),
    autoAt = lastTime + 3200,
    revealed = false,
    signature = "";
  let tween: {
    from: number;
    to: number;
    start: number;
    duration: number;
  } | null = null;
  let drag: {
    x: number;
    y: number;
    from: number;
    last: number;
    lastPosition: number;
    velocity: number;
    pointer: number;
    captured: boolean;
  } | null = null;
  const listen = (
    node: EventTarget,
    type: string,
    handler: EventListener,
    settings?: AddEventListenerOptions,
  ) => {
    node.addEventListener(type, handler, settings);
    listeners.push(() => node.removeEventListener(type, handler, settings));
  };
  function invalidate() {
    if (!frame && !disposed && !hidden) frame = requestAnimationFrame(tick);
  }
  function interact() {
    autoAt = performance.now() + 3200;
    clearTimeout(timer);
    timer = 0;
    invalidate();
  }
  function choose(to: number) {
    interact();
    target = Math.round(to);
    selected = modulo(target);
    options.onSelect(selected);
    tween = paused
      ? null
      : {
          from: position,
          to: target,
          start: performance.now(),
          duration:
            650 +
            Math.min(400, Math.max(0, Math.abs(target - position) - 1) * 160),
        };
    if (paused) position = target;
    signature = "";
    invalidate();
  }
  function resize() {
    headerHeight = header?.getBoundingClientRect().height || 113;
    root.style.setProperty("--carousel-header", `${headerHeight}px`);
    const w = root.clientWidth,
      h = root.clientHeight;
    const unit =
      w < 820 ? Math.min(w / 560, h / 980) : Math.min(w / 1440, h / 900);
    root.style.setProperty("--carousel-u", `${unit}px`);
    if (w === width && h === height && devicePixelRatio === dpr) return;
    width = w;
    height = h;
    dpr = devicePixelRatio;
    if (scene) {
      // Resizing clears a WebGL drawing buffer; keep the SVGs visible until redrawn.
      options.onState("loading");
      scene.resize(width, height);
    }
    revealed = false;
    signature = "";
    invalidate();
  }
  function pose(index: number): ComponentPose {
    const phone = width < 820;
    const unit = phone
      ? Math.min(width / 560, height / 980)
      : Math.min(width / 1440, height / 900);
    const k = index - position,
      distance = Math.min(4, Math.abs(k));
    const low = Math.floor(distance),
      high = Math.min(4, low + 1);
    const values = slots[low].map((value, i) =>
      mix(value, slots[high][i], distance - low),
    );
    const bob = paused
      ? 0
      : Math.sin((clock / 4600) * Math.PI * 2 + index * 1.37);
    return {
      x: width / 2 + Math.sign(k) * values[0] * unit * (phone ? 1.02 : 1),
      y:
        height * (phone ? 0.36 : 0.4) +
        values[1] * unit -
        (paused ? 0 : (bob * 0.5 + 0.5) * 9 * unit),
      h: values[2] * unit,
      rx: 0,
      ry: Math.sign(k) * values[4],
      rz: Math.sign(k) * values[3] + bob * 0.4,
      z: -Math.abs(k) * 34 * unit,
      op: 1 - clamp((Math.abs(k) - 3.3) / 0.6),
      sx: 1,
      sy: 1,
      shadow: 1,
    };
  }
  function tick(now: number) {
    frame = 0;
    if (disposed || hidden) return;
    const rect = root.getBoundingClientRect();
    const visible = rect.bottom > headerHeight && rect.top < innerHeight;
    root.dataset.suspended = String(blocked || !visible);
    const ratio = clamp(
      (Math.min(innerHeight, rect.bottom) - Math.max(headerHeight, rect.top)) /
        height,
    );
    if (!paused && !blocked && visible)
      clock += Math.min(64, Math.max(0, now - lastTime));
    lastTime = now;
    if (tween && !blocked) {
      const t = clamp((now - tween.start) / tween.duration);
      position = mix(tween.from, tween.to, glide(t));
      if (t === 1) {
        position = target;
        tween = null;
        autoAt = now + 3200;
      }
    }
    const focused =
      root.contains(document.activeElement) &&
      !!(document.activeElement as Element)?.closest(
        "[data-carousel-keys],.material-carousel-actions,.material-carousel-playback",
      );
    if (
      auto &&
      !paused &&
      !blocked &&
      !drag &&
      !tween &&
      !hovered &&
      !focused &&
      ratio >= 0.6 &&
      (failed || settled === target) &&
      now >= autoAt
    )
      choose(target + 1);
    const items: RenderItem[] = [];
    for (let i = -4; i <= 4; i++) {
      const index = Math.floor(position) + i;
      if (index === target) continue;
      const state = pose(index);
      if (state.op > 0.01)
        items.push({ slot: index, type: modulo(index), pose: state });
    }
    const selectedPose = pose(target);
    canvas.dataset.position = position.toFixed(4);
    canvas.dataset.selected = String(selected);
    const nextSignature = JSON.stringify([
      width,
      height,
      selected,
      selectedPose,
      items,
    ]);
    let pending = false;
    if (scene && visible && nextSignature !== signature) {
      pending =
        scene.render(items, {
          slot: target,
          type: selected,
          pose: selectedPose,
        }) === false;
      if (!pending) {
        signature = nextSignature;
        canvas.dataset.paused = String(paused);
        canvas.dataset.renderedPosition = position.toFixed(4);
        canvas.dataset.renderedSelected = String(selected);
        if (!revealed) {
          revealed = true;
          options.onState("ready");
        }
        if (!tween && settled !== target) {
          settled = target;
          // A slow first frame must not consume the visitor's reading interval.
          autoAt = performance.now() + 3200;
        }
      }
    }
    if (
      (!paused && !blocked && visible && scene) ||
      (tween && !blocked && visible) ||
      pending
    ) {
      invalidate();
    } else if (
      auto &&
      !paused &&
      !blocked &&
      !hovered &&
      !focused &&
      ratio >= 0.6 &&
      failed
    ) {
      clearTimeout(timer);
      timer = window.setTimeout(invalidate, Math.max(120, autoAt - now));
    }
  }
  function syncBlockers() {
    const next = !!document.querySelector(
      "dialog[open],.site-header [aria-expanded='true']",
    );
    if (next !== blocked) {
      blocked = next;
      if (blocked) {
        position = target;
        tween = null;
        clearTimeout(timer);
        timer = 0;
      } else interact();
      invalidate();
    }
    root.dataset.suspended = String(blocked || hidden);
  }
  const blockers = new MutationObserver(syncBlockers);
  blockers.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ["open", "aria-expanded"],
  });
  syncBlockers();
  root
    .querySelectorAll(
      "[data-carousel-keys],.material-carousel-actions,.material-carousel-playback",
    )
    .forEach((node) => {
      listen(node, "pointerenter", () => {
        hovered = true;
        interact();
      });
      listen(node, "pointerleave", () => {
        hovered = false;
        interact();
      });
    });
  listen(root, "focusin", interact);
  listen(root, "focusout", interact);
  listen(arc, "pointerdown", ((event: PointerEvent) => {
    if (event.button !== 0 || paused || blocked) return;
    interact();
    drag = {
      x: event.clientX,
      y: event.clientY,
      from: position,
      last: event.timeStamp,
      lastPosition: position,
      velocity: 0,
      pointer: event.pointerId,
      captured: false,
    };
  }) as EventListener);
  listen(arc, "pointermove", ((event: PointerEvent) => {
    if (!drag) return;
    const dx = event.clientX - drag.x,
      dy = event.clientY - drag.y;
    if (!drag.captured && Math.abs(dy) > Math.max(8, Math.abs(dx))) {
      drag = null;
      return;
    }
    if (!drag.captured && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
      drag.captured = true;
      tween = null;
      arc.setPointerCapture(event.pointerId);
      arc.dataset.dragging = "true";
    }
    if (!drag.captured) return;
    const unit =
      width < 820
        ? Math.min(width / 560, height / 980)
        : Math.min(width / 1440, height / 900);
    position = drag.from - dx / (278 * unit * (width < 820 ? 1.02 : 1));
    const velocity =
      (position - drag.lastPosition) / Math.max(1, event.timeStamp - drag.last);
    drag.velocity = mix(drag.velocity, velocity, 0.4);
    drag.last = event.timeStamp;
    drag.lastPosition = position;
    interact();
  }) as EventListener);
  const release = ((event: PointerEvent) => {
    if (!drag) return;
    const start = drag;
    drag = null;
    delete arc.dataset.dragging;
    if (arc.hasPointerCapture(start.pointer))
      arc.releasePointerCapture(start.pointer);
    if (start.captured)
      choose(
        Math.round(
          position +
            (event.type === "pointercancel"
              ? 0
              : clamp(start.velocity * 220, -2, 2)),
        ),
      );
    else if (event.type !== "pointercancel") {
      const rect = root.getBoundingClientRect();
      const hit = scene?.hit(
        event.clientX - rect.left,
        event.clientY - rect.top,
      );
      if (hit !== null && hit !== undefined) choose(hit);
    }
    interact();
  }) as EventListener;
  listen(arc, "pointerup", release);
  listen(arc, "pointercancel", release);
  listen(arc, "lostpointercapture", () => {
    drag = null;
    delete arc.dataset.dragging;
  });
  listen(
    window,
    "scroll",
    (() => {
      if (!paused) invalidate();
    }) as EventListener,
    { passive: true },
  );
  listen(window, "resize", resize);
  listen(document, "visibilitychange", () => {
    hidden = document.hidden;
    root.dataset.suspended = String(blocked || hidden);
    clearTimeout(timer);
    timer = 0;
    if (hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      lastTime = performance.now();
      if (tween) tween = { ...tween, from: position, start: lastTime };
      interact();
    }
  });
  const resizes = new ResizeObserver(resize);
  resizes.observe(root);
  if (header) resizes.observe(header);
  function unavailable() {
    if (disposed) return;
    failed = true;
    scene?.dispose();
    scene = undefined;
    options.onState("unavailable");
    invalidate();
  }
  function load() {
    if (disposed) return;
    options.onState("loading");
    import("@/features/journey/journey-scene")
      .then(({ createJourneyScene }) => {
        if (disposed) return;
        try {
          scene = createJourneyScene(canvas, unavailable, 8);
          scene.resize(width, height);
          signature = "";
          invalidate();
        } catch {
          unavailable();
        }
      })
      .catch(unavailable);
  }
  resize();
  if ("requestIdleCallback" in window)
    loader = requestIdleCallback(load, { timeout: 700 });
  else load();
  return {
    select(index: number) {
      choose(target + (((index - modulo(target) + 4) % 3) - 1));
    },
    next(direction = 1) {
      choose(target + direction);
    },
    setAuto(value: boolean) {
      auto = value;
      interact();
    },
    setPaused(value: boolean) {
      if (paused === value) return;
      paused = value;
      if (paused) {
        position = target;
        tween = null;
      }
      if (drag && arc.hasPointerCapture(drag.pointer))
        arc.releasePointerCapture(drag.pointer);
      drag = null;
      delete arc.dataset.dragging;
      signature = "";
      interact();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      if (loader !== undefined) cancelIdleCallback(loader);
      blockers.disconnect();
      resizes.disconnect();
      listeners.forEach((remove) => remove());
      if (drag && arc.hasPointerCapture(drag.pointer))
        arc.releasePointerCapture(drag.pointer);
      delete arc.dataset.dragging;
      delete root.dataset.suspended;
      root.style.removeProperty("--carousel-u");
      root.style.removeProperty("--carousel-header");
      scene?.dispose();
    },
  };
}
