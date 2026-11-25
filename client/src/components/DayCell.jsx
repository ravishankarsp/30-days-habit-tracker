import React from 'react';
import { Check, X, FileText } from 'lucide-react';

export default function DayCell({
  day,
  isCurrentDay,
  onToggleStatus,
  onOpenDayDetails
}) {
  const { dayNumber, status, note, mood } = day;

  // Determine styling based on status
  let cellClass = '';
  if (status === 'completed') {
    cellClass = 'bg-gradient-to-br from-brand-emerald to-brand-emerald-dark text-white border-brand-emerald/50 shadow-glow-emerald';
  } else if (isCurrentDay) {
    cellClass = 'bg-brand-indigo/20 text-white border-2 border-brand-indigo shadow-glow-primary animate-active-pulse';
  } else if (status === 'missed') {
    cellClass = 'bg-slate-700/40 text-slate-400 border border-slate-600/50';
  } else {
    // pending
    cellClass = 'bg-surface-container/60 text-on-surface-variant/70 border border-white/5 hover:border-white/20 hover:text-white';
  }

  const moodEmojis = ['', '😫', '😕', '🙂', '⚡', '🔥'];

  return (
    <div
      onClick={() => onToggleStatus(dayNumber)}
      onContextMenu={(e) => {
        e.preventDefault();
        onOpenDayDetails(day);
      }}
      className={`relative aspect-square rounded-xl p-1.5 flex flex-col items-center justify-between border cursor-pointer select-none transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 ${cellClass}`}
      title={`Day ${dayNumber}: ${status.toUpperCase()} (Click to toggle, right-click/double-click for notes)`}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onOpenDayDetails(day);
      }}
    >
      {/* Top Header: Day Number & Note Dot */}
      <div className="w-full flex items-center justify-between">
        <span className="text-[11px] font-display font-bold leading-none tabular-nums">
          D{dayNumber}
        </span>
        
        <div className="flex items-center gap-0.5">
          {mood && mood > 0 && (
            <span className="text-[10px] leading-none" title={`Energy rating: ${mood}/5`}>
              {moodEmojis[mood]}
            </span>
          )}
          {note && (
            <span 
              className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]"
              title="Has reflection note"
            />
          )}
        </div>
      </div>

      {/* Center Icon Indicator */}
      <div className="flex-1 flex items-center justify-center my-auto">
        {status === 'completed' && (
          <Check className="w-4 h-4 text-white stroke-[3] animate-in zoom-in-75 duration-150" />
        )}
        {status === 'missed' && (
          <X className="w-4 h-4 text-slate-400 stroke-[2.5]" />
        )}
        {status === 'pending' && isCurrentDay && (
          <span className="text-[10px] font-display font-extrabold uppercase tracking-wider text-brand-indigo">
            Today
          </span>
        )}
      </div>

      {/* Bottom Micro Action Bar */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenDayDetails(day);
        }}
        className="w-full py-0.5 rounded text-[9px] font-display font-semibold text-center opacity-40 hover:opacity-100 hover:bg-white/10 transition-opacity"
      >
        <span className="flex items-center justify-center gap-0.5">
          <FileText className="w-2.5 h-2.5" /> Note
        </span>
      </button>
    </div>
  );
}
