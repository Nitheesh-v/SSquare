import { useState } from 'react';
import { ArrowRight, Boxes, Cpu, ShieldCheck, Thermometer, Vibrate, Wrench, Zap } from 'lucide-react';

const PRODUCTS = [
  {
    id: 'ssq-9400',
    tab: 'SSQ-9400',
    badge: 'FLAGSHIP',
    title: 'SSQ-9400 Multi-Material OEM Assembly',
    blurb:
      'The full multi-material drive module — planetary steel gear train, elastomer spider coupling, CNC finned aluminium housing and quad EPDM isolation mounts. This is the assembly rendered live on this page.',
    specs: [
      { label: 'Peak torque', value: '420 Nm' },
      { label: 'Gear ratio', value: '16:12 planetary' },
      { label: 'Dry mass', value: '10.71 kg' },
      { label: 'Ingress class', value: 'IP67' },
      { label: 'Temp range', value: '−40 … +150 °C' },
      { label: 'Max speed', value: '6,400 rpm' },
    ],
    features: [
      { icon: <Boxes size={13} />, text: '7 sub-assemblies · 32 part numbers' },
      { icon: <ShieldCheck size={13} />, text: 'Dual-lip Viton sealing to 16 bar' },
      { icon: <Vibrate /> , text: '92% vibration isolation @ 25 Hz' },
    ],
  },
  {
    id: 'ssq-9400x',
    tab: 'SSQ-9400/X',
    badge: 'EXTREME DUTY',
    title: 'SSQ-9400/X Extreme-Duty Package',
    blurb:
      'Cryogenic-grade elastomers, Xylan-coated fasteners and a hardened EN26 gear set rated for continuous shock loading in mobile hydraulics and offshore winch drives.',
    specs: [
      { label: 'Peak torque', value: '560 Nm' },
      { label: 'Gear ratio', value: '16:12 hardened' },
      { label: 'Dry mass', value: '11.42 kg' },
      { label: 'Ingress class', value: 'IP69K' },
      { label: 'Temp range', value: '−55 … +180 °C' },
      { label: 'Shock load', value: '30 g / 11 ms' },
    ],
    features: [
      { icon: <Zap size={13} />, text: '2× torque headroom for impact loads' },
      { icon: <Thermometer size={13} />, text: 'Cryogenic Viton FKM seal set' },
      { icon: <Wrench size={13} />, text: 'Field-serviceable cartridge coupler' },
    ],
  },
  {
    id: 'ssq-7200',
    tab: 'SSQ-7200',
    badge: 'COMPACT',
    title: 'SSQ-7200 Compact Drive',
    blurb:
      'A shortened housing envelope with a 3-lobe coupler and integrated controller pocket — built for collaborative robot joints and AGV conveyor modules.',
    specs: [
      { label: 'Peak torque', value: '180 Nm' },
      { label: 'Gear ratio', value: '12:9 planetary' },
      { label: 'Dry mass', value: '4.85 kg' },
      { label: 'Ingress class', value: 'IP65' },
      { label: 'Temp range', value: '−20 … +120 °C' },
      { label: 'Max speed', value: '9,200 rpm' },
    ],
    features: [
      { icon: <Cpu size={13} />, text: 'Integrated 48 V controller pocket' },
      { icon: <Boxes size={13} />, text: '35% shorter axial envelope' },
      { icon: <ShieldCheck size={13} />, text: 'ISO 10218 collaborative-safe mounts' },
    ],
  },
  {
    id: 'ssq-5100',
    tab: 'SSQ-5100',
    badge: 'PRECISION',
    title: 'SSQ-5100 Precision Servo Module',
    blurb:
      'Ground helical gearing, preloaded bronze bushings and encoder-ready shaft — engineered for ±1 arc-min backlash in indexing tables and metrology stages.',
    specs: [
      { label: 'Peak torque', value: '95 Nm' },
      { label: 'Gear ratio', value: '20:16 helical' },
      { label: 'Dry mass', value: '3.20 kg' },
      { label: 'Backlash', value: '≤ 1 arc-min' },
      { label: 'Temp range', value: '−10 … +100 °C' },
      { label: 'Max speed', value: '4,800 rpm' },
    ],
    features: [
      { icon: <Zap size={13} />, text: 'Ground helical set · ±1 arc-min' },
      { icon: <Cpu size={13} />, text: 'Absolute encoder pick-off ring' },
      { icon: <Wrench size={13} />, text: 'Preloaded bronze journal bearings' },
    ],
  },
];

export default function ProductCatalog() {
  const [active, setActive] = useState(PRODUCTS[0].id);
  const product = PRODUCTS.find((p) => p.id === active) ?? PRODUCTS[0];

  return (
    <section id="catalog" className="relative border-t border-white/8 bg-[#080b10] py-20">
      <div className="tech-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-8">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] tracking-[0.28em] text-[#00f0ff]">
            PRODUCT CATALOG
          </span>
          <h2 className="text-[28px] font-semibold tracking-tight text-white sm:text-[36px]">
            Four envelopes. One architecture.
          </h2>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-slate-400">
            Every SSquare module shares the same multi-material core — steel gear train,
            elastomer coupling, finned aluminium housing — scaled to the duty cycle.
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {PRODUCTS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(p.id)}
              className={`rounded-md border px-4 py-2 font-mono text-[11px] tracking-[0.12em] transition-all ${
                p.id === active
                  ? 'border-[#00f0ff]/60 bg-[#00f0ff]/12 text-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.14)]'
                  : 'border-white/10 bg-white/3 text-slate-400 hover:border-white/25 hover:text-slate-200'
              }`}
            >
              {p.tab}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="glass mt-5 rounded-xl p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded border border-[#f97316]/40 bg-[#f97316]/12 px-2.5 py-1 font-mono text-[9px] tracking-[0.18em] text-[#f97316]">
              {product.badge}
            </span>
            <h3 className="text-[19px] font-semibold text-white">{product.title}</h3>
          </div>
          <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-slate-300">
            {product.blurb}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {product.specs.map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-white/10 bg-white/3 px-3 py-2.5"
              >
                <div className="font-mono text-[8.5px] tracking-[0.16em] text-slate-500 uppercase">
                  {s.label}
                </div>
                <div className="mt-1 font-mono text-[13px] text-[#00f0ff]">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            {product.features.map((f) => (
              <div
                key={f.text}
                className="flex items-center gap-2 text-[12px] text-slate-300"
              >
                <span className="text-[#00f0ff]">{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>

          <a
            href="#bom"
            className="mt-6 inline-flex items-center gap-2 rounded-md border border-[#00f0ff]/40 bg-[#00f0ff]/10 px-4 py-2 text-[12px] font-medium tracking-wide text-[#00f0ff] transition-colors hover:bg-[#00f0ff]/20"
          >
            BUILD YOUR BILL OF MATERIALS
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
