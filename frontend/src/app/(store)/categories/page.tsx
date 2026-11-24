import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { DIVISIONS } from "@/lib/catalog-data";
import { OpenQuoteButton } from "@/components/shared/OpenQuoteButton";
import { SmartProductImage } from "@/components/shared/SmartProductImage";
import { Reveal } from "@/components/shared/MotionPrimitives";

export const metadata: Metadata = {
  title: "Manufacturing Divisions — Rubber, Steel & Aluminium",
  description:
    "Explore S Square’s custom molded rubber and bonded seals, steel and stainless components, and aluminium parts and die molds.",
};
export default function CategoriesPage() {
  return (
    <>
      <section className="border-b border-carbon-800 bg-carbon-950 py-16 text-white lg:py-24">
        <div className="shell">
          <p className="eyebrow text-forge-300">OUR MANUFACTURING DIVISIONS</p>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
            Three materials.
            <br />A world of custom possibilities.
          </h1>
          <p className="mt-7 max-w-2xl text-sm leading-[1.9] text-slate-300">
            Explore the material families and component types we manufacture.
            Your drawing, sample and application set the final specification.
          </p>
        </div>
      </section>
      <section className="bg-[#f7f8fa] py-16 lg:py-24">
        <div className="shell space-y-12">
          {[DIVISIONS.rubber, DIVISIONS.steel, DIVISIONS.aluminium].map(
            (division, index) => (
              <Reveal
                key={division.slug}
                className="grid items-center gap-8 border border-slate-200 bg-white p-5 sm:p-8 lg:grid-cols-2 lg:gap-12"
              >
                <Link
                  href={`/products/${division.slug}`}
                  aria-label={`Explore ${division.name}`}
                  className={`block aspect-[5/4] overflow-hidden border border-slate-200 ${index % 2 ? "lg:order-2" : ""}`}
                >
                  <SmartProductImage
                    src={division.heroImage}
                    illustrative={division.illustrative}
                    fallbackSrc={division.fallbackImage}
                    alt={division.name}
                    className="h-full w-full object-cover"
                  />
                </Link>
                <div className={index % 2 ? "lg:order-1" : ""}>
                  <p className="eyebrow text-forge-700">
                    DIVISION 0{index + 1}
                  </p>
                  <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
                    {division.name}
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">
                    {division.summary}
                  </p>
                  <ul className="mt-5 space-y-3">
                    {division.keyCapabilities.slice(0, 3).map((capability) => (
                      <li
                        key={capability}
                        className="flex items-start gap-2 text-xs leading-relaxed text-slate-600"
                      >
                        <Check
                          size={15}
                          className="mt-0.5 shrink-0 text-forge-700"
                        />
                        {capability}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      className="button-secondary"
                      href={`/products/${division.slug}`}
                    >
                      Explore {division.slug}
                      <ArrowUpRight size={15} />
                    </Link>
                    <OpenQuoteButton
                      label="Request a Quote"
                      prefill={{ division: division.name }}
                    />
                  </div>
                </div>
              </Reveal>
            ),
          )}
        </div>
      </section>
    </>
  );
}
