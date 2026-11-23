import type { Metadata } from "next";
import { DIVISIONS, RUBBER_PRODUCTS } from "@/lib/catalog-data";
import { DivisionPageTemplate } from "@/features/products/DivisionPageTemplate";

export const metadata: Metadata = {
  title: "Custom Rubber Products – Molded Seals, Gaskets & Bonded Parts",
  description:
    "Over 20 years manufacturing custom molded rubber parts, Viton & Silicone gaskets, NBR/HNBR O-rings, diaphragms, and rubber-to-metal bonded seals in Coimbatore, India.",
};

export default function RubberProductsPage() {
  return (
    <DivisionPageTemplate
      division={DIVISIONS.rubber}
      products={RUBBER_PRODUCTS}
      technicalNoteTitle="20+ Years of Custom Molded Elastomer & Rubber-to-Metal Bonding Excellence"
      technicalNoteParagraphs={[
        "At S Square Engineering Services, we continuously advance our elastomer compounding and precision molding capabilities to solve demanding industrial sealing, vibration-damping, and fluid-control challenges worldwide.",
        "With over two decades of hands-on experience designing and manufacturing bespoke seals, gaskets, diaphragms, O-rings, cords, sheets, and high-pressure rubber-to-metal bonded washers (Metal-to-Viton, Metal-to-HNBR, Metal-to-EPDM, and Neoprene Bonded), we tailor every batch to your exact Shore A durometer, media compatibility, and thermal envelope.",
        "Need visual assembly-line differentiation or specialized regulatory compliance? We formulate custom-pigmented compounds—including our signature Bahama Blue and Blue Pearl grades—alongside oil-, fuel-, steam-, and acid-resistant elastomers.",
      ]}
    />
  );
}
