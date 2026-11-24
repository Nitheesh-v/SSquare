"use client";

import { useId, useMemo, useState } from "react";
import { Search, ArrowUpRight, SlidersHorizontal, X, Eye } from "lucide-react";
import { type ProductItem, type DivisionSlug } from "@/lib/catalog-data";
import { SmartProductImage } from "@/components/shared/SmartProductImage";
import { Dialog } from "@/components/shared/Dialog";
import { useDebounce, useQuoteModal } from "@/hooks";

const DIVISION_NAMES: Record<DivisionSlug, string> = {
  rubber: "Rubber Products",
  steel: "Steel Products",
  aluminium: "Aluminium Products",
};

export function ProductCatalogView({
  items,
  showDivisionFilter = false,
}: {
  items: ProductItem[];
  showDivisionFilter?: boolean;
}) {
  const { openQuoteModal } = useQuoteModal();
  const id = useId();
  const [divisionFilter, setDivisionFilter] = useState<"all" | DivisionSlug>(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 150);
  const [selectedItem, setSelectedItem] = useState<ProductItem | null>(null);
  const divisionFiltered = useMemo(
    () =>
      !showDivisionFilter || divisionFilter === "all"
        ? items
        : items.filter((item) => item.division === divisionFilter),
    [items, showDivisionFilter, divisionFilter],
  );
  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(divisionFiltered.map((item) => item.category))),
    ],
    [divisionFiltered],
  );
  const filteredItems = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return divisionFiltered.filter(
      (item) =>
        (categoryFilter === "All" || item.category === categoryFilter) &&
        (!q ||
          [item.name, item.materialBadge, item.description, item.specs].some(
            (text) => text.toLowerCase().includes(q),
          )),
    );
  }, [divisionFiltered, categoryFilter, debouncedQuery]);
  const requestQuote = (item: ProductItem) => {
    setSelectedItem(null);
    openQuoteModal({
      division: DIVISION_NAMES[item.division],
      partName: `${item.name} (${item.materialBadge})`,
    });
  };

  return (
    <div className="catalog-view space-y-6">
      <div className="catalog-controls space-y-4 border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          {showDivisionFilter ? (
            <div
              className="flex flex-wrap gap-1.5"
              role="group"
              aria-label="Filter by manufacturing division"
            >
              {(
                [
                  { id: "all", label: `All divisions (${items.length})` },
                  { id: "rubber", label: "Rubber" },
                  { id: "steel", label: "Steel" },
                  { id: "aluminium", label: "Aluminium" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={divisionFilter === tab.id}
                  onClick={() => {
                    setDivisionFilter(tab.id);
                    setCategoryFilter("All");
                  }}
                  className={`min-h-11 border px-3.5 py-2 text-xs font-semibold transition-colors ${divisionFilter === tab.id ? "border-carbon-900 bg-carbon-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-slate-600">
              <SlidersHorizontal size={14} className="text-forge-700" />
              Filter by material or component type
            </p>
          )}
          <div className="relative w-full md:w-72 md:shrink-0">
            <label htmlFor={`${id}-search`} className="sr-only">
              Search components by name, material or application
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <input
              id={`${id}-search`}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Viton, 6061, seal…"
              className="min-h-11 w-full border border-slate-300 bg-slate-50 py-2 pl-9 pr-10 text-xs text-carbon-900 placeholder:text-slate-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear component search"
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-slate-50 text-slate-600 hover:text-carbon-900"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
        <div
          className="flex flex-wrap gap-1.5 border-t border-slate-200 pt-4"
          role="group"
          aria-label="Filter by component category"
        >
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={categoryFilter === category}
              onClick={() => setCategoryFilter(category)}
              className={`min-h-10 border px-3 py-2 text-[11px] font-medium transition-colors ${categoryFilter === category ? "border-forge-600 bg-forge-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"}`}
            >
              {category === "All" ? "All categories" : category}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] text-slate-600">
        <p aria-live="polite" aria-atomic="true">
          <strong className="text-carbon-900">{filteredItems.length}</strong>{" "}
          component {filteredItems.length === 1 ? "type" : "types"} shown
        </p>
        <span>MADE TO DRAWING OR SAMPLE · QUOTED PER PROJECT</span>
      </div>
      {!filteredItems.length ? (
        <div className="border border-slate-200 bg-white p-8 text-center sm:p-12">
          <h3 className="font-display text-2xl font-semibold">
            No components matched your filters.
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
            Can’t see your component? Share your drawing or sample requirements
            for a feasibility review.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className="button-secondary"
              onClick={() => {
                setQuery("");
                setCategoryFilter("All");
                setDivisionFilter("all");
              }}
            >
              Reset all filters
            </button>
            <button
              type="button"
              className="button-primary"
              onClick={() => openQuoteModal({ partName: query })}
            >
              Request a Quote
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="catalog-card group flex flex-col overflow-hidden border border-slate-200 bg-white transition-shadow hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => setSelectedItem(item)}
                aria-label={`View details: ${item.name}`}
                className="relative block aspect-[5/4] w-full overflow-hidden border-b border-slate-200 bg-slate-100 text-left"
              >
                <SmartProductImage
                  src={item.remoteImage}
                  fallbackSrc={item.fallbackImage}
                  alt={item.name}
                  className="product-card-image h-full w-full object-cover"
                />
                <span className="absolute bottom-3 left-3 max-w-[90%] bg-carbon-950 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-wider text-white">
                  {item.materialBadge}
                </span>
              </button>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="eyebrow text-forge-700">{item.category}</p>
                <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">
                  <button
                    type="button"
                    className="text-left transition-colors hover:text-forge-700"
                    onClick={() => setSelectedItem(item)}
                  >
                    {item.name}
                  </button>
                </h3>
                <p className="mt-2 text-[11px] font-medium leading-relaxed text-slate-500">
                  {item.specs}
                </p>
                <p className="mt-3 flex-1 text-xs leading-[1.8] text-slate-600">
                  {item.description}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center gap-1.5 px-1 text-[11px] font-semibold text-slate-700 hover:text-forge-700"
                    onClick={() => setSelectedItem(item)}
                    aria-label={`Quick specs for ${item.name}`}
                  >
                    <Eye size={15} />
                    Quick Specs
                  </button>
                  <button
                    type="button"
                    onClick={() => requestQuote(item)}
                    className="catalog-quote inline-flex min-h-11 items-center gap-2 border border-slate-300 px-3 py-2 text-[11px] font-semibold hover:border-forge-600 hover:text-forge-700"
                  >
                    Request a Quote
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <Dialog
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        labelledBy={`${id}-detail-title`}
      >
        {selectedItem && (
          <>
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/15 bg-carbon-900 px-5 py-3 text-white">
              <span className="eyebrow text-forge-300">
                {DIVISION_NAMES[selectedItem.division]} / COMPONENT DETAILS
              </span>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                aria-label="Close component details"
                className="flex h-10 w-10 shrink-0 items-center justify-center hover:bg-carbon-800"
              >
                <X size={19} />
              </button>
            </div>
            <div className="grid md:grid-cols-2">
              <div className="aspect-[5/4] self-start bg-slate-100 md:aspect-square">
                <SmartProductImage
                  src={selectedItem.remoteImage}
                  fallbackSrc={selectedItem.fallbackImage}
                  alt={selectedItem.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6">
                <p className="eyebrow text-forge-700">
                  {selectedItem.materialBadge}
                </p>
                <h3
                  id={`${id}-detail-title`}
                  className="mt-3 font-display text-3xl font-semibold leading-tight"
                >
                  {selectedItem.name}
                </h3>
                <p className="mt-3 text-xs font-medium leading-relaxed text-slate-500">
                  {selectedItem.specs}
                </p>
                <p className="mt-4 text-xs leading-[1.85] text-slate-600">
                  {selectedItem.description}
                </p>
                <p className="mt-5 border-t border-slate-200 pt-4 text-[11px] leading-relaxed text-slate-600">
                  Material, geometry, quantity and inspection requirements are
                  agreed against your drawing or sample. This is a component
                  overview, not an in-stock item or a technical datasheet.
                </p>
                <button
                  type="button"
                  onClick={() => requestQuote(selectedItem)}
                  className="button-primary mt-6 w-full justify-center"
                >
                  Request a Quote
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
}
