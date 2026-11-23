"use client";

import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { MATERIAL_MATRIX, DivisionSlug } from "@/lib/catalog-data";
import { useQuoteModal } from "@/hooks";

const FILTER_TABS: { id: "all" | DivisionSlug; label: string }[] = [
  { id: "all", label: "All Engineering Materials" },
  { id: "rubber", label: "Elastomers & Rubber" },
  { id: "steel", label: "Stainless & Alloy Steel" },
  { id: "aluminium", label: "Aluminium & Die Tooling" },
];

const DIVISION_LABELS: Record<DivisionSlug, string> = {
  rubber: "Rubber Products",
  steel: "Steel Products",
  aluminium: "Aluminium Products",
};

export function MaterialSelector() {
  const [filter, setFilter] = useState<"all" | DivisionSlug>("all");
  const { openQuoteModal } = useQuoteModal();

  const rows =
    filter === "all"
      ? MATERIAL_MATRIX
      : MATERIAL_MATRIX.filter((r) => r.division === filter);

  return (
    <div className="rounded-sm border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-forge-600">
            SPEC MATRIX // COMPOUND &amp; ALLOY GUIDE
          </span>
          <h3 className="font-display text-lg font-bold text-carbon-900">
            Compare Operating Envelopes &amp; Quote Directly
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`rounded-xs px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                filter === tab.id
                  ? "bg-carbon-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-carbon-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/60 font-mono text-[11px] uppercase tracking-wider text-slate-500">
              <th className="py-3 px-5">Material / Compound</th>
              <th className="py-3 px-4">Temp Envelope</th>
              <th className="py-3 px-4">Primary Engineering Advantage</th>
              <th className="py-3 px-4">Typical Custom Parts</th>
              <th className="py-3 px-5 text-right">RFQ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/90 transition-colors">
                <td className="py-3.5 px-5">
                  <div className="font-display font-bold text-carbon-900">
                    {row.material}
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                    {row.finishOrGrade}
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono text-xs font-semibold text-carbon-800 whitespace-nowrap">
                  {row.tempRange}
                </td>
                <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                  {row.keyStrength}
                </td>
                <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                  {row.typicalParts}
                </td>
                <td className="py-3.5 px-5 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() =>
                      openQuoteModal({
                        division: DIVISION_LABELS[row.division],
                        partName: row.material,
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-xs border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-carbon-900 hover:border-forge-600 hover:bg-forge-600 hover:text-white transition cursor-pointer"
                  >
                    Quote
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
