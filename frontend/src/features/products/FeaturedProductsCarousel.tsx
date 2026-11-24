"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import { ALL_PRODUCTS, DivisionSlug } from "@/lib/catalog-data";
import { SmartProductImage } from "@/components/shared/SmartProductImage";
import { useQuoteModal } from "@/hooks";

const FEATURED_IDS = [
  "metal-viton-bonded-seals",
  "silicone-gasket",
  "cnc-machined-steel-components",
  "aluminium-die-molds",
  "metal-hnbr-bonded-seals",
  "stainless-steel-flanges-bushings",
  "grade-6061-machined-parts",
  "nbr-o-rings",
  "anodized-aluminium-components",
];

const DIVISION_LABELS: Record<DivisionSlug, string> = {
  rubber: "Rubber Products",
  steel: "Steel Products",
  aluminium: "Aluminium Products",
};

export function FeaturedProductsCarousel() {
  const { openQuoteModal } = useQuoteModal();
  const featured = ALL_PRODUCTS.filter((p) => FEATURED_IDS.includes(p.id));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, featured.length - cardsPerView);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [paused, next]);

  const safeIndex = Math.min(currentIndex, maxIndex);
  const shiftPercent = (safeIndex * 100) / cardsPerView;

  return (
    <div
      className="space-y-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header Row + Carousel Arrows */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-forge-600">
            Featured Custom Production
          </span>
          <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-carbon-900">
            Precision Components Manufactured to Your Print
          </h2>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous products"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-carbon-900 hover:border-forge-600 hover:text-forge-600 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next products"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-carbon-900 hover:border-forge-600 hover:text-forge-600 transition-colors cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* GPU-Accelerated Carousel Viewport */}
      <div className="overflow-hidden">
        <div
          className="flex -mx-3 transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: `translate3d(-${shiftPercent}%, 0, 0)` }}
        >
          {featured.map((item) => (
            <div
              key={item.id}
              className="px-3 shrink-0"
              style={{ width: `${100 / cardsPerView}%` }}
            >
              <article className="h-full flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:border-slate-300 hover:shadow-md transition-shadow">
                <Link
                  href={`/products/${item.division}`}
                  className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 block"
                >
                  <SmartProductImage
                    src={item.remoteImage}
                    fallbackSrc={item.fallbackImage}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-3 left-3 rounded-md bg-carbon-900 px-2.5 py-1 text-[11px] font-semibold text-white">
                    {item.materialBadge}
                  </span>
                </Link>

                <div className="flex flex-1 flex-col p-5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-forge-600">
                    {DIVISION_LABELS[item.division]} · {item.category}
                  </span>
                  <h3 className="mt-1 font-display text-base font-bold text-carbon-900">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {item.specs}
                  </p>
                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed flex-1 line-clamp-3">
                    {item.description}
                  </p>

                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/products/${item.division}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-forge-600 transition-colors"
                    >
                      View Division
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        openQuoteModal({
                          division: DIVISION_LABELS[item.division],
                          partName: `${item.name} (${item.materialBadge})`,
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-md bg-forge-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-forge-700 transition-colors cursor-pointer"
                    >
                      Request Quote
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots + Full Catalog Link */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to carousel position ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === safeIndex
                  ? "w-7 bg-forge-600"
                  : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-carbon-900 hover:text-forge-600 transition-colors"
        >
          View All {ALL_PRODUCTS.length}+ Custom Products
          <ArrowRight className="h-4 w-4 text-forge-600" />
        </Link>
      </div>
    </div>
  );
}
