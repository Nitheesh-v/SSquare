import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { COMPANY_INFO } from "@/lib/company-data";
import { PageIntro } from "@/components/shared/PageIntro";
import { OpenQuoteButton } from "@/components/shared/OpenQuoteButton";
import { SmartProductImage } from "@/components/shared/SmartProductImage";
import { Reveal } from "@/components/shared/MotionPrimitives";

export const metadata: Metadata = {
  title: "About S Square — Custom Manufacturing in Coimbatore",
  description:
    "S Square Engineering Services manufactures custom rubber, steel and aluminium components to customer drawings or samples in Peelamedu, Coimbatore, India.",
};
const STRENGTHS = [
  {
    title: "Made to your requirement",
    description:
      "Custom components begin with your drawing or sample, with material and geometry selected for the application.",
  },
  {
    title: "Three material disciplines",
    description:
      "Rubber molding and bonded seals, custom steel and stainless parts, and aluminium components and die molds.",
  },
  {
    title: "Specification-led quality",
    description:
      "Approved technical requirements provide the basis for material selection, production and pre-dispatch checks.",
  },
  {
    title: "Direct project communication",
    description:
      "Discuss drawings, quantities and delivery requirements directly with the S Square team in Coimbatore.",
  },
];
export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="The company / S Square"
        title={
          <>
            A partner in the parts.
            <br />
            <span>And in the possibilities.</span>
          </>
        }
        description="Based in Peelamedu, Coimbatore, we manufacture custom rubber, steel and aluminium components for industrial requirements. Bring us a drawing or a physical sample—and let’s define the component you need."
      >
        <div className="company-metrics">
          {[
            { value: "20+", label: "Years of experience" },
            { value: "03", label: "Material disciplines" },
            { value: "Custom", label: "Drawing or sample based" },
          ].map((stat) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </PageIntro>
      <section className="border-b border-slate-200 bg-white py-16 lg:py-24">
        <div className="shell grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="eyebrow text-forge-700">
              A PRACTICAL APPROACH TO CUSTOM ENGINEERING
            </p>
            <h2 className="section-heading mt-4">
              Your application.
              <br />
              The starting point.
            </h2>
            <p className="mt-6 text-sm leading-[1.9] text-slate-600">
              At {COMPANY_INFO.name}, custom manufacturing means understanding
              the requirement before making the part. Geometry, material, finish
              and quantity each have a role in the final specification.
            </p>
            <p className="mt-4 text-sm leading-[1.9] text-slate-600">
              From molded elastomers and rubber-to-metal seals to stainless
              components and Grade 6061 aluminium tooling, our focus is on a
              component that fits the agreed requirement.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <OpenQuoteButton label="Request a Quote" />
              <Link href="/infrastructure" className="button-secondary">
                Our infrastructure
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </Reveal>
          <Reveal>
            <div className="company-facility-photo aspect-[5/4] overflow-hidden rounded-xl border border-slate-200">
              <SmartProductImage
                src="/images/infrastructure-facility.jpg"
                fallbackSrc="/images/infrastructure-facility.jpg"
                illustrative
                depth
                alt="Manufacturing facility concept"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-4 font-mono text-[9px] leading-relaxed text-slate-500">
              PEELAMEDU / COIMBATORE / TAMIL NADU / INDIA
            </p>
          </Reveal>
        </div>
      </section>
      <section className="studio-company-values bg-[#f7f8fa] py-16 lg:py-24">
        <div className="shell">
          <Reveal>
            <p className="eyebrow text-forge-700">WHAT GUIDES THE WORK</p>
            <h2 className="section-heading mt-4">
              Clear requirements.
              <br />
              Considered execution.
            </h2>
          </Reveal>
          <div className="company-values-grid mt-10 grid gap-5 sm:grid-cols-2">
            {STRENGTHS.map((item, index) => (
              <Reveal
                key={item.title}
                className="bg-white p-7 sm:p-9"
                delay={index * 40}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-forge-700">
                    0{index + 1}
                  </span>
                  <Check size={19} className="text-forge-700" />
                </div>
                <h3 className="mt-5 font-display text-3xl font-semibold">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-md text-xs leading-[1.85] text-slate-600">
                  {item.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
