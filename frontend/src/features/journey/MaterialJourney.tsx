"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Layers3,
  MessageSquare,
  MoveHorizontal,
  Pause,
  PencilRuler,
  Phone,
  Play,
  Plus,
  ScanLine,
  Settings2,
  X,
} from "lucide-react";
import { useReducedMotion } from "@/components/shared/MotionPrimitives";
import { SmartProductImage } from "@/components/shared/SmartProductImage";
import { useQuoteModal } from "@/hooks";
import { COMPANY_INFO } from "@/lib/company-data";
import {
  ComponentIllustration,
  MaterialFragment,
} from "./ComponentIllustration";
import { MATERIALS, STORY_STEPS } from "./journey-data";
import type { JourneyController } from "./journey-engine";

const STEP_ICONS = [PencilRuler, ScanLine, Settings2, Layers3];

/** Four sections and a single travelling WebGL component, with complete static fallbacks. */
export function MaterialJourney() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<JourneyController | undefined>(undefined);
  const reduced = useReducedMotion();
  const { openQuoteModal } = useQuoteModal();
  const [active, setActive] = useState(0);
  const selected = useRef(0);
  const [auto, setAuto] = useState(false);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(0);
  const [intro, setIntro] = useState(false);
  const [entered, setEntered] = useState(false);
  const introRan = useRef(false);
  const [pack, setPack] = useState<(number | null)[]>([null, null, null]);
  const packRef = useRef(pack);
  const touched = useRef(false);
  const [status, setStatus] = useState("");
  const [preparing, setPreparing] = useState(false);
  const pendingRequest = useRef<(() => void) | null>(null);
  const flights = useRef(new Set<Animation>());
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const entranceState = useRef(false);
  const count = pack.filter((x) => x !== null).length;
  const material = MATERIALS[active];
  const finishIntro = useCallback(() => {
    setIntro(false);
    setEntered(true);
    entranceState.current = true;
    document.body.classList.remove("journey-locked");
  }, []);

  useEffect(() => {
    let cancelled = false;
    import("./journey-engine").then(({ createJourneyEngine }) => {
      if (cancelled || !root.current) return;
      const controller = createJourneyEngine(
        root.current,
        canvas.current,
        reduced,
        selected.current,
        {
          onSelect(index) {
            selected.current = index;
            setActive(index);
          },
          onAuto: setAuto,
          onStep: setStep,
        },
      );
      engine.current = controller;
      controller.setAuto(!reduced && !paused);
      controller.setPaused(paused);
      if (entranceState.current) controller.setEntered(true);
    });
    return () => {
      cancelled = true;
      engine.current?.dispose();
      engine.current = undefined;
    };
    // A preference change recreates the renderer safely; active selection is retained.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);
  useEffect(() => {
    if (introRan.current) return;
    // The first client snapshot may still be the static SSR snapshot.
    const wantsReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    introRan.current = true;
    let seen = false;
    try {
      seen = sessionStorage.getItem("ssquare-journey-intro") === "seen";
      sessionStorage.setItem("ssquare-journey-intro", "seen");
    } catch {
      /* Private storage is optional. */
    }
    if (wantsReduced || seen || scrollY > 100) {
      finishIntro();
      return;
    }
    setIntro(true);
    document.body.classList.add("journey-locked");
    const timer = setTimeout(finishIntro, 1900);
    return () => {
      clearTimeout(timer);
      document.body.classList.remove("journey-locked");
    };
  }, [finishIntro]);
  useEffect(() => {
    if (entered) engine.current?.setEntered(true);
  }, [entered]);
  useEffect(() => {
    if (reduced && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAuto(false);
      finishIntro();
    }
  }, [reduced, finishIntro]);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const targets = node.querySelectorAll<HTMLElement>(
      ".journey-reveal-content",
    );
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.18 },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const section = root.current?.querySelector("#range");
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || touched.current) return;
        observer.disconnect();
        [250, 410, 570].forEach((delay, i) => {
          const timer = setTimeout(
            () => {
              timers.current.delete(timer);
              if (touched.current) return;
              setPack((current) => {
                const next = [...current];
                next[i] = (selected.current + i) % 3;
                packRef.current = next;
                return next;
              });
            },
            reduced ? 0 : delay,
          );
          timers.current.add(timer);
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [reduced]);
  useEffect(() => {
    const animations = flights.current,
      pending = timers.current;
    return () => {
      animations.forEach((a) => {
        (
          (a.effect as KeyframeEffect | null)?.target as HTMLElement | undefined
        )?.remove();
        a.cancel();
      });
      pending.forEach(clearTimeout);
    };
  }, []);

  function fly(source: HTMLElement | null, index: number) {
    const badge = root.current?.querySelector<HTMLElement>(".brief-badge");
    if (!source || !badge || reduced || paused) return;
    const from = source.getBoundingClientRect(),
      to = badge.getBoundingClientRect();
    const copy = document.createElement("div");
    copy.className = "journey-flight";
    copy.style.cssText = `position:fixed;left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;z-index:70;pointer-events:none;filter:drop-shadow(0 10px 14px #0004);`;
    const image = source.querySelector("svg")?.cloneNode(true) as
      SVGElement | undefined;
    if (image) {
      image.style.visibility = "visible";
      image.style.width = image.style.height = "100%";
      copy.appendChild(image);
    } else return;
    document.body.appendChild(copy);
    const dx = to.left + to.width / 2 - from.left - from.width / 2,
      dy = to.top + to.height / 2 - from.top - from.height / 2,
      k = Math.min(0.2, 30 / from.height);
    const a = copy.animate(
      [
        { transform: "translate(0,0) scale(1) rotate(0)", opacity: 1 },
        {
          transform: `translate(${0.4 * dx}px,${0.4 * dy - Math.min(160, 0.35 * Math.abs(dy) + 60)}px) scale(${0.45 + k}) rotate(-10deg)`,
          opacity: 1,
          offset: 0.45,
        },
        {
          transform: `translate(${dx}px,${dy}px) scale(${k}) rotate(-18deg)`,
          opacity: 0.15,
        },
      ],
      { duration: 900, easing: "cubic-bezier(.5,0,.2,1)" },
    );
    flights.current.add(a);
    a.finished
      .then(() => {
        copy.remove();
        flights.current.delete(a);
        badge.animate(
          [
            { transform: "scale(1)" },
            { transform: "scale(1.5)" },
            { transform: "scale(1)" },
          ],
          { duration: 350 },
        );
      })
      .catch(() => copy.remove());
    root.current?.style.setProperty(
      "--brief-glow",
      `${MATERIALS[index].color}b8`,
    );
  }
  function add(index: number, source?: HTMLElement | null) {
    if (preparing) return;
    touched.current = true;
    const next = [...packRef.current],
      empty = next.indexOf(null);
    if (empty < 0) {
      setStatus(
        "Your brief has three components. Remove one below to change it.",
      );
      return;
    }
    next[empty] = index;
    packRef.current = next;
    setPack(next);
    setStatus(`${MATERIALS[index].name} added to your project brief.`);
    fly(source || null, index);
    const glow = root.current?.querySelector<HTMLElement>(".brief-glow");
    root.current?.style.setProperty(
      "--brief-glow",
      `${MATERIALS[index].color}b8`,
    );
    if (!reduced && !paused)
      glow?.animate([{ opacity: 0.55 }, { opacity: 1 }], { duration: 600 });
  }
  function remove(slot: number) {
    if (preparing) return;
    touched.current = true;
    const next = [...packRef.current];
    const old = next[slot];
    next[slot] = null;
    packRef.current = next;
    setPack(next);
    setStatus(
      old === null
        ? "This position is empty."
        : `${MATERIALS[old].name} removed from your brief.`,
    );
  }
  useEffect(() => {
    if (!reduced && !paused) return;
    flights.current.forEach((a) => {
      (
        (a.effect as KeyframeEffect | null)?.target as HTMLElement | undefined
      )?.remove();
      a.cancel();
    });
    flights.current.clear();
    pendingRequest.current?.();
  }, [reduced, paused]);

  function quoteBrief() {
    if (preparing) return;
    const names = packRef.current
      .filter((x): x is number => x !== null)
      .map((x) => MATERIALS[x].division);
    const open = () => {
      if (pendingRequest.current !== open) return;
      pendingRequest.current = null;
      setPreparing(false);
      openQuoteModal({
        division: [...new Set(names)].join(", "),
        message: `I would like to discuss these custom components:\n${names.map((name, i) => `${i + 1}. ${name} — drawing, quantity and application to confirm.`).join("\n")}\n\nPlease review material, geometry, finish and supply requirements with me.`,
      });
    };
    pendingRequest.current = open;
    if (reduced || paused) {
      open();
      return;
    }
    setPreparing(true);
    // The three parts travel to the brief badge, then open the actual RFQ.
    // Nothing is ordered or sent, and the visitor's editable selection is retained.
    packRef.current.forEach((index, i) => {
      if (index === null) return;
      const timer = setTimeout(() => {
        timers.current.delete(timer);
        if (pendingRequest.current === open)
          fly(
            root.current?.querySelector<HTMLElement>(
              `.brief-slot-${i} .brief-slot-part`,
            ) || null,
            index,
          );
      }, i * 120);
      timers.current.add(timer);
    });
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      open();
    }, 1200);
    timers.current.add(timer);
  }

  return (
    <div
      ref={root}
      className="material-journey"
      data-testid="material-journey"
      data-webgl="static"
      data-selected={active}
      data-paused={paused}
      data-reduced={reduced}
      style={{ "--flav": MATERIALS[0].color } as CSSProperties}
    >
      {!reduced && (
        <canvas
          ref={canvas}
          id="gl"
          className="journey-gl"
          aria-hidden="true"
          data-testid="journey-canvas"
        />
      )}
      {intro && (
        <div
          className="journey-intro"
          role="region"
          aria-label="S Square introduction"
        >
          <button type="button" className="journey-skip" onClick={finishIntro}>
            Skip intro <ArrowUpRight size={14} />
          </button>
          <div className="journey-stamp">
            <div className="stamp-logo">
              <Logo />
            </div>
            <small>FORM. MATERIAL. MOTION.</small>
          </div>
        </div>
      )}
      <section
        id="materials"
        className="journey-hero"
        aria-labelledby="material-title"
      >
        <div className="journey-reveal" aria-hidden="true" />
        <div className="journey-rings" aria-hidden="true" />
        <div className="journey-float-bits" aria-hidden="true">
          {[0, 2, 1, 0, 2].map((type, i) => (
            <div className={`float-bit float-bit-${i}`} key={i}>
              <MaterialFragment type={type} />
            </div>
          ))}
        </div>
        <div className="journey-topline">
          <p>
            <span className="journey-dot" /> CUSTOM COMPONENTS. CONSIDERED
            ENGINEERING.
          </p>
          <span>COIMBATORE, INDIA / THREE MATERIAL DISCIPLINES</span>
        </div>
        <div className="journey-fallbacks" aria-hidden="true">
          {[-2, -1, 0, 1, 2].map((k) => (
            <div className={`hero-flat hero-flat-${k + 2}`} key={k}>
              <ComponentIllustration type={(active + k + 3) % 3} />
            </div>
          ))}
        </div>
        <div
          className="journey-arc"
          role="group"
          aria-label="Drag to explore materials"
        />
        <div className="journey-hero-controls">
          <button
            type="button"
            className="journey-arrow journey-previous"
            aria-label="Previous material"
            onClick={() => engine.current?.next(-1)}
          >
            <ArrowLeft />
          </button>
          <button
            type="button"
            className="journey-arrow journey-next"
            aria-label="Next material"
            onClick={() => engine.current?.next()}
          >
            <ArrowRight />
          </button>
        </div>
        <h1
          id="material-title"
          className="journey-title j-display"
          aria-live="polite"
        >
          <span className="sr-only" data-title-label>
            Rubber
          </span>
          <span data-title-text aria-hidden="true">
            <span className="journey-word">
              {Array.from("RUBBER").map((c, i) => (
                <span className="journey-letter" key={i}>
                  {c}
                </span>
              ))}
            </span>
          </span>
        </h1>
        <div
          id="material-count"
          className="journey-count j-display"
          aria-hidden="true"
        >
          01
        </div>
        <div className="journey-autoplay">
          <button
            type="button"
            id="auto"
            aria-label="Autoplay materials"
            aria-pressed={auto}
            disabled={reduced || paused}
            onClick={() => {
              engine.current?.setAuto(!auto);
            }}
          >
            <span className="auto-ring">
              {auto ? <Pause size={11} /> : <Play size={11} />}
            </span>
            AUTOPLAY
          </button>
          <button
            className="motion-switch"
            type="button"
            aria-label={paused ? "Resume animations" : "Pause animations"}
            aria-pressed={paused}
            onClick={() => {
              setPaused(!paused);
              engine.current?.setPaused(!paused);
            }}
            disabled={reduced}
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}
            <span>
              {reduced ? "REDUCED MOTION" : paused ? "MOTION OFF" : "MOTION ON"}
            </span>
          </button>
        </div>
        <p className="journey-description" key={active}>
          {material.line}
        </p>
        <div
          className="journey-material-tabs"
          role="group"
          aria-label="Select a material"
        >
          {MATERIALS.map((m, i) => (
            <button
              type="button"
              key={m.slug}
              aria-label={`0${i + 1} ${m.name}`}
              aria-pressed={active === i}
              onClick={() => engine.current?.select(i)}
            >
              <span>0{i + 1}</span>
              {m.name}
              <i />
            </button>
          ))}
        </div>
        <div className="journey-hero-actions">
          <button
            className="j-button j-button-dark"
            type="button"
            onClick={() => openQuoteModal({ division: material.division })}
          >
            Request a Quote <ArrowUpRight size={17} />
          </button>
          <a href="#inside" className="journey-discover">
            Follow the component <ArrowDown size={16} />
          </a>
        </div>
        <p className="journey-model-label">
          ILLUSTRATIVE 3D COMPONENTS
          <br />
          REPLACEABLE WITH S SQUARE CAD
        </p>
        <span className="journey-drag-hint">
          <MoveHorizontal size={16} /> DRAG TO EXPLORE
        </span>
      </section>

      <section
        id="inside"
        className="journey-inside"
        aria-label="From your requirement to your component"
      >
        <div className="journey-pin">
          <div className="in-dark" />
          <div className="in-frame">
            <div className="in-num j-display" aria-hidden="true">
              01
            </div>
            <div
              id="inBar"
              className="inside-component-anchor"
              aria-hidden="true"
            >
              <ComponentIllustration type={active} />
            </div>
          </div>
          <p className="inside-model-label">
            ILLUSTRATIVE CONCEPT MODEL · NOT A PRODUCT SPECIFICATION
          </p>
        </div>
        <div className="journey-static-story">
          {STORY_STEPS.map((s, i) => (
            <article key={s.label}>
              <span>
                0{i + 1} / {s.label}
              </span>
              <h2 className="j-display">
                {i === 3 ? material.name : s.heading.join(" ")}
              </h2>
              <p>{s.caption}</p>
              {i === 1 && (
                <p>
                  Material, geometry, finish and supply terms are confirmed
                  during quotation.
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
      <div id="inFront" className="journey-in-front" aria-hidden={reduced}>
        <div className="in-front-frame">
          <p className="in-eyebrow">ONE COMPONENT. FROM IDEA TO APPLICATION.</p>
          <h2 className="in-head j-display">
            Your idea.
            <br />
            Our start.
          </h2>
          <div
            className="in-icons"
            role="group"
            aria-label="Manufacturing story steps"
          >
            {STEP_ICONS.map((Icon, i) => (
              <button
                type="button"
                key={i}
                aria-label={`Step ${i + 1}: ${STORY_STEPS[i].label}`}
                aria-pressed={step === i}
                onClick={() => engine.current?.stepTo(i)}
              >
                <Icon size={26} />
              </button>
            ))}
          </div>
          <p className="in-cap">
            A drawing. A sample. An application.
            <br />
            Let’s make it specific.
          </p>
        </div>
        <div className="journey-storm" aria-hidden="true">
          {Array.from({ length: 20 }, (_, i) => (
            <div className="storm-piece" key={i}>
              <MaterialFragment type={i < 14 ? active : i % 3} />
            </div>
          ))}
        </div>
      </div>

      <section
        id="material-divisions"
        className="journey-shop"
        aria-labelledby="journey-divisions-heading"
      >
        <div className="journey-shop-top journey-reveal-content">
          <h2 id="journey-divisions-heading" className="j-display">
            <span className="line-mask">
              <span>Find your</span>
            </span>
            <span className="line-mask">
              <span>material.</span>
            </span>
          </h2>
          <p>
            Three material disciplines.
            <br />
            One manufacturing partner.
            <br />
            Made to your requirement.
          </p>
        </div>
        <div className="journey-grid">
          {MATERIALS.map((m, i) => (
            <article
              key={m.slug}
              className={`journey-card journey-reveal-content ${active === i ? "live" : ""}`}
              data-material={m.slug}
              style={
                { "--card-color": m.color, "--card-index": i } as CSSProperties
              }
            >
              <p className="card-eyebrow">
                DIVISION 0{i + 1} / CUSTOM MANUFACTURE
              </p>
              <h3 className="j-display">{m.name}</h3>
              <button
                type="button"
                className="component-anchor"
                aria-label={`Inspect the illustrative ${m.name} component`}
                onClick={(event) => {
                  engine.current?.poke(i);
                  if (!reduced && !paused)
                    event.currentTarget.animate(
                      [
                        { transform: "scale(1,1)" },
                        { transform: "scale(1.06,.93)", offset: 0.3 },
                        { transform: "scale(.97,1.04)", offset: 0.6 },
                        { transform: "scale(1,1)" },
                      ],
                      { duration: 500 },
                    );
                }}
              >
                <ComponentIllustration type={i} />
              </button>
              <span className="card-model-label">
                ILLUSTRATIVE CONCEPT · REPLACEABLE
              </span>
              <div className="card-bottom">
                <p>{m.description}</p>
                <div className="card-tags">
                  {m.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="card-detail">
                  <div className="card-photo">
                    <SmartProductImage
                      src={m.image}
                      fallbackSrc={m.image}
                      alt={m.imageLabel}
                      illustrative={m.illustrative}
                      showPlaceholderBadge={false}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span>
                    {m.illustrative
                      ? "ILLUSTRATIVE VISUAL · REPLACEABLE"
                      : "PHOTO FROM THE OFFICIAL SITE"}
                    <Link href={`/products/${m.slug}`}>
                      Explore {m.slug} <ArrowUpRight size={14} />
                    </Link>
                  </span>
                  <button
                    type="button"
                    className="card-add"
                    aria-label={`Add ${m.name} to your brief`}
                    onClick={(e) =>
                      add(
                        i,
                        e.currentTarget
                          .closest("article")
                          ?.querySelector<HTMLElement>(".component-anchor"),
                      )
                    }
                  >
                    <Plus size={22} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="journey-shop-foot">
          <span>CUSTOM COMPONENTS, NOT ONLINE STOCK.</span>
          <Link href="/products">
            Explore the full catalog <ArrowUpRight size={14} />
          </Link>
          <span>GEOMETRY, GRADE & TERMS CONFIRMED PER QUOTE.</span>
        </div>
      </section>

      <section
        id="range"
        className="journey-builder"
        aria-labelledby="brief-heading"
      >
        <div className="brief-copy journey-reveal-content">
          <p className="j-eyebrow">YOUR NEXT PROJECT STARTS HERE.</p>
          <h2 id="brief-heading" className="j-display">
            <span className="line-mask">
              <span>Build your</span>
            </span>
            <span className="line-mask">
              <span>
                <b>3</b> component
              </span>
            </span>
            <span className="line-mask">
              <span>brief.</span>
            </span>
          </h2>
          <p className="brief-intro">
            One project. Any combination.
            <br />
            Pick your materials. Let’s work out the details.
          </p>
          <div
            className="brief-thumbnails"
            role="group"
            aria-label="Add materials to your brief"
          >
            {MATERIALS.map((m, i) => {
              const n = pack.filter((x) => x === i).length;
              return (
                <button
                  type="button"
                  key={m.slug}
                  aria-label={`Add ${m.name} to brief`}
                  onClick={(e) =>
                    add(
                      i,
                      e.currentTarget.querySelector<HTMLElement>(
                        ".brief-thumb-image",
                      ),
                    )
                  }
                >
                  <span
                    className="brief-thumb-image"
                    style={{ background: m.color }}
                  >
                    <ComponentIllustration type={i} />
                    <span className="thumb-count">
                      {n === 1 ? (
                        <Check size={12} />
                      ) : n > 1 ? (
                        n
                      ) : (
                        <Plus size={12} />
                      )}
                    </span>
                  </span>
                  <strong>{m.name}</strong>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            id="brief-buy"
            className="brief-buy"
            disabled={count < 3}
            aria-busy={preparing}
            onClick={quoteBrief}
          >
            {preparing
              ? "Preparing your brief…"
              : count < 3
                ? `Pick ${3 - count} more`
                : "Request this combination"}
            <span>
              {count === 3 ? <ArrowUpRight size={18} /> : `${count} / 3`}
            </span>
          </button>
          <p className="brief-disclaimer">
            A starting point, not an order. No cart. No online payment.
            <br />
            Add drawings, quantities and requirements in the quote form.
          </p>
        </div>
        <div className="brief-arrangement">
          <div className="brief-glow" />
          <div className="brief-orbit" aria-hidden="true" />
          {pack.map((index, i) => (
            <div
              key={i}
              className={`brief-slot brief-slot-${i} ${index !== null ? "filled" : ""}`}
            >
              <span className="brief-slot-number">0{i + 1}</span>
              {index !== null && (
                <div key={index} className="brief-slot-part">
                  <ComponentIllustration type={index} />
                  <span>{MATERIALS[index].name}</span>
                </div>
              )}
              <button
                type="button"
                aria-label={
                  index === null
                    ? `Empty brief position ${i + 1}`
                    : `Remove ${MATERIALS[index].name} from position ${i + 1}`
                }
                disabled={index === null}
                onClick={() => remove(i)}
              >
                <X size={19} />
              </button>
            </div>
          ))}
        </div>
        <div className="brief-contact">
          <a href={`tel:${COMPANY_INFO.phoneRaw}`}>
            <Phone size={16} />
            {COMPANY_INFO.phone}
          </a>
          <a
            href={COMPANY_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageSquare size={16} />
            Talk on WhatsApp <ArrowUpRight size={14} />
          </a>
          <span>COIMBATORE, INDIA → YOUR APPLICATION</span>
        </div>
      </section>
      <nav className="journey-rail" aria-label="Page sections">
        <span className="journey-rail-highlight" aria-hidden="true" />
        {[
          ["#materials", "Materials"],
          ["#inside", "Inside"],
          ["#material-divisions", "Divisions"],
          ["#range", "Your brief"],
        ].map(([href, label], i) => (
          <a
            key={href}
            href={href}
            data-section={i}
            onClick={() => engine.current?.invalidate()}
          >
            {label}
            {i === 3 && (
              <span
                className="brief-badge"
                aria-label={`${count} selected components`}
              >
                {count}
              </span>
            )}
          </a>
        ))}
      </nav>
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
