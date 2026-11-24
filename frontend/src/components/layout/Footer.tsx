"use client";

import React from "react";
import Link from "next/link";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { COMPANY_INFO } from "@/lib/company-data";

export function Footer() {
  return (
    <footer className="bg-[#0d1324] text-slate-200 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Column 1: Brand Logo, Tagline & Social Icons */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="inline-block focus:outline-none">
              <Logo theme="dark" />
            </Link>

            <p className="text-[15px] text-slate-200 leading-relaxed max-w-md">
              Specializing in custom rubber, steel, and aluminium manufacturing
              with a commitment to precision, durability, and timely delivery.
            </p>

            {/* Verified contact actions; no invented social profiles. */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp S Square"
                className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e11d48] text-white hover:bg-[#be123c] transition-colors"
              >
                <MessageSquare size={17} />
              </a>
              <a
                href={`mailto:${COMPANY_INFO.emails.sales}`}
                aria-label="Email S Square sales"
                className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e11d48] text-white hover:bg-[#be123c] transition-colors"
              >
                <Mail size={17} />
              </a>
              <a
                href={`tel:${COMPANY_INFO.phoneRaw}`}
                aria-label="Call S Square"
                className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e11d48] text-white hover:bg-[#be123c] transition-colors"
              >
                <Phone size={17} />
              </a>
            </div>
          </div>

          {/* Column 2: QUICK LINKS */}
          <div className="md:col-span-3">
            <h4 className="font-display text-lg font-semibold uppercase tracking-wide text-white mb-5">
              QUICK LINKS
            </h4>
            <ul className="space-y-3 text-[15px] text-slate-200">
              <li>
                <Link
                  href="/"
                  className="hover:text-forge-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-forge-400 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/products/aluminium"
                  className="hover:text-forge-400 transition-colors"
                >
                  Aluminium
                </Link>
              </li>
              <li>
                <Link
                  href="/products/rubber"
                  className="hover:text-forge-400 transition-colors"
                >
                  Rubber
                </Link>
              </li>
              <li>
                <Link
                  href="/products/steel"
                  className="hover:text-forge-400 transition-colors"
                >
                  Steel
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-forge-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: CONTACT INFO */}
          <div className="md:col-span-4">
            <h4 className="font-display text-lg font-semibold uppercase tracking-wide text-white mb-5">
              CONTACT INFO
            </h4>
            <div className="space-y-2.5 text-[15px] text-slate-200 leading-relaxed">
              <p>S Square Engineering services</p>
              <p>58, Jeganathapuram,</p>
              <p>Avarampalayam road,</p>
              <p>Peelamedu, Coimbatore 641004</p>
              <p>
                <a
                  href={`mailto:${COMPANY_INFO.emails.sales}`}
                  className="hover:text-forge-400 transition-colors"
                >
                  {COMPANY_INFO.emails.sales}
                </a>
              </p>
              <p>
                <a
                  href={`tel:${COMPANY_INFO.phoneRaw}`}
                  className="hover:text-forge-400 transition-colors"
                >
                  {COMPANY_INFO.phone}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} {COMPANY_INFO.name}. All rights
            reserved.
          </p>
          <p className="text-[11px] font-medium tracking-wider uppercase">
            Rubber · Steel · Aluminium · Coimbatore, India
          </p>
        </div>
      </div>
    </footer>
  );
}
