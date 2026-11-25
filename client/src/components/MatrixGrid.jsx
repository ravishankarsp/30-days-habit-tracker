import React from 'react';
import { Grid, Info, CheckCheck } from 'lucide-react';
import DayCell from './DayCell';

export default function MatrixGrid({
  activeChallenge,
  onToggleDayStatus,
  onOpenDayDetails,
  onMarkTodayDone
}) {
  if (!activeChallenge) return null;

  // Find first pending day as today
  const firstPending = activeChallenge.days.find(d => d.status === 'pending');
  const activeDayNumber = firstPending ? firstPending.dayNumber : 30;

  return (
    <div className="rounded-2xl glass-card border border-white/10 p-6 sm:p-7 space-y-6">
      
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-primary-tint" />
            <h2 className="font-display font-bold text-xl text-white">
              30-Day Challenge Matrix
            </h2>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Click any day to toggle status, or click "Note" to log personal reflections.
          </p>
        </div>

        {/* Matrix Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-display font-semibold text-on-surface-variant">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-brand-emerald shadow-glow-emerald"></span> Completed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border-2 border-brand-indigo bg-brand-indigo/20 animate-pulse"></span> Active
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-700/60 border border-slate-600"></span> Missed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-surface-container border border-white/5"></span> Upcoming
          </span>
        </div>
      </div>

      {/* 30-Day Matrix Grid (10x3 on desktop, 6x5 on tablet, 5x6 on mobile) */}
      <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-10 gap-2.5 sm:gap-3">
        {activeChallenge.days.map((day) => (
          <DayCell
            key={day.dayNumber}
            day={day}
            isCurrentDay={day.dayNumber === activeDayNumber && day.status === 'pending'}
            onToggleStatus={onToggleDayStatus}
            onOpenDayDetails={onOpenDayDetails}
          />
        ))}
      </div>

      {/* Footer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5 text-xs">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Info className="w-4 h-4 text-primary-tint" />
          <span>Double-click or click "Note" to log your energy rating & reflections.</span>
        </div>
        
        <button
          onClick={() => onMarkTodayDone(activeDayNumber)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-tertiary/20 hover:bg-tertiary/30 text-tertiary-tint border border-tertiary/30 font-display font-semibold text-xs shadow-glow-emerald transition-all"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Mark Day {activeDayNumber} Done
        </button>
      </div>

    </div>
  );
}
