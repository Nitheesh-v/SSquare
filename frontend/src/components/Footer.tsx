"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Truck, ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";
import { COMPANY_INFO } from "@/data/company";
import { useQuoteModal } from "./QuoteModalContext";

export function Footer() {
  const { openQuoteModal } = useQuoteModal();

  return (
    <footer className="bg-carbon-950 text-slate-300 border-t border-carbon-800 bg-blueprint-dark">
      {/* Top Express RFQ Banner Strip */}
      <div className="border-b border-carbon-800 bg-carbon-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-forge-500">
              Direct OEM &amp; Custom Manufacturing Partner
            </span>
            <h3 className="mt-1 font-display text-2xl font-bold text-white">
              Have a Technical Drawing or Sample Part Ready?
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Get factory-direct pricing with 100% dimensional conformity and free 3–4 day global DHL / FedEx delivery.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => openQuoteModal()}
              className="inline-flex items-center gap-2 rounded-xs bg-forge-600 px-5 py-3 text-sm font-semibold text-white hover:bg-forge-700 transition cursor-pointer"
            >
              Start Custom RFQ
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <a
              href={`tel:${COMPANY_INFO.phoneRaw}`}
              className="inline-flex items-center gap-2 rounded-xs border border-carbon-700 bg-carbon-800 px-5 py-3 font-mono text-sm font-semibold text-white hover:border-forge-500 transition"
            >
              <Phone className="h-4 w-4 text-forge-500" />
              {COMPANY_INFO.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-4 space-y-4">
            <Logo theme="dark" />
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Custom manufacturer and global exporter specializing in precision{" "}
              <strong className="text-slate-200">Rubber, Steel, and Aluminium</strong>{" "}
              components for industrial, commercial, automotive, and OEM applications.
            </p>
            <div className="inline-flex items-center gap-2 rounded-xs border border-carbon-800 bg-carbon-900 px-3.5 py-2 text-xs text-slate-300">
              <Truck className="h-4 w-4 text-forge-500 shrink-0" />
              <span>DHL / FedEx Global Door Delivery in 3–4 Days</span>
            </div>
          </div>

          {/* Col 2: Product Divisions */}
          <div className="lg:col-span-3">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-widest text-white mb-4">
              Product Divisions
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/products/rubber"
                  className="text-slate-400 hover:text-forge-400 transition"
                >
                  Custom Molded Rubber Parts
                </Link>
              </li>
              <li>
                <Link
                  href="/products/rubber"
                  className="text-slate-400 hover:text-forge-400 transition"
                >
                  Metal-to-Rubber Bonded Seals
                </Link>
              </li>
              <li>
                <Link
                  href="/products/rubber"
                  className="text-slate-400 hover:text-forge-400 transition"
                >
                  Viton, Silicone &amp; NBR Gaskets
                </Link>
              </li>
              <li>
                <Link
                  href="/products/steel"
                  className="text-slate-400 hover:text-forge-400 transition"
                >
                  Stainless &amp; Alloy Steel CNC Parts
                </Link>
              </li>
              <li>
                <Link
                  href="/products/aluminium"
                  className="text-slate-400 hover:text-forge-400 transition"
                >
                  Aluminium Die Molds &amp; 6061 Parts
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1 font-semibold text-white hover:text-forge-400 transition pt-1"
                >
                  Explore Full Catalog
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div className="lg:col-span-2">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-widest text-white mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-slate-400 hover:text-forge-400 transition"
                >
                  About S Square
                </Link>
              </li>
              <li>
                <Link
                  href="/infrastructure"
                  className="text-slate-400 hover:text-forge-400 transition"
                >
                  Infrastructure &amp; ESG
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-slate-400 hover:text-forge-400 transition"
                >
                  Engineering FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-400 hover:text-forge-400 transition"
                >
                  Contact &amp; RFQ Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Manufacturing HQ */}
          <div className="lg:col-span-3 space-y-3.5 text-sm">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-widest text-white mb-4">
              Manufacturing HQ
            </h4>
            <div className="flex items-start gap-2.5 text-slate-400">
              <MapPin className="h-4 w-4 text-forge-500 shrink-0 mt-1" />
              <address className="not-italic leading-relaxed">
                <strong className="text-slate-200 block">
                  {COMPANY_INFO.name}
                </strong>
                {COMPANY_INFO.address.line1},<br />
                {COMPANY_INFO.address.locality},{" "}
                {COMPANY_INFO.address.city} – {COMPANY_INFO.address.pincode},
                <br />
                {COMPANY_INFO.address.state}, {COMPANY_INFO.address.country}
              </address>
            </div>

            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-forge-500 shrink-0" />
              <a
                href={`tel:${COMPANY_INFO.phoneRaw}`}
                className="font-mono text-slate-200 hover:text-forge-400 transition"
              >
                {COMPANY_INFO.phone}
              </a>
            </div>

            <div className="flex items-start gap-2.5">
              <Mail className="h-4 w-4 text-forge-500 shrink-0 mt-0.5" />
              <div className="flex flex-col space-y-1 font-mono text-xs">
                <a
                  href={`mailto:${COMPANY_INFO.emails.sales}`}
                  className="text-slate-300 hover:text-forge-400 transition"
                >
                  {COMPANY_INFO.emails.sales}
                </a>
                <a
                  href={`mailto:${COMPANY_INFO.emails.info}`}
                  className="text-slate-400 hover:text-forge-400 transition"
                >
                  {COMPANY_INFO.emails.info}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-slate-400 pt-1">
              <Clock className="h-4 w-4 text-forge-500 shrink-0" />
              <span>{COMPANY_INFO.hours}</span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-6 border-t border-carbon-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} {COMPANY_INFO.name}. All rights reserved.
          </p>
          <p className="font-mono text-[11px]">
            RUBBER · STAINLESS STEEL · ALUMINIUM · COIMBATORE, INDIA
          </p>
        </div>
      </div>
    </footer>
  );
}
