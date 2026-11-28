"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Check,
  Clock,
  Focus,
  Layers3,
  Mail,
  MapPin,
  Phone,
  Plus,
} from "lucide-react";
import { Reveal, useReducedMotion } from "@/components/shared/MotionPrimitives";
import { SmartProductImage } from "@/components/shared/SmartProductImage";
import { useQuoteModal } from "@/hooks";
import { COMPANY_INFO } from "@/lib/company-data";
import { ApertureHero } from "./immersive/ApertureHero";
import { HomeAmbient } from "./immersive/HomeAmbient";
import { ServiceStory } from "./immersive/ServiceStory";
import { STUDIO_MATERIALS } from "./materials";
import "./home-content.css";
import "./immersive/ar-home.css";
import "./immersive/service-journey.css";

const MACHINED_COMPONENTS = "/images/ssquare/machined-components.jpg";
const ALUMINIUM_TOOLING = "/images/ssquare/aluminium-tooling.jpg";

// Match the reference's product order without changing the shared division data.
const HOME_PRODUCTS = [
  { ...STUDIO_MATERIALS[2], photo: ALUMINIUM_TOOLING, illustrative: false },
  { ...STUDIO_MATERIALS[1], photo: MACHINED_COMPONENTS, illustrative: false },
  {
    ...STUDIO_MATERIALS[0],
    photo: STUDIO_MATERIALS[0].image,
    illustrative: true,
  },
];

const CAPABILITIES = [
  "Custom Rubber Components & Molded Products",
  "Steel Fabricated Parts & Structures",
  "Aluminium Profiles, Sheets & Machined Components",
  "Industrial Assemblies & Special-Purpose Parts",
];

const COMPANY_FACTS = [
  {
    value: COMPANY_INFO.experienceYears,
    label: "Years of experience",
    note: "Supplying Coimbatore's industries since the start",
    icon: Award,
  },
  {
    value: String(STUDIO_MATERIALS.length).padStart(2, "0"),
    label: "Material disciplines",
    note: "Rubber, steel and aluminium under one roof",
    icon: Layers3,
  },
  {
    value: COMPANY_INFO.address.city,
    label: `Manufacturing base · ${COMPANY_INFO.address.country}`,
    note: "Drawing or sample based, built to order",
    icon: MapPin,
  },
];

export function IndustrialHome() {
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const { openQuoteModal } = useQuoteModal();

  return (
    <div
      className="studio-home ar-home"
      data-testid="industrial-home"
      data-motion-paused={paused || reduced}
    >
      <ApertureHero paused={paused} />
      <div className="studio-trust-strip">
        <div className="studio-shell">
          <span>
            <Plus size={15} aria-hidden="true" /> CUSTOM BUILT. NEVER OFF THE
            SHELF.
          </span>
          <span>
            <Check size={14} aria-hidden="true" /> Drawing or sample based
          </span>
          <span>
            <Layers3 size={14} aria-hidden="true" /> Three material disciplines
          </span>
          <span>
            <Focus size={14} aria-hidden="true" /> Coimbatore, India
          </span>
        </div>
      </div>

      {/* Hero intro (S SQUARE) is followed immediately by the three product cards. */}
      <section
        id="material-divisions"
        className="studio-section studio-materials home-products"
        aria-labelledby="materials-heading"
      >
        <div className="studio-shell">
          <Reveal paused={paused} className="home-products-intro">
            <p className="studio-kicker">Rubber / Steel / Aluminium</p>
            <h2 id="materials-heading">Explore Our Products</h2>
            <p>
              Three material disciplines. Custom components built around your
              requirement.
            </p>
          </Reveal>
          <div className="studio-material-grid">
            {HOME_PRODUCTS.map((item, i) => (
              <Reveal
                paused={paused}
                key={item.slug}
                delay={i * 110}
                from={i % 2 === 0 ? "left" : "right"}
                className="studio-material-card"
              >
                <Link
                  href={`/products/${item.slug}`}
                  className="studio-material-photo"
                  aria-label={`Explore ${item.division}`}
                >
                  <SmartProductImage
                    src={item.photo}
                    fallbackSrc={item.image}
                    illustrative={item.illustrative}
                    motionPaused={paused}
                    alt={`${item.name} component assortment`}
                    depth
                    className="h-full w-full object-cover"
                  />
                  <span className="photo-code" aria-hidden="true">
                    0{i + 1} / {item.slug.toUpperCase()}
                  </span>
                  <span className="photo-arrow" aria-hidden="true">
                    <ArrowUpRight size={24} />
                  </span>
                </Link>
                <div className="studio-material-content">
                  <h3>{item.division}</h3>
                  <p>{item.summary}</p>
                  <Link
                    className="studio-card-link"
                    href={`/products/${item.slug}`}
                  >
                    View {item.division}
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="who-we-are"
        className="studio-section home-about"
        aria-labelledby="about-heading"
      >
        <div className="studio-shell home-editorial-grid">
          <Reveal paused={paused} from="left" className="home-editorial-copy">
            <p className="studio-kicker">About Us</p>
            <h2 id="about-heading" className="home-section-heading">
              Who We Are
            </h2>
            <p>
              We are a{" "}
              <strong>
                custom manufacturer and supplier specializing in Rubber, Steel,
                and Aluminium products
              </strong>
              , serving industrial, commercial, and OEM clients. Our
              manufacturing capabilities, combined with technical expertise,
              enable us to deliver <strong>tailor-made solutions</strong> that
              meet complex operational requirements.
            </p>
            <p>
              With {COMPANY_INFO.experienceYears} years of engineering
              experience, our focus is on{" "}
              <strong>
                reliability, precision, and long-term partnerships
              </strong>
              . Based in Coimbatore, we work with you from the first requirement
              to the finished component.
            </p>
            <Link href="/about" className="studio-text-link home-about-link">
              More About Us <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </Reveal>
          <Reveal paused={paused} delay={120} from="right" className="home-editorial-figure">
            <div className="home-editorial-photo">
              <SmartProductImage
                src={MACHINED_COMPONENTS}
                fallbackSrc="/images/division-steel.jpg"
                alt="Machined steel and stainless components from S Square’s published range"
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption>
              <span>PRECISION IN EVERY COMPONENT</span>
              <span>STEEL / STAINLESS</span>
            </figcaption>
          </Reveal>
        </div>
      </section>

      <section
        id="what-we-do"
        className="studio-section home-capabilities"
        aria-labelledby="capabilities-heading"
      >
        <div className="studio-shell home-editorial-grid">
          <Reveal paused={paused} from="right" className="home-editorial-copy">
            <p className="studio-kicker">From your drawing to your component</p>
            <h2 id="capabilities-heading" className="home-section-heading">
              What We Do
            </h2>
            <p>
              We design, manufacture, and supply{" "}
              <strong>custom-fabricated components and products</strong>,
              including:
            </p>
            <ul className="home-capability-list">
              {CAPABILITIES.map((capability) => (
                <li key={capability}>
                  <Check size={15} aria-hidden="true" />
                  <span>{capability}</span>
                </li>
              ))}
            </ul>
            <p>
              Every project starts with your application. Material, dimensional,
              finish and inspection requirements are confirmed against your
              drawing or sample, with a focus on{" "}
              <strong>strength, accuracy, and performance</strong>.
            </p>
            <Link href="/about" className="studio-text-link home-about-link">
              More About Us <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </Reveal>
          <Reveal paused={paused} delay={120} from="left" className="home-editorial-figure">
            <div className="home-editorial-photo">
              <SmartProductImage
                src={ALUMINIUM_TOOLING}
                fallbackSrc="/images/division-aluminium.jpg"
                alt="Precision aluminium die-mold tooling from S Square’s published range"
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption>
              <span>BUILT TO DRAWING OR SAMPLE</span>
              <span>ALUMINIUM / TOOLING</span>
            </figcaption>
          </Reveal>
        </div>
      </section>

      <ServiceStory paused={paused} reduced={reduced} />

      <section
        id="at-a-glance"
        className="home-facts"
        aria-labelledby="at-a-glance-heading"
      >
        <div className="studio-shell">
          <Reveal paused={paused} className="home-facts-head">
            <p className="studio-kicker">S Square at a glance</p>
            <h2 id="at-a-glance-heading" className="home-facts-heading">
              Twenty years on the same shop floor
            </h2>
            <p className="home-facts-lede">
              A Coimbatore manufacturer of rubber, steel and aluminium
              components — reviewed against your drawing, built to your sample
              and dispatched worldwide.
            </p>
          </Reveal>
          <dl className="home-facts-grid">
            {COMPANY_FACTS.map((fact, i) => {
              const Icon = fact.icon;
              return (
                <Reveal
                  paused={paused}
                  delay={i * 110}
                  from="left"
                  key={fact.label}
                  className="home-fact"
                >
                  <dt className="home-fact-label">
                    <span className="home-fact-name">{fact.label}</span>
                    <span className="home-fact-note">{fact.note}</span>
                  </dt>
                  <dd className="home-fact-value">
                    <span className="home-fact-icon" aria-hidden="true">
                      <Icon size={18} />
                    </span>
                    {fact.value}
                  </dd>
                </Reveal>
              );
            })}
          </dl>
        </div>
      </section>

      <section
        id="quick-service"
        className="home-quick-service"
        aria-labelledby="quick-service-heading"
      >
        <Reveal paused={paused} from="left" className="home-quick-photos">
          <div className="home-quick-photo">
            <SmartProductImage
              src="/images/division-rubber.jpg"
              fallbackSrc="/images/division-rubber.jpg"
              illustrative
              alt="Rubber seals, gaskets and molded components"
              className="h-full w-full object-cover"
            />
            <span className="home-quick-tag">01 / RUBBER</span>
          </div>
          <div className="home-quick-photo">
            <SmartProductImage
              src={MACHINED_COMPONENTS}
              fallbackSrc="/images/division-steel.jpg"
              alt="Custom-machined metal component range"
              className="h-full w-full object-cover"
            />
            <span className="home-quick-tag">02 / STEEL</span>
          </div>
          <div className="home-quick-photo">
            <SmartProductImage
              src={ALUMINIUM_TOOLING}
              fallbackSrc="/images/division-aluminium.jpg"
              alt="Aluminium profiles and precision tooling"
              className="h-full w-full object-cover"
            />
            <span className="home-quick-tag">03 / ALUMINIUM</span>
          </div>
          <p>RUBBER / STEEL / ALUMINIUM</p>
        </Reveal>
        <Reveal paused={paused} from="right" className="home-quick-copy">
          <p className="studio-kicker">Quick Service on Your Needs</p>
          <h2 id="quick-service-heading">Call {COMPANY_INFO.hours}</h2>
          <p>
            Reach out to our team for expert guidance and reliable support on
            custom rubber, steel, and aluminium manufacturing.
          </p>
          <ul className="home-quick-promises">
            <li>
              <Clock size={14} aria-hidden="true" />
              <span>Same-day reply on drawings and samples</span>
            </li>
            <li>
              <Layers3 size={14} aria-hidden="true" />
              <span>One enquiry across all three disciplines</span>
            </li>
            <li>
              <MapPin size={14} aria-hidden="true" />
              <span>Door delivery to any part of the world</span>
            </li>
          </ul>
          <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="home-quick-phone">
            <Phone size={24} aria-hidden="true" />
            {COMPANY_INFO.phone}
          </a>
          <div className="home-quick-actions">
            <a
              href="/contact#quote"
              className="home-quick-quote"
              aria-haspopup="dialog"
              onClick={(event) => {
                // Preserve native navigation, new-tab shortcuts and the no-JS path.
                if (
                  event.button !== 0 ||
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                )
                  return;
                event.preventDefault();
                openQuoteModal({
                  division:
                    "Rubber Products, Steel Products, Aluminium Products",
                });
              }}
            >
              Request a Quote <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a href={`mailto:${COMPANY_INFO.emails.sales}`}>
              <Mail size={16} aria-hidden="true" />
              {COMPANY_INFO.emails.sales}
            </a>
          </div>
          <p className="home-quick-location">
            <MapPin size={13} aria-hidden="true" />
            {COMPANY_INFO.address.locality}, {COMPANY_INFO.address.city},{" "}
            {COMPANY_INFO.address.country}
          </p>
        </Reveal>
      </section>

      {/* The shared dark footer from (store)/layout.tsx remains the only footer. */}
      <HomeAmbient paused={paused || reduced} reduced={reduced} />
    </div>
  );
}
