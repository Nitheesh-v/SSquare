"use client";

import { useEffect, useRef, useState } from "react";
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
import type { JourneyScene } from "@/features/journey/journey-scene";

/** A contained, demand-rendered material study. Never floats over page content. */
export function ComponentInspector({
  active,
  onSelect,
  paused,
  onPause,
}: {
  active: number;
  onSelect: (index: number) => void;
  paused: boolean;
  onPause: () => void;
}) {
  const host = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const [near, setNear] = useState(false);
  const [state, setState] = useState("static");
  const [rotation, setRotation] = useState(0);
  const draw = useRef<() => void>(() => {});
  const settings = useRef({ active, paused, rotation });
  settings.current = { active, paused, rotation };
  const drag = useRef<{ x: number; angle: number; captured: boolean } | null>(
    null,
  );
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin: "220px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const node = host.current,
      c = canvas.current;
    if (!near || reduced || !node || !c) {
      setState("static");
      return;
    }
    let scene: JourneyScene | undefined,
      disposed = false,
      frame = 0,
      visible = !document.hidden;
    let w = node.clientWidth,
      h = node.clientHeight,
      lastSignature = "";
    const render = () => {
      frame = 0;
      if (disposed || !visible || !scene) return;
      const rect = node.getBoundingClientRect();
      const progress = Math.max(
        0,
        Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)),
      );
      const { active, paused, rotation } = settings.current;
      const angle = rotation + (paused ? 0 : (progress - 0.5) * 160);
      const signature = [w, h, active, angle.toFixed(3)].join("/");
      if (signature === lastSignature) return;
      const completed = scene.render([], {
        slot: 0,
        type: active,
        pose: {
          x: w / 2,
          y: h * 0.48,
          h: Math.min(w * 0.66, h * 0.7),
          rx: 14,
          ry: angle,
          rz: -12,
          z: 0,
          op: 1,
          sx: 1,
          sy: 1,
          shadow: 0.45,
        },
      });
      c.dataset.progress = progress.toFixed(4);
      if (completed === false) frame = requestAnimationFrame(render);
      else lastSignature = signature;
    };
    const schedule = () => {
      if (!frame && !disposed && visible) frame = requestAnimationFrame(render);
    };
    draw.current = schedule;
    const resize = () => {
      w = node.clientWidth;
      h = node.clientHeight;
      scene?.resize(w, h);
      schedule();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    const visibility = () => {
      visible = !document.hidden;
      if (!visible) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else schedule();
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("scroll", schedule, { passive: true });
    import("@/features/journey/journey-scene")
      .then(({ createJourneyScene }) => {
        if (disposed) return;
        try {
          scene = createJourneyScene(
            c,
            () => {
              setState("unavailable");
              scene?.dispose();
              scene = undefined;
              cancelAnimationFrame(frame);
              frame = 0;
            },
            0,
          );
          scene.resize(w, h);
          setState("ready");
          schedule();
        } catch {
          scene?.dispose();
          scene = undefined;
          setState("unavailable");
        }
      })
      .catch(() => {
        if (!disposed) setState("unavailable");
      });
    return () => {
      disposed = true;
      draw.current = () => {};
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      document.removeEventListener("visibilitychange", visibility);
      scene?.dispose();
    };
  }, [near, reduced]);
  useEffect(() => draw.current(), [active, paused, rotation]);
  return (
    <div
      className="component-inspector"
      data-testid="component-inspector"
      data-state={state}
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
        ref={host}
        className="inspector-viewport"
        role="img"
        aria-label={`Illustrative ${STUDIO_MATERIALS[active].name} component; drag horizontally or use the rotation buttons`}
      >
        <div className="inspector-orbit" aria-hidden="true" />
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
        {!reduced && near && (
          <canvas
            ref={canvas}
            data-testid="inspector-canvas"
            aria-hidden="true"
          />
        )}
        <div
          className="inspector-gesture"
          aria-hidden="true"
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            drag.current = { x: e.clientX, angle: rotation, captured: false };
          }}
          onPointerMove={(e) => {
            const start = drag.current;
            if (!start) return;
            if (!start.captured && Math.abs(e.clientX - start.x) > 6) {
              start.captured = true;
              e.currentTarget.setPointerCapture(e.pointerId);
            }
            if (start.captured)
              setRotation(start.angle + (e.clientX - start.x) * 0.45);
          }}
          onPointerUp={(e) => {
            drag.current = null;
            if (e.currentTarget.hasPointerCapture(e.pointerId))
              e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={() => {
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
            onClick={() => setRotation((r) => r - 30)}
          >
            <ArrowLeft size={15} />
          </button>
          <Rotate3D size={15} />
          <button
            type="button"
            aria-label="Rotate component right"
            onClick={() => setRotation((r) => r + 30)}
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
