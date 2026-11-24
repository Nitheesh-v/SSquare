import type { Metadata } from "next";
import { DIVISIONS, RUBBER_PRODUCTS } from "@/lib/catalog-data";
import { DivisionPageTemplate } from "@/features/products/DivisionPageTemplate";

export const metadata: Metadata = {
  title: "Custom Rubber Products — Seals, Gaskets & Bonded Parts",
  description:
    "Custom molded rubber parts, Viton and silicone gaskets, NBR and HNBR seals, diaphragms and rubber-to-metal bonded components from S Square, Coimbatore.",
};
export default function RubberProductsPage() {
  return (
    <DivisionPageTemplate
      division={DIVISIONS.rubber}
      products={RUBBER_PRODUCTS}
      technicalNoteTitle="Flexible materials. Application-led selection."
      technicalNoteParagraphs={[
        "S Square manufactures custom molded rubber components, gaskets, washers, O-rings, diaphragms, cords and sheets to customer drawings or samples.",
        "The range includes Viton (FKM), Silicone, NBR, HNBR, Neoprene, EPDM and Natural Rubber, alongside rubber-to-metal bonded seals. Different compounds suit different media, temperatures and mechanical demands.",
        "Include your operating environment, mating geometry, required hardness and quantity in your enquiry. Custom colors, including Bahama Blue and Blue Pearl, can also be discussed.",
      ]}
    />
  );
}
