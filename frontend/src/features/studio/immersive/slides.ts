/**
 * Four stations on the S Square "aperture ring": the company introduction is
 * its own slide, followed by the three material divisions.
 *
 * The supplied APERTURE ROW brief is a vintage-camera shop concept. This file
 * keeps its interaction language (a top-down rotating machined ring, index
 * mark, scattered accessories, exploding copy) but maps it onto the real
 * S Square material divisions and the reviewed, source-backed company copy.
 * No shop, cart, prices or checkout are introduced: this is an RFQ site.
 *
 * The first station is the introduction and opens on an industrial gear study,
 * matching the original website's hero impression. It is followed by one
 * station per division (Rubber / Steel / Aluminium), each with its own plate,
 * spec sheet and RFQ destination.
 */

export type RingAccessory = {
  label: string;
  /** Fractions of the plate width, measured from the plate centre. */
  x: number;
  y: number;
  rotate: number;
  size: number;
};

export type RingSlide = {
  id: "intro" | "rubber" | "steel" | "aluminium";
  number: string;
  name: string;
  /** True for the company introduction, which has no division to inspect. */
  intro?: boolean;
  /** Optional large hero wording; tabs and inspector keep the division name. */
  displayName?: string;
  /** Optional full-bleed first-impression photograph. */
  heroImage?: string;
  kicker: string;
  type: string;
  aperture: string;
  description: string;
  chips: string[];
  image: string;
  alt: string;
  caption: string;
  ctaHref: string;
  ctaLabel: string;
  /** Division label used for RFQs; absent on the introduction slide. */
  division?: string;
  accent: string;
  specs: [string, string][];
  condition: string[];
  accessories: RingAccessory[];
};

export const RING_SLIDES: RingSlide[] = [
  {
    id: "intro",
    number: "00",
    name: "INTRO",
    intro: true,
    displayName: "S SQUARE",
    heroImage: "/images/industrial-gear-hero.jpg",
    kicker: "CUSTOM MANUFACTURING",
    type: "RUBBER · STEEL · ALUMINIUM",
    aperture: "Ø 00",
    description:
      "High-quality custom metal and rubber components manufactured for industrial and heavy-duty applications. Your trusted partner in custom metal and rubber solutions, from the first drawing to dispatch.",
    chips: ["20+ years", "Three disciplines", "Drawing or sample"],
    image: "/images/industrial-gear-hero.jpg",
    alt: "Monochrome industrial gear train introducing S Square Engineering Services",
    caption: "Industrial gear study · S Square Engineering Services",
    ctaHref: "/products",
    ctaLabel: "Explore All Products",
    accent: "#e08a63",
    specs: [
      ["Company", "S Square Engineering Services"],
      ["Disciplines", "Rubber · Steel · Aluminium"],
      ["Established", "20+ years in Coimbatore"],
      ["Format", "Made to drawing or sample"],
      ["Scope", "RFQ reviewed during quotation"],
      ["Made", "Coimbatore, India"],
    ],
    condition: [
      "Drawing or sample received",
      "Material confirmed",
      "Division selected",
    ],
    accessories: [
      { label: "20+ YRS", x: -0.64, y: -0.2, rotate: -18, size: 0.2 },
      { label: "COIMBATORE", x: 0.64, y: 0.14, rotate: 8, size: 0.21 },
      { label: "03 MATERIALS", x: -0.52, y: 0.44, rotate: 22, size: 0.18 },
      { label: "CUSTOM", x: 0.58, y: -0.42, rotate: -12, size: 0.19 },
    ],
  },
  {
    id: "rubber",
    number: "01",
    name: "RUBBER",
    kicker: "RUBBER COMPONENTS DIVISION",
    type: "SEALS · GASKETS · MOULDED PARTS",
    aperture: "Ø 01",
    description:
      "Moulded rubber components — seals, gaskets, bushes and bonded parts — produced to your drawing or sample for industrial and heavy-duty equipment.",
    chips: ["Seals & gaskets", "Moulded to sample", "Custom compounds"],
    image: "/images/division-rubber.jpg",
    alt: "Moulded rubber seals and gaskets manufactured to drawing or sample",
    caption: "Moulded seals, gaskets and custom rubber components",
    ctaHref: "/products/rubber",
    ctaLabel: "Explore Rubber Products",
    division: "Rubber Products",
    accent: "#d1724f",
    specs: [
      ["Format", "Made to drawing or sample"],
      ["Range", "Seals · gaskets · bushes"],
      ["Process", "Moulding · bonding · finishing"],
      ["Finish", "Agreed with your specification"],
      ["Inspection", "Scope agreed during quotation"],
      ["Made", "Coimbatore, India"],
    ],
    condition: [
      "Requirement reviewed",
      "Compound confirmed",
      "Inspection scope agreed",
    ],
    accessories: [
      { label: "NBR", x: -0.62, y: -0.22, rotate: -14, size: 0.19 },
      { label: "O-RINGS", x: 0.62, y: 0.2, rotate: 9, size: 0.2 },
      { label: "MOULDED", x: 0.54, y: -0.44, rotate: -24, size: 0.18 },
      { label: "SHORE A", x: -0.53, y: 0.44, rotate: 26, size: 0.2 },
    ],
  },
  {
    id: "steel",
    number: "02",
    name: "STEEL",
    kicker: "PRECISION METAL DIVISION",
    type: "STAINLESS · ALLOY · CNC COMPONENTS",
    aperture: "Ø 02",
    description:
      "Custom-engineered stainless and steel parts for industrial and OEM assemblies. Grade selection, finish and inspection requirements are reviewed against your application.",
    chips: ["Stainless & alloy", "Turned & milled", "OEM assemblies"],
    image: "/images/division-steel.jpg",
    alt: "Custom-machined steel and stainless industrial components",
    caption: "Custom-machined steel & stainless industrial components",
    ctaHref: "/products/steel",
    ctaLabel: "Explore Steel Products",
    division: "Steel Products",
    accent: "#b9c7d6",
    specs: [
      ["Format", "Made to drawing or sample"],
      ["Grades", "Application-based selection"],
      ["Process", "CNC turning & milling"],
      ["Finish", "Agreed with your specification"],
      ["Inspection", "Scope agreed during quotation"],
      ["Made", "Coimbatore, India"],
    ],
    condition: [
      "Grade confirmed",
      "Geometry reviewed",
      "Finish agreed",
    ],
    accessories: [
      { label: "EN24", x: -0.62, y: -0.24, rotate: 14, size: 0.2 },
      { label: "HRC 36", x: 0.62, y: 0.28, rotate: -8, size: 0.18 },
      { label: "CNC", x: 0.54, y: -0.44, rotate: -26, size: 0.2 },
      { label: "ISO 2768", x: -0.54, y: 0.43, rotate: 30, size: 0.21 },
    ],
  },
  {
    id: "aluminium",
    number: "03",
    name: "ALUMINIUM",
    kicker: "LIGHTWEIGHT PRECISION DIVISION",
    type: "6061 PARTS · PROFILES · DIE MOLDS",
    aperture: "Ø 03",
    description:
      "High strength-to-weight aluminium components, custom profiles, sheets and precision die molds, with anodizing or painted finishes to match application needs.",
    chips: ["Grade 6061", "Profiles & sheets", "Die tooling"],
    image: "/images/division-aluminium.jpg",
    alt: "Precision aluminium die mold and custom machined billet work",
    caption: "Precision aluminium die mold & custom machined billet work",
    ctaHref: "/products/aluminium",
    ctaLabel: "Explore Aluminium Products",
    division: "Aluminium Products",
    accent: "#e3b25c",
    specs: [
      ["Format", "Made to drawing or sample"],
      ["Material", "Aluminium, incl. Grade 6061"],
      ["Process", "Machining · profiles · die molds"],
      ["Finish", "Anodizing or painted options"],
      ["Inspection", "Scope agreed during quotation"],
      ["Made", "Coimbatore, India"],
    ],
    condition: [
      "Alloy confirmed",
      "Tooling reviewed",
      "Finish agreed",
    ],
    accessories: [
      { label: "6061", x: 0.62, y: -0.22, rotate: 18, size: 0.19 },
      { label: "ANOD", x: -0.62, y: 0.12, rotate: -14, size: 0.2 },
      { label: "CNC 5X", x: 0.55, y: 0.45, rotate: 10, size: 0.2 },
      { label: "PROFILE", x: -0.47, y: -0.47, rotate: -22, size: 0.21 },
    ],
  },
];

export const RING_COUNT = RING_SLIDES.length;
