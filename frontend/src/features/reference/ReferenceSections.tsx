"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowUpRight, Check, Plus } from "lucide-react";
import { SmartProductImage } from "@/components/shared/SmartProductImage";
import { MATERIAL_MATRIX } from "@/lib/catalog-data";
import { useQuoteModal } from "@/hooks";
import { ReferenceGear, ReferenceIllustration } from "./ReferenceIllustration";
import { REFERENCE_MATERIALS } from "./reference-data";

export function ReferenceSpotlight({ active }: { active: number }) {
  return (
    <section
      id="components"
      className="reference-spotlight"
      aria-labelledby="spotlight-heading"
    >
      <div className="spotlight-pin">
        <div className="spotlight-photo" aria-hidden="true">
          <img
            src="/images/hero-manufacturing.jpg"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="spotlight-shade" aria-hidden="true" />
        <div className="spotlight-layout ref-shell">
          <div className="spotlight-copy">
            <p className="ref-kicker">
              <span>02</span> / COMPONENT SPOTLIGHT
            </p>
            <h2 id="spotlight-heading" className="j-display">
              Small details.
              <br />
              <em>Essential</em>
              <br />
              components.
            </h2>
            <p>
              Rubber, steel or aluminium — custom components made around your
              drawing, not pulled off a rack. Scroll to see the assembly turn.
            </p>
            <div className="spotlight-tags">
              <span>Rubber seals</span>
              <span>Steel fittings</span>
              <span>Aluminium tooling</span>
            </div>
          </div>
          <div
            className="spotlight-assembly"
            role="img"
            aria-label={`Illustrative ${REFERENCE_MATERIALS[active].name} assembly concept; not a product specification`}
          >
            <div className="spotlight-orbits" aria-hidden="true" />
            <span
              className="spotlight-crosshair spotlight-crosshair-a"
              aria-hidden="true"
            >
              +
            </span>
            <span
              className="spotlight-crosshair spotlight-crosshair-b"
              aria-hidden="true"
            >
              +
            </span>
            <ReferenceGear className="spotlight-gear spotlight-gear-a" />
            <ReferenceGear className="spotlight-gear spotlight-gear-b" />
            <div className="spotlight-component-anchor">
              <ReferenceIllustration type={active} />
            </div>
            <span className="spotlight-part-label">
              0{active + 1} / {REFERENCE_MATERIALS[active].part}
            </span>
          </div>
        </div>
        <div className="spotlight-bottom ref-shell">
          <span>ILLUSTRATIVE ASSEMBLY & WORKSHOP VISUAL · NOT COMPANY CAD</span>
          <span className="spotlight-scroll">
            SCROLL <ArrowDown size={14} />
            <i />
          </span>
          <span>ONE COMPONENT / EVERY PERSPECTIVE</span>
        </div>
      </div>
    </section>
  );
}

const SPOTLIGHT_PRODUCTS = [
  {
    index: 0,
    eyebrow: "RUBBER / BONDED SEALS",
    name: "Metal-to-Viton Bonded Seals",
    description:
      "Metal retainers bonded to a Viton sealing lip. Discuss the compound, geometry and service conditions for your application.",
    badge: "FKM / BONDED COMPONENTS",
    image: "/images/division-rubber.jpg",
    alt: "Illustrative arrangement of seals, gaskets and bellows",
    illustrative: true,
  },
  {
    index: 2,
    eyebrow: "ALUMINIUM / DIE MOLDS & TOOLING",
    name: "Precision Aluminium Die Molds",
    description:
      "Custom aluminium die molds and production tooling developed from your CAD model, technical drawing or part sample.",
    badge: "ALUMINIUM / CUSTOM TOOLING",
    image: "/images/ssquare/aluminium-tooling.jpg",
    alt: "Aluminium tooling photograph from S Square’s official website",
    illustrative: false,
  },
  {
    index: 1,
    eyebrow: "STEEL / FLANGES & FITTINGS",
    name: "Steel Valve Bodies, Blocks & Fittings",
    description:
      "Machined blocks, flanges and fluid fittings. Material grade, finish and inspection requirements are agreed for each project.",
    badge: "STEEL / STAINLESS COMPONENTS",
    image: "/images/ssquare/machined-components.jpg",
    alt: "Machined components photograph from S Square’s official website",
    illustrative: false,
  },
] as const;

export function ReferenceProducts() {
  const { openQuoteModal } = useQuoteModal();
  return (
    <section
      className="reference-products"
      aria-labelledby="spotlight-products-heading"
    >
      <div className="ref-shell">
        <div className="reference-products-top">
          <h2 id="spotlight-products-heading" className="ref-kicker">
            SPOTLIGHT / THREE OF MANY
          </h2>
          <Link href="/products">
            Explore the full catalog <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="reference-products-grid">
          {SPOTLIGHT_PRODUCTS.map((p) => (
            <article
              className="reference-product journey-reveal-content"
              key={p.index}
            >
              <div className="reference-product-photo">
                <SmartProductImage
                  src={p.image}
                  fallbackSrc={p.image}
                  alt={p.alt}
                  illustrative={p.illustrative}
                  showPlaceholderBadge={false}
                  className="h-full w-full object-cover"
                />
                <span>
                  {p.illustrative
                    ? "ILLUSTRATIVE VISUAL"
                    : "OFFICIAL-SITE PHOTOGRAPH"}
                </span>
                <span className="reference-product-number">0{p.index + 1}</span>
              </div>
              <div className="reference-product-content">
                <p className="ref-kicker">{p.eyebrow}</p>
                <h3 className="j-display">{p.name}</h3>
                <p>{p.description}</p>
                <div className="reference-product-bottom">
                  <span>{p.badge}</span>
                  <button
                    type="button"
                    aria-label={`Request a quote for ${p.name}`}
                    onClick={() =>
                      openQuoteModal({
                        division: REFERENCE_MATERIALS[p.index].division,
                        partName: p.name,
                      })
                    }
                  >
                    Request a Quote <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const PROCESS = [
  [
    "Bring the requirement",
    "A drawing, a physical sample or an application challenge. Share material preferences and estimated quantity.",
  ],
  [
    "Define the details",
    "We review geometry, material, finish and the scope of supply before confirming your custom quotation.",
  ],
  [
    "Manufacture & inspect",
    "Custom production and checks against the agreed technical specification, with direct project communication.",
  ],
  [
    "Pack & dispatch",
    "Protective packing and coordinated delivery from Coimbatore, with supply and delivery terms agreed for your project.",
  ],
];

export function ReferenceProcess() {
  return (
    <section
      id="process"
      className="reference-process"
      aria-labelledby="reference-process-heading"
    >
      <div className="ref-shell">
        <div className="reference-section-top journey-reveal-content">
          <div>
            <p className="ref-kicker">
              <span>03</span> / ENGINEERED IN COIMBATORE
            </p>
            <h2 id="reference-process-heading" className="j-display">
              From the first drawing
              <br />
              to the final <em>component.</em>
            </h2>
          </div>
          <p>
            A practical, collaborative approach to custom manufacturing. Clear
            requirements, agreed specifications and direct communication at
            every step.
          </p>
        </div>
        <div className="reference-process-layout">
          <div className="reference-process-photo">
            <SmartProductImage
              src="/images/infrastructure-facility.jpg"
              fallbackSrc="/images/infrastructure-facility.jpg"
              alt="Illustrative industrial workshop with machining equipment"
              illustrative
              showPlaceholderBadge={false}
              className="h-full w-full object-cover"
            />
            <div>
              <span>PEELAMEDU / COIMBATORE</span>
              <span>ILLUSTRATIVE WORKSHOP VISUAL</span>
            </div>
          </div>
          <div className="reference-process-steps">
            {PROCESS.map(([heading, text], i) => (
              <article key={heading} className="journey-reveal-content">
                <span>0{i + 1}</span>
                <div>
                  <h3>{heading}</h3>
                  <p>{text}</p>
                </div>
                <ArrowUpRight size={17} />
              </article>
            ))}
            <div className="reference-process-notes">
              <span>
                <Check size={13} /> Drawing or sample based
              </span>
              <span>
                <Check size={13} /> Project-specific materials
              </span>
              <span>
                <Check size={13} /> Direct communication
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ReferenceComparison({
  onAdd,
}: {
  onAdd: (index: number, source?: HTMLElement | null, label?: string) => void;
}) {
  const [filter, setFilter] = useState("all");
  const rows = MATERIAL_MATRIX.filter(
    (r) => filter === "all" || r.division === filter,
  );
  return (
    <section
      id="compare"
      className="reference-compare"
      aria-labelledby="reference-compare-heading"
    >
      <div className="ref-shell">
        <div className="reference-section-top journey-reveal-content">
          <div>
            <p className="ref-kicker">
              <span>04</span> / A MATERIAL STARTING POINT
            </p>
            <h2 id="reference-compare-heading" className="j-display">
              Match the material
              <br />
              to the <em>challenge.</em>
            </h2>
          </div>
          <p>
            A general selection guide, not a product datasheet. Final material
            compatibility and specifications require application review.
          </p>
        </div>
        <div className="reference-compare-tools">
          <div role="group" aria-label="Filter material comparison">
            {[
              ["all", "All materials"],
              ...REFERENCE_MATERIALS.map((m) => [m.slug, m.name]),
            ].map(([slug, label]) => (
              <button
                key={slug}
                type="button"
                aria-pressed={filter === slug}
                onClick={() => setFilter(slug)}
              >
                {label}
                <span>
                  {slug === "all"
                    ? "07"
                    : slug === "rubber"
                      ? "04"
                      : slug === "steel"
                        ? "02"
                        : "01"}
                </span>
              </button>
            ))}
          </div>
          <span className="ref-kicker" role="status">
            {rows.length} MATERIAL FAMIL{rows.length === 1 ? "Y" : "IES"}
          </span>
        </div>
        <div
          className="reference-table-scroll"
          role="region"
          aria-label="Compare material families; scroll horizontally for all columns"
          tabIndex={0}
        >
          <table>
            <caption className="sr-only">Compare material families</caption>
            <thead>
              <tr>
                <th scope="col">Material family</th>
                <th scope="col">Application context</th>
                <th scope="col">General characteristics</th>
                <th scope="col">Component types</th>
                <th scope="col">
                  <span className="sr-only">Add to enquiry</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <th scope="row">
                    <strong>{row.material}</strong>
                    <span>
                      {row.division.toUpperCase()} / {row.finishOrGrade}
                    </span>
                  </th>
                  <td>{row.tempRange}</td>
                  <td>{row.keyStrength}</td>
                  <td>{row.typicalParts}</td>
                  <td>
                    <button
                      type="button"
                      aria-label={`Add ${row.material} to enquiry`}
                      onClick={() =>
                        onAdd(
                          REFERENCE_MATERIALS.findIndex(
                            (m) => m.slug === row.division,
                          ),
                          null,
                          row.material,
                        )
                      }
                    >
                      <Plus size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="reference-compare-foot">
          <p>
            Material properties vary with grade, compound and process. Operating
            limits and specifications are confirmed during enquiry review.
          </p>
          <a href="#quote">
            Discuss your application <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
