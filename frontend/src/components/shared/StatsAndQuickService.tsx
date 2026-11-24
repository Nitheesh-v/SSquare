"use client";

import React, { useEffect, useRef, useState } from "react";
import { Phone, ArrowRight } from "lucide-react";
import { COMPANY_INFO } from "@/lib/company-data";
import { useQuoteModal } from "@/hooks";

interface StatItem {
  target: number;
  suffix: string;
  label: string;
}

const STATS: StatItem[] = [
  { target: 7, suffix: "", label: "Factory industrial" },
  { target: 50, suffix: "+", label: "Clients" },
  { target: 15, suffix: "+", label: "Years of Experience" },
];

export function StatsAndQuickService() {
  const { openQuoteModal } = useQuoteModal();
  const bandRef = useRef<HTMLDivElement | null>(null);
  const [counts, setCounts] = useState<number[]>(STATS.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = bandRef.current;
    if (!el || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;
    const duration = 1100;
    const start = performance.now();
    let rafId = 0;

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounts(STATS.map((s) => Math.round(s.target * eased)));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [hasAnimated]);

  return (
    <div>
      {/* Blush-Rose Stats Counter Band (7 / 50+ / 15+) */}
      <section ref={bandRef} className="bg-[#fde6e6] py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
            {STATS.map((stat, idx) => (
              <div key={stat.label} className="space-y-1.5">
                <div className="font-display text-4xl sm:text-5xl font-bold text-[#0d1324]">
                  {hasAnimated ? counts[idx] : stat.target}
                  {stat.suffix}
                </div>
                <div className="text-lg sm:text-xl font-medium text-[#1e2538]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Split Industrial Photography + Crimson "QUICK SERVICE ON YOUR NEEDS" Banner */}
      <section className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Half: Dual Industrial Product Showcase (Rubber Cords/Seals + Precision Metal Parts) */}
        <div className="lg:col-span-6 grid grid-cols-2 min-h-[280px] sm:min-h-[340px]">
          <div className="relative overflow-hidden bg-carbon-950">
            <img
              src="/images/division-rubber.jpg"
              alt="Custom molded rubber cords and seals"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative overflow-hidden bg-[#981b2b]">
            <img
              src="/images/division-steel.jpg"
              alt="Precision CNC machined stainless steel bushings and parts"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Right Half: Crimson Red Quick Service Callout */}
        <div className="lg:col-span-6 bg-[#e31837] text-white px-6 py-12 sm:px-12 lg:px-16 flex flex-col justify-center">
          <div className="max-w-lg space-y-4">
            <span className="inline-block text-sm sm:text-base font-bold uppercase tracking-wider text-white">
              QUICK SERVICE ON YOUR NEEDS
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold leading-snug text-white">
              Call Monday – Saturday
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed">
              Reach out to our team for expert guidance and reliable support on
              custom rubber, steel, and aluminium manufacturing.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href={`tel:${COMPANY_INFO.phoneRaw}`}
                className="inline-flex items-center gap-2.5 rounded-md bg-white px-5 py-3 text-base font-bold text-[#0d1324] shadow-sm hover:bg-slate-100 transition-colors"
              >
                <Phone className="h-4 w-4 text-[#e31837]" />
                {COMPANY_INFO.phone}
              </a>

              <button
                type="button"
                onClick={() => openQuoteModal()}
                className="inline-flex items-center gap-2 rounded-md border border-white/60 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                Request a Quote
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
