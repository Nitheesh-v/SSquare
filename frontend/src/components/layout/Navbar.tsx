"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Phone,
  Mail,
  Truck,
  ChevronDown,
  Menu,
  X,
  ArrowUpRight,
  Layers,
  Shield,
  Cpu,
  ShoppingBag,
  User as UserIcon,
  LayoutDashboard,
} from "lucide-react";
import { Logo } from "./Logo";
import { COMPANY_INFO } from "@/lib/company-data";
import { useAuth, useCart, useQuoteModal } from "@/hooks";

const PRODUCT_LINKS = [
  {
    href: "/products/rubber",
    code: "DIV-01",
    title: "Rubber Products",
    subtitle: "Viton, Silicone, NBR, HNBR, Bonded Seals & Gaskets",
    icon: Layers,
  },
  {
    href: "/products/steel",
    code: "DIV-02",
    title: "Steel Products",
    subtitle: "SS 304/316 CNC Shafts, Flanges & TIG Fabrications",
    icon: Shield,
  },
  {
    href: "/products/aluminium",
    code: "DIV-03",
    title: "Aluminium Products",
    subtitle: "Aluminium Die Molds, 6061-T6 CNC & Extruded Profiles",
    icon: Cpu,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { totalItems, openCart } = useCart();
  const { openQuoteModal } = useQuoteModal();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Industrial Utility Strip */}
      <div className="bg-carbon-900 text-slate-300 border-b border-carbon-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-2 text-xs">
          <div className="flex items-center gap-2 font-medium">
            <Truck className="h-3.5 w-3.5 text-forge-500 shrink-0" />
            <span className="truncate">
              <strong className="text-white">Free Global Door Delivery:</strong>{" "}
              3–4 Days Worldwide via DHL &amp; FedEx
            </span>
          </div>

          <div className="hidden md:flex items-center gap-5 font-mono text-[11px]">
            <a
              href={`mailto:${COMPANY_INFO.emails.sales}`}
              className="inline-flex items-center gap-1.5 hover:text-white transition"
            >
              <Mail className="h-3.5 w-3.5 text-forge-500" />
              {COMPANY_INFO.emails.sales}
            </a>
            <span className="text-carbon-700">|</span>
            <a
              href={`tel:${COMPANY_INFO.phoneRaw}`}
              className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-forge-400 transition"
            >
              <Phone className="h-3.5 w-3.5 text-forge-500" />
              {COMPANY_INFO.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-18">
        <Link href="/" className="focus:outline-none">
          <Logo theme="light" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center gap-0.5">
          <Link
            href="/"
            className={`px-3 py-2 text-sm font-medium rounded-xs transition ${
              isActive("/")
                ? "text-forge-600 font-semibold"
                : "text-slate-700 hover:text-carbon-900 hover:bg-slate-100/70"
            }`}
          >
            Home
          </Link>

          <Link
            href="/categories"
            className={`px-3 py-2 text-sm font-medium rounded-xs transition ${
              isActive("/categories")
                ? "text-forge-600 font-semibold"
                : "text-slate-700 hover:text-carbon-900 hover:bg-slate-100/70"
            }`}
          >
            Categories
          </Link>

          {/* Products Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setProductsMenuOpen(true)}
            onMouseLeave={() => setProductsMenuOpen(false)}
          >
            <Link
              href="/products"
              className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xs transition ${
                isActive("/products")
                  ? "text-forge-600 font-semibold"
                  : "text-slate-700 hover:text-carbon-900 hover:bg-slate-100/70"
              }`}
            >
              Products
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-150 ${
                  productsMenuOpen ? "rotate-180 text-forge-600" : ""
                }`}
              />
            </Link>

            {productsMenuOpen && (
              <div className="absolute left-0 top-full pt-2 w-96">
                <div className="rounded-sm border border-slate-200 bg-white p-2 shadow-xl">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
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

                  <div className="mt-1 space-y-1">
                    {PRODUCT_LINKS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setProductsMenuOpen(false)}
                          className="group flex items-start gap-3 rounded-xs p-3 hover:bg-slate-50 transition"
                        >
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xs border border-slate-200 bg-slate-50 text-carbon-800 group-hover:border-forge-500 group-hover:bg-forge-50 group-hover:text-forge-600 transition">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display text-sm font-bold text-carbon-900 group-hover:text-forge-600 transition">
                                {item.title}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">
                                {item.code}
                              </span>
                            </div>
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
            href="/about"
            className={`px-3 py-2 text-sm font-medium rounded-xs transition ${
              isActive("/about")
                ? "text-forge-600 font-semibold"
                : "text-slate-700 hover:text-carbon-900 hover:bg-slate-100/70"
            }`}
          >
            About
          </Link>

          <Link
            href="/infrastructure"
            className={`px-3 py-2 text-sm font-medium rounded-xs transition ${
              isActive("/infrastructure")
                ? "text-forge-600 font-semibold"
                : "text-slate-700 hover:text-carbon-900 hover:bg-slate-100/70"
            }`}
          >
            Infrastructure
          </Link>

          <Link
            href="/faq"
            className={`px-3 py-2 text-sm font-medium rounded-xs transition ${
              isActive("/faq")
                ? "text-forge-600 font-semibold"
                : "text-slate-700 hover:text-carbon-900 hover:bg-slate-100/70"
            }`}
          >
            FAQ
          </Link>

          <Link
            href="/contact"
            className={`px-3 py-2 text-sm font-medium rounded-xs transition ${
              isActive("/contact")
                ? "text-forge-600 font-semibold"
                : "text-slate-700 hover:text-carbon-900 hover:bg-slate-100/70"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Right Actions: Cart + Account/Auth + Quote */}
        <div className="hidden xl:flex items-center gap-2.5">
          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-xs border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-carbon-900 hover:border-forge-500 transition"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-forge-600" />
              Admin
            </Link>
          )}

          <Link
            href={isAuthenticated ? "/account" : "/login"}
            className="inline-flex items-center gap-1.5 rounded-xs border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:text-carbon-900 transition"
          >
            <UserIcon className="h-3.5 w-3.5 text-slate-500" />
            {isAuthenticated ? user?.name?.split(" ")[0] || "Account" : "Sign In"}
          </Link>

          <button
            type="button"
            onClick={openCart}
            aria-label="Open order cart"
            className="relative inline-flex items-center gap-1.5 rounded-xs border border-slate-200 px-3 py-2 text-xs font-semibold text-carbon-900 hover:border-forge-500 transition cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4 text-forge-600" />
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-forge-600 px-1 font-mono text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => openQuoteModal()}
            className="inline-flex items-center gap-1.5 rounded-xs bg-forge-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-forge-700 transition cursor-pointer"
          >
            Request Quote
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Mobile Actions */}
        <div className="flex xl:hidden items-center gap-2">
          <button
            type="button"
            onClick={openCart}
            aria-label="Open cart"
            className="relative rounded-xs border border-slate-200 p-2 text-carbon-900"
          >
            <ShoppingBag className="h-5 w-5 text-forge-600" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-forge-600 px-1 font-mono text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
            className="rounded-xs border border-slate-200 p-2 text-carbon-900 hover:bg-slate-100"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-carbon-900 rounded-xs hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              href="/categories"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-carbon-900 rounded-xs hover:bg-slate-50"
            >
              Manufacturing Categories
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-carbon-900 rounded-xs hover:bg-slate-50"
            >
              All Products Catalog
            </Link>
            <div className="pl-4 border-l-2 border-forge-500/40 ml-3 space-y-1">
              {PRODUCT_LINKS.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-forge-600"
                >
                  {p.code} · {p.title}
                </Link>
              ))}
            </div>
            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-carbon-900 rounded-xs hover:bg-slate-50"
            >
              About Us
            </Link>
            <Link
              href="/infrastructure"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-carbon-900 rounded-xs hover:bg-slate-50"
            >
              Infrastructure
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-carbon-900 rounded-xs hover:bg-slate-50"
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-carbon-900 rounded-xs hover:bg-slate-50"
            >
              Contact
            </Link>
            <Link
              href={isAuthenticated ? "/account" : "/login"}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-forge-600 rounded-xs hover:bg-slate-50"
            >
              {isAuthenticated ? "My Account & Orders" : "OEM Buyer Sign In / Register"}
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-carbon-900 rounded-xs hover:bg-slate-50"
              >
                Admin Console
              </Link>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                openQuoteModal();
              }}
              className="w-full rounded-xs bg-forge-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-forge-700"
            >
              Request Custom Quote
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
