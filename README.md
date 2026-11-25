# S Square Engineering Services

An industrial **B2B manufacturing and enquiry website** for S Square Engineering Services, Coimbatore. Next.js 15 / React 19 / Tailwind CSS on the frontend; NestJS 10 and optional MongoDB for RFQ storage.

This is **not an online shop**. There are no customer accounts, cart, checkout, online prices, payments or admin dashboards. Custom requirements are reviewed and quoted by the company.

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

- **A photography-led industrial homepage** with a scroll-depth background, three manual material selectors, clear division cards, a manufacturing process section and prominent quote/phone/WhatsApp actions. The default hero now shows the matching illustrative steel component scene; imagery stays clearly labelled rather than being passed off as company photography.
- A coherent warm-paper, muted-sage, charcoal and copper visual system across the company, infrastructure, division index, catalog, three material pages, FAQ and contact page. Shared page introductions, framed material photography, rounded component cards and a rebuilt dark-navy footer retain the genuine S Square logos.
- A **contained interactive 3D material study** on the homepage. It loads only near the viewport, keeps one persistent part while switching between rubber/steel/aluminium, rotates with native scrolling and supports dragging and keyboard-operated rotation buttons. Rendering is demand-driven, not an idle animation loop; hidden tabs, offscreen state and unmount release or suspend work. Pause stops scroll/photo motion while leaving deliberate rotation available.
- The full **four-section travelling-component experience is preserved at `/material-experience`**, linked from the homepage study and footer. Its real-WebGL arc supports drag/flick, raycast selection, arrows, optional 3.2-second autoplay, circular material-colour transitions and per-letter titles. A short, skippable intro uses the actual company logo.
- In that full experience, the same selected Three.js object travels through a pinned four-step story, flips through 0° / 180° / 360° / 720°, passes through a one-shot 20-fragment storm and lands on its matching division card. The three-slot project brief supports autofill, removal, duplicates and sequential flights before opening the contextual RFQ. It is **not** a cart, quote approval, order or payment.
- Shared renderer geometry and GPU back-pressure prevent accumulating outdated frames. The full journey retains its decorative instance pool; the contained homepage study requests no copies. Renderer DPR/frame-rate caps are upper bounds, not hardware-performance guarantees.
- Live reduced motion removes WebGL and nonessential movement, keeping readable content, material controls and still SVG illustrations. Unavailable/lost WebGL falls back without blocking contact or RFQs. With JavaScript disabled, primary content, material-page links and direct email/phone/WhatsApp remain available; dialogs and material selection require JavaScript.
- Inter, Barlow Condensed and IBM Plex Mono supply the new editorial typography. The immersive reference experience retains Archivo Black, Inter and DM Mono. Fonts are locally served through Fontsource with swap display; no Higgsfield food imagery, remote intro video or third-party runtime script is used.
- Rubber uses the updated AI-generated gasket/O-ring/bellows assortment. The new homepage uses the local illustrative material scenes; official-site steel/aluminium photo copies remain on the material pages and within the full journey. Unavailable catalog photos retain labelled local fallbacks. See [asset provenance](frontend/public/images/ssquare/README.md).
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

The homepage is composed in `frontend/src/features/studio/IndustrialHome.tsx`; `ComponentInspector.tsx` controls the contained, demand-rendered study. `studio.css` and `components/shared/PageIntro.tsx` define the shared presentation. The full experience is composed in `features/journey/MaterialJourney.tsx`; `journey-engine.ts` owns its timing/anchors/interactions. Both use the three illustrative models in `journey-scene.ts` and matching `ComponentIllustration.tsx` SVGs. Replacing these models requires normalized geometry and appropriate part/camera mapping; the aluminium environment variable does not automatically replace them.

## Checks and handover

```sh
cd frontend
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright covers desktop (1440), tablet (768), mobile (390), small mobile (320), public/removed routes, navigation, dialog focus, catalog filters/prefills, the new home’s scroll-depth/pause/material controls, contained 3D rotation/lazy loading, no-JavaScript contact paths, and the preserved travelling-component/brief experience. Live reduced motion, unavailable/lost WebGL and axe WCAG A/AA checks are included. The final production-build run passed **118 checks**, with **six intentional duplicate-matrix skips** (124 configured cases); each five-size supplemental layout matrix runs once. To test actual RFQ writes, use **a test instance with outbound email/webhooks disabled** and explicitly set `QA_ALLOW_RFQ_WRITES=1`. Never run write tests against live sales inboxes. `QA_BASE_URL` can target a running local preview; an existing server is reused by default.

See [`docs/QA.md`](docs/QA.md) for results/limitations and [`docs/LAUNCH-CHECKLIST.md`](docs/LAUNCH-CHECKLIST.md) for the required photography, CAD, company sign-off and delivery configuration.
