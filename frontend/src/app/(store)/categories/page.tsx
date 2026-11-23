import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { DIVISIONS } from "@/lib/catalog-data";
import { OpenQuoteButton } from "@/components/shared/OpenQuoteButton";

export const metadata: Metadata = {
  title: "Manufacturing Categories – Rubber, Steel & Aluminium",
  description:
    "Explore S Square Engineering Services' three core manufacturing categories: Custom Molded Rubber, Precision Stainless & Alloy Steel, and Aluminium Die Molds & CNC Parts.",
};

export default function CategoriesPage() {
  const categories = [DIVISIONS.rubber, DIVISIONS.steel, DIVISIONS.aluminium];

  return (
    <div>
      <section className="bg-carbon-950 text-white bg-blueprint-dark border-b border-carbon-800 py-14 lg:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-400">
              MANUFACTURING CATEGORIES
            </span>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-white">
              Three Integrated Production Divisions
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Select a manufacturing category below to inspect supported raw compounds/alloys, machining &amp; molding capabilities, and custom-built component configurations.
            </p>
          </div>
          <OpenQuoteButton label="Request Multi-Material Quote" />
        </div>
      </section>

      <section className="py-16 lg:py-22 bg-[#f8f9fb]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {categories.map((cat, idx) => (
            <div
              key={cat.slug}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-sm border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs"
            >
              <div
                className={`lg:col-span-5 ${idx % 2 === 1 ? "lg:order-2" : ""}`}
              >
                <Link
                  href={`/categories/${cat.slug}`}
                  className="block rounded-xs overflow-hidden border border-slate-200 aspect-[16/11]"
                >
                  <img
                    src={cat.heroImage}
                    alt={cat.name}
                    className="h-full w-full object-cover hover:scale-103 transition-transform duration-300"
                  />
                </Link>
              </div>

              <div
                className={`lg:col-span-7 space-y-4 ${
                  idx % 2 === 1 ? "lg:order-1" : ""
                }`}
              >
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-600">
                  {cat.code}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-carbon-900">
                  {cat.name}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {cat.summary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {cat.keyCapabilities.slice(0, 4).map((c) => (
                    <div
                      key={c}
                      className="flex items-start gap-2 text-xs text-slate-700 font-medium"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-forge-600 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 flex flex-wrap gap-3">
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="inline-flex items-center gap-2 rounded-xs bg-carbon-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-forge-600 transition"
                  >
                    Browse {cat.name}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <OpenQuoteButton
                    label={`Quote ${cat.name}`}
                    variant="outline"
                    prefill={{ division: cat.name }}
                    className="!py-2.5 !text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
