"use client";

import { useEffect, useRef } from "react";
import "@fontsource-variable/inter/wght.css";
import "@fontsource/dm-mono/latin-400.css";
import "@fontsource/dm-mono/latin-500.css";
import {
  HOME_3D_MARKUP_AFTER,
  HOME_3D_MARKUP_BEFORE,
} from "./home-3d-markup";
import { Services3DSection } from "./Services3DSection";
import "./home-3d.css";
import "./home-3d-hero.css";
import "./home-3d-materials.css";
import "./home-3d-responsive.css";

/**
 * Next.js port of the supplied standalone 3D homepage HTML.
 *
 * The source page is a full document (its own sections, footer, chapter rail
 * and imperative Three.js/WebGL module). Its top header nav was removed in
 * favour of the shared site Navbar rendered by app/page.tsx. Most of it is
 * mounted as scoped static markup; the "OUR SERVICES" block is a real React
 * component with its own scroll-linked Three.js scene. The original product
 * carousel and travelling component animations remain, while the background
 * gear layers are removed. All CSS lives under `.home3d`, so the shared site
 * styles are untouched.
 */
const STATIC_CSS = `
  .home3d #intro, .home3d #gl, .home3d #gearsWorld, .home3d .hero-ghost,
  .home3d #inFront, .home3d #spotFront, .home3d .inside, .home3d .spot {
    display: none !important;
  }
  .home3d .hero { min-height: 72svh; }
  .home3d #play, .home3d #auto { display: none !important; }
  .home3d .proc, .home3d .quote { background: #0b1220 !important; }
  .home3d .cat { background: var(--cream) !important; }
  .home3d .nav { opacity: 1 !important; transform: none !important; }
  .home3d .card, .home3d .cat-card, .home3d .step, .home3d .pphoto,
  .home3d .tw, .home3d .qform, .home3d .shop .cap, .home3d .bit {
    opacity: 1 !important; transform: none !important; translate: 0 0 !important;
  }
  .home3d .ln span { transform: none !important; }
  .home3d .services3d { height: auto !important; min-height: 0 !important; }
  .home3d .services3d-pin {
    position: relative !important; height: auto !important; min-height: 0 !important;
    padding: 72px 16px 80px !important;
  }
  .home3d .services3d-canvas, .home3d .services3d-veil,
  .home3d .services3d-track, .home3d .services3d-control,
  .home3d .services3d-spec { display: none !important; }
  .home3d .services3d-overlay {
    position: relative !important; inset: auto !important; display: block !important;
    padding: 0 !important; transform: none !important;
  }
  .home3d .services3d-head { position: relative !important; left: auto !important; top: auto !important; margin-bottom: 28px !important; }
  .home3d .services3d-cards {
    position: relative !important; left: auto !important; right: auto !important; bottom: auto !important;
    display: grid !important; grid-template-columns: 1fr !important; gap: 14px !important; overflow: visible !important;
  }
  .home3d .services3d-card {
    opacity: 1 !important; transform: none !important; pointer-events: auto !important;
    background: #0d1626 !important; color: #f6f3ee !important; box-shadow: none !important;
  }
  .home3d .services3d-card p { color: rgba(246,243,238,.7) !important; }
  .home3d .services3d-tag { pointer-events: none !important; }
`;

export function Home3DAnimation() {
  const hostRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const body = document.body;

    body.classList.add("home3d-active");
    let cancelled = false;
    let dispose = () => {};

    const revealStatic = () => {
      host.querySelector("#home")?.classList.add("in");
      const title = host.querySelector("#title");
      if (title && !title.textContent?.trim()) title.textContent = "RUBBER";
      const tag = host.querySelector("#tag");
      if (tag && !tag.textContent?.trim())
        tag.textContent =
          "Seals, gaskets, O-rings, cords, sheets & rubber-to-metal bonded components.";
      host.querySelectorAll(".rvw, .cat").forEach((el) => el.classList.add("on"));
      const services = host.querySelector<HTMLElement>(".services3d");
      if (services) {
        services.dataset.fallback = "true";
        services.dataset.step = "all";
      }
      if (!host.querySelector("style[data-home3d-fallback]")) {
        const style = document.createElement("style");
        style.dataset.home3dFallback = "1";
        style.textContent = STATIC_CSS;
        host.appendChild(style);
      }
    };

    import("./home-3d-engine")
      .then(async ({ createHome3DEngine }) => {
        if (cancelled) return;
        const teardown = await createHome3DEngine(host);
        if (cancelled) teardown();
        else dispose = teardown;
      })
      .catch((error) => {
        console.error("3D homepage engine unavailable; using static content.", error);
        if (!cancelled) revealStatic();
      });

    return () => {
      cancelled = true;
      dispose();
      body.classList.remove("home3d-active", "locked", "dragging");
    };
  }, []);

  return (
    <main
      id="main-content"
      className="home3d"
      ref={hostRef}
      tabIndex={-1}
    >
      <div
        className="home3d-segment"
        dangerouslySetInnerHTML={{ __html: HOME_3D_MARKUP_BEFORE }}
      />
      <Services3DSection />
      <div
        className="home3d-segment"
        dangerouslySetInnerHTML={{ __html: HOME_3D_MARKUP_AFTER }}
      />
      <noscript>
        <style>{STATIC_CSS}</style>
      </noscript>
    </main>
  );
}
