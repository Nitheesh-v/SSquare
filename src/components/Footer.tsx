import { Box } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[#060809] py-10">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#00f0ff]/40 bg-[#00f0ff]/10 text-[#00f0ff]">
            <Box size={18} />
          </span>
          <div>
            <div className="text-[14px] font-semibold text-white">SSquare</div>
            <div className="font-mono text-[9.5px] tracking-[0.18em] text-slate-500">
              SSQ-9400 MULTI-MATERIAL OEM ASSEMBLY
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] tracking-[0.12em] text-slate-500">
          <span>THREE.JS r0.187</span>
          <span>REACT 19</span>
          <span>VITE 7</span>
          <span>TAILWIND v4</span>
          <span className="text-[#00f0ff]/70">PROCEDURAL · 0 ASSETS</span>
        </div>

        <div className="text-[11px] text-slate-500">
          © {new Date().getFullYear()} SSquare OEM Systems · Coimbatore, IN
        </div>
      </div>
    </footer>
  );
}
