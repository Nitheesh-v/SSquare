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
- **Four-section travelling-component homepage**, adapted from the supplied Stride animation reference for **Rubber, Steel and Aluminium**. All seven visible hero components are real WebGL geometry. Drag/flick, click/raycast, arrows and optional 3.2s autoplay move the arc; a feathered circular reveal changes the hero/inside colour and the title rises letter by letter.
- One persistent 3D traveller flies from its hero position into a pinned four-step technical story, flips through 0° / 180° / 360° / 720°, spins through a single wave of 20 material fragments, then lands at the exact screen rectangle of its own division card. It follows card tilt and squash interactions. Other cards use lightweight inline SVGs of the illustrative parts.
- The pack-builder idea becomes a **three-component project brief**, not a store: automatic initial selection, removable slots, duplicate material choices, thumbnail counts, soft glow and flights to a brief badge. Requesting the combination flies the three parts in sequence, then opens the real RFQ form with those choices prefilled. Selections are retained for editing; nothing is ordered, paid for or sent by this animation.
- The genuine S Square logo/primary navigation, navy footer, Phone/WhatsApp and Request a Quote actions remain. The intro uses the **actual S Square logo**, not the fictional protein-bar video. Archivo Black, Inter variable and DM Mono are self-hosted through Fontsource; no Higgsfield/CDN assets or runtime third-party scripts are needed on the new homepage.
- Native touch/keyboard scrolling and a snap strip on phones. A desktop-only wheel glide matches the reference; it yields to keys/pointer presses, dialogs, ctrl/sideways wheels, coarse pointers, reduced motion and the intro lock. A fixed four-link section rail tracks the active section.
- Rubber reference imagery remains the new AI-generated gasket/O-ring/bellows assortment and stays explicitly labelled. Official-site steel/aluminium photos remain in the card references; material pages and the catalog retain their photo/fallback behaviour.
- The more detailed **material → rotated detail → exploded assembly → specification** aluminium/CAD story now lives on `/products/aluminium`, retaining its optional approved-GLB hook and separate near-viewport lazy loading.
- One dynamically imported Three.js renderer for the home journey. Geometry is shared; the traveller's object identity stays unchanged. Scene setup waits until after the skippable intro; a GPU fence prevents slow devices from queuing outdated frames. Rendering is capped at 45fps / 30fps on phones, with DPR caps of 2 / 1.75, and stops offscreen, in hidden tabs or when paused. Resources/listeners are disposed on route unmount. This is not a hardware FPS guarantee.
- Live reduced motion skips the intro/autoplay/float/flips/storm/flights and uses still SVG component views with all four story articles exposed. Unavailable/lost WebGL also restores the labelled SVGs without blocking navigation or RFQ. A no-JavaScript stylesheet unpins the story and leaves every stage and the direct contact paths readable.
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

For the detailed story on **`/products/aluminium`**, set `S_SQUARE_CAD_MODEL_URL` on the Next.js server, or edit `frontend/src/lib/visual-config.ts`. Supply an optimized **public GLB**, exported from an approved CAD model, ideally under a few MB and suitable for mobile. Do not put confidential source STEP/IGES files or large raw CAD in Git/public storage. The supplied GLB is centered and normalized automatically, rotates with scroll and receives a CAD-edge overlay. The procedural model demonstrates the exploded assembly; a real multi-part GLB needs part-name/transform mapping in `AluminiumScrollScene.tsx` for its own accurate exploded view. If a GLB cannot load, the labelled concept remains.

The homepage is separate: `frontend/src/features/journey/MaterialJourney.tsx` composes the four sections, `journey-engine.ts` owns timing/anchors/interactions, and `journey-scene.ts` builds the three procedural components and single renderer. Home models are illustrative, **not** approved company CAD. Replacing them needs normalized model geometry and appropriate part/camera mapping in that scene; the aluminium environment variable does not automatically replace the three home models.

## Checks and handover

```sh
cd frontend
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright covers desktop (1440), tablet (768), mobile (390), small mobile (320), routes/removed commerce URLs, navigation, dialog focus, catalog filters/prefills, the travelling component's identity/landing bounds, flips/storm, gestures, brief-to-quote flow, intro/font loading, reduced motion, WebGL/context loss and axe WCAG A/AA checks. The last full run passed **81 checks**; three duplicate matrix invocations are intentionally skipped because the five-size supplemental matrix runs once. To test actual RFQ writes, use **a test instance with outbound email/webhooks disabled** and explicitly set `QA_ALLOW_RFQ_WRITES=1`. Never run write tests against live sales inboxes. `QA_BASE_URL` can target a running local preview; an existing server is reused by default.

See [`docs/QA.md`](docs/QA.md) for results/limitations and [`docs/LAUNCH-CHECKLIST.md`](docs/LAUNCH-CHECKLIST.md) for the required photography, CAD, company sign-off and delivery configuration.
