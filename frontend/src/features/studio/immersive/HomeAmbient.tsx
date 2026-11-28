"use client";

import { useEffect, useRef } from "react";

type ScrollPhase = "aperture" | "materials" | "blueprint" | "services" | "dispatch";

const PHASE_MARKERS: { id: string; phase: ScrollPhase }[] = [
  { id: "who-we-are", phase: "materials" },
  { id: "material-divisions", phase: "materials" },
  { id: "what-we-do", phase: "blueprint" },
  { id: "our-services", phase: "services" },
  { id: "quick-service", phase: "dispatch" },
];

const PHASE_SETTINGS: Record<
  ScrollPhase,
  { color: string; grid: number; orbit: number; sweep: number }
> = {
  aperture: { color: "#c9803f", grid: 28, orbit: 60, sweep: 11 },
  materials: { color: "#d1724f", grid: 21, orbit: 42, sweep: 8 },
  blueprint: { color: "#e9a463", grid: 15, orbit: 30, sweep: 6 },
  services: { color: "#9be8d8", grid: 11, orbit: 22, sweep: 4.5 },
  dispatch: { color: "#f0b45a", grid: 8, orbit: 16, sweep: 3.2 },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Fixed, pointer-transparent atmosphere behind the whole homepage: the
 * blueprint grid, glows, sweep and orbit all change their colour, geometry and
 * tempo with document scroll progress. A single passive scroll callback writes
 * CSS variables. The optional Three.js orrery was removed at the user's
 * request, so the homepage now runs no WebGL at all. Reduced / paused motion
 * stays still.
 */
export function HomeAmbient({
  paused,
  reduced,
}: {
  paused: boolean;
  reduced: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (paused || reduced) {
      root.dataset.scrollPhase = "still";
      root.dataset.scrollProgress = "0";
      root.style.setProperty("--ar-phase-color", "#c9803f");
      return;
    }

    let frame = 0;
    let lastPhase = "";

    const update = () => {
      frame = 0;
      if (document.hidden) return;
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const progress = clamp(window.scrollY / max, 0, 1);
      const focusLine = window.innerHeight * 0.44;
      let phase: ScrollPhase = "aperture";
      for (const marker of PHASE_MARKERS) {
        const section = document.getElementById(marker.id);
        if (section && section.getBoundingClientRect().top < focusLine)
          phase = marker.phase;
      }
      const settings = PHASE_SETTINGS[phase];

      root.dataset.scrollPhase = phase;
      root.dataset.scrollProgress = progress.toFixed(3);
      root.style.setProperty("--ar-scroll-p", progress.toFixed(3));
      root.style.setProperty("--ar-phase-color", settings.color);
      root.style.setProperty("--ar-grid-size", `${68 + progress * 26}px`);
      root.style.setProperty("--ar-grid-rot", `${12 + progress * 36}deg`);
      root.style.setProperty("--ar-grid-shift", `${-progress * 72}px`);
      root.style.setProperty("--ar-glow-shift", `${progress * 18}vw`);
      root.style.setProperty("--ar-grid-speed", `${settings.grid}s`);
      root.style.setProperty("--ar-orbit-speed", `${settings.orbit}s`);
      root.style.setProperty("--ar-sweep-speed", `${settings.sweep}s`);

      if (phase !== lastPhase) lastPhase = phase;
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    request();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, [paused, reduced]);

  return (
    <div
      ref={rootRef}
      className="ar-ambient"
      data-testid="ar-ambient"
      data-scroll-phase="aperture"
      data-scroll-progress="0"
      aria-hidden="true"
    >
      <div className="ar-ambient-grid" />
      <div className="ar-ambient-glow ar-glow-a" />
      <div className="ar-ambient-glow ar-glow-b" />
      <div className="ar-ambient-orbit" />
      <div className="ar-ambient-sweep" />
      <div className="ar-ambient-vignette" />
      <div className="ar-grain" />
    </div>
  );
}
