import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

const quotes = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "At first we make our habits, then our habits make us.", author: "John Dryden" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
  { text: "Motivation gets you started. Habit is what keeps you going.", author: "Jim Ryun" }
];

export default function MotivationalCard() {
  const [index, setIndex] = useState(0);

  const nextQuote = () => {
    setIndex((prev) => (prev + 1) % quotes.length);
  };

  const current = quotes[index];

  return (
    <div className="rounded-2xl glass-card border border-white/10 p-6 relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-purple/10 rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span className="text-xs font-display font-bold uppercase tracking-wider text-amber-300">
          Daily Momentum Wisdom
        </span>
      </div>

      <p className="font-display text-sm font-medium italic text-on-surface leading-relaxed mb-3">
        "{current.text}"
      </p>

      <div className="flex items-center justify-between text-xs text-on-surface-variant">
        <span className="font-display font-semibold">— {current.author}</span>
        <button
          onClick={nextQuote}
          className="hover:text-white flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Next</span>
        </button>
      </div>
    </div>
  );
}
