import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ALL_PRODUCTS, DIVISIONS } from "@/lib/catalog-data";
import { ProductCatalogView } from "@/features/products/ProductCatalogView";
import { MaterialSelector } from "@/features/products/MaterialSelector";
import { OpenQuoteButton } from "@/components/shared/OpenQuoteButton";

export const metadata: Metadata = {
  title: "Component Catalog — Rubber, Steel & Aluminium",
  description:
    "Explore custom rubber seals, bonded parts, steel components and aluminium die molds. Share drawings, materials and quantities to request a project-specific quotation.",
};
export default function ProductsPage() {
  return (
    <>
      <section className="border-b border-carbon-800 bg-carbon-950 py-16 text-white lg:py-24">
        <div className="shell">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="eyebrow text-forge-300">
                THE CUSTOM COMPONENT CATALOG
              </p>
              <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
                A starting point.
                <br />
                Not a standard limitation.
              </h1>
              <p className="mt-7 max-w-2xl text-sm leading-[1.9] text-slate-300">
                Rubber, steel and aluminium component types for your next
                project. No stock pricing or online checkout—every requirement
                is reviewed and quoted to your drawing or sample.
              </p>
            </div>
            <OpenQuoteButton label="Request a Quote" />
          </div>
          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {[DIVISIONS.rubber, DIVISIONS.steel, DIVISIONS.aluminium].map(
              (division, index) => (
                <Link
                  key={division.slug}
                  href={`/products/${division.slug}`}
                  className="group flex items-center justify-between gap-5 border border-white/15 bg-white/[.03] p-5 transition-colors hover:border-forge-400"
                >
                  <div>
                    <p className="font-mono text-[9px] text-forge-300">
                      DIVISION 0{index + 1}
                    </p>
                    <h2 className="mt-1 font-display text-3xl font-semibold">
                      {division.name}
                    </h2>
                    <p className="mt-2 text-[10px] text-slate-400">
                      {division.shortTitle}
                    </p>
                  </div>
                  <ArrowUpRight size={21} className="shrink-0 text-forge-300" />
                </Link>
              ),
            )}
          </div>
        </div>
      </section>
      <section className="border-b border-slate-200 bg-[#f7f8fa] py-12 lg:py-20">
        <div className="shell">
          <ProductCatalogView items={ALL_PRODUCTS} showDivisionFilter />
        </div>
      </section>
      <section className="bg-white py-16">
        <div className="shell">
          <p className="eyebrow text-forge-700">GENERAL SELECTION GUIDE</p>
          <h2 className="mt-3 font-display text-4xl font-semibold">
            Match the material to your application.
          </h2>
          <p className="mb-7 mt-3 text-xs leading-relaxed text-slate-600">
            A general material comparison, not a technical datasheet. Final
            specifications are confirmed during project review.
          </p>
          <MaterialSelector />
        </div>
      </section>
    </>
  );
}
