import type { Metadata } from "next";
import "@/features/studio/studio.css";
import { Navbar } from "@/components/layout/Navbar";
import { Home3DAnimation } from "@/features/studio/Home3DAnimation";

export const metadata: Metadata = {
  title:
    "S Square Engineering Services | Custom Rubber, Steel & Aluminium Components",
  description:
    "Custom rubber, steel and aluminium components engineered in Coimbatore. Seals, gaskets, valve bodies, die moulds and precision machined parts made to your drawing.",
};

/**
 * The 3D homepage lives outside the `(store)` route group so it can use its own
 * full-screen layout. Its own top navbar was removed: the shared Navbar from
 * the original site (the same one every inner page uses) is rendered here, so
 * the homepage keeps real links to /about, /products, /contact and the RFQ
 * dialog. The page's own footer and scroll experience are unchanged.
 */
export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Navbar />
      <Home3DAnimation />
    </>
  );
}
