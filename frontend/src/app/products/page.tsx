import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ALL_PRODUCTS, DIVISIONS } from "@/data/products";
import { ProductCatalogView } from "@/components/ProductCatalogView";
import { MaterialSelector } from "@/components/MaterialSelector";
import { OpenQuoteButton } from "@/components/OpenQuoteButton";

export const metadata: Metadata = {
  title: "Products Catalog – Rubber, Steel & Aluminium Components",
  description:
    "Explore S Square Engineering Services' full custom manufacturing catalog: Viton & Silicone rubber seals, metal-to-rubber bonded parts, stainless steel CNC components, and 6061 aluminium die molds.",
};

export default function ProductsOverviewPage() {
  const divisions = [DIVISIONS.rubber, DIVISIONS.steel, DIVISIONS.aluminium];

  return (
    <div>
      {/* Header */}
      <section className="bg-carbon-950 text-white bg-blueprint-dark border-b border-carbon-800 py-14 lg:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-400">
                COMPLETE MANUFACTURING CATALOG
              </span>
              <h1 className="font-display text-3xl sm:text-5xl font-bold text-white">
                Custom Rubber, Steel &amp; Aluminium Products
              </h1>
              <p className="text-base text-slate-300 leading-relaxed">
                Every component below can be custom-molded, machined, or fabricated to your exact 2D/3D CAD drawing or physical reference sample—with 100% dimensional conformity and 3–4 day global DHL/FedEx delivery.
              </p>
            </div>
            <OpenQuoteButton label="Submit Drawing for Quote" />
          </div>

          {/* Quick Division Cards */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {divisions.map((d) => (
              <Link
                key={d.slug}
                href={`/products/${d.slug}`}
                className="group flex items-center justify-between rounded-xs border border-carbon-800 bg-carbon-900/90 p-5 hover:border-forge-500 transition"
              >
                <div>
                  <span className="font-mono text-[10px] text-forge-400 block">
                    {d.code}
                  </span>
                  <span className="font-display text-lg font-bold text-white group-hover:text-forge-400 transition">
                    {d.name}
                  </span>
                  <span className="block text-xs text-slate-400 mt-0.5">
                    {d.shortTitle}
                  </span>
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-forge-400 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Filterable Master Catalog */}
      <section className="py-16 bg-[#f8f9fb] border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProductCatalogView items={ALL_PRODUCTS} showDivisionFilter />
        </div>
      </section>

      {/* Material Matrix */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <MaterialSelector />
        </div>
      </section>
    </div>
  );
}
