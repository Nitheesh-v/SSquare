import { ChevronDown } from "lucide-react";
import { ENGINEERING_FAQS } from "@/lib/company-data";

export function FaqAccordion() {
  return (
    <div className="divide-y divide-slate-200 border border-slate-200 bg-white">
      {ENGINEERING_FAQS.map((faq, index) => (
        <details
          key={faq.question}
          open={index === 0}
          className="group p-5 sm:p-7"
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-5 [&::-webkit-details-marker]:hidden">
            <span>
              <span className="eyebrow mb-2 block text-forge-700">
                {faq.category}
              </span>
              <span className="block font-display text-2xl font-semibold leading-tight text-carbon-900">
                {faq.question}
              </span>
            </span>
            <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center border border-slate-300 text-slate-600 transition-transform group-open:rotate-180 group-open:border-forge-600 group-open:bg-forge-600 group-open:text-white">
              <ChevronDown size={17} />
            </span>
          </summary>
          <p className="mt-5 max-w-2xl text-sm leading-[1.9] text-slate-600 sm:pr-9">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
