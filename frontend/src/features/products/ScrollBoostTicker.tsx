"use client";

import React, { useEffect, useRef } from "react";

const WORDMARKS = [
  { text: "VITON FKM", className: "font-bold tracking-[-0.02em] text-2xl sm:text-[28px]" },
  { text: "SS 316L CNC", className: "font-extrabold tracking-[0.04em] text-xl sm:text-[25px]" },
  { text: "6061-T6 AL", className: "font-bold tracking-[0.08em] text-lg sm:text-[23px]" },
  { text: "SILICONE SEALS", className: "font-semibold tracking-[0.14em] text-lg sm:text-[22px]" },
  { text: "DIE MOLDS", className: "font-normal tracking-[0.38em] text-lg sm:text-[24px]" },
  { text: "HNBR&EPDM", className: "font-semibold tracking-[-0.03em] text-2xl sm:text-[27px]" },
  { text: "TIG WELDING", className: "font-bold tracking-[0.05em] text-xl sm:text-[25px]" },
  { text: "BONDED SEALS", className: "font-extrabold tracking-[-0.01em] text-2xl sm:text-[27px]" },
];

export function ScrollBoostTicker() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const firstListRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let visible = false;
    let rafId = 0;
    let x = 0;
    let boost = 0;
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();

    const observer = new IntersectionObserver(
      (entries) => {
        visible = Boolean(entries[0]?.isIntersecting);
        if (visible) lastTime = performance.now();
      },
      { rootMargin: "100px" }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    function onScroll() {
      const currentY = window.scrollY;
      const delta = Math.abs(currentY - lastScrollY);
      lastScrollY = currentY;
      boost = Math.min(1400, boost + delta * 2.2);
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    function tick(now: number) {
      rafId = requestAnimationFrame(tick);
      if (!visible || !trackRef.current || !firstListRef.current) return;

      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const isPhone = window.innerWidth <= 820;
      const scale = (window.innerWidth / 1536) * (isPhone ? 2.4 : 1);
      x -= (70 + boost) * dt * scale;
      boost *= Math.pow(0.04, dt);

      const listWidth = firstListRef.current.offsetWidth;
      if (listWidth > 0 && -x >= listWidth) {
        x += listWidth;
      }

      trackRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-[#f4f7fb] pt-14 pb-10 sm:pt-18 sm:pb-12 overflow-hidden"
    >
      <p className="px-6 text-center text-sm sm:text-lg font-medium tracking-[0.03em] text-[#0f141e]/45">
        Trusted by 50+ industrial, automotive &amp; OEM engineering teams
      </p>

      <div
        className="mt-8 sm:mt-11 w-full overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent 0%, #000 5%, #000 95%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, #000 5%, #000 95%, transparent 100%)",
        }}
      >
        <div
          ref={trackRef}
          className="flex w-max items-center will-change-transform"
        >
          {[0, 1].map((cloneIdx) => (
            <ul
              key={cloneIdx}
              ref={cloneIdx === 0 ? firstListRef : undefined}
              aria-hidden={cloneIdx === 1 ? "true" : undefined}
              className="flex items-center gap-12 sm:gap-20 pr-12 sm:pr-20 text-[#0d1324] whitespace-nowrap select-none"
            >
              {WORDMARKS.map((item) => (
                <li
                  key={`${cloneIdx}-${item.text}`}
                  className={`leading-none ${item.className}`}
                >
                  {item.text}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
