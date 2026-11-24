import React from "react";
import { cn } from "@/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, required, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          {label} {required && <span className="text-forge-600">*</span>}
        </label>
      )}
      <input
        required={required}
        className={cn(
          "w-full rounded-xs border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-carbon-900 placeholder:text-slate-400 focus:border-forge-600 focus:outline-none focus:ring-2 focus:ring-forge-600/15 transition",
          className,
        )}
        {...props}
      />
    </div>
  );
}
