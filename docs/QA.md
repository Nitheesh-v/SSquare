# S Square — hero-only restoration QA

Review date: **2026-11-23**

Branch: `arena/8987795b-ssquare`

## Current scope

The user selected the **earlier 3D material carousel** to replace the photographed “Small parts. Big possibilities.” hero. Only the first homepage section has been replaced. The carousel starts with **Rubber**, followed by Steel and Aluminium, using the earlier warm material colours, large titles and illustrative component arc.

The existing header, photographic material cards, independent lower 3D study, manufacturing process, quote/contact panel, footer, catalog and inner pages are unchanged. The shared homepage pause still reaches the lower study/photo planes. The lower study retains its original Steel default and its own material selection.

This does **not** restore the previously reverted sitewide motion package or the entire old journey homepage. There is no homepage intro/body lock, fixed journey canvas, travelling object over lower sections, pinned extra story, navigation rail or project brief. The complete experience remains unchanged at `/material-experience`; the detailed aluminium story remains at `/products/aluminium`.

### Content-preservation evidence

- Every source line from `.studio-trust-strip` to the end of `IndustrialHome.tsx` matches the pre-change `17ba6a2` version.
- A JavaScript-disabled DOM comparison against the running pre-change production site found identical text, headings, image paths/alt text, links and buttons in all five below-hero blocks.
- No changes to the shared header/footer, `studio.css`, `ComponentInspector.tsx`, product routes, company data, assets, full journey or RFQ implementation.

## Restored hero

- A standalone, clipped **absolute-positioned hero canvas**, never a fixed viewport overlay. Initial normal-motion home mounts only this canvas; the unchanged lower study mounts its own canvas near the viewport.
- Original procedural rubber gasket, steel flange and aluminium profile, plus repeated arc items and clearly labelled replaceable-CAD illustrations. No production specifications or company-photography claims are invented.
- Fractional horizontal drag/flick with snapping, geometry-based picking, previous/next buttons, direct selectors, left/right keys and Home/End. Native vertical scrolling is not intercepted.
- Optional 3.2-second autoplay with visible toggle and global homepage pause. Focus/hover on controls, open navigation/quote dialogs, offscreen state and document visibility suspend automatic advancement. Heading announcements are polite during focused/manual use rather than continuous autoplay announcements.
- Pause stops automatic motion/transitions while deliberate material changes and actual contextual RFQs remain usable. The lower study's deliberate rotation remains available.
- Live reduced motion removes WebGL and nonessential transitions, retains selection and provides still SVGs. Unavailable/lost WebGL uses the same fallback without blocking enquiry controls.
- Resize temporarily exposes the SVG fallback while the WebGL buffer is redrawn. Renderer, observers, listeners, idle callbacks, timers and animation frames are cleaned up on unmount or reduced-motion changes.
- With JavaScript disabled, the hero has a still Rubber illustration, hides inert carousel controls and provides a native `/contact#quote` link. Existing product-page and direct-contact links remain usable below.

Implementation: `frontend/src/features/studio/{IndustrialHome.tsx,MaterialCarouselHero.tsx,material-carousel.ts,material-carousel.css}`. The hero reuses the **unmodified** `features/journey/{journey-data.ts,journey-scene.ts,ComponentIllustration.tsx}`; it does not mount `MaterialJourney` or run `journey-engine.ts`.

## Build and dependency checks

| Check                                  | Result                                             |
| -------------------------------------- | -------------------------------------------------- |
| Frontend `npm run typecheck`           | Pass                                               |
| Frontend `npm run build`               | Pass — Next.js 15.5.29, 19 generated static pages  |
| Homepage framework estimate            | 9.6 kB route / 122 kB first-load JS; 103 kB shared |
| Full experience framework estimate     | 6.83 kB route / 119 kB first-load JS               |
| Frontend `npm audit --audit-level=low` | 0 findings, including development dependencies     |
| Formatting / `git diff --check`        | Pass                                               |
| Dependencies and lockfiles             | Unchanged                                          |

Fonts are locally served through Fontsource. The restored hero uses Archivo Black / Inter / DM Mono; typography below it is unchanged. Bundle/DPR/frame-rate figures are not Lighthouse results or real-device performance guarantees.

## Browser test evidence

Sources: [`material-carousel.spec.ts`](../frontend/tests/material-carousel.spec.ts), [`studio-pages.spec.ts`](../frontend/tests/studio-pages.spec.ts), [`industrial-site.spec.ts`](../frontend/tests/industrial-site.spec.ts) and the unchanged [`material-journey.spec.ts`](../frontend/tests/material-journey.spec.ts).

The production-build full run had **142 passes, 17 intentional skips and one drag-test synchronization failure** (160 configured cases, one worker, approximately 20.4 minutes). The failing assertion sampled a newer in-flight position while treating an older integer GPU frame as settled. The helper was corrected to wait for **both simulation and rendered positions**. The corrected drag/picking/keyboard test then passed **12/12 repeated cases**, three runs in each of the four projects, with no application changes required.

The final autoplay/focus/dialog/navigation checks also passed **4/4 projects** after that helper correction. Thus **all 143 distinct non-skipped cases passed across the full run and corrected targeted reruns**. There was **not** a fresh, single clean full-suite run after that test-only correction; this is not described as one.

| Project              | Viewport    | Full run                                   | Corrected drag repeat |
| -------------------- | ----------- | ------------------------------------------ | --------------------- |
| Desktop              | 1440 × 1000 | 37 pass, 2 skip, 1 synchronization failure | 3/3 pass              |
| Tablet / touch       | 768 × 1024  | 35 pass, 5 skip                            | 3/3 pass              |
| Mobile / touch       | 390 × 844   | 35 pass, 5 skip                            | 3/3 pass              |
| Small mobile / touch | 320 × 844   | 35 pass, 5 skip                            | 3/3 pass              |

Skips: **eight explicitly disabled RFQ-write cases**, plus **nine duplicate layout-matrix invocations**. Each of the three five-size layout matrices runs once in desktop instead of repeating in every project. RFQ selection, form focus, close/restore behavior and mocked submission-failure retention were exercised; successful actual storage/delivery was not re-tested in this change.

Coverage includes:

- Hero-first placement, at least seven real-WebGL arc items, stable selected-object identity, colour/title/count updates, drag/flick, picking and keyboard operation.
- Independent lower study, lazy loading, native-scroll/drag/button rotation, pause and context-loss fallback.
- Autoplay focus/dialog/menu suspension, offscreen render suspension, simulated hidden-tab lifecycle, unavailable/lost WebGL and live reduced-motion changes.
- All three real material-specific quote prefills and focus restoration; a native no-JavaScript contact-page quote link.
- Public/removed routes and legacy redirects, catalog filters/spec dialogs, truthful mocked RFQ failures, the aluminium story and full material experience/brief regression coverage.
- Zero axe WCAG 2 A/AA / 2.1 AA tagged violations on the checked core and inner pages and open RFQ dialogs across all four projects. Automated scans are a subset, not accessibility conformance certification.

No application `pageerror` events were observed in these tests. Third-party catalog photos are intentionally made unavailable in the existing site tests to exercise their labelled fallbacks.

## Visual, responsive and native-scroll supplement

The final production hero was browser-reviewed with all three materials at **1440 × 900, 390 × 844, 320 × 844, 768 × 1024 and 844 × 390**. At every size:

- Real WebGL reached `ready`; material titles stayed inside the viewport width.
- Document width equalled viewport width; no horizontal inflation or application errors.
- The canvas remained absolute and clipped to the hero, not over the unchanged lower content.

The landscape hero keeps a readable 500px minimum height, with ordinary vertical page scrolling, instead of shrinking controls to an unusable strip. Automated layout checks also verify title/control bounds in reduced motion. A Chromium touch-input supplement scrolled the page **189 CSS pixels** with a vertical swipe over the live carousel and left Rubber selected.

Review scripts, screenshots, baseline content capture and logs are in ignored `.cache/qa/hero-restore/`; they are not application assets. SwiftShader/touch emulation and synthetic context-loss/visibility events do not replace real hardware/browser/assistive-technology checks.

## RFQ and production safety

Outbound email/webhooks were disabled, the optional backend remained offline, and `QA_ALLOW_RFQ_WRITES=0` was explicit for this QA. No live sales enquiry was submitted. The frontend fallback log remains **0 bytes**, mode **0600**; no enquiry cleanup was needed. RFQ transport/storage code and backend data were not changed by this implementation.

**Saved is not delivered.** Local files are not a durable production CRM; provider acceptance does not establish inbox receipt. Production notification delivery, durable retention, shared rate limiting, monitoring, access controls and backups remain separate configuration/verification requirements.

### Unchanged backend launch gate

Do not publicly deploy the optional inherited NestJS 10 service until dependency remediation and regression testing. Its previously recorded audit has **26 findings overall (11 high, 12 moderate, 3 low)** and **12 production findings (7 high, 5 moderate)**. This hero restoration did not re-audit or remediate that service. The frontend's zero-finding audit does not resolve those backend findings.

### Remaining approval and human checks

User approval of the restored hero, company-approved CAD/photos/copy, current Safari/iOS and Firefox/Android testing, assistive-technology review and a real lower-powered phone are still needed. Actual provider acceptance **and inbox receipt**, durable production retention, privacy/legal wording, secure deployment and operational monitoring remain launch gates.

## Reproduce

```sh
cd frontend
npm ci
npx playwright install chromium
npm run typecheck
npm run build
# Start the production site separately, then:
QA_ALLOW_RFQ_WRITES=0 npm run test:e2e
```

Playwright reuses an existing local server by default or starts a dev server. `QA_BASE_URL` targets an isolated preview; `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` supports a custom Chromium binary. Enable `QA_ALLOW_RFQ_WRITES=1` only on an isolated test instance with outbound notifications disabled, never against a live inbox.

See [README](../README.md), [launch checklist](LAUNCH-CHECKLIST.md), `.env.example` files and [asset provenance](../frontend/public/images/ssquare/README.md). Secrets, runtime enquiries, dependencies, builds, traces and screenshots remain excluded from Git.
