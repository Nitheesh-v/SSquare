"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

const LINKS = [
  ["/products", "Component catalog"],
  ["/products/rubber", "Rubber products"],
  ["/products/steel", "Steel components"],
  ["/products/aluminium", "Aluminium products"],
  ["/about", "Our company"],
  ["/infrastructure", "Infrastructure"],
  ["/faq", "FAQs"],
  ["/contact", "Contact"],
];

export function ReferenceHeader() {
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!menu.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  return (
    <header className="site-header reference-header">
      <Link
        href="/"
        aria-label="S Square Engineering Services — Home"
        className="reference-brand"
      >
        <Logo theme="dark" />
      </Link>
      <div
        className="reference-header-actions"
        ref={menu}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node))
            setOpen(false);
        }}
      >
        <Link href="/products" className="reference-catalog-link">
          Catalog <ArrowUpRight size={14} />
        </Link>
        <button
          ref={toggle}
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="reference-menu"
          onClick={() => setOpen(!open)}
          className="reference-menu-toggle"
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
        {open && (
          <nav
            id="reference-menu"
            className="reference-menu"
            aria-label="Main navigation"
          >
            <p>EXPLORE S SQUARE</p>
            {LINKS.map(([href, label], i) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>
                <span>
                  <small>{(i + 1).toString().padStart(2, "0")}</small>
                  {label}
                </span>
                <ArrowUpRight size={15} />
              </Link>
            ))}
            <a
              href="#quote"
              className="reference-menu-quote"
              onClick={() => setOpen(false)}
            >
              Start an enquiry <ArrowUpRight size={17} />
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
