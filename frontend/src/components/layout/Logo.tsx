import React from "react";

interface LogoProps {
  theme?: "light" | "dark";
  className?: string;
}

export function Logo({ theme = "light", className = "" }: LogoProps) {
  const isDark = theme === "dark";

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={isDark ? "/images/ssquare-logo-dark.png" : "/images/ssquare-logo.png"}
        alt="S Square Engineering Services"
        width={215}
        height={75}
        decoding="async"
        className="h-12 sm:h-14 w-auto object-contain"
      />
    </div>
  );
}
