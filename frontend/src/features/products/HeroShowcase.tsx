"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Factory,
  Layers,
  Pause,
  Phone,
  Play,
  Shield,
  Truck,
} from "lucide-react";
import { COMPANY_INFO, HERO_SLIDES } from "@/lib/company-data";
import { useReducedMotion } from "@/components/shared/MotionPrimitives";
import { useQuoteModal } from "@/hooks";
import "./hero-slideshow.css";

// Original four-slide presentation from a835d41. Keep the current, reviewed
// descriptions: restoration must not reinstate blanket QC or free-shipping claims.
const SLIDES = [
  {
    id: "overview",
    tabTitle: "Multi-Material OEM",
    tabSub: "Turnkey Custom Parts",
    badge: "Custom Manufacturer · Coimbatore, India",
    headline: "Your Trusted Partner in Custom Metal & Rubber Solutions",
    imageCaption: "Manufacturing, machining & component inspection",
    ctaHref: "/products",
    ctaLabel: "Explore Full Catalog",
    division: "Rubber Products, Steel Products, Aluminium Products",
    icon: Factory,
    metrics: [
      ["20+ Years", "Engineering Expertise"],
      ["3 Materials", "Rubber · Steel · Aluminium"],
      ["Custom Built", "Drawing or Sample Based"],
    ],
  },
  {
    id: "rubber",
    tabTitle: "Rubber & Bonded Seals",
    tabSub: "Viton · Silicone · NBR",
    badge: "Elastomer Molding Division",
    headline: "Custom Molded Rubber Seals, Gaskets & Bonded Parts",
    imageCaption: "Custom molded rubber & rubber-to-metal bonded parts",
    ctaHref: "/products/rubber",
    ctaLabel: "Browse Rubber Products",
    division: "Rubber Products",
    icon: Layers,
    metrics: [
      ["Molded Seals", "Custom Geometry"],
      ["Compounds", "Application-Based Selection"],
      ["Bonded Parts", "Rubber-to-Metal Components"],
    ],
  },
  {
    id: "steel",
    tabTitle: "Stainless & Alloy Steel",
    tabSub: "Custom · Machined · OEM",
    badge: "Precision Steel Division",
    headline: "High-Strength Stainless & Alloy Steel CNC Components",
    imageCaption: "Custom-machined steel & stainless industrial components",
    ctaHref: "/products/steel",
    ctaLabel: "Browse Steel Products",
    division: "Steel Products",
    icon: Shield,
    metrics: [
      ["Steel & Stainless", "Application-Based Grades"],
      ["CNC Machining", "Turned & Milled Geometry"],
      ["Your Drawing", "Agreed Specifications"],
    ],
  },
  {
    id: "aluminium",
    tabTitle: "Aluminium & Die Molds",
    tabSub: "Grade 6061 · Die Tooling",
    badge: "Lightweight Precision Division",
    headline: "Precision 6061 Aluminium Parts & Custom Die Molds",
    imageCaption: "Custom aluminium components, profiles & die molds",
    ctaHref: "/products/aluminium",
    ctaLabel: "Browse Aluminium Products",
    division: "Aluminium Products",
    icon: Cpu,
    metrics: [
      ["Grade 6061", "Components & Profiles"],
      ["Die Molds", "Custom Tooling Requirements"],
      ["Finishes", "Anodizing or Painted Options"],
    ],
  },
] as const;
const INTERVAL = 5500;

/** Original photo slideshow only; no old page sections or 3D backdrop. */
export function HeroShowcase({
  paused,
  onPause,
}: {
  paused: boolean;
  onPause: () => void;
}) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const reduced = useReducedMotion();
  const { openQuoteModal } = useQuoteModal();
  const slide = SLIDES[active];
  const autoplay =
    !paused &&
    !reduced &&
    !hovered &&
    !focused &&
    visible &&
    !hidden &&
    !blocked;
  const next = useCallback(
    () => setActive((index) => (index + 1) % SLIDES.length),
    [],
  );
  const previous = () =>
    setActive((index) => (index + SLIDES.length - 1) % SLIDES.length);

  useEffect(() => {
    if (!autoplay) return;
    const timer = setTimeout(next, INTERVAL);
    return () => clearTimeout(timer);
  }, [autoplay, active, next]);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const visibility = () => setHidden(document.hidden);
    const blockers = () =>
      setBlocked(
        !!document.querySelector(
          "dialog[open],.site-header [aria-expanded='true']",
        ),
      );
    const intersection = new IntersectionObserver(
      ([entry]) => setVisible(entry.intersectionRatio >= 0.25),
      { threshold: [0, 0.25] },
    );
    intersection.observe(node);
    const observer = new MutationObserver(blockers);
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["open", "aria-expanded"],
    });
    document.addEventListener("visibilitychange", visibility);
    visibility();
    blockers();
    return () => {
      intersection.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  return (
    <section
      ref={root}
      className="original-slideshow-hero relative overflow-hidden border-b border-carbon-800 bg-carbon-950 text-white"
      data-testid="original-slideshow-hero"
      data-active-slide={slide.id}
      data-paused={paused}
      data-reduced={reduced}
      data-autoplay={autoplay}
      aria-label="Custom rubber, steel and aluminium manufacturing"
      aria-roledescription="carousel"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setHovered(false);
      }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setFocused(false);
      }}
      onKeyDown={(event) => {
        if (!(event.target as Element).closest("[data-slideshow-controls]"))
          return;
        if (event.key === "ArrowRight") next();
        else if (event.key === "ArrowLeft") previous();
        else if (event.key === "Home") setActive(0);
        else if (event.key === "End") setActive(SLIDES.length - 1);
        else return;
        event.preventDefault();
      }}
    >
      <div
        className="original-slideshow-glow pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 space-y-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-forge-500/30 bg-forge-500/10 px-4 py-1.5 text-xs font-medium text-forge-300">
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-forge-500"
                aria-hidden="true"
              />
              <span>{slide.badge}</span>
            </div>
            <h1
              className="original-slideshow-heading text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.85rem]"
              aria-live={autoplay ? "off" : "polite"}
              aria-atomic="true"
            >
              {slide.headline}
            </h1>
            <p className="original-slideshow-description max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {HERO_SLIDES[active].description}
            </p>
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                type="button"
                onClick={() => openQuoteModal({ division: slide.division })}
                className="original-slideshow-quote inline-flex items-center gap-2.5 rounded-md bg-forge-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-forge-700"
              >
                Request a Quote <ArrowRight className="h-4 w-4" />
              </button>
              <noscript>
                <a
                  href="/contact#quote"
                  className="inline-flex items-center gap-2.5 rounded-md bg-forge-600 px-6 py-3.5 text-sm font-semibold text-white"
                >
                  Request a Quote <ArrowRight className="h-4 w-4" />
                </a>
              </noscript>
              <Link
                href={slide.ctaHref}
                className="inline-flex items-center gap-2 rounded-md border border-carbon-700 bg-carbon-900 px-6 py-3.5 text-sm font-semibold text-slate-100 transition-colors hover:border-slate-500 hover:bg-carbon-800"
              >
                {slide.ctaLabel}
              </Link>
              <a
                href={`tel:${COMPANY_INFO.phoneRaw}`}
                className="inline-flex items-center gap-2 px-2 py-2 text-xs font-semibold text-slate-300 transition-colors hover:text-forge-400"
              >
                <Phone className="h-4 w-4 text-forge-500" />{" "}
                {COMPANY_INFO.phone}
              </a>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-xs text-slate-400">
              {[
                "Built to CAD Drawings or Samples",
                "Inspection Scope Agreed with You",
                "Coimbatore Manufacturing Hub",
              ].map((text) => (
                <span key={text} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />{" "}
                  {text}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 border-t border-carbon-800 pt-5">
              {slide.metrics.map(([value, label]) => (
                <div key={label} className="min-w-0">
                  <div className="original-slideshow-metric text-lg font-bold text-white sm:text-2xl">
                    {value}
                  </div>
                  <div className="mt-0.5 text-xs leading-snug text-slate-400">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="min-w-0 lg:col-span-5">
            <div className="rounded-xl border border-carbon-800 bg-carbon-900 p-2.5 shadow-2xl">
              <div className="relative aspect-[16/11] w-full overflow-hidden rounded-lg bg-carbon-950">
                {SLIDES.map((item, index) => (
                  <img
                    key={item.id}
                    src={HERO_SLIDES[index].fallbackImage}
                    alt={
                      index === active
                        ? `${item.imageCaption} — illustrative visual, not an actual S Square photograph`
                        : ""
                    }
                    aria-hidden={index !== active}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    decoding="async"
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${index === active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"}`}
                  />
                ))}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-carbon-950/90 via-carbon-950/40 to-transparent"
                  aria-hidden="true"
                />
                <div
                  className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-carbon-950/85 px-3 py-1 text-[11px] font-semibold text-white"
                  aria-label={`Slide ${active + 1} of ${SLIDES.length}`}
                >
                  <span className="text-forge-400">0{active + 1}</span>
                  <span className="text-slate-500">/</span>
                  <span className="text-slate-300">04</span>
                </div>
                <div
                  className="original-slideshow-arrows absolute right-3 top-3 z-20 flex gap-1.5"
                  data-slideshow-controls
                >
                  <button
                    type="button"
                    onClick={previous}
                    aria-label="Previous slide"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-carbon-950/85 text-white transition-colors hover:border-forge-500 hover:bg-forge-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next slide"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-carbon-950/85 text-white transition-colors hover:border-forge-500 hover:bg-forge-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <p className="absolute bottom-3 left-3.5 right-3.5 z-20 text-xs font-medium leading-relaxed text-slate-100">
                  {slide.imageCaption}
                </p>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-carbon-950/80 px-3.5 py-2.5 text-xs">
                <span className="inline-flex items-center gap-2 font-medium text-slate-300">
                  <Truck className="h-4 w-4 shrink-0 text-forge-500" /> Delivery
                  coordinated for your project
                </span>
                <span className="font-semibold text-forge-400">
                  DHL · FedEx
                </span>
              </div>
              <p className="original-slideshow-provenance px-1 pt-2.5 text-[9px] leading-relaxed text-slate-400">
                ILLUSTRATIVE VISUAL · REPLACEABLE WITH COMPANY PHOTOGRAPHY
              </p>
              <div className="original-slideshow-playback mt-2 flex items-center justify-end">
                <button
                  type="button"
                  aria-label={
                    paused ? "Resume visual motion" : "Pause visual motion"
                  }
                  aria-pressed={paused}
                  disabled={reduced}
                  onClick={onPause}
                  className="inline-flex min-h-9 items-center gap-2 text-[10px] font-medium text-slate-300 hover:text-white disabled:cursor-default"
                >
                  {paused || reduced ? <Play size={12} /> : <Pause size={12} />}
                  {reduced
                    ? "REDUCED MOTION"
                    : paused
                      ? "SLIDESHOW PAUSED"
                      : "AUTOPLAY · 5.5 SEC"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          className="original-slideshow-tabs mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
          role="group"
          aria-label="Explore manufacturing divisions"
          data-slideshow-controls
        >
          {SLIDES.map((item, index) => {
            const selected = index === active;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                aria-label={`0${index + 1} ${item.tabTitle}`}
                onClick={() => setActive(index)}
                className={`group relative min-w-0 overflow-hidden rounded-xl border p-4 text-left transition-colors ${selected ? "border-forge-500/80 bg-carbon-900 shadow-md" : "border-carbon-800 bg-carbon-900/50 hover:border-carbon-700 hover:bg-carbon-900/80"}`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-forge-600 text-white" : "bg-carbon-800 text-slate-400 group-hover:text-white"}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span
                        className={`text-sm font-semibold ${selected ? "text-white" : "text-slate-300 group-hover:text-white"}`}
                      >
                        {item.tabTitle}
                      </span>
                      <span className="shrink-0 text-[11px] font-semibold text-forge-400">
                        0{index + 1}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-400">
                      {item.tabSub}
                    </span>
                  </span>
                </span>
                {selected && (
                  <span
                    className="absolute inset-x-0 bottom-0 h-1 bg-carbon-800"
                    aria-hidden="true"
                  >
                    <span
                      key={`${active}-${autoplay}`}
                      className="original-slideshow-progress block h-full w-full bg-forge-500"
                    />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <noscript>
        <style>{`.original-slideshow-hero .original-slideshow-arrows,.original-slideshow-hero .original-slideshow-tabs,.original-slideshow-hero .original-slideshow-playback,.original-slideshow-hero button.original-slideshow-quote{display:none}`}</style>
      </noscript>
    </section>
  );
}
