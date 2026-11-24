"use client";

import React, { useState } from "react";

interface SmartProductImageProps {
  src?: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
}

export function SmartProductImage({
  src,
  fallbackSrc,
  alt,
  className = "",
}: SmartProductImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [usedFallback, setUsedFallback] = useState<boolean>(!src);

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (!usedFallback) {
          setUsedFallback(true);
          setImgSrc(fallbackSrc);
        }
      }}
      className={className}
    />
  );
}
