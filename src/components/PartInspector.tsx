import { X } from 'lucide-react';
import type { PartId } from '../three/buildEngineeringAssembly';
import { PART_BY_ID } from '../parts';

interface Props {
  partId: PartId;
  onClose: () => void;
}

export default function PartInspector({ partId, onClose }: Props) {
  const part = PART_BY_ID[partId];

  return (
    <div className="glass-strong absolute bottom-24 left-4 z-30 w-[19rem] rounded-lg sm:w-80">
      {/* Header strip */}
      <div className="flex items-start justify-between border-b border-white/10 px-4 py-3">
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] text-[#00f0ff]">
            PART INSPECTOR · ITEM {part.index}
          </div>
          <h3 className="mt-1 text-[15px] leading-tight font-semibold text-white">
            {part.name}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close inspector"
          className="rounded p-1 text-slate-400 transition-colors hover:bg-white/8 hover:text-white"
        >
          <X size={15} />
        </button>
      </div>

      <div className="px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded border border-[#00f0ff]/30 bg-[#00f0ff]/8 px-2 py-0.5 font-mono text-[9px] tracking-wider text-[#00f0ff]">
            {part.material}
          </span>
          <span className="rounded border border-white/12 bg-white/5 px-2 py-0.5 font-mono text-[9px] tracking-wider text-slate-400">
            QTY {part.qty}
          </span>
          <span className="rounded border border-white/12 bg-white/5 px-2 py-0.5 font-mono text-[9px] tracking-wider text-slate-400">
            {part.mass}
          </span>
        </div>

        <p className="mt-2.5 text-[12px] leading-relaxed text-slate-300">{part.summary}</p>

        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
          {part.specs.map((s) => (
            <div key={s.label} className="rounded border border-white/8 bg-white/3 px-2 py-1.5">
              <dt className="font-mono text-[8px] tracking-[0.14em] text-slate-500 uppercase">
                {s.label}
              </dt>
              <dd className="mt-0.5 font-mono text-[11px] text-slate-200">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
