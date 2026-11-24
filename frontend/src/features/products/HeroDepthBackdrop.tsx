"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { heroScrollProgress } from "./hero-depth";

const IndustrialScene = dynamic(() => import("./IndustrialBackdropScene"), {
  ssr: false,
  loading: () => null,
});

/** Real 3D behind the content; static artwork never waits for WebGL or JavaScript. */
export function HeroDepthBackdrop({
  root,
  animated,
}: {
  root: RefObject<HTMLElement | null>;
  animated: boolean;
}) {
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const onReady = useCallback(() => setReady(true), []);
  const onUnavailable = useCallback(() => {
    setReady(false);
    setFailed(true);
  }, []);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    let frame = 0;
    let visible = true;
    const update = () => {
      frame = 0;
      if (!animated || !visible) return;
      const p = heroScrollProgress(node);
      node.style.setProperty("--hero-progress", p.toFixed(4));
    };
    const schedule = () => {
      if (!frame && visible && !document.hidden)
        frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        schedule();
      },
      { rootMargin: "120px" },
    );
    observer.observe(node);
    if (animated) {
      schedule();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      document.addEventListener("visibilitychange", schedule);
    } else node.style.setProperty("--hero-progress", "0");
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      node.style.removeProperty("--hero-progress");
    };
  }, [root, animated]);

  useEffect(() => {
    const node = container.current;
    if (!node || !animated) {
      setReady(false);
      setNear(false);
      return;
    }
    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cancel = () => {
      if (idle !== undefined) window.cancelIdleCallback?.(idle);
      if (timer !== undefined) clearTimeout(timer);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        cancel();
        if (!entry.isIntersecting) {
          setNear(false);
          setReady(false);
          return;
        }
        const load = () => setNear(true);
        if ("requestIdleCallback" in window)
          idle = window.requestIdleCallback(load, { timeout: 700 });
        else timer = setTimeout(load, 200);
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => {
      cancel();
      observer.disconnect();
    };
  }, [animated]);

  return (
    <div
      ref={container}
      className="hero-depth-backdrop"
      data-testid="hero-depth-backdrop"
      data-renderer={animated && ready && near ? "webgl" : "fallback"}
      data-motion={animated ? "scroll" : "still"}
      data-webgl={failed ? "unavailable" : "available"}
      aria-hidden="true"
    >
      <img
        src="/images/industrial-gear-study.svg"
        alt=""
        width={1600}
        height={1000}
        fetchPriority="high"
        className="hero-gear-fallback"
      />
      {animated && near && !failed && (
        <IndustrialScene
          root={root}
          onReady={onReady}
          onUnavailable={onUnavailable}
        />
      )}
      <div className="hero-depth-light" />
      <div className="hero-depth-shade" />
      <div className="hero-depth-grid" />
    </div>
  );
}
