# S Square — reference-led homepage QA

Review date: **2026-11-23**

Branch: `arena/8987795b-ssquare`

## Delivery status

The main homepage now follows the user's supplied [dark engineering reference](https://01a20dea-33ef-777b-8a75-6119f1c4765c.arena.site/), replacing the previous photography-led home. The real company logos, factual contact information and working enquiry system remain; the reference's simulated submit handler and unverified company-history/response-time claims were not copied.

The original four-section animation remains at **`/material-experience`**. The refreshed inner pages, catalog and detailed **`/products/aluminium`** story still work.

The **final production-build Chromium run completed 146 passing checks, six intentional duplicate-matrix skips and zero failures**: 152 configured cases, one worker, approximately **17.1 minutes**. A final five-size real-WebGL visual supplement also passed without application errors or document-width inflation. **Visual acceptance remains the user's decision.** These checks do not constitute unconditional production-launch approval.

## Reference adaptation

- Dark Rubber `#111a2b`, Steel `#22364d` and Aluminium `#4b5968` hero states, concentric rings, floating material fragments, large condensed material names and outline counters.
- Genuine S Square logo, compact site disclosure and a fixed translucent section-navigation pill with a moving active highlight; bottom placement on phones. Inner pages retain their existing full site navigation.
- Drag/flick snapping, raycast selection, arrows/keys, optional autoplay, circular colour changes and per-letter titles. A complete dwell follows each glide so first-frame shader work cannot cause an immediate material skip.
- Skippable logo introduction with an illustrative industrial still instead of remote sample footage. WebGL loading waits until the introduction ends; background content is inert while it is shown. Reduced motion and return visits bypass it.
- One renderer and one persistent selected component across the hero → **500svh pinned precision story** → matching dark material card → **260svh pinned spotlight**. Precision angles remain 0° / 180° / 360° / 720°, followed by a one-wave 20-fragment storm. Spotlight rotation, opposing SVG gears and an illustrative photo/parallax layer do not require another renderer.
- Three interactive material cards, three contextual product spotlights, four manufacturing-process steps and a filtered seven-family comparison. The comparison is expressly general guidance, not a guaranteed material specification.
- Navy quote area with contact links, an editable up-to-three-item pack and the **real inline `QuoteForm` / `/api/quote` flow**. Suggestions never overwrite an edited pack. Duplicates/removal, exact comparison-family labels and staged preparation remain possible. Preparation is not submission, an order or a payment.
- Pack changes do not replace typed form notes. Submitted selections are snapshotted with the saved reference even when the pack changes during an in-flight request. The combined notes/selection length is checked without truncating the visitor's text.
- Native page/touch scrolling on the new home; GPU back-pressure, visibility handling and disposal; demand-rendered spotlight changes. Card anchors track both CSS reveal motion and native horizontal strip scrolling. Pause snaps nonessential CSS motion to still content; live reduced motion removes WebGL and long pins while retaining all stories and controls.
- Labelled SVG fallbacks for unavailable/lost WebGL, local fonts and imagery, honest saved-versus-delivered feedback, direct contact alternatives and a readable no-JavaScript browsing/contact path.

Implementation: `features/journey/{MaterialJourney.tsx,journey-engine.ts,journey-scene.ts}` plus `features/reference/{ReferenceHeader,ReferenceIllustration,ReferenceSections,ReferenceQuote}.tsx`, `reference-data.ts` and `reference.css`. The original journey shares the controller/renderer with its original appearance. `QuoteForm.tsx` accepts optional selection items while retaining existing modal/contact-page behavior. `studio.css` and shared page introductions still style the inner pages.

This remains the existing **Next.js adaptation**, not a standalone single-file/base64-font export or a literal network-host-restricted page. No food artwork, remote intro video or third-party runtime script was used as an engineering asset.

## Build and dependency checks

| Check                                 | Result                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| Frontend `npm run typecheck`          | Pass                                                                            |
| Frontend `npm run build`              | Pass — Next.js 15.5.29; 19 generated static pages                               |
| Homepage framework estimate           | 202 B route / 130 kB first-load JS; 103 kB shared                               |
| Original material experience estimate | 184 B route / 130 kB first-load JS                                              |
| Frontend `npm audit`                  | **0 findings**, including development dependencies                              |
| Prettier / `git diff --check`         | Pass                                                                            |
| Optional backend                      | Unchanged, stopped and still deployment-blocked by the inherited findings below |

Barlow Condensed 600/700, Inter and DM Mono supply the main-home typography, served locally through Fontsource. Other existing local font families remain on the inner pages and original journey. Bundle estimates are **not** Lighthouse scores, load-time measurements or real-device performance guarantees.

## Browser test results

Sources: [`industrial-site.spec.ts`](../frontend/tests/industrial-site.spec.ts), [`material-journey.spec.ts`](../frontend/tests/material-journey.spec.ts), [`reference-home.spec.ts`](../frontend/tests/reference-home.spec.ts), [`studio-pages.spec.ts`](../frontend/tests/studio-pages.spec.ts). Configuration: [`playwright.config.ts`](../frontend/playwright.config.ts).

| Project              | Viewport                       | Result                                        |
| -------------------- | ------------------------------ | --------------------------------------------- |
| Desktop              | 1440 × 1000                    | 38 pass                                       |
| Tablet / touch       | 768 × 1024                     | 36 pass, 2 duplicate-matrix skips             |
| Mobile / touch       | 390 × 844                      | 36 pass, 2 duplicate-matrix skips             |
| Small mobile / touch | 320 × 844                      | 36 pass, 2 duplicate-matrix skips             |
| **Total**            | Production website, one worker | **146 pass, 6 intentional skips, 0 failures** |

Two supplemental layout matrices run once in the desktop project: one for the original immersive experience, one for the reference home/inner layouts. Their duplicate invocations in the other three projects are intentionally skipped. Both include **1440 × 900, 390 × 844, 320 × 844, 844 × 390 and 768 × 1024**.

### Main-home coverage

- Real-WebGL carousel, all three palette/title/counter states, genuine logo, local fonts, contextual hero quotation and one canvas/persistent UUID.
- Fractional drag, snapping, keys, autoplay dwell, pause and explicit selection while paused. A synthetic wheel check confirms the reference home does not prevent native wheel scrolling.
- Every pinned precision angle, 20-fragment storm, selected-card landing within the asserted tolerance and transfer of the **same traveller UUID** to the spotlight. Scroll changes the component/gears; idle spotlight rendering settles.
- Seven/four/two/one comparison rows for All/Rubber/Steel/Aluminium, exact family selection and preservation of independently typed requirements.
- Suggested pack autofill, removal, repeated materials, one-time suggestions and inline-form preparation without opening a fake checkout or inventing a submission.
- Mocked submission failure retains fields and selections, focuses the error and offers complete email/WhatsApp drafts. Pending-request edits do not alter the saved reference's selection snapshot. Oversized combined notes/pack fail locally without deleting or submitting the visitor's text.
- Isolated **actual API submissions** distinguish storage from delivery and provide direct dispatch links containing the selected family.
- Live reduced-motion changes remove/recreate the renderer without losing the material. Reduced motion unpins the spotlight and exposes four static precision articles. Unavailable WebGL and synthetic context loss restore labelled still views without blocking selection/enquiries.
- Intro Skip, deferred scene initialization and the required locally loaded font faces. No Google font request is required.
- Without JavaScript, the material cards, static stories, seven-row comparison and direct contact links remain; a native link reaches the rubber division. Interactive selection and forms are hidden or require JavaScript rather than pretending to work.
- **Zero axe WCAG 2 A/AA / 2.1 AA tagged violations** for each of the three home palettes, the menu and the inline form across the four projects. Low-contrast light-background accents/helper text and empty pack indices were corrected before the final run. Automated checks are a subset, **not** a conformance certification.

### Preserved site/experience coverage

- Eleven public routes, one main H1 per page, no horizontal document inflation, permanent legacy division redirects and removed commerce/auth/admin routes returning 404.
- Site-menu and inner product-disclosure keyboard operation, skip link, Escape handling, quote focus containment/restoration, catalog search/filter/reset, quick specs and contextual enquiry prefills.
- Contact-page success/failure handling, actual RFQ API validation/honeypot/status flags, and direct-dispatch alternatives.
- Original journey: one canvas, real-WebGL arc, drag/flick/keys, stable selected-object identity, pinned flips, storm, selected-card landing/tilt/poke and three-slot autofill/removal/duplicates/flights/modal quotation.
- Detailed aluminium story: near-viewport loading, four static reduced-motion stages and unavailable-WebGL fallback.
- Zero automated axe tagged violations on the core/inner routes and open quote dialog. No application `pageerror` events occurred in the final run. Site/inner-page tests deliberately invalidate third-party catalog photos to exercise labelled local fallbacks; this does not verify remote-photo availability after deployment.

## Final visual supplement

- Real-WebGL review at **1440 × 900, 390 × 844, 320 × 844, 768 × 1024 and 844 × 390**, with screenshots of the hero, precision story, material cards, spotlight, process, comparison, enquiry pack and inline form.
- At all five sizes, the renderer reached `ready`, only one canvas was present, the hero/spotlight UUID matched, reduced motion removed the canvas and document width stayed within the viewport. No application errors were captured.
- The selected part also followed native horizontal card-strip scrolling on the three portrait touch layouts; recorded DOM/renderer anchor differences were below 0.01 CSS px in this supplement.
- Opened the final desktop and phone hero, phone precision/spotlight, landscape hero and complete reduced-motion desktop overview for visual review. The landscape hero allows ordinary vertical scrolling rather than compressing its content into overlapping controls.
- Tooling/screenshots remain in ignored `.cache/qa/reference-review.mjs`, `reference-review.json` and `reference-*.png`; these are QA artifacts, not committed company assets or a real-device GPU benchmark.

## RFQ safety and operational limits

Outbound email/webhooks were disabled during QA and the optional backend remained offline. Actual test enquiries were marked `ARENA_QA` / `ARENA_QA_ONLY`. Cleanup removed **only 16 marked frontend QA records** from the intermediate/final runs, retained zero other frontend records and left the log at **0600**. Backend enquiry data was not modified.

**Local storage is not delivered mail or durable production CRM retention.** Provider acceptance does not establish inbox receipt. Production notification delivery, shared rate limiting, durable retention, monitoring, access controls and backups still require configuration and verification.

## Backend launch gate — unchanged

**Do not publicly deploy the optional inherited NestJS 10 backend until its dependencies are remediated and regression-tested.** Its previously recorded audit has **26 findings overall (11 high, 12 moderate, 3 low)** and **12 production findings (7 high, 5 moderate)**. `npm audit fix` did not resolve them; a forced framework migration was not included in this visual update. The frontend's freshly verified zero-finding audit does not remediate those backend dependencies. An API key, CORS restrictions and private networking are not dependency fixes.

The frontend can use a correctly configured email service or authenticated sales webhook without deploying that optional service. Backend/API security and persistence implementation are otherwise unchanged in this revision.

## Remaining approval and human checks

- User approval of the reference adaptation; company-approved photographs and representative CAD; identity/contact/inbox ownership, copy and usage permissions. The sample's unsupported “Since 2003”, guaranteed reply time and conflicting street number were not adopted.
- Actual provider acceptance **and inbox receipt**, durable production enquiry retention, privacy/legal wording and operational monitoring.
- Current Safari/iOS, Firefox, Chrome/Android, assistive technology and a real lower-powered phone. Headless Chromium/SwiftShader and touch emulation are not real-device performance tests; context-loss events are simulated.
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

Tests reuse an existing local server by default; otherwise Playwright starts a dev server. `QA_BASE_URL` can target an isolated preview. Set `QA_ALLOW_RFQ_WRITES=1` **only with outbound notifications disabled**, never against a live sales inbox. A custom browser path can be supplied through `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

See [README](../README.md), [launch checklist](LAUNCH-CHECKLIST.md), the `.env.example` files and [asset provenance](../frontend/public/images/ssquare/README.md) for deployment inputs. Secrets, runtime enquiries, browser tooling, traces and screenshots remain excluded from Git.
