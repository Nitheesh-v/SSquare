import { notFound } from "next/navigation";
import {
  ALUMINIUM_PRODUCTS,
  DIVISIONS,
  DivisionSlug,
  RUBBER_PRODUCTS,
  STEEL_PRODUCTS,
} from "@/lib/catalog-data";
import { DivisionPageTemplate } from "@/features/products/DivisionPageTemplate";

const PRODUCTS_BY_SLUG = {
  rubber: RUBBER_PRODUCTS,
  steel: STEEL_PRODUCTS,
  aluminium: ALUMINIUM_PRODUCTS,
};

const NOTES_BY_SLUG: Record<
  DivisionSlug,
  { title: string; paragraphs: string[] }
> = {
  rubber: {
    title:
      "20+ Years of Custom Molded Elastomer & Rubber-to-Metal Bonding Excellence",
    paragraphs: [
      "At S Square Engineering Services, we continuously advance our elastomer compounding and precision molding capabilities to solve demanding industrial sealing, vibration-damping, and fluid-control challenges worldwide.",
      "With over two decades designing bespoke seals, gaskets, diaphragms, O-rings, cords, sheets, and high-pressure rubber-to-metal bonded washers, we tailor every batch to your exact Shore A durometer and thermal envelope.",
    ],
  },
  steel: {
    title:
      "High-Strength Precision Stainless & Alloy Steel Machining and Fabrication",
    paragraphs: [
      "Chromium-passivated stainless steels (SS 304, SS 316L) and hardened alloy steels provide superior oxidation resistance, elevated-temperature tensile strength, and minimal lifecycle maintenance.",
      "Our Coimbatore shop floor produces CNC-turned shafts, high-pressure flanges, bushings, custom fasteners, and laser-cut TIG-welded assemblies to tight tolerances.",
    ],
  },
  aluminium: {
    title:
      "Lightweight 6061-T6 CNC Machining & Precision Aluminium Die Molds",
    paragraphs: [
      "Aluminium combines an outstanding strength-to-weight ratio with superior machinability and thermal/electrical conductivity for aerospace, automotive, and electronics applications.",
      "We mill multi-cavity Aluminium Die Molds, extruded profiles, and anodized 6061 housings while recycling 100% of machining swarf.",
    ],
  },
};

export function generateStaticParams() {
  return [{ slug: "rubber" }, { slug: "steel" }, { slug: "aluminium" }];
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug !== "rubber" && slug !== "steel" && slug !== "aluminium") {
    notFound();
  }

  return (
    <DivisionPageTemplate
      division={DIVISIONS[slug]}
      products={PRODUCTS_BY_SLUG[slug]}
      technicalNoteTitle={NOTES_BY_SLUG[slug].title}
      technicalNoteParagraphs={NOTES_BY_SLUG[slug].paragraphs}
    />
  );
}
