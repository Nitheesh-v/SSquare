"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  MessageSquare,
} from "lucide-react";
import { HERO_SLIDES, COMPANY_INFO } from "@/lib/company-data";
import { SmartProductImage } from "@/components/shared/SmartProductImage";
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
  const slide = HERO_SLIDES[active];
  const { openQuoteModal } = useQuoteModal();
  const href = active ? `/products/${slide.id}` : "/products";

  return (
    <section
      className="hero-section relative overflow-hidden bg-carbon-950 text-white"
      aria-label="Custom rubber, steel and aluminium manufacturing"
    >
      <div
        className="hero-grid pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <div className="shell relative pt-10 sm:pt-14 lg:pt-16">
        <div className="mb-8 flex items-center justify-between gap-4 border-b border-white/15 pb-4 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
          <span className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 bg-forge-400" />S SQUARE ENGINEERING
            SERVICES
          </span>
          <span className="hidden sm:inline">RUBBER / STEEL / ALUMINIUM</span>
        </div>
        <div className="grid items-center gap-10 pb-12 lg:grid-cols-12 lg:gap-12 lg:pb-16">
          <div className="relative z-10 lg:col-span-6">
            <p className="eyebrow text-forge-300">
              CUSTOM COMPONENTS. CONSIDERED ENGINEERING.
            </p>
            <h1 className="mt-5 min-h-[2em] font-display text-[clamp(3.5rem,7.2vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.025em]">
              {TITLES[active]}
            </h1>
            <p className="mt-7 max-w-xl text-sm leading-[1.85] text-slate-300 sm:text-base">
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
              <Link href={href} className="button-dark-outline">
                Explore {active ? LABELS[active].toLowerCase() : "components"}
                <ArrowRight size={16} />
              </Link>
            </div>
            <a
              href={COMPANY_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2.5 py-2 text-xs text-slate-300 transition-colors hover:text-white"
            >
              <MessageSquare size={15} className="text-forge-400" />
              Have a sample or drawing? Let’s talk.
              <ArrowUpRight size={13} />
            </a>
            <div className="mt-9 grid grid-cols-3 border-t border-white/15 pt-6">
              {[
                {
                  value: "20+",
                  suffix: "YEARS",
                  label: "Engineering experience",
                },
                {
                  value: "03",
                  suffix: "MATERIALS",
                  label: "One manufacturing partner",
                },
                {
                  value: "CUSTOM",
                  suffix: "BUILT",
                  label: "Your drawing or sample",
                },
              ].map((metric, i) => (
                <div
                  key={metric.value}
                  className={
                    i ? "border-l border-white/15 pl-4 sm:pl-6" : "pr-3"
                  }
                >
                  <div className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                    {metric.value}
                    <span className="mt-1 block font-mono text-[9px] font-normal tracking-normal text-forge-300 sm:ml-1.5 sm:mt-0 sm:inline">
                      {metric.suffix}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] leading-relaxed text-slate-400 sm:text-[11px]">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative lg:col-span-6">
            <div
              className="absolute -inset-5 border border-white/[0.07] sm:-inset-4"
              aria-hidden="true"
            />
            <div className="relative border border-white/20 bg-[#e8ebee]">
              <div className="flex items-center justify-between gap-2 bg-carbon-900 px-4 py-3 font-mono text-[9px] tracking-wider text-slate-300 sm:text-[10px]">
                <span>COMPONENT STUDY / 0{active + 1}</span>
                <span className="text-forge-300">
                  {active
                    ? `${LABELS[active].toUpperCase()} DIVISION`
                    : "S SQUARE MANUFACTURING"}
                </span>
              </div>
              <div
                key={slide.id}
                className="hero-visual aspect-[5/4] overflow-hidden sm:aspect-[6/5]"
              >
                <SmartProductImage
                  src={slide.remoteImage}
                  fallbackSrc={slide.fallbackImage}
                  alt={slide.imageCaption}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex items-start justify-between gap-3 bg-carbon-950/90 px-4 py-3 text-[10px] leading-relaxed text-slate-200">
                <span>{slide.imageCaption}</span>
                <ArrowUpRight className="shrink-0 text-forge-400" size={16} />
              </div>
              <span
                className="absolute -left-2 top-10 h-4 w-4 border-l-2 border-t-2 border-forge-400"
                aria-hidden="true"
              />
              <span
                className="absolute -bottom-2 -right-2 h-4 w-4 border-b-2 border-r-2 border-forge-400"
                aria-hidden="true"
              />
            </div>
            <div className="mt-6 flex items-center justify-between font-mono text-[9px] tracking-wider text-slate-400">
              <span>BUILT TO DRAWING. NOT OFF THE SHELF.</span>
              <a
                href="#engineering-story"
                className="inline-flex items-center gap-2 py-2 text-slate-200 hover:text-forge-300"
              >
                SCROLL TO EXPLORE
                <ArrowDown size={12} />
              </a>
            </div>
          </div>
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
              className={`hero-tab group relative flex items-start gap-3 border-b border-white/10 px-3 py-5 text-left transition-colors sm:px-5 ${active === index ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"} ${index ? "border-l" : ""}`}
            >
              <span
                className={`pt-1 font-mono text-[10px] ${active === index ? "text-forge-300" : "text-slate-500"}`}
              >
                0{index + 1}
              </span>
              <span>
                <span
                  className={`block font-display text-xl font-semibold ${active === index ? "text-white" : "text-slate-300"}`}
                >
                  {label}
                </span>
                <span className="mt-1 block text-[9px] text-slate-400 sm:text-[10px]">
                  {SUBS[index]}
                </span>
              </span>
              <ArrowUpRight
                size={15}
                className={`ml-auto mt-1 shrink-0 ${active === index ? "text-forge-400" : "text-slate-500"}`}
              />
              {active === index && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-forge-500" />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
