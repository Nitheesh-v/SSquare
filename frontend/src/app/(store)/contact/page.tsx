import type { Metadata } from "next";
import { ArrowUpRight, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { COMPANY_INFO } from "@/lib/company-data";
import { QuoteForm } from "@/features/checkout/QuoteForm";

export const metadata: Metadata = {
  title: "Contact S Square & Request a Quote",
  description:
    "Contact S Square Engineering Services, Peelamedu, Coimbatore. Call +91 75300 80040, email sales@ssquareengg.com or share your custom component requirements.",
};
export default function ContactPage() {
  return (
    <>
      <section className="border-b border-carbon-800 bg-carbon-950 py-16 text-white lg:py-24">
        <div className="shell">
          <p className="eyebrow text-forge-300">
            DIRECT COMMUNICATION / CUSTOM COMPONENTS
          </p>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
            Bring the challenge.
            <br />
            Let’s work on the component.
          </h1>
          <p className="mt-7 max-w-2xl text-sm leading-[1.9] text-slate-300">
            Rubber, steel or aluminium. A drawing, sample or idea. Tell our
            Coimbatore team what you need to make.
          </p>
        </div>
      </section>
      <section className="bg-[#f7f8fa] py-16 lg:py-20">
        <div className="shell grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-7 lg:col-span-5">
            <div className="border-b border-slate-300 pb-7">
              <p className="eyebrow flex items-center gap-2 text-forge-700">
                <Phone size={14} />
                TALK THROUGH YOUR REQUIREMENT
              </p>
              <a
                href={`tel:${COMPANY_INFO.phoneRaw}`}
                className="mt-4 inline-block font-display text-4xl font-semibold hover:text-forge-700"
              >
                {COMPANY_INFO.phone}
              </a>
              <p className="mt-2 text-xs text-slate-600">
                {COMPANY_INFO.hours} · Coimbatore, India
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  className="button-secondary"
                  href={`tel:${COMPANY_INFO.phoneRaw}`}
                >
                  <Phone size={15} />
                  Call S Square
                </a>
                <a
                  href={COMPANY_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-secondary"
                >
                  <MessageSquare size={15} />
                  WhatsApp
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
            <div className="border-b border-slate-300 pb-7">
              <p className="eyebrow flex items-center gap-2 text-forge-700">
                <Mail size={14} />
                EMAIL & DRAWING ENQUIRIES
              </p>
              <a
                href={`mailto:${COMPANY_INFO.emails.sales}`}
                className="mt-4 inline-block text-sm font-semibold hover:text-forge-700"
              >
                {COMPANY_INFO.emails.sales}
              </a>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Send drawings or CAD files directly by email. Include quantity,
                material and any finish or inspection requirements.
              </p>
              <a
                href={`mailto:${COMPANY_INFO.emails.info}`}
                className="mt-4 inline-block text-xs text-slate-600 hover:text-forge-700"
              >
                General enquiries: {COMPANY_INFO.emails.info}
              </a>
            </div>
            <div>
              <p className="eyebrow flex items-center gap-2 text-forge-700">
                <MapPin size={14} />
                FIND US IN COIMBATORE
              </p>
              <h2 className="mt-4 font-display text-2xl font-semibold">
                {COMPANY_INFO.name}
              </h2>
              <address className="mt-3 max-w-sm text-sm not-italic leading-[1.9] text-slate-600">
                {COMPANY_INFO.address.full}
              </address>
              <a
                href={COMPANY_INFO.address.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-3 py-2 text-xs font-semibold text-forge-700 hover:underline"
              >
                Open in Google Maps
                <ArrowUpRight size={14} />
              </a>
              <p className="mt-5 max-w-sm text-[11px] leading-relaxed text-slate-600">
                For visits or sample shipments, please contact the team first to
                coordinate the details.
              </p>
            </div>
          </div>
          <div
            id="quote"
            className="min-w-0 border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-7"
          >
            <p className="eyebrow text-forge-700">
              YOUR PROJECT / OUR STARTING POINT
            </p>
            <h2 className="mb-3 mt-2 font-display text-4xl font-semibold">
              Request a Quote
            </h2>
            <p className="mb-6 border-b border-slate-200 pb-5 text-xs leading-relaxed text-slate-600">
              Share the basics below. You’ll see an honest delivery status and
              direct email / WhatsApp options after submission. There’s no
              account or online payment.
            </p>
            <QuoteForm />
          </div>
        </div>
      </section>
    </>
  );
}
