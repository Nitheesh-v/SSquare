import { Box, Menu, X } from 'lucide-react';
import { useState } from 'react';

const LINKS = [
  { href: '#experience', label: 'Overview' },
  { href: '#catalog', label: 'Catalog' },
  { href: '#bom', label: 'BOM' },
  { href: '#tech', label: 'Tech Stack' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-0 z-50">
      <div className="glass-strong border-b border-white/8">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-8">
          {/* Brand */}
          <a href="#top" className="group flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#00f0ff]/40 bg-[#00f0ff]/10 text-[#00f0ff] transition-shadow group-hover:shadow-[0_0_18px_rgba(0,240,255,0.35)]">
              <Box size={17} strokeWidth={2.2} />
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="text-[15px] font-semibold tracking-tight text-white">SSquare</span>
              <span className="hidden font-mono text-[10px] tracking-[0.18em] text-[#00f0ff]/80 sm:inline">
                OEM SYSTEMS
              </span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-1.5 text-[13px] text-slate-300 transition-colors hover:bg-white/6 hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#bom"
              className="rounded-md border border-[#00f0ff]/40 bg-[#00f0ff]/10 px-3.5 py-1.5 text-[12px] font-medium tracking-wide text-[#00f0ff] transition-colors hover:bg-[#00f0ff]/20"
            >
              REQUEST DATASHEET
            </a>
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
              className="rounded-md p-1.5 text-slate-300 hover:bg-white/6 md:hidden"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {open && (
          <nav className="flex flex-col gap-1 border-t border-white/8 px-4 pb-3 md:hidden">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-white/6"
              >
                {l.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
