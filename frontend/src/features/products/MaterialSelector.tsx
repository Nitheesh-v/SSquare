"use client";

import { useId, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { MATERIAL_MATRIX, type DivisionSlug } from "@/lib/catalog-data";
import { useQuoteModal } from "@/hooks";

const TABS: { id: "all" | DivisionSlug; label: string }[] = [
  { id: "all", label: "All materials" },
  { id: "rubber", label: "Rubber" },
  { id: "steel", label: "Steel" },
  { id: "aluminium", label: "Aluminium" },
];

export function MaterialSelector() {
  const [filter, setFilter] = useState<"all" | DivisionSlug>("all");
  const { openQuoteModal } = useQuoteModal();
  const id = useId();
  const rows =
    filter === "all"
      ? MATERIAL_MATRIX
      : MATERIAL_MATRIX.filter((row) => row.division === filter);
  return (
    <div className="overflow-hidden border border-slate-200 bg-white">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center">
        <div>
          <p className="eyebrow text-forge-700">
            MATERIAL INTELLIGENCE / GENERAL GUIDE
          </p>
          <h3
            id={`${id}-heading`}
            className="mt-1 font-display text-2xl font-semibold"
          >
            Compare material families.
          </h3>
        </div>
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Filter the material comparison"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={filter === tab.id}
              onClick={() => setFilter(tab.id)}
              className={`min-h-11 border px-3 py-2 text-xs font-medium transition-colors ${filter === tab.id ? "border-carbon-900 bg-carbon-900 text-white" : "border-slate-300 bg-white text-slate-600 hover:border-forge-600"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <p
        id={`${id}-hint`}
        className="px-5 pt-4 font-mono text-[9px] text-slate-500"
      >
        SCROLL HORIZONTALLY TO COMPARE ON SMALLER SCREENS →
      </p>
      <div
        tabIndex={0}
        role="region"
        aria-labelledby={`${id}-heading`}
        aria-describedby={`${id}-hint`}
        className="relative overflow-x-auto"
      >
        <table className="min-w-[850px] w-full border-collapse text-left">
          <caption className="sr-only">
            General material families, application contexts and example
            components. Not a specification or a guarantee of suitability.
          </caption>
          <thead>
            <tr className="border-b border-slate-200 font-mono text-[9px] uppercase tracking-wide text-slate-600">
              <th scope="col" className="px-5 py-4">
                Material / compound
              </th>
              <th scope="col" className="px-4 py-4">
                Application context
              </th>
              <th scope="col" className="px-4 py-4">
                General characteristics
              </th>
              <th scope="col" className="px-4 py-4">
                Typical component types
              </th>
              <th scope="col" className="px-5 py-4">
                RFQ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-slate-50">
                <th scope="row" className="px-5 py-5 font-normal">
                  <p className="font-display text-xl font-semibold">
                    {row.material}
                  </p>
                  <p className="mt-1 max-w-[200px] font-mono text-[9px] leading-relaxed text-slate-500">
                    {row.finishOrGrade}
                  </p>
                </th>
                <td className="px-4 py-5 text-xs leading-relaxed text-slate-700">
                  {row.tempRange}
                </td>
                <td className="max-w-[240px] px-4 py-5 text-xs leading-relaxed text-slate-600">
                  {row.keyStrength}
                </td>
                <td className="max-w-[240px] px-4 py-5 text-xs leading-relaxed text-slate-600">
                  {row.typicalParts}
                </td>
                <td className="px-5 py-5">
                  <button
                    type="button"
                    aria-label={`Request a quote for ${row.material}`}
                    onClick={() =>
                      openQuoteModal({
                        division: `${row.division.charAt(0).toUpperCase()}${row.division.slice(1)} Products`,
                        partName: row.material,
                      })
                    }
                    className="flex h-11 w-11 items-center justify-center border border-slate-300 text-carbon-900 hover:border-forge-600 hover:text-forge-700"
                  >
                    <ArrowUpRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-[10px] leading-relaxed text-slate-600">
        Material properties vary with grade, compound and service conditions.
        Confirm suitability, operating limits and required testing against your
        application with the S Square team.
      </p>
    </div>
  );
}
