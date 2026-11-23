"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { useQuoteModal } from "@/hooks";
import { QuotePrefill } from "@/types";
import { Button } from "@/components/ui/Button";

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

  return (
    <Button
      type="button"
      variant={variant}
      onClick={() => openQuoteModal(prefill)}
      className={className}
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}
