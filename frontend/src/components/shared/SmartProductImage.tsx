"use client";

import { useEffect, useRef, useState } from "react";
import { OFFICIAL_PHOTO_CACHE } from "@/lib/photo-sources";
import { ParallaxVisual } from "./MotionPrimitives";

interface SmartProductImageProps {
  src?: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  showPlaceholderBadge?: boolean;
  /** Illustrations stay labelled even after their local/remote source loads. */
  illustrative?: boolean;
  /** Only the image planes move; provenance labels remain outside the crop. */
  depth?: boolean;
  motionPaused?: boolean;
  priority?: boolean;
}

export function SmartProductImage(props: SmartProductImageProps) {
  return (
    <ResolvedImage
      key={`${props.src}:${props.fallbackSrc}:${props.illustrative}`}
      {...props}
    />
  );
}

function ResolvedImage({
  src,
  fallbackSrc,
  alt,
  className = "",
  showPlaceholderBadge = true,
  illustrative = false,
  depth = false,
  motionPaused = false,
  priority = false,
}: SmartProductImageProps) {
  const hasSource = Boolean(src);
  const image = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  // An SSR image can finish (or fail) before React attaches event handlers.
  useEffect(() => {
    if (image.current?.complete) {
      if (image.current.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
    }
  }, []);
  const images = (
    <>
      <img
        src={fallbackSrc}
        alt={
          loaded
            ? ""
            : `${alt} — illustrative visual, not a photograph of the supplied part`
        }
        aria-hidden={loaded}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={className}
      />
      {hasSource && !failed && (
        <img
          ref={image}
          src={src ? OFFICIAL_PHOTO_CACHE[src] || src : undefined}
          alt={
            illustrative
              ? `${alt} — illustrative visual, not an actual S Square product photograph`
              : alt
          }
          aria-hidden={!loaded}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            setFailed(true);
          }}
          style={{ opacity: loaded ? 1 : 0 }}
          className={`absolute inset-0 ${className}`}
        />
      )}
    </>
  );
  return (
    <div className="relative h-full w-full overflow-hidden">
      {depth ? (
        <ParallaxVisual depth paused={motionPaused} className="h-full w-full">
          {images}
        </ParallaxVisual>
      ) : (
        images
      )}
      {(!loaded || illustrative) && showPlaceholderBadge && (
        <span
          data-testid="illustrative-visual-label"
          className="pointer-events-none absolute right-2 top-2 max-w-[90%] border border-white/20 bg-carbon-950/90 px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-wide text-white"
        >
          Illustrative Visual · Replaceable
        </span>
      )}
    </div>
  );
}
