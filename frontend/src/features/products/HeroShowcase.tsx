"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  MessageSquare,
  Pause,
  Play,
} from "lucide-react";
import { HERO_SLIDES, COMPANY_INFO } from "@/lib/company-data";
import { SmartProductImage } from "@/components/shared/SmartProductImage";
import { useReducedMotion } from "@/components/shared/MotionPrimitives";
import { HeroDepthBackdrop } from "./HeroDepthBackdrop";
import { useQuoteModal } from "@/hooks";

const TITLES = [
  <>
    Your drawing.
    <br />
    Our <span className="text-forge-400">precision.</span>
  </>,
  <>
    Flexible materials.
    <br />
    <span className="text-forge-400">Exacting form.</span>
  </>,
  <>
    Built for strength.
    <br />
    <span className="text-forge-400">Made to fit.</span>
  </>,
  <>
    Less weight.
    <br />
    <span className="text-forge-400">More possibility.</span>
  </>,
];
const LABELS = ["Overview", "Rubber", "Steel", "Aluminium"];
const SUBS = [
  "Built to your specification",
  "Molded & bonded components",
  "Custom steel & stainless",
  "6061 parts & die molds",
];

export function HeroShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const animated = !reduced && !paused;
  const root = useRef<HTMLElement>(null);
  const slide = HERO_SLIDES[active];
  const { openQuoteModal } = useQuoteModal();
  const href = active ? `/products/${slide.id}` : "/products";

  return (
    <section
      ref={root}
      className="hero-section hero-depth-section text-white"
      aria-label="Custom rubber, steel and aluminium manufacturing"
      data-motion={animated ? "scroll" : "still"}
    >
      <div className="hero-depth-stage" data-hero-stage>
        <HeroDepthBackdrop root={root} animated={animated} />
        <div className="shell hero-depth-content relative">
          <div className="hero-topline flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-b border-white/20 pb-4 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300">
            <span className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 bg-forge-400" />S SQUARE ENGINEERING
              SERVICES
            </span>
            <button
              type="button"
              disabled={reduced}
              aria-pressed={paused || reduced}
              onClick={() => setPaused(!paused)}
              className="inline-flex min-h-9 items-center gap-2 text-[9px] tracking-wide text-slate-200 hover:text-forge-300 disabled:cursor-default"
            >
              {paused || reduced ? <Play size={12} /> : <Pause size={12} />}
              {reduced
                ? "Reduced motion enabled"
                : paused
                  ? "Play background motion"
                  : "Pause background motion"}
            </button>
          </div>
          <div className="hero-main-grid">
            <div className="hero-copy relative z-10 min-w-0">
              <p className="eyebrow text-forge-300">
                CUSTOM COMPONENTS. CONSIDERED ENGINEERING.
              </p>
              <h1 className="hero-title mt-5 min-h-[2em] font-display font-semibold leading-[0.95] tracking-[-0.025em]">
                {TITLES[active]}
              </h1>
              <p className="mt-7 max-w-xl text-sm leading-[1.85] text-slate-200 sm:text-base">
                {active === 0
                  ? "Custom rubber, steel and aluminium components, manufactured to your drawing or sample. From our Coimbatore facility to your next application."
                  : slide.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="button-primary"
                  onClick={() =>
                    openQuoteModal(
                      active
                        ? { division: `${LABELS[active]} Products` }
                        : undefined,
                    )
                  }
                >
                  Request a Quote
                  <ArrowUpRight size={17} />
                </button>
                <Link
                  href={href}
                  className="button-dark-outline bg-carbon-950/30"
                >
                  Explore {active ? LABELS[active].toLowerCase() : "components"}
                  <ArrowRight size={16} />
                </Link>
              </div>
              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2.5 py-2 text-xs text-slate-200 transition-colors hover:text-forge-300"
              >
                <MessageSquare size={15} className="shrink-0 text-forge-400" />
                Have a sample or drawing? Let’s talk.
                <ArrowUpRight size={13} className="shrink-0" />
              </a>
            </div>
            <div className="hero-product-orbit">
              <div
                className="hero-depth-coordinate font-mono text-[9px] leading-loose tracking-widest text-slate-300"
                aria-hidden="true"
              >
                <span className="text-forge-300">FORM / MATERIAL / MOTION</span>
                <br />A DIFFERENT PERSPECTIVE ON PRECISION.
              </div>
              <div className="hero-photo-plane" data-testid="hero-photo-plane">
                <div className="hero-photo-backing" aria-hidden="true" />
                <figure className="relative m-0 border border-white/25 bg-carbon-900 shadow-2xl">
                  <div className="flex items-center justify-between gap-3 border-b border-white/15 bg-carbon-950 px-3.5 py-2.5 font-mono text-[8px] uppercase tracking-wider text-slate-300">
                    <span>IN FOCUS / 0{active + 1}</span>
                    <span className="text-forge-300">
                      {active ? LABELS[active] : "S SQUARE COMPONENTS"}
                    </span>
                  </div>
                  <div
                    key={slide.id}
                    className="hero-visual aspect-[16/10] overflow-hidden bg-[#e8ebee]"
                  >
                    <SmartProductImage
                      src={slide.remoteImage}
                      illustrative={slide.illustrative}
                      fallbackSrc={slide.fallbackImage}
                      alt={slide.imageCaption}
                      priority
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <figcaption className="flex items-start justify-between gap-4 border-t border-white/15 px-3.5 py-3 text-[10px] leading-relaxed text-slate-200">
                    {slide.imageCaption}
                    <ArrowUpRight
                      size={14}
                      className="mt-0.5 shrink-0 text-forge-400"
                    />
                  </figcaption>
                </figure>
              </div>
              <p className="hero-model-note mt-5 max-w-[310px] border border-white/15 bg-carbon-950/90 px-3 py-2 text-right font-mono text-[9px] leading-relaxed tracking-wide text-slate-200">
                Illustrative 3D gear study · Replaceable with S Square CAD
              </p>
            </div>
          </div>
          <div className="hero-depth-strip flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-white/20 py-5">
            <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[9px] uppercase tracking-wide text-slate-300 sm:gap-x-8">
              <span>
                <strong className="font-medium text-white">20+ YEARS</strong> /
                EXPERIENCE
              </span>
              <span>
                <strong className="font-medium text-white">03 MATERIALS</strong>{" "}
                / ONE PARTNER
              </span>
              <span className="hidden sm:inline">
                <strong className="font-medium text-white">CUSTOM BUILT</strong>{" "}
                / FOR YOU
              </span>
            </div>
            <a
              href="#material-divisions"
              className="hero-scroll-cue inline-flex min-h-9 items-center gap-3 font-mono text-[9px] uppercase tracking-wider text-forge-300 hover:text-white"
            >
              {animated
                ? "Scroll to change perspective"
                : "Explore our materials"}
              <span className="hero-scroll-track" aria-hidden="true">
                <span />
              </span>
              <ArrowDown size={14} />
            </a>
          </div>
          <div
            className="grid grid-cols-2 border-t border-white/20 md:grid-cols-4"
            aria-label="Explore manufacturing divisions"
          >
            {LABELS.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={active === index}
                className={`hero-tab group relative flex min-w-0 items-start gap-3 border-b border-white/10 px-3 py-4 text-left transition-colors sm:px-5 ${active === index ? "bg-white/[0.09]" : "bg-carbon-950/50 hover:bg-white/[0.05]"} ${index ? "border-l" : ""}`}
              >
                <span
                  className={`pt-1 font-mono text-[10px] ${active === index ? "text-forge-300" : "text-slate-400"}`}
                >
                  0{index + 1}
                </span>
                <span className="min-w-0">
                  <span
                    className={`block font-display text-xl font-semibold ${active === index ? "text-white" : "text-slate-200"}`}
                  >
                    {label}
                  </span>
                  <span className="mt-1 block text-[9px] text-slate-300 sm:text-[10px]">
                    {SUBS[index]}
                  </span>
                </span>
                <ArrowUpRight
                  size={15}
                  className={`ml-auto mt-1 shrink-0 ${active === index ? "text-forge-400" : "text-slate-400"}`}
                />
                {active === index && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-forge-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
