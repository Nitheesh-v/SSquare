import React from "react";
import { cn } from "@/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "dark" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: "bg-[#b74315] text-white hover:bg-[#99350e] shadow-xs",
    dark: "bg-carbon-900 text-white hover:bg-carbon-800",
    outline:
      "border border-slate-300 bg-white text-carbon-900 hover:border-forge-600 hover:text-forge-600",
    ghost: "text-slate-600 hover:text-carbon-900 hover:bg-slate-100",
  }[variant];

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-3 text-xs",
    lg: "px-6 py-3.5 text-sm",
  }[size];

  return (
    <button
      className={cn(
        "inline-flex min-h-[46px] items-center justify-center gap-3 rounded text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer",
        variantClasses,
        sizeClasses,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
