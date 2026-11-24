export type DivisionSlug = "rubber" | "steel" | "aluminium";

export interface ProductItem {
  id: string;
  name: string;
  division: DivisionSlug;
  category: string;
  materialBadge: string;
  specs: string;
  description: string;
  remoteImage?: string;
  fallbackImage: string;
}

export interface DivisionInfo {
  slug: DivisionSlug;
  code: string;
  name: string;
  shortTitle: string;
  heroTagline: string;
  summary: string;
  heroImage: string;
  fallbackImage: string;
  keyMaterials: string[];
  keyCapabilities: string[];
  technicalHighlights: {
    label: string;
    value: string;
  }[];
}

export const DIVISIONS: Record<DivisionSlug, DivisionInfo> = {
  rubber: {
    slug: "rubber",
    code: "DIV-01 // RUBBER PRODUCTS",
    name: "Rubber Products",
    shortTitle: "Custom Molded Rubber & Bonded Seals",
    heroTagline:
      "Custom-engineered molded rubber parts, seals, gaskets, diaphragms, and rubber-to-metal bonded components.",
    summary:
      "With over 20 years of expertise in designing and manufacturing custom rubber components, S Square Engineering Services produces molded seals, gaskets, O-rings, diaphragms, cords, sheets, and metal-bonded parts tailored to your operating environment.",
    heroImage: "https://ssquareengg.com/storage/2025/12/rubber-26.jpg",
    fallbackImage: "/images/division-rubber.jpg",
    keyMaterials: [
      "Viton (FKM)",
      "Silicone",
      "NBR / Nitrile",
      "HNBR",
      "Neoprene",
      "EPDM",
      "Natural Rubber",
      "Bahama Blue & Blue Pearl",
    ],
    keyCapabilities: [
      "Custom Molded Rubber Parts to Drawing or Sample",
      "Metal-to-Viton, Metal-to-HNBR, Metal-to-EPDM & Neoprene Bonded Seals",
      "Precision Gaskets, Washers, Grommets & Sealing Wads",
      "O-Rings, Extruded Rubber Cords & Industrial Rubber Sheets",
      "Custom Elastomer Diaphragms for Valves, Pumps & Actuators",
      "Color-Coded Elastomer Compounds (including Bahama Blue & Blue Pearl)",
    ],
    technicalHighlights: [
      { label: "Experience", value: "20+ Years Rubber Expertise" },
      { label: "Elastomers", value: "Viton · Silicone · NBR · HNBR · EPDM" },
      { label: "Bonding", value: "Rubber-to-Metal Vulcanized Seals" },
      { label: "Specification", value: "Per Customer Drawing or Sample" },
    ],
  },
  steel: {
    slug: "steel",
    code: "DIV-02 // STEEL PRODUCTS",
    name: "Steel Products",
    shortTitle: "Custom Stainless & Steel Components",
    heroTagline:
      "Custom-engineered stainless steel and steel components built for strength, heat resistance, and corrosion protection.",
    summary:
      "Engineered for mechanical reliability, oxidation defense, and long service life across industrial applications. Chromium-protected stainless steel and custom steel parts manufactured accurately to your technical drawings.",
    heroImage: "https://ssquareengg.com/storage/2026/02/s1-5-1024x936.jpeg",
    fallbackImage: "/images/division-steel.jpg",
    keyMaterials: [
      "Stainless Steel",
      "Corrosion-Resistant Cr-Oxide Grades",
      "Alloy & Carbon Steel",
      "Machined Bar & Billet Stock",
      "Sheet & Structural Steel",
      "Metal Inserts for Bonded Seals",
    ],
    keyCapabilities: [
      "Custom-Engineered Machined Steel & Stainless Components",
      "Turned Shafts, Bushings, Spacers, Sleeves & Collars",
      "Flanges, Couplings, Valve Bodies & Fluid Fittings",
      "Fabricated Brackets, Mounts & Structural Sub-Assemblies",
      "Custom Fasteners, Studs, Pins & Retaining Hardware",
      "Metal Retainer Rings for Rubber-to-Metal Bonded Seals",
    ],
    technicalHighlights: [
      { label: "Protection", value: "Chromium-Oxide Corrosion Resistance" },
      { label: "Durability", value: "High Heat & Oxidation Stability" },
      { label: "Build Basis", value: "Per Customer Drawing or Sample" },
      { label: "Inspection", value: "Scope Confirmed During Quotation" },
    ],
  },
  aluminium: {
    slug: "aluminium",
    code: "DIV-03 // ALUMINIUM & DIE MOLDS",
    name: "Aluminium Products",
    shortTitle: "6061 Aluminium, Profiles & Die Molds",
    heroTagline:
      "Lightweight custom aluminium components, precision aluminium die molds, profiles, and sheets.",
    summary:
      "Combining a high strength-to-weight ratio with corrosion resistance, thermal/electrical conductivity, and full recyclability. From precision Aluminium Die Molds to Grade 6061 machined parts with anodizing or painted finishes.",
    heroImage: "https://ssquareengg.com/storage/2026/01/al6.jpg",
    fallbackImage: "/images/division-aluminium.jpg",
    keyMaterials: [
      "Aluminium Grade 6061",
      "Aluminium Tooling Billet",
      "Extruded Aluminium Profiles",
      "Aluminium Sheets & Plates",
      "Anodized Finishes",
      "Industrial Painted Finishes",
    ],
    keyCapabilities: [
      "Precision Aluminium Die Molds & Multi-Cavity Tooling",
      "Grade 6061 Custom Machined Housings, Blocks & Brackets",
      "Custom Aluminium Profiles, Channels & Conductive Enclosures",
      "Precision-Cut Aluminium Sheets, Plates & Fixture Bases",
      "Surface Enhancements Including Anodizing & Painting",
      "Fully Recyclable Lightweight Component Manufacturing",
    ],
    technicalHighlights: [
      { label: "Featured Grade", value: "Grade 6061 & Tooling Alloys" },
      { label: "Finishes", value: "Anodizing & Protective Painting" },
      {
        label: "Key Property",
        value: "High Strength-to-Weight & Conductivity",
      },
      { label: "Sustainability", value: "Recyclable Without Property Loss" },
    ],
  },
};

export const RUBBER_PRODUCTS: ProductItem[] = [
  {
    id: "rb-silicone-gasket",
    name: "Silicone Gaskets",
    division: "rubber",
    category: "Silicone",
    materialBadge: "Silicone",
    specs: "Thermal & Weather Stability · Custom Geometry",
    description:
      "Molded and cut silicone flange and enclosure gaskets offering reliable temperature stability, ozone resistance, and clean sealing performance.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-18.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-viton-gasket",
    name: "Viton Gaskets",
    division: "rubber",
    category: "Viton / FKM",
    materialBadge: "Viton (FKM)",
    specs: "High-Heat, Fuel & Chemical Sealing",
    description:
      "Fluorocarbon gaskets engineered for demanding chemical, fuel, oil, and elevated-temperature industrial sealing interfaces.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-20.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-metal-viton-bonded",
    name: "Metal-to-Viton Bonded Seals",
    division: "rubber",
    category: "Bonded Seals",
    materialBadge: "Metal + Viton",
    specs: "High-Pressure Bolt & Port Sealing",
    description:
      "Metal retaining ring bonded to a Viton sealing lip for dependable high-pressure hydraulic port and fastener sealing.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-26.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-metal-hnbr-bonded",
    name: "Metal-to-HNBR Bonded Seals",
    division: "rubber",
    category: "Bonded Seals",
    materialBadge: "Metal + HNBR",
    specs: "Oil, Hydraulic & Abrasion Resistant",
    description:
      "Hydrogenated nitrile bonded sealing washers combining mechanical tear strength with oil and hydraulic pressure durability.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-37.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-metal-epdm-bonded",
    name: "Metal-to-EPDM Bonded Seals",
    division: "rubber",
    category: "Bonded Seals",
    materialBadge: "Metal + EPDM",
    specs: "Water, Steam & Outdoor Weather Sealing",
    description:
      "Vulcanized metal-to-EPDM bonded washers suited for water systems, steam lines, glycol service, and weather-exposed assemblies.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-42.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-rubber-metal-parts",
    name: "Rubber-to-Metal Bonded Components",
    division: "rubber",
    category: "Bonded Seals",
    materialBadge: "Elastomer + Metal",
    specs: "Mounts · Isolators · Bonded Inserts",
    description:
      "Custom over-molded anti-vibration mounts, bushings, and mechanical stops bonded directly to steel or aluminium inserts.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-41.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-neoprene-bonded",
    name: "Neoprene Bonded Seals",
    division: "rubber",
    category: "Bonded Seals",
    materialBadge: "Metal + Neoprene",
    specs: "Weather, Refrigerant & General Industrial",
    description:
      "Self-centering neoprene bonded washers engineered for refrigeration, marine hardware, and industrial equipment.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-6.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-viton-diaphragm",
    name: "Viton Diaphragms",
    division: "rubber",
    category: "Viton / FKM",
    materialBadge: "Viton (FKM)",
    specs: "Chemical Pump & Valve Actuation",
    description:
      "Custom-molded Viton diaphragms built for long flex life in chemical dosing, fuel regulation, and process valves.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-11.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-silicone-diaphragm",
    name: "Silicone Diaphragms",
    division: "rubber",
    category: "Silicone",
    materialBadge: "Silicone",
    specs: "Responsive Flex · Wide Temperature Range",
    description:
      "Thin-wall and convoluted silicone diaphragms manufactured for pneumatic valves, regulators, and clean industrial equipment.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-3.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-nbr-orings",
    name: "NBR / Nitrile O-Rings",
    division: "rubber",
    category: "NBR / Nitrile",
    materialBadge: "Nitrile (NBR)",
    specs: "Standard & Custom Sizes · Oil Resistant",
    description:
      "Petroleum oil, hydraulic fluid, and grease-resistant O-rings molded to customer dimensional and hardness specifications.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-27.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-neoprene-orings",
    name: "Neoprene O-Rings",
    division: "rubber",
    category: "Neoprene",
    materialBadge: "Neoprene",
    specs: "Ozone & Weather Resistant Sealing",
    description:
      "Durable chloroprene O-rings suited for HVAC equipment, outdoor enclosures, and general mechanical sealing.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-7.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-silicone-seals",
    name: "Silicone Rubber Seals & Profiles",
    division: "rubber",
    category: "Silicone",
    materialBadge: "Silicone",
    specs: "Custom Lip, Channel & Ring Profiles",
    description:
      "Molded and extruded silicone sealing rings and profile seals for enclosures, lighting, thermal chambers, and instrumentation.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-8.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-nbr-seals",
    name: "NBR / Nitrile Hydraulic & Rotary Seals",
    division: "rubber",
    category: "NBR / Nitrile",
    materialBadge: "Nitrile (NBR)",
    specs: "Static & Dynamic Oil Sealing",
    description:
      "Custom nitrile wiper seals, cups, and shaft sealing profiles engineered for low wear in hydraulic and pneumatic cylinders.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-28.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-nbr-diaphragms",
    name: "NBR / Nitrile Diaphragms",
    division: "rubber",
    category: "NBR / Nitrile",
    materialBadge: "Nitrile (NBR)",
    specs: "Pneumatic, Oil & Fuel Actuator Service",
    description:
      "Molded nitrile diaphragms engineered for pneumatic actuators, pumps, and industrial fluid control hardware.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-30.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-neoprene-gaskets",
    name: "Neoprene Gaskets & Washers",
    division: "rubber",
    category: "Neoprene",
    materialBadge: "Neoprene",
    specs: "Weather & Mechanical Cushioning",
    description:
      "Neoprene flange gaskets, flat washers, and isolation pads resistant to weathering, moisture, and repeated compression.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-21.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-neoprene-diaphragms",
    name: "Neoprene Diaphragms",
    division: "rubber",
    category: "Neoprene",
    materialBadge: "Neoprene",
    specs: "Flex Fatigue Resistant",
    description:
      "Custom chloroprene diaphragms produced for water valves, vacuum actuators, and metering assemblies.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-25.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-moulded-parts",
    name: "Custom Moulded Rubber Parts",
    division: "rubber",
    category: "Custom Molded",
    materialBadge: "Multi-Elastomer",
    specs: "Manufactured to Drawing or Sample",
    description:
      "Custom 3D molded boots, bellows, bumpers, isolators, valve seats, and OEM components produced in dedicated tooling.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-40.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-grommets-wads",
    name: "Rubber Grommets & Sealing Wads",
    division: "rubber",
    category: "Custom Molded",
    materialBadge: "EPDM / Silicone / NBR",
    specs: "Cable Pass-Through & Container Sealing",
    description:
      "Cable protection grommets, plugs, and rubber sealing wads molded to customer panel and closure dimensions.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-16.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-sheets-cords",
    name: "Industrial Rubber Sheets & Cords",
    division: "rubber",
    category: "Sheets & Cords",
    materialBadge: "Viton · Silicone · NBR · Neoprene · NR",
    specs: "Custom Thicknesses & Extruded Profiles",
    description:
      "Industrial elastomer sheets and extruded cords supplied in Viton, Silicone, Nitrile, Neoprene, and Natural Rubber.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-10.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-natural-rubber",
    name: "Natural Rubber Gaskets, Washers & Diaphragms",
    division: "rubber",
    category: "Natural & Custom",
    materialBadge: "Natural Rubber",
    specs: "High Elasticity & Abrasion Resilience",
    description:
      "Resilient natural rubber washers, gaskets, and diaphragms suited for shock absorption, abrasion defense, and dynamic flexing.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-31.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-custom-colors",
    name: "Color-Coded Compounds (Bahama Blue & Blue Pearl)",
    division: "rubber",
    category: "Natural & Custom",
    materialBadge: "Custom Color Elastomers",
    specs: "Bahama Blue · Blue Pearl · Custom Shades",
    description:
      "Color-matched molded rubber parts and sheets—including Bahama Blue and Blue Pearl—for clear visual identification on assembly lines.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-14.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
];

export const STEEL_PRODUCTS: ProductItem[] = [
  {
    id: "st-cnc-shafts",
    name: "Custom Turned Stainless & Steel Shafts",
    division: "steel",
    category: "Machined Components",
    materialBadge: "Stainless & Alloy Steel",
    specs: "Stepped, Threaded & Keyway Geometries",
    description:
      "Custom-machined stainless and steel shafts and spindles built to customer drawings for pumps, drives, conveyors, and rotary machinery.",
    remoteImage: "https://ssquareengg.com/storage/2026/02/steel-7.jpg",
    fallbackImage: "/images/division-steel.jpg",
  },
  {
    id: "st-flanges-couplings",
    name: "Steel Flanges & Machined Couplings",
    division: "steel",
    category: "Flanges & Fittings",
    materialBadge: "Stainless / Carbon Steel",
    specs: "Custom Bolt Patterns & Sealing Faces",
    description:
      "Machined manifold flanges, couplings, and connectors engineered for dependable sealing and structural alignment in piping and fluid systems.",
    remoteImage: "https://ssquareengg.com/storage/2026/02/steel-19.jpg",
    fallbackImage: "/images/division-steel.jpg",
  },
  {
    id: "st-fabricated-brackets",
    name: "Fabricated Steel Brackets & Mounting Frames",
    division: "steel",
    category: "Sheet & Structural Fabrication",
    materialBadge: "Stainless / Mild Steel",
    specs: "Cut, Formed & Welded to Print",
    description:
      "Heavy-duty mounting brackets, machine supports, and fabricated steel frames produced to OEM dimensional requirements.",
    remoteImage: "https://ssquareengg.com/storage/2026/02/steel-27.jpg",
    fallbackImage: "/images/division-steel.jpg",
  },
  {
    id: "st-bushings-sleeves",
    name: "Steel Bushings, Spacers & Collars",
    division: "steel",
    category: "Machined Components",
    materialBadge: "Stainless & Steel",
    specs: "Precision Bore & Concentric Fit",
    description:
      "Wear-resistant cylindrical bushings, shaft collars, distance sleeves, and bearing housings machined to customer specification.",
    remoteImage: "https://ssquareengg.com/storage/2026/02/steel-12.jpg",
    fallbackImage: "/images/division-steel.jpg",
  },
  {
    id: "st-fasteners-studs",
    name: "Special-Purpose Bolts, Studs & Pins",
    division: "steel",
    category: "Fasteners & Hardware",
    materialBadge: "Stainless & High-Strength Steel",
    specs: "Custom Thread & Shoulder Profiles",
    description:
      "Non-standard shoulder bolts, clevis pins, studs, and machined hardware manufactured when standard catalog fasteners do not fit.",
    remoteImage: "https://ssquareengg.com/storage/2026/02/steel-5.jpg",
    fallbackImage: "/images/division-steel.jpg",
  },
  {
    id: "st-valve-manifolds",
    name: "Stainless Valve Bodies, Blocks & Fluid Fittings",
    division: "steel",
    category: "Flanges & Fittings",
    materialBadge: "Corrosion-Resistant Stainless",
    specs: "Oxidation & Chemical Corrosion Protection",
    description:
      "Machined fluid blocks, adaptors, nozzle bodies, and fittings utilizing stainless steel's chromium-oxide corrosion resistance.",
    remoteImage: "https://ssquareengg.com/storage/2026/02/steel-24.jpg",
    fallbackImage: "/images/division-steel.jpg",
  },
  {
    id: "st-bonded-inserts",
    name: "Metal Retainers & Inserts for Bonded Seals",
    division: "steel",
    category: "Sheet & Structural Fabrication",
    materialBadge: "Stainless & Plated Steel",
    specs: "Prepared for Elastomer Bonding",
    description:
      "In-house production of metal retaining rings and structural cores used in our rubber-to-metal bonded seals and mounts.",
    remoteImage: "https://ssquareengg.com/storage/2026/02/steel-14.jpg",
    fallbackImage: "/images/division-steel.jpg",
  },
  {
    id: "st-industrial-assemblies",
    name: "Custom Steel Sub-Assemblies & OEM Parts",
    division: "steel",
    category: "Assemblies",
    materialBadge: "Steel + Elastomer Integration",
    specs: "Inspected & Ready for Line Assembly",
    description:
      "Integrated mechanical components pairing machined steel hardware with custom rubber seals from a single manufacturing partner.",
    remoteImage: "https://ssquareengg.com/storage/2026/01/2s.jpg",
    fallbackImage: "/images/division-steel.jpg",
  },
];

export const ALUMINIUM_PRODUCTS: ProductItem[] = [
  {
    id: "al-die-molds",
    name: "Precision Aluminium Die Molds",
    division: "aluminium",
    category: "Die Molds & Tooling",
    materialBadge: "Aluminium Tooling Billet",
    specs: "Custom Cavity Milling · Rapid Heat Transfer",
    description:
      "Custom-engineered aluminium die molds and production tooling machined accurately from customer CAD models or part samples.",
    remoteImage: "https://ssquareengg.com/storage/2026/01/al6.jpg",
    fallbackImage: "/images/division-aluminium.jpg",
  },
  {
    id: "al-6061-machined",
    name: "Grade 6061 Machined Aluminium Components",
    division: "aluminium",
    category: "Machined Components",
    materialBadge: "Aluminium 6061",
    specs: "High Strength-to-Weight · Custom Milled",
    description:
      "Lightweight Grade 6061 machined housings, brackets, blocks, and structural components for industrial, automotive, and equipment OEMs.",
    remoteImage: "https://ssquareengg.com/storage/2026/01/al6.jpg",
    fallbackImage: "/images/division-aluminium.jpg",
  },
  {
    id: "al-electronic-enclosures",
    name: "Conductive & Anodized Aluminium Housings",
    division: "aluminium",
    category: "Enclosures & Thermal",
    materialBadge: "Anodized Aluminium",
    specs: "Thermal & Electrical Conductivity",
    description:
      "Thermal management housings, heatsinks, and protective enclosures leveraging aluminium's conductivity and anodized surface protection.",
    remoteImage: "https://ssquareengg.com/storage/2026/01/al7.jpg",
    fallbackImage: "/images/division-aluminium.jpg",
  },
  {
    id: "al-extruded-profiles",
    name: "Custom Aluminium Profiles & Sections",
    division: "aluminium",
    category: "Profiles & Sheets",
    materialBadge: "Aluminium Profiles",
    specs: "Cut, Machined, Anodized or Painted",
    description:
      "Custom structural channels, framing profiles, guide sections, and industrial aluminium profiles finished to specification.",
    remoteImage: "https://ssquareengg.com/storage/2026/01/al8.jpg",
    fallbackImage: "/images/division-aluminium.jpg",
  },
  {
    id: "al-mold-cavities",
    name: "Matched Mold Cavities & Forming Dies",
    division: "aluminium",
    category: "Die Molds & Tooling",
    materialBadge: "Aluminium Die Set",
    specs: "Core & Cavity Tooling to Specification",
    description:
      "Split-block aluminium mold cavities and forming dies engineered for repeatable rubber and polymer part molding.",
    remoteImage: "https://ssquareengg.com/storage/2026/01/al5.jpg",
    fallbackImage: "/images/division-aluminium.jpg",
  },
  {
    id: "al-sheets-plates",
    name: "Aluminium Sheets, Plates & Baseplates",
    division: "aluminium",
    category: "Profiles & Sheets",
    materialBadge: "Aluminium Sheet & Plate",
    specs: "Custom Cut · Anodized or Painted",
    description:
      "Lightweight, corrosion-resistant aluminium sheets, fixture plates, and machine panels prepared to customer dimensions.",
    remoteImage: "https://ssquareengg.com/storage/2026/01/al3.jpg",
    fallbackImage: "/images/division-aluminium.jpg",
  },
];

export const ALL_PRODUCTS: ProductItem[] = [
  ...RUBBER_PRODUCTS,
  ...STEEL_PRODUCTS,
  ...ALUMINIUM_PRODUCTS,
];

export interface MaterialComparisonRow {
  id: string;
  material: string;
  division: DivisionSlug;
  tempRange: string;
  keyStrength: string;
  typicalParts: string;
  finishOrGrade: string;
}

export const MATERIAL_MATRIX: MaterialComparisonRow[] = [
  {
    id: "fkm",
    material: "Viton (FKM) Elastomer",
    division: "rubber",
    tempRange: "High-Heat & Chemical Service",
    keyStrength: "Fuel, oil, chemical & elevated-temperature resistance",
    typicalParts: "Metal-to-Viton bonded seals, gaskets, diaphragms",
    finishOrGrade: "Custom Durometer · Molded & Bonded",
  },
  {
    id: "vmq",
    material: "Silicone Elastomer",
    division: "rubber",
    tempRange: "Wide Low-to-High Temp Range",
    keyStrength: "Thermal stability, flexibility, UV & ozone resistance",
    typicalParts: "Silicone gaskets, thin diaphragms, cords & profile seals",
    finishOrGrade: "Custom Colors · Molded, Cut & Extruded",
  },
  {
    id: "nbr-hnbr",
    material: "NBR / HNBR Nitrile",
    division: "rubber",
    tempRange: "Hydraulic & Oil Service",
    keyStrength: "Petroleum oil, hydraulic fluid & abrasion resistance",
    typicalParts:
      "O-rings, Metal-to-HNBR bonded seals, rotary seals, diaphragms",
    finishOrGrade: "Industrial & Automotive Sealing Grades",
  },
  {
    id: "epdm-cr",
    material: "EPDM, Neoprene & Natural Rubber",
    division: "rubber",
    tempRange: "Weather, Water & Dynamic Flex",
    keyStrength:
      "Water/steam resistance (EPDM), weather (Neoprene) & resilience (NR)",
    typicalParts: "Metal-to-EPDM seals, grommets, wads, washers, sheets",
    finishOrGrade: "Includes Bahama Blue & Blue Pearl Custom Shades",
  },
  {
    id: "stainless",
    material: "Stainless Steel",
    division: "steel",
    tempRange: "Elevated Heat & Corrosive Media",
    keyStrength: "Chromium-oxide protection against rust, oxidation & heat",
    typicalParts: "Turned shafts, flanges, valve blocks, fabricated brackets",
    finishOrGrade: "Grade & Finish Confirmed to Drawing",
  },
  {
    id: "steel-alloy",
    material: "Custom Alloy & Structural Steel",
    division: "steel",
    tempRange: "Heavy Mechanical Duty",
    keyStrength: "High tensile strength, load capacity & wear durability",
    typicalParts:
      "Bushings, special fasteners, bonded-seal retainers, assemblies",
    finishOrGrade: "Material & Finish Reviewed per Project",
  },
  {
    id: "al6061",
    material: "Aluminium (Grade 6061 & Tooling)",
    division: "aluminium",
    tempRange: "Lightweight Structural & Thermal",
    keyStrength:
      "High strength-to-weight, conductivity, corrosion resistance & recyclable",
    typicalParts: "Aluminium Die Molds, 6061 machined parts, profiles, sheets",
    finishOrGrade: "Anodized · Painted · Mill Finish",
  },
];
