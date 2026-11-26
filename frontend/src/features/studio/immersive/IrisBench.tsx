"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

/**
 * "The Bench" — an animated 9-blade aperture iris adapted to the shop floor.
 * Blades are transformed (never re-rendered as React elements) and only while
 * the section is visible and the opening is changing. Reduced motion / pause
 * hold a static, fully readable iris and final stat values.
 */

const BLADES = 9;
const IR = 150;
const F_STOPS = ["1.4", "2", "2.8", "4", "5.6", "8", "11", "16"];

type BenchStat = {
  value: number | null;
  suffix: string;
  label: string;
  pad?: boolean;
  text?: string;
};

const STATS: BenchStat[] = [
  { value: 20, suffix: "+", label: "Years of engineering experience" },
  { value: 3, suffix: "", label: "Material disciplines", pad: true },
  { value: null, suffix: "", text: "COIMBATORE", label: "Manufacturing base · India" },
];

export function IrisBench({
  paused,
  reduced,
}: {
  paused: boolean;
  reduced: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const bladeRefs = useRef<(SVGGElement | null)[]>([]);
  const glowRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const statRefs = useRef<(HTMLElement | null)[]>([]);
  const [wide, setWide] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(false);
  hoveredRef.current = hovered;
  const still = paused || reduced;

  // One tiny RAF loop drives the iris; it stops as soon as it settles.
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    let raf = 0;
    let visible = false;
    let current = 0.42;
    let target = 0.42;
    let lastRot = Number.NaN;

    const applyBlades = (open: number) => {
      const ro = 14 + open * (IR - 30);
      const twist = (1 - open) * 34;
      for (let k = 0; k < BLADES; k += 1) {
        const blade = bladeRefs.current[k];
        if (!blade) continue;
        const angle = (k / BLADES) * 360 + twist;
        blade.setAttribute(
          "transform",
          `translate(200 200) rotate(${angle.toFixed(2)}) translate(${ro.toFixed(2)} 0) rotate(${(-twist * 1.6).toFixed(2)})`,
        );
      }
      if (glowRef.current)
        glowRef.current.style.setProperty("--iris-glow", String(0.35 + open * 0.65));
      if (readoutRef.current)
        readoutRef.current.textContent = hoveredRef.current
          ? "f/1.4 · WIDE OPEN"
          : `f/${(2.8 + (1 - open) * 8).toFixed(1)} · HOVER TO OPEN`;
    };

    const onScroll = () => {
      if (!visible || still) return;
      const rect = node.getBoundingClientRect();
      const progress = Math.min(
        1,
        Math.max(0, (window.innerHeight * 0.75 - rect.top) / Math.max(1, rect.height)),
      );
      target = hoveredRef.current ? 1 : 0.18 + progress * 0.62;
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden || still) return;
      const delta = target - current;
      if (Math.abs(delta) < 0.0015) return;
      current += delta * 0.09;
      if (Math.abs(current - lastRot) < 0.002) return;
      lastRot = current;
      applyBlades(current);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) onScroll();
      },
      { threshold: [0, 0.1] },
    );
    observer.observe(node);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    applyBlades(still ? 0.55 : current);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [still]);

  // Hover opens the iris without restarting the RAF loop.
  useEffect(() => {
    if (!still) window.dispatchEvent(new Event("resize"));
  }, [hovered, still]);

  // Count-up stats, one-shot on entry, skipped for reduced / paused motion.
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const setFinal = () => {
      STATS.forEach((stat, i) => {
        const el = statRefs.current[i];
        if (!el || stat.value === null) return;
        el.textContent = `${stat.pad ? String(stat.value).padStart(2, "0") : stat.value}${stat.suffix}`;
      });
    };
    if (still) {
      setFinal();
      return;
    }
    let raf = 0;
    let start = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / 1600);
          const eased = 1 - Math.pow(1 - t, 3);
          STATS.forEach((stat, i) => {
            const el = statRefs.current[i];
            if (!el || stat.value === null) return;
            const value = Math.round(stat.value * eased);
            el.textContent = `${stat.pad ? String(value).padStart(2, "0") : value}${stat.suffix}`;
          });
          if (t < 1) raf = requestAnimationFrame(step);
          else setFinal();
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [still]);

  return (
    <div
      ref={root}
      className="ar-bench"
      data-wide={wide}
      onPointerEnter={() => {
        setHovered(true);
        setWide(true);
      }}
      onPointerLeave={() => {
        setHovered(false);
        setWide(false);
      }}
    >
      <div className="studio-shell ar-bench-grid">
        <div className="ar-bench-copy">
          <p className="ar-kicker">THE BENCH / 01</p>
          <h2>
            DRAWN.
            <br />
            MACHINED.
            <br />
            VERIFIED.
          </h2>
          <p className="ar-bench-lede">
            No component leaves our bench unexamined. Your drawing or sample
            sets the geometry, the grade and the finish; inspection scope and
            acceptance criteria are agreed with you during quotation.
          </p>
          <dl className="ar-bench-stats">
            {STATS.map((stat, i) => (
              <div key={stat.label}>
                <dt>{stat.label}</dt>
                <dd>
                  {stat.value === null ? (
                    <span>{stat.text}</span>
                  ) : (
                    <strong
                      ref={(node) => {
                        statRefs.current[i] = node;
                      }}
                    >
                      0{stat.suffix}
                    </strong>
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <div className="ar-bench-checks">
            {["Drawing or sample based", "Three material disciplines", "Coimbatore, India"].map(
              (item) => (
                <span key={item}>
                  <Check size={13} /> {item}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="ar-iris-wrap">
          <div ref={glowRef} className="ar-iris-glow" aria-hidden="true" />
          <svg
            className="ar-iris"
            viewBox="0 0 400 400"
            role="img"
            aria-label="Animated nine-blade aperture iris representing the inspection bench"
          >
            <defs>
              <clipPath id="ar-iris-clip">
                <circle cx="200" cy="200" r={IR} />
              </clipPath>
              <radialGradient id="ar-iris-core">
                <stop offset="0%" stopColor="#9fbcff" />
                <stop offset="45%" stopColor="#3d7bff" />
                <stop offset="100%" stopColor="#0a1430" />
              </radialGradient>
              <linearGradient id="ar-blade-a" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#23262e" />
                <stop offset="100%" stopColor="#0d0f13" />
              </linearGradient>
              <linearGradient id="ar-blade-b" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1a1d24" />
                <stop offset="100%" stopColor="#080a0d" />
              </linearGradient>
              <radialGradient id="ar-bezel">
                <stop offset="70%" stopColor="#171a20" />
                <stop offset="100%" stopColor="#2b2f37" />
              </radialGradient>
            </defs>

            {/* Outer knurled bezel: 48 ticks + f-stop numbers, drawn once. */}
            <circle cx="200" cy="200" r="188" fill="url(#ar-bezel)" />
            <circle
              cx="200"
              cy="200"
              r="188"
              fill="none"
              stroke="rgba(255,255,255,.14)"
              strokeWidth="1"
            />
            {Array.from({ length: 48 }, (_, i) => {
              const angle = (i / 48) * Math.PI * 2;
              const inner = i % 4 === 0 ? 170 : 178;
              return (
                <line
                  key={i}
                  x1={200 + Math.cos(angle) * inner}
                  y1={200 + Math.sin(angle) * inner}
                  x2={200 + Math.cos(angle) * 186}
                  y2={200 + Math.sin(angle) * 186}
                  stroke="rgba(238,240,243,.28)"
                  strokeWidth={i % 4 === 0 ? 1.4 : 0.8}
                />
              );
            })}
            {F_STOPS.map((stop, i) => {
              const angle = -Math.PI / 2 + (i / F_STOPS.length) * Math.PI * 1.6;
              return (
                <text
                  key={stop}
                  x={200 + Math.cos(angle) * 160}
                  y={200 + Math.sin(angle) * 160}
                  fill="rgba(122,164,255,.75)"
                  fontSize="11"
                  fontFamily="Barlow Condensed, Arial Narrow, sans-serif"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {stop}
                </text>
              );
            })}

            {/* Blue lit centre, then the nine blades clipped to the opening. */}
            <circle cx="200" cy="200" r={IR} fill="url(#ar-iris-core)" />
            <g clipPath="url(#ar-iris-clip)">
              {Array.from({ length: BLADES }, (_, k) => (
                <g
                  key={k}
                  ref={(node) => {
                    bladeRefs.current[k] = node;
                  }}
                >
                  <path
                    d="M0 -230 L260 -230 L260 230 L0 230 Z"
                    fill={k % 2 === 0 ? "url(#ar-blade-a)" : "url(#ar-blade-b)"}
                  />
                  <line
                    x1="0"
                    y1="-230"
                    x2="0"
                    y2="230"
                    stroke="rgba(255,255,255,.18)"
                    strokeWidth="1.5"
                  />
                </g>
              ))}
            </g>
            <circle
              cx="200"
              cy="200"
              r={IR}
              fill="none"
              stroke="rgba(122,164,255,.45)"
              strokeWidth="1.5"
            />
          </svg>
          <p className="ar-iris-readout">
            <span ref={readoutRef}>f/2.8 · HOVER TO OPEN</span>
            <span>9 BLADES / SCROLL REACTIVE</span>
          </p>
        </div>
      </div>
    </div>
  );
}
