"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, MessageSquare, Phone } from "lucide-react";
import { useReducedMotion } from "@/components/shared/MotionPrimitives";
import { OpenQuoteButton } from "@/components/shared/OpenQuoteButton";
import { COMPANY_INFO } from "@/lib/company-data";
import { S_SQUARE_CAD_MODEL_URL } from "@/lib/visual-config";

// Three.js, its environment, and the model are excluded from the initial bundle.
const Scene = dynamic(() => import("./AluminiumScrollScene"), {
  ssr: false,
  loading: () => null,
});
const STAGES = [
  {
    label: "Material",
    code: "01 / MATERIAL INTELLIGENCE",
    title: "Less weight.\nMore possibility.",
    description:
      "Aluminium brings a useful balance of strength, low weight and conductivity. Grade 6061 is one of the materials in our custom component range.",
    detail: "GRADE 6061  /  CUSTOM ALUMINIUM",
    note: "Material selection starts with your application, not a stock part number.",
  },
  {
    label: "Detail",
    code: "02 / GEOMETRY & DETAIL",
    title: "Every interface\nhas a purpose.",
    description:
      "Profiles, bores, mounting faces and die cavities begin with a drawing or sample. We review your geometry and application before confirming the manufacturing specification.",
    detail: "PROFILES  /  MACHINED PARTS  /  DIE MOLDS",
    note: "Scroll to examine the concept from another angle. No dimensions are implied.",
  },
  {
    label: "Assembly",
    code: "03 / THE COMPLETE PICTURE",
    title: "Consider the part.\nUnderstand the fit.",
    description:
      "An exploded view reveals how a profile, collar and fasteners relate. It is a way to discuss an interface—not a claim that this illustrative assembly is an S Square production part.",
    detail: "ILLUSTRATIVE EXPLODED ASSEMBLY",
    note: "Share mating-part details and operating conditions with your enquiry.",
  },
  {
    label: "Specification",
    code: "04 / FROM YOUR DRAWING",
    title: "Your specification.\nOur starting point.",
    description:
      "Anodized or painted finishes, material choice, quantity and drawing details all shape a custom quotation. Bring us your requirements and let’s define the next component together.",
    detail: "DRAWING OR SAMPLE  /  PROJECT REVIEW",
    note: "Final geometry, finish, feasibility and delivery are confirmed during quotation.",
  },
];

function TechnicalDrawing() {
  return (
    <svg
      viewBox="0 0 600 480"
      className="h-full w-full"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="profile-face"
          x1="200"
          y1="100"
          x2="420"
          y2="380"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#a7bed0" stopOpacity=".22" />
          <stop offset="1" stopColor="#829eb3" stopOpacity=".04" />
        </linearGradient>
      </defs>
      <g stroke="#86a6bf" strokeWidth="1.2" strokeLinejoin="round">
        <path d="m156 165 142-75 154 89-140 79z" fill="url(#profile-face)" />
        <path
          d="m156 165 156 93v164L156 330zM312 258l140-79v164l-140 79"
          fill="url(#profile-face)"
        />
        <path d="m172 185 124 74v140l-124-74zM330 260l105-59v129l-105 59z" />
        <path
          d="m205 145 143 85v168M246 123l145 85v167M156 220l156 93 140-79M156 275l156 93 140-79"
          strokeOpacity=".4"
        />
        <ellipse
          cx="305"
          cy="170"
          rx="40"
          ry="23"
          transform="rotate(4 305 170)"
        />
        <path d="m265 170 1 62m79-62v63" strokeDasharray="4 5" />
        <path
          d="m173 82 132-70 141 82-133 74z"
          fill="#101925"
          stroke="#f6af70"
        />
        <ellipse cx="309" cy="90" rx="38" ry="22" stroke="#f6af70" />
        <path d="m174 82v19l139 85 133-73V94M313 168v18" stroke="#f6af70" />
        <path
          d="m305 12 1 78m7 96v72m-139-157-18 64m290-52 6 66"
          strokeDasharray="4 6"
          strokeOpacity=".6"
        />
        <path
          d="M110 152V341m-10-184 20-10m-20 199 20-10M160 369l151 92 151-87m-306-14 6 18m143 74 13 15m138-101 11 16"
          stroke="#f6af70"
        />
        <circle
          cx="304"
          cy="169"
          r="154"
          strokeOpacity=".15"
          strokeDasharray="3 6"
        />
      </g>
      <g fill="#adc6d8" fontFamily="monospace" fontSize="9" letterSpacing="1">
        <text x="65" y="250" transform="rotate(-90 65 250)">
          CUSTOM PROFILE
        </text>
        <text x="355" y="453">
          DRAWING / SAMPLE
        </text>
        <text x="420" y="42" fill="#fdba74">
          COLLAR
        </text>
      </g>
      <path
        d="M409 46h-49l-18 21M470 283h53"
        stroke="#f6af70"
        strokeWidth=".8"
      />
      <circle cx="470" cy="283" r="3" fill="#f6af70" />
    </svg>
  );
}

export function AluminiumScrollStory({
  cadModelUrl = S_SQUARE_CAD_MODEL_URL,
}: {
  cadModelUrl?: string;
}) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const progressLine = useRef<HTMLDivElement>(null);
  const [nearView, setNearView] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const onUnavailable = useCallback(() => {
    setUnavailable(true);
    setReady(false);
  }, []);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    if (!section.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "500px" },
    );
    observer.observe(section.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!nearView || reduced || !track.current) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled || !track.current) return;
        gsap.registerPlugin(ScrollTrigger);
        const driver = { value: 0 };
        const stageNodes = Array.from(
          track.current.querySelectorAll<HTMLElement>(".story-step"),
        );
        let lastStage = -1;
        const tween = gsap.to(driver, {
          value: 1,
          ease: "none",
          scrollTrigger: {
            trigger: track.current,
            start: "top 30%",
            end: "bottom bottom",
            scrub: 0.65,
            invalidateOnRefresh: true,
          },
          onUpdate: () => {
            progress.current = driver.value;
            if (progressLine.current)
              progressLine.current.style.transform = `scaleX(${driver.value})`;
            // Match the label to the copy at the reading line, not an arbitrary
            // quarter of the document (the mobile sticky layout has a different offset).
            const line =
              window.innerHeight * (window.innerWidth < 768 ? 0.76 : 0.55);
            let stage = 0,
              distance = Infinity;
            stageNodes.forEach((node, index) => {
              const rect = node.getBoundingClientRect();
              const delta = Math.abs(rect.top + rect.height / 2 - line);
              if (delta < distance) {
                distance = delta;
                stage = index;
              }
            });
            if (stage !== lastStage) {
              lastStage = stage;
              setActive(stage);
            }
          },
        });
        dispose = () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      },
    );
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [nearView, reduced]);

  const showScene = nearView && !reduced && !unavailable;
  return (
    <section
      id="engineering-story"
      ref={section}
      className="engineering-story border-b border-carbon-800"
      aria-labelledby="story-heading"
    >
      <div className="shell pb-8 pt-16 lg:pt-20">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-white/15 pb-7">
          <div>
            <p className="eyebrow text-forge-300">
              THE ANATOMY OF A CUSTOM COMPONENT
            </p>
            <h2
              id="story-heading"
              className="mt-3 font-display text-3xl font-semibold sm:text-4xl"
            >
              Precision. From every perspective.
            </h2>
          </div>
          <a
            href="#after-story"
            className="inline-flex items-center gap-2 py-2 font-mono text-[10px] uppercase tracking-wide text-slate-300 hover:text-forge-300"
          >
            Skip the story
            <ArrowDown size={14} />
          </a>
        </div>
        <div className="story-layout" ref={track}>
          <figure
            className="story-visual m-0"
            aria-label="Illustrative aluminium profile and collar, rotating, separating into an exploded view, and revealing CAD-style edges as you scroll"
          >
            <div className="story-grid" aria-hidden="true" />
            <div className="story-ambient" aria-hidden="true" />
            <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between font-mono text-[9px] tracking-wider text-slate-400">
              <span>AL / COMPONENT STUDY 001</span>
              <span className="text-forge-300">
                {STAGES[active].label.toUpperCase()}
              </span>
            </div>
            {(!showScene || !ready) && (
              <div className="absolute inset-x-3 bottom-9 top-9">
                <TechnicalDrawing />
              </div>
            )}
            {showScene && (
              <Scene
                progress={progress}
                onUnavailable={onUnavailable}
                onReady={onReady}
                cadModelUrl={cadModelUrl}
              />
            )}
            <div
              className="pointer-events-none absolute bottom-12 left-4 font-mono text-[9px] text-slate-400"
              aria-hidden="true"
            >
              <span className="text-forge-300">Z</span>
              <span className="mx-2 text-slate-600">/</span>Y
              <span className="mx-2 text-slate-600">/</span>X
            </div>
            <figcaption className="absolute bottom-3 left-4 right-4 text-center font-mono text-[8px] leading-relaxed tracking-wide text-slate-300 sm:text-[9px]">
              Illustrative Concept Model · Replaceable with S Square CAD
            </figcaption>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
              <div
                ref={progressLine}
                className="h-full origin-left scale-x-0 bg-forge-400"
              />
            </div>
          </figure>
          <div className="story-copy">
            {STAGES.map((stage, index) => (
              <article
                className="story-step"
                id={`aluminium-stage-${index + 1}`}
                key={stage.code}
              >
                <p className="eyebrow text-forge-300">{stage.code}</p>
                <h3 className="mt-5 whitespace-pre-line font-display text-[clamp(2.6rem,4.5vw,4.3rem)] font-semibold leading-[1.02] tracking-tight">
                  {stage.title}
                </h3>
                <p className="mt-6 max-w-lg text-sm leading-[1.9] text-slate-300">
                  {stage.description}
                </p>
                <div className="story-spec-line mt-7 w-28" />
                <p className="mt-4 font-mono text-[9px] tracking-wider text-forge-300">
                  {stage.detail}
                </p>
                <p className="mt-3 max-w-md text-xs leading-relaxed text-slate-400">
                  {stage.note}
                </p>
                {index === 3 && (
                  <div className="mt-7">
                    <OpenQuoteButton
                      label="Request a Quote"
                      prefill={{ division: "Aluminium Products" }}
                    />
                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs">
                      <a
                        href={`tel:${COMPANY_INFO.phoneRaw}`}
                        className="inline-flex items-center gap-2 py-2 text-slate-200 hover:text-forge-300"
                      >
                        <Phone size={14} />
                        {COMPANY_INFO.phone}
                      </a>
                      <a
                        href={COMPANY_INFO.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 py-2 text-slate-200 hover:text-forge-300"
                      >
                        <MessageSquare size={14} />
                        WhatsApp
                        <ArrowUpRight size={12} />
                      </a>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-5 border-t border-white/15 pb-4 pt-6">
          <div className="flex flex-wrap gap-5 font-mono text-[10px] uppercase tracking-wider">
            {STAGES.map((stage, index) => (
              <a
                key={stage.label}
                href={`#aluminium-stage-${index + 1}`}
                className="story-stage-label py-2"
                data-active={active === index}
              >
                0{index + 1} {stage.label}
              </a>
            ))}
          </div>
          <Link
            href="/products/aluminium"
            className="inline-flex items-center gap-2 py-2 text-xs text-slate-200 hover:text-forge-300"
          >
            Explore aluminium components
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <p className="pb-4 font-mono text-[9px] leading-relaxed text-slate-400">
          {reduced
            ? "STATIC TECHNICAL VIEW · Reduced motion is respected. All information is available without animation."
            : unavailable
              ? "STATIC TECHNICAL VIEW · WebGL is unavailable on this device. All information remains available."
              : "SCROLL TO EXAMINE · A visual explanation of custom engineering, not a production drawing or a specification."}
        </p>
      </div>
    </section>
  );
}
