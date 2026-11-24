import type { Metadata } from "next";
import { DIVISIONS, ALUMINIUM_PRODUCTS } from "@/lib/catalog-data";
import { DivisionPageTemplate } from "@/features/products/DivisionPageTemplate";

export const metadata: Metadata = {
  title: "Aluminium Products — 6061 Components, Profiles & Die Molds",
  description:
    "Custom aluminium components, Grade 6061 machined parts, aluminium profiles, sheets and precision die molds from S Square Engineering Services.",
};
export default function AluminiumProductsPage() {
  return (
    <DivisionPageTemplate
      division={DIVISIONS.aluminium}
      products={ALUMINIUM_PRODUCTS}
      technicalNoteTitle="Lightweight material. Considered geometry."
      technicalNoteParagraphs={[
        "Aluminium combines low weight with useful conductivity and corrosion resistance. S Square’s range includes Grade 6061 components, aluminium die molds, custom profiles and sheets.",
        "Material and geometry must be matched to the application. Share mounting details, mating components and the working environment so the requirement can be reviewed before production.",
        "Anodizing and painted finishes can be discussed during quotation. Confirm the exact grade, surface requirements and any inspection or documentation needs with your project enquiry.",
      ]}
    />
  );
}
