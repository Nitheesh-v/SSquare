"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { useQuoteModal } from "./QuoteModalContext";
import { QuotePrefill } from "./QuoteForm";

interface OpenQuoteButtonProps {
  label?: string;
  prefill?: QuotePrefill;
  variant?: "primary" | "dark" | "outline";
  className?: string;
}

export function OpenQuoteButton({
  label = "Request Custom Quote",
  prefill,
  variant = "primary",
  className = "",
}: OpenQuoteButtonProps) {
  const { openQuoteModal } = useQuoteModal();

  const styles = {
    primary:
      "bg-forge-600 text-white hover:bg-forge-700 shadow-xs",
    dark:
      "bg-carbon-900 text-white hover:bg-carbon-800",
    outline:
      "border border-slate-300 bg-white text-carbon-900 hover:border-forge-600 hover:text-forge-600",
  }[variant];

  return (
    <button
      type="button"
      onClick={() => openQuoteModal(prefill)}
      className={`inline-flex items-center justify-center gap-2 rounded-xs px-5 py-3 text-sm font-semibold transition cursor-pointer ${styles} ${className}`}
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}
