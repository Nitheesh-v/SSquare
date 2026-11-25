# S Square — original slideshow restoration QA

Review date: **2026-11-23**

Branch: `arena/8987795b-ssquare`

## Selected version and scope

The user rejected the restored 3D material carousel and explicitly selected **“Your Trusted Partner…” — the original four-slide manufacturing slideshow**. The homepage now starts with **“Your Trusted Partner in Custom Metal & Rubber Solutions”**, using the dark background, Poppins typography, framed local imagery and four selector cards from `a835d41`.

Only the hero is replaced. The existing header, trust strip, photographic material cards, independent lower 3D study, manufacturing process, quote/contact panel, footer and inner pages are unchanged. The lower study retains its original Steel default and its own selection. Its full 3D journey link still reaches `/material-experience`.

The incorrect standalone material-carousel component, engine, stylesheet and dedicated tests have been removed. The full journey, its models and its tests are not removed; no old commerce routes, extra page sections, intro, fixed canvas or project brief are mounted on the homepage.

### Preservation evidence

- Every line from `.studio-trust-strip` through the end of `IndustrialHome.tsx` matches the pushed `95efb0a` version (and its earlier photographic baseline).
- A JavaScript-disabled DOM comparison found identical text, headings, image paths/alt text, links and buttons across all five below-hero blocks against the captured pre-restoration baseline.
- No changes to shared header/footer, `studio.css`, `ComponentInspector.tsx`, product routes, company data, assets, full journey or RFQ transport/storage implementation.
- The original layout/headlines are restored without reintroducing unapproved blanket QC percentages, numerical temperature/hardness guarantees or free/global delivery promises. Descriptions come from the existing reviewed `HERO_SLIDES`; delivery and inspection scope remain project-specific.

Implementation: `frontend/src/features/products/{HeroShowcase.tsx,hero-slideshow.css}` and the hero import in `frontend/src/features/studio/IndustrialHome.tsx`.

## Restored behavior

- Four slides: overview, rubber/bonded seals, stainless/alloy steel, and aluminium/die molds. Original headline, badge, picture, metrics and selector-card structure; all illustrative images are visibly labelled and remain local.
- Previous/next controls wrap in both directions. Direct selectors expose pressed state; Left/Right and Home/End work while a carousel control is focused.
- Original **5.5-second autoplay**, using a timeout rather than an animation/rendering loop. Hover/focus, quote/navigation dialogs, hidden tabs, an offscreen hero, explicit pause and reduced motion suspend it. Timer and observer cleanup occurs on unmount.
- One shared homepage pause still stops lower photo/scroll motion while deliberate slide changes and study rotation remain usable. Live reduced motion stops crossfades/autoplay without hiding content.
- All four slides open the actual RFQ modal with the matching editable division prefill; overview selects all three divisions. Escape closes the form and restores the trigger's focus. Nothing is submitted by slide selection.
- Without JavaScript, the overview image/copy, native catalog/phone links and `/contact#quote` link remain usable. Inert slideshow controls and the JS-only modal trigger are hidden.
- No WebGL canvas or 3D engine in the hero. The unchanged lower study still lazily mounts its own contained canvas; the detailed aluminium and full-journey routes retain their existing motion alternatives.

## Build and dependency checks

| Check                              | Result                                             |
| ---------------------------------- | -------------------------------------------------- |
| Frontend `npm run typecheck`       | Pass                                               |
| Frontend `npm run build`           | Pass — Next.js 15.5.29, 19 generated static pages  |
| Homepage framework estimate        | 9.7 kB route / 122 kB first-load JS; 103 kB shared |
| Full experience framework estimate | 7.77 kB route / 120 kB first-load JS               |
| Frontend audit                     | 0 findings, including development dependencies     |
| Formatting / `git diff --check`    | Pass                                               |
| Dependencies and lockfiles         | Unchanged                                          |

Fonts remain locally served through Fontsource. Poppins is scoped to this hero; typography and styling below it are unchanged. Bundle estimates and renderer caps elsewhere are not Lighthouse results or hardware-performance guarantees.

## Fresh browser regression run

The final production-build run of **all three affected test suites** completed **102 passes, 14 intentional skips and zero failures**, one worker, approximately **7.2 minutes**:

- [`original-slideshow.spec.ts`](../frontend/tests/original-slideshow.spec.ts)
- [`studio-pages.spec.ts`](../frontend/tests/studio-pages.spec.ts)
- [`industrial-site.spec.ts`](../frontend/tests/industrial-site.spec.ts)

| Project              | Viewport        | Result                            |
| -------------------- | --------------- | --------------------------------- |
| Desktop              | 1440 × 1000     | 27 pass, 2 skip                   |
| Tablet / touch       | 768 × 1024      | 25 pass, 4 skip                   |
| Mobile / touch       | 390 × 844       | 25 pass, 4 skip                   |
| Small mobile / touch | 320 × 844       | 25 pass, 4 skip                   |
| **Total**            | Production site | **102 pass, 14 skip, 0 failures** |

Skips: **eight explicitly disabled RFQ-write cases** and **six duplicate layout-matrix invocations**. Each of the two affected five-size matrices runs once in desktop. Successful actual storage/delivery was not re-tested; no live enquiry was submitted.

Coverage:

- Hero-first placement, four local image planes, original Poppins heading, all selector/headline/image updates, wrapping arrows, keyboard navigation and native catalog links.
- All four contextual quote prefills, keyboard modal access and focus restoration.
- Autoplay timing/hover/focus/dialog/menu behavior with Playwright's controlled clock; simulated visibility and offscreen suspension; live reduced-motion changes and no-JavaScript quote/catalog/contact paths.
- Independent lower study, lazy loading, scroll/drag/button rotation, shared pause and unavailable/lost-WebGL fallback.
- Public and removed routes, redirects, catalog filters/quick specs, mocked RFQ failure retention and detailed aluminium-story motion/fallback checks.
- Zero axe WCAG 2 A/AA / 2.1 AA tagged violations on the checked core and inner pages and open RFQ dialog across all four projects. This is automated subset coverage, not accessibility conformance certification.

No application `pageerror` events occurred. Existing tests deliberately fail remote catalog images to exercise labelled fallbacks; the restored hero uses local files only.

The unchanged dedicated `material-journey.spec.ts` animation suite was **not rerun in this restoration**. Public-route and inner-page axe smoke coverage includes `/material-experience`; its source/models and detailed regression tests remain unchanged.

## Visual and responsive supplement

All four slides were browser-checked at **1440 × 900, 390 × 844, 320 × 844, 768 × 1024 and 844 × 390**. At every size:

- Active local images loaded successfully.
- Heading/control bounds stayed inside the viewport width; document width equalled viewport width.
- No application errors or hero canvas.

Desktop and mobile screenshots were inspected, including the stacked mobile layout and full-page context. Tablet/phone/landscape use the original vertically stacked presentation and ordinary native page scrolling, not a fixed-height cropped slide. The rest of the homepage is not replaced by the old page layout.

Screenshots, layout/image checks and logs are in ignored `.cache/qa/original-hero/`; they are not application assets. Touch emulation, controlled-clock and synthetic visibility/context-loss tests do not replace real hardware/browser/assistive-technology checks.

## RFQ and production safety

Outbound email/webhooks were disabled, the optional backend remained offline, and `QA_ALLOW_RFQ_WRITES=0` was explicit. The frontend fallback log remains **0 bytes**, mode **0600**; no cleanup was needed. RFQ code and backend enquiry data were not changed.

**Saved is not delivered.** Local files are not durable production CRM storage; provider acceptance does not establish inbox receipt. Durable retention, actual notification receipt, shared rate limiting, monitoring, access controls and backups remain separate launch requirements.

### Unchanged backend gate

Do not publicly deploy the optional inherited NestJS 10 backend until dependency remediation and regression testing. Its previously recorded audit has **26 findings overall (11 high, 12 moderate, 3 low)** and **12 production findings (7 high, 5 moderate)**. This hero-only restoration did not re-audit or remediate that service. Frontend audit results do not resolve those findings.

### Remaining human checks

User approval of this specifically selected original hero; company-approved imagery/copy/CAD and usage permissions; Safari/iOS, Firefox, Android, assistive technology and a real lower-powered phone. Actual provider acceptance **and inbox receipt**, durable production retention, privacy/legal wording, secure deployment and operational monitoring remain launch gates.

## Reproduce

```sh
cd frontend
npm ci
npx playwright install chromium
npm run typecheck
npm run build
# Start the production site separately, then reproduce this change's regression run:
QA_ALLOW_RFQ_WRITES=0 npx playwright test tests/original-slideshow.spec.ts tests/studio-pages.spec.ts tests/industrial-site.spec.ts
# The complete repository suite is available with npm run test:e2e.
```

Playwright reuses an existing local server by default or starts a dev server. `QA_BASE_URL` targets an isolated preview; `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` supports a custom Chromium binary. Enable actual RFQ write tests only on an isolated instance with outbound notifications disabled, never against a live inbox.

See [README](../README.md), [launch checklist](LAUNCH-CHECKLIST.md), `.env.example` files and [asset provenance](../frontend/public/images/ssquare/README.md). Secrets, runtime enquiries, builds, dependencies, traces and screenshots remain excluded from Git.
