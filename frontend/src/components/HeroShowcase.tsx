"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Phone, CheckCircle2 } from "lucide-react";
import { HERO_SLIDES, COMPANY_INFO } from "@/data/company";
import { useQuoteModal } from "./QuoteModalContext";

const SLIDE_IMAGES: Record<string, string> = {
  overview: "/images/hero-manufacturing.jpg",
  rubber: "/images/division-rubber.jpg",
  metals: "/images/division-aluminium.jpg",
};

export function HeroShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { openQuoteModal } = useQuoteModal();

  const slide = HERO_SLIDES[activeIndex];

  return (
    <section className="relative overflow-hidden bg-carbon-950 text-white bg-blueprint-dark border-b border-carbon-800">
      {/* Subtle ambient glow */}
      <div
        className="pointer-events-none absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-forge-600/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        {/* Interactive Material Focus Tabs */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {HERO_SLIDES.map((s, idx) => {
            const active = idx === activeIndex;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`inline-flex items-center gap-2 rounded-xs border px-3.5 py-1.5 font-mono text-xs transition cursor-pointer ${
                  active
                    ? "border-forge-500 bg-forge-600/15 text-white font-semibold"
                    : "border-carbon-800 bg-carbon-900/70 text-slate-400 hover:border-carbon-700 hover:text-slate-200"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    active ? "bg-forge-500" : "bg-slate-600"
                  }`}
                />
                {s.code}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Copy Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-xs border border-carbon-700 bg-carbon-900 px-3 py-1 text-xs font-medium text-forge-400">
              <span>{slide.badge}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.95rem] font-bold leading-[1.12] tracking-tight text-white">
              {slide.headline}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              {slide.description}
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                type="button"
                onClick={() =>
                  openQuoteModal({
                    division:
                      slide.id === "rubber"
                        ? "Rubber Products"
                        : slide.id === "metals"
                        ? "Steel Products"
                        : "Multi-Material OEM Assembly",
                  })
                }
                className="inline-flex items-center gap-2.5 rounded-xs bg-forge-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-forge-700 transition cursor-pointer"
              >
                Talk to an Engineering Expert
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xs border border-carbon-700 bg-carbon-900 px-6 py-3.5 text-sm font-semibold text-slate-100 hover:border-slate-500 hover:bg-carbon-800 transition"
              >
                Explore Product Catalog
              </Link>

              <a
                href={`tel:${COMPANY_INFO.phoneRaw}`}
                className="inline-flex items-center gap-2 px-2 py-2 font-mono text-xs text-slate-300 hover:text-forge-400 transition"
              >
                <Phone className="h-3.5 w-3.5 text-forge-500" />
                {COMPANY_INFO.phone}
              </a>
            </div>

            {/* Key Guarantees */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Built to CAD Drawings or Samples
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                100% Spec Conformity Checked
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Coimbatore Manufacturing Hub
              </span>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-carbon-800">
              {slide.metrics.map((m) => (
                <div key={m.label}>
                  <div className="font-display text-xl sm:text-2xl font-bold text-white">
                    {m.value}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-400 leading-snug">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Framed Industrial Photograph */}
          <div className="lg:col-span-5">
            <div className="relative rounded-sm border border-carbon-700 bg-carbon-900 p-2 shadow-2xl">
              {/* Blueprint corner ticks */}
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-carbon-800 font-mono text-[10px] text-slate-400">
                <span>S SQUARE // INSPECTION STAGE</span>
                <span className="text-forge-400">ISO TOLERANCE READY</span>
              </div>

              <div className="relative aspect-[16/11] w-full overflow-hidden bg-carbon-950">
                <img
                  src={SLIDE_IMAGES[slide.id]}
                  alt={slide.headline}
                  className="h-full w-full object-cover transition-all duration-500"
                />
              </div>

              {/* Quick Division Jump Strip inside Frame */}
              <div className="grid grid-cols-3 divide-x divide-carbon-800 border-t border-carbon-800 bg-carbon-900 text-center">
                <Link
                  href="/products/rubber"
                  className="py-2.5 px-2 text-xs font-medium text-slate-300 hover:bg-carbon-800 hover:text-forge-400 transition"
                >
                  Rubber Seals →
                </Link>
                <Link
                  href="/products/steel"
                  className="py-2.5 px-2 text-xs font-medium text-slate-300 hover:bg-carbon-800 hover:text-forge-400 transition"
                >
                  Steel Parts →
                </Link>
                <Link
                  href="/products/aluminium"
                  className="py-2.5 px-2 text-xs font-medium text-slate-300 hover:bg-carbon-800 hover:text-forge-400 transition"
                >
                  Aluminium →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
