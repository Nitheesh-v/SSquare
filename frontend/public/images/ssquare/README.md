# Official-site photograph copies

These two files are copies of photographs published by S Square Engineering Services, retrieved through image search from the official website. They are not AI-generated replacements. Publication on the current website is not an independent verification of authorship or manufacturing capability; the company should confirm permission to reuse them before launch.

| Local file                | Original URL                                               | Context                                                      |
| ------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ |
| `machined-components.jpg` | https://ssquareengg.com/storage/2026/02/s1-5-1024x936.jpeg | Machined component range, published on the homepage          |
| `aluminium-tooling.jpg`   | https://ssquareengg.com/storage/2026/01/al6.jpg            | Aluminium tooling, published on the homepage/aluminium range |

`src/lib/photo-sources.ts` maps these source URLs to local copies so hero photography does not depend on a third-party request. Other catalog photographs retain their original `ssquareengg.com` URLs. If unavailable, `SmartProductImage` immediately shows a local **Illustrative Visual · Replaceable** fallback, including descriptive alternative text. Original site photos are treated as references, not proof that a pictured part meets a particular grade, tolerance or certification.

The six older JPEGs directly in `public/images/` are illustrative fallback assets, not verified S Square factory/product photographs. Do not remove their placeholder badges until replacing them with approved company photography.
