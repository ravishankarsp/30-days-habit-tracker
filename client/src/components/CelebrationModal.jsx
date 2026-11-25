import React, { useEffect } from 'react';
import { Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CelebrationModal({
  isOpen,
  milestoneDay = 7,
  streak = 7,
  progress = 23,
  onClose
}) {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti cannons
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 250);
      } catch {
        // Confetti fallback safe
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const milestoneTitles = {
    7: '7 Days Streak Achieved!',
    14: '14 Days: Habit Loop Solidified!',
    21: '21 Days: Resilience Mastered!',
    30: '30 Days Sprint Completed! 🏆'
  };

  const milestoneDescriptions = {
    7: 'The hardest part of any new habit is the first 7 days. You have broken the initial inertia! Keep the flame burning.',
    14: 'Two weeks of consistent execution! Neural pathways are wiring up. The routine feels more natural each day.',
    21: 'Three weeks unbroken! You have pushed through the dip where most quit. Momentum is now working for you.',
    30: 'Legendary accomplishment! You completed the full 30-day transformation sprint. This is now your identity!'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md rounded-3xl glass-card border border-brand-indigo/30 p-8 shadow-modal-rim text-center relative animate-in zoom-in-95 duration-300">
        
        {/* Trophy Glow Icon */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-brand-indigo p-[2px] shadow-glow-flame">
          <div className="w-full h-full bg-surface-container rounded-2xl flex items-center justify-center">
            <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
          </div>
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-display font-extrabold uppercase tracking-wider bg-tertiary/20 text-tertiary-tint border border-tertiary/30 mb-2">
          Milestone Unlocked!
        </span>

        <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-2">
          {milestoneTitles[milestoneDay] || `Day ${milestoneDay} Milestone!`}
        </h3>
        
        <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
          {milestoneDescriptions[milestoneDay] || 'Incredible discipline and showing up every single day.'}
        </p>

        {/* Metric Badges */}
        <div className="bg-surface-container/70 rounded-2xl p-4 border border-white/10 mb-6 flex items-center justify-around">
          <div>
            <span className="text-[11px] text-on-surface-variant uppercase font-display block">Streak</span>
            <span className="text-2xl font-display font-extrabold text-amber-300 tabular-nums">
              {streak}d
            </span>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div>
            <span className="text-[11px] text-on-surface-variant uppercase font-display block">Completed</span>
            <span className="text-2xl font-display font-extrabold text-tertiary-tint tabular-nums">
              {progress}%
            </span>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div>
            <span className="text-[11px] text-on-surface-variant uppercase font-display block">Status</span>
            <span className="text-sm font-display font-bold text-primary-tint">Unstoppable</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-display font-bold text-sm text-white bg-gradient-to-r from-brand-indigo to-brand-purple hover:from-brand-indigo-dark hover:to-brand-purple shadow-glow-primary transition-all"
        >
          Keep Crushing It
        </button>

      </div>
    </div>
  );
}
