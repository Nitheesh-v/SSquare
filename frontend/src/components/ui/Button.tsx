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
    primary: "bg-forge-600 text-white hover:bg-forge-700 shadow-xs",
    dark: "bg-carbon-900 text-white hover:bg-carbon-800",
    outline:
      "border border-slate-300 bg-white text-carbon-900 hover:border-forge-600 hover:text-forge-600",
    ghost: "text-slate-600 hover:text-carbon-900 hover:bg-slate-100",
  }[variant];

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-sm",
  }[size];

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xs font-semibold transition disabled:opacity-60 cursor-pointer",
        variantClasses,
        sizeClasses,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
