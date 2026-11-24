import type { Metadata } from "next";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { PageIntro } from "@/components/shared/PageIntro";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { OpenQuoteButton } from "@/components/shared/OpenQuoteButton";
import { COMPANY_INFO } from "@/lib/company-data";

export const metadata: Metadata = {
  title: "Engineering & Procurement FAQ",
  description:
    "Questions about custom manufacturing from drawings or samples, material options, quality requirements and delivery with S Square Engineering Services.",
};
export default function FaqPage() {
  return (
    <>
      <PageIntro
        eyebrow="Engineering & procurement FAQ"
        title={
          <>
            Good questions.
            <br />
            <span>Practical answers.</span>
          </>
        }
        description="A few useful answers about drawings, material options, inspection and delivery. For a specific application, speak directly with the S Square team."
      />
      <section className="studio-faq-area bg-[#f7f8fa] py-16 lg:py-20">
        <div className="shell grid items-start gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <FaqAccordion />
          </div>
          <aside className="border border-slate-200 bg-white p-6 lg:sticky lg:top-36 lg:col-span-4">
            <p className="eyebrow text-forge-700">LET’S DISCUSS THE DETAILS</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">
              Your requirement may be specific. So is our approach.
            </h2>
            <p className="mt-4 text-xs leading-[1.8] text-slate-600">
              Include a drawing or sample description, estimated quantity and
              your operating environment.
            </p>
            <div className="my-6 space-y-3 border-t border-slate-200 pt-5">
              <a
                className="flex min-h-10 items-center gap-3 text-sm font-semibold hover:text-forge-700"
                href={`tel:${COMPANY_INFO.phoneRaw}`}
              >
                <Phone size={16} className="text-forge-700" />
                {COMPANY_INFO.phone}
              </a>
              <a
                className="flex min-h-10 items-center gap-3 text-xs hover:text-forge-700"
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageSquare size={16} className="text-forge-700" />
                WhatsApp S Square
              </a>
              <a
                className="flex min-h-10 items-center gap-3 text-xs hover:text-forge-700"
                href={`mailto:${COMPANY_INFO.emails.sales}`}
              >
                <Mail size={16} className="text-forge-700" />
                {COMPANY_INFO.emails.sales}
              </a>
            </div>
            <OpenQuoteButton label="Request a Quote" className="w-full" />
          </aside>
        </div>
      </section>
    </>
  );
}
