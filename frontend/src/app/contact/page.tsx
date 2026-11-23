import type { Metadata } from "next";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  MessageSquare,
  Truck,
} from "lucide-react";
import { COMPANY_INFO } from "@/data/company";
import { QuoteForm } from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Contact Us & Request a Free Custom Quote",
  description:
    "Contact S Square Engineering Services at 58, Jeganathapuram, Avarampalayam Road, Peelamedu, Coimbatore – 641004. Call +91 75300 80040 or email sales@ssquareengg.com.",
};

export default function ContactPage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-carbon-950 text-white bg-blueprint-dark border-b border-carbon-800 py-14 lg:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-400">
              CONTACT &amp; DIRECT FACTORY ESTIMATION
            </span>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-white">
              Get in Touch With Our Engineering Team
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Discuss custom rubber molding, metal-to-rubber bonded seals, stainless steel CNC parts, or 6061 aluminium die molds directly with our Coimbatore manufacturing headquarters.
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section className="py-16 lg:py-20 bg-[#f8f9fb]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Contact Cards */}
            <div className="lg:col-span-5 space-y-5">
              {/* HQ Address Card */}
              <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xs bg-forge-50 border border-forge-200 text-forge-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Manufacturing &amp; Registered Office
                    </span>
                    <h2 className="font-display text-lg font-bold text-carbon-900 mt-0.5">
                      {COMPANY_INFO.name}
                    </h2>
                    <address className="not-italic text-sm text-slate-600 leading-relaxed mt-1">
                      {COMPANY_INFO.address.line1},<br />
                      {COMPANY_INFO.address.locality},{" "}
                      {COMPANY_INFO.address.city} –{" "}
                      {COMPANY_INFO.address.pincode},<br />
                      {COMPANY_INFO.address.state},{" "}
                      {COMPANY_INFO.address.country}
                    </address>
                    <a
                      href={COMPANY_INFO.address.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-forge-600 hover:text-forge-700"
                    >
                      Open in Google Maps
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Direct Phone & WhatsApp Card */}
              <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xs bg-forge-50 border border-forge-200 text-forge-600">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Call or WhatsApp Us
                    </span>
                    <a
                      href={`tel:${COMPANY_INFO.phoneRaw}`}
                      className="block font-display text-2xl font-bold text-carbon-900 hover:text-forge-600 transition mt-0.5"
                    >
                      {COMPANY_INFO.phone}
                    </a>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-forge-600" />
                      <span>{COMPANY_INFO.hours}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2.5">
                      <a
                        href={`tel:${COMPANY_INFO.phoneRaw}`}
                        className="inline-flex items-center gap-1.5 rounded-xs bg-carbon-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-carbon-800 transition"
                      >
                        <Phone className="h-3.5 w-3.5 text-forge-500" />
                        Call Now
                      </a>
                      <a
                        href={COMPANY_INFO.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xs border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-carbon-900 hover:border-emerald-600 transition"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                        WhatsApp Engineering
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Desks */}
              <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-2xs space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xs bg-forge-50 border border-forge-200 text-forge-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Email &amp; CAD Drawing Desk
                    </span>
                    <div className="mt-1.5 space-y-1.5 font-mono text-sm">
                      <div>
                        <span className="text-xs text-slate-400 block font-sans">
                          Sales &amp; RFQs:
                        </span>
                        <a
                          href={`mailto:${COMPANY_INFO.emails.sales}`}
                          className="font-semibold text-carbon-900 hover:text-forge-600"
                        >
                          {COMPANY_INFO.emails.sales}
                        </a>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-sans">
                          General Inquiries:
                        </span>
                        <a
                          href={`mailto:${COMPANY_INFO.emails.info}`}
                          className="font-semibold text-carbon-900 hover:text-forge-600"
                        >
                          {COMPANY_INFO.emails.info}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Global Shipping Highlight */}
              <div className="rounded-sm border border-carbon-800 bg-carbon-900 p-5 text-white flex items-start gap-3">
                <Truck className="h-5 w-5 text-forge-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display text-sm font-bold">
                    Free Global Door Delivery (3–4 Days)
                  </h3>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    International orders ship express door-to-door via DHL and FedEx from Coimbatore to any industrial destination worldwide.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Quote Form */}
            <div className="lg:col-span-7 rounded-sm border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="mb-6 pb-4 border-b border-slate-100">
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-600">
                  GET A FREE QUOTE
                </span>
                <h2 className="mt-1 font-display text-2xl font-bold text-carbon-900">
                  Send Us Your Project &amp; Part Requirements
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Fill out your requirements below to receive an RFQ reference number immediately, with option to attach CAD drawings via email or WhatsApp.
                </p>
              </div>

              <QuoteForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
