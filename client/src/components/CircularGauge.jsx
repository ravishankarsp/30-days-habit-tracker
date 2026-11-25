import React from 'react';
import { Share2, RotateCcw } from 'lucide-react';

export default function CircularGauge({
  activeChallenge,
  onOpenShareModal,
  onResetChallenge
}) {
  if (!activeChallenge) return null;

  const totalDays = 30;
  const completedCount = activeChallenge.days.filter(d => d.status === 'completed').length;
  const progressPercentage = Math.round((completedCount / totalDays) * 100);

  // SVG circle calculations: radius = 50, circumference = 2 * PI * 50 = 314.159
  const circumference = 314.159;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const getMilestoneClass = (dayThreshold) => {
    return completedCount >= dayThreshold
      ? 'bg-tertiary/20 text-tertiary-tint border-tertiary/40 shadow-glow-emerald font-extrabold'
      : 'bg-white/5 text-on-surface-variant border-white/5';
  };

  return (
    <div className="rounded-2xl glass-card border border-white/10 p-6 flex flex-col justify-between items-center text-center relative h-full">
      
      {/* Circular SVG Gauge */}
      <div className="relative w-44 h-44 my-auto flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
          {/* Background Track */}
          <circle
            cx="60"
            cy="60"
            r="50"
            stroke="currentColor"
            strokeWidth="10"
            className="text-white/10"
            fill="transparent"
          />
          {/* Active Gradient Stroke */}
          <defs>
            <linearGradient id="reactGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="60%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          <circle
            cx="60"
            cy="60"
            r="50"
            stroke="url(#reactGaugeGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Central Metric Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-display font-extrabold text-white tabular-nums tracking-tight">
            {progressPercentage}%
          </span>
          <span className="text-[11px] font-display font-bold uppercase tracking-wider text-on-surface-variant">
            Sprint Progress
          </span>
        </div>
      </div>

      {/* Milestone Pills */}
      <div className="w-full space-y-2 mt-4">
        <div className="flex items-center justify-between text-xs font-display font-semibold text-on-surface-variant px-1">
          <span>Sprint Milestones</span>
          <span className="text-primary-tint">
            {completedCount >= 30 ? 'Sprint Completed! 🎉' : `Next: Day ${completedCount < 7 ? 7 : completedCount < 14 ? 14 : completedCount < 21 ? 21 : 30}`}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          <div className={`py-1.5 px-1 rounded-lg text-center text-[10px] font-display border transition-all ${getMilestoneClass(7)}`}>
            Day 7
          </div>
          <div className={`py-1.5 px-1 rounded-lg text-center text-[10px] font-display border transition-all ${getMilestoneClass(14)}`}>
            Day 14
          </div>
          <div className={`py-1.5 px-1 rounded-lg text-center text-[10px] font-display border transition-all ${getMilestoneClass(21)}`}>
            Day 21
          </div>
          <div className={`py-1.5 px-1 rounded-lg text-center text-[10px] font-display border transition-all ${getMilestoneClass(30)}`}>
            Day 30
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="w-full flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
        <button
          onClick={onOpenShareModal}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-high border border-white/10 text-xs font-display font-semibold text-white hover:border-brand-indigo/50 transition-all"
        >
          <Share2 className="w-3.5 h-3.5 text-primary-tint" />
          Share Card
        </button>
        <button
          onClick={onResetChallenge}
          title="Reset Challenge Progress"
          className="p-2 rounded-xl bg-surface-container hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-on-surface-variant hover:text-red-400 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
