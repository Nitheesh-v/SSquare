"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  ChevronDown,
  Menu,
  MessageSquare,
  Phone,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { COMPANY_INFO } from "@/lib/company-data";
import { useQuoteModal } from "@/hooks";
import { ReferenceHeader } from "@/features/reference/ReferenceHeader";

const PRODUCT_LINKS = [
  {
    href: "/products/rubber",
    code: "01",
    title: "Rubber",
    subtitle: "Molded parts, gaskets & bonded seals",
  },
  {
    href: "/products/steel",
    code: "02",
    title: "Steel",
    subtitle: "Custom steel & stainless components",
  },
  {
    href: "/products/aluminium",
    code: "03",
    title: "Aluminium",
    subtitle: "6061 parts, profiles & die molds",
  },
];
const LINKS = [
  { href: "/about", label: "Company" },
  { href: "/infrastructure", label: "Infrastructure" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { openQuoteModal } = useQuoteModal();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const productMenu = useRef<HTMLDivElement>(null);
  const productToggle = useRef<HTMLButtonElement>(null);
  const mobileToggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setProductsOpen(false);
  }, [pathname]);
  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (!productMenu.current?.contains(event.target as Node))
        setProductsOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (productsOpen) {
        setProductsOpen(false);
        productToggle.current?.focus();
      }
      if (mobileOpen) {
        setMobileOpen(false);
        mobileToggle.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [productsOpen, mobileOpen]);

  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const navClass = (href: string) =>
    `nav-link ${active(href) ? "nav-link-active" : ""}`;

  if (pathname === "/") return <ReferenceHeader />;

  return (
    <header className="site-header sticky top-0 z-40 w-full border-b border-slate-200 bg-white">
      <div className="bg-carbon-950 text-slate-300">
        <div className="shell flex min-h-9 items-center justify-between gap-4 py-2 text-[10px] sm:text-[11px]">
          <span className="font-mono tracking-wide">
            <span className="hidden sm:inline">
              CUSTOM MANUFACTURING{" "}
              <span className="mx-2 text-slate-600">/</span>{" "}
            </span>
            COIMBATORE, INDIA
          </span>
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              className="hidden items-center gap-1.5 hover:text-white sm:inline-flex"
              href={`tel:${COMPANY_INFO.phoneRaw}`}
            >
              <Phone size={12} className="text-forge-400" />
              {COMPANY_INFO.phone}
            </a>
            <a
              className="inline-flex items-center gap-1.5 text-white hover:text-forge-300"
              href={COMPANY_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageSquare size={12} className="text-forge-400" />
              WhatsApp
              <ArrowUpRight size={11} />
            </a>
          </div>
        </div>
      </div>
      <div className="shell flex h-[76px] items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="S Square Engineering Services — Home"
          className="shrink-0"
        >
          <Logo />
        </Link>
        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Primary navigation"
        >
          <Link
            href="/"
            className={navClass("/")}
            aria-current={active("/") ? "page" : undefined}
          >
            Home
          </Link>
          <div
            className="relative"
            ref={productMenu}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node))
                setProductsOpen(false);
            }}
          >
            <button
              ref={productToggle}
              className={navClass("/products")}
              type="button"
              aria-expanded={productsOpen}
              aria-controls="products-disclosure"
              onClick={() => setProductsOpen(!productsOpen)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setProductsOpen(true);
                  requestAnimationFrame(() =>
                    productMenu.current
                      ?.querySelector<HTMLAnchorElement>("a")
                      ?.focus(),
                  );
                }
              }}
            >
              Products
              <ChevronDown
                size={14}
                className={`transition-transform ${productsOpen ? "rotate-180" : ""}`}
              />
            </button>
            {productsOpen && (
              <div
                id="products-disclosure"
                className="absolute left-0 top-full w-[340px] border border-slate-200 bg-white p-3 shadow-xl"
              >
                <Link
                  href="/products"
                  onClick={() => setProductsOpen(false)}
                  className="flex items-center justify-between border-b border-slate-200 px-3 py-3 text-xs font-semibold"
                >
                  All components
                  <ArrowUpRight size={15} />
                </Link>
                {PRODUCT_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setProductsOpen(false)}
                    className="group flex items-start gap-4 p-3 hover:bg-slate-50"
                  >
                    <span className="pt-0.5 font-mono text-xs text-forge-700">
                      {link.code}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-carbon-900 group-hover:text-forge-700">
                        {link.title}
                      </span>
                      <span className="mt-1 block text-xs text-slate-600">
                        {link.subtitle}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={navClass(link.href)}
              aria-current={active(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <button
              className="button-primary"
              type="button"
              onClick={() => openQuoteModal()}
            >
              Request a Quote
              <ArrowUpRight size={16} />
            </button>
          </div>
          <button
            ref={mobileToggle}
            type="button"
            className="flex h-11 w-11 items-center justify-center border border-slate-300 text-carbon-900 lg:hidden"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute left-0 right-0 max-h-[calc(100dvh-112px)] overflow-y-auto border-t border-slate-200 bg-white px-5 py-4 shadow-xl lg:hidden"
        >
          <Link
            href="/"
            className="block border-b border-slate-100 py-3 text-sm font-semibold"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/products"
            className="block py-3 text-sm font-semibold"
            onClick={() => setMobileOpen(false)}
          >
            All products
          </Link>
          <div className="mb-2 border-l border-forge-600 pl-4">
            {PRODUCT_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm text-slate-600"
              >
                {link.title}
                <span className="ml-3 font-mono text-[10px] text-slate-500">
                  DIV. {link.code}
                </span>
              </Link>
            ))}
          </div>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block border-t border-slate-100 py-3 text-sm font-semibold"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              className="button-secondary justify-center"
              href={`tel:${COMPANY_INFO.phoneRaw}`}
            >
              <Phone size={15} />
              Call us
            </a>
            <a
              className="button-secondary justify-center"
              href={COMPANY_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageSquare size={15} />
              WhatsApp
            </a>
          </div>
          <button
            className="button-primary mt-3 w-full justify-center"
            onClick={() => {
              setMobileOpen(false);
              openQuoteModal();
            }}
          >
            Request a Quote
            <ArrowUpRight size={16} />
          </button>
        </nav>
      )}
    </header>
  );
}
