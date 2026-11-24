# Industrial redesign — QA and handover

Review date: **2026-11-23**

Branch: `arena/8987795b-ssquare`

## Delivery status

The redesigned website is built and running in the live preview. **The final Chromium suite passes 40/40 tests.** This is a verified preview, not an unconditional production-launch approval.

**Launch gates remain:** approved company imagery/CAD and copy, configured and verified enquiry delivery/retention, real-device/cross-browser review, and dependency remediation before publicly deploying the optional NestJS backend. See [the launch checklist](LAUNCH-CHECKLIST.md).

## Build and dependency checks

| Check                                 | Result                                                                                                   |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Frontend `npm run typecheck`          | Pass                                                                                                     |
| Frontend `npm run build`              | Pass — Next.js 15.5.29; 18 generated static pages                                                        |
| Backend `npm run build`               | Pass                                                                                                     |
| Frontend `npm audit`                  | **0 findings**, including development dependencies                                                       |
| Backend `npm audit`                   | **26 findings: 11 high, 12 moderate, 3 low**                                                             |
| Backend `npm audit --omit=dev`        | **12 findings: 7 high, 5 moderate**                                                                      |
| `git diff --check`                    | Pass                                                                                                     |
| Proposed-file credential-pattern scan | No private keys or provider/GitHub token patterns found; not a substitute for a dedicated secret scanner |

Next.js reports a **10.1 kB homepage route / 128 kB first-load JS**, with 103 kB shared JS. These are build-tool estimates, not a Lighthouse score or a real-device performance guarantee. The Three.js scene is a separate dynamic import. A supplementary high-DPR mobile check measured the canvas at approximately **1.35× CSS width**, matching its mobile cap.

## Automated browser results

Test source: [`frontend/tests/industrial-site.spec.ts`](../frontend/tests/industrial-site.spec.ts). Configuration: [`frontend/playwright.config.ts`](../frontend/playwright.config.ts).

| Chromium project     | Viewport                             | Final result                              |
| -------------------- | ------------------------------------ | ----------------------------------------- |
| Desktop              | 1440 × 1000                          | 10/10 pass                                |
| Tablet / touch       | 768 × 1024                           | 10/10 pass                                |
| Mobile / touch       | 390 × 844                            | 10/10 pass                                |
| Small mobile / touch | 320 × 844                            | 10/10 pass                                |
| **Total**            | One worker; production website build | **40/40 pass, approximately 2.3 minutes** |

Coverage includes:

1. Ten public routes return successfully with one main H1, no unintended horizontal page overflow, no commerce/account links and no restored blanket QC/free-delivery guarantees. Removed cart, checkout, login, registration, account and admin URLs return 404. Legacy material category details redirect permanently to their division pages.
2. Skip link, desktop product disclosure, mobile navigation, Escape dismissal, manual hero controls, contextual quote selection, native modal focus containment and focus restoration.
3. Catalog division filtering, search/no-results/reset, keyboard-opened quick details and product-specific quotation prefills.
4. Actual test RFQ submissions report backend/local storage separately from delivery. Storage-only responses explicitly state that the enquiry has **not** been automatically emailed or delivered, and offer pre-filled WhatsApp/email handoffs. The 320px confirmation state is included in overflow checks.
5. A mocked 503 verifies that failed submissions retain entered contact/drawing details, focus the error message and provide direct-contact alternatives. It also checks dialog overflow. This mock does not send an email or create a real enquiry.
6. Reduced-motion content remains readable as four stages, without a canvas. The technical SVG remains available.
7. No initial canvas; one scene appears near the story. A live change to reduced motion removes it and restores the static view.
8. Simulated unavailable WebGL retains the labelled technical drawing and explanatory status.
9. Axe scans of home, catalog, contact, FAQ and the open quote dialog find **zero WCAG 2 A/AA / 2.1 AA tagged violations** at all four viewports. This is an automated subset, not a WCAG conformance certification.
10. RFQ input validation rejects malformed fields, invalid email/phone, short messages and the honeypot; successful replies expose truthful reference/storage/delivery fields.

Third-party company photos are intentionally made invalid during this suite to exercise labelled fallbacks. The two cached official-site photos still load normally. There were no application `pageerror` events in the final run.

The final full run deliberately left the internal backend offline to exercise the local recovery path. Keyed backend storage was separately tested over HTTP and through the Next.js route; a preceding complete browser run also passed with the keyed backend running.

## Supplementary checks

- Home, products and contact layouts checked at **320, 390, 768, 1024, 1440 and 1920px**. Document width and `innerWidth` matched each configured viewport, rather than comparing against an already inflated mobile viewport. No runtime/console errors occurred in this supplemental check.
- Reviewed desktop/mobile hero and story-stage screenshots. The real S Square logo and dark-navy three-column footer are retained. Illustrative images/models remain clearly identified.
- Corrected story ambient overflow and comparison-table positioning, the narrow-screen header CTA, small-screen metric wrapping, and the enquiry confirmation card. Overflow is not concealed with a global body clipping rule; the comparison table and featured strip retain intentional native horizontal scrolling.
- Backend production controller: missing key configuration refuses storage with 503; wrong key returns 401; a matching key is accepted. Real HTTP checks verified missing/wrong keys return 401, invalid DTOs return 400, and a keyed QA enquiry is stored.
- Backend cart, purchase-order list, user, product and login endpoints return 404. Cross-origin access is not enabled by default. This reduces exposed functionality; it is **not** remediation of vulnerable dependencies.
- Next.js-to-backend key forwarding verified: backend storage true; local/email/webhook flags false. With the backend stopped, verified local append-only persistence, 0600 file permissions and false delivery flags.
- RFQ route: oversized input returns 413; unsupported GET returns 405; the eleventh request in a test rate-limit window returns 429 with `Retry-After: 600`.
- The production website accepts the preview host. Browsers submit to relative `/api/quote`; internal backend origins and keys are not exposed in browser-facing API calls.
- Local environment files, preview keys, runtime enquiries, browser tooling, traces and screenshots are excluded from Git. Only explicitly `ARENA_QA`-marked records were removed after testing; other local records were preserved.

## Unresolved backend security gate

**Do not publicly deploy the optional NestJS backend in its current dependency state.** The inherited NestJS 10 dependency tree has the audit findings listed above, including production findings involving Nest core/platform/config/Swagger and transitive body-parser, multer, lodash and js-yaml packages. Development tooling contributes additional CLI/schematics/glob-related findings.

`npm audit fix` did not resolve these findings. Suggested fixes include major framework/tooling migrations; no blind `--force` upgrade was applied as part of the redesign. Upgrade to a mutually compatible, supported NestJS/config/Mongoose/Swagger/tooling set, resolve remaining transitive advisories, rerun both audits and repeat DTO, authentication and persistence regression tests before deployment. An RFQ key, CORS restrictions and private networking do not repair vulnerable parsers or dependencies.

`start:prod` explicitly sets `NODE_ENV=production`, so a copied development `.env` cannot silently bypass the production key requirement. Only the RFQ module is registered; legacy commerce/auth modules remain unused source, not active endpoints.

The website does **not** require publicly deploying this backend: a configured email provider or authenticated sales-system webhook can handle delivery without it. Verify the chosen workflow's retention, access controls and operational monitoring. Local `.data` files are a development/recovery mechanism, not durable serverless CRM storage.

## Not verified / required before launch

- **Live email/webhook acceptance and actual inbox delivery:** no provider is configured in this preview; outbound notifications were disabled for QA. Provider acceptance alone does not prove inbox receipt. The UI does not pretend otherwise.
- **Production MongoDB or multi-instance durability:** tests use local development storage, not a connected production database.
- **Real CAD integration:** the procedural model is labelled “Illustrative Concept Model · Replaceable with S Square CAD.” No approved company GLB was supplied. A real multipart model needs part/transform mapping for its own accurate exploded view.
- **Image permissions and deployment-region availability:** two lead photos are cached from the official site; other remote photos can fail and then use labelled illustrative assets. Company approval and final replacements remain necessary.
- **Safari/iOS, Firefox, Chrome/Android hardware and assistive technology:** automated checks used headless Chromium with software WebGL in this sandbox. Touch emulation is not a real low-powered device or GPU/FPS benchmark. Screen-reader usability, real-device frame rate, WebGL context-loss recovery and final visual approval still require human review.
- **Deployment operations:** edge/shared abuse protection, HTTPS/network isolation, monitoring, privacy/retention approval, backups and actual sales-inbox ownership. Included rate limiting is per instance and assumes a trusted deployment proxy.

## Reproduce

```sh
cd frontend
npm ci
npx playwright install chromium
npm run typecheck
npm run build
# Start the production website separately, then:
npm run test:e2e
```

Tests reuse an existing local server by default; otherwise Playwright starts the dev server. Set `QA_BASE_URL` to target a running test preview. On an isolated test instance **with outbound email/webhooks disabled**, set `QA_ALLOW_RFQ_WRITES=1` to include actual RFQ writes; otherwise those two tests per project are skipped. Never enable write tests against a live sales inbox. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` is available for sandbox-specific browser installations.

```sh
cd backend
npm ci
npm run build
npm audit
npm audit --omit=dev
```

Launch inputs, environment variables and photo/CAD provenance are documented in [the launch checklist](LAUNCH-CHECKLIST.md), [README](../README.md), both `.env.example` files and the [official-photo notes](../frontend/public/images/ssquare/README.md).
