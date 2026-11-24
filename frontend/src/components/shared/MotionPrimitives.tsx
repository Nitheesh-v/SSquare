"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Default to still content during SSR and before the browser preference is known. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/** Content is always visible/accessible. Motion is enhancement, never a gate. */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const element = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const node = element.current;
    if (!node || reduced || !("IntersectionObserver" in window)) return;
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
  }, [reduced, delay]);
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
}: {
  children: ReactNode;
  className?: string;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !outer.current) return;
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
              gsap.fromTo(
                inner.current,
                { yPercent: -4 },
                {
                  yPercent: 4,
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
  }, [reduced]);
  return (
    <div ref={outer} className={`relative overflow-hidden ${className}`}>
      <div
        ref={inner}
        className={`h-full w-full ${reduced ? "" : "scale-[1.10]"}`}
      >
        {children}
      </div>
    </div>
  );
}
