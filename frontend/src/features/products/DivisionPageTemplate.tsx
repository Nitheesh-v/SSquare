import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  Check,
  MessageSquare,
  Phone,
} from "lucide-react";
import { type DivisionInfo, type ProductItem } from "@/lib/catalog-data";
import { COMPANY_INFO } from "@/lib/company-data";
import { ProductCatalogView } from "./ProductCatalogView";
import { OpenQuoteButton } from "@/components/shared/OpenQuoteButton";
import { SmartProductImage } from "@/components/shared/SmartProductImage";
import { Reveal } from "@/components/shared/MotionPrimitives";

export function DivisionPageTemplate({
  division,
  products,
  technicalNoteTitle,
  technicalNoteParagraphs,
}: {
  division: DivisionInfo;
  products: ProductItem[];
  technicalNoteTitle: string;
  technicalNoteParagraphs: string[];
}) {
  return (
    <>
      <section className="border-b border-carbon-800 bg-carbon-950 py-12 text-white lg:py-20">
        <div className="shell">
          <Link
            href="/categories"
            className="inline-flex min-h-11 items-center gap-2 font-mono text-[10px] tracking-wide text-slate-300 hover:text-forge-300"
          >
            <ArrowLeft size={13} />
            ALL MANUFACTURING DIVISIONS
          </Link>
          <div className="mt-6 grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="eyebrow text-forge-300">{division.code}</p>
              <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
                {division.shortTitle}
              </h1>
              <p className="mt-6 max-w-2xl text-sm leading-[1.9] text-slate-300">
                {division.heroTagline}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <OpenQuoteButton
                  label="Request a Quote"
                  prefill={{ division: division.name }}
                />
                <a href="#division-components" className="button-dark-outline">
                  Explore components
                  <ArrowDown size={15} />
                </a>
              </div>
              <p className="mt-7 font-mono text-[10px] tracking-wide text-slate-400">
                CUSTOM MANUFACTURE / DRAWING OR SAMPLE BASED
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="aspect-square border border-white/20 bg-slate-100">
                <SmartProductImage
                  src={division.heroImage}
                  illustrative={division.illustrative}
                  fallbackSrc={division.fallbackImage}
                  alt={`${division.name} — S Square Engineering Services`}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-3 font-mono text-[9px] text-slate-400">
                MATERIAL & GEOMETRY CONFIRMED AGAINST YOUR REQUIREMENT
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="border-b border-slate-200 bg-white py-16 lg:py-20">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow text-forge-700">ENGINEERING OVERVIEW</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              {technicalNoteTitle}
            </h2>
            {technicalNoteParagraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-5 text-sm leading-[1.9] text-slate-600"
              >
                {paragraph}
              </p>
            ))}
            <p className="mt-6 border-t border-slate-200 pt-4 font-mono text-[10px] leading-relaxed text-slate-500">
              General material guidance only. Final grade, operating limits,
              finish and inspection requirements must be agreed for your
              application.
            </p>
          </Reveal>
          <Reveal className="border border-slate-200 bg-slate-50 p-6 sm:p-8 lg:col-span-5">
            <p className="eyebrow text-forge-700">
              CAPABILITIES / {division.slug.toUpperCase()}
            </p>
            <ul className="mt-5 space-y-3.5">
              {division.keyCapabilities.map((capability) => (
                <li
                  key={capability}
                  className="flex items-start gap-3 text-xs leading-relaxed text-slate-600"
                >
                  <Check size={15} className="mt-0.5 shrink-0 text-forge-700" />
                  {capability}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-5">
              {division.keyMaterials.map((material) => (
                <span
                  className="border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-[9px] text-slate-600"
                  key={material}
                >
                  {material}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
      <section
        id="division-components"
        className="border-b border-slate-200 bg-[#f7f8fa] py-16 lg:py-20"
      >
        <div className="shell">
          <div className="mb-8">
            <p className="eyebrow text-forge-700">CUSTOM COMPONENT RANGE</p>
            <h2 className="mt-3 font-display text-4xl font-semibold">
              Explore {division.name.toLowerCase()}
            </h2>
            <p className="mt-3 max-w-2xl text-xs leading-relaxed text-slate-600">
              Component types and material options for your next enquiry. These
              are custom-manufacturing examples, not priced or in-stock
              products.
            </p>
          </div>
          <ProductCatalogView items={products} />
        </div>
      </section>
      <section className="bg-white py-12">
        <div className="shell flex flex-wrap items-center justify-between gap-7">
          <div>
            <h2 className="font-display text-3xl font-semibold">
              Have a drawing, sample or specific application?
            </h2>
            <div className="mt-4 flex flex-wrap gap-5 text-xs text-slate-600">
              <a
                href={`tel:${COMPANY_INFO.phoneRaw}`}
                className="inline-flex items-center gap-2 py-2 hover:text-forge-700"
              >
                <Phone size={15} />
                {COMPANY_INFO.phone}
              </a>
              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-2 hover:text-forge-700"
              >
                <MessageSquare size={15} />
                WhatsApp S Square
              </a>
            </div>
          </div>
          <OpenQuoteButton
            label="Request a Quote"
            prefill={{ division: division.name }}
          />
        </div>
      </section>
    </>
  );
}
