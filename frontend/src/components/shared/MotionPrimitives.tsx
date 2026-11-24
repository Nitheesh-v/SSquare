"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";

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

/** Content is always visible/accessible. Motion is enhancement, never a gate. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  paused = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  paused?: boolean;
}) {
  const element = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const node = element.current;
    if (!node || reduced || paused || !("IntersectionObserver" in window))
      return;
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        animation = node.animate(
          [
            { opacity: 0.35, transform: "translateY(22px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration: 650,
            delay: Math.min(delay, 180),
            easing: "cubic-bezier(.22,1,.36,1)",
          },
        );
        observer.disconnect();
      },
      { threshold: 0.08 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      animation?.cancel();
    };
  }, [reduced, delay, paused]);
  return (
    <div ref={element} className={className}>
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
