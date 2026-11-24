# S Square — travelling-component homepage QA

Review date: **2026-11-23**

Branch: `arena/8987795b-ssquare`

## Delivery status

The live preview now has the four-section animation pattern adapted to **Rubber, Steel and Aluminium**, not the fictional food brand. **The final production-build Chromium run passes 81 checks, with three intentional duplicate-matrix skips and no failures** (84 configured cases, one worker, approximately 9.9 minutes).

This is a verified preview, **not unconditional production-launch approval**. Company-approved imagery/CAD/copy, real-device/cross-browser review, operational enquiry delivery/retention and the optional backend dependency gate remain. See [the launch checklist](LAUNCH-CHECKLIST.md).

## What changed

1. **Materials:** seven visible genuine 3D components on a repeating arc; live drag/flick and raycast selection, arrows, optional 3.2s autoplay, per-letter title transitions, outline counter and a feathered circular material-colour reveal. The actual S Square logo has a short, skippable first-visit entrance. There is no food-video asset or invented nutrition information.
2. **Inside:** the selected component retains the same Three.js object identity while travelling into a native-scroll pinned four-step frame. Time-based sine flips reach 0°, 180°, 360° and 720°. The final segment darkens the background, spins the object and sends one wave of 20 material fragments outward.
3. **Divisions:** that same component lands on the selected division card's DOM anchor. Its position, height, tilt and squash follow the card. Other cards use SVGs of the illustrative parts. The updated rubber reference image remains labelled as AI-generated/illustrative rather than being presented as an approved company photo.
4. **Your brief:** the three-slot builder starts with the active material and the next two; supports removals, duplicate choices, counts, glow and flights to a brief badge. The completed combination flies in sequence, then opens the actual RFQ with a contextual prefill. It does not create a cart/order, imply an approved quotation, automatically submit an enquiry or clear the visitor's editable selection.

The detailed aluminium/CAD story is preserved on **`/products/aluminium`**; `S_SQUARE_CAD_MODEL_URL` still applies there, not to the three homepage models. The genuine primary navigation, dark-navy footer and direct phone/WhatsApp paths are retained.

## Build and dependency checks

| Check                                 | Result                                                                                                                     |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Frontend `npm run typecheck`          | Pass                                                                                                                       |
| Frontend `npm run build`              | Pass — Next.js 15.5.29; 18 generated static pages                                                                          |
| Homepage build estimate               | 11.7 kB route / 119 kB first-load JS; 103 kB shared                                                                        |
| Frontend `npm audit`                  | **0 findings**, including development dependencies                                                                         |
| Prettier and `git diff --check`       | Pass                                                                                                                       |
| Proposed-text credential-pattern scan | No private key/provider/GitHub token patterns found; not a dedicated secret scanner                                        |
| Optional backend                      | Unchanged; stopped in this preview. Previous build passed, but deployment remains blocked by the dependency findings below |

Archivo Black 400, Inter variable and DM Mono 400/500 are self-hosted through Fontsource with swap display. Tests load/check all four required font faces. New home assets and scripts are local to the application; no Higgsfield/CDN request, protein-bar sprite or remote intro video is needed. Other unchanged catalog pages still use official-site photos with labelled local fallbacks.

Build sizes are framework estimates, **not** Lighthouse scores or real-device speed guarantees.

## Automated browser results

Sources: [`industrial-site.spec.ts`](../frontend/tests/industrial-site.spec.ts), [`material-journey.spec.ts`](../frontend/tests/material-journey.spec.ts). Configuration: [`playwright.config.ts`](../frontend/playwright.config.ts).

| Project              | Viewport                       | Result                                       |
| -------------------- | ------------------------------ | -------------------------------------------- |
| Desktop              | 1440 × 1000                    | 21 pass                                      |
| Tablet / touch       | 768 × 1024                     | 20 pass; one duplicate matrix skip           |
| Mobile / touch       | 390 × 844                      | 20 pass; one duplicate matrix skip           |
| Small mobile / touch | 320 × 844                      | 20 pass; one duplicate matrix skip           |
| **Total**            | Production website; one worker | **81 pass, 3 intentional skips, 0 failures** |

The supplemental layout matrix runs **once** from the desktop project at **1440 × 900, 390 × 844, 320 × 844, 844 × 390 and 768 × 1024**. Its three duplicate invocations are explicitly skipped, not silently treated as passed.

Coverage includes:

- Ten public pages, one main H1, viewport-relative page-overflow checks, permanent legacy material redirects and removed commerce/auth/admin routes returning 404.
- Disclosure/mobile navigation, skip link, Escape handling, manual material selection, contextual quote fields, modal focus containment and focus restoration.
- Catalog filter/search/reset, keyboard-opened component details and product-specific quotation prefills.
- Actual isolated QA RFQ writes with backend/local persistence reported separately from delivery; direct WhatsApp/email handoffs and 320px success-state overflow checks.
- Mocked RFQ failure retains contact/drawing notes, focuses the error and offers direct-contact alternatives. The mock does not send or store a real enquiry.
- The preserved aluminium scene's near-viewport lazy load, four accessible static stages, live reduced-motion transition and unavailable-WebGL drawing.
- **Zero axe WCAG 2 A/AA / 2.1 AA tagged violations** on home, catalog, contact, FAQ and the open quote dialog across the four projects. This is an automated subset, **not** WCAG conformance certification.
- RFQ bounds/validation/honeypot and truthful response flags.
- A single home WebGL canvas with at least seven visible arc instances; material/title/colour/counter changes; unchanged traveller UUID; stable rendering when paused; live reduced motion removes the canvas.
- Fractional drag tracking, pointer release/flick snapping and keyboard material changes.
- Correct pinned flip endpoints, a 20-piece non-looping scroll burst, frame fade and no storm after the section ends.
- Exact selected-card landing coordinates/height within **one CSS pixel**, with the same object identity, hidden flat live-card SVG, card tilt and poke interaction.
- Card-to-brief flights, the automatic initial brief, removals/repeated material choices, sequential three-part flight and the precise three-material RFQ prefill. No cart or checkout links are introduced.
- First-visit intro Skip unlocks the body; the four required fonts load; unavailable/lost home WebGL restores the SVGs without blocking the quote dialog.
- New rubber imagery and persistent illustrative labels remain on the home references, division index and rubber material page.

There were no application `pageerror` events in the final run. Third-party catalog photos are deliberately made invalid in the original site suite to exercise fallbacks; cached local references still load normally. Outbound email/webhooks are disabled and the optional backend is offline, exercising the frontend's local recovery path. Test RFQs are explicitly marked `ARENA_QA`; cleanup removes only those marked records, preserving other local data.

## Supplementary visual / fallback review

- Reviewed 1440px/390px screenshots through the hero, front/back story steps, storm, selected-card landing and brief. Other hero items fade out before the pinned story; only the traveller continues.
- Additional real-WebGL layouts checked at **320 × 844, 844 × 390 and 768 × 1024**. Document width matches the configured width; the long Aluminium title and Request a Quote action remain within viewport bounds. No application errors occurred.
- A **JavaScript-disabled 390px** check exposes four readable story articles, three division cards and direct phone links, with no horizontal page overflow. Interactive selection/quote dialogs still require JavaScript; direct contact and division-page links do not.
- Supplementary card measurements at 1440px and 390px match the traveller's centre/height to the selected DOM anchor. The phone snap strip is intentionally internally scrollable; the page itself is not horizontally inflated.
- The intro was adjusted so shader compilation cannot block Skip. GPU fence/back-pressure avoids accumulating obsolete render frames on slow/software GPUs.

## Runtime and accessibility design

`MaterialJourney.tsx` composes the four sections. `journey-engine.ts` owns scroll/gesture/time state and DOM anchors. `journey-scene.ts` owns one dynamically loaded renderer, shared geometry, its instance pool and one persistent traveller. Inline component/fragment SVGs are original illustrative artwork, not actual company CAD or photographed offcuts.

The renderer starts after entering/skipping the intro, is capped at **45fps desktop / 30fps phone**, uses DPR caps of **2 / 1.75**, stops when the scene is no longer visible or the tab is hidden, and releases resources/listeners on unmount. An idle float/bob is intentional while the visible journey is active. Pause stops autonomous motion and autoplay. Reduced motion bypasses the intro, slides, circle reveal, float, flips, storm and flights, exposes the four static story articles and preserves all usable links/controls.

Native touch/keyboard scrolling is preserved. Desktop fine-pointer wheel gliding yields to keys/pointer presses, dialogs, ctrl/sideways wheels, inputs, coarse pointers, reduced motion and the intro lock. These behaviours and headless software WebGL are not proof of smooth performance on every device.

## Backend / delivery launch gate (unchanged)

**Do not publicly deploy the optional inherited NestJS 10 backend until its dependencies are remediated and regression-tested.** The earlier audit reports **26 findings overall (11 high, 12 moderate, 3 low)** and **12 production findings (7 high, 5 moderate)**, including framework/parser/transitive advisories. `npm audit fix` did not resolve them; a blind forced major migration was not performed during a visual update. An API key, CORS restrictions and private networking do not fix vulnerable dependencies.

The preceding redesign verified keyed storage/DTO rejection, removed commerce endpoints, production fail-closed behaviour, key forwarding, 0600 local log permissions and 413/405/429 API paths. Those backend/API files are unchanged here. Current RFQ tests again verify local storage and explicitly false delivery flags with notifications disabled.

The frontend can use a correctly configured email provider or authenticated sales webhook without deploying the optional backend. **Local storage is not delivered mail or durable production CRM retention.** Provider acceptance alone does not guarantee inbox receipt. Verify real delivery, retention, access controls, monitoring, shared rate limiting and backups before launch.

## Still requires approval / human verification

- Company-approved photographs, representative CAD for all three home components, manufacturing copy, address/contact/inbox ownership and usage permissions.
- Real email/webhook acceptance **and inbox receipt**; no live provider is configured in this preview.
- Production database / multi-instance durability, retention and operational monitoring.
- Current Safari/iOS, Firefox, Chrome/Android, assistive technology and a real lower-powered mobile device. Touch emulation is not a hardware/GPU benchmark; context-loss checks simulate the UI event, not hardware recovery.
- Final visual approval, shared/edge abuse protection, HTTPS/network isolation and privacy/legal wording.

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

Tests reuse an existing local server by default; otherwise Playwright starts the dev server. `QA_BASE_URL` targets another test preview. Only on an isolated instance **with notifications disabled**, enable `QA_ALLOW_RFQ_WRITES=1` for the eight real-write cases. Never use write tests against a live sales inbox. A custom sandbox Chromium path can be supplied with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

Launch inputs and secret configuration are in [README](../README.md), [the launch checklist](LAUNCH-CHECKLIST.md), the two `.env.example` files and [the asset provenance notes](../frontend/public/images/ssquare/README.md). Secrets, runtime enquiries, browser tooling, traces and screenshots are excluded from Git.
