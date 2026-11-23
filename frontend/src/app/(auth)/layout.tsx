import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-blueprint-light">
      <header className="border-b border-slate-200 bg-white px-4 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/">
          <Logo theme="light" />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-carbon-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Storefront
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md rounded-sm border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          {children}
        </div>
      </main>
    </div>
  );
}
