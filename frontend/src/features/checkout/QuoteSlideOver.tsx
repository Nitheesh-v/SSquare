"use client";

import { useId } from "react";
import { X, Phone, MessageSquare, ArrowUpRight } from "lucide-react";
import { useQuoteModal } from "@/hooks";
import { QuoteForm } from "./QuoteForm";
import { Dialog } from "@/components/shared/Dialog";
import { COMPANY_INFO } from "@/lib/company-data";

export function QuoteSlideOver() {
  const { isQuoteOpen, quotePrefill, closeQuoteModal } = useQuoteModal();
  const id = useId();
  return (
    <Dialog
      open={isQuoteOpen}
      onClose={closeQuoteModal}
      labelledBy={id}
      className="ssq-drawer"
    >
      {isQuoteOpen && (
        <>
          <div className="sticky top-0 z-10 flex items-center justify-between gap-5 border-b border-white/15 bg-carbon-900 px-6 py-5 text-white">
            <div>
              <p className="eyebrow text-forge-300">LET’S MAKE IT SPECIFIC</p>
              <h2 id={id} className="mt-1 font-display text-3xl font-semibold">
                Request a Quote
              </h2>
            </div>
            <button
              type="button"
              onClick={closeQuoteModal}
              aria-label="Close quote form"
              className="flex h-11 w-11 shrink-0 items-center justify-center text-slate-200 hover:bg-carbon-800"
            >
              <X size={21} />
            </button>
          </div>
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 text-xs leading-relaxed text-slate-600">
            Custom rubber, steel and aluminium components, made to your drawing
            or sample. Share the basics below; send CAD files directly by email
            or WhatsApp.
          </div>
          <div className="p-6">
            <QuoteForm prefill={quotePrefill} />
          </div>
          <div className="space-y-3 border-t border-slate-200 bg-slate-50 px-6 py-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
              PREFER TO TALK THROUGH YOUR REQUIREMENT?
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <a
                href={`tel:${COMPANY_INFO.phoneRaw}`}
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-carbon-900 hover:text-forge-700"
              >
                <Phone size={16} className="text-forge-700" />
                {COMPANY_INFO.phone}
              </a>
              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-carbon-900 hover:text-forge-700"
              >
                <MessageSquare size={16} className="text-forge-700" />
                WhatsApp
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        </>
      )}
    </Dialog>
  );
}
