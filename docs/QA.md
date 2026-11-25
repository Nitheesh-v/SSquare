# S Square — industrial visual refresh QA

Review date: **2026-11-23**

Branch: `arena/8987795b-ssquare`

## Current follow-up: animations only

The photographic homepage restored at `f8533d6` remains the content/layout baseline. The full reference redesign was **not restored**. The current change adds motion to the existing targets only; no reference comparison table, enquiry pack, demo form, replacement copy, navigation or sections were introduced. The catalog, inner pages, RFQ implementation and original `/material-experience` engine are unchanged.

### Reference review and implementation

The live reference's structure was fetched. Direct retrieval of its raw HTML from the sandbox was blocked by the network, so the earlier reference reproduction at `3f4e2c2` was extracted into an **ignored, isolated local directory**, run on a temporary server, and inspected through Chromium before this implementation. Carousel/drag, sequential flips, particles and the assembly were reviewed in captured frames. That temporary server was stopped; no historical homepage files were restored to the working tree.

The existing rubber gasket, steel flange and aluminium profile now share one homepage canvas and a persistent traveller: hero carousel → selected material photograph → existing inspector. The reference's motion is adapted to the preserved page geometry, **not a claim that the original supplied standalone HTML was executed unchanged**.

Added motion: 4.4-second settled-frame carousel dwell/autoplay, horizontal drag and local keyboard selection, idle floating, radial photo reveals, staggered original heading letters/detail rows, perspective card hover, transition fragments, stepped 0° / 180° / 360° / 720° study turns, counter-rotating decorative gears and a non-submitting quote-arrow flight. Existing image/background parallax remains. There is no new scroll spacer, scroll hijack, forced intro, fake enquiry delivery or replacement form.

Pause returns the same renderer/object to the contained study. Native scrolling then needs no redraw, while deliberate rotation remains available. Reduced motion removes the canvas, cancels the animations and retains still SVGs and controls; unavailable/lost WebGL retains the existing labelled fallback. Autoplay suspends around focused/hovered controls, open menus/dialogs and hidden tabs. Native vertical touch panning is preserved.

Implementation: `features/studio/{HomeMotion.tsx,home-motion.ts,home-motion.css}`, the existing `IndustrialHome.tsx` and `ComponentInspector.tsx`; only the material-photo selectors in shared `studio.css` changed to distinguish outgoing/incoming photo layers.

### Current verification — production build

- `npm run build` and `npm run typecheck`: **pass**, Next.js 15.5.29 / 19 static pages. Homepage estimate: **11.3 kB route / 124 kB first-load JS**; shared 103 kB. The existing 3D geometry module is dynamically loaded. These are framework estimates, not Lighthouse/FPS guarantees.
- Fresh frontend `npm audit --audit-level=low`: **zero vulnerabilities**. No dependency changes were made; the optional backend's inherited launch gate below is unchanged.
- A pre-change, JavaScript-disabled content capture was compared against the updated homepage: **zero differences in all original visible copy, headings, link targets/text, image paths/alt text and button contents/labels**. `tests/home-motion.spec.ts` retains the five original SHA-256 fingerprints as a regression guard.
- Full production-browser run: **132 passed, 10 intentional skips, 2 test-assertion failures**, 144 configured cases / one worker / approximately 17.1 minutes. Both failures sampled an earlier GPU pose: a previous card's 360° frame counted as the study's settled 180°, and a previous 0° frame counted as the first contained paused frame. Those failures required **only assertion changes** to wait for the actual settled/local pose.
- Targeted recheck of both corrected checks in **all four projects: 8 passed, zero failures**, approximately 1.3 minutes. Final review also restricted carousel keys to the material buttons, preserving native keyboard behaviour on the adjacent phone link; the production build/typecheck were repeated successfully. On that final build, **all new motion checks plus paused-scroll/direct-rotation checks passed: 20 passed, 4 intentional skips, zero failures**, approximately 3.5 minutes, across all four projects. No application source changed after that build.
- All **134 non-skipped configured cases have a passing result across the full run and targeted rechecks**; this is **not described as a fresh, single clean full-suite rerun**. Ten full-matrix skips are six duplicate layout-matrix invocations, three duplicate fixed-size content comparisons and one desktop-only omission of the native-touch test.
- The full run covers current carousel autoplay/float, drag, keyboard selection, photo/card landing, fragments, study flips, perspective hover, quote feedback/prefill, actual touch swipes/native vertical pan, no-JavaScript content/contact, live reduced motion, pause/direct rotation, unavailable/context-lost WebGL, navigation/catalog/redirects, the unchanged full journey and real RFQ validation/storage semantics. Automated axe WCAG A/AA-tagged checks passed on the covered core/inner pages and RFQ dialog; this is not accessibility conformance certification.
- Supplemental final review: **1440×900, 390×844, 320×844, 768×1024, 844×390** — one ready canvas, same traveller UUID through photo/study, no page errors or horizontal overflow, no paused-scroll redraws, explicit 30° rotation, and **zero canvases in reduced motion** at every size. The heading/photographic layout and static content were inspected alongside the isolated reference frames. Headless Chromium/SwiftShader and touch emulation are not real-device/GPU certification.

Sources: `tests/home-motion.spec.ts`, `tests/studio-pages.spec.ts`, existing `tests/industrial-site.spec.ts` and `tests/material-journey.spec.ts`. Ignored supporting artifacts: `.cache/qa/motion-reference/`, `.cache/qa/motion-only-review.mjs`. No screenshots, reference clone, generated assets or runtime enquiries are committed.

The production preview runs with outbound email/webhooks disabled and the optional backend offline. Cleanup removed **only the eight marked frontend QA enquiry rows** from this follow-up, retained zero other frontend rows, left the log at **0 bytes / mode 0600**, and did not modify backend enquiry data. Real RFQ code and storage-versus-delivery messages were not modified. User visual approval, company-approved assets, actual notification receipt and the remaining launch requirements below are still separate gates.

---

## Prior photographic-refresh record (historical baseline)

**The remaining report documents the pre-animation photographic refresh at `41cc786`, restored by `f8533d6`. Statements below about manual-only selection, no initial hero canvas, near-study loading and a copy-free contained renderer describe that baseline, not the animation follow-up above. Its 118-pass result is historical.**

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
