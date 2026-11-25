import React from 'react';
import {
  LayoutDashboard,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Layers,
  Award,
  Settings,
  Flame,
  Zap
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onSelectTab,
  activeStreak = 12
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard (Home)', icon: LayoutDashboard },
    { id: 'today', label: "Today's Tasks", icon: CheckCircle2 },
    { id: 'calendar', label: 'Sprint Calendar', icon: Calendar },
    { id: 'analytics', label: 'Progress & Analytics', icon: TrendingUp },
    { id: 'challenges', label: 'My Challenges', icon: Layers },
    { id: 'completion', label: 'Challenge Completion', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-[#060e20] border-r border-[#171f33] flex flex-col justify-between shrink-0 min-h-screen sticky top-0 z-30 select-none">
      {/* Top Brand Header */}
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-[#171f33]/60">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#8083ff] flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.4)] shrink-0">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display font-black text-lg tracking-tight text-[#0F172A] dark:text-white leading-tight">
              DayByDay
            </h1>
            <p className="text-[10px] font-display font-bold uppercase tracking-wider text-[#64748B] dark:text-[#908fa0]">
              Sprint Habit Tracker
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-display font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#8083ff] text-[#0b1326] shadow-[0_4px_16px_rgba(128,131,255,0.35)] font-bold'
                    : 'text-[#475569] dark:text-[#c7c4d7] hover:text-[#0f172a] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#171f33]/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#0b1326] stroke-[2.5]' : 'text-[#64748b] dark:text-[#908fa0]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sprint Streak Widget */}
      <div className="p-4 m-3 rounded-2xl bg-[#131b2e] border border-white/5 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-display font-bold uppercase tracking-wider text-[#64748B] dark:text-[#908fa0]">
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-[#4edea3]" />
            Sprint Streak
          </span>
          <span className="text-[#4edea3] text-xs">⚡</span>
        </div>
        <div>
          <span className="text-xl font-display font-extrabold text-[#0F172A] dark:text-white tabular-nums tracking-tight">
            {activeStreak}
          </span>
          <span className="text-xs text-[#64748B] dark:text-[#908fa0] ml-1.5 font-medium">days unbroken</span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-[#171f33] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#4edea3]"
            style={{ width: `${Math.min(100, (activeStreak / 30) * 100)}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
