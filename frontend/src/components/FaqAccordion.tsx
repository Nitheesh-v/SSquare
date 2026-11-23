"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ENGINEERING_FAQS } from "@/data/company";

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-slate-200 rounded-sm border border-slate-200 bg-white shadow-2xs">
      {ENGINEERING_FAQS.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={faq.question} className="p-5 sm:p-6">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="flex w-full items-start justify-between gap-4 text-left cursor-pointer"
            >
              <div>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-forge-600 block mb-1">
                  {faq.category}
                </span>
                <h3 className="font-display text-base sm:text-lg font-bold text-carbon-900">
                  {faq.question}
                </h3>
              </div>
              <span
                className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xs border transition ${
                  isOpen
                    ? "border-forge-600 bg-forge-600 text-white rotate-180"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                <ChevronDown className="h-4 w-4" />
              </span>
            </button>

            {isOpen && (
              <p className="mt-3 text-sm text-slate-600 leading-relaxed pr-8">
                {faq.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
