"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  MessageSquare,
  Pause,
  Play,
  Rotate3D,
} from "lucide-react";
import { useQuoteModal } from "@/hooks";
import { COMPANY_INFO } from "@/lib/company-data";

// Dynamically import — no SSR (Three.js requires browser APIs)
const ThreeEngineeringScene = dynamic(
  () =>
    import("@/components/ThreeEngineeringScene").then(
      (m) => m.ThreeEngineeringScene,
    ),
  { ssr: false, loading: () => null },
);

// ── Chapter definitions (5 scroll chapters × ~100svh each) ───────────────────
const CHAPTERS = [
  {
    id: "intro",
    num: "01",
    kicker: "MULTI-MATERIAL OEM ASSEMBLY",
    headline: "Your Trusted\nManufacturing\nPartner",
    body: "Three material disciplines — rubber, steel, aluminium — from one precision manufacturer in Coimbatore, India. Custom built, never off the shelf.",
    highlight: null,
    cta: true,
  },
  {
    id: "aluminium",
    num: "02",
    kicker: "5-AXIS CNC MACHINING",
    headline: "6061-T6 Aluminium\nFinned Housing",
    body: "Brushed anodized cap with 18 radial cooling fins, 8-bolt flange pattern, and cyan accent rings. Metalness 0.84 · Roughness 0.23.",
    highlight: "upper-housing",
    cta: false,
  },
  {
    id: "steel",
    num: "03",
    kicker: "HARDENED GEAR TRAIN",
    headline: "EN24 Planetary\nGear System",
    body: "16-tooth sun gear meshing 4× 12-tooth planet pinions. Exact 16:12 tooth ratio. 36 HRC through-hardened · ISO 1328 Grade 7.",
    highlight: "gear-train",
    cta: false,
  },
  {
    id: "rubber",
    num: "04",
    kicker: "ELASTOMER PRECISION",
    headline: "EPDM Spider\nCoupler Assembly",
    body: "6-lobe bezier profile with dual-lip hydraulic seals and O-rings. Compression-molded elastomer · 70 Shore A · ISO 3302 E2.",
    highlight: "spider-coupler",
    cta: false,
  },
  {
    id: "complete",
    num: "05",
    kicker: "COMPLETE OEM SOLUTION",
    headline: "SSQ-9400\nFull Assembly",
    body: "From your drawing or sample to the finished part. All three material disciplines, coordinated and delivered to your specification.",
    highlight: null,
    cta: true,
  },
] as const;

type ChapterIndex = 0 | 1 | 2 | 3 | 4;

interface Props {
  paused: boolean;
  onPause: () => void;
}

export function SSQ3DScrollHero({ paused, onPause }: Props) {
  const scrollSectionRef = useRef<HTMLDivElement>(null);
  const { openQuoteModal } = useQuoteModal();
  const [chapter, setChapter] = useState<ChapterIndex>(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [webGLReady, setWebGLReady] = useState(false);

  // Check WebGL support on mount
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") || canvas.getContext("webgl");
      setWebGLReady(!!gl);
    } catch {
      setWebGLReady(false);
    }
  }, []);

  // Scroll tracking — only updates chapter (5 discrete values)
  useEffect(() => {
    const onScroll = () => {
      const section = scrollSectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const totalScrollable = section.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) return;
      const p = Math.max(0, Math.min(1, -rect.top / totalScrollable));
      setScrollProgress(p);
      const idx = Math.min(
        4,
        Math.floor(p * CHAPTERS.length),
      ) as ChapterIndex;
      setChapter(idx);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // init
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ch = CHAPTERS[chapter];
  const progressPct = Math.round(scrollProgress * 100);

  return (
    <div
      ref={scrollSectionRef}
      className="ssq-scroll-section"
      data-webgl={webGLReady}
    >
      {/* ── Sticky viewport ─────────────────────────────────────────── */}
      <div className="ssq-sticky-viewport">
        {/* 3D canvas (full background) */}
        {webGLReady && (
          <ThreeEngineeringScene
            scrollSectionRef={scrollSectionRef as React.RefObject<HTMLDivElement>}
            paused={paused}
            activeChapterPart={ch.highlight ?? undefined}
          />
        )}

        {/* Background gradient overlay */}
        <div className="ssq-bg-overlay" aria-hidden="true" />

        {/* Blueprint grid */}
        <div className="ssq-bg-grid" aria-hidden="true" />

        {/* Chapter text HUD (left column) */}
        <div className="ssq-hud" role="presentation">
          <div className="ssq-hud-inner">
            {/* Company badge */}
            <div className="ssq-badge">
              <span className="ssq-badge-dot" aria-hidden="true" />
              S SQUARE · COIMBATORE, INDIA
            </div>

            {CHAPTERS.map((c, i) => (
              <div
                key={c.id}
                className="ssq-chapter"
                data-active={i === chapter}
                aria-hidden={i !== chapter}
              >
                <p className="ssq-chapter-num">
                  {c.num} / {c.kicker}
                </p>
                <h1 className="ssq-chapter-headline">
                  {c.headline.split("\n").map((line, j) => (
                    <span key={j} className="ssq-headline-line">
                      {line}
                      {j < c.headline.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </h1>
                <p className="ssq-chapter-body">{c.body}</p>
                {c.cta && (
                  <div className="ssq-chapter-ctas">
                    <button
                      type="button"
                      className="ssq-btn-primary"
                      onClick={() =>
                        openQuoteModal({ division: "Rubber Products, Steel Products, Aluminium Products" })
                      }
                      id={`hero-quote-btn-${c.id}`}
                    >
                      Request a Quote <ArrowRight size={15} />
                    </button>
                    <Link
                      href="/products"
                      className="ssq-btn-ghost"
                      id={`hero-catalog-btn-${c.id}`}
                    >
                      Explore Catalog <ArrowUpRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            ))}

            {/* Contact strip */}
            <div className="ssq-hud-contact">
              <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="ssq-contact-link">
                {COMPANY_INFO.phone}
              </a>
              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ssq-contact-wa"
              >
                <MessageSquare size={12} /> WhatsApp <ArrowUpRight size={11} />
              </a>
            </div>
          </div>
        </div>

        {/* Right-side HUD: scroll progress + chapters */}
        <div className="ssq-side-hud" aria-label="Scroll progress">
          {/* Vertical progress bar */}
          <div className="ssq-progress-track" aria-hidden="true">
            <div
              className="ssq-progress-fill"
              style={{ height: `${progressPct}%` }}
            />
          </div>

          {/* Chapter dots */}
          <div className="ssq-chapter-dots" role="list" aria-label="Sections">
            {CHAPTERS.map((c, i) => (
              <div
                key={c.id}
                className="ssq-chapter-dot"
                data-active={i === chapter}
                role="listitem"
                aria-label={c.kicker}
                title={c.kicker}
              />
            ))}
          </div>
        </div>

        {/* Bottom HUD: explode meter + controls */}
        <div className="ssq-bottom-hud" aria-label="Assembly controls">
          {/* Explode progress meter */}
          <div className="ssq-explode-meter" aria-hidden="true">
            <span className="ssq-explode-label">EXPLODE</span>
            <div className="ssq-explode-track">
              <div
                className="ssq-explode-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="ssq-explode-pct">{progressPct}%</span>
          </div>

          {/* Play/pause + 3D hint */}
          <div className="ssq-bottom-controls">
            <button
              type="button"
              className="ssq-pause-btn"
              onClick={onPause}
              aria-label={paused ? "Resume 3D motion" : "Pause 3D motion"}
              aria-pressed={paused}
              id="hero-3d-pause-btn"
            >
              {paused ? <Play size={12} /> : <Pause size={12} />}
              {paused ? "RESUME" : "PAUSE"}
            </button>
            <span className="ssq-hint">
              <Rotate3D size={13} /> DRAG TO ORBIT
            </span>
            <Link
              href="/material-experience"
              className="ssq-experience-link"
              id="hero-material-experience-link"
            >
              <Rotate3D size={12} /> Full 3D Journey <ArrowUpRight size={11} />
            </Link>
          </div>
        </div>

        {/* Scroll cue (chapter 0 only) */}
        {chapter === 0 && (
          <div className="ssq-scroll-cue" aria-hidden="true">
            <span>SCROLL</span>
            <div className="ssq-scroll-arrow" />
          </div>
        )}
      </div>
    </div>
  );
}
