import React from "react";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="max-w-2xl">
      <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-600">
        {eyebrow}
      </span>
      <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-carbon-900">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
