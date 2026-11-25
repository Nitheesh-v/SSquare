"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  MoveHorizontal,
  Pause,
  Play,
} from "lucide-react";
import { useReducedMotion } from "@/components/shared/MotionPrimitives";
import {
  ComponentIllustration,
  MaterialFragment,
} from "@/features/journey/ComponentIllustration";
import { MATERIALS, modulo } from "@/features/journey/journey-data";
import { useQuoteModal } from "@/hooks";
import {
  createMaterialCarousel,
  type CarouselState,
  type MaterialCarousel,
} from "./material-carousel";
import "./material-carousel.css";

/** The earlier material arc, without the full journey's intro or scroll scenes. */
export function MaterialCarouselHero({
  paused,
  onPause,
}: {
  paused: boolean;
  onPause: () => void;
}) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<MaterialCarousel | undefined>(undefined);
  const selected = useRef(0);
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [focused, setFocused] = useState(false);
  const [state, setState] = useState<CarouselState>("static");
  const reduced = useReducedMotion();
  const autoplay = auto && !paused && !reduced;
  const settings = useRef({ paused, autoplay });
  settings.current = { paused, autoplay };
  const { openQuoteModal } = useQuoteModal();
  const material = MATERIALS[active];

  useEffect(() => {
    if (reduced || !root.current || !canvas.current) {
      setState("static");
      return;
    }
    setState("loading");
    const controller = createMaterialCarousel(root.current, canvas.current, {
      initial: selected.current,
      paused: settings.current.paused,
      auto: settings.current.autoplay,
      onSelect(index) {
        selected.current = index;
        setActive(index);
      },
      onState: setState,
    });
    engine.current = controller;
    return () => {
      controller.dispose();
      engine.current = undefined;
    };
  }, [reduced]);
  useEffect(() => engine.current?.setPaused(paused), [paused]);
  useEffect(() => engine.current?.setAuto(autoplay), [autoplay]);

  function select(index: number) {
    if (engine.current) engine.current.select(index);
    else {
      selected.current = index;
      setActive(index);
    }
  }
  function next(direction = 1) {
    if (engine.current) engine.current.next(direction);
    else select(modulo(selected.current + direction));
  }

  return (
    <section
      ref={root}
      className="material-carousel-hero"
      data-testid="material-carousel-hero"
      data-active-material={material.slug}
      data-webgl={state}
      data-reduced={reduced}
      data-paused={paused}
      aria-label="Manufacturing materials"
      aria-roledescription="carousel"
      style={{ "--material-color": material.color } as CSSProperties}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setFocused(false);
      }}
      onKeyDown={(event) => {
        if (!(event.target as Element).closest("[data-carousel-keys]")) return;
        if (event.key === "ArrowLeft") next(-1);
        else if (event.key === "ArrowRight") next();
        else if (event.key === "Home") select(0);
        else if (event.key === "End") select(2);
        else return;
        event.preventDefault();
      }}
    >
      <div className="material-carousel-rings" aria-hidden="true" />
      <div className="material-carousel-fragments" aria-hidden="true">
        {[0, 2, 1, 0, 2].map((type, i) => (
          <div className={`material-fragment material-fragment-${i}`} key={i}>
            <MaterialFragment type={type} />
          </div>
        ))}
      </div>
      <div className="material-carousel-topline">
        <p>
          <i /> CUSTOM COMPONENTS. CONSIDERED ENGINEERING.
        </p>
        <span>COIMBATORE, INDIA / THREE MATERIAL DISCIPLINES</span>
      </div>
      <div className="material-carousel-fallbacks" aria-hidden="true">
        {[-2, -1, 0, 1, 2].map((offset) => (
          <div
            className={`material-carousel-flat material-carousel-flat-${offset + 2}`}
            key={offset}
          >
            <ComponentIllustration type={modulo(active + offset)} />
          </div>
        ))}
      </div>
      {!reduced && (
        <canvas
          ref={canvas}
          className="material-carousel-canvas"
          data-testid="material-carousel-canvas"
          aria-hidden="true"
        />
      )}
      <div
        className="material-carousel-arc"
        role="group"
        tabIndex={0}
        data-carousel-keys
        data-drag-enabled={!reduced && !paused}
        aria-label="Explore the 3D material carousel"
        aria-describedby="material-carousel-help"
      />
      <span id="material-carousel-help" className="sr-only">
        {!reduced && !paused && "Drag horizontally, or "}
        use the left and right arrow keys to change material. Home selects
        Rubber; End selects Aluminium. Vertical scrolling is unchanged.
      </span>
      <div className="material-carousel-controls" data-carousel-keys>
        <button
          type="button"
          className="material-carousel-arrow material-carousel-previous"
          aria-label="Previous material"
          onClick={() => next(-1)}
        >
          <ArrowLeft size={18} />
        </button>
        <button
          type="button"
          className="material-carousel-arrow"
          aria-label="Next material"
          onClick={() => next()}
        >
          <ArrowRight size={18} />
        </button>
      </div>
      <h1
        id="home-heading"
        className="material-carousel-title"
        aria-live={autoplay && !focused ? "off" : "polite"}
        aria-atomic="true"
      >
        <span key={active} className="material-carousel-word">
          {Array.from(material.name.toUpperCase()).map((letter, i) => (
            <span
              key={i}
              style={{ "--letter-index": i } as CSSProperties}
              aria-hidden="true"
            >
              {letter}
            </span>
          ))}
        </span>
        <span className="sr-only">{material.name}</span>
      </h1>
      <span className="material-carousel-count" aria-hidden="true">
        0{active + 1}
      </span>
      <div className="material-carousel-playback">
        <button
          type="button"
          aria-label="Autoplay materials"
          aria-pressed={autoplay}
          disabled={reduced || paused}
          onClick={() => setAuto(!auto)}
        >
          <span className="material-carousel-auto-ring">
            {autoplay ? <Pause size={11} /> : <Play size={11} />}
          </span>
          AUTOPLAY
        </button>
        <button
          type="button"
          aria-label={paused ? "Resume visual motion" : "Pause visual motion"}
          aria-pressed={paused}
          disabled={reduced}
          onClick={onPause}
        >
          {paused || reduced ? <Play size={12} /> : <Pause size={12} />}
          {reduced ? "REDUCED MOTION" : paused ? "MOTION OFF" : "MOTION ON"}
        </button>
      </div>
      <p className="material-carousel-description" key={active}>
        {material.line}
      </p>
      <div
        className="material-carousel-tabs"
        role="group"
        aria-label="Explore manufacturing materials"
        data-carousel-keys
      >
        {MATERIALS.map((item, i) => (
          <button
            type="button"
            key={item.slug}
            aria-label={`0${i + 1} ${item.name}`}
            aria-pressed={active === i}
            onClick={() => select(i)}
          >
            <span>0{i + 1}</span>
            {item.name}
            <i />
          </button>
        ))}
      </div>
      <div className="material-carousel-actions">
        <button
          className="material-carousel-quote"
          type="button"
          onClick={() => openQuoteModal({ division: material.division })}
        >
          Request a Quote <ArrowUpRight size={17} />
        </button>
        <noscript>
          <a className="material-carousel-quote" href="/contact#quote">
            Request a Quote <ArrowUpRight size={17} />
          </a>
        </noscript>
        <a href="#material-divisions" className="material-carousel-discover">
          Explore our capabilities <ArrowDown size={16} />
        </a>
      </div>
      <p className="material-carousel-provenance">
        ILLUSTRATIVE 3D COMPONENTS
        <br />
        REPLACEABLE WITH S SQUARE CAD
        {state === "unavailable" && (
          <span>Static view — WebGL unavailable.</span>
        )}
      </p>
      <span className="material-carousel-drag-hint" aria-hidden="true">
        <MoveHorizontal size={16} />
        {reduced || paused ? "SELECT A MATERIAL" : "DRAG TO EXPLORE"}
      </span>
      <noscript>
        <style>{`.material-carousel-hero .material-carousel-controls,.material-carousel-hero .material-carousel-tabs,.material-carousel-hero .material-carousel-playback,.material-carousel-hero .material-carousel-arc,.material-carousel-hero button.material-carousel-quote,.material-carousel-hero .material-carousel-drag-hint{display:none}`}</style>
      </noscript>
    </section>
  );
}
