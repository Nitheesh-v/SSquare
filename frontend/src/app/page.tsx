import type { Metadata } from "next";
import { Home3DAnimation } from "@/features/studio/Home3DAnimation";

export const metadata: Metadata = {
  title:
    "S Square Engineering Services | Custom Rubber, Steel & Aluminium Components",
  description:
    "Custom rubber, steel and aluminium components engineered in Coimbatore. Seals, gaskets, valve bodies, die moulds and precision machined parts made to your drawing.",
};

/**
 * The full-screen 3D homepage ships its own header/footer, so it deliberately
 * lives outside the `(store)` route group (which supplies the shared Navbar and
 * Footer for every inner page). Removing this file restores the group's layout.
 */
export default function HomePage() {
  return <Home3DAnimation />;
}
