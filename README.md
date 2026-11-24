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

- Art-directed industrial homepage and consistent company, infrastructure, material, catalog, FAQ and contact pages; the existing dark three-column footer and brand logos are retained. Placeholder social links are replaced by working contact actions.
- Real photographs published on the original company site, including two locally cached lead images. Remaining unavailable/unapproved visuals are explicitly labelled **Illustrative Visual · Replaceable**. See [`frontend/public/images/ssquare/README.md`](frontend/public/images/ssquare/README.md).
- Full-width industrial hero with genuine extruded 3D gears. Native scrolling rotates the assembly and dollies the camera; a separate product-photo plane tilts in perspective. On sufficiently tall desktop viewports the hero is sticky for a short scroll segment; smaller screens scroll normally. Pause/resume controls, a static gear illustration and live reduced-motion support are included.
- Rubber imagery now shows an unmistakable assortment of gaskets, O-rings, bellows and molded parts, rather than the metal-looking single seal. This new local asset is AI-generated and stays labelled as illustrative in the hero, division cards and material page. Material-card image planes have scroll-driven depth; their labels and links stay still.
- Four-stage aluminium scroll story: **material → rotated detail → exploded assembly → CAD-style specification view**. Native page scrolling, GSAP scrub, and a single sticky Three.js canvas; no scroll interception or artificial scroll driver.
- Three.js is dynamically imported for the visible hero after a browser-idle opportunity, and separately near the aluminium story. The hero unmounts offscreen; reduced motion skips both scenes. Mobile uses reduced geometry complexity and capped pixel ratios (hero 1.25, aluminium story 1.35). The hero renders only on scroll/resize/visibility changes, not an endless GPU loop. Resources/listeners are disposed on unmount.
- A static SVG technical drawing replaces 3D for reduced motion, unavailable WebGL or context loss. Every story stage remains in the server-rendered document, with direct contact links available even without animation or JavaScript. The concept is explicitly labelled, with no dimensions or manufacturing tolerances implied.
- Restrained reveal and image-parallax motion. Hero panels and the featured strip are manual, not auto-advancing. Native touch/keyboard scrolling, visible focus, skip links, disclosure navigation and browser-managed modal focus trapping/restoration.
- Searchable/filterable custom component catalog and contextual enquiry prefills. Old category detail URLs permanently redirect to their product division.

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

Set `S_SQUARE_CAD_MODEL_URL` on the Next.js server, or edit `frontend/src/lib/visual-config.ts`. Supply an optimized **public GLB**, exported from an approved CAD model, ideally under a few MB and suitable for mobile. Do not put confidential source STEP/IGES files or large raw CAD in Git/public storage. The supplied GLB is centered and normalized automatically, rotates with scroll and receives a CAD-edge overlay. The procedural model demonstrates the exploded assembly; a real multi-part GLB needs part-name/transform mapping in `AluminiumScrollScene.tsx` for its own accurate exploded view. If a GLB cannot load, the labelled concept remains.

## Checks and handover

```sh
cd frontend
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright covers desktop (1440), tablet (768), mobile (390), small mobile (320), routes/removed commerce URLs, navigation, dialog focus, filters/prefills, hero camera/photo depth, pause/resume, stable provenance labels, 3D loading, live reduced motion, WebGL/context-loss fallback and axe WCAG A/AA checks. The current suite has 56 passing checks. To test actual RFQ writes, use **a test instance with outbound email/webhooks disabled** and explicitly set `QA_ALLOW_RFQ_WRITES=1`. Never run write tests against live sales inboxes. `QA_BASE_URL` can target a running local preview; an existing server is reused by default.

See [`docs/QA.md`](docs/QA.md) for results/limitations and [`docs/LAUNCH-CHECKLIST.md`](docs/LAUNCH-CHECKLIST.md) for the required photography, CAD, company sign-off and delivery configuration.
