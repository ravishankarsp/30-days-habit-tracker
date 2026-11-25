import React from 'react';
import { Lock, History, Calendar, CheckCircle2, X } from 'lucide-react';

export default function LockNoticeModal({
  isOpen,
  dayNumber,
  currentDayNum,
  isPast,
  unlockDateStr,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-[#131b2e] border border-white/10 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 z-10">
        
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-[#908fa0] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Header */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isPast
                ? 'bg-[#171f33] border-white/10 text-[#908fa0]'
                : 'bg-[#8083ff]/15 border-[#8083ff]/30 text-[#8083ff]'
            }`}
          >
            {isPast ? (
              <History className="w-6 h-6 text-[#908fa0]" />
            ) : (
              <Lock className="w-6 h-6 text-[#8083ff]" />
            )}
          </div>
          <div>
            <span
              className={`text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isPast
                  ? 'bg-white/5 text-[#908fa0]'
                  : 'bg-[#8083ff]/15 text-[#c0c1ff]'
              }`}
            >
              {isPast ? 'Historical Day Locked' : 'Future Day Locked'}
            </span>
            <h3 className="text-lg font-display font-bold text-white tracking-tight mt-0.5">
              Day {dayNumber} is Locked
            </h3>
          </div>
        </div>

        {/* Informative Body Text */}
        <div className="text-xs text-[#c7c4d7] leading-relaxed bg-[#0b1326] p-3.5 rounded-xl border border-white/5 space-y-2">
          {isPast ? (
            <p>
              Day <span className="text-white font-bold">{dayNumber}</span> is in the past. To ensure sprint integrity and authentic habit tracking, past days cannot be retroactively modified.
            </p>
          ) : (
            <p>
              Day <span className="text-white font-bold">{dayNumber}</span> is a future milestone. Sprints are conquered one daily ritual at a time.
              {unlockDateStr ? ` This day will automatically unlock on ` : ` It will unlock when you reach Day ${dayNumber}.`}
              {unlockDateStr && <span className="text-[#8083ff] font-bold">{unlockDateStr}</span>}.
            </p>
          )}

          <div className="flex items-center gap-2 pt-1 text-[11px] font-display font-semibold">
            <span className="text-[#4edea3] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active Today: Day {currentDayNum}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#8083ff] hover:bg-[#6c70ff] text-[#0b1326] font-display font-bold text-xs shadow-[0_0_16px_rgba(128,131,255,0.3)] transition-all cursor-pointer"
          >
            Understood, Focus on Today (Day {currentDayNum})
          </button>
        </div>

      </div>
    </div>
  );
}
