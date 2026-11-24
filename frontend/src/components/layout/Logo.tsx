import React from "react";

interface LogoProps {
  theme?: "light" | "dark";
  className?: string;
}

export function Logo({ theme = "light", className = "" }: LogoProps) {
  const isDark = theme === "dark";

  if (isDark) {
    return (
      <div
        className={`inline-flex items-center rounded-md bg-white px-3.5 py-2 shadow-xs select-none ${className}`}
      >
        <img
          src="/images/ssquare-logo.png"
          alt="S Square Engineering Services"
          width={215}
          height={75}
          decoding="async"
          className="h-10 sm:h-11 w-auto object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/images/ssquare-logo.png"
        alt="S Square Engineering Services"
        width={215}
        height={75}
        decoding="async"
        className="h-11 sm:h-12 w-auto object-contain"
      />
    </div>
  );
}
