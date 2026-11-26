"use client";

import { useEffect, useRef, useState } from "react";
import { Rotate3D, ShieldCheck, Truck, Wrench, type LucideIcon } from "lucide-react";

/**
 * Services — sticky cinematic journey.
 *
 * Realistic photographic stills replace the earlier low-poly WebGL truck. The
 * four frames (drawing & machining → inspection → loading → truck on the road)
 * are cross-faded and slowly pushed in with document scroll, so the section
 * behaves like the scrubbed film the user asked for without shipping a video.
 *
 * The card wording is the literal HTML the user selected in an earlier review.
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

/** Scroll frames. The last two read as the truck leaving the bay. */
const FRAMES = [
  { src: "/images/service-sequence/01-customization.jpg", label: "DRAWING & MACHINING" },
  { src: "/images/service-sequence/02-quality.jpg", label: "INSPECTION" },
  { src: "/images/service-sequence/03-dispatch.jpg", label: "LOADING" },
  { src: "/images/service-sequence/04-delivery.jpg", label: "ON THE ROAD" },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

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
  const [progress, setProgress] = useState(0);
  const still = paused || reduced;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const header = document.querySelector<HTMLElement>(".site-header");

    const setHeaderHeight = () => {
      const height = header?.getBoundingClientRect().height || 112;
      section.style.setProperty("--service-header-h", `${Math.round(height)}px`);
    };
    setHeaderHeight();

    const apply = (value: number) => {
      const active = Math.min(
        SERVICES.length - 1,
        Math.floor(value * SERVICES.length),
      );
      section.style.setProperty("--service-progress", value.toFixed(3));
      section.style.setProperty("--frame-p", value.toFixed(3));
      section.dataset.progress = value.toFixed(3);
      section.dataset.serviceProgress = value.toFixed(3);
      section.dataset.activeService = String(active + 1);
      if (percentRef.current) percentRef.current.textContent = `${Math.round(value * 100)}%`;
      if (railRef.current) railRef.current.style.width = `${value * 100}%`;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        card.dataset.active = i === active ? "true" : "false";
        card.setAttribute("aria-pressed", i === active ? "true" : "false");
      });
    };

    if (still) {
      section.dataset.still = "true";
      apply(0.5);
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
      const value = clamp((headerHeight - rect.top) / travel, 0, 1);
      apply(value);
      setProgress(value);
      window.dispatchEvent(
        new CustomEvent("ar:services", { detail: { progress: value } }),
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
    window.scrollTo({ top, behavior: still ? "auto" : "smooth" });
  };

  // Each frame owns a quarter of the journey; neighbours overlap for a soft dissolve.
  const scaled = progress * FRAMES.length;
  const frameOpacities = FRAMES.map((_, i) => {
    if (still) return i === 1 ? 1 : 0;
    const distance = Math.abs(scaled - (i + 0.5));
    return clamp(1.35 - distance * 1.6, 0, 1);
  });

  return (
    <section
      ref={sectionRef}
      id="our-services"
      className="studio-section home-services ssq-service-section"
      aria-labelledby="services-heading"
      data-testid="service-journey"
      data-progress="0"
      data-service-progress="0"
      data-active-service="1"
      data-still={still}
    >
      <div className="ssq-service-stage">
        <div className="ssq-service-frames" data-testid="service-film">
          {FRAMES.map((frame, i) => (
            <img
              key={frame.src}
              src={frame.src}
              alt=""
              aria-hidden="true"
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
              style={{
                opacity: frameOpacities[i],
                transform: `scale(${1.04 + progress * 0.1}) translate3d(${(i % 2 === 0 ? -1 : 1) * progress * 1.4}%, 0, 0)`,
              }}
            />
          ))}
        </div>
        <div className="ssq-service-blueprint" aria-hidden="true" />
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
            <span>Scroll to follow the order</span>
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
