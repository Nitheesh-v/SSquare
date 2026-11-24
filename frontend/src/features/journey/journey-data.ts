export const MATERIALS = [
  {
    slug: "rubber",
    name: "Rubber",
    color: "#c5b5a2",
    accent: "#55402e",
    part: "Molded gasket",
    division: "Rubber Products",
    line: "Flexible by nature. Precise by design.",
    description:
      "Molded seals, gaskets, diaphragms and rubber-to-metal bonded parts. Made for your application.",
    tags: ["FKM / Viton", "Silicone", "NBR / HNBR", "EPDM"],
    image: "/images/division-rubber.jpg",
    imageLabel: "Illustrative rubber assortment",
    illustrative: true,
  },
  {
    slug: "steel",
    name: "Steel",
    color: "#aebbcf",
    accent: "#35445b",
    part: "Machined flange",
    division: "Steel Products",
    line: "Strength where it matters.",
    description:
      "Custom steel and stainless components. Your geometry, material and finish, considered together.",
    tags: ["Stainless steel", "Machined parts", "Custom geometry"],
    image: "/images/ssquare/machined-components.jpg",
    imageLabel: "Official-site component photograph",
    illustrative: false,
  },
  {
    slug: "aluminium",
    name: "Aluminium",
    color: "#abc6bb",
    accent: "#294f45",
    part: "Extruded profile",
    division: "Aluminium Products",
    line: "Lightweight thinking. Solid engineering.",
    description:
      "6061 components, profiles, sheets and precision die molds. Built around the detail that matters.",
    tags: ["Grade 6061", "Die molds", "Anodized finishes"],
    image: "/images/ssquare/aluminium-tooling.jpg",
    imageLabel: "Official-site aluminium photograph",
    illustrative: false,
  },
] as const;

export const STORY_STEPS = [
  {
    heading: ["Your idea.", "Our start."],
    caption: "A drawing. A sample. An application.\nLet’s make it specific.",
    label: "Your requirement",
  },
  {
    heading: ["Defined", "by detail."],
    caption: "Geometry. Material. Finish.\nReviewed for your requirement.",
    label: "Technical detail",
  },
  {
    heading: ["Made to", "your brief."],
    caption:
      "Manufacture. Inspect. Dispatch.\nAgainst the agreed specification.",
    label: "Manufacturing",
  },
  {
    heading: ["Your", "material."],
    caption: "Three material disciplines.\nOne manufacturing partner.",
    label: "Your material",
  },
] as const;

export type ComponentPose = {
  x: number;
  y: number;
  h: number;
  rx: number;
  ry: number;
  rz: number;
  z: number;
  op: number;
  sx: number;
  sy: number;
  shadow: number;
};
export const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));
export const modulo = (value: number, count = 3) =>
  ((value % count) + count) % count;
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => t * t * (3 - 2 * t);
export function mixPose(
  a: ComponentPose,
  b: ComponentPose,
  t: number,
): ComponentPose {
  return Object.fromEntries(
    Object.keys(a).map((key) => [
      key,
      mix(a[key as keyof ComponentPose], b[key as keyof ComponentPose], t),
    ]),
  ) as ComponentPose;
}

/** Solve x(t) rather than treating a cubic Bézier's parameter as elapsed time. */
export function bezier(x1: number, y1: number, x2: number, y2: number) {
  const sample = (t: number, a: number, b: number) =>
    3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
  return (x: number) => {
    let lo = 0,
      hi = 1,
      t = x;
    for (let i = 0; i < 12; i++) {
      const s = sample(t, x1, x2);
      if (Math.abs(s - x) < 0.0001) break;
      if (s < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return sample(t, y1, y2);
  };
}
