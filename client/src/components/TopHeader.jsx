import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Zap,
  Plus,
  Bell,
  ChevronDown,
  LogOut,
  UserCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Check,
  X,
  Sun,
  Moon
} from 'lucide-react';

export default function TopHeader({
  challenges = [],
  activeChallenge,
  onSelectChallenge,
  onOpenNewChallenge,
  onOpenNotifications,
  streak = 0,
  todayProgress = 0,
  currentUser,
  notifications = [],
  onMarkAllNotificationsRead,
  onMarkNotificationRead,
  onDismissNotification,
  isDark,
  onToggleTheme,
  onLogout
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChallengeDropdownOpen, setIsChallengeDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const challengeRef = useRef(null);

  const userInitial = currentUser?.name ? currentUser.name.trim().charAt(0).toUpperCase() : 'U';

  const totalDays = activeChallenge?.days?.length || 30;
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    if (onMarkAllNotificationsRead) {
      onMarkAllNotificationsRead();
    }
  };

  const markOneAsRead = (id) => {
    if (onMarkNotificationRead) {
      onMarkNotificationRead(id);
    }
  };

  const removeNotification = (id, e) => {
    e.stopPropagation();
    if (onDismissNotification) {
      onDismissNotification(id);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (challengeRef.current && !challengeRef.current.contains(e.target)) {
        setIsChallengeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 px-6 bg-[#0b1326]/90 backdrop-blur-md border-b border-[#171f33] flex items-center justify-between sticky top-0 z-20">
      
      {/* Left: Active Challenge Chip with Dropdown Switcher */}
      <div className="flex items-center gap-3 relative" ref={challengeRef}>
        <div
          onClick={() => setIsChallengeDropdownOpen(!isChallengeDropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#131b2e] border border-white/10 text-xs font-display cursor-pointer hover:border-[#8083ff]/50 transition-all select-none"
        >
          <span className="font-bold text-white max-w-[170px] sm:max-w-[220px] truncate">
            {activeChallenge?.title || 'Select a Challenge'}
          </span>
          <span className="text-[#908fa0]">•</span>
          <span className="text-[#c0c1ff] font-semibold tabular-nums">
            {activeChallenge ? `Day ${currentDayNum} of ${totalDays}` : 'No Sprint'}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-[#908fa0] transition-transform ${isChallengeDropdownOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* Challenge Switcher Dropdown Menu */}
        {isChallengeDropdownOpen && (
          <div className="absolute top-12 left-0 w-80 rounded-2xl bg-[#131b2e] border border-white/10 shadow-2xl p-2 z-50 space-y-1 animate-in fade-in duration-150">
            <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
              <span className="text-[11px] font-display font-bold uppercase tracking-wider text-[#908fa0]">
                Your Challenges ({challenges.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsChallengeDropdownOpen(false);
                  onOpenNewChallenge();
                }}
                className="text-[11px] font-display font-bold text-[#8083ff] hover:text-[#c0c1ff] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 py-1">
              {challenges.length > 0 ? (
                challenges.map((ch) => {
                  const isSelected = activeChallenge?._id === ch._id;
                  const chDays = ch.days ? ch.days.length : 30;
                  const chDone = ch.days ? ch.days.filter((d) => d.status === 'completed').length : 0;
                  return (
                    <div
                      key={ch._id}
                      onClick={() => {
                        onSelectChallenge(ch);
                        setIsChallengeDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#8083ff]/15 border border-[#8083ff]/40 text-white'
                          : 'hover:bg-white/5 text-[#c7c4d7]'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#8083ff]"></span>}
                          <p className="font-display font-bold text-xs truncate text-white">{ch.title}</p>
                        </div>
                        <p className="text-[10px] text-[#908fa0]">
                          {ch.category || 'General'} • {chDone}/{chDays} Days • {ch.streak || 0}d streak
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-[#c0c1ff]">
                        {Math.round((chDone / chDays) * 100)}%
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-center text-xs text-[#908fa0]">
                  No challenges created yet.
                </div>
              )}
            </div>

            <div className="pt-1.5 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  setIsChallengeDropdownOpen(false);
                  onOpenNewChallenge();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#8083ff]/10 hover:bg-[#8083ff]/20 text-[#c0c1ff] font-display font-bold text-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create New Sprint Challenge</span>
              </button>
            </div>
          </div>
        )}

        {/* Tamil Motivational Microcopy */}
        <div className="hidden xl:flex items-center text-xs font-display italic text-[#c7c4d7]/90 px-3 py-1 rounded-full bg-[#131b2e]/60 border border-white/5">
          <span>"Indha naal ungaloda step forward, thodarnthu pannunga!"</span>
        </div>
      </div>

      {/* Right: Telemetry & Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        
        {/* Streak Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#571bc1]/35 border border-[#8083ff]/30 text-[#d0bcff] text-xs font-display font-bold">
          <Flame className="w-3.5 h-3.5 text-[#d0bcff] fill-[#d0bcff]" />
          <span className="tabular-nums">{streak} Days Streak</span>
        </div>

        {/* Today's % Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00885d]/30 border border-[#4edea3]/40 text-[#4edea3] text-xs font-display font-bold">
          <Zap className="w-3.5 h-3.5 text-[#4edea3]" />
          <span className="tabular-nums">{todayProgress}% Today</span>
        </div>

        {/* New Challenge Button */}
        <button
          onClick={onOpenNewChallenge}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#8083ff] hover:bg-[#6c70ff] text-[#0b1326] font-display font-bold text-xs shadow-[0_0_16px_rgba(128,131,255,0.3)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Challenge</span>
        </button>

        {/* Interactive Notification Bell & Panel */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-xl bg-[#131b2e] border border-white/5 text-[#c7c4d7] hover:text-white hover:border-white/20 transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#4edea3] text-[#002113] text-[9px] font-black font-display ring-2 ring-[#0b1326] animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#131b2e] border border-white/10 shadow-2xl p-3 z-50 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-white/5 px-1">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-sm text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#4edea3]/20 text-[#4edea3] text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-display font-semibold text-[#8083ff] hover:text-[#c0c1ff] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification Items */}
              <div className="max-h-80 overflow-y-auto space-y-1.5 custom-scrollbar pr-0.5">
                {notifications.length > 0 ? (
                  notifications.map((n) => {
                    const notifKey = n._id || n.id;
                    return (
                      <div
                        key={notifKey}
                        onClick={() => markOneAsRead(notifKey)}
                        className={`group p-2.5 rounded-xl border transition-all cursor-pointer relative flex items-start gap-3 ${
                          n.read
                            ? 'bg-[#171f33]/40 border-white/5 text-[#908fa0]'
                            : 'bg-[#171f33] border-[#8083ff]/30 text-white shadow-sm'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {n.type === 'streak' ? (
                            <div className="w-7 h-7 rounded-lg bg-[#571bc1]/30 text-[#d0bcff] flex items-center justify-center">
                              <Flame className="w-3.5 h-3.5" />
                            </div>
                          ) : n.type === 'sprint' ? (
                            <div className="w-7 h-7 rounded-lg bg-[#00885d]/30 text-[#4edea3] flex items-center justify-center">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          ) : n.type === 'task' ? (
                            <div className="w-7 h-7 rounded-lg bg-[#0284c7]/20 text-[#38bdf8] flex items-center justify-center">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          ) : n.type === 'system' ? (
                            <div className="w-7 h-7 rounded-lg bg-[#d97706]/20 text-[#fbbf24] flex items-center justify-center">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-[#8083ff]/20 text-[#8083ff] flex items-center justify-center">
                              <Clock className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <p className={`text-xs font-display font-bold truncate ${n.read ? 'text-[#c7c4d7]' : 'text-white'}`}>
                              {n.title}
                            </p>
                            <span className="text-[10px] text-[#908fa0] shrink-0 ml-1.5">{n.time || 'Today'}</span>
                          </div>
                          <p className="text-[11px] text-[#908fa0] leading-snug line-clamp-2">
                            {n.message}
                          </p>
                        </div>

                        <button
                          onClick={(e) => removeNotification(notifKey, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#908fa0] hover:text-white transition-opacity"
                          title="Dismiss"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center space-y-1">
                    <Sparkles className="w-6 h-6 text-[#4edea3] mx-auto opacity-70" />
                    <p className="text-xs font-display font-semibold text-white">All caught up!</p>
                    <p className="text-[11px] text-[#908fa0]">No new notifications at this time.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Theme Toggle Button */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-[#131b2e] border border-white/5 text-[#c7c4d7] hover:text-white hover:border-white/20 transition-all cursor-pointer flex items-center justify-center"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
        )}

        {/* User Profile Avatar & Dropdown */}
        <div className="relative pl-1" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
            title={currentUser ? `${currentUser.name} (${currentUser.email})` : 'Account'}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8083ff] p-[1.5px] hover:scale-105 transition-all shadow-[0_0_12px_rgba(99,102,241,0.4)]">
              <div className="w-full h-full bg-[#171f33] rounded-full flex items-center justify-center font-display font-black text-xs text-[#c0c1ff]">
                {userInitial}
              </div>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#131b2e] border border-white/10 shadow-2xl p-2 z-50 space-y-1 animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#8083ff] text-[#07006c] font-display font-black text-xs flex items-center justify-center shrink-0">
                  {userInitial}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-display font-bold text-white truncate">
                    {currentUser?.name || 'Achiever'}
                  </p>
                  <p className="text-[10px] text-[#908fa0] truncate">
                    {currentUser?.email || 'user@daybyday.app'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  if (onLogout) onLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display font-semibold text-rose-300 hover:bg-rose-500/10 transition-all text-left cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
