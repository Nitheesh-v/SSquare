import type { PartId } from './three/buildEngineeringAssembly';

export interface PartSpec {
  id: PartId;
  index: string;
  name: string;
  material: string;
  process: string;
  qty: number;
  mass: string;
  summary: string;
  specs: Array<{ label: string; value: string }>;
}

export const PARTS: PartSpec[] = [
  {
    id: 'gear-train',
    index: '01',
    name: 'Involute Steel Gear Train',
    material: 'EN24 Hardened Steel',
    process: 'Hobbed + case-hardened',
    qty: 5,
    mass: '2.14 kg',
    summary:
      'Central 16-tooth sun gear meshing with four 12-tooth planetary pinions — extruded from 2D involute profiles with chamfered bevels and radial lightening holes.',
    specs: [
      { label: 'Tooth ratio', value: '16 : 12 (sun : pinion)' },
      { label: 'Face width', value: '30 mm' },
      { label: 'Hardness', value: '58–62 HRC' },
      { label: 'Backlash', value: '0.08 mm' },
    ],
  },
  {
    id: 'coupler',
    index: '02',
    name: 'Elastomer Spider Coupler',
    material: 'Vulcanized EPDM (70A)',
    process: 'Compression molded',
    qty: 1,
    mass: '0.31 kg',
    summary:
      'Six-lobe jaw-coupling spider modeled with bezier-profile geometry, cushioning the steel hub stack and absorbing torsional shock.',
    specs: [
      { label: 'Lobes', value: '6' },
      { label: 'Torsional stiffness', value: '42 Nm/deg' },
      { label: 'Damping ratio', value: '0.18 ζ' },
      { label: 'Temp range', value: '−40 °C … +150 °C' },
    ],
  },
  {
    id: 'housing',
    index: '03',
    name: '5-Axis CNC Finned Housing',
    material: 'Aluminium 6061-T6',
    process: '5-axis CNC + anodize',
    qty: 2,
    mass: '4.82 kg',
    summary:
      'Upper and lower billet shells with 30 radially arrayed cooling fins, socket-head perimeter bolts and cyan anodized accent rings.',
    specs: [
      { label: 'Fins', value: '18 primary + 12 secondary' },
      { label: 'Surface', value: 'Brushed satin, Type II anodize' },
      { label: 'Metalness / roughness', value: '0.84 / 0.23' },
      { label: 'Thermal', value: '167 W/m·K' },
    ],
  },
  {
    id: 'shaft',
    index: '04',
    name: 'Splined Rotor Shaft',
    material: 'SS316L Stainless',
    process: 'Turned + spline-rolled',
    qty: 1,
    mass: '1.63 kg',
    summary:
      'Continuous-rotation rotor with 12 spline keys and a coupling hub stack, running in phosphor-bronze bushings.',
    specs: [
      { label: 'Spline keys', value: '12' },
      { label: 'Runout', value: '≤ 0.02 mm TIR' },
      { label: 'Max speed', value: '6,400 rpm' },
      { label: 'Balance grade', value: 'G2.5' },
    ],
  },
  {
    id: 'seals',
    index: '05',
    name: 'Dual-Lip Hydraulic Seals',
    material: 'Viton FKM / NBR O-rings',
    process: 'Injection molded',
    qty: 8,
    mass: '0.09 kg',
    summary:
      'Dual-lip shaft seals at every housing penetration plus split-flange O-rings, keeping the gear chamber sealed to IP67.',
    specs: [
      { label: 'Lip config', value: 'Dual-lip, spring-loaded' },
      { label: 'Pressure', value: 'up to 16 bar' },
      { label: 'Sealing class', value: 'IP67' },
      { label: 'Media', value: 'Mineral / synthetic oil' },
    ],
  },
  {
    id: 'bushings',
    index: '06',
    name: 'Phosphor-Bronze Bushings',
    material: 'C54400 Phosphor-Bronze',
    process: 'Sintered + reamed',
    qty: 4,
    mass: '0.44 kg',
    summary:
      'Self-lubricating flanged bushings at each planet pin and shaft journal, machined for zero-press fit tolerance.',
    specs: [
      { label: 'Clearance', value: 'H7/g6 fit' },
      { label: 'PV limit', value: '1.8 MPa·m/s' },
      { label: 'Friction coeff.', value: '0.14 µ' },
      { label: 'Lubrication', value: 'Embedded graphite' },
    ],
  },
  {
    id: 'mounts',
    index: '07',
    name: 'Ribbed Anti-Vibration Mounts',
    material: 'EPDM Rubber + SS304',
    process: 'Rubber-to-metal bonded',
    qty: 4,
    mass: '1.28 kg',
    summary:
      'Quad corner mounts with elastomer cores, three concentric compression ribs and stainless studs — animated with a live harmonic damping wave.',
    specs: [
      { label: 'Ribs', value: '3 concentric' },
      { label: 'Natural frequency', value: '8.4 Hz' },
      { label: 'Isolation', value: '92% @ 25 Hz' },
      { label: 'Load per mount', value: '45 kg' },
    ],
  },
];

export const PART_BY_ID = Object.fromEntries(PARTS.map((p) => [p.id, p])) as Record<
  PartId,
  PartSpec
>;
