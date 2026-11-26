"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./home-3d-services.css";

/**
 * "OUR SERVICES": a continuous scroll-linked 3D section that replaces the
 * earlier generic "From the first drawing..." process block.
 *
 * The copy below is the exact service description supplied for this section.
 * See README.md for the sign-off note on the conformity / delivery claims.
 */
const SERVICES = [
  {
    title: "Customization",
    copy: "We provide high-quality custom rubber/aluminum/steel products as per your drawings/samples.",
  },
  {
    title: "Quality Assurance",
    copy: "We provide you an output with 100% Conformity to technical specifications, ensuring high quality and durability.",
  },
  {
    title: "Free Door Delivery",
    copy: "We provide free door delivery through DHL/FEDEX within 3-4 days to any part of the world.",
  },
] as const;

const SPECS = [
  {
    kicker: "01 / Customization",
    title: "Drawing & sample fabrication",
    copy: "Rubber, steel and aluminium billets, seals and machined profiles are formed to the supplied drawing or physical sample before loading into the production stage.",
  },
  {
    kicker: "02 / Quality Assurance",
    title: "Tolerance & conformity scan",
    copy: "Caliper rings, tolerance markers and a moving inspection plane verify the finished part against the agreed technical specification before dispatch.",
  },
  {
    kicker: "03 / Free Door Delivery",
    title: "Verified industrial load",
    copy: "The container truck carries the inspected load along the scroll-linked route toward dispatch and global delivery.",
  },
] as const;

const NOSCRIPT_CSS = `
  .home3d .services3d { height:auto!important; min-height:0!important }
  .home3d .services3d-pin { position:relative!important; height:auto!important; min-height:0!important; padding:64px 16px 80px!important }
  .home3d .services3d-canvas, .home3d .services3d-veil, .home3d .services3d-progress,
  .home3d .services3d-hint, .home3d .services3d-counter, .home3d .services3d-spec { display:none!important }
  .home3d .services3d-overlay { position:relative!important; inset:auto!important; display:block!important; padding:0!important; transform:none!important }
  .home3d .services3d-steps { display:grid!important; gap:14px!important; max-width:760px!important }
  .home3d .services3d-card { opacity:1!important; transform:none!important; pointer-events:auto!important }
`;

export function Services3DSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [specIndex, setSpecIndex] = useState<number | null>(null);

  const onSpec = useCallback((index: number) => {
    setSpecIndex(index);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const progressEl = progressRef.current;
    if (!section || !canvas || !progressEl) return;

    let cancelled = false;
    let dispose = () => {};

    import("./home-3d-services-engine")
      .then(async ({ createServices3DEngine }) => {
        if (cancelled) return;
        const teardown = await createServices3DEngine({
          section,
          canvas,
          progressEl,
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
        <canvas
          ref={canvasRef}
          className="services3d-canvas"
          aria-hidden="true"
        />
        <div className="services3d-veil" aria-hidden="true" />

        <div className="services3d-overlay">
          <header className="services3d-head">
            <p className="eb">04 / Customization → QA → Delivery</p>
            <h2 id="services-heading" className="services3d-title disp">
              Our Services
            </h2>
            <p className="services3d-lead">
              One continuous, scroll-linked 3D journey: a custom component is
              formed, inspected and loaded onto the delivery container truck.
            </p>
          </header>

          <div className="services3d-counter" aria-hidden="true">
            <strong>01</strong> / 03
          </div>

          <div className="services3d-steps">
            {SERVICES.map((service, index) => (
              <article className="services3d-card" data-i={index} key={service.title}>
                <span className="services3d-num">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="disp">{service.title}</h3>
                <p>{service.copy}</p>
                <button
                  type="button"
                  className="services3d-spec-trigger"
                  onClick={() => setSpecIndex(index)}
                >
                  View specs
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h13M13 6l6 6-6 6" />
                  </svg>
                </button>
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
              <h4 className="disp">{spec.title}</h4>
              <p>{spec.copy}</p>
            </aside>
          ) : null}

          <div className="services3d-progress" aria-hidden="true">
            <span ref={progressRef} />
          </div>

          <p className="services3d-hint" aria-hidden="true">
            <span className="services3d-hint-desktop">
              Scroll to animate · Drag to inspect · Click products for specs
            </span>
            <span className="services3d-hint-touch">
              Swipe to scroll · Swipe sideways to inspect · Tap parts for specs
            </span>
          </p>
        </div>
      </div>

      <noscript dangerouslySetInnerHTML={{ __html: `<style>${NOSCRIPT_CSS}</style>` }} />
    </section>
  );
}
