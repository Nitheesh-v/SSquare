"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  FilePenLine,
  Focus,
  Layers3,
  MessageSquare,
  Pause,
  Phone,
  Play,
  Plus,
  Rotate3D,
} from "lucide-react";
import { Reveal, useReducedMotion } from "@/components/shared/MotionPrimitives";
import { SmartProductImage } from "@/components/shared/SmartProductImage";
import { OpenQuoteButton } from "@/components/shared/OpenQuoteButton";
import { useQuoteModal } from "@/hooks";
import { COMPANY_INFO } from "@/lib/company-data";
import { STUDIO_MATERIALS } from "./materials";
import { ComponentInspector } from "./ComponentInspector";
import { HomeMotion, MotionLetters } from "./HomeMotion";
import type { HomeMotionState } from "./home-motion";
import "./home-motion.css";

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
    [paused, setPaused] = useState(false),
    [previous, setPrevious] = useState<number | null>(null),
    [rotation, setRotation] = useState(0),
    [motionState, setMotionState] = useState<HomeMotionState>("static");
  const reduced = useReducedMotion(),
    home = useRef<HTMLDivElement>(null),
    hero = useRef<HTMLElement>(null),
    selected = useRef(active);
  const { openQuoteModal } = useQuoteModal();
  const m = STUDIO_MATERIALS[active];
  const selectMaterial = useCallback((index: number) => {
    if (selected.current === index) return;
    setPrevious(selected.current);
    selected.current = index;
    setActive(index);
  }, []);
  useEffect(() => {
    if (previous === null) return;
    if (paused || reduced) {
      setPrevious(null);
      return;
    }
    const timer = window.setTimeout(() => setPrevious(null), 950);
    return () => clearTimeout(timer);
  }, [active, previous, paused, reduced]);
  useEffect(() => {
    const node = hero.current;
    if (!node) return;
    if (reduced || paused) {
      node.style.setProperty("--photo-depth", "0");
      return;
    }
    let frame = 0,
      visible = true;
    const update = () => {
      frame = 0;
      if (!visible || document.hidden) return;
      const r = node.getBoundingClientRect(),
        header =
          document.querySelector(".site-header")?.getBoundingClientRect()
            .height || 113;
      node.style.setProperty(
        "--photo-depth",
        Math.max(0, Math.min(1, (header - r.top) / r.height)).toFixed(4),
      );
    };
    const schedule = () => {
      if (!frame && visible) frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    observer.observe(node);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      node.style.removeProperty("--photo-depth");
    };
  }, [reduced, paused]);
  return (
    <div
      ref={home}
      className="studio-home"
      data-testid="industrial-home"
      data-motion-paused={paused || reduced}
    >
      <section
        ref={hero}
        className="precision-hero"
        aria-labelledby="home-heading"
        data-active-material={m.slug}
      >
        {previous !== null && !paused && !reduced && (
          <div
            className="precision-hero-photo home-photo-previous"
            data-photo-material={STUDIO_MATERIALS[previous].slug}
            aria-hidden="true"
          >
            <img src={STUDIO_MATERIALS[previous].hero} alt="" />
          </div>
        )}
        <div
          className="precision-hero-photo"
          key={m.slug}
          data-photo-material={m.slug}
          data-revealing={previous !== null && !paused && !reduced}
          data-testid="hero-photo-plane"
        >
          <img
            src={m.hero}
            alt={`Illustrative ${m.detail.toLowerCase()}, not an actual S Square product photograph`}
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div className="precision-hero-shade" />
        <div className="precision-hero-grain" aria-hidden="true" />
        <div className="studio-shell precision-hero-inner">
          <div className="hero-top-caption">
            <span>
              <i /> S SQUARE ENGINEERING SERVICES
            </span>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              disabled={reduced}
              aria-label={
                paused ? "Resume visual motion" : "Pause visual motion"
              }
            >
              {reduced || paused ? <Play size={12} /> : <Pause size={12} />}{" "}
              {reduced
                ? "REDUCED MOTION"
                : paused
                  ? "MOTION PAUSED"
                  : "MOTION ON"}
            </button>
          </div>
          <div className="precision-hero-copy">
            <p className="studio-kicker light">
              CUSTOM MANUFACTURING. CONSIDERED ENGINEERING.
            </p>
            <h1 id="home-heading" aria-label="Small parts. Big possibilities.">
              <span className="home-heading-first" aria-hidden="true">
                <MotionLetters text="Small parts." />
              </span>
              <br />
              <span className="home-heading-second" aria-hidden="true">
                <MotionLetters text="Big possibilities." />
              </span>
            </h1>
            <p className="hero-introduction">
              Custom rubber, steel and aluminium components.
              <br className="desktop-break" /> Made to your drawing. Built
              around your world.
            </p>
            <div className="studio-actions">
              <button
                type="button"
                className="studio-button"
                onClick={() => openQuoteModal({ division: m.division })}
              >
                Request a Quote <ArrowUpRight size={18} />
              </button>
              <a href="#material-divisions" className="studio-text-link light">
                Explore our capabilities <ArrowDown size={17} />
              </a>
            </div>
            <div className="hero-experience">
              <span>
                20<span>+</span>
              </span>
              <p>
                YEARS OF EXPERIENCE
                <br />
                <strong>A partner in the details.</strong>
              </p>
            </div>
          </div>
          <div
            className="home-carousel-gesture"
            data-testid="home-carousel-gesture"
            aria-hidden="true"
          />
          <div className="hero-visual-marker" aria-hidden="true">
            <span className="marker-cross">+</span>
            <div>
              <span>MADE FOR YOUR APPLICATION</span>
              <strong>{m.detail}</strong>
            </div>
          </div>
          <span className="hero-photo-provenance">
            ILLUSTRATIVE VISUAL · REPLACEABLE WITH COMPANY PHOTOGRAPHY
          </span>
          <div className="hero-material-strip">
            <div role="group" aria-label="Explore manufacturing materials">
              {STUDIO_MATERIALS.map((item, i) => (
                <button
                  type="button"
                  key={item.slug}
                  aria-label={`0${i + 1} ${item.name}`}
                  aria-pressed={active === i}
                  onClick={() => selectMaterial(i)}
                >
                  <span className="material-index">0{i + 1}</span>
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.detail}</small>
                  </span>
                  <ArrowUpRight size={21} />
                </button>
              ))}
            </div>
            <a className="hero-phone" href={`tel:${COMPANY_INFO.phoneRaw}`}>
              <Phone size={18} />
              <span>
                LET’S TALK DETAILS<strong>{COMPANY_INFO.phone}</strong>
              </span>
            </a>
          </div>
        </div>
      </section>
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
              onSelect={selectMaterial}
              paused={paused}
              onPause={() => setPaused((p) => !p)}
              state={motionState}
              rotation={rotation}
              onRotate={setRotation}
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
      <HomeMotion
        root={home}
        active={active}
        paused={paused}
        rotation={rotation}
        onSelect={selectMaterial}
        onState={setMotionState}
      />
    </div>
  );
}
