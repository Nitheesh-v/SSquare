"use client";

import { useEffect, useRef, useState } from "react";
import { OFFICIAL_PHOTO_CACHE } from "@/lib/photo-sources";

interface SmartProductImageProps {
  src?: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  showPlaceholderBadge?: boolean;
  priority?: boolean;
}

export function SmartProductImage(props: SmartProductImageProps) {
  return <ResolvedImage key={`${props.src}:${props.fallbackSrc}`} {...props} />;
}

function ResolvedImage({
  src,
  fallbackSrc,
  alt,
  className = "",
  showPlaceholderBadge = true,
  priority = false,
}: SmartProductImageProps) {
  const remote = Boolean(src?.startsWith("http"));
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
  return (
    <div className="relative h-full w-full overflow-hidden">
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
      {remote && !failed && (
        <img
          ref={image}
          src={src ? OFFICIAL_PHOTO_CACHE[src] || src : undefined}
          alt={alt}
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
      {!loaded && showPlaceholderBadge && (
        <span className="pointer-events-none absolute right-2 top-2 max-w-[90%] border border-white/20 bg-carbon-950/90 px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-wide text-white">
          Illustrative Visual · Replaceable
        </span>
      )}
    </div>
  );
}
