import {
  Eye,
  Gauge,
  Layers,
  Magnet,
  Orbit,
  RotateCcw,
  ScanLine,
  SlidersHorizontal,
  Vibrate,
  X,
} from 'lucide-react';
import { useState } from 'react';
import type { SceneSettings } from './ThreeEngineeringScene';

interface Props {
  settings: SceneSettings;
  onChange: (patch: Partial<SceneSettings>) => void;
  onResetView: () => void;
}

function ToggleRow({
  icon,
  label,
  active,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-center justify-between rounded-md border px-2.5 py-2 text-left transition-colors ${
        active
          ? 'border-[#00f0ff]/50 bg-[#00f0ff]/12 text-[#00f0ff]'
          : 'border-white/10 bg-white/4 text-slate-400 hover:border-white/20 hover:text-slate-200'
      }`}
    >
      <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em]">
        {icon}
        {label}
      </span>
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]' : 'bg-slate-600'}`}
      />
    </button>
  );
}

function SliderRow({
  icon,
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/4 px-2.5 py-2">
      <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] tracking-[0.12em] text-slate-400">
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        <span className="text-[#00f0ff]">
          {Math.round(value * 100)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        className="cad-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

export default function Workbench({ settings, onChange, onResetView }: Props) {
  const [open, setOpen] = useState(false);
  const manualExplode = settings.explode !== null;

  return (
    <>
      {/* Collapse toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`glass absolute top-20 right-4 z-30 flex items-center gap-2 rounded-md px-3 py-2 font-mono text-[10px] tracking-[0.14em] transition-colors ${
          open ? 'text-[#00f0ff] hover:text-white' : 'text-slate-300 hover:text-[#00f0ff]'
        }`}
      >
        {open ? <X size={13} /> : <SlidersHorizontal size={13} />}
        CAD WORKBENCH
      </button>

      {/* Panel */}
      <div
        className={`glass absolute top-32 right-4 z-30 w-60 rounded-lg p-3 transition-all duration-300 ${
          open
            ? 'pointer-events-auto translate-x-0 opacity-100'
            : 'pointer-events-none translate-x-3 opacity-0'
        }`}
      >
        <div className="mb-2.5 flex items-center justify-between">
          <span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#00f0ff]">
            CONTROL WORKBENCH
          </span>
          <span
            className={`rounded px-1.5 py-0.5 font-mono text-[8px] tracking-widest ${
              manualExplode
                ? 'bg-[#f97316]/20 text-[#f97316]'
                : 'bg-[#00f0ff]/12 text-[#00f0ff]/80'
            }`}
          >
            {manualExplode ? 'MANUAL' : 'SCROLL'}
          </span>
        </div>

        <div className="thin-scroll flex max-h-[calc(100vh-13rem)] flex-col gap-2 overflow-y-auto pr-1">
          {/* Exploded view */}
          <SliderRow
            icon={<Layers size={11} />}
            label="EXPLODE"
            value={settings.explode ?? 0}
            min={0}
            max={1}
            step={0.01}
            suffix="%"
            onChange={(v) => onChange({ explode: v })}
          />
          <button
            type="button"
            onClick={() => onChange({ explode: null })}
            disabled={!manualExplode}
            className="rounded-md border border-white/10 px-2.5 py-1.5 font-mono text-[9px] tracking-[0.12em] text-slate-400 transition-colors hover:border-[#00f0ff]/40 hover:text-[#00f0ff] disabled:cursor-not-allowed disabled:opacity-35"
          >
            RETURN TO SCROLL CONTROL
          </button>

          <SliderRow
            icon={<Gauge size={11} />}
            label="GEAR SPEED"
            value={settings.gearSpeed / 2}
            min={0}
            max={1}
            step={0.01}
            suffix="%"
            onChange={(v) => onChange({ gearSpeed: v * 2 })}
          />
          <SliderRow
            icon={<Vibrate size={11} />}
            label="VIBRATION"
            value={settings.vibration}
            min={0}
            max={1}
            step={0.01}
            suffix="%"
            onChange={(v) => onChange({ vibration: v })}
          />
          <SliderRow
            icon={<Magnet size={11} />}
            label="ENV LIGHT"
            value={settings.envIntensity / 2}
            min={0}
            max={1}
            step={0.01}
            suffix="%"
            onChange={(v) => onChange({ envIntensity: v * 2 })}
          />

          <div className="my-0.5 h-px bg-white/10" />

          <ToggleRow
            icon={<Orbit size={11} />}
            label="AUTO-ORBIT"
            active={settings.autoRotate}
            onToggle={() => onChange({ autoRotate: !settings.autoRotate })}
          />
          <ToggleRow
            icon={<Eye size={11} />}
            label="SOFT SHADOWS"
            active={settings.shadows}
            onToggle={() => onChange({ shadows: !settings.shadows })}
          />
          <ToggleRow
            icon={<ScanLine size={11} />}
            label="X-RAY WIREFRAME"
            active={settings.xray}
            onToggle={() => onChange({ xray: !settings.xray })}
          />

          <button
            type="button"
            onClick={onResetView}
            className="mt-0.5 flex items-center justify-center gap-2 rounded-md border border-[#00f0ff]/40 bg-[#00f0ff]/10 px-2.5 py-2 font-mono text-[10px] tracking-[0.14em] text-[#00f0ff] transition-colors hover:bg-[#00f0ff]/20"
          >
            <RotateCcw size={12} />
            RESET VIEW
          </button>
        </div>
      </div>
    </>
  );
}
