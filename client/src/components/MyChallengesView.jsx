import React, { useState } from "react";
import {
  Compass,
  Search,
  Plus,
  Flame,
  CheckCircle2,
  Trophy,
  Award,
  Droplets,
  BookOpen,
  Footprints,
  Check,
} from "lucide-react";

export default function MyChallengesView({
  challenges = [],
  activeChallenge,
  onSelectChallenge,
  onOpenNewChallenge,
  onOpenCalendar,
  onOpenTodayTasks,
  onOpenCertificate,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeFilterTab, setActiveFilterTab] = useState("all");

  // Deep work checklist items state for interactivity
  const [deepWorkTasks, setDeepWorkTasks] = useState([
    { id: "dw1", text: "Focus Block: 90 mins Deep Coding", done: true },
    { id: "dw2", text: "Push 1 verified GitHub commit", done: true },
    { id: "dw3", text: "Read 1 Technical RFC / Paper (Pending)", done: false },
  ]);

  const toggleDeepWorkTask = (id) => {
    setDeepWorkTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  const completedDeepCount = deepWorkTasks.filter((t) => t.done).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Title & SPRINT HUB & ARCHIVES */}
      <div>
        <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-[#908fa0] mb-1.5">
          <Compass className="w-4 h-4 text-[#8083ff]" />
          <span>Sprint Hub & Archives</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
          My Challenges
        </h1>
        <p className="text-sm text-[#908fa0] mt-1 max-w-3xl leading-relaxed">
          Manage active 30-day sprints, archived victories, and explore curated
          habit templates designed for lasting transformation.
        </p>

        {/* Search, Category Filter, and Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-2xl">
            {/* Search input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-[#908fa0] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#131b2e] border border-white/5 text-xs text-white placeholder:text-[#908fa0] focus:outline-none focus:border-[#8083ff]/60 transition-all"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#131b2e] border border-white/5 text-xs font-display font-semibold text-[#c7c4d7] focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Fitness">Fitness & Health</option>
              <option value="Productivity">Productivity</option>
              <option value="Mindfulness">Mindfulness</option>
            </select>
          </div>

          <button
            onClick={onOpenNewChallenge}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#8083ff] hover:bg-[#6c70ff] text-[#0b1326] font-display font-bold text-xs shadow-[0_0_20px_rgba(128,131,255,0.35)] transition-all shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Sprint</span>
          </button>
        </div>

        {/* Filter Tabs */}
        {(() => {
          const inProgressCount = challenges.filter((c) => {
            const total = c.days?.length || 30;
            const done =
              c.days?.filter((d) => d.status === "completed").length || 0;
            return done < total;
          }).length;
          const completedCount = challenges.filter((c) => {
            const total = c.days?.length || 30;
            const done =
              c.days?.filter((d) => d.status === "completed").length || 0;
            return done >= total;
          }).length;

          const tabs = [
            { id: "all", label: `All Challenges (${challenges.length})` },
            { id: "in_progress", label: `In Progress (${inProgressCount})` },
            { id: "completed", label: `Completed (${completedCount})` },
          ];

          return (
            <div className="flex items-center gap-2 mt-5 border-b border-[#171f33] pb-3 text-xs font-display font-semibold">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilterTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeFilterTab === tab.id
                      ? "bg-[#171f33] text-white border border-white/10 font-bold"
                      : "text-[#908fa0] hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          );
        })()}
      </div>

      {/* SECTION 1: Active Sprints in Execution */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs font-display font-bold">
          <div className="flex items-center gap-2 text-white">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] shadow-[0_0_8px_#4edea3]"></span>
            <span className="tracking-wide">Active Sprints in Execution</span>
          </div>
          <span className="text-[11px] text-[#908fa0] uppercase tracking-wider tabular-nums">
            {challenges.filter((c) => {
              const total = c.days?.length || 30;
              const done = c.days?.filter((d) => d.status === 'completed').length || 0;
              return done < total;
            }).length} OF {Math.max(3, challenges.length)} ACTIVE LIMIT USED
          </span>
        </div>

        {/* Sprints Grid or Clean State */}
        {challenges.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {challenges.map((ch) => {
              const chDays = ch.days ? ch.days.length : 30;
              const chDone = ch.days
                ? ch.days.filter((d) => d.status === "completed").length
                : 0;
              const chPartial = ch.days
                ? ch.days.filter((d) => d.status === "partial").length
                : 0;
              const chMissed = ch.days
                ? ch.days.filter((d) => d.status === "missed").length
                : 0;
              const chPct =
                chDays > 0 ? Math.round((chDone / chDays) * 100) : 0;
              const currentDay = Math.min(chDays, chDone + 1);
              const isCurrentActive = activeChallenge?._id === ch._id;

              return (
                <div
                  key={ch._id}
                  className={`rounded-2xl bg-[#131b2e] border p-6 flex flex-col justify-between transition-all space-y-5 ${
                    isCurrentActive
                      ? "border-[#8083ff]/50 shadow-[0_0_24px_rgba(128,131,255,0.15)]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-display font-extrabold uppercase tracking-wider text-[#908fa0]">
                            {ch.category || "General Mastery"}
                          </span>
                          {isCurrentActive && (
                            <span className="px-2 py-0.5 rounded-full bg-[#8083ff]/20 text-[#c0c1ff] text-[9px] font-display font-bold uppercase tracking-wider border border-[#8083ff]/30">
                              Active
                            </span>
                          )}
                        </div>
                        <h3 className="font-display font-extrabold text-xl text-white tracking-tight">
                          {ch.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-[#571bc1]/40 border border-[#8083ff]/40 text-[#c0c1ff] text-[11px] font-display font-bold flex items-center gap-1">
                          <Flame className="w-3 h-3 text-[#d0bcff]" />
                          {ch.streak || 0}-Day Streak
                        </span>
                      </div>
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5 text-xs font-display">
                      <div>
                        <span className="text-[#908fa0] text-[10px] uppercase block">
                          Timeline
                        </span>
                        <span className="text-sm font-bold text-white tabular-nums">
                          Day {currentDay}{" "}
                          <span className="text-[#908fa0] font-normal text-xs">
                            / {chDays}
                          </span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[#908fa0] text-[10px] uppercase block">
                          Completion
                        </span>
                        <span className="text-sm font-bold text-[#4edea3] tabular-nums">
                          {chPct}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[#908fa0] text-[10px] uppercase block">
                          Consistency
                        </span>
                        <span className="text-sm font-bold text-white tabular-nums flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>{" "}
                          {chDone} Perfect Days
                        </span>
                      </div>
                    </div>

                    {/* Micro-bars visualization */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-display text-[#908fa0]">
                        <span>Phase Progress (Days 1–{chDays})</span>
                        <span className="text-white font-medium">
                          {chDone} Full{" "}
                          {chPartial > 0 ? `• ${chPartial} Partial` : ""}{" "}
                          {chMissed > 0 ? `• ${chMissed} Missed` : ""}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {(ch.days || []).map((d) => {
                          const isDone = d.status === "completed";
                          const isPart = d.status === "partial";
                          const isToday = d.dayNumber === currentDay;

                          let barBg = "bg-[#171f33] opacity-60";
                          if (isDone)
                            barBg =
                              "bg-[#4edea3] shadow-[0_0_6px_rgba(78,222,163,0.3)]";
                          else if (isPart) barBg = "bg-[#fb923c]";
                          else if (isToday)
                            barBg = "bg-[#c0c1ff] animate-pulse";

                          return (
                            <div
                              key={d.dayNumber}
                              className={`h-1.5 flex-1 min-w-[6px] max-w-[14px] rounded-full transition-all ${barBg}`}
                              title={`Day ${d.dayNumber}: ${d.status}`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Habits summary if available */}
                    {ch.habits && ch.habits.length > 0 && (
                      <div className="mt-4 space-y-1.5">
                        <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[#908fa0] block">
                          Daily Habits (
                          {ch.habits.filter((h) => h.completed).length}/
                          {ch.habits.length})
                        </span>
                        <div className="space-y-1">
                          {ch.habits.slice(0, 3).map((h) => (
                            <div
                              key={h.id}
                              className="flex items-center gap-2 text-xs text-[#c7c4d7]"
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${h.completed ? "bg-[#4edea3]" : "bg-[#908fa0]"}`}
                              ></span>
                              <span
                                className={
                                  h.completed
                                    ? "line-through text-[#908fa0]"
                                    : "text-white"
                                }
                              >
                                {h.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                    {!isCurrentActive ? (
                      <button
                        onClick={() =>
                          onSelectChallenge && onSelectChallenge(ch)
                        }
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-display font-bold text-white transition-all cursor-pointer"
                      >
                        Set as Active Sprint
                      </button>
                    ) : (
                      <span className="text-xs text-[#4edea3] font-display font-semibold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        Currently Active
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (onSelectChallenge) onSelectChallenge(ch);
                          onOpenCalendar();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-display font-semibold text-[#c7c4d7] hover:text-white transition-all cursor-pointer"
                      >
                        Sprint Calendar
                      </button>

                      <button
                        onClick={() => {
                          if (onSelectChallenge) onSelectChallenge(ch);
                          onOpenTodayTasks();
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#8083ff] hover:bg-[#6c70ff] text-[#0b1326] text-xs font-display font-bold shadow-[0_0_12px_rgba(128,131,255,0.3)] transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Today's Tasks</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 px-6 rounded-2xl bg-[#131b2e] border border-dashed border-white/10 text-center space-y-3">
            <p className="font-display font-bold text-base text-white">
              No active sprint challenges yet
            </p>
            <p className="text-xs text-[#908fa0] max-w-md mx-auto">
              Create a custom habit sprint (14, 21, 30, 60, 90 days) or enroll
              in one of our curated blueprints below to track your streak.
            </p>
            <button
              onClick={onOpenNewChallenge}
              className="px-4 py-2 rounded-xl bg-[#8083ff] text-[#0b1326] font-display font-bold text-xs inline-flex items-center gap-1.5 shadow-[0_0_16px_rgba(128,131,255,0.3)] hover:brightness-110 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Your First Sprint</span>
            </button>
          </div>
        )}
      </section>

      {/* SECTION 2: Archived Victories */}
      {(() => {
        const completedSprints = challenges.filter((c) => {
          const total = c.days?.length || 30;
          const done =
            c.days?.filter((d) => d.status === "completed").length || 0;
          return done >= total;
        });

        if (completedSprints.length === 0) {
          return null;
        }

        return (
          <section className="space-y-4">
            <div className="flex items-center justify-between text-xs font-display font-bold">
              <div className="flex items-center gap-2 text-white">
                <Trophy className="w-4 h-4 text-[#fbbf24]" />
                <span className="tracking-wide">Archived Victories</span>
              </div>
              <span className="text-[11px] text-[#908fa0] uppercase tracking-wider">
                {completedSprints.length} COMPLETED{" "}
                {completedSprints.length === 1 ? "CHALLENGE" : "CHALLENGES"}
              </span>
            </div>

            <div className="space-y-3">
              {completedSprints.map((ch) => {
                const total = ch.days?.length || 30;
                const done =
                  ch.days?.filter((d) => d.status === "completed").length || 0;
                return (
                  <div
                    key={ch._id}
                    className="rounded-2xl bg-[#131b2e] border border-white/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#00885d]/25 border border-[#4edea3]/30 flex items-center justify-center shrink-0">
                        <Check className="w-6 h-6 text-[#4edea3] stroke-[3]" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-display font-bold">
                          <span className="px-2 py-0.5 rounded-full bg-[#00885d]/30 text-[#4edea3]">
                            100% FINISHED
                          </span>
                          <span className="text-[#908fa0]">
                            • Mastery Verified •
                          </span>
                          <span className="text-[#c0c1ff]">
                            {ch.category || "Sprint Champion"}
                          </span>
                        </div>

                        <h4 className="font-display font-bold text-base text-white">
                          {ch.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#908fa0] font-display">
                          <span className="flex items-center gap-1 text-[#4edea3]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Final
                            Score: {done}/{total} Days Completed
                          </span>
                          <span>• Streak: {ch.streak || total} days</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => {
                          onSelectChallenge(ch);
                          onOpenCertificate();
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#8083ff] hover:bg-[#6c70ff] text-[#0b1326] text-xs font-display font-bold shadow-[0_0_12px_rgba(128,131,255,0.3)] transition-all cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>View Certificate & Badge</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })()}
    </div>
  );
}
