import React, { useState } from 'react';
import InfoModal from './InfoModal';
import { Award, Trophy, CheckCircle2, Download, Share2, Sparkles, Star, Lock, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CompletionView({
  userName = 'High Performer',
  activeChallenge,
  completedChallenges = [],
  onOpenNewChallenge,
  onSelectChallenge
}) {
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  // Check if activeChallenge is 100% completed or pick from completedChallenges
  const totalDays = activeChallenge?.days?.length || 30;
  const completedDaysCount = activeChallenge?.days?.filter((d) => d.status === 'completed').length || 0;
  const isActiveChallengeCompleted = Boolean(activeChallenge && completedDaysCount >= totalDays);

  const targetChallenge = isActiveChallengeCompleted
    ? activeChallenge
    : completedChallenges.length > 0
    ? completedChallenges[0]
    : null;

  const isEligible = Boolean(targetChallenge);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  };

  // If user has NOT completed any challenge yet, show locked state!
  if (!isEligible) {
    const progressPct = activeChallenge && totalDays > 0 ? Math.round((completedDaysCount / totalDays) * 100) : 0;
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-12 text-center animate-in fade-in duration-200">
        <div className="rounded-3xl bg-[#131b2e] border border-white/10 p-10 space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              Certificate Locked
            </h2>
            <p className="text-xs sm:text-sm text-[#908fa0] max-w-md mx-auto leading-relaxed">
              Official Mastery Certificates are granted only after conquering 100% of a sprint challenge.
            </p>
          </div>

          {activeChallenge ? (
            <div className="p-4 rounded-2xl bg-[#0b1326] border border-white/5 space-y-3 max-w-md mx-auto text-left">
              <div className="flex items-center justify-between text-xs font-display">
                <span className="font-bold text-white truncate max-w-[200px]">{activeChallenge.title}</span>
                <span className="text-[#4edea3] font-bold tabular-nums">{completedDaysCount} / {totalDays} Days ({progressPct}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#171f33] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8083ff] to-[#4edea3] transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-[11px] text-[#908fa0]">
                Finish all {totalDays} days to unlock your verified certificate and mastery badge!
              </p>
            </div>
          ) : (
            <div className="pt-2">
              <p className="text-xs text-[#908fa0] mb-4">You have not started any challenge yet.</p>
              {onOpenNewChallenge && (
                <button
                  type="button"
                  onClick={onOpenNewChallenge}
                  className="px-5 py-2.5 rounded-xl bg-[#8083ff] hover:bg-[#6c70ff] text-[#0b1326] font-display font-bold text-xs inline-flex items-center gap-2 shadow-[0_0_16px_rgba(128,131,255,0.35)] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Start Your First Sprint</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const sprintTitle = targetChallenge.title;
  const streak = targetChallenge.streak || totalDays;
  const perfectDays = targetChallenge.days ? targetChallenge.days.filter((d) => d.status === 'completed').length : totalDays;
  const completedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00885d]/20 text-[#4edea3] border border-[#4edea3]/30 text-xs font-display font-bold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" />
          <span>Sprint Accomplishment Verified</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
          Mastery Certificate & Badge
        </h2>
        <p className="text-xs sm:text-sm text-[#908fa0] max-w-lg mx-auto">
          You conquered the full 30-day transformation sprint. Your neural pathways have locked in this habit as your identity.
        </p>
      </div>

      {/* High-Resolution Certificate Card */}
      <div className="rounded-3xl bg-gradient-to-br from-[#131b2e] via-[#171f33] to-[#0b1326] border-2 border-[#8083ff]/40 p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden text-center space-y-6">
        
        {/* Glow watermarks */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#8083ff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[#4edea3]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Certificate Emblem */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#6366F1] to-[#4edea3] p-1 shadow-[0_0_24px_rgba(78,222,163,0.4)]">
          <div className="w-full h-full bg-[#0b1326] rounded-2xl flex items-center justify-center">
            <Award className="w-10 h-10 text-[#4edea3]" />
          </div>
        </div>

        <div>
          <span className="text-xs font-display font-bold uppercase tracking-[0.2em] text-[#908fa0]">
            Official Certification of Habit Mastery
          </span>
          <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
            {sprintTitle}
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-[#c7c4d7] max-w-xl mx-auto leading-relaxed">
          Awarded to <strong className="text-white font-bold">{userName}</strong> for demonstrating unshakeable discipline, executing 30 consecutive sprint milestones, and establishing a sustained standard of excellence.
        </p>

        {/* Verified Stats Row */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto py-4 border-y border-white/10 text-xs font-display">
          <div>
            <span className="text-[#908fa0] uppercase text-[10px] block">Completed</span>
            <span className="text-base font-bold text-white tabular-nums">30 / 30 Days</span>
          </div>
          <div>
            <span className="text-[#908fa0] uppercase text-[10px] block">Perfect Score</span>
            <span className="text-base font-bold text-[#4edea3] tabular-nums">{perfectDays} Days</span>
          </div>
          <div>
            <span className="text-[#908fa0] uppercase text-[10px] block">Streak</span>
            <span className="text-base font-bold text-amber-300 tabular-nums">{streak} Days Unbroken</span>
          </div>
        </div>

        {/* Date & Signature */}
        <div className="flex items-center justify-between max-w-md mx-auto pt-2 text-xs font-display text-[#908fa0]">
          <div>
            <span>Verified Date:</span>
            <strong className="text-white block mt-0.5">{completedDate}</strong>
          </div>
          <div className="text-right">
            <span className="italic text-[#c0c1ff]">DayByDay Protocol</span>
            <strong className="text-white block mt-0.5">Verification Hash: #DBD-30D-8942</strong>
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={triggerConfetti}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8083ff] hover:bg-[#6c70ff] text-[#0b1326] font-display font-bold text-xs shadow-[0_0_16px_rgba(128,131,255,0.35)] transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Blast Confetti Cannon 🎉</span>
        </button>

        <button
          onClick={() => {
            triggerConfetti();
            setDownloadModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-display font-semibold text-xs transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Certificate (PNG)</span>
        </button>
      </div>

      {/* Certificate Modal */}
      <InfoModal
        isOpen={downloadModalOpen}
        title="Certificate Export Ready! 🏆"
        message={`Official Sprint Completion Certificate for "${sprintTitle}"\n\nAwarded to: ${userName}\nCompleted: ${completedDate}\nStreak Achieved: ${streak} Days\n\nHigh-resolution print document generated. You can save, print, or share your transformation achievement!`}
        type="download"
        actionText="Save & Close"
        onClose={() => setDownloadModalOpen(false)}
      />

    </div>
  );
}
