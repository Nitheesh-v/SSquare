"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  FilePenLine,
  Focus,
  Layers3,
  MessageSquare,
  Plus,
  Rotate3D,
} from "lucide-react";
import { Reveal, useReducedMotion } from "@/components/shared/MotionPrimitives";
import { SmartProductImage } from "@/components/shared/SmartProductImage";
import { OpenQuoteButton } from "@/components/shared/OpenQuoteButton";
import { COMPANY_INFO } from "@/lib/company-data";
import { STUDIO_MATERIALS } from "./materials";
import { ComponentInspector } from "./ComponentInspector";
import { HeroShowcase } from "@/features/products/HeroShowcase";

const PROCESS = [
  {
    title: "Start with your requirement.",
    text: "A drawing, a sample or an application. Share the geometry, material and quantity you have in mind.",
    icon: FilePenLine,
  },
  {
    title: "Get the details right.",
    text: "We review the material, finish and scope of supply, then prepare a quotation around your project.",
    icon: Focus,
  },
  {
    title: "Make. Inspect. Deliver.",
    text: "Manufacture against the agreed specification, with inspection and dispatch coordinated for your requirement.",
    icon: CheckCheck,
  },
];

export function IndustrialHome() {
  const [active, setActive] = useState(1),
    [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  return (
    <div
      className="studio-home"
      data-testid="industrial-home"
      data-motion-paused={paused || reduced}
    >
      <HeroShowcase paused={paused} onPause={() => setPaused((p) => !p)} />
      <div className="studio-trust-strip">
        <div className="studio-shell">
          <span>
            <Plus size={15} /> CUSTOM BUILT. NEVER OFF THE SHELF.
          </span>
          <span>
            <Check size={14} /> Drawing or sample based
          </span>
          <span>
            <Layers3 size={14} /> Three material disciplines
          </span>
          <span>
            <Focus size={14} /> Coimbatore, India
          </span>
        </div>
      </div>
      <section
        id="material-divisions"
        className="studio-section studio-materials"
        aria-labelledby="materials-heading"
      >
        <div className="studio-shell">
          <Reveal paused={paused} className="studio-section-intro">
            <div>
              <p className="studio-kicker">01 / OUR MATERIAL EXPERTISE</p>
              <h2 id="materials-heading">
                Different materials.
                <br />
                <span>The same commitment.</span>
              </h2>
            </div>
            <p>
              From a flexible seal to a precision-machined part.
              <br className="desktop-break" /> Three disciplines. One partner
              who sees the whole picture.
            </p>
          </Reveal>
          <div className="studio-material-grid">
            {STUDIO_MATERIALS.map((item, i) => (
              <Reveal
                paused={paused}
                key={item.slug}
                delay={i * 65}
                className="studio-material-card"
              >
                <Link
                  href={`/products/${item.slug}`}
                  className="studio-material-photo"
                  aria-label={`Explore ${item.name} Products`}
                >
                  <SmartProductImage
                    src={item.image}
                    fallbackSrc={item.image}
                    illustrative
                    motionPaused={paused}
                    alt={`${item.name} component assortment`}
                    depth
                    className="h-full w-full object-cover"
                  />
                  <span className="photo-code">
                    0{i + 1} / {item.slug.toUpperCase()}
                  </span>
                  <span className="photo-arrow">
                    <ArrowUpRight size={24} />
                  </span>
                </Link>
                <div className="studio-material-content">
                  <h3>
                    {item.name}
                    <span>0{i + 1}</span>
                  </h3>
                  <p className="material-card-title">{item.title}</p>
                  <p>{item.summary}</p>
                  <div className="studio-material-tags">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <Link
                    className="studio-card-link"
                    href={`/products/${item.slug}`}
                  >
                    Discover {item.slug}
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section
        id="the-details"
        className="studio-section studio-details"
        aria-labelledby="details-heading"
      >
        <div className="studio-shell studio-details-grid">
          <Reveal paused={paused} className="studio-details-copy">
            <p className="studio-kicker">02 / ENGINEERING, UP CLOSE</p>
            <h2 id="details-heading">
              The difference
              <br />
              is in <span>the details.</span>
            </h2>
            <p>
              Good manufacturing starts with the right questions. Material,
              geometry, finish and application—we look at how everything works
              together.
            </p>
            <ul>
              {[
                ["Your geometry.", "Built around your drawing or sample."],
                ["Your material.", "Compounds and grades chosen for the job."],
                [
                  "Your specification.",
                  "Requirements agreed before production.",
                ],
              ].map(([title, text]) => (
                <li key={title}>
                  <span>
                    <Check size={14} />
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/infrastructure" className="studio-text-link">
              Explore our infrastructure <ArrowUpRight size={17} />
            </Link>
          </Reveal>
          <div>
            <ComponentInspector
              active={active}
              onSelect={setActive}
              paused={paused}
              onPause={() => setPaused((p) => !p)}
            />
            <p className="studio-inspector-note">
              A closer look at form and material. Scroll to rotate, or explore
              it yourself.
            </p>
            <Link
              href="/material-experience"
              className="studio-experience-link"
            >
              <Rotate3D size={15} /> Enter the full 3D material journey{" "}
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>
      <section
        className="studio-section studio-process"
        aria-labelledby="process-heading"
      >
        <div className="studio-shell studio-process-grid">
          <Reveal paused={paused} className="studio-process-visual">
            <div className="studio-process-image">
              <SmartProductImage
                src="/images/quality-metrology.jpg"
                fallbackSrc="/images/quality-metrology.jpg"
                illustrative
                motionPaused={paused}
                alt="Illustrative component inspection and metrology"
                depth
                className="h-full w-full object-cover"
              />
            </div>
            <div className="process-image-caption">
              <span>EVERY DETAIL HAS A PURPOSE.</span>
              <Focus size={19} />
            </div>
          </Reveal>
          <Reveal paused={paused} className="studio-process-copy">
            <p className="studio-kicker">03 / A CLEAR PATH FROM IDEA TO PART</p>
            <h2 id="process-heading">
              From your first drawing
              <br />
              to <span>the final detail.</span>
            </h2>
            <div className="studio-workflow">
              {PROCESS.map((item, i) => (
                <div key={item.title}>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                  <item.icon size={22} />
                </div>
              ))}
            </div>
            <Link href="/about" className="studio-text-link">
              Meet your manufacturing partner <ArrowUpRight size={17} />
            </Link>
          </Reveal>
        </div>
      </section>
      <section
        className="studio-quote-section"
        aria-labelledby="project-heading"
      >
        <div className="studio-shell studio-project-panel">
          <div className="project-grid-art" aria-hidden="true" />
          <Reveal paused={paused} className="project-copy">
            <p className="studio-kicker light">
              GOOD COMPONENTS START WITH A CONVERSATION.
            </p>
            <h2 id="project-heading">
              Your next idea.
              <br />
              <span>Let’s make it real.</span>
            </h2>
            <p>
              A drawing, a sample or a challenge to solve.
              <br />
              Tell us what you have in mind.
            </p>
            <div className="studio-actions">
              <OpenQuoteButton label="Request a Quote" />
              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="studio-text-link light"
              >
                <MessageSquare size={16} /> Discuss on WhatsApp{" "}
                <ArrowUpRight size={15} />
              </a>
            </div>
          </Reveal>
          <div className="project-contact">
            <span className="project-contact-label">DIRECT TO OUR TEAM</span>
            <a href={`tel:${COMPANY_INFO.phoneRaw}`}>
              {COMPANY_INFO.phone}
              <ArrowUpRight size={24} />
            </a>
            <a href={`mailto:${COMPANY_INFO.emails.sales}`}>
              {COMPANY_INFO.emails.sales}
            </a>
            <span>COIMBATORE, TAMIL NADU, INDIA</span>
          </div>
        </div>
      </section>
    </div>
  );
}
