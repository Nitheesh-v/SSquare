"use client";

import { useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  MoveHorizontal,
  Pause,
  Play,
  Rotate3D,
} from "lucide-react";
import { useReducedMotion } from "@/components/shared/MotionPrimitives";
import { ComponentIllustration } from "@/features/journey/ComponentIllustration";
import { STUDIO_MATERIALS } from "./materials";
import type { HomeMotionState } from "./home-motion";

/** The existing study controls; the shared traveller arrives in this viewport. */
export function ComponentInspector({
  active,
  onSelect,
  paused,
  onPause,
  state,
  rotation,
  onRotate,
}: {
  active: number;
  onSelect: (index: number) => void;
  paused: boolean;
  onPause: () => void;
  state: HomeMotionState;
  rotation: number;
  onRotate: (angle: number) => void;
}) {
  const reduced = useReducedMotion();
  const drag = useRef<{
    x: number;
    y: number;
    angle: number;
    captured: boolean;
  } | null>(null);
  return (
    <div
      className="component-inspector"
      data-testid="component-inspector"
      data-state={reduced ? "static" : state}
    >
      <div className="inspector-toolbar">
        <span>
          <i /> MATERIAL STUDY / 0{active + 1}
        </span>
        <button
          type="button"
          onClick={onPause}
          disabled={reduced}
          aria-label={paused ? "Resume 3D motion" : "Pause 3D motion"}
        >
          {paused || reduced ? <Play size={12} /> : <Pause size={12} />}{" "}
          {reduced
            ? "STILL VIEW"
            : paused
              ? "MOTION PAUSED"
              : "SCROLL TO ROTATE"}
        </button>
      </div>
      <div
        className="inspector-viewport"
        role="img"
        aria-label={`Illustrative ${STUDIO_MATERIALS[active].name} component; drag horizontally or use the rotation buttons`}
      >
        <div className="inspector-orbit" aria-hidden="true" />
        <InspectorGear className="home-study-gear home-study-gear-a" />
        <InspectorGear className="home-study-gear home-study-gear-b" />
        <span className="inspector-cross cross-one" aria-hidden="true">
          +
        </span>
        <span className="inspector-cross cross-two" aria-hidden="true">
          +
        </span>
        <div
          className="inspector-fallback"
          style={{
            transform: `translate(-50%,-50%) rotate(-12deg) rotateY(${rotation}deg)`,
          }}
        >
          <ComponentIllustration type={active} />
        </div>
        <div
          className="inspector-gesture"
          aria-hidden="true"
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            drag.current = {
              x: e.clientX,
              y: e.clientY,
              angle: rotation,
              captured: false,
            };
          }}
          onPointerMove={(e) => {
            const start = drag.current;
            if (!start) return;
            const dx = e.clientX - start.x,
              dy = e.clientY - start.y;
            if (!start.captured && Math.abs(dy) > Math.max(8, Math.abs(dx))) {
              drag.current = null;
              return;
            }
            if (!start.captured && Math.abs(dx) > 6) {
              start.captured = true;
              e.currentTarget.setPointerCapture(e.pointerId);
            }
            if (start.captured) onRotate(start.angle + dx * 0.45);
          }}
          onPointerUp={(e) => {
            drag.current = null;
            if (e.currentTarget.hasPointerCapture(e.pointerId))
              e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          onLostPointerCapture={() => {
            drag.current = null;
          }}
        />
        <div className="inspector-part-code" aria-hidden="true">
          {["ELASTOMER / 01", "MACHINED / 02", "EXTRUDED / 03"][active]}
        </div>
        <span className="inspector-drag">
          <MoveHorizontal size={13} /> DRAG TO EXPLORE
        </span>
      </div>
      <div className="inspector-controls">
        <div role="group" aria-label="3D material study">
          {STUDIO_MATERIALS.map((m, i) => (
            <button
              type="button"
              key={m.slug}
              aria-pressed={active === i}
              onClick={() => onSelect(i)}
            >
              {m.name}
            </button>
          ))}
        </div>
        <div className="inspector-rotation">
          <button
            type="button"
            aria-label="Rotate component left"
            onClick={() => onRotate(rotation - 30)}
          >
            <ArrowLeft size={15} />
          </button>
          <Rotate3D size={15} />
          <button
            type="button"
            aria-label="Rotate component right"
            onClick={() => onRotate(rotation + 30)}
          >
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
      <p className="inspector-provenance">
        ILLUSTRATIVE CONCEPT MODEL · REPLACEABLE WITH APPROVED S SQUARE CAD
        {state === "unavailable" && (
          <span>Static view — WebGL unavailable.</span>
        )}
      </p>
    </div>
  );
}

function InspectorGear({ className }: { className: string }) {
  const points = Array.from({ length: 80 }, (_, i) => {
    const angle = (i / 80) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 4 < 2 ? 46 : 39;
    return `${50 + Math.cos(angle) * radius},${50 + Math.sin(angle) * radius}`;
  }).join(" ");
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <polygon
        points={points}
        fill="#9ab1bc"
        fillOpacity=".13"
        stroke="#b2c6ce"
      />
      <circle cx="50" cy="50" r="22" fill="#17272e" stroke="#b2c6ce" />
      <circle cx="50" cy="50" r="27" stroke="#b2c6ce" strokeOpacity=".4" />
    </svg>
  );
}
