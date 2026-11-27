"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import "./home-3d-services.css";

/**
 * "OUR SERVICES": a continuous scroll-linked 3D section modelled on the
 * supplied reference screenshots (deep navy stage, three service cards,
 * branded container truck, progress pill). The exact service copy and the
 * control/performance requirements are preserved from the brief.
 *
 * See README.md for the sign-off note on the conformity / delivery claims.
 */
const SERVICES = [
  {
    tag: "DRAWINGS & SAMPLES",
    title: "Customization",
    copy: "We provide high-quality custom rubber/aluminum/steel products as per your drawings/samples.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.5 5.5a4 4 0 0 0-5.1 5.1L4 16l4 4 5.4-5.4a4 4 0 0 0 5.1-5.1l-2.7 2.7-2.1-2.1 2.7-2.7Z" />
      </svg>
    ),
  },
  {
    tag: "100% CONFORMITY",
    title: "Quality Assurance",
    copy: "We provide you an output with 100% Conformity to technical specifications, ensuring high quality and durability.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    tag: "DHL / FEDEX · 3-4 DAYS",
    title: "Free Door Delivery",
    copy: "We provide free door delivery through DHL/FEDEX within 3-4 days to any part of the world.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
        <circle cx="7" cy="18" r="1.8" />
        <circle cx="17.5" cy="18" r="1.8" />
      </svg>
    ),
  },
] as const;

const SPECS = [
  {
    kicker: "01 / Customization",
    title: "Drawing & sample fabrication",
    copy: "A raw billet, seal and machined profile form inside the fabrication stage from the supplied drawing or physical sample before loading into production.",
  },
  {
    kicker: "02 / Quality Assurance",
    title: "Tolerance & conformity scan",
    copy: "The caliper arch, tolerance rings and scanning plane verify the finished part against the agreed technical specification before dispatch.",
  },
  {
    kicker: "03 / Free Door Delivery",
    title: "S Square Metal & Rubber Express",
    copy: "The branded container truck carries the inspected industrial load along the scroll-linked route toward global door delivery.",
  },
] as const;

const NOSCRIPT_CSS = `
  .home3d .services3d { height:auto!important; min-height:0!important }
  .home3d .services3d-pin { position:relative!important; height:auto!important; min-height:0!important; padding:72px 16px 80px!important }
  .home3d .services3d-canvas, .home3d .services3d-veil, .home3d .services3d-track,
  .home3d .services3d-control, .home3d .services3d-spec { display:none!important }
  .home3d .services3d-overlay { position:relative!important; inset:auto!important; display:block!important; padding:0!important; transform:none!important }
  .home3d .services3d-cards { display:grid!important; overflow:visible!important; gap:14px!important }
  .home3d .services3d-card { opacity:1!important; transform:none!important; pointer-events:auto!important; background:#101a2b!important; color:#f6f3ee!important }
  .home3d .services3d-tag { pointer-events:none!important }
`;

function ControlIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 3.5v6.3M4 14.5l5.6-2.2M20 14.5l-5.6-2.2" />
    </svg>
  );
}

export function Services3DSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [specIndex, setSpecIndex] = useState<number | null>(null);

  const onSpec = useCallback((index: number) => {
    setSpecIndex(index);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const progressEl = trackRef.current;
    const percentEl = percentRef.current;
    const cardsEl = cardsRef.current;
    if (!section || !canvas || !progressEl || !percentEl || !cardsEl) return;

    let cancelled = false;
    let dispose = () => {};

    import("./home-3d-services-engine")
      .then(async ({ createServices3DEngine }) => {
        if (cancelled) return;
        const teardown = await createServices3DEngine({
          section,
          canvas,
          progressEl,
          percentEl,
          cardsEl,
          onSpec,
        });
        if (cancelled) teardown();
        else dispose = teardown;
      })
      .catch((error) => {
        console.error("Services 3D engine unavailable; showing static services.", error);
        if (!cancelled) {
          section.dataset.fallback = "true";
          section.dataset.step = "all";
        }
      });

    return () => {
      cancelled = true;
      dispose();
    };
  }, [onSpec]);

  const spec = specIndex === null ? null : SPECS[specIndex];

  return (
    <section
      id="process"
      ref={sectionRef}
      className="services3d"
      data-nav="dark"
      data-step="0"
      data-spec-open={specIndex === null ? "false" : "true"}
      aria-labelledby="services-heading"
    >
      <div className="services3d-pin">
        <canvas ref={canvasRef} className="services3d-canvas" aria-hidden="true" />
        <div className="services3d-veil" aria-hidden="true" />

        <div className="services3d-overlay">
          <header className="services3d-head">
            <p className="services3d-kicker">Services</p>
            <h2 id="services-heading" className="services3d-title">
              Our Services
            </h2>
          </header>

          <div className="services3d-control" aria-hidden="true">
            <span className="services3d-control-icon">
              <ControlIcon />
            </span>
            <span className="services3d-control-desktop">
              Scroll to animate · Drag to inspect · Click products for specs
            </span>
            <span className="services3d-control-touch">
              Swipe to scroll · Drag to inspect · Tap products for specs
            </span>
            <span className="services3d-percent" ref={percentRef}>
              00%
            </span>
          </div>

          <div className="services3d-track" aria-hidden="true">
            <span ref={trackRef} className="services3d-track-fill" />
          </div>

          <div className="services3d-cards" ref={cardsRef}>
            {SERVICES.map((service, index) => (
              <article className="services3d-card" data-i={index} key={service.title}>
                <div className="services3d-card-top">
                  <span className="services3d-num">{String(index + 1).padStart(2, "0")}.</span>
                  <button
                    type="button"
                    className="services3d-tag"
                    onClick={() => setSpecIndex(index)}
                    aria-label={`Show ${service.title} specifications`}
                  >
                    {service.tag}
                  </button>
                </div>
                <div className="services3d-card-main">
                  <span className="services3d-icon" aria-hidden="true">
                    {service.icon}
                  </span>
                  <div>
                    <h3>{service.title}</h3>
                    <p>{service.copy}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {spec ? (
            <aside className="services3d-spec" role="status" aria-live="polite">
              <div className="services3d-spec-head">
                <span>{spec.kicker}</span>
                <button
                  type="button"
                  className="services3d-spec-close"
                  aria-label="Close specifications"
                  onClick={() => setSpecIndex(null)}
                >
                  ×
                </button>
              </div>
              <h4>{spec.title}</h4>
              <p>{spec.copy}</p>
            </aside>
          ) : null}
        </div>
      </div>

      <noscript dangerouslySetInnerHTML={{ __html: `<style>${NOSCRIPT_CSS}</style>` }} />
    </section>
  );
}
