import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  Award,
  Globe2,
  ArrowRight,
  Users,
} from "lucide-react";
import { COMPANY_INFO, INDUSTRIES_SERVED } from "@/lib/company-data";
import { OpenQuoteButton } from "@/components/shared/OpenQuoteButton";

export const metadata: Metadata = {
  title: "About Us – 20+ Years of Custom Manufacturing Excellence",
  description:
    "Learn about S Square Engineering Services in Peelamedu, Coimbatore—your trusted custom manufacturer for Rubber, Steel, and Aluminium industrial solutions.",
};

const CORE_STRENGTHS = [
  {
    title: "Custom Manufacturing Expertise",
    description:
      "Over 20 years converting complex OEM 2D/3D CAD prints and physical samples into repeatable, tight-tolerance components.",
  },
  {
    title: "Certified Raw Materials",
    description:
      "Virgin industrial elastomers (Viton, Silicone, HNBR, EPDM), high-chromium SS 304/316 steels, and certified 6061/7075 aluminium billets.",
  },
  {
    title: "Integrated Production Under One Roof",
    description:
      "In-house mold/die tooling, rubber vulcanization, CNC machining, and sheet fabrication eliminate multi-vendor handoffs.",
  },
  {
    title: "Skilled Engineering & Tooling Team",
    description:
      "Hands-on metallurgists, polymer technologists, and CNC programmers supporting DFM, material selection, and rapid prototyping.",
  },
  {
    title: "Global 3–4 Day Doorstep Delivery",
    description:
      "Streamlined export logistics from Coimbatore via DHL and FedEx with complimentary global door delivery in 3–4 business days.",
  },
  {
    title: "100% Specification Conformity",
    description:
      "Rigorous first-article and batch metrology checks ensuring every shipment matches approved tolerances and durometer specs.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="bg-carbon-950 text-white bg-blueprint-dark border-b border-carbon-800 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-400">
              ABOUT S SQUARE ENGINEERING SERVICES
            </span>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-white leading-tight">
              Complete Custom Solutions for Rubber, Steel &amp; Aluminium Needs
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Based in Peelamedu, Coimbatore, we are a custom manufacturer and global supplier serving industrial, commercial, and OEM clients with precision-built components engineered for reliability and long-term performance.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Award, value: "20+ Years", label: "Industry Heritage" },
              { icon: ShieldCheck, value: "100%", label: "Spec Conformity" },
              { icon: Globe2, value: "3–4 Days", label: "Global DHL / FedEx" },
              { icon: Users, value: "3 Divisions", label: "Rubber · Steel · Aluminium" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-xs border border-carbon-800 bg-carbon-900/90 p-5"
                >
                  <Icon className="h-5 w-5 text-forge-500 mb-2.5" />
                  <div className="font-display text-2xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-18 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-600">
                OUR COMMITMENT
              </span>
              <h2 className="font-display text-3xl font-bold text-carbon-900">
                A Full Line of Custom Manufacturing Services Under One Roof
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Quality is at the core of everything we do at{" "}
                <strong className="text-carbon-900">{COMPANY_INFO.name}</strong>.
                From raw polymer and alloy selection to precision tooling and final pre-dispatch inspection, we ensure every component delivers maximum reliability, operational safety, and lifecycle value.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our goal is to become your{" "}
                <strong className="text-carbon-900">
                  long-term manufacturing partner, not just a component vendor
                </strong>
                . By uniting custom elastomer molding, stainless &amp; alloy steel CNC fabrication, and aluminium die-mold machining in Coimbatore, we help procurement and engineering teams consolidate suppliers while improving lead-time predictability.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <OpenQuoteButton label="Discuss Your Project With Us" />
                <Link
                  href="/infrastructure"
                  className="inline-flex items-center gap-2 rounded-xs border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-carbon-900 hover:border-forge-600 transition"
                >
                  Explore Infrastructure
                  <ArrowRight className="h-4 w-4 text-forge-600" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-sm border border-slate-200 bg-slate-50 p-2 shadow-sm">
                <div className="aspect-[16/10] overflow-hidden bg-carbon-900">
                  <img
                    src="/images/infrastructure-facility.jpg"
                    alt="S Square Engineering Services production facility"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between px-2 pt-2 pb-1 font-mono text-[11px] text-slate-500">
                  <span>PEELAMEDU, COIMBATORE – 641004</span>
                  <span className="text-forge-600 font-semibold">
                    MULTI-PROCESS PLANT
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-18 bg-[#f8f9fb] border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-600">
              WHY OEM BUYERS CHOOSE US
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold text-carbon-900">
              Our Core Engineering Strengths
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_STRENGTHS.map((s) => (
              <div
                key={s.title}
                className="rounded-sm border border-slate-200 bg-white p-6 shadow-2xs"
              >
                <CheckCircle2 className="h-5 w-5 text-forge-600 mb-3" />
                <h3 className="font-display text-lg font-bold text-carbon-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-18 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-600">
              INDUSTRIAL FOOTPRINT
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold text-carbon-900">
              Industries We Serve Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INDUSTRIES_SERVED.map((ind) => (
              <div
                key={ind.code}
                className="rounded-sm border border-slate-200 bg-slate-50/70 p-6"
              >
                <span className="font-mono text-[11px] font-semibold text-forge-600">
                  {ind.code}
                </span>
                <h3 className="mt-1 font-display text-lg font-bold text-carbon-900">
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
    </div>
  );
}
