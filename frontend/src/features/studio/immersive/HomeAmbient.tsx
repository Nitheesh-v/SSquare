"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ThreeBackdrop = dynamic(() => import("./ThreeBackdrop"), {
  ssr: false,
  loading: () => null,
});

/**
 * Fixed, pointer-transparent atmosphere behind the whole homepage:
 * animated blueprint grid, drifting glows, one slow sweep, static grain and
 * the optional WebGL orrery. Every CSS animation is switched off by
 * `data-motion-paused` / `prefers-reduced-motion`, and WebGL is never created
 * for those users (or where a context cannot be acquired).
 */
export function HomeAmbient({
  paused,
  reduced,
}: {
  paused: boolean;
  reduced: boolean;
}) {
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    if (paused || reduced) {
      setWebgl(false);
      return;
    }
    try {
      const probe = document.createElement("canvas");
      const gl =
        probe.getContext("webgl2") ||
        probe.getContext("webgl") ||
        probe.getContext("experimental-webgl");
      setWebgl(Boolean(gl));
    } catch {
      setWebgl(false);
    }
  }, [paused, reduced]);

  return (
    <div
      className="ar-ambient"
      data-testid="ar-ambient"
      data-webgl={webgl}
      aria-hidden="true"
    >
      <div className="ar-ambient-grid" />
      <div className="ar-ambient-glow ar-glow-a" />
      <div className="ar-ambient-glow ar-glow-b" />
      <div className="ar-ambient-orbit" />
      <div className="ar-ambient-sweep" />
      {webgl && !paused && !reduced ? <ThreeBackdrop /> : null}
      <div className="ar-ambient-vignette" />
      <div className="ar-grain" />
    </div>
  );
}
