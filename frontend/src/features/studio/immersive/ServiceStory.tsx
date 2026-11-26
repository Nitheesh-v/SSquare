"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
  Rotate3D,
  ShieldCheck,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const ServiceJourneyCanvas = dynamic(() => import("./ServiceJourneyCanvas"), {
  ssr: false,
  loading: () => null,
});

/**
 * Services follows the user's Ssquare/animation video.mp4 reference from
 * Google Drive and the pasted HTML: a 270vh section holds one sticky, full
 * viewport stage; a Three.js truck drives with document scroll, the camera can
 * be dragged to orbit, and the three cards switch with journey progress.
 *
 * The card wording is the literal HTML the user selected in the follow-up.
 * It is user-supplied reference copy, not an independently verified guarantee.
 */

type ServiceItem = {
  title: string;
  tag: string;
  description: string;
  icon: LucideIcon;
  testId: string;
};

const SERVICES: ServiceItem[] = [
  {
    title: "CUSTOMIZATION",
    tag: "DRAWINGS & SAMPLES",
    description:
      "We provide high-quality custom rubber/aluminum/steel products as per your drawings/samples.",
    icon: Wrench,
    testId: "service-card-customization",
  },
  {
    title: "QUALITY ASSURANCE",
    tag: "100% CONFORMITY",
    description:
      "We provide you an output with 100% Conformity to technical specifications, ensuring high quality and durability.",
    icon: ShieldCheck,
    testId: "service-card-quality",
  },
  {
    title: "FREE DOOR DELIVERY",
    tag: "DHL / FEDEX · 3–4 DAYS",
    description:
      "We provide free door delivery through DHL/FEDEX within 3-4 days to any part of the world.",
    icon: Truck,
    testId: "service-card-delivery",
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function ServiceFallback() {
  return (
    <div
      className="ssq-service-fallback"
      data-testid="service-journey-fallback"
      aria-hidden="true"
    >
      <div className="ssq-fallback-road">
        <i />
        <i />
        <i />
      </div>
      <div className="ssq-fallback-portal">
        <span />
        <span />
        <b />
      </div>
      <div className="ssq-fallback-gear">⚙</div>
      <div className="ssq-fallback-truck">
        <div className="ssq-fallback-container">
          <strong>S SQUARE</strong>
          <small>CUSTOM METAL &amp; RUBBER EXPRESS</small>
          <em>GLOBAL DOOR DELIVERY · 3-4 DAYS (DHL/FEDEX)</em>
        </div>
        <div className="ssq-fallback-cab" />
        <div className="ssq-fallback-wheel w1" />
        <div className="ssq-fallback-wheel w2" />
        <div className="ssq-fallback-wheel w3" />
      </div>
    </div>
  );
}

export function ServiceStory({
  paused,
  reduced,
}: {
  paused: boolean;
  reduced: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const percentRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [webgl, setWebgl] = useState(false);
  const still = paused || reduced;

  useEffect(() => {
    if (still) {
      setWebgl(false);
      return;
    }
    try {
      const probe = document.createElement("canvas");
      const gl =
        probe.getContext("webgl2") ||
        probe.getContext("webgl") ||
        probe.getContext("experimental-webgl");
      setWebgl(Boolean(gl));
    } catch {
      setWebgl(false);
    }
  }, [still]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const header = document.querySelector<HTMLElement>(".site-header");

    const setHeaderHeight = () => {
      const height = header?.getBoundingClientRect().height || 112;
      section.style.setProperty("--service-header-h", `${Math.round(height)}px`);
    };
    setHeaderHeight();

    if (still) {
      section.dataset.progress = "0.5";
      section.dataset.serviceProgress = "0.5";
      section.dataset.activeService = "2";
      section.dataset.still = "true";
      section.style.setProperty("--service-progress", "0.5");
      if (percentRef.current) percentRef.current.textContent = "50%";
      if (railRef.current) railRef.current.style.width = "50%";
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        card.dataset.active = i === 1 ? "true" : "false";
        card.setAttribute("aria-pressed", i === 1 ? "true" : "false");
      });
      window.dispatchEvent(
        new CustomEvent("ar:services", { detail: { progress: 0.5 } }),
      );
      return;
    }

    section.dataset.still = "false";
    let frame = 0;

    const update = () => {
      frame = 0;
      if (document.hidden) return;
      const headerHeight =
        Number.parseFloat(
          getComputedStyle(section).getPropertyValue("--service-header-h"),
        ) || 112;
      const rect = section.getBoundingClientRect();
      const stageHeight = Math.max(1, window.innerHeight - headerHeight);
      const travel = Math.max(1, section.offsetHeight - stageHeight);
      const progress = clamp((headerHeight - rect.top) / travel, 0, 1);
      const active = Math.min(SERVICES.length - 1, Math.floor(progress * SERVICES.length));
      const percent = `${Math.round(progress * 100)}%`;

      section.dataset.progress = progress.toFixed(3);
      section.dataset.serviceProgress = progress.toFixed(3);
      section.dataset.activeService = String(active + 1);
      section.style.setProperty("--service-progress", progress.toFixed(3));
      if (percentRef.current) percentRef.current.textContent = percent;
      if (railRef.current) railRef.current.style.width = percent;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        card.dataset.active = i === active ? "true" : "false";
        card.setAttribute("aria-pressed", i === active ? "true" : "false");
      });
      window.dispatchEvent(
        new CustomEvent("ar:services", { detail: { progress } }),
      );
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      setHeaderHeight();
      request();
    };

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", onResize);
    request();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", onResize);
    };
  }, [still]);

  const jumpTo = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const headerHeight =
      Number.parseFloat(
        getComputedStyle(section).getPropertyValue("--service-header-h"),
      ) || 112;
    const stageHeight = Math.max(1, window.innerHeight - headerHeight);
    const travel = Math.max(1, section.offsetHeight - stageHeight);
    const top =
      section.getBoundingClientRect().top +
      window.scrollY -
      headerHeight +
      ((index + 0.5) / SERVICES.length) * travel;
    window.scrollTo({
      top,
      behavior: still ? "auto" : "smooth",
    });
  };

  return (
    <section
      ref={sectionRef}
      id="our-services"
      className="studio-section home-services ssq-service-section"
      aria-labelledby="services-heading"
      data-testid="service-journey"
      data-webgl={webgl && !still}
      data-progress="0"
      data-service-progress="0"
      data-active-service="1"
      data-still={still}
    >
      <div className="ssq-service-stage">
        <div className="ssq-service-blueprint" aria-hidden="true" />
        {webgl && !still ? <ServiceJourneyCanvas /> : <ServiceFallback />}
        <div className="ssq-service-gradient" aria-hidden="true" />

        <div className="ssq-service-hud">
          <div>
            <p className="ssq-service-kicker">SERVICES</p>
            <h2
              id="services-heading"
              className="home-section-heading ssq-service-title"
            >
              OUR SERVICES
            </h2>
            <span className="ssq-service-rule" aria-hidden="true" />
          </div>
          <div className="ssq-service-hud-chip">
            <Rotate3D size={16} aria-hidden="true" />
            <span>Scroll to drive truck · Drag to orbit</span>
            <b ref={percentRef}>0%</b>
          </div>
        </div>

        <div className="ssq-service-bottom">
          <div className="ssq-service-track" aria-hidden="true">
            <i ref={railRef} />
          </div>
          <ol className="home-service-grid ssq-service-cards">
            {SERVICES.map((service, index) => {
              const Icon = service.icon;
              return (
                <li key={service.title}>
                  <button
                    type="button"
                    ref={(node) => {
                      cardRefs.current[index] = node;
                    }}
                    className="home-service-card"
                    data-testid={service.testId}
                    data-active={index === 0}
                    aria-pressed={index === 0}
                    onClick={() => jumpTo(index)}
                  >
                    <span className="ssq-card-top">
                      <b>0{index + 1}.</b>
                      <em>{service.tag}</em>
                    </span>
                    <span className="ssq-card-head">
                      <span className="ssq-card-icon" aria-hidden="true">
                        <Icon size={18} strokeWidth={2} />
                      </span>
                      <h3>{service.title}</h3>
                    </span>
                    <p>{service.description}</p>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
