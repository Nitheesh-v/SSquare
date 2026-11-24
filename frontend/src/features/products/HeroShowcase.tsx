"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Phone,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Factory,
  Layers,
  Shield,
  Cpu,
  Truck,
} from "lucide-react";
import { COMPANY_INFO } from "@/lib/company-data";
import { useQuoteModal } from "@/hooks";

const CAROUSEL_SLIDES = [
  {
    id: "overview",
    step: "01",
    tabTitle: "Multi-Material OEM",
    tabSub: "Turnkey Custom Parts",
    badge: "Custom Manufacturer · Coimbatore, India",
    headline: "Your Trusted Partner in Custom Metal & Rubber Solutions",
    description:
      "Precision-engineered Rubber, Stainless Steel, and Aluminium components built strictly to your CAD drawings or physical samples—shipped door-to-door worldwide in 3–4 days.",
    image: "/images/hero-manufacturing.jpg",
    imageCaption: "Integrated Molding, CNC Machining & Metrology Facility",
    ctaHref: "/products",
    ctaLabel: "Explore Full Catalog",
    divisionPrefill: "Multi-Material OEM Assembly",
    icon: Factory,
    metrics: [
      { value: "15+ Years", label: "Years of Experience" },
      { value: "50+ Clients", label: "Industrial & OEM Partners" },
      { value: "3–4 Days", label: "Free Global DHL / FedEx" },
    ],
  },
  {
    id: "rubber",
    step: "02",
    tabTitle: "Rubber & Bonded Seals",
    tabSub: "Viton · Silicone · NBR",
    badge: "Elastomer Molding Division",
    headline: "Custom Molded Rubber Seals, Gaskets & Bonded Parts",
    description:
      "Over two decades formulating bespoke Viton (FKM), Silicone, HNBR, Neoprene, EPDM, and High-Integrity Metal-to-Rubber Bonded Seals for extreme pressure and chemical service.",
    image: "/images/division-rubber.jpg",
    imageCaption: "Custom Compression, Transfer & Rubber-to-Metal Bonding",
    ctaHref: "/products/rubber",
    ctaLabel: "Browse Rubber Products",
    divisionPrefill: "Rubber Products",
    icon: Layers,
    metrics: [
      { value: "25+ Compounds", label: "Viton, Silicone, HNBR, EPDM" },
      { value: "-60° to +250°C", label: "Thermal Service Window" },
      { value: "30–90 Shore A", label: "Precision Durometer Control" },
    ],
  },
  {
    id: "steel",
    step: "03",
    tabTitle: "Stainless & Alloy Steel",
    tabSub: "SS 304/316 · CNC · TIG",
    badge: "Precision Steel Division",
    headline: "High-Strength Stainless & Alloy Steel CNC Components",
    description:
      "Corrosion-resistant SS 304, SS 316, carbon, and alloy steel shafts, flanges, bushings, brackets, and TIG-welded industrial sub-assemblies machined to tight tolerances.",
    image: "/images/division-steel.jpg",
    imageCaption: "Multi-Axis CNC Turning, Milling & TIG Structural Welding",
    ctaHref: "/products/steel",
    ctaLabel: "Browse Steel Products",
    divisionPrefill: "Steel Products",
    icon: Shield,
    metrics: [
      { value: "SS 304 / 316", label: "High-Chromium Corrosion Defense" },
      { value: "CNC Precision", label: "Turned & Milled Geometry" },
      { value: "Low Upkeep", label: "Long Industrial Service Life" },
    ],
  },
  {
    id: "aluminium",
    step: "04",
    tabTitle: "Aluminium & Die Molds",
    tabSub: "6061-T6 · Die Tooling",
    badge: "Lightweight Precision Division",
    headline: "Precision 6061 Aluminium Parts & Custom Die Molds",
    description:
      "High strength-to-weight CNC machined 6061-T6 housings, custom aluminium die molds, extruded structural profiles, and clear/hard anodized industrial assemblies.",
    image: "/images/division-aluminium.jpg",
    imageCaption: "Custom Aluminium Die Molds & 6061-T6 High-Speed CNC",
    ctaHref: "/products/aluminium",
    ctaLabel: "Browse Aluminium Products",
    divisionPrefill: "Aluminium Products",
    icon: Cpu,
    metrics: [
      { value: "Grade 6061-T6", label: "Aerospace & OEM Alloy" },
      { value: "Die Molds", label: "In-House Cavity Machining" },
      { value: "Anodized", label: "Clear, Color & Hardcoat Finish" },
    ],
  },
];

export function HeroShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { openQuoteModal } = useQuoteModal();

  const totalSlides = CAROUSEL_SLIDES.length;
  const slide = CAROUSEL_SLIDES[activeIndex];

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 5500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, activeIndex]);

  return (
    <section
      className="relative overflow-hidden bg-carbon-950 text-white border-b border-carbon-800"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Subtle static warm radial highlight (zero CSS blur filter cost) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 82% 28%, rgba(234, 88, 12, 0.16), transparent 48%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-12 lg:pt-14 lg:pb-14">
        {/* Main Carousel Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Active Slide Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-forge-500/30 bg-forge-500/10 px-4 py-1.5 text-xs font-medium text-forge-300">
              <span className="h-2 w-2 rounded-full bg-forge-500" />
              <span>{slide.badge}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.85rem] font-bold leading-[1.15] tracking-tight text-white">
              {slide.headline}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              {slide.description}
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                type="button"
                onClick={() =>
                  openQuoteModal({ division: slide.divisionPrefill })
                }
                className="inline-flex items-center gap-2.5 rounded-md bg-forge-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-forge-700 transition-colors cursor-pointer"
              >
                Request Free Quote
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                href={slide.ctaHref}
                className="inline-flex items-center gap-2 rounded-md border border-carbon-700 bg-carbon-900 px-6 py-3.5 text-sm font-semibold text-slate-100 hover:border-slate-500 hover:bg-carbon-800 transition-colors"
              >
                {slide.ctaLabel}
              </Link>

              <a
                href={`tel:${COMPANY_INFO.phoneRaw}`}
                className="inline-flex items-center gap-2 px-2 py-2 text-xs font-semibold text-slate-300 hover:text-forge-400 transition-colors"
              >
                <Phone className="h-4 w-4 text-forge-500" />
                {COMPANY_INFO.phone}
              </a>
            </div>

            {/* Trust Checkmarks */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Built to CAD Drawings or Samples
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                100% Spec Conformity Checked
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Coimbatore Manufacturing Hub
              </span>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-3 gap-4 pt-5 border-t border-carbon-800">
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

          {/* Right Column: Interactive Visual Carousel Stage */}
          <div className="lg:col-span-5">
            <div className="relative rounded-xl border border-carbon-800 bg-carbon-900 p-2.5 shadow-2xl">
              {/* Stacked Carousel Images for Instant GPU Crossfade */}
              <div className="relative aspect-[16/11] w-full overflow-hidden rounded-lg bg-carbon-950">
                {CAROUSEL_SLIDES.map((s, idx) => (
                  <img
                    key={s.id}
                    src={s.image}
                    alt={s.headline}
                    decoding="async"
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                      idx === activeIndex
                        ? "opacity-100 z-10"
                        : "opacity-0 z-0 pointer-events-none"
                    }`}
                  />
                ))}

                {/* Subtle bottom gradient for caption & controls */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-carbon-950/90 via-carbon-950/40 to-transparent"
                  aria-hidden="true"
                />

                {/* Top-Left Slide Counter Pill */}
                <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-carbon-950/85 border border-white/15 px-3 py-1 text-[11px] font-semibold text-white">
                  <span className="text-forge-400">{slide.step}</span>
                  <span className="text-slate-500">/</span>
                  <span className="text-slate-300">0{totalSlides}</span>
                </div>

                {/* Prev / Next Carousel Buttons */}
                <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous slide"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-carbon-950/85 border border-white/15 text-white hover:bg-forge-600 hover:border-forge-500 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next slide"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-carbon-950/85 border border-white/15 text-white hover:bg-forge-600 hover:border-forge-500 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Bottom Caption Inside Carousel Frame */}
                <div className="absolute bottom-3 left-3.5 right-3.5 z-20 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-100 truncate">
                    {slide.imageCaption}
                  </span>
                </div>
              </div>

              {/* Express Export Strip Under Image */}
              <div className="mt-2.5 flex items-center justify-between rounded-lg bg-carbon-950/80 px-3.5 py-2.5 text-xs">
                <span className="inline-flex items-center gap-2 text-slate-300 font-medium">
                  <Truck className="h-4 w-4 text-forge-500 shrink-0" />
                  Free 3–4 Day Door Delivery Worldwide
                </span>
                <span className="font-semibold text-forge-400">
                  DHL · FedEx
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Redesigned Modern Interactive Carousel Selector Cards (Replaces old boxy code tabs) */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CAROUSEL_SLIDES.map((s, idx) => {
            const active = idx === activeIndex;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                  active
                    ? "border-forge-500/80 bg-carbon-900 shadow-md"
                    : "border-carbon-800 bg-carbon-900/50 hover:border-carbon-700 hover:bg-carbon-900/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      active
                        ? "bg-forge-600 text-white"
                        : "bg-carbon-800 text-slate-400 group-hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm font-semibold truncate ${
                          active
                            ? "text-white"
                            : "text-slate-300 group-hover:text-white"
                        }`}
                      >
                        {s.tabTitle}
                      </span>
                      <span
                        className={`text-[11px] font-semibold ${
                          active ? "text-forge-400" : "text-slate-500"
                        }`}
                      >
                        {s.step}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400 truncate">
                      {s.tabSub}
                    </p>
                  </div>
                </div>

                {/* Animated Progress Indicator Bar for Active Slide */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-carbon-800">
                  {active && !isPaused && (
                    <div
                      key={`${activeIndex}-running`}
                      className="h-full w-full bg-forge-500 animate-carousel-progress"
                    />
                  )}
                  {active && isPaused && (
                    <div className="h-full w-full bg-forge-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
