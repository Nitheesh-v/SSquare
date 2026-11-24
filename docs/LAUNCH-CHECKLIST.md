# Company assets and launch sign-off

## 1. Approved photographs

- High-resolution photographs of the actual Coimbatore facility, machines, inspection equipment and people, with permission to publish.
- Original rubber, steel and aluminium component photos, identified by material/product type. Where a pictured part is customer-owned, confirm permission and remove identifying marks if necessary.
- Approved hero imagery/crops for desktop and mobile. Two lead photos are currently cached from the official website; other catalog images use original-site URLs and explicitly labelled illustrative fallbacks.
- Replace the six illustrative JPEGs in `frontend/public/images/` or update the dataset paths. The updated rubber assortment (`division-rubber.jpg`) is AI-generated, not an official product photo. **Do not remove placeholder labelling before replacements are approved.**
- Photo provenance: `frontend/public/images/ssquare/README.md`; mappings: `src/lib/photo-sources.ts`, `src/lib/company-data.ts`, `src/lib/catalog-data.ts`.

## 2. Approved CAD / 3D asset

- One approved, non-confidential component/assembly, with permission for public interactive display.
- Source STEP/IGES/CAD supplied through the company’s approved secure channel, not committed to the repository.
- A mobile-ready GLB with clear part names, sensible topology, surface normals and materials. Provide the real assembly/explosion relationships, desired finish and any annotations that may be published.
- Hook: server `S_SQUARE_CAD_MODEL_URL` or `src/lib/visual-config.ts`. Current profile/collar assembly is explicitly **Illustrative Concept Model · Replaceable with S Square CAD**. It is not a real component specification and has no tolerances or dimensions.
- The new homepage has three separate illustrative procedural parts (rubber gasket, steel flange, aluminium profile) in `src/features/journey/journey-scene.ts`, with matching inline SVG fallbacks. Supply and approve representative CAD for **all three** before removing their illustrative labels. The `S_SQUARE_CAD_MODEL_URL` hook applies only to the detailed story on `/products/aluminium`, not this home scene.
- Approve the four-step manufacturing language and the three-component brief workflow. The builder is a selection/prefill tool, not a cart, quotation, order acknowledgement or dispatch confirmation. No food/health claims, protein-bar artwork, discount pricing or fictional nutrition data are included.

## 3. Company and commercial sign-off

Confirm the trading name, logos, address/map destination, +91 75300 80040 phone/WhatsApp availability, email inbox ownership and Monday–Saturday availability.

Confirm the published 20+ years of experience, supported compound/material families, actual manufacturing processes, inspection scope and finish availability. No ISO, aerospace, food/medical, other certification, numerical tolerance or blanket operating-temperature claim has been invented. Supply documentation before adding any such claims.

Confirm courier coverage, whether delivery is included in each quote, and destination-dependent transit. Published 3–4 day courier transit is not a production lead-time guarantee. MOQ, manufacturing lead time, tooling, commercial terms and taxes are confirmed per quotation.

Obtain approved privacy/retention wording and any required legal/company identifiers. The form permits contact only about the enquiry; it does not invent a confidentiality contract or NDA. No unverified social profile URLs are used.

## 4. Actual notification / storage setup

Configure secrets in the hosting environment, not Git or chat:

- Verified email sender domain, `RESEND_API_KEY`, `QUOTE_FROM_EMAIL`, `QUOTE_TO_EMAIL`; or a working authenticated sales webhook and optional `QUOTE_WEBHOOK_TOKEN`.
- Production `MONGODB_URI` with backup/retention/access controls, internal `BACKEND_URL`, and matching strong `RFQ_API_KEY` on both servers.
- Durable storage if local fallback logs are retained; otherwise use the connected database/webhook and monitor failures. Local `.data` files are not an assumed production database and are excluded from Git.
- Edge/shared rate limiting, spam/bot protection, provider monitoring, alerting and HTTPS/network restrictions for the internal backend. The included throttling is only per application instance.
- End-to-end testing with company-approved inboxes and a real delivery acknowledgement before enabling the production form. Neither provider acceptance nor local storage guarantees a delivered/read email.

## 5. Backend security gate

**Do not publicly deploy the optional NestJS backend until its inherited dependency advisories have been resolved and regression-tested.** The audit on 2026-11-23 reports 26 findings overall (11 high, 12 moderate, 3 low), including 12 in the production dependency tree (7 high, 5 moderate). `npm audit fix` did not resolve them; the suggested NestJS major-version migration was not forced into this visual redesign. See `docs/QA.md` for details. An API key and network isolation reduce exposure but do not remediate dependency vulnerabilities.

The frontend may instead use a correctly configured email service or authenticated sales webhook without deploying this optional backend. Verify delivery and durable retention in that setup; local files alone are not a launch-ready enquiry workflow.

## 6. Final human review

Check current Safari/iOS, Firefox, Chrome/Android and a real lower-powered mobile device. Confirm official remote-photo availability from the deployment region, 3D frame rate, touch/keyboard navigation, visible focus, reduced-motion behavior, contrast, form privacy wording and actual notification delivery. Automated Chromium/axe checks supplement but do not replace this review.
