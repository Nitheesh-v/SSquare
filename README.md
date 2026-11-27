# S Square Engineering Services

An industrial **B2B manufacturing and enquiry website** for S Square Engineering Services, Coimbatore. Next.js 15 / React 19 / Tailwind CSS on the frontend; NestJS 10 and optional MongoDB for RFQ storage.

This is **not an online shop**. There are no customer accounts, cart, checkout, online prices, payments or admin dashboards. Custom requirements are reviewed and quoted by the company.

## Current homepage (3D experience)

The `/` route now renders the supplied standalone 3D homepage, converted into a scoped Next.js client component:

| File | Role |
| --- | --- |
| `frontend/src/app/page.tsx` | Root-level home route. It sits **outside** the `(store)` group so the page keeps its own footer and full-screen scroll layout. It renders the **shared `Navbar` from the original site** (plus its skip link and `studio.css`) instead of the 3D page's own header nav, so real links to the inner pages and the RFQ dialog remain. The shared Navbar/Footer still serve every inner page via `(store)/layout.tsx`. |
| `frontend/src/features/studio/Home3DAnimation.tsx` | Mounts the static markup around the React-rendered services section, loads local Fontsource fonts, and starts/stops the main engine with full teardown. `data-home3d-static="true"` keeps the old homepage static. |
| `home-3d-markup.ts` | Original page markup as two strings (before / after the services section, no `<script>`), including a `<noscript>` static fallback. |
| `home-3d.css` | All original CSS, scoped under `.home3d` so the shared site styles are unaffected. |
| `home-3d-engine.ts` | The ported imperative module, retained only for the static reveal, quote form, image fallbacks, chapter links and cleanup. On the current homepage it returns its static fallback before importing `three`, so the old full-screen WebGL background never starts. Its quote form posts to the real `/api/quote` route rather than only showing a fake success message. |
| `Services3DSection.tsx` | Replaces the old generic "From the first drawing…" process block with a continuous scroll-linked **OUR SERVICES** section: 01 Customization → 02 Quality Assurance → 03 Free Door Delivery. |
| `home-3d-services-engine.ts` | The only remaining WebGL scene: damped `OrbitControls`, soft shadowed lighting, a billet/seal/machined-profile customization stage, caliper-arch QA scan, and a branded "S SQUARE / CUSTOM METAL & RUBBER EXPRESS" container truck driving a scroll-linked route past a dispatch gate. DPR is capped at 2; wheel zoom and touch rotation are disabled so page scrolling is not blocked, horizontal touch drags inspect the scene, and products are raycast-clickable for specs. No gear or bolt shapes are used. |
| `home-3d-services.css` | Scoped sticky/overlay styles modelled on the supplied reference screenshots: `SERVICES / OUR SERVICES` header, three horizontal service cards (active card white/red), top-right control pill with live scroll percent, cyan/red route track, GPU-friendly `transform`/`opacity` transitions, responsive mobile card scroller, reduced-motion and no-JS fallbacks. |

The 3D page's own `<header class="nav">` (brand, section pill, phone chip, enquiry basket, CTA) was removed from the markup; its side chapter rail remains part of the scroll experience and its "Process" dot is now labelled "Services". Without the basket, "add to enquiry" still records items in the quote form's chip list, just without the fly-to-basket animation.

The old full-screen `#gl` canvas, `#gearsWorld` gear video/image, hero ghost video and their background animation were also removed from the static markup. `home-3d-engine.ts` now runs only its static fallback on `/`; **Services3DSection is the only remaining 3D/WebGL animation**, and it uses billet/seal/machined-profile shapes instead of gears or bolts.

> **Content sign-off needed:** the services copy is user-supplied and includes "100% Conformity", "Free Door Delivery", "DHL/FEDEX within 3-4 days" and "any part of the world". Earlier README/QA wording deliberately avoided these unverified claims, and the untouched Playwright suite still asserts that `<main>` must not contain `Free Door Delivery` / `100% conformity`. Confirm them with the company before launch, or ask for neutral wording.

The earlier screenshot-based `IndustrialHome.tsx` and the four-slide `HeroShowcase` are **retained as source but no longer mounted**. The sections below describing the four-slide hero, reference homepage content and their QA results describe that previous homepage; the homepage-specific Playwright expectations (`canvas` count, section order/copy) have not been updated for this replacement. Remote Pexels video/imagery and `ssquareengg.com` photos remain external references; failed images fall back to local division photos.

## Run locally

Use Node.js 22+ and npm.

```sh
# Terminal 1 — optional RFQ persistence service
cd backend
npm ci
cp .env.example .env
npm run start:dev

# Terminal 2 — website
cd frontend
npm ci
cp .env.example .env.local
npm run dev
```

- Website: port **3000**, bound to `0.0.0.0` for preview/deployment compatibility.
- RFQ storage API: port **4000**, `POST /api/v1/orders/rfq`.
- Local API documentation: `/api/docs` on port 4000.
- Browsers call only relative **`/api/quote`**. Backend hosts/keys are server-side; there is no browser-facing localhost API URL or wholesale API proxy.
- Without `MONGODB_URI`, the backend uses a single-process development JSON store in `backend/.data/store.json`. New stores are empty: no demo accounts, prices or purchase orders are seeded. Legacy commerce/auth source modules are not registered in the runtime. They cannot issue logins or expose enquiries through list/admin endpoints.

Production builds:

```sh
cd frontend && npm run build && npm run start
# In a separate terminal — only after the backend security gate below is cleared:
cd backend && npm run build && npm run start:prod
```

**Backend deployment is blocked pending dependency remediation.** The optional inherited NestJS 10 dependency tree currently reports 26 audit findings (11 high), including 12 production findings (7 high). Do not publicly deploy it until upgraded and regression-tested; the website can use configured email or an authenticated sales webhook without this optional service. `npm audit fix` did not resolve the findings, and a major framework migration was not forced into the redesign. See [`docs/QA.md`](docs/QA.md). The frontend audit reports zero findings. `start:prod` explicitly enables production mode, so missing `RFQ_API_KEY` fails closed even if a copied development `.env` is present.

## What is implemented

- **The original four-slide “Your Trusted Partner in Custom Metal & Rubber Solutions” hero stays first and unchanged**: dark background, scoped Poppins typography, framed local imagery and four selector cards (overview, rubber, steel and aluminium). Previous/next buttons, keyboard selection, 5.5-second autoplay, pause and real contextual quote prefills work without a hero canvas.
- **The homepage content now follows the supplied company screenshot**: About Us / Who We Are, Explore Our Products (Aluminium, Steel, Rubber), What We Do with four manufacturing capabilities, three numbered service cards, company facts, and the split-photo/crimson Quick Service contact section. This replaces the former lower homepage study/process/project panel, not the selected hero or shared navigation/footer.
- The user selected **current company details**, not the screenshot's animated intermediate counters or legacy blanket guarantees. The static facts show **20+ years**, **03 material disciplines**, and **Coimbatore, India**. Quality Assurance and Door Delivery describe inspection, coverage, charges and scheduling as agreed during quotation; no free-worldwide-delivery or 100% conformity promise is restored.
- A warm-paper, muted-sage, charcoal and copper visual system remains shared across the company, infrastructure, division index, catalog, three material pages, FAQ and contact page. New homepage rules are isolated in `home-content.css`; the existing shared `studio.css`, genuine logos, header and footer are unchanged.
- The full **four-section travelling-component experience is preserved at `/material-experience`**, linked from the footer. Its real-WebGL arc supports drag/flick, raycast selection, arrows, optional 3.2-second autoplay, circular material-colour transitions and per-letter titles. A short, skippable intro uses the actual company logo. The older contained `ComponentInspector` source is retained but no longer mounted on the screenshot-based homepage; the homepage now has no WebGL canvas, even after scrolling.
- In that full experience, the same selected Three.js object travels through a pinned four-step story, flips through 0° / 180° / 360° / 720°, passes through a one-shot 20-fragment storm and lands on its matching division card. The three-slot project brief supports autofill, removal, duplicates and sequential flights before opening the contextual RFQ. It is **not** a cart, quote approval, order or payment.
- The photo slideshow uses one timeout, not a rendering loop. Hover/focus, open navigation or quote dialogs, offscreen state, hidden tabs, pause and reduced motion suspend autoplay. The existing material-card reveal/photo-plane enhancement remains pause-aware. No animated counters, travelling objects or new journey animations are added to the homepage. The preserved 3D routes retain their existing renderer limits and motion alternatives; those limits are not hardware-performance guarantees.
- Live reduced motion keeps the slideshow and homepage content still without hiding it. Without JavaScript, all new content, company facts, About/product/phone/email links and native `/contact#quote` paths remain usable. The Quick Service quotation link progressively opens the existing editable RFQ dialog with all three divisions when JavaScript is available; opening it does not submit an enquiry.
- Poppins remains scoped to the hero. Inter, Barlow Condensed and IBM Plex Mono supply the shared editorial presentation below it; the immersive experience retains Archivo Black, Inter and DM Mono. Fonts are locally served through Fontsource with swap display; no remote intro video or third-party runtime script is used.
- The reference's machining and aluminium-tooling photos are reused from the existing local official-site cache in the About, What We Do and product sections. Rubber uses the existing AI-generated gasket/O-ring/bellows assortment and remains visibly labelled illustrative. Unavailable official/catalog photos retain labelled illustrative local fallbacks. See [asset provenance](frontend/public/images/ssquare/README.md).
- The detailed **material → rotated detail → exploded assembly → specification** aluminium/CAD story remains on `/products/aluminium`, with its optional approved-GLB hook and near-viewport lazy loading.
- Searchable/filterable component catalog, accessible quick-spec dialogs and contextual enquiry prefills. Legacy category detail URLs permanently redirect to the matching product division. No commerce/auth/admin links are reintroduced.

This remains the existing **Next.js site adaptation**, not a standalone single-file/base64-font export or a claim of the reference's literal network-host restriction.

## Configure actual enquiry delivery

Copy the examples and configure **server-side environment variables**, never chat or client code:

| Variable              | Where           | Purpose                                                                        |
| --------------------- | --------------- | ------------------------------------------------------------------------------ |
| `BACKEND_URL`         | Frontend server | Internal NestJS origin                                                         |
| `RFQ_API_KEY`         | Both servers    | Same strong random server-to-server key; required by the backend in production |
| `MONGODB_URI`         | Backend         | Production RFQ persistence with access controls, backups and retention         |
| `RESEND_API_KEY`      | Frontend server | Automatic email delivery                                                       |
| `QUOTE_FROM_EMAIL`    | Frontend server | Sender on a verified domain                                                    |
| `QUOTE_TO_EMAIL`      | Frontend server | Company-approved sales inbox                                                   |
| `QUOTE_WEBHOOK_URL`   | Frontend server | Optional sales system endpoint; also attempted if email fails                  |
| `QUOTE_WEBHOOK_TOKEN` | Frontend server | Optional bearer token for that webhook                                         |

Enquiries are validated, assigned unique references, and submitted to the backend. If unavailable, Next.js attempts an append-only local fallback in `frontend/.data/inquiries.ndjson`. **Saved does not mean delivered.** Responses and UI separately report backend/local storage, email acceptance and webhook acceptance. If no delivery completes, buyers are explicitly prompted to send a pre-filled email or WhatsApp message themselves. A failed save and failed delivery returns an error—not a success screen. Provider acceptance is not a guarantee of inbox delivery.

Local files are a development/recovery mechanism, **not a production CRM**. Use a durable database or authenticated webhook/email service before launch, restrict access to enquiry data, configure an appropriate retention policy, and add distributed/edge rate limiting and spam protection. The route has bounded inputs, a honeypot and best-effort per-instance throttling, not a distributed abuse prevention service. Drawings are sent directly by email/WhatsApp; the form does not pretend to upload files.

## Replace the concept with approved CAD

For the detailed story on **`/products/aluminium`**, set `S_SQUARE_CAD_MODEL_URL` on the Next.js server, or edit `frontend/src/lib/visual-config.ts`. Supply an optimized **public GLB**, exported from an approved CAD model, ideally under a few MB and suitable for mobile. Do not put confidential source STEP/IGES files or large raw CAD in Git/public storage. The supplied GLB is centered and normalized automatically, rotates with scroll and receives a CAD-edge overlay. The procedural model demonstrates the exploded assembly; a real multi-part GLB needs part-name/transform mapping in `AluminiumScrollScene.tsx` for its own accurate exploded view. If a GLB cannot load, the labelled concept remains.

The homepage is composed in `frontend/src/features/studio/IndustrialHome.tsx`, with new content styling in `home-content.css`. `features/products/HeroShowcase.tsx` and its scoped `hero-slideshow.css` retain the original four-slide hero restored in `64708b0`, including reviewed descriptions and project-specific delivery/inspection wording. `ComponentInspector.tsx` is retained as unmounted source; it is not part of the new homepage. `studio.css` and `components/shared/PageIntro.tsx` continue to define the shared presentation. The full experience remains in `features/journey/MaterialJourney.tsx`; `journey-engine.ts` owns its timing/anchors/interactions. The 3D views reuse the unmodified illustrative models in `journey-scene.ts` and matching `ComponentIllustration.tsx` SVGs. Replacing those models requires normalized geometry and appropriate part/camera mapping; the aluminium environment variable does not automatically replace them.

## Checks and handover

```sh
cd frontend
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright covers desktop (1440), tablet (768), mobile (390), small mobile (320), the reference homepage's section order/copy/facts, local photos and labelled fallbacks, About/product destinations, native no-JavaScript quotation paths, and Quick Service dialog focus/prefills without submission. Existing suites cover public/removed routes, navigation, catalog filters/prefills, the original hero's four slides/arrows/autoplay/pause/keyboard controls, detailed aluminium motion alternatives and axe WCAG A/AA checks. Dedicated travelling-component/brief tests remain available for the unchanged full experience. Supplemental five-size layout matrices run once each; current results and scope are recorded in `docs/QA.md`. To test actual RFQ writes, use **a test instance with outbound email/webhooks disabled** and explicitly set `QA_ALLOW_RFQ_WRITES=1`. Never run write tests against live sales inboxes. `QA_BASE_URL` can target a running local preview; an existing server is reused by default.

See [`docs/QA.md`](docs/QA.md) for results/limitations and [`docs/LAUNCH-CHECKLIST.md`](docs/LAUNCH-CHECKLIST.md) for the required photography, CAD, company sign-off and delivery configuration.
