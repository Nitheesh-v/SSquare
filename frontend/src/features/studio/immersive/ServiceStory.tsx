"use client";

import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { LucideIcon } from "lucide-react";

/**
 * The three service cards become one scroll-driven 3D story:
 * a specification block is turned and dimensioned, an inspector checks a
 * part, then a container truck drives away. Progress is written to CSS custom
 * properties from one passive scroll callback; pointer movement adds a small
 * live parallax tilt. Reduced / paused motion holds a readable mid-scene.
 */

export type ServiceKind = "customization" | "quality" | "delivery";

export type ServiceItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  kind: ServiceKind;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function CustomizationScene() {
  return (
    <>
      <div className="ssq-custom-grid" />
      <svg className="ssq-blueprint" viewBox="0 0 260 150" aria-hidden="true">
        <path
          className="ssq-blueprint-path"
          d="M28 112 H78 V52 H186 V112 H232 M78 52 L98 34 H206 L186 52 M186 112 L206 94 V34 M98 112 V130 H206"
        />
        <circle className="ssq-blueprint-node" cx="78" cy="52" r="4" />
        <circle className="ssq-blueprint-node" cx="186" cy="112" r="4" />
      </svg>
      <div className="ssq-custom-part">
        <span className="ssq-part-face ssq-part-front">
          <i />
          <i />
          <i />
        </span>
        <span className="ssq-part-face ssq-part-back" />
        <span className="ssq-part-face ssq-part-top" />
        <span className="ssq-part-face ssq-part-bottom" />
        <span className="ssq-part-face ssq-part-left" />
        <span className="ssq-part-face ssq-part-right" />
      </div>
      <span className="ssq-dimension ssq-dimension-x">DRAWING / SAMPLE</span>
      <span className="ssq-dimension ssq-dimension-y">SPEC</span>
      <span className="ssq-custom-cursor" />
    </>
  );
}

function QualityScene() {
  return (
    <>
      <div className="ssq-qa-bench">
        <span className="ssq-qa-part" />
        <span className="ssq-qa-part-shadow" />
      </div>
      <div className="ssq-qa-person">
        <span className="ssq-person-helmet" />
        <span className="ssq-person-head" />
        <span className="ssq-person-body" />
        <span className="ssq-person-arm" />
        <span className="ssq-person-leg ssq-person-leg-left" />
        <span className="ssq-person-leg ssq-person-leg-right" />
      </div>
      <div className="ssq-qa-caliper">
        <span />
        <span />
        <i />
      </div>
      <div className="ssq-qa-meter">
        <span />
      </div>
      <span className="ssq-qa-check">✓</span>
    </>
  );
}

function DeliveryScene() {
  return (
    <>
      <div className="ssq-delivery-road" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="ssq-delivery-truck">
        <div className="ssq-delivery-container">
          <span className="ssq-container-face ssq-container-front" />
          <span className="ssq-container-face ssq-container-side" />
          <span className="ssq-container-face ssq-container-top" />
          <b>SSQ</b>
        </div>
        <div className="ssq-delivery-cab">
          <span className="ssq-cab-window" />
        </div>
        <span className="ssq-wheel ssq-wheel-front" />
        <span className="ssq-wheel ssq-wheel-rear" />
      </div>
      <span className="ssq-delivery-route">COIMBATORE → YOUR SITE</span>
    </>
  );
}

function ServiceScene({
  kind,
  icon: Icon,
}: {
  kind: ServiceKind;
  icon: LucideIcon;
}) {
  return (
    <div
      className={`ssq-service-scene ssq-scene-${kind}`}
      data-testid={`service-scene-${kind}`}
      aria-hidden="true"
    >
      <div className="ssq-scene-floor" />
      {kind === "customization" ? <CustomizationScene /> : null}
      {kind === "quality" ? <QualityScene /> : null}
      {kind === "delivery" ? <DeliveryScene /> : null}
      <span className="ssq-scene-badge">
        <Icon size={16} strokeWidth={1.7} />
      </span>
    </div>
  );
}

export function ServiceStory({
  services,
  paused,
  reduced,
}: {
  services: ServiceItem[];
  paused: boolean;
  reduced: boolean;
}) {
  const rootRef = useRef<HTMLOListElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const still = paused || reduced;

  useEffect(() => {
    const root = rootRef.current;
    const section = root?.closest("section");
    if (!root || !section) return;

    const cards = cardRefs.current;

    if (still) {
      section.dataset.sceneStage = "1";
      section.style.setProperty("--service-progress", "0.62");
      cards.forEach((card, i) => {
        if (!card) return;
        card.style.setProperty("--scene-p", "0.62");
        card.dataset.active = i === 0 ? "true" : "false";
      });
      railRef.current?.style.setProperty("--rail-p", "62%");
      if (stageRef.current) stageRef.current.textContent = "01 / 03";
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      if (document.hidden) return;
      const rect = section.getBoundingClientRect();
      const travel = section.offsetHeight - window.innerHeight;
      // Desktop keeps the cards pinned; smaller screens stack them, so each
      // scene follows its own viewport position instead of the sticky track.
      const pinned = travel > window.innerHeight * 0.5;
      const progress = pinned
        ? clamp(-rect.top / Math.max(1, travel), 0, 1)
        : clamp(
            (window.innerHeight - rect.top) /
              Math.max(1, window.innerHeight + rect.height),
            0,
            1,
          );
      const story = clamp((progress - 0.04) / 0.92, 0, 1);
      let active = Math.min(
        services.length - 1,
        Math.floor(story * services.length),
      );

      if (!pinned) {
        let closest = Number.POSITIVE_INFINITY;
        cards.forEach((card, i) => {
          if (!card) return;
          const cardRect = card.getBoundingClientRect();
          const distance = Math.abs(
            cardRect.top + cardRect.height / 2 - window.innerHeight * 0.52,
          );
          if (distance < closest) {
            closest = distance;
            active = i;
          }
        });
      }

      section.dataset.sceneStage = String(active + 1);
      section.style.setProperty("--service-progress", story.toFixed(3));
      railRef.current?.style.setProperty("--rail-p", `${(story * 100).toFixed(1)}%`);
      if (stageRef.current)
        stageRef.current.textContent = `0${active + 1} / 0${services.length}`;

      cards.forEach((card, i) => {
        if (!card) return;
        const cardRect = card.getBoundingClientRect();
        const viewportLocal = clamp(
          (window.innerHeight * 0.86 - cardRect.top) /
            Math.max(1, window.innerHeight * 0.6),
          0,
          1,
        );
        const local = pinned
          ? clamp(story * services.length - i, 0, 1)
          : viewportLocal;
        card.style.setProperty("--scene-p", local.toFixed(3));
        card.dataset.active = i === active ? "true" : "false";
        card.dataset.sceneDone = local > 0.96 ? "true" : "false";
      });
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    request();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, [services.length, still]);

  const onPointerMove = (
    event: ReactPointerEvent<HTMLLIElement>,
    index: number,
  ) => {
    if (still || event.pointerType !== "mouse") return;
    const card = cardRefs.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--tilt-x", `${(-y * 9).toFixed(2)}deg`);
    card.style.setProperty("--tilt-y", `${(x * 12).toFixed(2)}deg`);
  };
  const onPointerLeave = (index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <>
      <ol
        ref={rootRef}
        className="home-service-grid ssq-service-story"
        data-testid="service-story"
        data-still={still}
      >
        {services.map((service, index) => (
          <li
            key={service.title}
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
            className="home-service-card"
            data-kind={service.kind}
            data-active={index === 0}
            onPointerMove={(event) => onPointerMove(event, index)}
            onPointerLeave={() => onPointerLeave(index)}
          >
            <span className="home-service-number" aria-hidden="true">
              0{index + 1}.
            </span>
            <ServiceScene kind={service.kind} icon={service.icon} />
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </li>
        ))}
      </ol>
      <div className="ssq-service-rail" ref={railRef} aria-hidden="true">
        <span>SCROLL TO RUN THE PROCESS</span>
        <div className="ssq-service-rail-track">
          <i />
        </div>
        <span ref={stageRef}>01 / 03</span>
      </div>
    </>
  );
}
