"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotion } from "@/components/shared/MotionPrimitives";
import { MaterialFragment } from "@/features/journey/ComponentIllustration";
import {
  createHomeMotion,
  type HomeMotionController,
  type HomeMotionState,
} from "./home-motion";

/** Decorative enhancement only: the existing page is complete without this layer. */
export function HomeMotion({
  root,
  active,
  paused,
  rotation,
  onSelect,
  onState,
}: {
  root: RefObject<HTMLDivElement | null>;
  active: number;
  paused: boolean;
  rotation: number;
  onSelect: (index: number) => void;
  onState: (state: HomeMotionState) => void;
}) {
  const reduced = useReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<HomeMotionController | null>(null);
  const entered = useRef(false);
  const current = useRef({ active, paused, rotation, onSelect, onState });
  current.current = { active, paused, rotation, onSelect, onState };

  useEffect(() => {
    const node = root.current;
    if (reduced || !node || !canvas.current) {
      current.current.onState("static");
      return;
    }
    const motion = createHomeMotion(node, canvas.current, {
      ...current.current,
      entrance: !entered.current,
      onSelect: (index) => current.current.onSelect(index),
      onState: (state) => current.current.onState(state),
    });
    controller.current = motion;
    entered.current = true;
    return () => {
      controller.current = null;
      motion.dispose();
    };
  }, [reduced, root]);

  useEffect(() => controller.current?.select(active), [active]);
  useEffect(() => controller.current?.setPaused(paused), [paused]);
  useEffect(() => controller.current?.rotate(rotation), [rotation]);

  return (
    <>
      {!reduced && (
        <canvas
          ref={canvas}
          className="home-motion-canvas"
          data-testid="inspector-canvas"
          aria-hidden="true"
        />
      )}
      <div className="home-motion-particles" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i}>
            <MaterialFragment type={i % 3} />
          </span>
        ))}
      </div>
    </>
  );
}

/** Same heading and reading order; individual letters can enter on a stagger. */
export function MotionLetters({ text }: { text: string }) {
  return Array.from(text).map((letter, i) => (
    <span className="home-motion-letter" key={i}>
      {letter}
    </span>
  ));
}
