"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Menu,
  X,
  ArrowUpRight,
  Layers,
  Shield,
  Cpu,
} from "lucide-react";
import { Logo } from "./Logo";
import { COMPANY_INFO } from "@/lib/company-data";
import { useQuoteModal } from "@/hooks";

const PRODUCT_LINKS = [
  {
    href: "/products/rubber",
    title: "Rubber Products",
    subtitle: "Viton, Silicone, NBR, HNBR, Bonded Seals & Gaskets",
    icon: Layers,
  },
  {
    href: "/products/steel",
    title: "Steel Products",
    subtitle: "SS 304/316 CNC Shafts, Flanges & TIG Fabrications",
    icon: Shield,
  },
  {
    href: "/products/aluminium",
    title: "Aluminium Products",
    subtitle: "Aluminium Die Molds, 6061-T6 CNC & Extruded Profiles",
    icon: Cpu,
  },
];

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.03 2C6.51 2 2.03 6.48 2.03 12c0 1.77.46 3.49 1.34 5.01L2 22l5.13-1.34A9.96 9.96 0 0 0 12.03 22c5.52 0 10-4.48 10-10S17.55 2 12.03 2Zm5.82 14.12c-.24.68-1.41 1.3-1.95 1.38-.5.08-1.13.11-1.83-.11-.42-.14-.97-.32-1.67-.62-2.94-1.27-4.86-4.23-5.01-4.43-.15-.2-1.2-1.59-1.2-3.04 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.24.59.84 2.04.91 2.19.07.15.12.32.02.52-.1.2-.15.32-.3.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.3.76 1.26 1.64 2.04 1.13 1.01 2.08 1.32 2.38 1.47.3.15.47.12.64-.07.17-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.73.81 2.02.96.3.15.49.22.57.35.07.12.07.72-.17 1.4Z" />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { openQuoteModal } = useQuoteModal();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const navLinkClass = (href: string) =>
    `relative px-3.5 py-2 text-[15px] font-medium transition-colors ${
      isActive(href)
        ? "text-carbon-950 font-semibold after:absolute after:left-3.5 after:right-3.5 after:bottom-0.5 after:h-[2px] after:bg-carbon-950"
        : "text-[#a6192e] hover:text-carbon-950"
    }`;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-2xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-22">
        <Link href="/" className="focus:outline-none shrink-0">
          <Logo theme="light" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-2">
          <Link href="/" className={navLinkClass("/")}>
            Home
          </Link>

          <Link href="/about" className={navLinkClass("/about")}>
            About
          </Link>

          {/* Products Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setProductsMenuOpen(true)}
            onMouseLeave={() => setProductsMenuOpen(false)}
          >
            <Link
              href="/products"
              className={`inline-flex items-center gap-1 ${navLinkClass(
                "/products"
              )}`}
            >
              Products
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-150 ${
                  productsMenuOpen ? "rotate-180" : ""
                }`}
              />
            </Link>

            {productsMenuOpen && (
              <div className="absolute left-0 top-full pt-2 w-92">
                <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-xl">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Manufacturing Divisions
                    </span>
                    <Link
                      href="/products"
                      onClick={() => setProductsMenuOpen(false)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-forge-600 hover:text-forge-700"
                    >
                      All Products
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="mt-1.5 space-y-1">
                    {PRODUCT_LINKS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setProductsMenuOpen(false)}
                          className="group flex items-start gap-3 rounded-md p-3 hover:bg-slate-50 transition-colors"
                        >
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-carbon-900 group-hover:border-forge-500 group-hover:bg-forge-50 group-hover:text-forge-600 transition-colors">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-carbon-950 group-hover:text-forge-600 transition-colors">
                              {item.title}
                            </span>
                            <p className="mt-0.5 text-xs text-slate-500 leading-snug">
                              {item.subtitle}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/infrastructure"
            className={navLinkClass("/infrastructure")}
          >
            Infrastructure
          </Link>

          <Link href="/faq" className={navLinkClass("/faq")}>
            FAQ
          </Link>

          <Link href="/contact" className={navLinkClass("/contact")}>
            Contact
          </Link>
        </nav>

        {/* Right Actions: Signature Green WhatsApp Contact Us + Request Quote */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            type="button"
            onClick={() => openQuoteModal()}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-carbon-950 hover:border-forge-600 hover:text-forge-600 transition-colors cursor-pointer"
          >
            Request Quote
          </button>

          <a
            href={COMPANY_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-[#1e8e0e] px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#17730a] transition-colors"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Contact Us
          </a>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
            className="rounded-md border border-slate-200 p-2 text-carbon-950 hover:bg-slate-100"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-carbon-950 rounded-md hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-carbon-950 rounded-md hover:bg-slate-50"
            >
              About
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-carbon-950 rounded-md hover:bg-slate-50"
            >
              Products
            </Link>
            <div className="pl-4 border-l-2 border-forge-500/40 ml-3 space-y-1">
              {PRODUCT_LINKS.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-forge-600"
                >
                  {p.title}
                </Link>
              ))}
            </div>
            <Link
              href="/infrastructure"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-carbon-950 rounded-md hover:bg-slate-50"
            >
              Infrastructure
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-carbon-950 rounded-md hover:bg-slate-50"
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-carbon-950 rounded-md hover:bg-slate-50"
            >
              Contact
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
            <a
              href={COMPANY_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full rounded-md bg-[#1e8e0e] py-2.5 text-sm font-semibold text-white hover:bg-[#17730a]"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Contact Us on WhatsApp
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                openQuoteModal();
              }}
              className="w-full rounded-md bg-forge-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-forge-700"
            >
              Request Custom Quote
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
