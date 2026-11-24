import React from "react";
import { cn } from "@/utils";

interface BadgeProps {
  children: React.ReactNode;
  tone?: "default" | "forge" | "emerald" | "amber" | "slate";
  className?: string;
}

export function Badge({ children, tone = "default", className }: BadgeProps) {
  const toneClasses = {
    default: "bg-carbon-900 text-white",
    forge: "bg-forge-50 text-forge-700 border border-forge-200",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border border-amber-200",
    slate: "bg-slate-100 text-slate-700 border border-slate-200",
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider",
        toneClasses,
        className,
      )}
    >
      {children}
    </span>
  );
}
