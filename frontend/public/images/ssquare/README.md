# Official-site photograph copies

These two files are copies of photographs published by S Square Engineering Services, retrieved through image search from the official website. They are not AI-generated replacements. Publication on the current website is not an independent verification of authorship or manufacturing capability; the company should confirm permission to reuse them before launch.

| Local file                | Original URL                                               | Context                                                      |
| ------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ |
| `machined-components.jpg` | https://ssquareengg.com/storage/2026/02/s1-5-1024x936.jpeg | Machined component range, published on the homepage          |
| `aluminium-tooling.jpg`   | https://ssquareengg.com/storage/2026/01/al6.jpg            | Aluminium tooling, published on the homepage/aluminium range |

`src/lib/photo-sources.ts` maps these source URLs to local copies so hero photography does not depend on a third-party request. Other catalog photographs retain their original `ssquareengg.com` URLs. If unavailable, `SmartProductImage` immediately shows a local **Illustrative Visual · Replaceable** fallback, including descriptive alternative text. Original site photos are treated as references, not proof that a pictured part meets a particular grade, tolerance or certification.

The six JPEGs directly in `public/images/` are illustrative assets, not verified S Square factory/product photographs. In this follow-up, `division-rubber.jpg` was replaced with an **AI-generated studio-style rubber assortment** (gaskets, O-rings, bellows and molded parts). It is now the explicit rubber hero/division visual as well as the rubber catalog fallback. `illustrative: true` keeps its badge visible even when the local image has loaded; badges sit outside moving image planes so they are not cropped. Do not remove the labels until replacing these assets with approved company photographs.

`public/images/industrial-gear-study.svg` is original procedural fallback artwork for the hero. The corresponding true WebGL gear assembly in `IndustrialBackdropScene.tsx` is also illustrative, not a company product or photograph. It carries an explicit replaceable-CAD note. Product photographs receive a CSS perspective/parallax treatment; that treatment is not a reconstruction of their real 3D geometry.
