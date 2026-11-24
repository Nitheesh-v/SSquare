import type { Metadata } from "next";
import { DIVISIONS, STEEL_PRODUCTS } from "@/lib/catalog-data";
import { DivisionPageTemplate } from "@/features/products/DivisionPageTemplate";

export const metadata: Metadata = {
  title: "Steel Products — Custom Steel & Stainless Components",
  description:
    "Custom steel and stainless components made to customer drawings or samples by S Square Engineering Services, Coimbatore, India.",
};
export default function SteelProductsPage() {
  return (
    <DivisionPageTemplate
      division={DIVISIONS.steel}
      products={STEEL_PRODUCTS}
      technicalNoteTitle="Strength, geometry and the right steel for the job."
      technicalNoteParagraphs={[
        "Steel components support a wide variety of industrial applications. The appropriate material and manufacturing specification depend on load, environment, geometry and how the part interfaces with the assembly.",
        "Stainless steels contain chromium, which supports a protective surface oxide layer. Actual corrosion and heat performance depend on the selected grade and operating conditions; no steel is suitable for every environment.",
        "Share drawings or samples for shafts, bushings, flanges, fittings, brackets or other custom steel parts. Grade, finish and inspection requirements are reviewed as part of your quotation.",
      ]}
    />
  );
}
