"use client";

import { useEffect, useRef } from "react";
import "@fontsource-variable/inter/wght.css";
import "@fontsource/dm-mono/latin-400.css";
import "@fontsource/dm-mono/latin-500.css";
import { HOME_3D_MARKUP } from "./home-3d-markup";
import "./home-3d.css";

/**
 * Next.js port of the supplied standalone 3D homepage HTML.
 *
 * The source page is a full document (its own sections, footer, chapter rail
 * and imperative Three.js/WebGL module). Its top header nav was removed in
 * favour of the shared site Navbar rendered by app/page.tsx. It is mounted
 * here as scoped static markup plus a cleanup-aware engine effect rather than
 * rewritten into JSX, so all of the original geometry, scroll anchors and
 * interactions survive. All CSS lives under `.home3d`, so the shared site
 * styles are untouched.
 */
const STATIC_CSS = `
  .home3d #intro, .home3d #gl, .home3d #gearsWorld, .home3d .hero-ghost,
  .home3d #inFront, .home3d #spotFront, .home3d .inside, .home3d .spot {
    display: none !important;
  }
  .home3d .hero { min-height: 72svh; }
  .home3d .proc, .home3d .quote { background: #0b1220 !important; }
  .home3d .cat { background: var(--cream) !important; }
  .home3d .nav { opacity: 1 !important; transform: none !important; }
  .home3d .card, .home3d .cat-card, .home3d .step, .home3d .pphoto,
  .home3d .tw, .home3d .qform, .home3d .shop .cap, .home3d .bit {
    opacity: 1 !important; transform: none !important; translate: 0 0 !important;
  }
  .home3d .ln span { transform: none !important; }
`;

export function Home3DAnimation() {
  const hostRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const body = document.body;

    body.classList.add("home3d-active", "locked");
    let cancelled = false;
    let dispose = () => {};

    // Never leave the page scroll-locked if the engine chunk or WebGL fails.
    const safety = window.setTimeout(() => {
      if (!cancelled) body.classList.remove("locked");
    }, 9500);

    const revealStatic = () => {
      body.classList.remove("locked");
      host.querySelector("#intro")?.remove();
      host.querySelector("#home")?.classList.add("in");
      const title = host.querySelector("#title");
      if (title && !title.textContent?.trim()) title.textContent = "RUBBER";
      const tag = host.querySelector("#tag");
      if (tag && !tag.textContent?.trim())
        tag.textContent =
          "Seals, gaskets, O-rings, cords, sheets & rubber-to-metal bonded components.";
      host.querySelectorAll(".rvw, .cat").forEach((el) => el.classList.add("on"));
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
      window.clearTimeout(safety);
      dispose();
      body.classList.remove("home3d-active", "locked", "dragging");
    };
  }, []);

  return (
    <>
      <main
        id="main-content"
        className="home3d"
        ref={hostRef}
        tabIndex={-1}
        dangerouslySetInnerHTML={{ __html: HOME_3D_MARKUP }}
      />
      <noscript>
        <style>{STATIC_CSS}</style>
      </noscript>
    </>
  );
}
