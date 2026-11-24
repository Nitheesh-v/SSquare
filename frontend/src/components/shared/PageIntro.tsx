import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export function PageIntro({
  eyebrow,
  title,
  description,
  label = "CUSTOM MANUFACTURING / COIMBATORE",
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  label?: string;
  children?: ReactNode;
}) {
  return (
    <section className="studio-page-intro">
      <div className="studio-shell">
        <div className="studio-breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>{eyebrow}</span>
        </div>
        <div className="studio-page-intro-grid">
          <div>
            <p className="studio-kicker">{eyebrow}</p>
            <h1>{title}</h1>
            <p className="page-intro-description">{description}</p>
            {children && <div className="studio-actions">{children}</div>}
          </div>
          <div className="page-intro-emblem" aria-hidden="true">
            <span>FORM / MATERIAL / PURPOSE</span>
            <div className="page-intro-orbit">
              <ArrowUpRight />
            </div>
            <span>{label}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
