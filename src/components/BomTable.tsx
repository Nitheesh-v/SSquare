import { ArrowUpRight } from 'lucide-react';
import type { PartId } from '../three/buildEngineeringAssembly';
import { PARTS } from '../parts';

interface Props {
  onHoverPart: (id: PartId | null) => void;
  onSelectPart: (id: PartId) => void;
}

export default function BomTable({ onHoverPart, onSelectPart }: Props) {
  return (
    <section id="bom" className="relative border-t border-white/8 bg-[#07090c] py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[11px] tracking-[0.28em] text-[#00f0ff]">
              INTERACTIVE BILL OF MATERIALS
            </span>
            <h2 className="text-[28px] font-semibold tracking-tight text-white sm:text-[36px]">
              Every part, accounted for.
            </h2>
            <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-slate-400">
              Hover a row to light up its sub-assembly in the 3D scene above — or open it in
              the part inspector.
            </p>
          </div>
          <div className="flex gap-3 font-mono text-[10px] tracking-[0.14em] text-slate-500">
            <div className="glass rounded-md px-3 py-2">
              TOTAL PARTS <span className="ml-1.5 text-[#00f0ff]">32</span>
            </div>
            <div className="glass rounded-md px-3 py-2">
              DRY MASS <span className="ml-1.5 text-[#00f0ff]">10.71 kg</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="glass thin-scroll mt-8 overflow-x-auto rounded-xl">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 font-mono text-[9px] tracking-[0.2em] text-slate-500 uppercase">
                <th className="px-5 py-3.5 font-medium">Item</th>
                <th className="px-5 py-3.5 font-medium">Part</th>
                <th className="px-5 py-3.5 font-medium">Material</th>
                <th className="px-5 py-3.5 font-medium">Process</th>
                <th className="px-5 py-3.5 font-medium">Qty</th>
                <th className="px-5 py-3.5 font-medium">Mass</th>
                <th className="px-5 py-3.5 font-medium" />
              </tr>
            </thead>
            <tbody>
              {PARTS.map((part) => (
                <tr
                  key={part.id}
                  onMouseEnter={() => onHoverPart(part.id)}
                  onMouseLeave={() => onHoverPart(null)}
                  onClick={() => onSelectPart(part.id)}
                  className="group cursor-pointer border-b border-white/6 transition-colors last:border-b-0 hover:bg-[#00f0ff]/7"
                >
                  <td className="px-5 py-3.5 font-mono text-[11px] text-[#00f0ff]">
                    {part.index}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-slate-100">
                    {part.name}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-300">
                    {part.material}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">
                    {part.process}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-300">
                    {part.qty}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-300">
                    {part.mass}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 rounded border border-white/10 px-2 py-1 font-mono text-[9px] tracking-wider text-slate-500 transition-colors group-hover:border-[#00f0ff]/50 group-hover:text-[#00f0ff]">
                      INSPECT
                      <ArrowUpRight size={11} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
