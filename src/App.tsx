import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, MousePointerClick, RotateCcw } from 'lucide-react';
import Header from './components/Header';
import ThreeEngineeringScene from './components/ThreeEngineeringScene';
import type { SceneSettings } from './components/ThreeEngineeringScene';
import Workbench from './components/Workbench';
import PartInspector from './components/PartInspector';
import ProductCatalog from './components/ProductCatalog';
import BomTable from './components/BomTable';
import TechStack from './components/TechStack';
import Footer from './components/Footer';
import type { PartId } from './three/buildEngineeringAssembly';

/* ------------------------------------------------------------------ */
/*  Scroll chapters                                                    */
/* ------------------------------------------------------------------ */

const CHAPTERS: Array<{
  kicker: string;
  title: string;
  body: string;
  focus: PartId;
  focusLabel: string;
}> = [
  {
    kicker: '00 / OVERVIEW',
    title: 'SSQ-9400 Multi-Material OEM Assembly',
    body: 'A fully procedural engineering model — every gear tooth, seal lip and cooling fin built with parametric CAD math in Three.js. Scroll to disassemble it.',
    focus: 'gear-train',
    focusLabel: 'FULL ASSEMBLY',
  },
  {
    kicker: '01 / GEAR TRAIN',
    title: 'Extruded Involute Steel Gears',
    body: 'The central EN24 sun gear and splined rotor shaft mesh with four planetary pinions at an exact 16:12 tooth ratio — 2D involute profiles extruded with chamfered bevels and radial lightening holes.',
    focus: 'gear-train',
    focusLabel: 'HIGHLIGHTED: GEAR TRAIN',
  },
  {
    kicker: '02 / COUPLING',
    title: 'Molded Elastomer Spider',
    body: 'A six-lobe vulcanized EPDM spider cushions the jaw coupling, modeled with bezier-profile geometry and paired with dual-lip Viton hydraulic seals and NBR O-rings.',
    focus: 'coupler',
    focusLabel: 'HIGHLIGHTED: SPIDER COUPLER',
  },
  {
    kicker: '03 / HOUSING',
    title: '5-Axis CNC Finned Aluminium',
    body: '6061-T6 aluminium with brushed satin PBR response — 30 radially arrayed cooling fins, socket-head perimeter bolts and cyan anodized accent rings.',
    focus: 'housing',
    focusLabel: 'HIGHLIGHTED: FINNED HOUSING',
  },
  {
    kicker: '04 / ISOLATION',
    title: 'Ribbed Anti-Vibration Mounts',
    body: 'Four EPDM mounts with concentric compression ribs and stainless studs absorb harmonic vibration — watch the elastomer squash-and-stretch in real time.',
    focus: 'mounts',
    focusLabel: 'HIGHLIGHTED: A/V MOUNTS',
  },
  {
    kicker: '05 / EXPLODED VIEW',
    title: 'Full Bill of Materials',
    body: 'Every sub-assembly separated along its explosion vector. Click any part to inspect its material spec, or open the interactive BOM below.',
    focus: 'shaft',
    focusLabel: '32 PARTS · 7 SUB-ASSEMBLIES',
  },
];

// Chapter band edges over normalized scroll progress.
const BANDS = [0, 0.14, 0.32, 0.5, 0.68, 0.86, 1.0];

function chapterFromProgress(p: number): number {
  for (let i = 0; i < BANDS.length - 1; i++) {
    if (p <= BANDS[i + 1]) return i;
  }
  return CHAPTERS.length - 1;
}

/* ================================================================== */

export default function App() {
  const [settings, setSettings] = useState<SceneSettings>({
    autoRotate: false,
    gearSpeed: 1,
    vibration: 0.55,
    explode: null,
    shadows: true,
    envIntensity: 1,
    xray: false,
    resetNonce: 0,
  });
  const [selectedPart, setSelectedPart] = useState<PartId | null>(null);
  const [highlightPart, setHighlightPart] = useState<PartId | null>(null);
  const [chapter, setChapter] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const chapterPulseTimer = useRef<number | null>(null);

  const patchSettings = useCallback((patch: Partial<SceneSettings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  /* Scroll → chapter tracking */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        setScrolled(window.scrollY > 60);
        const el = document.getElementById('experience');
        if (!el) return;
        const total = el.offsetHeight - window.innerHeight;
        const progress = total > 0 ? Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total)) : 0;
        setChapter((c) => {
          const next = chapterFromProgress(progress);
          return next === c ? c : next;
        });
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Chapter change → pulse the focused sub-assembly */
  useEffect(() => {
    const focus = CHAPTERS[chapter].focus;
    setHighlightPart(focus);
    if (chapterPulseTimer.current !== null) window.clearTimeout(chapterPulseTimer.current);
    chapterPulseTimer.current = window.setTimeout(() => setHighlightPart(null), 1600);
    return () => {
      if (chapterPulseTimer.current !== null) window.clearTimeout(chapterPulseTimer.current);
    };
  }, [chapter]);

  /* Escape closes the inspector */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPart(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* BOM row click → jump back into the 3D experience */
  const inspectFromBom = useCallback((id: PartId) => {
    setSelectedPart(id);
    const el = document.getElementById('experience');
    if (el) {
      const y = el.offsetTop + (el.offsetHeight - window.innerHeight) * 0.35;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  const activeChapter = CHAPTERS[chapter];

  return (
    <div id="top" className="min-h-screen bg-[#07090c]">
      <Header />

      <main>
        {/* ================= 3D SCROLL EXPERIENCE ================= */}
        <section id="experience" className="relative h-[560vh]">
          <div className="sticky top-0 h-screen overflow-hidden">
            <ThreeEngineeringScene
              settings={settings}
              highlightPart={highlightPart}
              selectedPart={selectedPart}
              onSelectPart={setSelectedPart}
            />

            {/* ---- Top-left product identity ---- */}
            <div className="pointer-events-none absolute top-20 left-4 z-20 sm:left-8">
              <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.22em] text-[#00f0ff]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
                LIVE WEBGL · PROCEDURAL MODEL
              </div>
              <h1 className="mt-2 text-[34px] leading-[1.02] font-semibold tracking-tight text-white sm:text-[52px]">
                SSQ-9400
              </h1>
              <p className="mt-1 max-w-[22rem] text-[13px] leading-relaxed text-slate-300 sm:text-[15px]">
                Multi-Material OEM Assembly — steel, aluminium &amp; elastomer,
                generated entirely in code.
              </p>
            </div>

            {/* ---- Chapter card (crossfading) ---- */}
            {!selectedPart && (
              <div className="pointer-events-none absolute bottom-6 left-4 z-20 w-[21rem] sm:left-8 sm:w-[25rem]">
                <div key={chapter} className="glass chapter-card rounded-xl p-5">
                  <div className="font-mono text-[10px] tracking-[0.24em] text-[#00f0ff]">
                    {activeChapter.kicker}
                  </div>
                  <h2 className="mt-2 text-[19px] leading-snug font-semibold text-white">
                    {activeChapter.title}
                  </h2>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-slate-300">
                    {activeChapter.body}
                  </p>
                  <div className="mt-3.5 flex items-center gap-2">
                    <span className="rounded border border-white/12 bg-white/5 px-2 py-1 font-mono text-[8.5px] tracking-[0.16em] text-slate-400">
                      {activeChapter.focusLabel}
                    </span>
                    <span className="rounded border border-white/12 bg-white/5 px-2 py-1 font-mono text-[8.5px] tracking-[0.16em] text-slate-400">
                      {String(chapter + 1).padStart(2, '0')} / 06
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ---- Part inspector ---- */}
            {selectedPart && (
              <PartInspector partId={selectedPart} onClose={() => setSelectedPart(null)} />
            )}

            {/* ---- CAD workbench ---- */}
            <Workbench
              settings={settings}
              onChange={patchSettings}
              onResetView={() =>
                setSettings((s) => ({ ...s, resetNonce: s.resetNonce + 1, explode: null }))
              }
            />

            {/* ---- Scroll hint ---- */}
            <div
              className={`pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2 text-center transition-opacity duration-500 ${
                scrolled ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <div className="flex items-center gap-2 font-mono text-[9.5px] tracking-[0.22em] text-slate-400">
                <MousePointerClick size={13} className="text-[#00f0ff]" />
                DRAG TO ORBIT · CLICK PARTS TO INSPECT
              </div>
              <div className="bob mt-2 flex flex-col items-center gap-0.5 text-[#00f0ff]">
                <span className="font-mono text-[9px] tracking-[0.3em]">SCROLL TO DISASSEMBLE</span>
                <ChevronDown size={16} />
              </div>
            </div>

            {/* ---- Chapter rail ---- */}
            <div className="pointer-events-none absolute top-1/2 right-4 z-20 hidden -translate-y-1/2 flex-col items-end gap-2 lg:flex">
              {CHAPTERS.map((c, i) => (
                <div
                  key={c.kicker}
                  className="flex items-center gap-2 font-mono text-[8.5px] tracking-[0.18em]"
                >
                  <span className={i === chapter ? 'text-[#00f0ff]' : 'text-slate-600'}>
                    {String(i).padStart(2, '0')}
                  </span>
                  <span
                    className={`h-px transition-all duration-300 ${
                      i === chapter ? 'w-8 bg-[#00f0ff]' : 'w-4 bg-slate-700'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CATALOG / BOM / TECH ================= */}
        <ProductCatalog />
        <BomTable onHoverPart={setHighlightPart} onSelectPart={inspectFromBom} />
        <TechStack />
      </main>

      <Footer />

      {/* Floating reset (visible while browsing content sections) */}
      <button
        type="button"
        onClick={() => {
          const el = document.getElementById('experience');
          if (el) window.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
          setSelectedPart(null);
        }}
        className="glass fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-md px-3.5 py-2.5 font-mono text-[10px] tracking-[0.16em] text-slate-300 transition-colors hover:text-[#00f0ff]"
      >
        <RotateCcw size={13} />
        BACK TO 3D
      </button>
    </div>
  );
}
