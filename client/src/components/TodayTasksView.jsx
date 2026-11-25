import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Circle,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Flame,
  Zap,
  Clock,
  Sparkles,
  Bell,
  BellRing
} from 'lucide-react';
import { sound } from '../utils/sound';

export default function TodayTasksView({
  activeChallenge,
  tasks: propTasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onEditTask,
  onMarkDayDone,
  onReopenDay,
  onFocusSessionComplete,
  onOpenNewChallenge
}) {
  // If tasks passed from parent, use them; otherwise fallback to persistent storage or empty array
  const [localTasks, setLocalTasks] = useState(() => {
    if (propTasks) return propTasks;
    const saved = localStorage.getItem('daybyday_user_daily_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const tasks = propTasks !== undefined ? propTasks : localTasks;

  const sprintLength = activeChallenge?.days?.length || 30;
  const getSprintCurrentDay = () => {
    if (!activeChallenge?.startDate || sprintLength === 0) return 1;
    const start = new Date(activeChallenge.startDate);
    start.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(sprintLength, diff));
  };
  const currentDayNum = activeChallenge ? getSprintCurrentDay() : 1;
  const streak = activeChallenge?.streak || 0;

  // Check if today's day is already completed
  const isTodayCompleted = activeChallenge?.days?.find((d) => d.dayNumber === currentDayNum)?.status === 'completed';

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Fitness');
  const [showInput, setShowInput] = useState(false);

  // Edit Task State
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [editingCategory, setEditingCategory] = useState('Fitness');

  // Load persistent Focus Timer state from localStorage to survive page refreshes
  const loadSavedTimer = () => {
    try {
      const saved = localStorage.getItem('daybyday_focus_timer_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        const mins = typeof parsed.focusMinutes === 'number' ? parsed.focusMinutes : 25;
        if (parsed.timerRunning && parsed.targetTimestamp) {
          const now = Date.now();
          const remainingSecs = Math.max(0, Math.round((parsed.targetTimestamp - now) / 1000));
          if (remainingSecs > 0) {
            return {
              focusMinutes: mins,
              secondsLeft: remainingSecs,
              timerRunning: true,
              showFinishedAlert: false
            };
          } else {
            return {
              focusMinutes: mins,
              secondsLeft: 0,
              timerRunning: false,
              showFinishedAlert: true
            };
          }
        } else if (typeof parsed.secondsLeft === 'number') {
          return {
            focusMinutes: mins,
            secondsLeft: parsed.secondsLeft,
            timerRunning: false,
            showFinishedAlert: false
          };
        }
      }
    } catch (e) {
      console.warn('Error reading timer state from localStorage', e);
    }
    return {
      focusMinutes: 25,
      secondsLeft: 25 * 60,
      timerRunning: false,
      showFinishedAlert: false
    };
  };

  const initialTimer = loadSavedTimer();

  // Focus Timer with Customizable Duration & Web Push Notifications
  const [focusMinutes, setFocusMinutes] = useState(initialTimer.focusMinutes);
  const [secondsLeft, setSecondsLeft] = useState(initialTimer.secondsLeft);
  const [timerRunning, setTimerRunning] = useState(initialTimer.timerRunning);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState(String(initialTimer.focusMinutes));
  const [showFinishedAlert, setShowFinishedAlert] = useState(initialTimer.showFinishedAlert);
  const [notificationPermission, setNotificationPermission] = useState(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });

  const timerRunningRef = useRef(timerRunning);
  timerRunningRef.current = timerRunning;

  // Helper to persist timer state
  const saveTimerState = (running, secs, mins) => {
    try {
      const m = mins !== undefined ? mins : focusMinutes;
      const s = secs !== undefined ? secs : secondsLeft;
      const payload = {
        focusMinutes: m,
        secondsLeft: s,
        timerRunning: running,
        targetTimestamp: running ? Date.now() + s * 1000 : null
      };
      localStorage.setItem('daybyday_focus_timer_state', JSON.stringify(payload));
    } catch (e) {
      console.warn('Could not save timer state to localStorage', e);
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        return perm;
      } catch (e) {
        console.warn('Notification permission error', e);
      }
    }
    return 'denied';
  };

  // Timer Tick & Completion Notification
  useEffect(() => {
    let interval = null;
    if (timerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            // Timer just hit 0!
            setTimerRunning(false);
            setShowFinishedAlert(true);
            saveTimerState(false, 0, focusMinutes);
            sound.playMilestone();

            if (onFocusSessionComplete) {
              onFocusSessionComplete(focusMinutes);
            }

            // Web Push Notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification('🎉 Focus Block Completed!', {
                  body: `Outstanding job! You completed your ${focusMinutes}-minute sprint focus block. Take a 5-minute breather!`,
                  icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236366F1"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>'
                });
              } catch (e) {
                console.warn('Web notification dispatch error', e);
              }
            }
            return 0;
          }
          const nextSec = s - 1;
          saveTimerState(true, nextSec, focusMinutes);
          return nextSec;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsLeft, focusMinutes]);

  const handleStartTimer = async () => {
    if (!timerRunning) {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        await requestNotificationPermission();
      }
      const targetSecs = secondsLeft === 0 ? focusMinutes * 60 : secondsLeft;
      setSecondsLeft(targetSecs);
      setShowFinishedAlert(false);
      setTimerRunning(true);
      saveTimerState(true, targetSecs, focusMinutes);
    } else {
      setTimerRunning(false);
      saveTimerState(false, secondsLeft, focusMinutes);
    }
  };

  const toggleTask = (id) => {
    if (onToggleTask) {
      onToggleTask(id);
    } else {
      setLocalTasks((prev) => {
        const updated = prev.map((t) => (t.id === id ? { ...t, done: !t.done, completed: !t.completed } : t));
        localStorage.setItem('daybyday_user_daily_tasks', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    if (onAddTask) {
      onAddTask({ text: newTaskText.trim(), category: newTaskCategory, time: 'Today' });
    } else {
      const newTask = {
        id: `t_${Date.now()}`,
        text: newTaskText.trim(),
        category: newTaskCategory,
        done: false,
        completed: false,
        time: 'Today'
      };
      setLocalTasks((prev) => {
        const updated = [...prev, newTask];
        localStorage.setItem('daybyday_user_daily_tasks', JSON.stringify(updated));
        return updated;
      });
    }

    setNewTaskText('');
    setShowInput(false);
  };

  const startEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
    setEditingCategory(task.category || 'Fitness');
  };

  const cancelEditTask = () => {
    setEditingTaskId(null);
    setEditingText('');
  };

  const saveEditTask = (id) => {
    if (!editingText.trim()) return;
    const trimmed = editingText.trim();

    if (onEditTask) {
      onEditTask(id, { text: trimmed, category: editingCategory });
    } else {
      setLocalTasks((prev) => {
        const updated = prev.map((t) => (t.id === id ? { ...t, text: trimmed, category: editingCategory } : t));
        localStorage.setItem('daybyday_user_daily_tasks', JSON.stringify(updated));
        return updated;
      });
    }

    setEditingTaskId(null);
    setEditingText('');
  };

  const deleteTask = (id) => {
    if (onDeleteTask) {
      onDeleteTask(id);
    } else {
      setLocalTasks((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        localStorage.setItem('daybyday_user_daily_tasks', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const completedCount = tasks.filter((t) => t.done || t.completed).length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-display font-bold uppercase tracking-wider text-[#8083ff] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Today's Sprint Execution
          </span>
          <h2 className="text-3xl font-display font-extrabold text-white tracking-tight mt-1">
            Day {currentDayNum} Daily Rituals
          </h2>
          <p className="text-xs text-[#908fa0] mt-0.5">
            {activeChallenge
              ? `Complete your daily habits for ${activeChallenge.title} to maintain your ${streak}-day streak.`
              : 'Add tasks or create a challenge to start building your streak.'}
          </p>
        </div>

        {/* Finish Day Status or Complete Button */}
        {activeChallenge && (
          isTodayCompleted ? (
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00885d]/30 border border-[#4edea3]/40 text-[#4edea3] font-display font-bold text-xs shadow-[0_0_16px_rgba(78,222,163,0.25)]">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Day {currentDayNum} Completed! 🎉</span>
              </div>
              <button
                type="button"
                onClick={() => onReopenDay && onReopenDay(currentDayNum)}
                className="text-xs font-display text-[#908fa0] hover:text-white underline cursor-pointer px-2 py-1 transition-colors"
                title="Undo completion and reopen day"
              >
                Reopen
              </button>
            </div>
          ) : (
            <button
              onClick={() => onMarkDayDone && onMarkDayDone(currentDayNum)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4edea3] hover:bg-[#34d399] text-[#002113] font-display font-bold text-xs shadow-[0_0_16px_rgba(78,222,163,0.35)] transition-all shrink-0 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Mark Day {currentDayNum} Complete!</span>
            </button>
          )
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left: Interactive Checklist (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-[#131b2e] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <span className="text-sm font-display font-bold text-white">Daily Habit Tasks</span>
              <span className="text-xs text-[#908fa0] block">
                {completedCount} of {tasks.length} rituals completed ({progressPct}%)
              </span>
            </div>
            
            <button
              onClick={() => setShowInput(!showInput)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#c7c4d7] hover:text-white transition-all cursor-pointer"
              title="Add task"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-[#171f33] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8083ff] to-[#4edea3] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Task Items Or Empty State */}
          {!activeChallenge ? (
            <div className="py-12 px-4 text-center rounded-xl bg-[#171f33]/40 border border-dashed border-white/10 space-y-3">
              <p className="text-sm font-display font-bold text-white">Create a challenge to manage daily tasks.</p>
              <p className="text-xs text-[#908fa0] max-w-sm mx-auto">
                Tasks belong to an active sprint challenge. Start or select a challenge first to track your daily habits.
              </p>
              {onOpenNewChallenge && (
                <button
                  type="button"
                  onClick={onOpenNewChallenge}
                  className="px-4 py-2 rounded-xl bg-[#8083ff] text-[#0b1326] font-display font-bold text-xs inline-flex items-center gap-1.5 shadow-[0_0_12px_rgba(128,131,255,0.3)] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Create Sprint Challenge</span>
                </button>
              )}
            </div>
          ) : tasks.length > 0 ? (
            <div className="space-y-2.5 pt-2">
              {tasks.map((task) => {
                const isDone = task.done || task.completed;
                const isEditing = editingTaskId === task.id;

                if (isEditing) {
                  return (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-[#171f33] border border-[#8083ff]/40 space-y-2.5 animate-in fade-in duration-150"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-[#0b1326] border border-white/10 text-xs text-white focus:outline-none focus:border-[#8083ff]"
                          autoFocus
                          placeholder="Task description..."
                        />
                        <select
                          value={editingCategory}
                          onChange={(e) => setEditingCategory(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#0b1326] border border-white/10 text-xs text-white focus:outline-none cursor-pointer"
                        >
                          <option value="Fitness">Fitness</option>
                          <option value="Health">Health</option>
                          <option value="Mindset">Mindset</option>
                          <option value="Habit">Habit</option>
                          <option value="Routine">Routine</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={cancelEditTask}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-display text-[#908fa0] hover:text-white bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEditTask(task.id)}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-display font-bold text-[#0b1326] bg-[#8083ff] hover:bg-[#6c70ff] shadow-[0_0_10px_rgba(128,131,255,0.3)] transition-all cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`group flex items-center justify-between p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                      isDone
                        ? 'bg-[#00885d]/10 border-[#4edea3]/25 text-[#c7c4d7]'
                        : 'bg-[#171f33] border-white/5 hover:border-white/15 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isDone ? (
                        <div className="w-5 h-5 rounded-full bg-[#00885d] flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-[#908fa0] group-hover:text-white transition-all shrink-0" />
                      )}
                      
                      <div className="space-y-0.5">
                        <span className={`text-xs font-display font-semibold block ${isDone ? 'line-through text-[#908fa0]' : 'text-white'}`}>
                          {task.text}
                        </span>
                        <span className="text-[10px] text-[#908fa0] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#8083ff]" />
                          {task.time || 'Daily'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-display font-bold uppercase tracking-wider bg-white/5 text-[#908fa0]">
                        {task.category || 'General'}
                      </span>
                      
                      {/* Edit Button */}
                      <button
                        onClick={() => startEditTask(task)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#908fa0] hover:text-[#8083ff] transition-all cursor-pointer"
                        title="Edit task"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#908fa0] hover:text-red-400 transition-all cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 px-4 text-center rounded-xl bg-[#171f33]/40 border border-dashed border-white/10 space-y-3">
              <p className="text-sm font-display font-bold text-white">No tasks added yet.</p>
              <p className="text-xs text-[#908fa0] max-w-sm mx-auto">
                Create your daily rituals to track your sprint progress and maintain consistency.
              </p>
              <button
                type="button"
                onClick={() => setShowInput(true)}
                className="px-4 py-2 rounded-xl bg-[#8083ff] text-[#0b1326] font-display font-bold text-xs inline-flex items-center gap-1.5 shadow-[0_0_12px_rgba(128,131,255,0.3)] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Your First Task</span>
              </button>
            </div>
          )}

          {/* Add New Task Inline Input */}
          {showInput && (
            <form onSubmit={addTask} className="pt-3 border-t border-white/5 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="e.g. 30 Minutes Cardio & Mobility"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#0b1326] border border-white/10 text-xs text-white placeholder-[#908fa0]/50 focus:border-[#8083ff] focus:outline-none"
                  autoFocus
                />
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0b1326] border border-white/10 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="Fitness">Fitness</option>
                  <option value="Health">Health</option>
                  <option value="Mindset">Mindset</option>
                  <option value="Habit">Habit</option>
                  <option value="Routine">Routine</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#8083ff] text-[#0b1326] font-display font-bold text-xs hover:bg-[#6c70ff] transition-all cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Right: Pomodoro Sprint Focus Timer (1 col) - Compact card with sticky position to prevent stretching */}
        <div className="rounded-2xl bg-[#131b2e] border border-white/10 p-6 space-y-5 lg:sticky lg:top-20">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-[#908fa0] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#ff80bf]" />
                Sprint Deep Focus
              </span>
              
              {/* Push Notification Status Pill */}
              <button
                type="button"
                onClick={requestNotificationPermission}
                className={`text-[10px] font-display font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-all cursor-pointer ${
                  notificationPermission === 'granted'
                    ? 'bg-[#00885d]/20 text-[#4edea3] border border-[#4edea3]/30'
                    : 'bg-white/5 text-[#908fa0] hover:text-white border border-white/10'
                }`}
                title={notificationPermission === 'granted' ? 'Push Notifications Enabled' : 'Click to enable Web Notifications on Timer finish'}
              >
                {notificationPermission === 'granted' ? (
                  <>
                    <BellRing className="w-3 h-3 text-[#4edea3]" />
                    <span>Alerts ON</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3 h-3 text-[#908fa0]" />
                    <span>Enable Alerts</span>
                  </>
                )}
              </button>
            </div>

            {/* In-App Timer Finished Banner Alert */}
            {showFinishedAlert && (
              <div className="mt-3 p-3 rounded-xl bg-[#00885d]/20 border border-[#4edea3]/40 text-[#4edea3] text-xs font-display space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#4edea3]" />
                    Focus Block Complete! 🎉
                  </span>
                  <button
                    onClick={() => setShowFinishedAlert(false)}
                    className="text-[#908fa0] hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-[#c7c4d7]">
                  Great job completing your {focusMinutes}-minute session. Stretch, hydrate, and return when ready!
                </p>
              </div>
            )}

            {/* Duration Presets & Custom Time Picker */}
            <div className="pt-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-display font-semibold text-[#908fa0]">
                <span>Session Duration:</span>
                <span className="text-[#c0c1ff] font-bold">{focusMinutes} Mins</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[15, 25, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      setFocusMinutes(mins);
                      setSecondsLeft(mins * 60);
                      setTimerRunning(false);
                      setShowFinishedAlert(false);
                      setShowCustomInput(false);
                      saveTimerState(false, mins * 60, mins);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-display font-bold transition-all cursor-pointer ${
                      focusMinutes === mins && !showCustomInput
                        ? 'bg-[#8083ff] text-[#0b1326] shadow-[0_0_10px_rgba(128,131,255,0.4)]'
                        : 'bg-white/5 hover:bg-white/10 text-[#908fa0] hover:text-white border border-white/5'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-display font-bold transition-all cursor-pointer ${
                    showCustomInput
                      ? 'bg-[#8083ff] text-[#0b1326]'
                      : 'bg-white/5 hover:bg-white/10 text-[#908fa0] hover:text-white border border-white/5'
                  }`}
                >
                  Custom
                </button>
              </div>

              {/* Custom Minutes Input */}
              {showCustomInput && (
                <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-150">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={customMinutesInput}
                    onChange={(e) => setCustomMinutesInput(e.target.value)}
                    placeholder="Mins"
                    className="w-20 px-2.5 py-1 rounded-lg bg-[#0b1326] border border-white/10 text-xs text-white focus:outline-none focus:border-[#8083ff]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = Math.max(1, Math.min(300, parseInt(customMinutesInput, 10) || 25));
                      setFocusMinutes(val);
                      setSecondsLeft(val * 60);
                      setTimerRunning(false);
                      setShowFinishedAlert(false);
                      saveTimerState(false, val * 60, val);
                    }}
                    className="px-3 py-1 rounded-lg bg-[#8083ff] text-[#0b1326] text-xs font-display font-bold hover:bg-[#6c70ff] transition-all cursor-pointer"
                  >
                    Set
                  </button>
                  <span className="text-[10px] text-[#908fa0]">1–300 mins</span>
                </div>
              )}
            </div>

            {/* Timer Display */}
            <div className="py-6 text-center space-y-1">
              <span className="font-display font-black text-5xl text-white tracking-tight tabular-nums block">
                {formatTime(secondsLeft)}
              </span>
              <span className="text-xs text-[#908fa0] block">
                {timerRunning ? 'Session In Progress... Stay Locked In' : (secondsLeft === 0 ? 'Focus Block Completed! Great job! 🔥' : 'Ready to begin deep session')}
              </span>

              {/* Quick +/- 5 min adjust buttons */}
              {!timerRunning && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newMins = Math.max(1, focusMinutes - 5);
                      setFocusMinutes(newMins);
                      setSecondsLeft(newMins * 60);
                      setShowFinishedAlert(false);
                      saveTimerState(false, newMins * 60, newMins);
                    }}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-display font-semibold text-[#908fa0] hover:text-white transition-all cursor-pointer"
                    title="Subtract 5 minutes"
                  >
                    -5 min
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newMins = Math.min(300, focusMinutes + 5);
                      setFocusMinutes(newMins);
                      setSecondsLeft(newMins * 60);
                      setShowFinishedAlert(false);
                      saveTimerState(false, newMins * 60, newMins);
                    }}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-display font-semibold text-[#908fa0] hover:text-white transition-all cursor-pointer"
                    title="Add 5 minutes"
                  >
                    +5 min
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-3 pt-2 border-t border-white/5">
            <button
              onClick={handleStartTimer}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#8083ff] hover:bg-[#6c70ff] text-[#0b1326] font-display font-bold text-xs transition-all shadow-[0_0_16px_rgba(128,131,255,0.3)] cursor-pointer"
            >
              {timerRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Session</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{secondsLeft === 0 ? 'Restart Focus' : 'Start Focus'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setTimerRunning(false);
                setSecondsLeft(focusMinutes * 60);
                setShowFinishedAlert(false);
                saveTimerState(false, focusMinutes * 60, focusMinutes);
              }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#908fa0] hover:text-white transition-all cursor-pointer"
              title="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
