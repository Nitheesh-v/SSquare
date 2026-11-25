import { Boxes, Component, Cuboid, Gauge, Layers3, Palette } from 'lucide-react';

const STACK = [
  {
    icon: <Cuboid size={16} />,
    name: 'Three.js r0.187',
    role: 'WebGL rendering engine',
    detail:
      'Geometries, PBR materials, PCF soft shadows, raycasting and the animation loop — all running in the browser.',
  },
  {
    icon: <Component size={16} />,
    name: 'React 19 + TypeScript',
    role: 'UI state & chapters',
    detail:
      'Scroll chapters, catalog tabs, the interactive BOM and the CAD workbench, with strict typing across the 3D bridge.',
  },
  {
    icon: <Gauge size={16} />,
    name: 'Vite 7',
    role: 'Dev server & bundler',
    detail:
      'Instant HMR over the scene module graph and an optimized production build of the entire experience.',
  },
  {
    icon: <Palette size={16} />,
    name: 'Tailwind v4 + Lucide',
    role: 'Glassmorphic CAD HUD',
    detail:
      'backdrop-filter: blur(16px) glass panels, responsive grid layouts and consistent technical iconography.',
  },
  {
    icon: <Boxes size={16} />,
    name: 'Procedural geometry',
    role: 'Zero 3D asset downloads',
    detail:
      'Involute gears extruded from THREE.Shape profiles, bezier-curve elastomer spiders, finned housings — built in code.',
  },
  {
    icon: <Layers3 size={16} />,
    name: 'PMREM studio lighting',
    role: 'Procedural HDR environment',
    detail:
      'A virtual light-tent baked with PMREMGenerator gives every metal realistic reflections with no image downloads.',
  },
];

const PIPELINE = [
  'Extruded involute gear profiles (THREE.Shape + THREE.ExtrudeGeometry) with chamfered bevels',
  'Bezier-molded 6-lobe elastomer spider with dual-lip Viton seal tori',
  '18 radially arrayed CNC cooling fins with socket-head perimeter hardware',
  'Scroll-normalized explode progress with smoothstep easing and delta-time damping',
  '60fps kinematics: 16:12 planetary mesh + harmonic elastomer damping wave',
  '6 callout pins projected to screen space via translate3d — zero React re-renders',
];

export default function TechStack() {
  return (
    <section id="tech" className="relative border-t border-white/8 bg-[#080b10] py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
        <span className="font-mono text-[11px] tracking-[0.28em] text-[#00f0ff]">
          CORE TECHNOLOGY STACK
        </span>
        <h2 className="mt-1 text-[28px] font-semibold tracking-tight text-white sm:text-[36px]">
          Engineered in code, not in CAD exports.
        </h2>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STACK.map((item) => (
            <div
              key={item.name}
              className="glass group rounded-xl p-5 transition-colors hover:border-[#00f0ff]/35"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md border border-[#00f0ff]/30 bg-[#00f0ff]/8 text-[#00f0ff]">
                  {item.icon}
                </span>
                <div>
                  <div className="text-[13.5px] font-semibold text-white">{item.name}</div>
                  <div className="font-mono text-[9px] tracking-[0.14em] text-slate-500 uppercase">
                    {item.role}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-slate-400">{item.detail}</p>
            </div>
          ))}
        </div>

        {/* Build pipeline */}
        <div className="glass mt-4 rounded-xl p-6">
          <div className="font-mono text-[10px] tracking-[0.22em] text-[#f97316]">
            BUILD PIPELINE — src/three/buildEngineeringAssembly.ts
          </div>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {PIPELINE.map((line, i) => (
              <li key={line} className="flex items-start gap-2.5 text-[12px] text-slate-300">
                <span className="mt-0.5 font-mono text-[10px] text-[#00f0ff]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
