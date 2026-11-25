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

- **A reference-led dark 3D homepage**, replacing the previous photo-led home. Rubber `#111a2b`, steel `#22364d` and aluminium `#4b5968` set the material palette, with large Barlow Condensed titles, concentric rings, an outline counter, floating fragments, orange actions and a translucent section-navigation pill. The pill moves to the bottom on phones; the real S Square logo and a compact site menu remain accessible.
- A real-WebGL material carousel with drag/flick snapping, keyboard/arrows, raycast selection, optional autoplay, circular colour transitions and per-letter titles. Autoplay waits for a complete dwell **after** each glide, including on slow GPUs. A skippable, once-per-session logo introduction defers WebGL compilation; its workshop backdrop is an illustrative still, not purported company video.
- **One persistent selected component and one renderer** across the arc → 500svh pinned precision story → matching material card → 260svh pinned component spotlight. The precision story flips through 0° / 180° / 360° / 720°, then a one-wave, 20-fragment storm. The spotlight adds scroll-driven component rotation, opposing SVG gears and an illustrative workshop-photo parallax layer, without starting a second WebGL renderer.
- Three dark material cards with tilt/inspection/add controls; three photographed spotlight products with contextual quote actions; a four-step requirement → detail → manufacture/inspect → pack/dispatch section; and a **seven-row filtered material-family comparison**. Comparison actions retain the exact family in the enquiry, rather than silently replacing it with a generic material.
- A navy enquiry section with real phone/email/WhatsApp links, an editable **up-to-three-item enquiry pack** and an **inline working RFQ form**. Suggested selections populate only if the visitor has not edited the pack; removal, duplicates and staged flights remain supported. Pack changes never overwrite typed notes. Submitted selections are captured with their reference, so editing the pack during a pending request cannot alter the later direct-dispatch draft. Combined note/pack length is bounded without truncating the visitor’s details. Nothing is ordered, paid for or sent merely by selecting a part.
- The original four-section travelling-component presentation remains at **`/material-experience`**, with its original pastel palette, Archivo Black typography and modal-based three-component brief. The detailed aluminium/CAD story remains at **`/products/aluminium`**, including the optional approved-GLB hook and near-viewport lazy loading.
- Native page/touch scrolling on the new homepage, demand-rendered spotlight updates, hidden-tab handling, GPU back-pressure, capped DPR and disposal. Card landing follows both CSS reveal motion and native horizontal strip scrolling. Pause removes nonessential animation; live reduced motion removes WebGL and pinning while retaining readable stories, controls and SVG views. Unavailable/lost WebGL keeps labelled still views and functional enquiry paths. These are safeguards, not hardware frame-rate guarantees.
- The refreshed company, infrastructure, division index, searchable/filterable catalog, three material pages, FAQ, contact page and navy footer retain their warm-paper/sage industrial styling and genuine company identity. Quick specs, contextual enquiries, permanent legacy division redirects and removed commerce/auth/admin routes still work.
- Main-home typography uses **Barlow Condensed, Inter and DM Mono**; inner-page typography and the original journey retain their existing local fonts. All fonts are served through Fontsource. No Google-font request, remote intro video or third-party runtime script is needed for the homepage.
- Photography and models remain explicitly illustrative or identified as official-site reference copies. Rubber uses the AI-generated gasket/O-ring/bellows assortment; steel and aluminium cards/products use cached official-site references where applicable. No new certification, company-history, guaranteed response-time, numerical tolerance, stock or price claim was copied from the sample. See [asset provenance](frontend/public/images/ssquare/README.md).

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

The homepage uses `features/journey/MaterialJourney.tsx` with `appearance="reference"`, the sections/header/inline pack in `features/reference/`, and `reference.css`. `journey-engine.ts` owns timing, DOM anchors and interactions; `journey-scene.ts` shares one renderer and persistent traveller. The reference appearance supplies illustrative bonded-seal, hex-nut and machined-housing models with matching `ReferenceIllustration.tsx` still views. The original `/material-experience` keeps its gasket, flange and profile models and `ComponentIllustration.tsx` fallbacks. Replacing these models requires normalized geometry and appropriate part/camera mapping; the aluminium environment variable does not automatically replace them. `studio.css` and `components/shared/PageIntro.tsx` continue to style the inner pages.

## Checks and handover

```sh
cd frontend
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright covers desktop (1440), tablet (768), mobile (390) and small mobile (320), with supplemental **1440 × 900 / 390 × 844 / 320 × 844 / 844 × 390 / 768 × 1024** matrices. Coverage includes the new reference carousel/pinned traveller/spotlight, native scrolling, enquiry-pack edits, exact comparison-family selection, inline submission/failure/snapshot safety, no-JavaScript contact paths, reduced motion and unavailable/lost WebGL, alongside the original journey, detailed aluminium story, catalog, navigation and dialog focus. Axe WCAG A/AA checks include all three home palettes and the menu/form. The final production-build run passed **146 checks**, with **six intentional duplicate-matrix skips** (152 configured cases; approximately 17.1 minutes). To test actual RFQ writes, use **a test instance with outbound email/webhooks disabled** and explicitly set `QA_ALLOW_RFQ_WRITES=1`. Never run write tests against live sales inboxes. `QA_BASE_URL` can target an isolated preview; an existing server is reused by default.

See [`docs/QA.md`](docs/QA.md) for results/limitations and [`docs/LAUNCH-CHECKLIST.md`](docs/LAUNCH-CHECKLIST.md) for the required photography, CAD, company sign-off and delivery configuration.
