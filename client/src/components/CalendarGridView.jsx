import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Lock,
  PieChart,
  Activity,
  Sparkles,
  Trophy,
  Clock,
} from "lucide-react";

export default function CalendarGridView({
  activeChallenge,
  dailyTasks = [],
  onToggleDay,
  onOpenDayModal,
  onOpenTelemetry,
  onOpenLockNotice,
  onOpenNewChallenge,
}) {
  const [filter, setFilter] = useState("all");

  // If no active challenge, display an inviting empty state with Create Challenge button
  if (!activeChallenge) {
    return (
      <div className="rounded-3xl bg-[#131b2e] border border-white/10 p-12 text-center space-y-6 max-w-2xl mx-auto my-12 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-[#8083ff]/20 text-[#8083ff] flex items-center justify-center mx-auto shadow-[0_0_24px_rgba(128,131,255,0.25)]">
          <CalendarIcon className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
            No Active Sprint Challenge
          </h2>
          <p className="text-xs sm:text-sm text-[#908fa0] max-w-md mx-auto leading-relaxed">
            Sprint Horizon calendar activates when you commit to a challenge.
            Create your first challenge to generate a personalized day-by-day
            roadmap.
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={onOpenNewChallenge}
            className="px-6 py-3 rounded-2xl bg-[#8083ff] hover:bg-[#6c70ff] text-[#0b1326] font-display font-bold text-sm shadow-[0_0_20px_rgba(128,131,255,0.4)] transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>Create Sprint Challenge</span>
          </button>
        </div>
      </div>
    );
  }

  const sprintLength = activeChallenge?.days?.length || 30;
  const challengeTitle = activeChallenge?.title || "Habit Sprint Matrix";
  const startDate = activeChallenge?.startDate
    ? new Date(activeChallenge.startDate)
    : new Date();

  const completedDaysCount =
    activeChallenge?.days?.filter((d) => d.status === "completed").length || 0;
  const partialDaysCount =
    activeChallenge?.days?.filter((d) => d.status === "partial").length || 0;
  const missedDaysCount =
    activeChallenge?.days?.filter((d) => d.status === "missed").length || 0;
  const getSprintCurrentDay = () => {
    if (!activeChallenge?.startDate || sprintLength === 0) return 1;
    const start = new Date(activeChallenge.startDate);
    start.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff =
      Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(sprintLength, diff));
  };
  const currentDayNum = activeChallenge ? getSprintCurrentDay() : 0;
  const remainingCount = Math.max(
    0,
    sprintLength - completedDaysCount - missedDaysCount,
  );
  const completionPercentage =
    sprintLength > 0
      ? Math.round((completedDaysCount / sprintLength) * 100)
      : 0;

  // Dynamic total tasks per day: read from active challenge habits or daily tasks
  const challengeHabitsCount = activeChallenge?.habits?.length || 0;
  const dailyTasksCount = dailyTasks?.length || 0;
  const totalTasksPerDay = Math.max(1, challengeHabitsCount || dailyTasksCount || 3);
  const todayTasksDoneCount = dailyTasks?.filter((t) => t.completed || t.done).length || 0;

  // Compute days from active challenge or fallback
  const days =
    activeChallenge?.days && activeChallenge.days.length > 0
      ? activeChallenge.days.map((d) => {
          const dayNum = d.dayNumber;
          const dayDate = new Date(
            startDate.getTime() + (dayNum - 1) * 86400000,
          );
          const dateStr = dayDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          let status = "future";
          if (d.status === "completed") status = "completed";
          else if (d.status === "partial") status = "partial";
          else if (d.status === "missed") status = "missed";
          else if (dayNum === currentDayNum) status = "active_today";

          let tasksCompleted = 0;
          let percentage = 0;

          if (d.status === "completed") {
            tasksCompleted = totalTasksPerDay;
            percentage = 100;
          } else if (d.status === "partial") {
            tasksCompleted = Math.max(1, Math.round(totalTasksPerDay * 0.5));
            percentage = Math.round((tasksCompleted / totalTasksPerDay) * 100);
          } else if (dayNum === currentDayNum) {
            tasksCompleted = todayTasksDoneCount;
            percentage = Math.round((tasksCompleted / totalTasksPerDay) * 100);
          }

          return {
            dayNumber: dayNum,
            dayLabel: `Day ${dayNum < 10 ? "0" + dayNum : dayNum}`,
            status,
            date: dateStr,
            tasksCompleted,
            totalTasks: totalTasksPerDay,
            percentage,
            note: d.note || "",
            mood: d.mood,
          };
        })
      : Array.from({ length: 30 }, (_, i) => {
          const dayNum = i + 1;
          return {
            dayNumber: dayNum,
            dayLabel: `Day ${dayNum < 10 ? "0" + dayNum : dayNum}`,
            status: "future",
            date: `Day ${dayNum}`,
            tasksCompleted: 0,
            totalTasks: totalTasksPerDay,
            percentage: 0,
          };
        });

  // Toggle status on click for interactive usage - only today is editable
  const handleCardClick = (day) => {
    const isToday = day.dayNumber === currentDayNum;
    if (isToday) {
      if (onOpenDayModal) {
        onOpenDayModal(day.rawDay || day);
      } else if (onToggleDay) {
        onToggleDay(day.dayNumber);
      }
    } else {
      const isPast = day.dayNumber < currentDayNum;
      if (onOpenLockNotice) {
        onOpenLockNotice({
          dayNumber: day.dayNumber,
          isPast,
          currentDayNum,
          unlockDateStr: day.dateString,
        });
      }
    }
  };

  // Filter items
  const filteredDays = days.filter((d) => {
    if (filter === "all") return true;
    if (filter === "completed") return d.status === "completed";
    if (filter === "partial") return d.status === "partial";
    if (filter === "missed") return d.status === "missed";
    if (filter === "upcoming")
      return d.status === "future" || d.status === "active_today";
    return true;
  });

  // Circumference for header SVG ring
  const circleRadius = 24;
  const circumference = 2 * Math.PI * circleRadius; // ~150.8
  const offset = circumference - (completionPercentage / 100) * circumference;

  const startFormatted = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endDate = new Date(startDate.getTime() + (sprintLength - 1) * 86400000);
  const endFormatted = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP HEADER SUMMARY CARD */}
      <div className="rounded-3xl bg-[#131b2e] border border-white/10 p-6 sm:p-7 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Title & Status */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-display font-bold uppercase tracking-wider bg-[#8083ff]/15 text-[#c0c1ff] border border-[#8083ff]/25">
                <PieChart className="w-3.5 h-3.5 text-[#8083ff]" />
                <span>{sprintLength}-Day Sprint Matrix</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-display font-semibold bg-white/5 text-[#908fa0] border border-white/5">
                <Clock className="w-3.5 h-3.5 text-[#4edea3]" />
                <span>
                  {startFormatted} – {endFormatted}
                </span>
              </span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
              {challengeTitle}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs font-display text-[#908fa0] pt-0.5">
              <span className="text-[#c0c1ff] font-semibold">
                Day {currentDayNum} in Progress
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-white">
                <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>{" "}
                {completedDaysCount} Perfect
              </span>
              {partialDaysCount > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-white">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#d0bcff]"></span>{" "}
                    {partialDaysCount} Partial
                  </span>
                </>
              )}
              {missedDaysCount > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-white">
                    <span className="w-2 h-2 rounded-full bg-[#f87171]"></span>{" "}
                    {missedDaysCount} Missed
                  </span>
                </>
              )}
              <span>•</span>
              <span>{remainingCount} Remaining</span>
            </div>
          </div>

          {/* Right SPRINT PROGRESS ring & Telemetry button */}
          <div className="flex items-center gap-6 shrink-0 self-start lg:self-center">
            <div className="flex items-center gap-4">
              {/* Circular Gauge */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg
                  className="w-full h-full -rotate-90 transform"
                  viewBox="0 0 60 60"
                >
                  <circle
                    cx="30"
                    cy="30"
                    r={circleRadius}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  <circle
                    cx="30"
                    cy="30"
                    r={circleRadius}
                    stroke="#4edea3"
                    strokeWidth="5"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-display font-extrabold text-white tabular-nums">
                    {completionPercentage}%
                  </span>
                </div>
              </div>

              {/* Progress Text */}
              <div>
                <span className="text-[10px] font-display font-extrabold uppercase tracking-wider text-[#908fa0] block">
                  SPRINT PROGRESS
                </span>
                <span className="text-xl font-display font-black text-white tabular-nums">
                  {completedDaysCount}{" "}
                  <span className="text-[#908fa0] text-sm font-semibold">
                    / {sprintLength}
                  </span>
                </span>
              </div>
            </div>

            {/* Telemetry Button */}
            <button
              onClick={onOpenTelemetry}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-display font-bold text-white transition-all shadow-sm cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-[#8083ff]" />
              <span>Telemetry</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs & Legend Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-white/5 text-xs font-display">
          {/* Left: Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 font-semibold">
            {[
              { id: "all", label: `All ${sprintLength} Days` },
              { id: "completed", label: `Completed (${completedDaysCount})` },
              { id: "partial", label: `Partial (${partialDaysCount})` },
              { id: "missed", label: `Missed (${missedDaysCount})` },
              { id: "upcoming", label: `Upcoming (${remainingCount})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  filter === f.id
                    ? "bg-[#8083ff] text-[#0b1326] font-bold shadow-[0_0_12px_rgba(128,131,255,0.3)]"
                    : "bg-[#0b1326] text-[#908fa0] hover:text-white border border-white/5"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Right: Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-[#908fa0]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]"></span>{" "}
              100% Done
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d0bcff]"></span>{" "}
              Partial
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f87171]"></span>{" "}
              Missed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8083ff] animate-pulse"></span>{" "}
              Active Today
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#31394d]"></span>{" "}
              Future
            </span>
          </div>
        </div>
      </div>

      {/* 2. THE 30-DAY GRID (6 COLUMNS × 5 ROWS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {filteredDays.map((day) => {
          const isToday = day.status === "active_today";
          const isCompleted = day.status === "completed";
          const isPartial = day.status === "partial";
          const isMissed = day.status === "missed";
          const isFuture = day.status === "future";
          const isFinale = day.dayNumber === 30;

          // Border & Background based on status
          let cardStyle = "bg-[#131b2e] border-white/5 text-[#908fa0]";
          if (isToday) {
            cardStyle =
              "bg-[#171f33] border-2 border-[#8083ff] shadow-[0_0_24px_rgba(128,131,255,0.45)] -translate-y-0.5";
          } else if (isCompleted) {
            cardStyle =
              "bg-[#131b2e] border-white/10 hover:border-[#4edea3]/40";
          } else if (isPartial) {
            cardStyle =
              "bg-[#131b2e] border-white/10 hover:border-[#d0bcff]/40";
          } else if (isMissed) {
            cardStyle =
              "bg-[#131b2e] border-white/10 hover:border-[#f87171]/40";
          } else if (isFuture) {
            cardStyle = "bg-[#0f172a]/70 border-white/5 opacity-70";
          }

          return (
            <div
              key={day.dayNumber}
              onClick={() => handleCardClick(day)}
              className={`rounded-2xl border p-4 flex flex-col justify-between space-y-3 cursor-pointer select-none transition-all duration-150 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden ${cardStyle}`}
              title={`Day ${day.dayNumber}: Click for reflection notes & task details`}
            >
              {/* TOP ROW: Day Label & Status Icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-display font-extrabold text-sm tabular-nums ${isToday ? "text-white" : "text-white"}`}
                  >
                    {day.dayLabel}
                  </span>

                  {/* TODAY Badge */}
                  {isToday && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-display font-black tracking-wider uppercase bg-[#8083ff] text-[#0b1326]">
                      TODAY
                    </span>
                  )}
                </div>

                {/* Right Status Indicator */}
                <div>
                  {isCompleted && (
                    <div className="w-5 h-5 rounded-full bg-[#00885d]/30 border border-[#4edea3]/40 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3]" />
                    </div>
                  )}

                  {isPartial && (
                    <div className="w-5 h-5 rounded-full bg-[#571bc1]/30 border border-[#d0bcff]/40 flex items-center justify-center">
                      <span className="text-[10px] text-[#d0bcff] font-bold">
                        ◐
                      </span>
                    </div>
                  )}

                  {isMissed && (
                    <div className="w-5 h-5 rounded-full bg-[#93000a]/30 border border-[#f87171]/40 flex items-center justify-center">
                      <XCircle className="w-3.5 h-3.5 text-[#f87171]" />
                    </div>
                  )}

                  {isToday && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8083ff] shadow-[0_0_8px_#8083ff] block animate-pulse" />
                  )}

                  {isFuture && <Lock className="w-3.5 h-3.5 text-[#464554]" />}
                </div>
              </div>

              {/* MIDDLE ROW: Date, Tasks Completed, Percentage */}
              <div className="space-y-1 font-display">
                <span className="text-[11px] text-[#908fa0] block">
                  {day.date}
                </span>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-medium">
                    {isFuture
                      ? `0/${day.totalTasks} Scheduled`
                      : `${day.tasksCompleted}/${day.totalTasks} Tasks`}
                  </span>

                  <span
                    className={`font-bold tabular-nums ${
                      isCompleted
                        ? "text-[#4edea3]"
                        : isPartial
                          ? "text-[#d0bcff]"
                          : isMissed
                            ? "text-[#f87171]"
                            : isToday
                              ? "text-white"
                              : "text-[#908fa0]"
                    }`}
                  >
                    {isFuture ? "Upcoming" : `${day.percentage}%`}
                  </span>
                </div>
              </div>

              {/* BOTTOM ROW: Micro Progress Bar or Special Finale Badge */}
              <div className="pt-1">
                {isFinale ? (
                  <div className="w-full flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[9px] font-display font-extrabold uppercase tracking-wider bg-[#571bc1] text-[#c0c1ff] flex items-center gap-1">
                      FINALE <Trophy className="w-3 h-3 text-amber-300" />
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-1.5 rounded-full bg-[#171f33] overflow-hidden">
                    {isCompleted && (
                      <div className="h-full rounded-full bg-[#4edea3] w-full shadow-[0_0_6px_#4edea3]" />
                    )}
                    {isPartial && (
                      <div
                        className="h-full rounded-full bg-[#d0bcff]"
                        style={{ width: `${day.percentage}%` }}
                      />
                    )}
                    {isToday && (
                      <div
                        className="h-full rounded-full bg-[#8083ff] animate-pulse"
                        style={{ width: "60%" }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
