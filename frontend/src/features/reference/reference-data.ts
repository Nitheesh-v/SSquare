import { MATERIALS, STORY_STEPS } from "@/features/journey/journey-data";

/** Reference art direction, not approved company CAD or a product specification. */
export const REFERENCE_MATERIALS = MATERIALS.map((m, i) => ({
  ...m,
  color: ["#111a2b", "#22364d", "#4b5968"][i],
  part: [
    "Rubber-to-metal seal",
    "Machined hex nut",
    "Machined aluminium housing",
  ][i],
  line: [
    "Seals, gaskets, O-rings, cords, sheets & rubber-to-metal bonded components.",
    "Custom steel and stainless components. Turned, milled and finished for your application.",
    "Grade 6061 die molds, housings, plates & precision machined tooling.",
  ][i],
}));

export const REFERENCE_GLOWS = ["#e8712a8c", "#7ea6d08c", "#cdd6e080"];
export const REFERENCE_STEPS = STORY_STEPS.map((s, i) => ({
  ...s,
  label: [
    "Material intelligence",
    "Geometry & interface",
    "Application review",
    "Your material",
  ][i],
  heading: [
    ["Less weight.", "More possibility."],
    ["Every interface", "has a purpose."],
    ["Consider the part.", "Define the fit."],
    ["Your", "material."],
  ][i],
  caption: [
    "Rubber, steel or aluminium.\nThe right family for the job.",
    "Profiles, bores, faces & cavities.\nDrawing, sample or sketch.",
    "Material. Geometry. Finish.\nConsidered together.",
    "Your specification.\nOur starting point.",
  ][i],
}));
