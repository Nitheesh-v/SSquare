# S Square — industrial visual refresh QA

Review date: **2026-11-23**

Branch: `arena/8987795b-ssquare`

## Delivery status

The rejected carousel-led presentation has been replaced on the homepage by an **imagery-led industrial layout**, with a consistent refresh of the catalog, three material divisions, division index, company, infrastructure, FAQ, contact page and navy footer. The genuine company logos and working RFQ/contact paths remain.

The full travelling-component animation and three-part brief have **not been deleted**: they now live at **`/material-experience`**, linked from the new homepage study and footer. The detailed aluminium assembly story remains at **`/products/aluminium`**.

The final production-build Chromium run completed **118 passing checks, six intentional duplicate-matrix skips and zero failures**: 124 configured cases, one worker, approximately 12.6 minutes. **Visual approval is still the user's decision.** Passing tests are not design acceptance or unconditional production-launch approval.

## New presentation

- A full-width illustrative industrial hero with manual Rubber / Steel / Aluminium selection, matching material imagery, a subtle scroll-depth image plane and material-specific quote prefill. No forced intro or autoplay blocks the main homepage.
- Warm paper and sage backgrounds, condensed display type, Inter body copy, copper accents, clearer hierarchy, framed imagery and more generous section spacing.
- Three visible material cards, a component-detail section, a three-step manufacturing overview and a direct quote/contact panel.
- A contained 3D study that loads only near the viewport. It reuses the existing illustrative geometry with **no decorative copies**, retaining the selected object while materials change. Native scroll, pointer dragging and keyboard-operated rotation buttons control the part.
- Demand-driven rendering, GPU back-pressure, visibility handling and resource disposal. Pause freezes automatic scroll/photo movement but leaves explicit rotation usable. Reduced motion removes the canvas and nonessential animation while preserving controls and still illustrations.
- Shared `PageIntro` and division-hero layouts, cohesive catalog controls/cards, an updated contact treatment and a rebuilt navy footer with real contact links.
- Prominent illustrative/replaceable notes remain on concept imagery, the catalog's material previews and the procedural models. No certification, dimension, numerical tolerance, stock or price claim was added.

Implementation: `features/studio/{IndustrialHome,ComponentInspector}.tsx`, `features/studio/{materials.ts,studio.css}`, `components/shared/PageIntro.tsx` and the existing catalog/RFQ components. The full animation still uses `features/journey/{MaterialJourney.tsx,journey-engine.ts,journey-scene.ts}`.

This is the existing **Next.js adaptation**, not a standalone single-file/base64-font export or a claim of compliance with the reference's literal network-host restriction. Food artwork and the protein-bar intro video are not used as engineering assets.

## Build and dependency checks

| Check                             | Result                                                                                                            |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Frontend `npm run typecheck`      | Pass                                                                                                              |
| Frontend `npm run build`          | Pass — Next.js 15.5.29; 19 generated static pages                                                                 |
| Homepage framework estimate       | 6.75 kB route / 118 kB first-load JS; 103 kB shared                                                               |
| Full material experience estimate | 7.72 kB route / 119 kB first-load JS                                                                              |
| Frontend `npm audit`              | **0 findings**, including development dependencies                                                                |
| Prettier / `git diff --check`     | Pass                                                                                                              |
| Credential-pattern review         | No private-key/provider/GitHub-token patterns found in changed text; not a dedicated secret-scanner certification |
| Optional backend                  | Unchanged, stopped and still deployment-blocked by the inherited dependency findings below                        |

Fonts are locally served through Fontsource with swap display. Inter, Barlow Condensed and IBM Plex Mono support the new presentation; Archivo Black and DM Mono remain available to the immersive reference experience. Build estimates are **not** Lighthouse scores or real-device performance guarantees.

## Browser test results

Sources: [`industrial-site.spec.ts`](../frontend/tests/industrial-site.spec.ts), [`material-journey.spec.ts`](../frontend/tests/material-journey.spec.ts), [`studio-pages.spec.ts`](../frontend/tests/studio-pages.spec.ts). Configuration: [`playwright.config.ts`](../frontend/playwright.config.ts).

| Project              | Viewport                       | Result                                        |
| -------------------- | ------------------------------ | --------------------------------------------- |
| Desktop              | 1440 × 1000                    | 31 pass                                       |
| Tablet / touch       | 768 × 1024                     | 29 pass, 2 duplicate-matrix skips             |
| Mobile / touch       | 390 × 844                      | 29 pass, 2 duplicate-matrix skips             |
| Small mobile / touch | 320 × 844                      | 29 pass, 2 duplicate-matrix skips             |
| **Total**            | Production website, one worker | **118 pass, 6 intentional skips, 0 failures** |

Two supplemental five-size layout matrices run once in the desktop project: one for the preserved immersive experience, one for the refreshed home/interior layouts. Their duplicate invocations in the other three projects are explicitly skipped. Each includes **1440 × 900, 390 × 844, 320 × 844, 844 × 390 and 768 × 1024**.

### Refreshed-page coverage

- Eleven public routes, one main H1 per page, no horizontal document inflation, working legacy division redirects and removed commerce/auth/admin routes returning 404.
- Primary/mobile navigation, skip link, Escape behavior, quote focus containment/restoration and material-context prefills.
- Matching hero selection/image paths and persistent illustrative labels. Hero scroll depth responds to native scroll; pause freezes it and the material photo planes.
- No homepage canvas at initial load; a single persistent component near the study, keyboard rotation, drag rotation, scroll response and material changes without replacing the object's UUID.
- Paused study does not redraw on scroll, while explicit rotation remains available. Live reduced-motion changes remove/recreate the renderer without losing the selected material.
- Unavailable WebGL and synthetic context loss retain labelled SVG views and usable controls/quote paths.
- JavaScript-disabled homepage keeps material-page links, readable content, fallback illustrations and direct contact actions. A native link reaches the rubber division without client JavaScript.
- Search/filter/reset, quick specs and product-specific RFQ prefills remain functional.
- Successful isolated RFQ writes report storage separately from delivery; mocked failures retain entered details, focus the error and offer direct-contact alternatives. API validation, honeypot and response flags remain covered.
- The detailed aluminium story still lazy-loads, exposes four static stages in reduced motion and falls back when WebGL is unavailable.
- **Zero axe WCAG 2 A/AA / 2.1 AA tagged violations** on home, catalog, contact, FAQ, company, divisions, infrastructure, rubber and the immersive experience, plus the open RFQ dialog across the four projects. An initial low-contrast card index was darkened before the final passing run. Automated checks are a subset, **not** conformance certification.

### Preserved full-experience coverage

- One canvas, at least seven visible real-WebGL arc items, fractional drag/flick snapping, keys, material/title/counter/colour updates and stable selected-object identity.
- Pinned flips at 0° / 180° / 360° / 720°, one 20-fragment storm and no repeated burst after the section ends.
- Selected-card landing within one CSS pixel, plus card tilt/poke behavior and the matching hidden flat SVG.
- Three-slot autofill, removal, duplicates, add-to-brief flights, sequential combination flights, contextual quote fields and retained selection. No order/payment/submission is invented by the animation.
- Intro Skip, required local font faces, pause/reduced motion and unavailable/lost-WebGL fallbacks.

There were **no application `pageerror` events** in the final test run. Third-party catalog images are deliberately made invalid in site/refresh tests to exercise labelled fallbacks; local official-site copies still load. Mouse/pointer and touch emulation do not replace real hardware testing.

## Final visual and fallback review

- Reviewed the refreshed hero, material cards, contained study and complete homepage at **1440px and 390px**; reviewed new catalog, rubber, company, contact and division-index screenshots at both widths.
- The final real-WebGL supplement checks **1440 × 900, 390 × 844, 320 × 844, 768 × 1024 and 844 × 390**. The study reached `ready` at all five sizes, with no application errors or document-width overflow. No canvas was mounted in the initial hero view.
- Rotation controls remain visible at tablet and phone sizes. Native vertical touch scrolling is not replaced by a page-wide carousel or scroll trap on the new home.
- Review tooling/screenshots are in ignored `.cache/qa/studio-review.mjs`, `studio-review.json` and `studio-*.png`; they are not committed application assets.

## RFQ safety and operational limits

Outbound email/webhooks were disabled during QA; the optional backend remained offline. The eight actual test enquiries were marked `ARENA_QA` / `ARENA_QA_ONLY`. Cleanup removed **only those eight marked frontend records**, retained zero other frontend records, left the log at mode **0600**, and did not modify backend enquiry data.

**Local storage is not delivered mail or durable production CRM retention.** Provider acceptance does not establish inbox receipt. Production notification delivery, shared rate limiting, durable retention, monitoring, access controls and backups still require configuration and verification.

## Backend launch gate — unchanged

**Do not publicly deploy the optional inherited NestJS 10 backend until its dependencies are remediated and regression-tested.** Its previously recorded audit has **26 findings overall (11 high, 12 moderate, 3 low)** and **12 production findings (7 high, 5 moderate)**. `npm audit fix` did not resolve them; a forced framework migration was not included in this visual update. The frontend's zero-finding audit does not remediate those backend dependencies. An API key, CORS restrictions and private networking are not dependency fixes.

The frontend can use a correctly configured email service or authenticated sales webhook without deploying that optional service. Backend/API security and persistence implementation are otherwise unchanged in this refresh.

## Remaining approval and human checks

- User approval of the new visual direction; company-approved photographs, representative CAD, copy, address/contact/inbox ownership and usage permissions.
- Actual provider acceptance **and inbox receipt**, durable production enquiry retention, privacy/legal wording and operational monitoring.
- Current Safari/iOS, Firefox, Chrome/Android, assistive technology and a real lower-powered phone. Headless Chromium/SwiftShader is not a GPU/FPS benchmark; context-loss events are simulated.
- HTTPS, shared/edge abuse protection, secure secret deployment and backend remediation if that optional service is used.

## Reproduce

```sh
cd frontend
npm ci
npx playwright install chromium
npm run typecheck
npm run build
# Start the production site separately, then:
npm run test:e2e
```

Tests reuse an existing local server by default; otherwise Playwright starts a dev server. `QA_BASE_URL` can target an isolated test preview. Set `QA_ALLOW_RFQ_WRITES=1` **only with outbound notifications disabled**, never against a live sales inbox. A custom browser path can be supplied through `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

See [README](../README.md), [launch checklist](LAUNCH-CHECKLIST.md), the `.env.example` files and [asset provenance](../frontend/public/images/ssquare/README.md) for deployment inputs. Secrets, runtime enquiries, browser tooling, traces and screenshots remain excluded from Git.
