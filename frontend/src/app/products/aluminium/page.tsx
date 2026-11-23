import type { Metadata } from "next";
import { DIVISIONS, ALUMINIUM_PRODUCTS } from "@/data/products";
import { DivisionPageTemplate } from "@/components/DivisionPageTemplate";

export const metadata: Metadata = {
  title: "Aluminium Products – Aluminium Die Molds, 6061 CNC & Profiles",
  description:
    "Custom-engineered lightweight aluminium components, precision CNC Aluminium Die Molds, 6061-T6 machined housings, extruded profiles, and anodized parts.",
};

export default function AluminiumProductsPage() {
  return (
    <DivisionPageTemplate
      division={DIVISIONS.aluminium}
      products={ALUMINIUM_PRODUCTS}
      technicalNoteTitle="High Strength-to-Weight CNC Machining & Precision Aluminium Die Molds"
      technicalNoteParagraphs={[
        "Aluminium is the material of choice for modern precision machined components and rapid production tooling thanks to its exceptional strength-to-weight ratio—serving aerospace, automotive, robotics, and high-performance industrial equipment.",
        "Workhorse structural alloys such as 6061-T6 and 6082 combine outstanding machinability with natural corrosion resistance, while high thermal and electrical conductivity make aluminium ideal for electronic enclosures, heatsinks, and precision Aluminium Die Molds.",
        "We offer complete secondary finishing—including clear and color anodizing, bead blasting, and powder coating—while recycling 100% of machining swarf to minimize environmental footprint and production cost.",
      ]}
    />
  );
}
