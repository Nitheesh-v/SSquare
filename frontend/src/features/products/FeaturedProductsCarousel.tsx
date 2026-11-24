"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { ALL_PRODUCTS } from "@/lib/catalog-data";
import { SmartProductImage } from "@/components/shared/SmartProductImage";
import { useReducedMotion } from "@/components/shared/MotionPrimitives";
import { useQuoteModal } from "@/hooks";

const FEATURED_IDS = [
  "rb-metal-viton-bonded",
  "al-die-molds",
  "st-valve-manifolds",
  "rb-silicone-gasket",
  "al-6061-machined",
  "st-flanges-couplings",
  "rb-metal-hnbr-bonded",
  "al-extruded-profiles",
  "st-cnc-shafts",
];
const FEATURED = FEATURED_IDS.map((id) =>
  ALL_PRODUCTS.find((item) => item.id === id),
).filter((item) => item !== undefined);

export function FeaturedProductsCarousel() {
  const { openQuoteModal } = useQuoteModal();
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [position, setPosition] = useState({
    first: 1,
    last: 3,
    back: false,
    next: true,
  });
  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const sync = () => {
      const card = node.firstElementChild as HTMLElement | null;
      if (!card) return;
      const width = card.offsetWidth + 20;
      const first = Math.round(node.scrollLeft / width) + 1;
      const shown = Math.max(1, Math.round(node.clientWidth / width));
      setPosition({
        first,
        last: Math.min(FEATURED.length, first + shown - 1),
        back: node.scrollLeft > 8,
        next: node.scrollLeft < node.scrollWidth - node.clientWidth - 8,
      });
    };
    const resize = new ResizeObserver(sync);
    resize.observe(node);
    node.addEventListener("scroll", sync, { passive: true });
    sync();
    return () => {
      resize.disconnect();
      node.removeEventListener("scroll", sync);
    };
  }, []);
  const move = (direction: number) => {
    const node = track.current;
    if (!node) return;
    const width =
      (node.firstElementChild as HTMLElement)?.offsetWidth || node.clientWidth;
    node.scrollBy({
      left: direction * (width + 20),
      behavior: reduced ? "instant" : "smooth",
    });
  };
  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="font-mono text-[10px] tracking-wider text-slate-500">
          {String(position.first).padStart(2, "0")} —{" "}
          {String(position.last).padStart(2, "0")}{" "}
          <span className="mx-2 text-slate-300">/</span>{" "}
          {String(FEATURED.length).padStart(2, "0")}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous featured component"
            disabled={!position.back}
            onClick={() => move(-1)}
            className="flex h-11 w-11 items-center justify-center border border-slate-300 text-carbon-900 hover:border-forge-600 disabled:opacity-30"
          >
            <ChevronLeft size={19} />
          </button>
          <button
            type="button"
            aria-label="Next featured component"
            disabled={!position.next}
            onClick={() => move(1)}
            className="flex h-11 w-11 items-center justify-center border border-slate-300 text-carbon-900 hover:border-forge-600 disabled:opacity-30"
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </div>
      <div
        ref={track}
        role="region"
        aria-label="Featured components — scroll horizontally for more"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            move(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-color:#94a3b8_transparent] [scrollbar-width:thin]"
      >
        {FEATURED.map((item) => (
          <article
            key={item.id}
            className="group flex shrink-0 basis-[88%] snap-start flex-col overflow-hidden border border-slate-200 bg-white sm:basis-[calc(50%-10px)] lg:basis-[calc(33.333%-14px)]"
          >
            <Link
              href={`/products/${item.division}`}
              className="relative block aspect-[5/4] overflow-hidden border-b border-slate-200"
              aria-label={`Explore ${item.name}`}
            >
              <SmartProductImage
                src={item.remoteImage}
                fallbackSrc={item.fallbackImage}
                alt={item.name}
                className="product-card-image h-full w-full object-cover"
              />
              <span className="absolute bottom-3 left-3 bg-carbon-950 px-2.5 py-1.5 font-mono text-[9px] text-white">
                {item.materialBadge}
              </span>
            </Link>
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <p className="eyebrow text-forge-700">
                {item.division} / {item.category}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">
                {item.name}
              </h3>
              <p className="mt-3 flex-1 text-xs leading-[1.8] text-slate-600">
                {item.description}
              </p>
              <button
                type="button"
                onClick={() =>
                  openQuoteModal({
                    division: `${item.division.charAt(0).toUpperCase()}${item.division.slice(1)} Products`,
                    partName: item.name,
                  })
                }
                className="mt-5 flex min-h-11 items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs font-semibold hover:text-forge-700"
              >
                Request a Quote
                <ArrowUpRight size={16} className="text-forge-700" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
