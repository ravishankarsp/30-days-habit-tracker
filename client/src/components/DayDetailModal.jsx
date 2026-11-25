import React, { useState, useEffect } from 'react';
import { X, Check, Clock, Lock } from 'lucide-react';

export default function DayDetailModal({
  isOpen,
  day,
  currentDayNum,
  onClose,
  onSave
}) {
  if (!isOpen || !day) return null;

  const isEditable = currentDayNum ? (day.dayNumber === currentDayNum) : true;
  const isPast = currentDayNum ? (day.dayNumber < currentDayNum) : false;

  const [status, setStatus] = useState(day.status || 'pending');
  const [note, setNote] = useState(day.note || '');
  const [mood, setMood] = useState(day.mood || null);

  useEffect(() => {
    if (day) {
      setStatus(day.status || 'pending');
      setNote(day.note || '');
      setMood(day.mood || null);
    }
  }, [day]);

  const handleSave = () => {
    if (!isEditable) {
      onClose();
      return;
    }
    onSave(day.dayNumber, { status, note, mood });
    onClose();
  };

  const moodOptions = [
    { value: 1, emoji: '😫', label: 'Drained' },
    { value: 2, emoji: '😕', label: 'Tired' },
    { value: 3, emoji: '🙂', label: 'Good' },
    { value: 4, emoji: '⚡', label: 'Energized' },
    { value: 5, emoji: '🔥', label: 'Unstoppable' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl glass-card border border-white/10 p-6 sm:p-7 shadow-modal-rim relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl font-display font-extrabold flex items-center justify-center text-sm ${
              isEditable ? 'bg-tertiary/20 text-tertiary-tint' : 'bg-white/5 text-[#908fa0]'
            }`}>
              D{day.dayNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-white">Day {day.dayNumber} Reflection</h3>
                {!isEditable && (
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-[#908fa0] flex items-center gap-1 font-display font-semibold">
                    <Lock className="w-3 h-3 text-[#908fa0]" />
                    {isPast ? 'Past (Locked)' : 'Future (Locked)'}
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant">
                {isEditable ? 'Update Status & Energy Journal' : 'View past activity & reflection log'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lock Banner if not editable */}
        {!isEditable && (
          <div className="mb-4 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#c7c4d7] flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#8083ff] shrink-0" />
            <span>
              {isPast
                ? 'This day is in the past and locked from editing.'
                : 'Future sprint days are locked and will unlock when reached.'}
            </span>
          </div>
        )}

        {/* Status Selection */}
        <div className="space-y-2 mb-4">
          <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider">
            Day Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={!isEditable}
              onClick={() => isEditable && setStatus('completed')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-display font-bold border transition-all ${
                !isEditable ? 'opacity-60 cursor-not-allowed' : ''
              } ${
                status === 'completed'
                  ? 'border-brand-emerald bg-brand-emerald/25 text-brand-emerald shadow-glow-emerald'
                  : 'border-white/10 bg-surface-container text-on-surface-variant hover:text-white'
              }`}
            >
              <Check className="w-3.5 h-3.5" /> Done
            </button>
            <button
              type="button"
              disabled={!isEditable}
              onClick={() => isEditable && setStatus('missed')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-display font-bold border transition-all ${
                !isEditable ? 'opacity-60 cursor-not-allowed' : ''
              } ${
                status === 'missed'
                  ? 'border-red-500 bg-red-500/20 text-red-400'
                  : 'border-white/10 bg-surface-container text-on-surface-variant hover:text-white'
              }`}
            >
              <X className="w-3.5 h-3.5" /> Missed
            </button>
            <button
              type="button"
              disabled={!isEditable}
              onClick={() => isEditable && setStatus('pending')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-display font-bold border transition-all ${
                !isEditable ? 'opacity-60 cursor-not-allowed' : ''
              } ${
                status === 'pending'
                  ? 'border-brand-indigo bg-brand-indigo/20 text-brand-indigo'
                  : 'border-white/10 bg-surface-container text-on-surface-variant hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Pending
            </button>
          </div>
        </div>

        {/* Reflection Note */}
        <div className="space-y-2 mb-4">
          <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider">
            Daily Reflection & Journal
          </label>
          <textarea
            rows="3"
            disabled={!isEditable}
            readOnly={!isEditable}
            value={note}
            onChange={(e) => isEditable && setNote(e.target.value)}
            placeholder={isEditable ? 'What breakthrough did you achieve? Any obstacles or thoughts on momentum?' : 'No reflection note logged for this day.'}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-white/10 text-xs text-white placeholder:text-on-surface-variant/50 focus:outline-none transition-all resize-none ${
              !isEditable ? 'opacity-70 cursor-not-allowed' : 'focus:border-brand-indigo'
            }`}
          ></textarea>
        </div>

        {/* Energy Rating */}
        <div className="space-y-2 mb-5">
          <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider">
            Energy & Focus Level
          </label>
          <div className="flex items-center justify-around p-2 rounded-xl bg-surface-container/60 border border-white/5">
            {moodOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={!isEditable}
                onClick={() => isEditable && setMood(opt.value)}
                className={`p-1.5 rounded-xl text-2xl transition-all ${
                  !isEditable ? 'cursor-not-allowed opacity-50' : 'hover:scale-110 opacity-70 hover:opacity-100'
                } ${
                  mood === opt.value ? 'scale-125 bg-white/10 ring-2 ring-brand-indigo !opacity-100' : ''
                }`}
                title={opt.label}
              >
                {opt.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Save or Close CTA */}
        <div className="pt-2 border-t border-white/10">
          {isEditable ? (
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl font-display font-bold text-sm text-white bg-brand-indigo hover:bg-brand-indigo-dark shadow-glow-primary transition-all"
            >
              Save Entry
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl font-display font-bold text-sm text-on-surface-variant bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              Close (Locked)
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
