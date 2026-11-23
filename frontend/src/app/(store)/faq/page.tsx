import type { Metadata } from "next";
import { Phone, Mail } from "lucide-react";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { OpenQuoteButton } from "@/components/shared/OpenQuoteButton";
import { COMPANY_INFO } from "@/lib/company-data";

export const metadata: Metadata = {
  title: "Engineering & Procurement FAQ",
  description:
    "Frequently asked questions about custom CAD/sample manufacturing, rubber compounds, stainless steel & 6061 aluminium grades, quality inspection, and free 3–4 day global DHL/FedEx shipping.",
};

export default function FaqPage() {
  return (
    <div>
      <section className="bg-carbon-950 text-white bg-blueprint-dark border-b border-carbon-800 py-14 lg:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-400">
              TECHNICAL &amp; PROCUREMENT SUPPORT
            </span>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-white">
              Frequently Asked Engineering Questions
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Answers to common questions from OEM buyers, mechanical engineers, and international procurement teams regarding custom tooling, material selection, tolerances, and global express delivery.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-[#f8f9fb]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8">
              <FaqAccordion />
            </div>

            <aside className="lg:col-span-4 rounded-sm border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
              <div>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-forge-600">
                  DIRECT ENGINEERING DESK
                </span>
                <h2 className="mt-1 font-display text-xl font-bold text-carbon-900">
                  Have a Custom Application Question?
                </h2>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Speak directly with our manufacturing engineers Monday through Saturday for elastomer chemical compatibility or alloy machinability advice.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100 text-sm">
                <a
                  href={`tel:${COMPANY_INFO.phoneRaw}`}
                  className="flex items-center gap-2.5 font-mono font-semibold text-carbon-900 hover:text-forge-600 transition"
                >
                  <Phone className="h-4 w-4 text-forge-600" />
                  {COMPANY_INFO.phone}
                </a>
                <a
                  href={`mailto:${COMPANY_INFO.emails.sales}`}
                  className="flex items-center gap-2.5 font-mono text-xs text-slate-700 hover:text-forge-600 transition"
                >
                  <Mail className="h-4 w-4 text-forge-600" />
                  {COMPANY_INFO.emails.sales}
                </a>
              </div>

              <OpenQuoteButton label="Submit Custom RFQ" className="w-full" />
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
