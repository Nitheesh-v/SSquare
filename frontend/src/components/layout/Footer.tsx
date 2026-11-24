"use client";

import React from "react";
import Link from "next/link";
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

            {/* Social Links (Facebook, Twitter, YouTube) */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://ssquareengg.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-[#e11d48] text-white hover:bg-[#be123c] transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.87.24-1.46 1.49-1.46H16.5V4.46c-.27-.04-1.2-.11-2.28-.11-2.26 0-3.81 1.38-3.81 3.91v2.24H8v3h2.41V21h3.09Z" />
                </svg>
              </a>

              <a
                href="https://ssquareengg.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-[#e11d48] text-white hover:bg-[#be123c] transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M21.54 7.11c.01.18.01.36.01.54 0 5.49-4.18 11.82-11.82 11.82-2.35 0-4.53-.69-6.37-1.87.33.04.65.05.99.05 1.95 0 3.74-.66 5.16-1.78a4.16 4.16 0 0 1-3.88-2.88c.26.04.51.07.78.07.37 0 .74-.05 1.09-.14A4.15 4.15 0 0 1 4.17 8.85v-.05c.55.31 1.19.5 1.87.52a4.15 4.15 0 0 1-1.85-3.46c0-.77.21-1.48.57-2.09a11.8 11.8 0 0 0 8.56 4.34 4.68 4.68 0 0 1-.1-.95 4.15 4.15 0 0 1 7.18-2.84 8.2 8.2 0 0 0 2.64-1.01 4.14 4.14 0 0 1-1.82 2.29 8.32 8.32 0 0 0 2.39-.65 8.93 8.93 0 0 1-2.07 2.16Z" />
                </svg>
              </a>

              <a
                href="https://ssquareengg.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-[#e11d48] text-white hover:bg-[#be123c] transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M21.58 7.19a2.51 2.51 0 0 0-1.77-1.78C18.25 5 12 5 12 5s-6.25 0-7.81.41a2.51 2.51 0 0 0-1.77 1.78C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.9 1.54 1.77 1.78C5.75 19 12 19 12 19s6.25 0 7.81-.41a2.51 2.51 0 0 0 1.77-1.78C22 15.25 22 12 22 12s0-3.25-.42-4.81ZM10 15V9l5.2 3L10 15Z" />
                </svg>
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
