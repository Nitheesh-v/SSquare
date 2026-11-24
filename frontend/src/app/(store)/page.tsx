import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Wrench,
  ShieldCheck,
  Truck,
  Phone,
} from "lucide-react";
import { Hero3DKeychain } from "@/features/products/Hero3DKeychain";
import { ScrollBoostTicker } from "@/features/products/ScrollBoostTicker";
import { TimelineStatementSection } from "@/features/products/TimelineStatementSection";
import { FeaturedProductsCarousel } from "@/features/products/FeaturedProductsCarousel";
import { OpenQuoteButton } from "@/components/shared/OpenQuoteButton";
import { StatsAndQuickService } from "@/components/shared/StatsAndQuickService";
import { QuoteForm } from "@/features/checkout/QuoteForm";
import { COMPANY_INFO } from "@/lib/company-data";
import { DIVISIONS } from "@/lib/catalog-data";

const OUR_SERVICES = [
  {
    number: "01.",
    title: "Customization",
    description:
      "We provide high-quality custom rubber/aluminum/steel products as per your drawings/samples.",
    icon: Wrench,
  },
  {
    number: "02.",
    title: "Quality Assurance",
    description:
      "We provide you an output with 100% Conformity to technical specifications, ensuring high quality and durability.",
    icon: ShieldCheck,
  },
  {
    number: "03.",
    title: "Free Door Delivery",
    description:
      "We provide free door delivery through DHL/FEDEX within 3-4 days to any part of the world.",
    icon: Truck,
  },
];

export default function StoreHomePage() {
  const divisionList = [DIVISIONS.rubber, DIVISIONS.steel, DIVISIONS.aluminium];

  return (
    <>
      {/* 1. Curtain Loader + Live 3D Rigid-Body Industrial Keychain Hero */}
      <Hero3DKeychain />

      {/* 2. Scroll-Velocity Boosted Capabilities & Materials Ticker */}
      <ScrollBoostTicker />

      {/* 3. Interactive Multi-Track Production Timeline ⇄ Statement FLIP Flight */}
      <TimelineStatementSection />

      {/* 4. Explore Our Products (Rubber, Steel & Aluminium Divisions) */}
      <section className="py-18 lg:py-24 bg-white border-t border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-widest text-forge-600">
                Explore Our Products
              </span>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-carbon-950">
                Rubber, Steel &amp; Aluminium — Made to Your Specification
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 font-display text-sm font-bold text-carbon-950 hover:text-forge-600 transition-colors shrink-0"
            >
              Browse Full Catalog
              <ArrowRight className="h-4 w-4 text-forge-600" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
            {divisionList.map((div) => (
              <div
                key={div.slug}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-slate-300 hover:shadow-lg transition-shadow"
              >
                <Link
                  href={`/products/${div.slug}`}
                  className="relative aspect-[16/10] w-full overflow-hidden bg-carbon-950 block"
                >
                  <img
                    src={div.heroImage}
                    alt={div.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-carbon-950/75 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white">
                      {div.name}
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-carbon-900/80 text-white group-hover:bg-forge-600 transition-colors">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>

                <div className="flex flex-1 flex-col p-6">
                  <Link href={`/products/${div.slug}`}>
                    <h3 className="font-display text-2xl font-bold text-carbon-950 group-hover:text-forge-600 transition-colors">
                      {div.name}
                    </h3>
                  </Link>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {div.shortTitle}
                  </p>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed flex-1">
                    {div.summary}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {div.keyMaterials.slice(0, 5).map((mat) => (
                      <span
                        key={mat}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link
                      href={`/products/${div.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-carbon-950 hover:text-forge-600 transition-colors"
                    >
                      Explore {div.name}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    <OpenQuoteButton
                      label="Quote"
                      variant="outline"
                      prefill={{ division: div.name }}
                      className="!px-3.5 !py-1.5 !text-xs !rounded-md"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured Custom Components Carousel */}
      <section className="py-16 lg:py-20 bg-[#f8fafc] border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FeaturedProductsCarousel />
        </div>
      </section>

      {/* 6. Our Services (3 White Cards Over Deep Navy) */}
      <section className="py-18 lg:py-22 bg-[#0d1324]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-forge-400">
              Services
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-white">
              Our Services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {OUR_SERVICES.map((srv) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.number}
                  className="bg-white rounded-md p-8 text-center shadow-md flex flex-col items-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forge-50 text-forge-600 mb-4">
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="text-xs font-bold text-forge-600">
                    {srv.number}
                  </span>
                  <h3 className="mt-1 font-display text-xl font-bold text-[#0d1324]">
                    {srv.title}
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-xs">
                    {srv.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Stats Band (7 / 50+ / 15+) + Split Crimson "QUICK SERVICE ON YOUR NEEDS" Banner */}
      <StatsAndQuickService />

      {/* 8. Direct RFQ Form */}
      <section id="rfq" className="py-18 lg:py-24 bg-[#f8fafc]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-forge-600">
                Get a Free Quote
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-carbon-950">
                Send Us Your Custom Part Specifications
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Reach out to our engineering team Monday through Saturday for
                custom tooling estimates, compound recommendations, and timely
                production scheduling.
              </p>

              <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Direct Engineering Desk (Mon – Sat)
                  </div>
                  <a
                    href={`tel:${COMPANY_INFO.phoneRaw}`}
                    className="mt-1 inline-flex items-center gap-2 font-display text-2xl font-bold text-carbon-950 hover:text-forge-600 transition-colors"
                  >
                    <Phone className="h-5 w-5 text-forge-600" />
                    {COMPANY_INFO.phone}
                  </a>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Sales &amp; CAD Drawing Submissions
                  </div>
                  <a
                    href={`mailto:${COMPANY_INFO.emails.sales}`}
                    className="mt-1 block text-sm font-semibold text-forge-600 hover:underline"
                  >
                    {COMPANY_INFO.emails.sales}
                  </a>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Manufacturing Facility
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {COMPANY_INFO.address.full}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="mb-5 pb-4 border-b border-slate-100">
                <h3 className="font-display text-xl font-bold text-carbon-950">
                  Submit Custom Part Specifications
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  All custom drawings and proprietary OEM specifications are
                  handled under strict confidentiality.
                </p>
              </div>
              <QuoteForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
