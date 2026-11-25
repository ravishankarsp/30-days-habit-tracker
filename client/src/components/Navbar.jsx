import React, { useState } from 'react';
import { Zap, ChevronDown, PlusCircle, Volume2, VolumeX, Sun, Moon, Plus, Database } from 'lucide-react';

export default function Navbar({
  challenges,
  activeChallenge,
  onSelectChallenge,
  onOpenNewChallenge,
  dbStatus,
  isDark,
  onToggleTheme,
  isSoundOn,
  onToggleSound
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-surface-lowest/70 border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-indigo to-brand-purple p-[1px] shadow-glow-primary">
            <div className="w-full h-full bg-surface-container rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-tint" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-on-surface to-primary-tint bg-clip-text text-transparent">
                DayByDay
              </span>
              <span className="text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary-tint border border-primary/20">
                30 Days Sprint
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-medium hidden sm:block">
              Focused Momentum & Habit Mastery
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* DB Indicator Badge */}
          <div 
            title={dbStatus} 
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-container border border-white/5 text-[11px] font-display text-on-surface-variant"
          >
            <Database className="w-3.5 h-3.5 text-tertiary-tint" />
            <span className="truncate max-w-[120px]">{dbStatus?.includes('MongoDB') ? 'MongoDB Live' : 'Local Store'}</span>
          </div>

          {/* Active Challenge Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container border border-white/10 hover:border-brand-indigo/40 text-sm font-display font-semibold transition-all"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-brand-indigo"></span>
              <span className="max-w-[120px] sm:max-w-[180px] truncate text-white">
                {activeChallenge ? activeChallenge.title : 'Select Sprint'}
              </span>
              <ChevronDown className="w-4 h-4 text-on-surface-variant" />
            </button>

            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 rounded-2xl glass-elevated border border-white/10 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="text-[11px] font-display font-bold uppercase tracking-wider text-on-surface-variant px-3 py-1.5">
                  Your 30-Day Sprints ({challenges.length})
                </div>
                <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar my-1">
                  {challenges.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => {
                        onSelectChallenge(c);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs font-display transition-all ${
                        activeChallenge?._id === c._id
                          ? 'bg-brand-indigo/20 text-white font-bold border border-brand-indigo/30'
                          : 'text-on-surface-variant hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="truncate mr-2">{c.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-amber-300">
                        🔥 {c.streak || 0}d
                      </span>
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-2 mt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenNewChallenge();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary-tint text-xs font-display font-semibold transition-all border border-primary/20"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Create New Challenge
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={isSoundOn ? 'Sound On' : 'Sound Muted'}
            className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-high border border-white/5 text-on-surface-variant hover:text-white transition-all"
          >
            {isSoundOn ? <Volume2 className="w-4 h-4 text-primary-tint" /> : <VolumeX className="w-4 h-4 text-on-surface-variant" />}
          </button>

          {/* Light/Dark Toggle */}
          <button
            onClick={onToggleTheme}
            title="Toggle Light / Dark mode"
            className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-high border border-white/5 text-on-surface-variant hover:text-white transition-all"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Primary CTA: New Sprint */}
          <button
            onClick={onOpenNewChallenge}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl font-display font-semibold text-sm text-white bg-gradient-to-r from-brand-indigo to-brand-purple hover:from-brand-indigo-dark hover:to-brand-purple shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Sprint</span>
          </button>
        </div>

      </div>
    </header>
  );
}
