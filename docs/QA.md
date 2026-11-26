# S Square — reference homepage content QA

> **Update 2026-11-26 (current branch `arena/3f84f276-ssquare`, latest visual review):** the homepage uses an auto-advancing three-station “aperture ring” (Rubber / Steel / Aluminium), an optional WebGL backdrop, a canvas ring and a fixed atmosphere that changes colour, grid geometry, orbit/sweep tempo and WebGL geometry by scroll chapter. The first station still opens with a locally generated black-and-white industrial-gear image, and now carries the S SQUARE introduction (brand title and copy) as the first station before Steel and Aluminium; hero copy/tabs share the exact `.studio-shell` gutter. The user asked for the **main-branch footer** — the shared `Footer.tsx`, `studio.css` and `(store)/layout.tsx` are byte-identical to `main` on this branch, so main's footer is what renders, removal of the **Bench / “DRAWN. MACHINED. VERIFIED.”** section and removal of the giant `S SQUARE` wordmark. Services follows the connected Google Drive `Ssquare/animation video.mp4` and pasted HTML through four locally generated photoreal frames played by scroll (no video file, no remote asset): a sticky stage, cross-faded and slowly pushed frames, progress HUD and three switching cards. The earlier procedural Three.js truck was rejected by the user as unrealistic and has been removed. The homepage order is now hero intro (S SQUARE) → three product cards → About → What We Do → Services → facts → Quick Service. The user explicitly chose the **literal HTML service copy** (`100% CONFORMITY`, `FREE DOOR DELIVERY`, `DHL / FEDEX · 3–4 DAYS`) for those cards; it is user-supplied reference copy and was not independently verified. The earlier “current company details” decision still applies to the static facts and other pages, but not to these three service cards. The four-slide `HeroShowcase` and `IrisBench` sources are retained unmounted. The historical review below describes the *previous* static homepage build; its “no canvas / no animation / four-slide hero / no blanket claims” statements are superseded by this note. Current suites are `homepage-content.spec.ts`, `aperture-hero.spec.ts`, `studio-pages.spec.ts` and `industrial-site.spec.ts`. `npm run typecheck`, `npm run build` and local dev smoke checks are re-run after this refinement; browser regression numbers below were recorded before the animation changes and have not been re-run in this sandbox because Chromium downloads are blocked (`cdn.playwright.dev` egress fails, including an attempted npm browser package fallback).


Review date: **2026-11-23**

Branch: `arena/8987795b-ssquare`

## Request and company-detail decision

The user supplied a full-page screenshot (`image-10.png`) and asked to put the same content on the homepage. The selected original four-slide **“Your Trusted Partner in Custom Metal & Rubber Solutions”** hero, restored in `64708b0`, is retained without changes to its component or stylesheet.

The user initially chose **“Keep current company details”** when asked about conflicting counters and legacy service claims. The static homepage facts therefore use **20+ years of experience**, **three material disciplines**, and **Coimbatore, India**, and other pages retain project-specific quotation terms. In the later visual review the user explicitly overrode this for the three Services cards, selecting the literal pasted HTML copy with **100% conformity** and **free worldwide 3–4-day DHL/FedEx delivery**; those claims are user-supplied reference copy and were not independently audited. See the current-branch note at the top of this file.

## Implemented scope

Homepage order:

1. Existing original four-slide hero and trust strip.
2. **About Us / Who We Are** — custom rubber, steel and aluminium manufacturing, industrial/commercial/OEM clients, tailor-made solutions and long-term partnerships; local machining photo and real `/about` link.
3. **Explore Our Products** — Aluminium Products, Steel Products, Rubber Products, in the reference's order and linked to their existing division pages.
4. **What We Do** — the reference's four manufacturing capabilities, specification-led supporting copy, local aluminium-tooling photo and `/about` link.
5. **Our Services** — a sticky 270vh 3D truck journey with numbered CUSTOMIZATION, QUALITY ASSURANCE and FREE DOOR DELIVERY cards using the user-selected literal reference copy.
6. Static company-facts band — no counting animation or intermediate values.
7. Split photography/crimson **Quick Service on Your Needs / Call Monday – Saturday** — genuine phone/email, Peelamedu location and progressively enhanced quote link.
8. Existing shared company/footer description, quick links, genuine address and contacts.

This content replaces the former lower homepage study, process and project/contact panel. The contained `ComponentInspector` source is retained but no longer mounted. No canvas, travelling object, intro, particle sequence or project brief is mounted on the homepage. The full 3D experience remains unchanged at `/material-experience`, accessible from the existing footer; the detailed aluminium story remains on `/products/aluminium`.

Implementation: `frontend/src/features/studio/IndustrialHome.tsx` and new scoped `home-content.css`. No changes to shared `studio.css`, header/footer, company data, shared material metadata, photo assets, RFQ transport/storage, backend, product routes or full-journey source/models. The existing material-card reveal/photo-plane enhancement and shared pause remain; new editorial, service, facts and contact sections introduce no animation.

## Content and interaction checks

- Exact new section order, three product headings, four capabilities, three service headings and current facts are asserted in the new homepage suite. Changing the hero slide does not filter or change the lower content.
- Both About links and all three product-card destinations reach the real existing pages. No commerce/account/admin route is reintroduced.
- The machining/tooling images reuse local copies from S Square's published site. Rubber imagery is visibly labelled illustrative. Deliberately unavailable official photos fall back to local illustrations with labels rather than a broken or falsely attributed image. Asset provenance remains in `frontend/public/images/ssquare/README.md`.
- Quick Service phone/email links use the genuine company details. The quote link has a native `/contact#quote` destination; ordinary activation with JavaScript opens the existing RFQ dialog with all three material divisions prefilled and editable. Escape closes it and restores focus. New-tab/modifier behavior is not intercepted by the implementation.
- Without JavaScript, all new headings, copy, capabilities, product links, company facts and Quick Service contact/quote links remain available. Existing hero catalog/phone/quote-page links remain usable; inert slideshow controls are hidden.
- The original four-slide navigation, wrapping arrows, keyboard selection, contextual RFQs, 5.5-second autoplay, shared pause, live reduced-motion response and hover/focus/menu/dialog/offscreen/hidden-tab suspension are regression-tested.

## Build and dependency checks

| Check                              | Result                                              |
| ---------------------------------- | --------------------------------------------------- |
| Frontend `npm run typecheck`       | Pass                                                |
| Frontend `npm run build`           | Pass — Next.js 15.5.29, 19 generated static pages   |
| Homepage framework estimate        | 8.14 kB route / 119 kB first-load JS; 103 kB shared |
| Full experience framework estimate | 9.16 kB route / 120 kB first-load JS                |
| Fresh frontend `npm audit`         | 0 findings, including development dependencies      |
| Formatting / `git diff --check`    | Pass                                                |
| Dependencies and lockfiles         | Unchanged                                           |

Fonts remain locally served through Fontsource. Poppins remains scoped to the hero; Inter, Barlow Condensed and IBM Plex Mono supply the lower editorial presentation. Bundle estimates are framework output, not Lighthouse results or hardware-performance guarantees.

## Fresh production-build browser regression run

The final run of all **four affected suites** completed **107 passes, 17 intentional skips and zero failures**, one worker, approximately **5.9 minutes**:

- [`homepage-content.spec.ts`](../frontend/tests/homepage-content.spec.ts)
- [`aperture-hero.spec.ts`](../frontend/tests/aperture-hero.spec.ts)
- [`studio-pages.spec.ts`](../frontend/tests/studio-pages.spec.ts)
- [`industrial-site.spec.ts`](../frontend/tests/industrial-site.spec.ts)

| Project              | Viewport        | Result                            |
| -------------------- | --------------- | --------------------------------- |
| Desktop              | 1440 × 1000     | 29 pass, 2 skip                   |
| Tablet / touch       | 768 × 1024      | 26 pass, 5 skip                   |
| Mobile / touch       | 390 × 844       | 26 pass, 5 skip                   |
| Small mobile / touch | 320 × 844       | 26 pass, 5 skip                   |
| **Total**            | Production site | **107 pass, 17 skip, 0 failures** |

Skips: **eight explicitly disabled RFQ-write cases** and **nine duplicate supplemental-layout invocations**. Three five-size matrices each run once in the desktop project: original slides/controls, new homepage content/actions, and inner-page layouts. Storage and actual notification delivery were not re-tested; no live enquiry was submitted.

Additional regression coverage includes public and removed routes, legacy redirects, navigation/dialog keyboard focus, catalog filters/quick specs/prefills, mocked RFQ failure retention, and the detailed aluminium story's lazy loading, live reduced motion and unavailable-WebGL alternative. Former homepage-only inspector tests are replaced with the requested content coverage because that surface is no longer mounted.

Axe found **zero WCAG 2 A/AA / 2.1 AA tagged violations** on the checked core/inner pages and open quote dialog in all four projects. No application `pageerror` events occurred. This is automated subset coverage, not accessibility-conformance certification.

The unchanged dedicated `material-journey.spec.ts` animation suite was **not rerun for this content change**. Public-route and inner-page axe smoke checks include `/material-experience`; its source/models and detailed regression tests remain unchanged.

## Visual and responsive supplement

Layout/image checks cover **1440 × 900, 768 × 1024, 390 × 844, 320 × 844 and 844 × 390**:

- One homepage and one selected hero; no horizontal overflow or clipped new headings/contact actions.
- Active local images loaded at every size; labelled fallback behavior also has dedicated tests.
- Readable stacked editorial/service/facts/contact layouts on smaller widths.
- Static facts and no new-section animations under reduced motion; no homepage canvas, including after scrolling to Quick Service.

Desktop and phone section/viewport screenshots were inspected, including native footer contact links. Very tall headless full-page mobile captures showed compositor artifacts; phone review used section/viewport captures and DOM structure checks instead of treating those artifacts as duplicated page content. Screenshot artifacts are not application assets.

Logs, layout/image reports and review captures are in ignored `.cache/qa/homepage-content/`. Emulated touch, SwiftShader rendering, controlled-clock and synthetic visibility tests do not replace real devices, browsers or assistive-technology review.

## RFQ and production safety

Outbound email/webhooks were disabled, the optional backend remained offline, and `QA_ALLOW_RFQ_WRITES=0` was explicit. The new Quick Service interaction test blocks/counts any quote POST and confirms zero submissions from opening/editing/closing the dialog. The frontend fallback log remains **0 bytes**, mode **0600**. RFQ transport/storage implementation and backend enquiry data were not changed.

**Saved is not delivered.** Local files are not durable production CRM storage; provider acceptance does not establish inbox receipt. Durable retention, actual notification receipt, shared rate limiting, monitoring, access controls and backups remain separate launch requirements.

### Unchanged backend gate

Do not publicly deploy the optional inherited NestJS 10 backend until dependency remediation and regression testing. Its previously recorded audit has **26 findings overall (11 high, 12 moderate, 3 low)** and **12 production findings (7 high, 5 moderate)**. This homepage content change did not re-audit or remediate that service. The fresh frontend audit does not resolve those findings.

### Remaining human checks

Visual approval of the adapted homepage; company-approved photography/CAD and usage permissions; Safari/iOS, Firefox, Android, assistive technology and a real lower-powered phone. Actual provider acceptance **and inbox receipt**, durable production retention, privacy/legal wording, secure deployment and operational monitoring remain launch gates.

## Reproduce

```sh
cd frontend
npm ci
npx playwright install chromium
npm run typecheck
npm run build
# Start the production site separately, then run this change's regression suites:
QA_ALLOW_RFQ_WRITES=0 npx playwright test tests/homepage-content.spec.ts tests/aperture-hero.spec.ts tests/studio-pages.spec.ts tests/industrial-site.spec.ts
# The complete repository suite, including the dedicated full journey:
npm run test:e2e
```

Playwright reuses an existing local server by default or starts a dev server. `QA_BASE_URL` targets an isolated preview; `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` supports a custom Chromium binary. Enable actual RFQ-write tests only on an isolated instance with outbound notifications disabled, never against a live inbox.

See [README](../README.md), [launch checklist](LAUNCH-CHECKLIST.md), `.env.example` files and [asset provenance](../frontend/public/images/ssquare/README.md). Secrets, runtime enquiries, builds, dependencies, traces and screenshots remain excluded from Git.
