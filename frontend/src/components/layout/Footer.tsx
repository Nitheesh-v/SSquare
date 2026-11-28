import Link from "next/link";
import { ArrowUpRight, Mail, MessageSquare, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { COMPANY_INFO } from "@/lib/company-data";

const FOOTER_LINKS = [
  { href: "/about", label: "Our company" },
  { href: "/products", label: "Component catalog" },
  { href: "/products/rubber", label: "Rubber products" },
  { href: "/products/steel", label: "Steel components" },
  { href: "/products/aluminium", label: "Aluminium products" },
  { href: "/infrastructure", label: "Infrastructure" },
  { href: "/material-experience", label: "3D material experience" },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="studio-shell">
        <div className="footer-topline">
          <span>CUSTOM ENGINEERING. CONSIDERED MANUFACTURING.</span>
          <Link href="/contact">
            Let’s make something work <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" aria-label="S Square Engineering Services — Home">
              <Logo />
            </Link>
            <p>
              Rubber, steel and aluminium components.
              <br />
              Manufactured to your drawing or sample.
              <br />
              Made around your requirement.
            </p>
            <div className="footer-contact-icons">
              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp S Square"
              >
                <MessageSquare size={16} />
              </a>
              <a
                href={`mailto:${COMPANY_INFO.emails.sales}`}
                aria-label="Email S Square sales"
              >
                <Mail size={16} />
              </a>
              <a
                href={`tel:${COMPANY_INFO.phoneRaw}`}
                aria-label="Call S Square"
              >
                <Phone size={16} />
              </a>
            </div>
          </div>
          <div>
            <h2>EXPLORE S SQUARE</h2>
            <ul className="footer-links">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-address">
            <h2>BASED IN COIMBATORE. BUILT AROUND YOU.</h2>
            <address>
              <strong>{COMPANY_INFO.name}</strong>
              <span>
                {COMPANY_INFO.address.line1},<br />
                {COMPANY_INFO.address.locality}, {COMPANY_INFO.address.city}{" "}
                {COMPANY_INFO.address.pincode}
                <br />
                Tamil Nadu, India.
              </span>
            </address>
            <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="footer-phone">
              {COMPANY_INFO.phone} <ArrowUpRight size={18} />
            </a>
            <a href={`mailto:${COMPANY_INFO.emails.sales}`}>
              {COMPANY_INFO.emails.sales}
            </a>
            <span className="footer-hours">{COMPANY_INFO.hours}</span>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} {COMPANY_INFO.name}. All rights
            reserved.
          </p>
          <div>
            <Link href="/faq">FAQs</Link>
            <Link href="/contact">Contact</Link>
            <span>RUBBER / STEEL / ALUMINIUM</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
