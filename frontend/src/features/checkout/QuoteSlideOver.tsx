"use client";

import React, { useEffect } from "react";
import { X, Phone, ShieldCheck, Truck } from "lucide-react";
import { useQuoteModal } from "@/hooks";
import { QuoteForm } from "./QuoteForm";
import { COMPANY_INFO } from "@/lib/company-data";

export function QuoteSlideOver() {
  const { isQuoteOpen, quotePrefill, closeQuoteModal } = useQuoteModal();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeQuoteModal();
    }
    if (isQuoteOpen) {
      window.addEventListener("keydown", onKeyDown);
    }
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isQuoteOpen, closeQuoteModal]);

  if (!isQuoteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-carbon-950/70 backdrop-blur-xs"
      onClick={closeQuoteModal}
      role="dialog"
      aria-modal="true"
      aria-label="Request a Custom Engineering Quote"
    >
      <div
        className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-carbon-900 px-6 py-4 text-white">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-forge-400">
              RFQ // Direct Factory Estimation
            </span>
            <h2 className="font-display text-lg font-bold">
              Request a Custom Manufacturing Quote
            </h2>
          </div>
          <button
            type="button"
            onClick={closeQuoteModal}
            aria-label="Close quote modal"
            className="rounded-xs p-2 text-slate-300 hover:bg-carbon-800 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 px-6 py-2.5 text-[11px] font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-forge-600 shrink-0" />
            <span>100% Spec Conformity Guarantee</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-forge-600 shrink-0" />
            <span>3–4 Day Free DHL / FedEx Global</span>
          </div>
        </div>

        <div className="flex-1 p-6">
          <QuoteForm prefill={quotePrefill} />
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <span>Prefer speaking directly with an engineer?</span>
          <a
            href={`tel:${COMPANY_INFO.phoneRaw}`}
            className="inline-flex items-center gap-1.5 font-mono font-semibold text-carbon-900 hover:text-forge-600 transition"
          >
            <Phone className="h-3.5 w-3.5 text-forge-600" />
            {COMPANY_INFO.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
