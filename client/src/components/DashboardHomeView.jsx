import React from 'react';
import {
  Plus,
  Calendar,
  CheckCircle2,
  Circle,
  ExternalLink,
  Flame,
  TrendingUp,
  LayoutGrid,
  ArrowRight,
  Quote,
  Lock
} from 'lucide-react';

export default function DashboardHomeView({
  currentUser,
  activeChallenge,
  tasks = [],
  onToggleTask,
  onToggleDay,
  onOpenDayModal,
  onOpenTodayTasks,
  onOpenSprintView,
  onOpenNewChallenge,
  onOpenLockNotice
}) {
  const completedCount = tasks.filter(t => t.completed || t.done).length;
  const totalCount = tasks.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Derive dynamic metrics from the user's active challenge
  const sprintDays = activeChallenge?.days || [];
  const totalDays = sprintDays.length;
  const completedDaysCount = sprintDays.filter(d => d.status === 'completed').length;
  const partialDaysCount = sprintDays.filter(d => d.status === 'partial').length;
  const missedDaysCount = sprintDays.filter(d => d.status === 'missed').length;

  // Persistent calendar-based Current Day calculation (does not jump when days are clicked)
  const getSprintCurrentDay = () => {
    if (!activeChallenge?.startDate || totalDays === 0) return 1;
    const start = new Date(activeChallenge.startDate);
    start.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(totalDays, diff));
  };
  const currentDayNum = activeChallenge ? getSprintCurrentDay() : 0;
  const challengePct = totalDays > 0 ? Math.round((completedDaysCount / totalDays) * 100) : 0;
  const streak = activeChallenge?.streak || 0;
  const remainingDays = Math.max(0, totalDays - completedDaysCount);

  // Today's formatted date string
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP HERO ROW: WELCOME BANNER + DAILY MOTIVATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Welcome Card (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-[#131b2e] border border-white/5 p-6 sm:p-7 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="text-xs font-display font-semibold text-[#4edea3] tracking-wide flex items-center gap-2">
              <span>{todayFormatted}</span>
              <span className="text-[#908fa0]">•</span>
              <span className="text-[#c0c1ff]">
                {activeChallenge ? `Day ${currentDayNum} of ${totalDays}` : 'No Active Sprint'}
              </span>
            </div>

            {/* Dynamic User Name */}
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              Welcome back, {currentUser?.name || 'Achiever'}
            </h1>

            <p className="font-sans text-xs sm:text-sm text-[#908fa0] leading-relaxed max-w-xl">
              {activeChallenge
                ? `Consistency over intensity is your superpower. You are ${challengePct}% through your ${totalDays}-Day ${activeChallenge.title}.`
                : 'Consistency over intensity is your superpower. Create a habit sprint to track your streak and unlock your potential.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenTodayTasks}
              className="px-4 py-2 rounded-xl bg-[#8083ff] hover:bg-[#9295ff] text-[#0b1326] font-display font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_16px_rgba(128,131,255,0.3)] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Task</span>
            </button>

            <button
              type="button"
              onClick={activeChallenge ? onOpenSprintView : onOpenNewChallenge}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-display font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#8083ff]" />
              <span>{activeChallenge ? 'Sprint View' : 'Start New Sprint'}</span>
            </button>
          </div>
        </div>

        {/* Right Motivation Card (1 Col) with Quotation Icon */}
        <div className="rounded-2xl bg-[#131b2e] border border-white/5 p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-display font-bold uppercase tracking-wider text-[#908fa0]">
              <span>DAILY MOTIVATION</span>
              <Quote className="w-4 h-4 text-[#8083ff] rotate-180 opacity-80" />
            </div>

            <p className="font-display font-medium text-xs sm:text-sm text-white italic leading-relaxed">
              “Daily konjam konjam improve aana podhum, 30 days la un life-la difference theriyum!”
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] font-display pt-2 border-t border-white/5">
            <span className="flex items-center gap-1.5 text-[#4edea3] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
              {completedCount} of {totalCount} tasks finished today
            </span>
            <span className="text-[#908fa0]">
              Tamil Proverb
            </span>
          </div>
        </div>

      </div>

      {/* 2. 4-METRICS STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Current Challenge */}
        <div className="rounded-2xl bg-[#131b2e] border border-white/5 p-4 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-display font-bold uppercase tracking-wider text-[#908fa0]">
            <span>CURRENT CHALLENGE</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#8083ff]" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-white truncate">
              {activeChallenge?.title || 'No Active Challenge'}
            </h4>
            <p className="text-[11px] font-display text-[#908fa0]">
              {activeChallenge ? `Day ${currentDayNum} of ${totalDays} (${challengePct}%)` : 'Create a sprint to start'}
            </p>
          </div>
          <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-[#8083ff]" style={{ width: `${challengePct}%` }}></div>
          </div>
        </div>

        {/* Metric 2: Today's Completion (Dynamically calculated from user tasks) */}
        <div className="rounded-2xl bg-[#131b2e] border border-white/5 p-4 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-display font-bold uppercase tracking-wider text-[#908fa0]">
            <span>TODAY'S COMPLETION</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3]" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-white">
              {totalCount > 0 ? `${completedCount} / ${totalCount} Done` : '0 Tasks'}
            </h4>
            <p className="text-[11px] font-display text-[#4edea3]">
              {totalCount > 0 ? `${completionPct}% finished` : 'Add tasks to start'}
            </p>
          </div>
          <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-[#4edea3]" style={{ width: `${completionPct}%` }}></div>
          </div>
        </div>

        {/* Metric 3: Active Streak (Strictly from activeChallenge) */}
        <div className="rounded-2xl bg-[#131b2e] border border-white/5 p-4 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-display font-bold uppercase tracking-wider text-[#908fa0]">
            <span>ACTIVE STREAK</span>
            <Flame className="w-3.5 h-3.5 text-[#4edea3]" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-white flex items-center gap-1.5">
              {streak} Days <span className="text-sm">🔥</span>
            </h4>
            <p className="text-[11px] font-display text-[#908fa0]">
              Personal best: {activeChallenge?.bestStreak || streak} days
            </p>
          </div>
          <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#4edea3]"
              style={{ width: `${totalDays > 0 ? Math.min(100, Math.round((streak / totalDays) * 100)) : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 4: Consistency */}
        <div className="rounded-2xl bg-[#131b2e] border border-white/5 p-4 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-display font-bold uppercase tracking-wider text-[#908fa0]">
            <span>CONSISTENCY</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#c0c1ff]" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-white">{challengePct}% On Pace</h4>
            <p className="text-[11px] font-display text-[#908fa0]">
              {activeChallenge ? `${remainingDays} days remaining` : '0 days active'}
            </p>
          </div>
          <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-[#8083ff]" style={{ width: `${challengePct}%` }}></div>
          </div>
        </div>

      </div>

      {/* 3. MIDDLE SECTION: TODAY'S CHECKLIST (LEFT) + NEXT MILESTONE (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Checklist (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-[#131b2e] border border-white/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-white">Today's Checklist</h3>
              <p className="text-xs text-[#908fa0]">Daily routines and focus targets</p>
            </div>
            <span className="text-xs font-display font-semibold text-[#908fa0]">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>

          {/* User Tasks List (Or Empty State when no tasks added yet) */}
          {tasks.length > 0 ? (
            <div className="space-y-2.5">
              {tasks.map((task) => {
                const isDone = task.completed || task.done;
                return (
                  <div
                    key={task.id}
                    onClick={() => onToggleTask && onToggleTask(task.id)}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer border ${
                      isDone
                        ? 'bg-[#171f33]/70 border-white/5 text-[#908fa0]'
                        : 'bg-[#171f33] border-white/10 hover:border-white/20 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isDone ? (
                        <div className="w-5 h-5 rounded-full bg-[#00885d]/30 border border-[#4edea3]/40 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3]" />
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-[#464554] shrink-0" />
                      )}
                      <span className={`text-xs font-display font-medium ${isDone ? 'line-through text-[#908fa0]' : 'text-white'}`}>
                        {task.text}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-display font-semibold tracking-wider bg-[#171f33] text-[#c0c1ff] border border-white/10">
                      {task.category || 'Routine'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 px-4 text-center rounded-xl bg-[#171f33]/40 border border-dashed border-white/10 space-y-3">
              <p className="text-xs text-[#908fa0]">No daily tasks added yet.</p>
              <button
                type="button"
                onClick={onOpenTodayTasks}
                className="px-4 py-2 rounded-xl bg-[#8083ff] text-[#0b1326] font-display font-bold text-xs inline-flex items-center gap-1.5 shadow-[0_0_12px_rgba(128,131,255,0.3)] hover:brightness-110 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create Your Daily Tasks</span>
              </button>
            </div>
          )}

          {/* Action Row redirecting to Tasks module */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-[#908fa0]">Want to add or customize tasks?</span>
            <button
              type="button"
              onClick={onOpenTodayTasks}
              className="text-xs font-display font-bold text-[#8083ff] hover:text-[#c0c1ff] flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>Open Tasks Module</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Next Milestone Card (1 col) */}
        <div className="rounded-2xl bg-[#131b2e] border border-white/5 p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-display font-bold uppercase tracking-wider text-[#908fa0]">
              <span>NEXT MILESTONE</span>
              <span className="text-[10px] text-[#908fa0]">
                {activeChallenge ? `${Math.max(1, 21 - completedDaysCount)} DAYS LEFT` : 'INACTIVE'}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-xl">🏆</span>
              <h3 className="font-display font-bold text-base text-white">21-Day Habit Lock</h3>
            </div>

            <p className="font-sans text-xs text-[#908fa0] leading-relaxed">
              Day 21 solidifies psychological neural habits into effortless automated routine.
            </p>
          </div>

          {/* Bottom Progress */}
          <div className="space-y-2 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between text-xs font-display">
              <span className="text-[#908fa0]">Milestone Target:</span>
              <span className="font-bold text-white tabular-nums">
                {Math.min(21, completedDaysCount)} / 21 Days ({Math.min(100, Math.round((completedDaysCount / 21) * 100))}%)
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#8083ff]"
                style={{ width: `${Math.min(100, Math.round((completedDaysCount / 21) * 100))}%` }}
              ></div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. BOTTOM SECTION: DYNAMIC SPRINT HORIZON GRID */}
      <div className="rounded-2xl bg-[#131b2e] border border-white/5 p-6 space-y-5">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-[#8083ff]" />
            <h3 className="font-display font-bold text-sm text-white">
              {activeChallenge ? `${totalDays}-Day Sprint Horizon` : 'Sprint Horizon'}
            </h3>
            {activeChallenge && (
              <>
                <span className="text-[#908fa0] text-xs">•</span>
                <span className="text-[#c0c1ff] text-xs font-medium">{activeChallenge.title}</span>
              </>
            )}
          </div>

          {/* Dynamic Legend */}
          {activeChallenge && (
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-display font-semibold text-[#908fa0]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]"></span> {completedDaysCount} Completed
              </span>
              {partialDaysCount > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d0bcff]"></span> {partialDaysCount} Partial
                </span>
              )}
              {missedDaysCount > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f87171]"></span> {missedDaysCount} Missed
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c0c1ff] animate-pulse"></span> Day {currentDayNum} (Today)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#171f33] border border-white/10"></span> {remainingDays} Ahead
              </span>
            </div>
          )}
        </div>

        {/* Grid Matrix / Empty State */}
        {activeChallenge && sprintDays.length > 0 ? (
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
            {sprintDays.map((d) => {
              const day = d.dayNumber;
              const isToday = day === currentDayNum;
              const isPast = day < currentDayNum;
              const isFuture = day > currentDayNum;
              const isCompleted = d.status === 'completed';
              const isPartial = d.status === 'partial';
              const isMissed = d.status === 'missed';

              let blockStyle = 'bg-[#131b2e] border border-white/5';
              let textStyle = 'text-[#908fa0] font-medium';
              let statusBadge = null;

              if (isCompleted) {
                blockStyle = 'bg-[#00885d]/30 border border-[#4edea3]/40';
                textStyle = 'text-[#4edea3] font-bold';
                statusBadge = <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3]" />;
              } else if (isPartial) {
                blockStyle = 'bg-[#571bc1]/30 border border-[#8083ff]/40';
                textStyle = 'text-[#d0bcff] font-bold';
              } else if (isMissed) {
                blockStyle = 'bg-[#f87171]/15 border border-[#f87171]/40';
                textStyle = 'text-[#f87171] font-medium';
              } else if (isFuture) {
                blockStyle = 'bg-[#0f172a]/60 border border-white/5 opacity-50';
                textStyle = 'text-[#908fa0]/50 font-medium';
              }

              // Only today is editable with active cursor and glow; past and future are locked
              const todayRing = isToday
                ? 'ring-2 ring-[#8083ff] shadow-[0_0_16px_rgba(128,131,255,0.4)] cursor-pointer hover:scale-[1.02]'
                : 'cursor-not-allowed opacity-85';

              return (
                <div
                  key={day}
                  onClick={() => {
                    if (isToday) {
                      if (onOpenDayModal) {
                        onOpenDayModal(d);
                      } else if (onToggleDay) {
                        onToggleDay(day);
                      }
                    } else {
                      if (onOpenLockNotice) {
                        onOpenLockNotice({
                          dayNumber: day,
                          isPast,
                          currentDayNum,
                          unlockDateStr: null
                        });
                      }
                    }
                  }}
                  className={`h-16 rounded-xl flex flex-col items-center justify-center p-1 transition-all select-none relative ${blockStyle} ${todayRing}`}
                  title={isToday
                    ? `Day ${day}: Today (Click to edit status & reflection)`
                    : (isPast ? `Day ${day}: Past Day (Locked from editing)` : `Day ${day}: Future Day (Locked)`)
                  }
                >
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-display tabular-nums ${textStyle}`}>
                      {day}
                    </span>
                    {statusBadge}
                    {!isToday && (
                      <Lock className="w-2.5 h-2.5 text-[#908fa0]/60 shrink-0" />
                    )}
                  </div>
                  {isToday && (
                    <span className="text-[9px] font-display font-extrabold text-[#c0c1ff] uppercase tracking-wider mt-0.5">
                      Today
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center rounded-xl bg-[#171f33]/40 border border-dashed border-white/10 space-y-3">
            <p className="text-sm font-display font-semibold text-white">No active sprint challenge found</p>
            <p className="text-xs text-[#908fa0]">Create a custom sprint challenge (14, 21, 30, 60, 90 days) to track your daily horizon.</p>
            <button
              type="button"
              onClick={onOpenNewChallenge}
              className="px-4 py-2 rounded-xl bg-[#8083ff] text-[#0b1326] font-display font-bold text-xs inline-flex items-center gap-1.5 shadow-[0_0_12px_rgba(128,131,255,0.3)] hover:brightness-110 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Challenge</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
