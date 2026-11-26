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

- **The homepage opens with an S SQUARE brand introduction, then the three products**: the first section of the homepage is the animated “aperture ring” hero, whose first station is the S SQUARE introduction; the three product cards (Rubber / Steel / Aluminium) follow immediately. The next sections are About, What We Do, Services, facts and Quick Service.
- **The hero itself is an animated three-station “aperture ring”**: a pinned, straight-down view of a giant machined ring carrying Rubber, Steel and Aluminium stations. The first station is an S SQUARE introduction built on a locally generated monochrome industrial-gear photograph, matching the original site's machinery hero instead of opening on a product close-up; the 5.5-second autoplay then cycles through S SQUARE → Steel → Aluminium like a carousel, and the three product cards sit directly beneath it. The three real division RFQ paths remain unchanged. It adapts the supplied APERTURE ROW interaction language (canvas knurling/engraving, a blue index mark that scrambles on change, spring-in spec accessories, motion blur, exploding copy, drag/wheel/dots/arrow keys) to the real S Square content. Clicking the active station or **View Specs** opens a right-side inspector drawer with a 3D-tilting plate, spec grid, condition chips, project options and typical-output prints; its footer opens the existing RFQ dialog with the matching division. There is no cart, price or checkout.
- **The reference homepage content is preserved below the products**: Explore Our Products, About Us / Who We Are, What We Do with four manufacturing capabilities, company facts and the split-photo Quick Service contact section. Services is now a **sticky cinematic journey** modelled on the user's `Ssquare/animation video.mp4` and pasted HTML: four generated photoreal frames (drawing & machining → inspection → loading → truck on the road) cross-fade and push in with document scroll under a top progress HUD and three switching cards. No video file or remote asset is shipped. The fixed background also changes colour, grid geometry, orbit/sweep tempo and WebGL camera/geometry by scroll chapter. The Bench/iris section and giant reference-style wordmark were removed at the user's request; the genuine shared navigation and **main-branch footer** are unchanged. The old four-slide `HeroShowcase.tsx` is retained as unmounted source, not part of the homepage.
- The static facts strip still shows **20+ years**, **03 material disciplines**, and **Coimbatore, India**. For the three service cards the user later explicitly selected the **literal pasted HTML copy**, including `100% CONFORMITY`, `FREE DOOR DELIVERY` and `DHL / FEDEX · 3–4 DAYS`; these are user-supplied reference claims, not independently verified guarantees. Other pages keep the earlier reviewed, project-specific quotation terms.
- A warm-paper, muted-sage, charcoal and copper visual system remains shared across the company, infrastructure, division index, catalog, three material pages, FAQ and contact page. The homepage additionally loads a scoped dark, animated layer in `immersive/ar-home.css`; `home-content.css` and the shared `studio.css`, genuine logos, header and footer are unchanged for inner pages.
- The full **four-section travelling-component experience is preserved at `/material-experience`**, linked from the footer. Its real-WebGL arc supports drag/flick, raycast selection, arrows, optional 3.2-second autoplay, circular material-colour transitions and per-letter titles. A short, skippable intro uses the actual company logo. The older contained `ComponentInspector` and `HeroShowcase` sources are retained but no longer mounted on the homepage; the homepage now mounts **one optional low-cost Three.js backdrop** plus two 2D ring canvases, only when motion is allowed.
- In that full experience, the same selected Three.js object travels through a pinned four-step story, flips through 0° / 180° / 360° / 720°, passes through a one-shot 20-fragment storm and lands on its matching division card. The three-slot project brief supports autofill, removal, duplicates and sequential flights before opening the contextual RFQ. It is **not** a cart, quote approval, order or payment.
- The hero uses one autoplay timeout and one `requestAnimationFrame` loop that stops outside the hero, on hidden tabs and for reduced motion. The static disc is painted once per resize; the rotating ring canvas repaints only when its angle changes; the iris updates only while visible and changing; camera blur is quantised and applied only while turning. Hover/focus, open navigation or quote dialogs, offscreen state, hidden tabs, pause and reduced motion suspend autoplay. The material-card reveal/photo-plane enhancement remains pause-aware. The preserved 3D routes retain their existing renderer limits and motion alternatives; those limits are not hardware-performance guarantees.
- Live reduced motion keeps the whole homepage still without hiding it: WebGL and both hero canvases unmount, CSS animations/transitions are disabled, the ring holds a static CSS fallback and the bench stats show final values. Without JavaScript, all content, company facts, About/product/phone/email links and native `/contact#quote` paths remain usable. The Quick Service quotation link progressively opens the existing editable RFQ dialog with all three divisions when JavaScript is available; opening it does not submit an enquiry.
- The animated homepage uses locally served Barlow Condensed for display/labels and Inter for body copy; Poppins remains scoped to the retained legacy hero source, and IBM Plex Mono supplies the shared editorial presentation on inner pages. The immersive experience retains Archivo Black, Inter and DM Mono. Fonts are locally served through Fontsource with swap display; no remote intro video, Google Fonts request or third-party runtime script is used.
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

The homepage is composed in `frontend/src/features/studio/IndustrialHome.tsx`. Its animation layer lives in `frontend/src/features/studio/immersive/`: `ApertureHero.tsx` owns the auto-advancing ring and gear/Rubber first impression, `ThreeBackdrop.tsx` the optional WebGL field, `HomeAmbient.tsx` the scroll-chaptered fixed atmosphere, `ServiceStory.tsx` + `service-journey.css` the sticky scroll-scrubbed service film, `StationDrawer.tsx` the RFQ spec inspector, `slides.ts` the three reviewed material stations, and `ar-home.css` the scoped dark presentation. `IrisBench.tsx` is retained as unmounted source after the Bench section was removed. `home-content.css` keeps the reference content layout; `features/products/HeroShowcase.tsx` and `hero-slideshow.css` retain the original four-slide hero as unmounted source. `ComponentInspector.tsx` is likewise retained as unmounted source. `studio.css` and `components/shared/PageIntro.tsx` continue to define the shared presentation. The full experience remains in `features/journey/MaterialJourney.tsx`; `journey-engine.ts` owns its timing/anchors/interactions. The 3D views reuse the unmodified illustrative models in `journey-scene.ts` and matching `ComponentIllustration.tsx` SVGs. Replacing those models requires normalized geometry and appropriate part/camera mapping; the aluminium environment variable does not automatically replace them.

## Checks and handover

```sh
cd frontend
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright covers desktop (1440), tablet (768), mobile (390), small mobile (320), the reference homepage's section order/copy/facts, local photos and labelled fallbacks, About/product destinations, native no-JavaScript quotation paths, and Quick Service dialog focus/prefills without submission. The homepage suites were re-run on this branch with a provisioned Chromium and pass in all four viewports (25/22/22/22); the full-experience `material-journey` suite needs real WebGL and cannot pass in a SwiftShader-only sandbox. Existing suites cover public/removed routes, navigation, catalog filters/prefills, the three-station aperture hero's arrows/autoplay/pause/keyboard controls and canvas field, gear/Rubber first impression, removed Bench and giant wordmark, scroll-changing background chapters, the scroll-scrubbed service film and its exact reference card copy, detailed aluminium motion alternatives and axe WCAG A/AA checks. Dedicated travelling-component/brief tests remain available for the unchanged full experience. Supplemental five-size layout matrices run once each; current results and scope are recorded in `docs/QA.md`. To test actual RFQ writes, use **a test instance with outbound email/webhooks disabled** and explicitly set `QA_ALLOW_RFQ_WRITES=1`. Never run write tests against live sales inboxes. `QA_BASE_URL` can target a running local preview; an existing server is reused by default.

See [`docs/QA.md`](docs/QA.md) for results/limitations and [`docs/LAUNCH-CHECKLIST.md`](docs/LAUNCH-CHECKLIST.md) for the required photography, CAD, company sign-off and delivery configuration.
