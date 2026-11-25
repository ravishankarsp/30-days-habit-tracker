import React, { useState } from 'react';
import { ListChecks, Plus, Trash2 } from 'lucide-react';

export default function HabitChecklist({
  habits,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit
}) {
  const [showInput, setShowInput] = useState(false);
  const [newHabitText, setNewHabitText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newHabitText.trim()) return;
    onAddHabit(newHabitText.trim());
    setNewHabitText('');
    setShowInput(false);
  };

  const completedCount = habits.filter(h => h.completed).length;

  return (
    <div className="rounded-2xl glass-card border border-white/10 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/15 text-primary-tint">
            <ListChecks className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">Daily Habit Tasks</h3>
            <p className="text-[11px] text-on-surface-variant">
              {completedCount} of {habits.length} rituals completed today
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowInput(!showInput)}
          title="Add a micro task"
          className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-high border border-white/10 text-on-surface-variant hover:text-white transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
        {habits.map((habit) => (
          <div
            key={habit.id}
            onClick={() => onToggleHabit(habit.id)}
            className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
              habit.completed
                ? 'bg-brand-emerald/10 border-brand-emerald/25 text-on-surface-variant'
                : 'bg-surface-container/60 border-white/5 hover:border-white/15 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={habit.completed}
                onChange={() => {}} // handled by parent onClick
                className="w-4 h-4 rounded text-brand-emerald bg-surface-lowest border-white/20 focus:ring-0 cursor-pointer accent-brand-emerald"
              />
              <span
                className={`text-xs font-medium transition-all ${
                  habit.completed ? 'line-through text-on-surface-variant/70' : 'text-white'
                }`}
              >
                {habit.text}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteHabit(habit.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-red-400 transition-opacity"
              title="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {habits.length === 0 && (
          <div className="text-center py-6 text-xs text-on-surface-variant">
            No daily tasks yet. Click '+' to add one!
          </div>
        )}
      </div>

      {/* Inline Quick Add Form */}
      {showInput && (
        <form onSubmit={handleSubmit} className="pt-2 flex items-center gap-2 border-t border-white/5 animate-in fade-in duration-150">
          <input
            type="text"
            value={newHabitText}
            onChange={(e) => setNewHabitText(e.target.value)}
            placeholder="e.g. 20 min morning sprint..."
            autoFocus
            className="flex-1 bg-surface-container border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-brand-indigo"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-brand-indigo text-white text-xs font-display font-semibold hover:bg-brand-indigo-dark transition-colors"
          >
            Add
          </button>
        </form>
      )}
    </div>
  );
}
