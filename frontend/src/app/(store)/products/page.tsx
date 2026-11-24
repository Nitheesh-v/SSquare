import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ALL_PRODUCTS } from "@/lib/catalog-data";
import { ProductCatalogView } from "@/features/products/ProductCatalogView";
import { MaterialSelector } from "@/features/products/MaterialSelector";
import { OpenQuoteButton } from "@/components/shared/OpenQuoteButton";
import { PageIntro } from "@/components/shared/PageIntro";
import { STUDIO_MATERIALS } from "@/features/studio/materials";

export const metadata: Metadata = {
  title: "Component Catalog — Rubber, Steel & Aluminium",
  description:
    "Explore custom rubber seals, bonded parts, steel components and aluminium die molds. Share drawings, materials and quantities to request a project-specific quotation.",
};
export default function ProductsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Component catalog"
        title={
          <>
            A world of parts.
            <br />
            <span>Made around you.</span>
          </>
        }
        description="Rubber, steel and aluminium. Explore our component capabilities, then share your drawing or sample for a project-specific quotation. Custom manufactured—not off the shelf."
      >
        <OpenQuoteButton label="Request a Quote" />
        <Link className="studio-text-link" href="/categories">
          Explore our divisions <ArrowUpRight size={16} />
        </Link>
      </PageIntro>
      <section className="studio-catalog-section py-10 lg:py-16">
        <div className="shell">
          <nav
            className="catalog-division-links"
            aria-label="Manufacturing divisions"
          >
            {STUDIO_MATERIALS.map((m, i) => (
              <Link href={`/products/${m.slug}`} key={m.slug}>
                <div className="catalog-division-thumb">
                  <img src={m.image} alt="" loading="lazy" />
                </div>
                <div>
                  <span>0{i + 1} / DIVISION</span>
                  <strong>{m.name}</strong>
                  <small>{m.detail}</small>
                </div>
                <ArrowUpRight size={19} />
              </Link>
            ))}
          </nav>
          <p className="catalog-preview-note">
            MATERIAL PREVIEWS: ILLUSTRATIVE VISUALS · REPLACEABLE WITH COMPANY
            PHOTOGRAPHY
          </p>
          <div className="catalog-section-heading">
            <div>
              <p className="studio-kicker">FIND YOUR STARTING POINT</p>
              <h2>Explore the component range.</h2>
            </div>
            <p>
              Material, geometry and finish.
              <br />
              Confirmed for your application.
            </p>
          </div>
          <ProductCatalogView items={ALL_PRODUCTS} showDivisionFilter />
        </div>
      </section>
      <section className="studio-selection-guide bg-white py-16">
        <div className="shell">
          <p className="studio-kicker">GENERAL SELECTION GUIDE</p>
          <h2 className="mt-4 font-display text-4xl font-semibold lg:text-5xl">
            Match the material to your application.
          </h2>
          <p className="mb-7 mt-4 text-xs leading-relaxed text-slate-600">
            A general material comparison, not a technical datasheet. Final
            specifications are confirmed during project review.
          </p>
          <MaterialSelector />
        </div>
      </section>
    </>
  );
}
