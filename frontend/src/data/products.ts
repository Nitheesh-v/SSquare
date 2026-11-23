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
    code: "DIV-01 // ELASTOMERS",
    name: "Rubber Products",
    shortTitle: "Custom Molded Rubber & Bonded Seals",
    heroTagline:
      "Custom-engineered, high-precision molded rubber parts, seals, gaskets, diaphragms, and metal-bonded components.",
    summary:
      "Over 20 years of expertise designing and manufacturing custom molded seals, gaskets, O-rings, diaphragms, and rubber-to-metal bonded components for OEMs worldwide. We work with all major industrial elastomers and formulate bespoke compounds to match your temperature, chemical, and durometer requirements.",
    heroImage: "/images/division-rubber.jpg",
    keyMaterials: [
      "Viton® / FKM",
      "Silicone (VMQ)",
      "NBR / Nitrile",
      "HNBR",
      "Neoprene (CR)",
      "EPDM",
      "Natural Rubber (NR)",
      "Custom Color Compounds",
    ],
    keyCapabilities: [
      "Compression, Transfer & Injection Rubber Molding",
      "High-Pressure Rubber-to-Metal Bonded Seals (Viton, HNBR, EPDM, Neoprene)",
      "Precision Die-Cut & Molded Gaskets, Washers & Wads",
      "Extruded Rubber Cords, Profiles & Industrial Calendered Sheets",
      "Convoluted & Fabric-Reinforced Elastomer Diaphragms",
      "Custom Color & Durometer Compounding (20–90 Shore A)",
    ],
    technicalHighlights: [
      { label: "Operating Temp", value: "-60°C to +250°C" },
      { label: "Hardness Range", value: "20 – 90 Shore A" },
      { label: "Bonding Substrates", value: "SS 304/316, Mild Steel, Brass, Aluminium" },
      { label: "Standards", value: "ISO 3302 / AS568 / Custom Drawing" },
    ],
  },
  steel: {
    slug: "steel",
    code: "DIV-02 // FERROUS & STAINLESS",
    name: "Steel Products",
    shortTitle: "Precision Stainless & Fabricated Steel",
    heroTagline:
      "Custom-engineered, high-strength precision stainless steel & alloy steel machined components and fabrications.",
    summary:
      "Engineered for oxidation resistance, elevated-temperature strength, and heavy-duty mechanical reliability. Chromium-passivated stainless steel and high-tensile alloy steel components CNC-machined, laser-cut, and TIG/MIG fabricated strictly to your engineering drawings.",
    heroImage: "/images/division-steel.jpg",
    keyMaterials: [
      "SS 304 / 304L",
      "SS 316 / 316L Marine & Chemical Grade",
      "SS 410 / 420 Hardened",
      "EN8 / EN19 / EN24 Alloy Steel",
      "Mild & Carbon Structural Steel",
      "Metal-Insert Substrates for Bonded Seals",
    ],
    keyCapabilities: [
      "Multi-Axis CNC Turning, Milling, Threading & Splining",
      "High-Pressure Stainless Flanges, Couplings & Valve Internals",
      "Laser-Cut, CNC-Bent & TIG-Welded Sheet Metal Brackets",
      "Heavy-Duty Structural Assemblies & Special-Purpose Machine Parts",
      "Passivation, Electropolishing, Zinc Plating & Black Oxide Finishes",
      "Precision Metal Retainer Rings for Bonded Elastomer Seals",
    ],
    technicalHighlights: [
      { label: "Machining Tolerance", value: "Up to ±0.01 mm" },
      { label: "Corrosion Defense", value: "High-Chromium Oxide Passivation" },
      { label: "Thermal Stability", value: "Cryogenic to +870°C (Grade Dependent)" },
      { label: "Batch Flexibility", value: "Prototypes to High-Volume OEM" },
    ],
  },
  aluminium: {
    slug: "aluminium",
    code: "DIV-03 // LIGHT ALLOY & TOOLING",
    name: "Aluminium Products",
    shortTitle: "Aluminium Die Molds, CNC & Profiles",
    heroTagline:
      "Lightweight, high-precision aluminium CNC components, bespoke aluminium die molds, profiles, and sheets.",
    summary:
      "Combining an exceptional strength-to-weight ratio with superior machinability, corrosion resistance, and thermal/electrical conductivity. From intricate CNC-milled Aluminium Die Molds to Grade 6061 aerospace, automotive, and electronic housings with custom anodizing or powder coating.",
    heroImage: "/images/division-aluminium.jpg",
    keyMaterials: [
      "Aluminium 6061-T6",
      "Aluminium 6082-T6",
      "Aluminium 7075 Aerospace Grade",
      "Aluminium 5052 Sheet & Marine Grade",
      "ADC12 / A380 Die-Casting Alloys",
      "Extruded Architectural & Industrial Alloys",
    ],
    keyCapabilities: [
      "Precision CNC-Milled Aluminium Die Molds & Multi-Cavity Tooling",
      "3-Axis & 4-Axis Billet CNC Machined Housings, Blocks & Manifolds",
      "Custom Aluminium Extruded Profiles, Heatsinks & Structural Framing",
      "Precision Cut & Formed Aluminium Sheets, Plates & Enclosures",
      "Clear, Black & Color Hard-Coat Anodizing, Bead Blasting & Powder Coating",
      "100% Recyclable, Eco-Efficient Lightweight Component Engineering",
    ],
    technicalHighlights: [
      { label: "Flagship Alloy", value: "6061-T6 & Tool-Grade Billet" },
      { label: "Surface Finishes", value: "Type II/III Anodize · Powder Coat · Alodine" },
      { label: "Key Advantage", value: "High Strength-to-Weight & Conductivity" },
      { label: "Sustainability", value: "100% Recyclable Zero-Waste Swarf" },
    ],
  },
};

export const RUBBER_PRODUCTS: ProductItem[] = [
  {
    id: "rb-silicone-gasket",
    name: "Silicone Gaskets",
    division: "rubber",
    category: "Silicone",
    materialBadge: "Silicone (VMQ)",
    specs: "-60°C to +230°C · FDA / Industrial Grade",
    description:
      "Precision-molded and die-cut silicone flange and enclosure gaskets offering superior thermal stability, UV/ozone resistance, and low compression set.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-18.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-viton-gasket",
    name: "Viton® (FKM) Gaskets",
    division: "rubber",
    category: "Viton / FKM",
    materialBadge: "Viton (FKM)",
    specs: "-20°C to +250°C · Aggressive Chemical & Fuel Resistant",
    description:
      "High-performance fluorocarbon gaskets engineered for petrochemical, automotive fuel, acid, and high-temperature industrial sealing.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-20.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-metal-viton-bonded",
    name: "Metal-to-Viton Bonded Seals",
    division: "rubber",
    category: "Bonded Seals",
    materialBadge: "SS / Steel + FKM",
    specs: "High-Pressure Hydraulic Dowty-Style Sealing",
    description:
      "Precision stainless or plated steel retaining ring chemically vulcanized to a Viton elastomer lip for leak-free high-pressure bolt and hydraulic port sealing.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-26.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-metal-hnbr-bonded",
    name: "Metal-to-HNBR Bonded Seals",
    division: "rubber",
    category: "Bonded Seals",
    materialBadge: "Metal + HNBR",
    specs: "-40°C to +165°C · High Abrasion & Sour Oil Resistance",
    description:
      "Heavy-duty hydrogenated nitrile bonded seals combining superior mechanical tear strength with oil, refrigerant, and hydraulic pressure resistance.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-37.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-metal-epdm-bonded",
    name: "Metal-to-EPDM Bonded Seals",
    division: "rubber",
    category: "Bonded Seals",
    materialBadge: "Metal + EPDM",
    specs: "-50°C to +150°C · Steam, Water & Brake Fluid Grade",
    description:
      "Vulcanized metal-to-EPDM bonded washers ideal for potable water valves, steam lines, glycol systems, and outdoor weatherproof assemblies.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-42.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-rubber-metal-parts",
    name: "Custom Rubber-to-Metal Bonded Parts",
    division: "rubber",
    category: "Bonded Seals",
    materialBadge: "Multi-Compound + Metal",
    specs: "Anti-Vibration Mounts · Bushings · Valve Inserts",
    description:
      "Bespoke over-molded anti-vibration mounts, isolators, rollers, and mechanical stops permanently bonded to machined steel or aluminium inserts.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-41.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-neoprene-bonded",
    name: "Neoprene Bonded Seals",
    division: "rubber",
    category: "Bonded Seals",
    materialBadge: "Metal + Neoprene (CR)",
    specs: "-40°C to +120°C · Weather, Refrigerant & Moderate Oil",
    description:
      "Self-centering neoprene bonded sealing washers engineered for refrigeration, marine hydraulics, and general industrial fasteners.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-6.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-viton-diaphragm",
    name: "Viton® Diaphragms",
    division: "rubber",
    category: "Viton / FKM",
    materialBadge: "Viton (FKM)",
    specs: "Homogeneous or Fabric-Reinforced · Chemical Pumps",
    description:
      "Custom-molded fluorocarbon pump and actuator diaphragms delivering long flex life in corrosive chemical dosing and fuel regulation systems.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-11.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-silicone-diaphragm",
    name: "Silicone Diaphragms",
    division: "rubber",
    category: "Silicone",
    materialBadge: "Silicone (VMQ)",
    specs: "High Flex Sensitivity · Extreme Temp Stability",
    description:
      "Thin-wall and convoluted silicone diaphragms engineered for pneumatic valves, medical/food processing equipment, and low-pressure regulators.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-3.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-nbr-orings",
    name: "NBR / Nitrile O-Rings",
    division: "rubber",
    category: "NBR / Nitrile",
    materialBadge: "Nitrile (NBR)",
    specs: "AS568 & Metric Custom Sizes · 50–90 Shore A",
    description:
      "Industry-standard petroleum oil, hydraulic fluid, and grease-resistant O-rings precision-molded with flash-free parting lines.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-27.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-neoprene-orings",
    name: "Neoprene O-Rings",
    division: "rubber",
    category: "Neoprene",
    materialBadge: "Neoprene (CR)",
    specs: "Ozone, Freon & Weather Resistant",
    description:
      "Durable chloroprene O-rings suited for HVAC/R compressors, outdoor enclosures, and moderate chemical sealing duties.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-7.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-silicone-seals",
    name: "Silicone Rubber Seals & Profiles",
    division: "rubber",
    category: "Silicone",
    materialBadge: "Silicone (VMQ)",
    specs: "Custom Lip, U-Channel & Lip-Seal Geometries",
    description:
      "Custom-molded and extruded silicone sealing rings and profile seals for lighting, autoclave, electronics, and cleanroom equipment.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-8.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-nbr-seals",
    name: "NBR / Nitrile Hydraulic & Rotary Seals",
    division: "rubber",
    category: "NBR / Nitrile",
    materialBadge: "Nitrile (NBR)",
    specs: "Dynamic & Static Oil Sealing",
    description:
      "Custom nitrile wiper seals, piston cups, and shaft sealing profiles providing low friction and long wear life in hydraulic cylinders.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-28.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-nbr-diaphragms",
    name: "NBR / Nitrile Diaphragms",
    division: "rubber",
    category: "NBR / Nitrile",
    materialBadge: "Nitrile (NBR)",
    specs: "Oil, Pneumatic & Fuel Actuator Grade",
    description:
      "Molded nitrile rubber diaphragms engineered for pneumatic actuators, automotive fuel pumps, and industrial compressors.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-30.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-neoprene-gaskets",
    name: "Neoprene Gaskets & Washers",
    division: "rubber",
    category: "Neoprene",
    materialBadge: "Neoprene (CR)",
    specs: "Flame-Retardant & Marine Weather Grade",
    description:
      "Precision neoprene flange gaskets, flat washers, and cushioning pads resistant to salt water, weathering, and mechanical flexing.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-21.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-neoprene-diaphragms",
    name: "Neoprene Diaphragms",
    division: "rubber",
    category: "Neoprene",
    materialBadge: "Neoprene (CR)",
    specs: "High Flex Fatigue Resistance",
    description:
      "Custom chloroprene diaphragms designed for water control valves, vacuum actuators, and industrial metering equipment.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-25.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-moulded-parts",
    name: "Bespoke Moulded Rubber Parts",
    division: "rubber",
    category: "Custom Molded",
    materialBadge: "All Elastomers",
    specs: "Built to 2D/3D CAD or Sample",
    description:
      "Complex 3D molded boots, bellows, bumpers, isolators, valve seats, and OEM inserts produced in custom multi-cavity tooling.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-40.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-grommets-wads",
    name: "Rubber Grommets & Sealing Wads",
    division: "rubber",
    category: "Custom Molded",
    materialBadge: "EPDM / Silicone / SBR / NBR",
    specs: "Panel Pass-Through & Vial/Container Sealing",
    description:
      "Precision cable protection grommets, blind plugs, and high-purity rubber sealing wads for electrical panels and industrial packaging.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-16.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-sheets-cords",
    name: "Industrial Rubber Sheets & Extruded Cords",
    division: "rubber",
    category: "Sheets & Cords",
    materialBadge: "Viton · Silicone · NBR · Neoprene · NR",
    specs: "0.5 mm – 50 mm Thickness · Custom Cord Ø",
    description:
      "Calendered elastomer sheets and continuous extruded round/square cords in Viton, Silicone, Nitrile, Neoprene, and Natural Rubber.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-10.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-natural-rubber",
    name: "Natural Rubber Gaskets, Washers & Diaphragms",
    division: "rubber",
    category: "Natural & Custom",
    materialBadge: "Natural Rubber (NR)",
    specs: "High Tensile Resilience & Abrasion Resistance",
    description:
      "High-elasticity natural rubber components ideal for slurry handling, chute lining washers, shock absorption, and dynamic flexing.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-31.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
  {
    id: "rb-custom-colors",
    name: "Color-Coded Compounds (Bahama Blue & Blue Pearl)",
    division: "rubber",
    category: "Natural & Custom",
    materialBadge: "Custom Pigmented Elastomers",
    specs: "Visual Line Identification & Food/Detectable Grades",
    description:
      "Custom color-matched molded parts and sheets—including signature Bahama Blue and Blue Pearl compounds—for instant visual grade identification on OEM assembly lines.",
    remoteImage: "https://ssquareengg.com/storage/2025/12/rubber-14.jpg",
    fallbackImage: "/images/division-rubber.jpg",
  },
];

export const STEEL_PRODUCTS: ProductItem[] = [
  {
    id: "st-cnc-shafts",
    name: "Precision CNC-Turned Stainless Shafts & Spindles",
    division: "steel",
    category: "CNC Turned & Milled",
    materialBadge: "SS 304 / SS 316 / EN24",
    specs: "Concentricity ≤ 0.015 mm · Ground & Threaded",
    description:
      "Stepped, threaded, splined, and keyway-slotted stainless and alloy steel shafts engineered for pumps, motors, conveyors, and rotary equipment.",
    remoteImage: "https://ssquareengg.com/storage/2026/02/steel-7.jpg",
    fallbackImage: "/images/division-steel.jpg",
  },
  {
    id: "st-flanges-couplings",
    name: "High-Pressure Steel Flanges & Machined Couplings",
    division: "steel",
    category: "Flanges & Fittings",
    materialBadge: "SS 316L / Carbon Steel",
    specs: "ANSI / DIN / Custom OEM Bolt Patterns",
    description:
      "Precision-faced weld-neck, blind, and custom manifold flanges with serrated sealing faces for zero-leakage process piping and hydraulics.",
    remoteImage: "https://ssquareengg.com/storage/2026/02/steel-19.jpg",
    fallbackImage: "/images/division-steel.jpg",
  },
  {
    id: "st-fabricated-brackets",
    name: "Laser-Cut & TIG-Welded Steel Brackets & Frames",
    division: "steel",
    category: "Sheet & Structural Fabrication",
    materialBadge: "SS 304 / Mild Steel",
    specs: "CNC Laser + Press-Brake + Precision Weld",
    description:
      "Heavy-gauge mounting brackets, gusseted machine supports, equipment skids, and enclosures fabricated with clean, distortion-controlled welds.",
    remoteImage: "https://ssquareengg.com/storage/2026/02/steel-27.jpg",
    fallbackImage: "/images/division-steel.jpg",
  },
  {
    id: "st-bushings-sleeves",
    name: "Hardened Steel Bushings, Spacers & Collars",
    division: "steel",
    category: "CNC Turned & Milled",
    materialBadge: "SS 410 / EN8 / EN19",
    specs: "Heat-Treated & Precision Bore Honed",
    description:
      "Wear-resistant cylindrical bushings, shaft lock collars, distance sleeves, and bearing housings machined to tight H7/g6 fits.",
    remoteImage: "https://ssquareengg.com/storage/2026/02/steel-12.jpg",
    fallbackImage: "/images/division-steel.jpg",
  },
  {
    id: "st-fasteners-studs",
    name: "Custom Special-Purpose Bolts, Studs & Pins",
    division: "steel",
    category: "Fasteners & Hardware",
    materialBadge: "SS 316 / High-Tensile 8.8 & 10.9",
    specs: "Metric, UNC/UNF & Non-Standard Thread Profiles",
    description:
      "Non-standard shoulder bolts, clevis pins, anchor studs, and machined captive hardware built to OEM print when off-the-shelf fasteners fall short.",
    remoteImage: "https://ssquareengg.com/storage/2026/02/steel-5.jpg",
    fallbackImage: "/images/division-steel.jpg",
  },
  {
    id: "st-valve-manifolds",
    name: "Stainless Valve Bodies, Blocks & Fluid Fittings",
    division: "steel",
    category: "Flanges & Fittings",
    materialBadge: "SS 316L Passivated",
    specs: "High Chromium Corrosion & Oxidation Resistance",
    description:
      "Precision-bored hydraulic blocks, hose adaptors, nozzle bodies, and instrumentation fittings engineered for corrosive and high-temperature media.",
    remoteImage: "https://ssquareengg.com/storage/2026/02/steel-24.jpg",
    fallbackImage: "/images/division-steel.jpg",
  },
  {
    id: "st-bonded-inserts",
    name: "Stamped & Machined Metal Inserts for Bonded Seals",
    division: "steel",
    category: "Sheet & Structural Fabrication",
    materialBadge: "SS 304 / Zinc-Plated Steel",
    specs: "Surface-Prepared for Elastomer Vulcanization",
    description:
      "In-house production of metal retaining washers and structural cores used in our rubber-to-metal bonded seals and anti-vibration mounts—giving you single-vendor accountability.",
    remoteImage: "https://ssquareengg.com/storage/2026/02/steel-14.jpg",
    fallbackImage: "/images/division-steel.jpg",
  },
  {
    id: "st-industrial-assemblies",
    name: "Industrial Sub-Assemblies & Special-Purpose Parts",
    division: "steel",
    category: "Assemblies",
    materialBadge: "Multi-Grade Steel + Rubber",
    specs: "Turnkey Kitted & Pre-Assembled",
    description:
      "Complete mechanical sub-assemblies integrating machined steel housings, fasteners, and custom elastomeric seals—inspected and ready for your production line.",
    remoteImage: "https://ssquareengg.com/storage/2026/01/2s.jpg",
    fallbackImage: "/images/division-steel.jpg",
  },
];

export const ALUMINIUM_PRODUCTS: ProductItem[] = [
  {
    id: "al-die-molds",
    name: "Precision CNC Aluminium Die Molds & Multi-Cavity Tooling",
    division: "aluminium",
    category: "Die Molds & Tooling",
    materialBadge: "Billet 6061 / 7075 Tooling",
    specs: "High-Speed 3D Cavity Milling · Mirror Polish",
    description:
      "Custom-engineered aluminium die molds, compression/blow molds, and prototype production tooling machined with tight parting-line accuracy and rapid thermal transfer.",
    remoteImage: "https://ssquareengg.com/storage/2026/01/al1.jpg",
    fallbackImage: "/images/division-aluminium.jpg",
  },
  {
    id: "al-6061-machined",
    name: "6061-T6 CNC Machined Structural & Aerospace Parts",
    division: "aluminium",
    category: "CNC Machined",
    materialBadge: "Aluminium 6061-T6",
    specs: "High Strength-to-Weight · ±0.01 mm Precision",
    description:
      "Complex 3-axis and 4-axis milled billet components, actuator blocks, sensor brackets, and lightweight mechanical housings for automotive, robotics, and aerospace.",
    remoteImage: "https://ssquareengg.com/storage/2026/01/al6.jpg",
    fallbackImage: "/images/division-aluminium.jpg",
  },
  {
    id: "al-electronic-enclosures",
    name: "Conductive & Anodized Electronic Enclosures & Heatsinks",
    division: "aluminium",
    category: "Enclosures & Thermal",
    materialBadge: "6061 / 6063 Anodized",
    specs: "High Thermal & Electrical Conductivity",
    description:
      "Finned thermal management heatsinks, RF/EMI shielded housings, and weather-sealed control boxes finished with clear, black, or color anodizing.",
    remoteImage: "https://ssquareengg.com/storage/2026/01/al7.jpg",
    fallbackImage: "/images/division-aluminium.jpg",
  },
  {
    id: "al-extruded-profiles",
    name: "Custom Aluminium Profiles & Extruded Sections",
    division: "aluminium",
    category: "Profiles & Sheets",
    materialBadge: "6063-T5 / 6061-T6",
    specs: "Cut-to-Length · Drilled · Tapped · Anodized",
    description:
      "Custom-extruded structural channels, framing profiles, guide rails, and architectural/industrial sections complete with secondary CNC machining.",
    remoteImage: "https://ssquareengg.com/storage/2026/01/al8.jpg",
    fallbackImage: "/images/division-aluminium.jpg",
  },
  {
    id: "al-mold-cavities",
    name: "Split-Block Mold Cavities & Forming Dies",
    division: "aluminium",
    category: "Die Molds & Tooling",
    materialBadge: "Precision Tooling Alloy",
    specs: "CAD/CAM Direct Machining · Fast Lead Time",
    description:
      "Matched core-and-cavity aluminium die sets with precision alignment dowels and venting channels for rubber, polymer, and composite forming.",
    remoteImage: "https://ssquareengg.com/storage/2026/01/al5.jpg",
    fallbackImage: "/images/division-aluminium.jpg",
  },
  {
    id: "al-sheets-plates",
    name: "Precision-Cut Aluminium Sheets, Plates & Baseplates",
    division: "aluminium",
    category: "Profiles & Sheets",
    materialBadge: "5052 / 6061 / 6082",
    specs: "Laser Cut · Blanchard Ground · Powder Coated",
    description:
      "Flatness-verified fixture plates, machine baseplates, marine-grade panels, and formed sheet metal covers with corrosion-resistant finishes.",
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
    material: "Viton® / FKM Elastomer",
    division: "rubber",
    tempRange: "-20°C to +250°C",
    keyStrength: "Extreme fuel, oil, acid & high-heat resistance",
    typicalParts: "Bonded seals, chemical gaskets, pump diaphragms, O-rings",
    finishOrGrade: "60–90 Shore A · Black / Brown / Green",
  },
  {
    id: "vmq",
    material: "Silicone (VMQ)",
    division: "rubber",
    tempRange: "-60°C to +230°C",
    keyStrength: "Wide thermal stability, UV/ozone & clean/FDA compliance",
    typicalParts: "Autoclave gaskets, thin diaphragms, extruded cords, seals",
    finishOrGrade: "30–80 Shore A · Translucent / Red / Bahama Blue",
  },
  {
    id: "nbr-hnbr",
    material: "NBR / HNBR Nitrile",
    division: "rubber",
    tempRange: "-40°C to +165°C",
    keyStrength: "Hydraulic oil, petroleum, abrasion & high tensile tear strength",
    typicalParts: "Hydraulic O-rings, Metal-to-HNBR bonded seals, rotary seals",
    finishOrGrade: "50–90 Shore A · Industrial & Automotive OEM",
  },
  {
    id: "epdm-cr",
    material: "EPDM & Neoprene (CR)",
    division: "rubber",
    tempRange: "-50°C to +150°C",
    keyStrength: "Steam, potable water, outdoor weather, ozone & refrigerant resistance",
    typicalParts: "Metal-to-EPDM seals, weather gaskets, cable grommets, washers",
    finishOrGrade: "40–85 Shore A · Flame & Weather Grades",
  },
  {
    id: "ss316",
    material: "Stainless Steel 304 / 316L",
    division: "steel",
    tempRange: "-196°C to +870°C",
    keyStrength: "Chromium-oxide corrosion defense, high strength & hygiene",
    typicalParts: "CNC shafts, pressure flanges, TIG brackets, valve bodies",
    finishOrGrade: "Passivated · Machined Ra 0.8 · Electropolished",
  },
  {
    id: "alloy-steel",
    material: "Alloy & Structural Steel (EN8/EN24)",
    division: "steel",
    tempRange: "-40°C to +500°C",
    keyStrength: "High torque, wear hardness, fatigue & heavy structural load",
    typicalParts: "Splined shafts, hardened bushings, special fasteners, frames",
    finishOrGrade: "Induction Hardened · Zinc Plated · Black Oxide",
  },
  {
    id: "al6061",
    material: "Aluminium 6061-T6 & Tool Billet",
    division: "aluminium",
    tempRange: "-80°C to +200°C",
    keyStrength: "High strength-to-weight, machinability, thermal/electrical conductivity",
    typicalParts: "Aluminium Die Molds, CNC housings, heatsinks, extruded profiles",
    finishOrGrade: "Type II/III Anodized · Powder Coated · 100% Recyclable",
  },
];
