import React from 'react';
import { Compass } from 'lucide-react';

export default function SprintRoadmap({ completedCount = 0 }) {
  return (
    <div className="rounded-2xl glass-card border border-white/10 p-5 space-y-3">
      <span className="text-xs font-display font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
        <Compass className="w-3.5 h-3.5 text-primary-tint" />
        Sprint Stages & Psychology
      </span>
      <div className="space-y-2 text-xs">
        <div className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
          completedCount >= 1 ? 'bg-brand-indigo/15 border-brand-indigo/30' : 'bg-surface-container/50 border-white/5'
        }`}>
          <span className="font-display font-semibold text-white">Days 1–7: Ignition</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary-tint font-bold">
            Breaking Inertia
          </span>
        </div>

        <div className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
          completedCount >= 8 ? 'bg-brand-purple/15 border-brand-purple/30' : 'bg-surface-container/50 border-white/5'
        }`}>
          <span className="font-display font-semibold text-white">Days 8–14: Acceleration</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/20 text-secondary-tint font-bold">
            Neural Pathways
          </span>
        </div>

        <div className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
          completedCount >= 15 ? 'bg-amber-500/15 border-amber-500/30' : 'bg-surface-container/50 border-white/5'
        }`}>
          <span className="font-display font-semibold text-white">Days 15–21: Resilience</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
            Overcoming The Dip
          </span>
        </div>

        <div className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
          completedCount >= 22 ? 'bg-brand-emerald/15 border-brand-emerald/30' : 'bg-surface-container/50 border-white/5'
        }`}>
          <span className="font-display font-semibold text-white">Days 22–30: Identity</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-tertiary/20 text-tertiary-tint font-bold">
            Automaticity
          </span>
        </div>
      </div>
    </div>
  );
}
