import React from 'react';
import { Target, Calendar, Flame } from 'lucide-react';

export default function HeroSection({ activeChallenge }) {
  if (!activeChallenge) return null;

  const totalDays = 30;
  const completedCount = activeChallenge.days.filter(d => d.status === 'completed').length;
  const successRate = Math.round((completedCount / totalDays) * 100);
  const remainingDays = totalDays - completedCount;

  // Find first non-completed day as current focus day
  const currentDayObj = activeChallenge.days.find(d => d.status === 'pending') || activeChallenge.days[29];
  const currentDayNum = currentDayObj ? currentDayObj.dayNumber : 30;

  return (
    <div className="rounded-2xl glass-card border border-white/10 p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between">
      {/* Ambient background bloom */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-brand-indigo/10 rounded-full blur-3xl pointer-events-none"></div>

      <div>
        {/* Category & Streak Flame Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-display font-bold tracking-wide uppercase bg-secondary/15 text-secondary-tint border border-secondary/25">
              <Target className="w-3.5 h-3.5" />
              <span>{activeChallenge.category || 'Focus Sprint'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-display font-semibold bg-white/5 text-on-surface-variant border border-white/5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Day 1 to Day 30</span>
            </span>
          </div>

          {/* Flame Pill Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/10 border border-amber-500/30 shadow-glow-flame">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-flame" />
            <span className="text-xs font-display font-bold text-amber-300 tracking-wide uppercase">
              Streak: <strong className="font-sans text-sm font-bold text-white tabular-nums">{activeChallenge.streak || 0}</strong> Days
            </span>
          </div>
        </div>

        {/* Challenge Title & Mission */}
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight mb-2">
          {activeChallenge.title}
        </h1>
        <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-2xl font-normal mb-6">
          {activeChallenge.description || 'Commit to showing up every single day. Master your craft and build unstoppable momentum.'}
        </p>
      </div>

      {/* Quick Metrics Bar with Tabular Numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
        <div className="bg-surface-container/60 rounded-xl p-3 border border-white/5">
          <span className="text-[11px] font-display font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
            Today's Focus
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-display font-extrabold text-primary-tint tabular-nums">
              Day {currentDayNum}
            </span>
            <span className="text-xs text-on-surface-variant">/ 30</span>
          </div>
        </div>

        <div className="bg-surface-container/60 rounded-xl p-3 border border-white/5">
          <span className="text-[11px] font-display font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
            Completed
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-display font-extrabold text-tertiary-tint tabular-nums">
              {completedCount}
            </span>
            <span className="text-xs text-on-surface-variant">days</span>
          </div>
        </div>

        <div className="bg-surface-container/60 rounded-xl p-3 border border-white/5">
          <span className="text-[11px] font-display font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
            Success Rate
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-display font-extrabold text-white tabular-nums">
              {successRate}%
            </span>
          </div>
        </div>

        <div className="bg-surface-container/60 rounded-xl p-3 border border-white/5">
          <span className="text-[11px] font-display font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
            Days Remaining
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-display font-extrabold text-secondary-tint tabular-nums">
              {remainingDays}
            </span>
            <span className="text-xs text-on-surface-variant">left</span>
          </div>
        </div>
      </div>
    </div>
  );
}
