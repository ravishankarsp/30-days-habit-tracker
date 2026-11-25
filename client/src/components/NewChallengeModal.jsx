import React, { useState } from 'react';
import { X, Flame } from 'lucide-react';

const categories = [
  'Fitness & Health',
  'Coding & Dev',
  'Mind & Reading',
  'Creative Writing',
  'Deep Work',
  'Meditation'
];

export default function NewChallengeModal({ isOpen, onClose, onCreate }) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Fitness & Health');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('30');
  const [customDays, setCustomDays] = useState('45');
  const [habitsInput, setHabitsInput] = useState('45-min deep focus session, Read 15 pages, Drink 3L water');

  const durationPresets = ['14', '21', '30', '60', '75', '90', 'Custom'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const habitsArray = habitsInput
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean);

    const effectiveDays = duration === 'Custom'
      ? Math.max(5, Math.min(365, parseInt(customDays, 10) || 30))
      : parseInt(duration, 10) || 30;

    onCreate({
      title: title.trim(),
      category,
      description: description.trim(),
      startDate,
      totalDays: effectiveDays,
      initialHabits: habitsArray
    });

    setTitle('');
    setDescription('');
    onClose();
  };

  const currentDaysDisplay = duration === 'Custom' ? (customDays || '30') : duration;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl glass-card border border-white/10 p-6 sm:p-8 shadow-modal-rim relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary-tint flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-white">
                Create {currentDaysDisplay}-Day Sprint
              </h3>
              <p className="text-xs text-on-surface-variant">Customize duration & daily habits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Challenge Title */}
          <div>
            <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Challenge Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 60 Days of High Performance Coding"
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-white/10 text-sm text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-brand-indigo transition-all"
            />
          </div>

          {/* Duration Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider">
                Sprint Duration (Days)
              </label>
              <span className="text-xs font-display text-primary-tint font-bold">
                {currentDaysDisplay} Days Sprint
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {durationPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDuration(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-display font-semibold border transition-all ${
                    duration === preset
                      ? 'bg-brand-indigo/30 border-brand-indigo text-primary-tint shadow-glow-primary'
                      : 'bg-surface-container border-white/10 text-on-surface-variant hover:text-white'
                  }`}
                >
                  {preset === 'Custom' ? 'Custom' : `${preset} Days`}
                </button>
              ))}
            </div>
            {duration === 'Custom' && (
              <div className="mt-2.5 flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="365"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="Enter total days (e.g. 45, 100)"
                  className="w-40 px-3.5 py-1.5 rounded-xl bg-surface-container border border-brand-indigo/50 text-sm text-white focus:outline-none focus:border-brand-indigo transition-all"
                />
                <span className="text-xs text-on-surface-variant">Total days for your sprint (5 to 365 days)</span>
              </div>
            )}
          </div>

          {/* Category Chips */}
          <div>
            <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-display font-semibold border transition-all ${
                    category === cat
                      ? 'bg-brand-indigo/25 border-brand-indigo text-primary-tint shadow-glow-primary'
                      : 'bg-surface-container border-white/10 text-on-surface-variant hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Mission Statement & Outcome
            </label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why does this transformation matter to you over the next 30 days?"
              className="w-full px-4 py-2 rounded-xl bg-surface-container border border-white/10 text-xs text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-brand-indigo transition-all resize-none"
            ></textarea>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Sprint Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-white/10 text-sm text-white focus:outline-none focus:border-brand-indigo transition-all"
            />
          </div>

          {/* Daily Habits Checklist input */}
          <div>
            <label className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Daily Habits Checklist (Separated by commas)
            </label>
            <input
              type="text"
              value={habitsInput}
              onChange={(e) => setHabitsInput(e.target.value)}
              placeholder="e.g. 45 min workout, Solve 1 problem, 3L water"
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-white/10 text-xs text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-brand-indigo transition-all"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-display font-semibold text-on-surface-variant hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-display font-bold text-sm text-white bg-gradient-to-r from-brand-indigo to-brand-purple hover:from-brand-indigo-dark hover:to-brand-purple shadow-glow-primary transition-all"
            >
              Launch Sprint
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
