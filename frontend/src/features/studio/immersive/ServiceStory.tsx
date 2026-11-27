"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Orbit, ShieldCheck, Truck, Wrench, type LucideIcon } from "lucide-react";

const ServiceChoreography = dynamic(() => import("./ServiceChoreography"), {
  ssr: false,
  loading: () => null,
});

/**
 * Services — one continuous scroll-linked 3D choreography.
 *
 * The sticky stage holds a single Three.js scene that moves with document
 * scroll: raw billet / seal / drawing form into a machined part (01), caliper
 * rings and a tolerance sweep verify it (02), then the container truck carries
 * the verified load through the dispatch gate (03). OrbitControls is drag-only,
 * so wheel scrolling is never captured.
 *
 * Card wording is the literal HTML the user selected in an earlier review. It
 * is user-supplied reference copy, not an independently verified guarantee.
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

const STAGE_LABELS = ["MATERIAL", "VERIFICATION", "DISPATCH"];

/** Static fallback frames, used only when WebGL or motion is unavailable. */
const FRAMES = [
  "/images/service-sequence/01-customization.jpg",
  "/images/service-sequence/02-quality.jpg",
  "/images/service-sequence/03-dispatch.jpg",
  "/images/service-sequence/04-delivery.jpg",
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
  const stageRef = useRef(0);
  const cardActiveRef = useRef(-1);
  const percentShownRef = useRef(-1);
  const percentRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // `progress` is only kept in state to re-render the stage rail (three dots).
  // Quantising it stops a full React re-render on every scroll frame; the
  // continuous value goes to the DOM and the 3D stage through CSS/data.
  const [activeStage, setActiveStage] = useState(0);
  const [webgl, setWebgl] = useState(false);
  const [probed, setProbed] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const [stageReady, setStageReady] = useState(false);
  const still = paused || reduced;

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarse(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    try {
      const probe = document.createElement("canvas");
      const gl =
        probe.getContext("webgl2") ||
        probe.getContext("webgl") ||
        probe.getContext("experimental-webgl");
      setWebgl(Boolean(gl));
    } catch {
      setWebgl(false);
    } finally {
      setProbed(true);
    }
  }, []);

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
      // No CSS custom properties here: nothing consumes them any more, and
      // writing them every frame forces a style recalculation of the section.
      section.dataset.progress = value.toFixed(3);
      section.dataset.serviceProgress = value.toFixed(3);
      section.dataset.activeService = String(active + 1);
      const percent = Math.round(value * 100);
      if (percent !== percentShownRef.current) {
        percentShownRef.current = percent;
        if (percentRef.current) percentRef.current.textContent = `${percent}%`;
      }
      const stage = Math.min(
        STAGE_LABELS.length - 1,
        Math.floor(value * STAGE_LABELS.length),
      );
      if (stage !== stageRef.current) {
        stageRef.current = stage;
        setActiveStage(stage);
      }
      if (railRef.current) railRef.current.style.width = `${value * 100}%`;
      // Cards only change three times per journey; touching their attributes
      // on every scroll frame would relayout the overlay for nothing.
      if (active !== cardActiveRef.current) {
        cardActiveRef.current = active;
        cardRefs.current.forEach((card, i) => {
          if (!card) return;
          card.dataset.active = i === active ? "true" : "false";
          card.setAttribute("aria-pressed", i === active ? "true" : "false");
        });
      }
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

  // Both reduced motion and the site-wide pause freeze the 3D stage on a single
  // frame; the photo stack is only the no-WebGL fallback.
  const frozen = reduced || paused;
  const threeD = webgl;
  const stageMode = !probed ? "pending" : threeD ? "3d" : "fallback";

  // Mount the renderer only when the section is about to enter the viewport.
  // Compiling the scene up front delays first interaction on the whole page.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !threeD || stageReady) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStageReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [threeD, stageReady]);
  const stage = activeStage;

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
      data-stage-mode={stageMode}
    >
      <div className="ssq-service-stage">
        <div
          className="ssq-service-media"
          data-webgl={threeD ? "available" : "unavailable"}
        >
          {threeD && stageReady ? (
            <ServiceChoreography reduced={frozen} />
          ) : null}
          {threeD ? null : (
            <div className="ssq-service-frames" data-testid="service-film">
              {FRAMES.map((frame, i) => (
                <img
                  key={frame}
                  src={frame}
                  alt=""
                  aria-hidden="true"
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                />
              ))}
            </div>
          )}
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
          <div className="ssq-service-hud-right">
            <div className="ssq-service-hud-chip">
              <Orbit size={16} aria-hidden="true" />
              <span className="ssq-hint-full">
                {threeD
                  ? `Scroll to animate · ${coarse ? "Swipe" : "Drag"} to inspect · Tap products for specs`
                  : "Scroll to follow the order"}
              </span>
              <span className="ssq-hint-short">
                {threeD ? "Scroll · Drag · Tap" : "Scroll"}
              </span>
              <b ref={percentRef}>0%</b>
            </div>
            <ol className="ssq-stage-rail" data-testid="service-stage-rail">
              {STAGE_LABELS.map((label, i) => (
                <li key={label} data-on={i <= stage ? "true" : "false"}>
                  <i aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ol>
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
