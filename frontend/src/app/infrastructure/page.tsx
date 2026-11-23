import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { INFRASTRUCTURE_PILLARS } from "@/data/company";
import { OpenQuoteButton } from "@/components/OpenQuoteButton";

export const metadata: Metadata = {
  title: "Infrastructure, Sustainability & Safety",
  description:
    "Explore S Square Engineering Services' manufacturing infrastructure, sustainable zero-contamination operations, workforce health & safety, and metrology quality standards.",
};

export default function InfrastructurePage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-carbon-950 text-white bg-blueprint-dark border-b border-carbon-800 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-4">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-400">
                FACILITIES · SUSTAINABILITY · EHS · METROLOGY
              </span>
              <h1 className="font-display text-3xl sm:text-5xl font-bold text-white">
                State-of-the-Art Manufacturing Infrastructure
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                With over 20 years of engineering excellence, our Coimbatore production facilities combine precision machinery, sustainable resource stewardship, strict workplace safety, and transparent commercial integrity.
              </p>
            </div>
            <OpenQuoteButton label="Schedule Project Consultation" />
          </div>
        </div>
      </section>

      {/* Four Alternating Infrastructure Pillars */}
      <section className="py-16 lg:py-22 bg-[#f8f9fb]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {INFRASTRUCTURE_PILLARS.map((pillar, idx) => {
            const reversed = idx % 2 === 1;
            return (
              <div
                key={pillar.number}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center rounded-sm border border-slate-200 bg-white p-6 sm:p-10 shadow-2xs"
              >
                <div
                  className={`lg:col-span-6 space-y-4 ${
                    reversed ? "lg:order-2" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xl font-bold text-forge-600">
                      {pillar.number}.
                    </span>
                    <span className="rounded-xs bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-700">
                      {pillar.code}
                    </span>
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-carbon-900">
                    {pillar.title}
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {pillar.summary}
                  </p>

                  <ul className="space-y-2.5 pt-2">
                    {pillar.details.map((detail) => (
                      <li
                        key={detail}
                        className="flex items-start gap-2.5 text-sm text-slate-700"
                      >
                        <CheckCircle2 className="h-4 w-4 text-forge-600 shrink-0 mt-1" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className={`lg:col-span-6 ${reversed ? "lg:order-1" : ""}`}
                >
                  <div className="rounded-sm border border-slate-200 bg-slate-50 p-2">
                    <div className="aspect-[16/10] overflow-hidden bg-carbon-900">
                      <img
                        src={pillar.image}
                        alt={pillar.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
