import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { DivisionInfo, ProductItem } from "@/data/products";
import { ProductCatalogView } from "./ProductCatalogView";
import { OpenQuoteButton } from "./OpenQuoteButton";

interface DivisionPageTemplateProps {
  division: DivisionInfo;
  products: ProductItem[];
  technicalNoteTitle: string;
  technicalNoteParagraphs: string[];
}

export function DivisionPageTemplate({
  division,
  products,
  technicalNoteTitle,
  technicalNoteParagraphs,
}: DivisionPageTemplateProps) {
  return (
    <div>
      {/* Division Hero Header */}
      <section className="bg-carbon-950 text-white bg-blueprint-dark border-b border-carbon-800 py-14 lg:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-400 hover:text-forge-400 transition mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            ALL MANUFACTURING DIVISIONS
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-block rounded-xs border border-forge-500/40 bg-forge-600/15 px-3 py-1 font-mono text-xs font-semibold text-forge-400">
                {division.code}
              </span>
              <h1 className="font-display text-3xl sm:text-5xl font-bold text-white">
                {division.name}
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                {division.heroTagline}
              </p>

              {/* Technical Highlights Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {division.technicalHighlights.map((th) => (
                  <div
                    key={th.label}
                    className="rounded-xs border border-carbon-800 bg-carbon-900/80 p-3"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                      {th.label}
                    </div>
                    <div className="mt-1 font-display text-xs sm:text-sm font-bold text-white">
                      {th.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <OpenQuoteButton
                  label={`Request ${division.name} Quote`}
                  prefill={{ division: division.name }}
                />
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-sm border border-carbon-700 bg-carbon-900 p-2 shadow-xl">
                <div className="aspect-[16/11] overflow-hidden bg-carbon-950">
                  <img
                    src={division.heroImage}
                    alt={division.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="px-2 pt-2 pb-1 flex items-center justify-between font-mono text-[10px] text-slate-400">
                  <span>CUSTOM CAD &amp; SAMPLE READY</span>
                  <span className="text-forge-400">100% CONFORMITY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities & Engineering Metallurgy / Compound Note */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-4">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-600">
                Engineering Overview
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-carbon-900">
                {technicalNoteTitle}
              </h2>
              {technicalNoteParagraphs.map((p, idx) => (
                <p key={idx} className="text-sm text-slate-600 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>

            <div className="lg:col-span-5 rounded-sm border border-slate-200 bg-slate-50 p-6">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-carbon-900 mb-4">
                Core Division Capabilities
              </h3>
              <ul className="space-y-2.5">
                {division.keyCapabilities.map((cap) => (
                  <li
                    key={cap}
                    className="flex items-start gap-2.5 text-xs font-medium text-slate-700"
                  >
                    <CheckCircle2 className="h-4 w-4 text-forge-600 shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 pt-4 border-t border-slate-200">
                <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-2">
                  Supported Compounds / Grades
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {division.keyMaterials.map((m) => (
                    <span
                      key={m}
                      className="rounded-xs border border-slate-200 bg-white px-2.5 py-1 font-mono text-[11px] font-semibold text-carbon-800"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filterable Product Catalog Grid */}
      <section className="py-16 bg-[#f8f9fb]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-600">
              Component Catalog // {division.name}
            </span>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-carbon-900">
              Manufactured Configurations &amp; Custom Profiles
            </h2>
          </div>

          <ProductCatalogView items={products} />
        </div>
      </section>
    </div>
  );
}
