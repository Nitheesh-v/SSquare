import type { Metadata } from "next";
import { DIVISIONS, STEEL_PRODUCTS } from "@/lib/catalog-data";
import { DivisionPageTemplate } from "@/features/products/DivisionPageTemplate";

export const metadata: Metadata = {
  title: "Steel Products – Precision Stainless Steel CNC & Fabricated Parts",
  description:
    "Custom-engineered stainless steel (SS 304, SS 316) and alloy steel CNC shafts, flanges, bushings, brackets, and heavy-duty industrial assemblies.",
};

export default function SteelProductsPage() {
  return (
    <DivisionPageTemplate
      division={DIVISIONS.steel}
      products={STEEL_PRODUCTS}
      technicalNoteTitle="Why Stainless & Precision Alloy Steels Remain Essential for Heavy-Duty OEMs"
      technicalNoteParagraphs={[
        "Compared to conventional materials, stainless steel delivers unmatched mechanical and lifecycle advantages: superior resistance to oxidation and chemical attack, high tensile strength at both ambient and elevated temperatures, and minimal maintenance in harsh industrial environments.",
        "Chromium is the key metallurgical driver behind stainless steel’s corrosion defense—forming a self-healing passive chromium-oxide layer across the iron matrix that prevents rust and pitting even in marine, steam, and chemical process duties.",
        "Our Coimbatore machining and fabrication bay produces precision CNC-turned shafts, high-pressure flanges, hardened bushings, custom fasteners, laser-cut TIG-welded brackets, and metal retaining inserts for our in-house bonded seals.",
      ]}
    />
  );
}
