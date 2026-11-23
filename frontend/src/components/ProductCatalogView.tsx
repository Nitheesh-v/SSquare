"use client";

import React, { useMemo, useState } from "react";
import { Search, ArrowUpRight, SlidersHorizontal, X } from "lucide-react";
import { ProductItem, DivisionSlug } from "@/data/products";
import { SmartProductImage } from "./SmartProductImage";
import { useQuoteModal } from "./QuoteModalContext";

const DIVISION_NAMES: Record<DivisionSlug, string> = {
  rubber: "Rubber Products",
  steel: "Steel Products",
  aluminium: "Aluminium Products",
};

interface ProductCatalogViewProps {
  items: ProductItem[];
  showDivisionFilter?: boolean;
}

export function ProductCatalogView({
  items,
  showDivisionFilter = false,
}: ProductCatalogViewProps) {
  const { openQuoteModal } = useQuoteModal();
  const [divisionFilter, setDivisionFilter] = useState<"all" | DivisionSlug>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<ProductItem | null>(null);

  const divisionFiltered = useMemo(() => {
    if (!showDivisionFilter || divisionFilter === "all") return items;
    return items.filter((item) => item.division === divisionFilter);
  }, [items, showDivisionFilter, divisionFilter]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(divisionFiltered.map((i) => i.category)));
    return ["All", ...unique];
  }, [divisionFiltered]);

  const filteredItems = useMemo(() => {
    return divisionFiltered.filter((item) => {
      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.materialBadge.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.specs.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [divisionFiltered, categoryFilter, query]);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Division tabs when viewing All Products */}
          {showDivisionFilter ? (
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: "all", label: `All Divisions (${items.length})` },
                  { id: "rubber", label: "Rubber Products" },
                  { id: "steel", label: "Steel Products" },
                  { id: "aluminium", label: "Aluminium Products" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setDivisionFilter(tab.id);
                    setCategoryFilter("All");
                  }}
                  className={`rounded-xs px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
                    divisionFilter === tab.id
                      ? "bg-carbon-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <SlidersHorizontal className="h-3.5 w-3.5 text-forge-600" />
              <span>Filter by Compound / Process Category</span>
            </div>
          )}

          {/* Search input */}
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Viton, 6061, flange, seal..."
              className="w-full rounded-xs border border-slate-300 bg-slate-50 pl-9 pr-8 py-2 text-xs text-carbon-900 placeholder:text-slate-400 focus:border-forge-600 focus:bg-white focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-carbon-900"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-xs px-3 py-1 text-xs font-medium transition cursor-pointer ${
                categoryFilter === cat
                  ? "bg-forge-600 text-white font-semibold"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-carbon-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Result Count */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing <strong className="text-carbon-900">{filteredItems.length}</strong>{" "}
          custom-manufactured component configurations
        </span>
        <span className="hidden sm:inline font-mono text-[11px]">
          CUSTOM CAD / SAMPLE TOOLING AVAILABLE FOR ALL ITEMS
        </span>
      </div>

      {/* Product Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-sm border border-slate-200 bg-white p-12 text-center">
          <p className="font-display text-lg font-bold text-carbon-900">
            No catalog items matched &ldquo;{query}&rdquo;
          </p>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            We manufacture bespoke parts to any drawing or sample. Request a custom quote directly from our engineering team.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategoryFilter("All");
              }}
              className="rounded-xs border border-slate-300 px-4 py-2 text-xs font-semibold text-carbon-900 hover:bg-slate-50"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={() => openQuoteModal({ partName: query })}
              className="rounded-xs bg-forge-600 px-4 py-2 text-xs font-semibold text-white hover:bg-forge-700"
            >
              Request Custom Quote for &ldquo;{query}&rdquo;
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col rounded-sm border border-slate-200 bg-white overflow-hidden shadow-2xs hover:border-slate-300 hover:shadow-md transition"
            >
              {/* Image Container */}
              <div
                onClick={() => setSelectedItem(item)}
                className="relative aspect-[16/11] w-full overflow-hidden bg-slate-100 cursor-pointer border-b border-slate-100"
              >
                <SmartProductImage
                  src={item.remoteImage}
                  fallbackSrc={item.fallbackImage}
                  alt={item.name}
                  className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="inline-block rounded-xs bg-carbon-900/90 backdrop-blur-xs px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-white">
                    {item.materialBadge}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-5">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-forge-600">
                  {item.category}
                </div>
                <h3
                  onClick={() => setSelectedItem(item)}
                  className="mt-1 font-display text-base font-bold text-carbon-900 group-hover:text-forge-600 transition cursor-pointer"
                >
                  {item.name}
                </h3>
                <p className="mt-1 font-mono text-[11px] text-slate-500">
                  {item.specs}
                </p>
                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed flex-1">
                  {item.description}
                </p>

                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="text-xs font-semibold text-slate-600 hover:text-carbon-900 cursor-pointer"
                  >
                    Spec Details
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openQuoteModal({
                        division: DIVISION_NAMES[item.division],
                        partName: `${item.name} (${item.materialBadge})`,
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-xs bg-carbon-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-forge-600 transition cursor-pointer"
                  >
                    Request Quote
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Technical Detail Quick-View Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-carbon-950/75 p-4 backdrop-blur-xs"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative w-full max-w-2xl rounded-sm border border-slate-200 bg-white overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-carbon-900 px-5 py-3.5 text-white">
              <span className="font-mono text-xs uppercase tracking-widest text-forge-400">
                {DIVISION_NAMES[selectedItem.division]} · {selectedItem.category}
              </span>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-xs p-1 text-slate-300 hover:bg-carbon-800 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="aspect-square bg-slate-100">
                <SmartProductImage
                  src={selectedItem.remoteImage}
                  fallbackSrc={selectedItem.fallbackImage}
                  alt={selectedItem.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-6 flex flex-col justify-between space-y-4">
                <div>
                  <span className="inline-block rounded-xs bg-forge-50 border border-forge-200 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-forge-700">
                    {selectedItem.materialBadge}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-bold text-carbon-900">
                    {selectedItem.name}
                  </h3>
                  <p className="mt-1 font-mono text-xs text-slate-500">
                    {selectedItem.specs}
                  </p>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                    {selectedItem.description}
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <li>• Manufactured per your 2D/3D CAD or physical sample</li>
                    <li>• 100% dimensional &amp; compound conformity check</li>
                    <li>• Free 3–4 day global door delivery via DHL / FedEx</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const item = selectedItem;
                    setSelectedItem(null);
                    openQuoteModal({
                      division: DIVISION_NAMES[item.division],
                      partName: `${item.name} (${item.materialBadge})`,
                    });
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xs bg-forge-600 px-4 py-3 text-sm font-semibold text-white hover:bg-forge-700 transition cursor-pointer"
                >
                  Request Quote for This Component
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
