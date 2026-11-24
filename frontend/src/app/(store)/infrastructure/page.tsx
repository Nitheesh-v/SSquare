import type { Metadata } from "next";
import { Check } from "lucide-react";
import { INFRASTRUCTURE_PILLARS } from "@/lib/company-data";
import { PageIntro } from "@/components/shared/PageIntro";
import { OpenQuoteButton } from "@/components/shared/OpenQuoteButton";
import { SmartProductImage } from "@/components/shared/SmartProductImage";
import { Reveal } from "@/components/shared/MotionPrimitives";

export const metadata: Metadata = {
  title: "Manufacturing Infrastructure, Quality & Responsibility",
  description:
    "Explore S Square Engineering Services’ approach to manufacturing, resource responsibility, workplace safety and specification-led quality in Coimbatore, India.",
};
export default function InfrastructurePage() {
  return (
    <>
      <PageIntro
        eyebrow="Infrastructure / Coimbatore"
        title={
          <>
            The right environment.
            <br />
            <span>For the right result.</span>
          </>
        }
        description="Manufacturing capability, responsible resource use and people-focused operations. The foundations behind our rubber, steel and aluminium components."
      >
        <OpenQuoteButton label="Discuss your project" />
      </PageIntro>
      <section className="studio-infrastructure-area bg-[#f7f8fa] py-16 lg:py-24">
        <div className="shell space-y-14 lg:space-y-20">
          {INFRASTRUCTURE_PILLARS.map((pillar, index) => (
            <Reveal
              key={pillar.number}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
            >
              <div className={index % 2 ? "lg:order-2" : ""}>
                <p className="eyebrow text-forge-700">
                  {pillar.number} / {pillar.code}
                </p>
                <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
                  {pillar.title}
                </h2>
                <p className="mt-5 text-sm leading-[1.85] text-slate-600">
                  {pillar.summary}
                </p>
                <ul className="mt-6 space-y-3 border-t border-slate-300 pt-5">
                  {pillar.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-start gap-3 text-xs leading-[1.8] text-slate-600"
                    >
                      <Check
                        size={15}
                        className="mt-1 shrink-0 text-forge-700"
                      />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className={`aspect-[5/4] overflow-hidden rounded-xl border border-slate-300 bg-white ${index % 2 ? "lg:order-1" : ""}`}
              >
                <SmartProductImage
                  src={pillar.remoteImage}
                  fallbackSrc={pillar.fallbackImage}
                  alt={pillar.title}
                  depth
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="border-t border-slate-200 bg-white py-12">
        <div className="shell flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="eyebrow text-forge-700">
              PROJECT-SPECIFIC REQUIREMENTS
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              Need to discuss an inspection or material requirement?
            </h2>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-600">
              Please include any certification, testing or documentation needs
              in your enquiry. Availability is confirmed per project; no
              certification is implied by this website.
            </p>
          </div>
          <OpenQuoteButton label="Request a Quote" />
        </div>
      </section>
    </>
  );
}
