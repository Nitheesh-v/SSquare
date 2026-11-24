import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react";
import { HeroShowcase } from "@/features/products/HeroShowcase";
import { AluminiumScrollStory } from "@/features/products/AluminiumScrollStory";
import { FeaturedProductsCarousel } from "@/features/products/FeaturedProductsCarousel";
import { MaterialSelector } from "@/features/products/MaterialSelector";
import { SmartProductImage } from "@/components/shared/SmartProductImage";
import { Reveal, ParallaxVisual } from "@/components/shared/MotionPrimitives";
import { QuoteForm } from "@/features/checkout/QuoteForm";
import { COMPANY_INFO, INFRASTRUCTURE_PILLARS } from "@/lib/company-data";
import { DIVISIONS } from "@/lib/catalog-data";

const WORKFLOW = [
  {
    title: "Bring the requirement",
    description:
      "A drawing, a physical sample or an application challenge. Share material preferences and estimated quantity.",
  },
  {
    title: "Define the details",
    description:
      "Review geometry, material, finish and the scope of supply before confirming your custom quotation.",
  },
  {
    title: "Manufacture & inspect",
    description:
      "Custom production and checks against the agreed technical specification, with direct project communication.",
  },
  {
    title: "Pack & dispatch",
    description:
      "Protective packing and coordinated delivery from Coimbatore. DHL and FedEx options for international requirements.",
  },
];
const DIVISION_COPY = [
  {
    title: "Flexible by nature.\nPrecise by design.",
    summary:
      "Custom molded rubber, gaskets, diaphragms and rubber-to-metal bonded seals.",
    tags: ["Viton / FKM", "Silicone", "NBR / HNBR", "EPDM"],
  },
  {
    title: "Strength where\nit matters.",
    summary:
      "Custom steel and stainless components, manufactured for your industrial application.",
    tags: ["Stainless steel", "Machined parts", "Custom geometry"],
  },
  {
    title: "Lightweight thinking.\nSolid engineering.",
    summary:
      "Grade 6061 components, aluminium profiles, sheets and precision die molds.",
    tags: ["Grade 6061", "Die molds", "Anodized finishes"],
  },
];

export default function HomePage() {
  const divisions = [DIVISIONS.rubber, DIVISIONS.steel, DIVISIONS.aluminium];
  const facility = INFRASTRUCTURE_PILLARS[0];
  return (
    <>
      <HeroShowcase />
      <section
        className="border-b border-slate-200 bg-[#f7f8fa] py-16 lg:py-24"
        aria-labelledby="divisions-heading"
      >
        <div className="shell">
          <Reveal className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-forge-700">
                01 / THREE MATERIAL DISCIPLINES. ONE PARTNER.
              </p>
              <h2 id="divisions-heading" className="section-heading mt-4">
                The material changes.
                <br />
                The commitment stays.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-slate-600">
              For engineering and procurement teams who need components made to
              fit—not compromises made to work.
            </p>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {divisions.map((division, index) => (
              <Reveal
                key={division.slug}
                delay={index * 65}
                className="group flex h-full flex-col border border-slate-200 bg-white"
              >
                <Link
                  href={`/products/${division.slug}`}
                  className="relative block aspect-[5/4] overflow-hidden border-b border-slate-200"
                  aria-label={`Explore ${division.name}`}
                >
                  <SmartProductImage
                    src={division.heroImage}
                    fallbackSrc={division.fallbackImage}
                    alt={division.name}
                    className="product-card-image h-full w-full object-cover"
                  />
                  <span className="absolute bottom-3 left-3 bg-carbon-950 px-3 py-1.5 font-mono text-[10px] text-white">
                    DIVISION 0{index + 1} / {division.slug.toUpperCase()}
                  </span>
                </Link>
                <div className="flex flex-1 flex-col p-6 lg:p-7">
                  <h3 className="whitespace-pre-line font-display text-3xl font-semibold leading-[1.05]">
                    {DIVISION_COPY[index].title}
                  </h3>
                  <p className="mt-4 flex-1 text-xs leading-[1.85] text-slate-600">
                    {DIVISION_COPY[index].summary}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {DIVISION_COPY[index].tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-slate-200 px-2 py-1 font-mono text-[9px] text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/products/${division.slug}`}
                    className="mt-6 flex min-h-11 items-center justify-between border-t border-slate-200 pt-4 text-xs font-semibold text-carbon-900 transition-colors hover:text-forge-700"
                  >
                    Explore {division.slug}
                    <ArrowUpRight size={17} className="text-forge-700" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <AluminiumScrollStory
        cadModelUrl={process.env.S_SQUARE_CAD_MODEL_URL || undefined}
      />

      <section
        id="after-story"
        tabIndex={-1}
        className="border-b border-slate-200 bg-white py-16 lg:py-24"
        aria-labelledby="featured-heading"
      >
        <div className="shell">
          <Reveal className="mb-9 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-forge-700">02 / COMPONENT SPOTLIGHT</p>
              <h2 id="featured-heading" className="section-heading mt-4">
                Small details.
                <br />
                Essential components.
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-5 border-b border-slate-300 py-3 text-xs font-semibold hover:text-forge-700"
            >
              Explore the full catalog
              <ArrowUpRight size={17} />
            </Link>
          </Reveal>
          <FeaturedProductsCarousel />
          <p className="mt-5 font-mono text-[10px] leading-relaxed text-slate-500">
            Custom manufacture, not online stock. Geometry, material and supply
            terms are confirmed for your project.
          </p>
        </div>
      </section>

      <section
        className="border-b border-slate-200 bg-[#f0f2f4] py-16 lg:py-24"
        aria-labelledby="process-heading"
      >
        <div className="shell grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="eyebrow text-forge-700">
              03 / ENGINEERED IN COIMBATORE
            </p>
            <h2 id="process-heading" className="section-heading mb-7 mt-4">
              From the first drawing
              <br />
              to the final component.
            </h2>
            <ParallaxVisual className="aspect-[5/4] border border-slate-300">
              <SmartProductImage
                src={facility.remoteImage}
                fallbackSrc={facility.fallbackImage}
                alt="Manufacturing at S Square Engineering Services, Coimbatore"
                className="h-full w-full object-cover"
              />
            </ParallaxVisual>
            <div className="mt-4 flex items-center justify-between gap-3 font-mono text-[9px] text-slate-600">
              <span>PEELAMEDU / COIMBATORE / INDIA</span>
              <Link
                href="/infrastructure"
                className="inline-flex items-center gap-2 py-2 text-forge-700 hover:underline"
              >
                OUR INFRASTRUCTURE
                <ArrowUpRight size={12} />
              </Link>
            </div>
          </Reveal>
          <div className="lg:pt-2">
            <p className="mb-8 max-w-lg text-sm leading-[1.9] text-slate-600">
              A practical, collaborative approach to custom manufacturing. Clear
              requirements, agreed specifications and direct communication at
              every step.
            </p>
            <div className="border-t border-slate-300">
              {WORKFLOW.map((step, index) => (
                <Reveal
                  key={step.title}
                  className="grid grid-cols-[40px_1fr] gap-4 border-b border-slate-300 py-6"
                  delay={index * 30}
                >
                  <span className="pt-1.5 font-mono text-xs text-forge-700">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-semibold">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-sm text-xs leading-[1.8] text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-5 text-[11px] text-slate-700">
              <span className="inline-flex items-center gap-2">
                <Check size={14} className="text-forge-700" />
                Drawing or sample based
              </span>
              <span className="inline-flex items-center gap-2">
                <Check size={14} className="text-forge-700" />
                Custom material selection
              </span>
            </div>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-3 py-3 text-xs font-semibold hover:text-forge-700"
            >
              Meet your manufacturing partner
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section
        className="bg-white py-16 lg:py-24"
        aria-labelledby="materials-heading"
      >
        <div className="shell">
          <Reveal className="mb-9 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="eyebrow text-forge-700">
                04 / A MATERIAL STARTING POINT
              </p>
              <h2 id="materials-heading" className="section-heading mt-4">
                Match the material
                <br />
                to the challenge.
              </h2>
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-slate-600">
              A general selection guide, not a product datasheet. Final material
              compatibility and specifications require application review.
            </p>
          </Reveal>
          <MaterialSelector />
        </div>
      </section>

      <section
        id="rfq"
        className="relative border-t border-carbon-800 bg-carbon-950 py-16 text-white lg:py-24"
        aria-labelledby="rfq-heading"
      >
        <div className="shell grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:sticky lg:top-36 lg:col-span-5">
            <p className="eyebrow text-forge-300">
              05 / LET’S MAKE IT SPECIFIC
            </p>
            <h2
              id="rfq-heading"
              className="mt-5 font-display text-5xl font-semibold leading-[1.02] sm:text-6xl"
            >
              The next component
              <br />
              starts with{" "}
              <span className="text-forge-400">a conversation.</span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-[1.85] text-slate-300">
              Tell us what you need to make. Share a material, a quantity and
              the details that matter. Drawings and samples can be coordinated
              directly by email or WhatsApp.
            </p>
            <div className="mt-9 space-y-4 border-t border-white/15 pt-7">
              <a
                href={`tel:${COMPANY_INFO.phoneRaw}`}
                className="flex items-center gap-3 py-1 font-display text-3xl font-semibold hover:text-forge-300"
              >
                <Phone size={19} className="text-forge-400" />
                {COMPANY_INFO.phone}
              </a>
              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-1 text-xs text-slate-200 hover:text-forge-300"
              >
                <MessageSquare size={17} className="text-forge-400" />
                Discuss your component on WhatsApp
                <ArrowUpRight size={13} />
              </a>
              <a
                href={`mailto:${COMPANY_INFO.emails.sales}`}
                className="flex items-center gap-3 py-1 text-xs text-slate-200 hover:text-forge-300"
              >
                <Mail size={17} className="text-forge-400" />
                {COMPANY_INFO.emails.sales}
              </a>
            </div>
            <p className="mt-8 max-w-sm font-mono text-[10px] leading-[1.9] text-slate-400">
              {COMPANY_INFO.address.full}
              <br />
              <span className="mt-3 block">
                Material, production lead time and delivery terms are confirmed
                during quotation.
              </span>
            </p>
          </Reveal>
          <div className="min-w-0 border border-slate-200 bg-white p-6 text-carbon-900 sm:p-8 lg:col-span-7">
            <div className="mb-6 border-b border-slate-200 pb-5">
              <p className="eyebrow text-forge-700">
                YOUR PROJECT / OUR STARTING POINT
              </p>
              <h3 className="mt-2 font-display text-3xl font-semibold">
                Request a Quote
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                No account, cart or online payment. Just the details we need to
                start a technical discussion.
              </p>
            </div>
            <QuoteForm />
          </div>
        </div>
      </section>
    </>
  );
}
