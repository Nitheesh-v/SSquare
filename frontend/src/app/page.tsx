import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FileSpreadsheet,
  Wrench,
  Microscope,
  Plane,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { HeroShowcase } from "@/components/HeroShowcase";
import { MaterialSelector } from "@/components/MaterialSelector";
import { OpenQuoteButton } from "@/components/OpenQuoteButton";
import { QuoteForm } from "@/components/QuoteForm";
import {
  COMPANY_INFO,
  CORE_SERVICES,
  INDUSTRIES_SERVED,
} from "@/data/company";
import { DIVISIONS } from "@/data/products";

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Share Drawing or Sample",
    description:
      "Send 2D/3D CAD files (STEP, IGES, DWG, PDF) or ship a physical reference sample for precision reverse engineering.",
    icon: FileSpreadsheet,
  },
  {
    step: "02",
    title: "Tooling & Compounding",
    description:
      "In-house mold/die cavity machining and certified polymer or metal grade selection tailored to your environment.",
    icon: Wrench,
  },
  {
    step: "03",
    title: "Precision Production & QC",
    description:
      "Compression/injection molding, multi-axis CNC machining, and 100% dimensional & Shore A durometer verification.",
    icon: Microscope,
  },
  {
    step: "04",
    title: "3–4 Day Global Delivery",
    description:
      "Export-grade protective packaging with complimentary door-to-door air shipping via DHL & FedEx worldwide.",
    icon: Plane,
  },
];

export default function HomePage() {
  const divisionList = [DIVISIONS.rubber, DIVISIONS.steel, DIVISIONS.aluminium];

  return (
    <>
      {/* 1. Interactive Precision Hero */}
      <HeroShowcase />

      {/* 2. Three Manufacturing Divisions Showcase */}
      <section className="py-18 lg:py-24 bg-blueprint-light border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-600">
                Manufacturing Divisions // Under One Roof
              </span>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-carbon-900">
                Custom Rubber, Steel &amp; Aluminium Engineered to Specification
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 font-display text-sm font-bold text-carbon-900 hover:text-forge-600 transition shrink-0"
            >
              Browse Complete Component Catalog
              <ArrowRight className="h-4 w-4 text-forge-600" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
            {divisionList.map((div) => (
              <div
                key={div.slug}
                className="group flex flex-col rounded-sm border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-slate-300 hover:shadow-lg transition"
              >
                {/* Framed Image */}
                <Link
                  href={`/products/${div.slug}`}
                  className="relative aspect-[16/10] w-full overflow-hidden bg-carbon-950 block"
                >
                  <img
                    src={div.heroImage}
                    alt={div.name}
                    className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-carbon-950/75 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-forge-400">
                      {div.code}
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-xs bg-white/15 backdrop-blur-xs text-white group-hover:bg-forge-600 transition">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>

                {/* Body */}
                <div className="flex flex-1 flex-col p-6">
                  <Link href={`/products/${div.slug}`}>
                    <h3 className="font-display text-2xl font-bold text-carbon-900 group-hover:text-forge-600 transition">
                      {div.name}
                    </h3>
                  </Link>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {div.shortTitle}
                  </p>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed flex-1">
                    {div.summary}
                  </p>

                  {/* Material Chips */}
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {div.keyMaterials.slice(0, 5).map((mat) => (
                      <span
                        key={mat}
                        className="rounded-xs border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] font-medium text-slate-700"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link
                      href={`/products/${div.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-carbon-900 hover:text-forge-600 transition"
                    >
                      Explore {div.name}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    <OpenQuoteButton
                      label="Quote"
                      variant="outline"
                      prefill={{ division: div.name }}
                      className="!px-3 !py-1.5 !text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Who We Are + Quality Metrology Feature */}
      <section className="py-18 lg:py-24 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-600">
                About S Square Engineering Services
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-carbon-900 leading-tight">
                Your Long-Term Custom Manufacturing Partner—Not Just a Supplier.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Headquartered in <strong className="text-carbon-900">Coimbatore, India’s precision engineering hub</strong>, S Square Engineering Services is a custom manufacturer and global exporter specializing in{" "}
                <strong className="text-carbon-900">Rubber, Steel, and Aluminium products</strong> for industrial, commercial, and OEM clients.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Because we machine metal inserts, mill aluminium die molds, and compound/mold industrial elastomers under one coordinated roof, we eliminate multi-vendor delays—especially on complex{" "}
                <strong className="text-carbon-900">Rubber-to-Metal Bonded Seals</strong> and turnkey mechanical assemblies.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  "Custom Rubber Components & Bonded Seals",
                  "Stainless & Alloy Steel CNC & Fabricated Parts",
                  "Aluminium Die Molds, Profiles & 6061 Parts",
                  "Industrial Assemblies & Special-Purpose Parts",
                ].map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-2.5 rounded-xs border border-slate-200 bg-slate-50/70 p-3 text-xs font-semibold text-carbon-900"
                  >
                    <CheckCircle2 className="h-4 w-4 text-forge-600 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-xs bg-carbon-900 px-5 py-3 text-sm font-semibold text-white hover:bg-carbon-800 transition"
                >
                  More About Our Capabilities
                  <ArrowRight className="h-4 w-4 text-forge-500" />
                </Link>
                <Link
                  href="/infrastructure"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-forge-600 transition"
                >
                  Tour Our Infrastructure
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-sm border border-slate-200 bg-slate-50 p-2 shadow-xs sm:col-span-2">
                  <div className="aspect-[16/9] overflow-hidden bg-carbon-900">
                    <img
                      src="/images/quality-metrology.jpg"
                      alt="Precision metrology inspection at S Square Engineering"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between px-2 pt-2 pb-1 font-mono text-[11px] text-slate-500">
                    <span>QUALITY ASSURANCE // 100% DIMENSIONAL VERIFICATION</span>
                    <span className="font-semibold text-carbon-900">COIMBATORE HQ</span>
                  </div>
                </div>

                <div className="rounded-sm border border-slate-200 bg-carbon-900 p-5 text-white">
                  <div className="font-mono text-xs text-forge-400">EXPERIENCE</div>
                  <div className="mt-1 font-display text-3xl font-bold">20+ Years</div>
                  <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                    Proven track record crafting bespoke molded elastomers, precision steel, and aluminium tooling for global industries.
                  </p>
                </div>

                <div className="rounded-sm border border-slate-200 bg-slate-50 p-5">
                  <div className="font-mono text-xs font-semibold text-forge-600">
                    EXPRESS EXPORT
                  </div>
                  <div className="mt-1 font-display text-3xl font-bold text-carbon-900">
                    3–4 Days
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    Complimentary door-to-door international shipping via DHL &amp; FedEx to North America, Europe, Middle East &amp; Asia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Three Core Service Guarantees + 4-Step Custom Workflow */}
      <section className="py-18 lg:py-24 bg-carbon-950 text-white bg-blueprint-dark border-b border-carbon-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-500">
              Service Commitments // OEM Execution
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-white">
              Built for Zero-Defect Reliability &amp; Global Speed
            </h2>
          </div>

          {/* 3 Core Services from ssquareengg.com */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
            {CORE_SERVICES.map((srv) => (
              <div
                key={srv.number}
                className="rounded-sm border border-carbon-800 bg-carbon-900/90 p-7 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-carbon-800 pb-4 mb-5">
                    <span className="font-mono text-2xl font-bold text-forge-500">
                      {srv.number}.
                    </span>
                    <ShieldCheck className="h-5 w-5 text-slate-400" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">
                    {srv.title}
                  </h3>
                  <p className="mt-1 font-mono text-xs text-forge-400">
                    {srv.subtitle}
                  </p>
                  <p className="mt-3.5 text-sm text-slate-300 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <ul className="mt-6 pt-4 border-t border-carbon-800 space-y-2 text-xs text-slate-300">
                  {srv.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-forge-500 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* 4-Step Process Bar */}
          <div className="rounded-sm border border-carbon-800 bg-carbon-900/60 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <h3 className="font-display text-lg font-bold text-white">
                How Custom Orders Move From Drawing to Your Doorstep
              </h3>
              <span className="font-mono text-xs text-slate-400">
                TYPICAL RFQ RESPONSE: &lt; 24 HOURS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {WORKFLOW_STEPS.map((w) => {
                const Icon = w.icon;
                return (
                  <div key={w.step} className="relative space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xs bg-forge-600/15 border border-forge-500/40 text-forge-400">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-400">
                        STEP {w.step}
                      </span>
                    </div>
                    <h4 className="font-display text-base font-bold text-white">
                      {w.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {w.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive Material & Compound Engineering Matrix */}
      <section className="py-18 lg:py-24 bg-[#f8f9fb] border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-600">
              Technical Reference // Material Selection
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-carbon-900">
              Select the Right Elastomer, Steel, or Aluminium Alloy
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Filter across our core production grades below or send us your operating temperature and chemical environment for an engineering recommendation.
            </p>
          </div>

          <MaterialSelector />
        </div>
      </section>

      {/* 6. Industries We Serve */}
      <section className="py-18 lg:py-24 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-600">
              Sectors // Applications
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-carbon-900">
              Trusted Across Heavy-Duty Industrial Sectors
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INDUSTRIES_SERVED.map((ind) => (
              <div
                key={ind.code}
                className="rounded-sm border border-slate-200 bg-slate-50/60 p-6 hover:border-slate-300 hover:bg-white transition"
              >
                <span className="font-mono text-[11px] font-semibold text-forge-600">
                  {ind.code}
                </span>
                <h3 className="mt-1.5 font-display text-lg font-bold text-carbon-900">
                  {ind.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {ind.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Direct Embedded RFQ & Engineering Desk Section */}
      <section id="rfq" className="py-18 lg:py-24 bg-blueprint-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-6">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-600">
                Quick Service On Your Needs
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-carbon-900">
                Get a Factory-Direct Quote Within 24 Hours
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Reach out to our engineering team Monday through Saturday for custom tooling estimates, compound recommendations, and rapid export scheduling.
              </p>

              <div className="rounded-sm border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                    Direct Engineering Desk (Mon – Sat)
                  </div>
                  <a
                    href={`tel:${COMPANY_INFO.phoneRaw}`}
                    className="mt-1 inline-flex items-center gap-2 font-display text-2xl font-bold text-carbon-900 hover:text-forge-600 transition"
                  >
                    <Phone className="h-5 w-5 text-forge-600" />
                    {COMPANY_INFO.phone}
                  </a>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                    Sales &amp; CAD Drawing Submissions
                  </div>
                  <a
                    href={`mailto:${COMPANY_INFO.emails.sales}`}
                    className="mt-1 block font-mono text-sm font-semibold text-forge-600 hover:underline"
                  >
                    {COMPANY_INFO.emails.sales}
                  </a>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                    Manufacturing Facility
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {COMPANY_INFO.address.full}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-sm border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="mb-5 pb-4 border-b border-slate-100">
                <h3 className="font-display text-xl font-bold text-carbon-900">
                  Submit Custom Part Specifications
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  All custom drawings and proprietary OEM specifications are handled under strict confidentiality.
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
