"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";

// One browser subscription for every motion surface. A live preference change
// must stop the hero, photo planes and aluminium story together, not piecemeal.
let motionQuery: MediaQueryList | undefined;
const motionListeners = new Set<() => void>();
const getMotionQuery = () =>
  (motionQuery ??= window.matchMedia("(prefers-reduced-motion: reduce)"));
const notifyMotionChange = () =>
  motionListeners.forEach((listener) => listener());
const subscribeMotion = (listener: () => void) => {
  const query = getMotionQuery();
  if (!motionListeners.size)
    query.addEventListener("change", notifyMotionChange);
  motionListeners.add(listener);
  return () => {
    motionListeners.delete(listener);
    if (!motionListeners.size)
      query.removeEventListener("change", notifyMotionChange);
  };
};
const motionSnapshot = () => getMotionQuery().matches;
const serverMotionSnapshot = () => true;

/** Static during SSR; a single shared snapshot keeps all live motion in sync. */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    motionSnapshot,
    serverMotionSnapshot,
  );
}

/**
 * One shared, rAF-throttled visibility sweep for every `Reveal` on the page.
 *
 * IntersectionObserver is the primary trigger, but it can be starved on a page
 * that is already running a render loop, and a block that never reports its
 * entry would stay at its resting opacity — invisible content, not a missing
 * animation. This fallback measures on real scroll/resize instead, so the
 * reveal can only ever be late, never absent.
 */
const revealCheckers = new Set<() => void>();
let revealFrame = 0;
let revealListening = false;

const runRevealChecks = () => {
  revealFrame = 0;
  for (const check of [...revealCheckers]) check();
};

const requestRevealChecks = () => {
  if (!revealFrame) revealFrame = requestAnimationFrame(runRevealChecks);
};

function subscribeReveal(check: () => void) {
  revealCheckers.add(check);
  if (!revealListening) {
    revealListening = true;
    window.addEventListener("scroll", requestRevealChecks, { passive: true });
    window.addEventListener("resize", requestRevealChecks);
  }
  return () => {
    revealCheckers.delete(check);
    if (!revealCheckers.size && revealListening) {
      revealListening = false;
      window.removeEventListener("scroll", requestRevealChecks);
      window.removeEventListener("resize", requestRevealChecks);
      if (revealFrame) cancelAnimationFrame(revealFrame);
      revealFrame = 0;
    }
  };
}

/** Direction a block travels in from, as it enters the viewport. */
export type RevealFrom = "left" | "right" | "up" | "down";

/**
 * The off-screen resting transform for each direction. Values are CSS lengths,
 * so a phone can travel less than a desktop without any JS measurement.
 */
const REVEAL_START: Record<RevealFrom, string> = {
  left: "translate3d(calc(-1 * var(--reveal-x, 64px)), 0, 0)",
  right: "translate3d(var(--reveal-x, 64px), 0, 0)",
  up: "translate3d(0, 26px, 0)",
  down: "translate3d(0, -26px, 0)",
};

/**
 * Content is always visible/accessible. Motion is enhancement, never a gate:
 * without IntersectionObserver, with reduced motion, or while paused, the
 * children simply render in place.
 *
 * The reveal is a CSS transition driven by one `is-revealed` class, not a
 * Web Animation. An IntersectionObserver in a busy page can fire while the
 * frame loop is starved, and a WAAPI animation started in that moment would
 * sit on its first frame — the transform below is applied by the style engine
 * either way, so it always lands.
 *
 * `from` decides which way the block travels in, so a two-column section can
 * arrive from the left and the right at once.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  paused = false,
  from = "up",
  distance,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  paused?: boolean;
  from?: RevealFrom;
  /** Override the horizontal travel distance in pixels. */
  distance?: number;
}) {
  const element = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const [motionReady, setMotionReady] = useState(false);

  useEffect(() => {
    const node = element.current;
    if (!node) return;
    // Nothing to do: the children render in their resting position.
    if (reduced || paused || !("IntersectionObserver" in window)) {
      setMotionReady(false);
      return;
    }
    setMotionReady(true);
    if (revealed) return;
    // Reveal as soon as any part of the block reaches the lower part of the
    // viewport, and also when it has already travelled above it — a fast
    // scroll can carry a block past between frames, and it must not keep its
    // resting opacity for good.
    const check = () => {
      const rect = node.getBoundingClientRect();
      const reached = rect.top < window.innerHeight * 0.92;
      const passed = rect.bottom <= 0;
      if (reached || passed) {
        setRevealed(true);
        return true;
      }
      return false;
    };

    // A block that is already on screen (a reload part-way down the page, or
    // a jump to an anchor) must not wait for a scroll it may never get.
    if (check()) return;

    const unsubscribe = subscribeReveal(check);
    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting || entry.boundingClientRect.bottom <= 0) {
                setRevealed(true);
              }
            },
            // A low threshold means tall sections still animate as they come up.
            { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
          )
        : null;
    observer?.observe(node);
    return () => {
      unsubscribe();
      observer?.disconnect();
    };
  }, [reduced, paused, revealed]);

  const style = {
    "--reveal-from": REVEAL_START[from],
    "--reveal-delay": `${Math.min(delay, 220)}ms`,
    ...(distance === undefined ? {} : { "--reveal-x": `${distance}px` }),
  } as CSSProperties;

  return (
    <div
      ref={element}
      className={`${className} ${revealed ? "is-revealed" : ""}`.trim()}
      // `motion` is only advertised once the observer is actually driving it,
      // so a reduced-motion or no-JS reader never sees a hidden block.
      data-reveal-motion={reduced || paused || !motionReady ? undefined : "on"}
      data-reveal-from={from}
      style={style}
    >
      {children}
    </div>
  );
}

/** Small image-only parallax; no smooth-scroll replacement or scroll interception. */
export function ParallaxVisual({
  children,
  className = "",
  depth = false,
  paused = false,
}: {
  children: ReactNode;
  className?: string;
  /** Scroll-driven perspective for material photography, never the link or its label. */
  depth?: boolean;
  paused?: boolean;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || paused) {
      // GSAP can restore a computed scale snapshot after React removes the
      // motion class. Clear that snapshot as well when the preference changes.
      inner.current?.style.removeProperty("transform");
      inner.current?.style.removeProperty("transform-origin");
      return;
    }
    if (!outer.current) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
          ([{ gsap }, { ScrollTrigger }]) => {
            if (cancelled || !outer.current || !inner.current) return;
            gsap.registerPlugin(ScrollTrigger);
            const ctx = gsap.context(() => {
              const mobile = window.matchMedia("(max-width: 767px)").matches;
              const tilt = depth ? (mobile ? 4 : 8) : 0;
              gsap.fromTo(
                inner.current,
                {
                  yPercent: depth ? -7 : -4,
                  rotationX: tilt * 0.7,
                  rotationY: -tilt,
                  transformPerspective: depth ? 950 : 0,
                },
                {
                  yPercent: depth ? 7 : 4,
                  rotationX: -tilt * 0.7,
                  rotationY: tilt,
                  force3D: true,
                  ease: "none",
                  scrollTrigger: {
                    trigger: outer.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0.6,
                  },
                },
              );
            }, outer);
            dispose = () => ctx.revert();
          },
        );
      },
      { rootMargin: "300px" },
    );
    observer.observe(outer.current);
    return () => {
      cancelled = true;
      observer.disconnect();
      dispose?.();
    };
  }, [reduced, depth, paused]);
  return (
    <div
      ref={outer}
      className={`relative overflow-hidden ${className}`}
      data-depth-image={depth || undefined}
    >
      <div
        ref={inner}
        className={`h-full w-full ${reduced || paused ? "" : depth ? "scale-[1.22]" : "scale-[1.10]"}`}
      >
        {children}
      </div>
    </div>
  );
}
