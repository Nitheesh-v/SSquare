"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { Dialog } from "@/components/shared/Dialog";
import { RING_COUNT, type RingSlide } from "./slides";

/**
 * Right-side station inspector. The APERTURE ROW brief opens a product drawer
 * with a cart; S Square is an RFQ manufacturer, so the same layout shows the
 * reviewed spec sheet, condition notes, project options and application prints
 * and ends in the real quotation dialog. No prices, cart or checkout.
 */

const PRINTS: Record<string, { src: string; caption: string }[]> = {
  rubber: [
    { src: "/images/division-rubber.jpg", caption: "MOLDED SEALS / O-RINGS" },
    { src: "/images/ssquare/machined-components.jpg", caption: "BONDED ASSEMBLIES" },
    { src: "/images/quality-metrology.jpg", caption: "INSPECTION BENCH" },
  ],
  steel: [
    { src: "/images/division-steel.jpg", caption: "MACHINED FLANGES" },
    { src: "/images/ssquare/machined-components.jpg", caption: "TURNED PARTS" },
    { src: "/images/infrastructure-facility.jpg", caption: "SHOP FLOOR" },
  ],
  aluminium: [
    { src: "/images/division-aluminium.jpg", caption: "DIE TOOLING" },
    { src: "/images/ssquare/aluminium-tooling.jpg", caption: "PROFILES / BILLETS" },
    { src: "/images/quality-metrology.jpg", caption: "DIMENSIONAL CHECK" },
  ],
};

export function StationDrawer({
  open,
  slide,
  index,
  onClose,
  onQuote,
}: {
  open: boolean;
  slide: RingSlide;
  index: number;
  onClose: () => void;
  onQuote: () => void;
}) {
  const plate = useRef<HTMLDivElement>(null);
  const [option, setOption] = useState(0);
  const [lightbox, setLightbox] = useState<{ src: string; caption: string } | null>(
    null,
  );

  useEffect(() => {
    if (!open) {
      setLightbox(null);
      setOption(0);
    }
  }, [open, slide.id]);

  const onPlateMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const node = plate.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    node.style.setProperty("--tilt-y", `${x * 24}deg`);
    node.style.setProperty("--tilt-x", `${-y * 20}deg`);
  };
  const resetPlate = () => {
    plate.current?.style.setProperty("--tilt-y", "0deg");
    plate.current?.style.setProperty("--tilt-x", "0deg");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy="ar-drawer-title"
      className="ssq-drawer ar-station-drawer"
    >
      <div className="ar-drawer-inner" data-testid="ar-station-drawer">
        <header className="ar-drawer-header">
          <p>
            0{index + 1} / 0{RING_COUNT} · {slide.kicker}
          </p>
          <button type="button" aria-label="Close station details" onClick={onClose}>
            <X size={17} />
          </button>
        </header>

        <div className="ar-drawer-scroll">
          <div
            ref={plate}
            className="ar-drawer-plate"
            onPointerMove={onPlateMove}
            onPointerLeave={resetPlate}
          >
            <img src={slide.image} alt="" aria-hidden="true" draggable={false} />
            <span className="ar-drawer-plate-code">STATION 0{index + 1}</span>
          </div>

          <div className="ar-drawer-body">
            <p className="ar-drawer-kicker">{slide.type}</p>
            <h2 id="ar-drawer-title">{slide.name}</h2>
            <p className="ar-drawer-description">{slide.description}</p>

            <section className="ar-drawer-block" aria-label="Specifications">
              <h3>Specs</h3>
              <dl className="ar-drawer-specs">
                {slide.specs.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="ar-drawer-block" aria-label="Condition">
              <h3>Condition</h3>
              <div className="ar-drawer-chips">
                {slide.condition.map((item) => (
                  <span key={item}>
                    <Check size={12} /> {item}
                  </span>
                ))}
              </div>
            </section>

            <section className="ar-drawer-block" aria-label="Project options">
              <h3>Project options</h3>
              <div className="ar-drawer-options">
                {[
                  ["Drawing review", "Geometry, grade and finish confirmed against your drawing."],
                  ["Sample match", "We work from a physical reference sample and agreed tolerances."],
                ].map(([title, copy], i) => (
                  <button
                    key={title}
                    type="button"
                    aria-pressed={option === i}
                    data-selected={option === i}
                    onClick={() => setOption(i)}
                  >
                    <strong>{title}</strong>
                    <span>{copy}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="ar-drawer-block" aria-label="Typical output">
              <h3>Typical output</h3>
              <div className="ar-drawer-prints">
                {PRINTS[slide.id].map((print) => (
                  <button
                    key={print.src + print.caption}
                    type="button"
                    onClick={() => setLightbox(print)}
                    aria-label={`Enlarge ${print.caption}`}
                  >
                    <img src={print.src} alt={print.caption} loading="lazy" />
                    <span>{print.caption}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>

        <footer className="ar-drawer-footer">
          <span>RFQ / 0{index + 1} · {slide.division}</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onQuote();
            }}
          >
            Request a Quote <ArrowRight size={16} />
          </button>
        </footer>

        {lightbox ? (
          <div
            className="ar-lightbox"
            role="dialog"
            aria-label={lightbox.caption}
            onClick={() => setLightbox(null)}
          >
            <div className="ar-lightbox-print" onClick={(e) => e.stopPropagation()}>
              <img src={lightbox.src} alt={lightbox.caption} />
              <div>
                <span>SHOT ON {slide.name}</span>
                <span>▸ 14A</span>
              </div>
              <button
                type="button"
                aria-label="Close enlarged print"
                onClick={() => setLightbox(null)}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
