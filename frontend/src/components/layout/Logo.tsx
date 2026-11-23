import React from "react";

interface LogoProps {
  theme?: "light" | "dark";
  className?: string;
}

export function Logo({ theme = "light", className = "" }: LogoProps) {
  const isDark = theme === "dark";

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-carbon-900 border border-carbon-700 shadow-xs overflow-hidden">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          aria-hidden="true"
        >
          <rect
            x="4"
            y="4"
            width="24"
            height="24"
            rx="1.5"
            stroke="#EA580C"
            strokeWidth="2.4"
          />
          <rect
            x="12"
            y="12"
            width="24"
            height="24"
            rx="1.5"
            stroke="#F8FAFC"
            strokeWidth="2.2"
          />
          <rect x="17" y="17" width="6" height="6" fill="#EA580C" />
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-1">
          <span
            className={`font-display text-lg font-bold tracking-tight ${
              isDark ? "text-white" : "text-carbon-900"
            }`}
          >
            S SQUARE
          </span>
          <span className="font-mono text-[11px] font-bold text-forge-600">
            ²
          </span>
        </div>
        <span
          className={`font-mono text-[10px] font-medium uppercase tracking-[0.18em] mt-1 ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          Engineering Services
        </span>
      </div>
    </div>
  );
}
