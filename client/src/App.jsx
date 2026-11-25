import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import AuthView from './components/AuthView';
import DashboardHomeView from './components/DashboardHomeView';
import MyChallengesView from './components/MyChallengesView';
import CalendarGridView from './components/CalendarGridView';
import TodayTasksView from './components/TodayTasksView';
import CompletionView from './components/CompletionView';

import HeroSection from './components/HeroSection';
import CircularGauge from './components/CircularGauge';
import MatrixGrid from './components/MatrixGrid';
import HabitChecklist from './components/HabitChecklist';
import MotivationalCard from './components/MotivationalCard';
import SprintRoadmap from './components/SprintRoadmap';
import DayDetailModal from './components/DayDetailModal';
import LockNoticeModal from './components/LockNoticeModal';
import InfoModal from './components/InfoModal';
import NewChallengeModal from './components/NewChallengeModal';
import CelebrationModal from './components/CelebrationModal';
import ShareCardModal from './components/ShareCardModal';

import { api } from './services/api';
import { sound } from './utils/sound';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => api.getCurrentUser());
  // URL hash router helper: valid tabs
  const VALID_TABS = ['dashboard', 'today', 'calendar', 'analytics', 'challenges', 'completion', 'settings'];

  const getTabFromUrl = () => {
    try {
      const hash = window.location.hash.replace('#', '').trim().toLowerCase();
      if (VALID_TABS.includes(hash)) {
        return hash;
      }
      const saved = localStorage.getItem('daybyday_active_tab');
      return saved && VALID_TABS.includes(saved) ? saved : 'dashboard';
    } catch {
      return 'dashboard';
    }
  };

  const [activeTab, setActiveTab] = useState(getTabFromUrl);

  const handleSelectTab = (tab) => {
    if (VALID_TABS.includes(tab)) {
      setActiveTab(tab);
      window.location.hash = `#${tab}`;
      try {
        localStorage.setItem('daybyday_active_tab', tab);
      } catch (e) {
        console.warn('Could not save active tab to localStorage', e);
      }
    }
  };
  const [challenges, setChallenges] = useState([]);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [dailyTasks, setDailyTasks] = useState(() => {
    const saved = localStorage.getItem('daybyday_user_daily_tasks');
    return saved ? JSON.parse(saved) : []; // Starts empty! User adds their own tasks
  });
  const [dbStatus, setDbStatus] = useState('Connecting...');
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('daybyday_theme');
    return saved !== null ? saved === 'dark' : true;
  });
  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('daybyday_accent_color') || '#8083ff';
  });
  const [isSoundOn, setIsSoundOn] = useState(true);

  // Dynamic User Notifications state (persisted in MongoDB database)
  const [notifications, setNotifications] = useState([]);

  // Helper to push a new real-time dynamic notification to Database
  const addNotification = async (notif) => {
    const uid = currentUser?.id || currentUser?._id;
    if (!uid) return;

    // Optimistic UI update
    const tempId = `temp_${Date.now()}`;
    const optimisticNotif = {
      _id: tempId,
      userId: uid,
      time: 'Just now',
      read: false,
      createdAt: new Date(),
      ...notif
    };

    setNotifications((prev) => [optimisticNotif, ...prev.slice(0, 29)]);

    // Save directly to MongoDB backend
    const saved = await api.createNotification({
      userId: uid,
      title: notif.title,
      message: notif.message,
      type: notif.type || 'system'
    });

    if (saved && saved._id) {
      setNotifications((prev) => prev.map((n) => (n._id === tempId ? saved : n)));
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    const uid = currentUser?.id || currentUser?._id;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (uid) {
      await api.markAllNotificationsRead(uid);
    }
  };

  const handleMarkNotificationRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id || n.id === id ? { ...n, read: true } : n)));
    if (id && !String(id).startsWith('temp_')) {
      await api.markNotificationRead(id);
    }
  };

  const handleDismissNotification = async (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id && n.id !== id));
    if (id && !String(id).startsWith('temp_')) {
      await api.deleteNotification(id);
    }
  };

  // Fetch notifications directly from MongoDB when user logs in or switches
  useEffect(() => {
    async function loadUserNotifications() {
      if (!currentUser) {
        setNotifications([]);
        return;
      }

      const uid = currentUser.id || currentUser._id;
      const data = await api.getNotifications(uid);

      if (data && data.length > 0) {
        setNotifications(data);
      } else {
        // If brand new user with 0 notifications in DB, create initial welcome in DB
        const initial = await api.createNotification({
          userId: uid,
          title: `Welcome, ${currentUser.name || 'Hero'}! 🚀`,
          message: 'Your sprint database is connected. Add tasks or start a sprint challenge to track your milestones.',
          type: 'system'
        });
        if (initial) {
          setNotifications([initial]);
        }
      }
    }

    loadUserNotifications();
  }, [currentUser]);

  // Modals
  const [isNewChallengeOpen, setIsNewChallengeOpen] = useState(false);
  const [selectedDayForModal, setSelectedDayForModal] = useState(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [celebrationData, setCelebrationData] = useState({ milestoneDay: 7, streak: 12, progress: 46 });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [lockNotice, setLockNotice] = useState({
    isOpen: false,
    dayNumber: 1,
    currentDayNum: 1,
    isPast: false,
    unlockDateStr: ''
  });
  const [infoModalNotice, setInfoModalNotice] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleOpenPasswordModal = () => {
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setIsPasswordModalOpen(true);
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setPasswordLoading(true);
      await api.changePassword({
        userId: currentUser?.id || currentUser?._id,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordLoading(false);
      setIsPasswordModalOpen(false);

      setInfoModalNotice({
        isOpen: true,
        title: 'Password Changed Successfully! 🔒',
        message: 'Your account password has been updated securely. You can now use your new password next time you log in.',
        type: 'success'
      });
    } catch (err) {
      setPasswordLoading(false);
      setPasswordError(err.message || 'Failed to update password. Please check your current password.');
    }
  };

  const handleOpenLockNotice = ({ dayNumber, isPast, currentDayNum, unlockDateStr = '' }) => {
    setLockNotice({
      isOpen: true,
      dayNumber,
      currentDayNum: currentDayNum || (activeChallenge ? getSprintCurrentDay(activeChallenge) : 1),
      isPast: Boolean(isPast),
      unlockDateStr: unlockDateStr || ''
    });
  };

  // Sync theme with document and localStorage
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('daybyday_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('daybyday_theme', 'light');
    }
  }, [isDark]);

  // Sync custom accent color with document root CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--user-accent', accentColor);
    localStorage.setItem('daybyday_accent_color', accentColor);
  }, [accentColor]);

  // Listen to browser Back/Forward buttons and URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim().toLowerCase();
      if (VALID_TABS.includes(hash)) {
        setActiveTab(hash);
      }
    };

    // If initial load doesn't have a hash, set it
    if (!window.location.hash || !VALID_TABS.includes(window.location.hash.replace('#', '').trim().toLowerCase())) {
      window.location.hash = `#${activeTab}`;
    }

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  // Sync active tab with localStorage to prevent reset on page refresh
  useEffect(() => {
    if (activeTab) {
      try {
        localStorage.setItem('daybyday_active_tab', activeTab);
        if (window.location.hash !== `#${activeTab}`) {
          window.location.hash = `#${activeTab}`;
        }
      } catch (e) {
        console.warn('Could not save active tab to localStorage', e);
      }
    }
  }, [activeTab]);

  // Load challenges specifically for the active authenticated user
  useEffect(() => {
    async function init() {
      const health = await api.getHealth();
      setDbStatus(health.database || 'MongoDB Connected');

      if (!currentUser) {
        setChallenges([]);
        setActiveChallenge(null);
        setDailyTasks([]);
        return;
      }

      const uid = currentUser.id || currentUser._id;
      const data = await api.getChallenges(uid);
      if (data && data.length > 0) {
        setChallenges(data);
        handleSelectChallenge(data[0]);
      } else {
        setChallenges([]);
        setActiveChallenge(null);
        setDailyTasks([]);
      }
    }
    init();
  }, [currentUser?.id || currentUser?._id]);

  // Theme & Sound Toggle
  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleToggleSound = () => {
    const newState = sound.toggle();
    setIsSoundOn(newState);
  };

  // Helper for computing persistent sprint current day based on start date
  const getSprintCurrentDay = (challenge) => {
    if (!challenge?.startDate) return 1;
    const totalDays = challenge.days ? challenge.days.length : 30;
    const start = new Date(challenge.startDate);
    start.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(totalDays, diff));
  };

  // Toggle Day Status in Matrix (only today's day is editable)
  const handleToggleDayStatus = async (dayNumber) => {
    if (!activeChallenge) return;

    const currentDayNum = getSprintCurrentDay(activeChallenge);
    if (dayNumber !== currentDayNum) {
      handleOpenLockNotice({
        dayNumber,
        isPast: dayNumber < currentDayNum,
        currentDayNum
      });
      return;
    }

    const currentDay = activeChallenge.days.find((d) => d.dayNumber === dayNumber);
    if (!currentDay) return;

    let nextStatus = 'completed';
    if (currentDay.status === 'pending') nextStatus = 'completed';
    else if (currentDay.status === 'completed') nextStatus = 'missed';
    else if (currentDay.status === 'missed') nextStatus = 'pending';

    const updatedDays = activeChallenge.days.map((d) =>
      d.dayNumber === dayNumber ? { ...d, status: nextStatus, completedAt: nextStatus === 'completed' ? new Date() : null } : d
    );

    // Compute streak
    let newStreak = 0;
    for (const d of updatedDays) {
      if (d.status === 'completed') newStreak++;
      else if (d.status === 'missed') newStreak = 0;
      else break;
    }

    const updatedChallenge = {
      ...activeChallenge,
      days: updatedDays,
      streak: newStreak
    };

    setActiveChallenge(updatedChallenge);
    setChallenges((prev) => prev.map((c) => (c._id === activeChallenge._id ? updatedChallenge : c)));

    if (nextStatus === 'completed') {
      sound.playCheckin();
      if ([7, 14, 21, 30].includes(dayNumber) && newStreak >= dayNumber && newStreak > 0) {
        sound.playMilestone();
        setCelebrationData({
          milestoneDay: dayNumber,
          streak: newStreak,
          progress: Math.round((updatedDays.filter((d) => d.status === 'completed').length / (activeChallenge.days?.length || 30)) * 100)
        });
        setIsCelebrationOpen(true);
      }
    }

    await api.updateDay(activeChallenge._id, dayNumber, { status: nextStatus });
  };

  // Mark Day Done from quick action (completes today's sprint & all daily tasks)
  const handleMarkTodayDone = async (dayNumber) => {
    if (!activeChallenge) return;
    const currentDayNum = getSprintCurrentDay(activeChallenge);
    if (dayNumber !== currentDayNum) {
      handleOpenLockNotice({
        dayNumber,
        isPast: dayNumber < currentDayNum,
        currentDayNum
      });
      return;
    }

    // Mark all daily tasks as done/completed
    setDailyTasks((prev) => {
      const updated = prev.map((t) => ({ ...t, completed: true, done: true }));
      localStorage.setItem('daybyday_user_daily_tasks', JSON.stringify(updated));
      if (activeChallenge._id) {
        localStorage.setItem(`daybyday_tasks_${activeChallenge._id}`, JSON.stringify(updated));
      }
      return updated;
    });

    // Mark challenge habits as completed
    const updatedHabits = (activeChallenge.habits || []).map((h) => ({ ...h, completed: true }));

    // Mark today's day as completed
    const updatedDays = activeChallenge.days.map((d) =>
      d.dayNumber === dayNumber
        ? { ...d, status: 'completed', completedAt: new Date() }
        : d
    );

    // Compute updated streak
    let newStreak = 0;
    for (const d of updatedDays) {
      if (d.status === 'completed') newStreak++;
      else if (d.status === 'missed') newStreak = 0;
      else break;
    }

    const updatedChallenge = {
      ...activeChallenge,
      days: updatedDays,
      habits: updatedHabits,
      streak: newStreak
    };

    setActiveChallenge(updatedChallenge);
    setChallenges((prev) => prev.map((c) => (c._id === activeChallenge._id ? updatedChallenge : c)));

    sound.playMilestone();
    await api.updateDay(activeChallenge._id, dayNumber, { status: 'completed' });

    // Dynamic notification for completing day
    addNotification({
      title: `Day ${dayNumber} Completed! 🏆`,
      message: `Awesome work! You completed all targets for Day ${dayNumber}. Current streak is ${newStreak} days!`,
      type: 'sprint'
    });
  };

  // Reopen Day action if user needs to undo completion
  const handleReopenToday = async (dayNumber) => {
    if (!activeChallenge) return;
    const updatedDays = activeChallenge.days.map((d) =>
      d.dayNumber === dayNumber
        ? { ...d, status: 'pending', completedAt: null }
        : d
    );

    let newStreak = 0;
    for (const d of updatedDays) {
      if (d.status === 'completed') newStreak++;
      else if (d.status === 'missed') newStreak = 0;
      else break;
    }

    const updatedChallenge = {
      ...activeChallenge,
      days: updatedDays,
      streak: newStreak
    };

    setActiveChallenge(updatedChallenge);
    setChallenges((prev) => prev.map((c) => (c._id === activeChallenge._id ? updatedChallenge : c)));
    await api.updateDay(activeChallenge._id, dayNumber, { status: 'pending' });
  };

  // Day Details update (Note + Mood) - Only today is editable
  const handleSaveDayDetails = async (dayNumber, { status, note, mood }) => {
    if (!activeChallenge) return;

    const currentDayNum = getSprintCurrentDay(activeChallenge);
    if (dayNumber !== currentDayNum) {
      handleOpenLockNotice({
        dayNumber,
        isPast: dayNumber < currentDayNum,
        currentDayNum
      });
      return;
    }

    const updatedDays = activeChallenge.days.map((d) =>
      d.dayNumber === dayNumber ? { ...d, status, note, mood } : d
    );

    let newStreak = 0;
    for (const d of updatedDays) {
      if (d.status === 'completed') newStreak++;
      else if (d.status === 'missed') newStreak = 0;
      else break;
    }

    const updatedChallenge = {
      ...activeChallenge,
      days: updatedDays,
      streak: newStreak
    };

    setActiveChallenge(updatedChallenge);
    setChallenges((prev) => prev.map((c) => (c._id === activeChallenge._id ? updatedChallenge : c)));

    await api.updateDay(activeChallenge._id, dayNumber, { status, note, mood });
  };

  // Habit Actions
  const handleToggleHabit = async (habitId) => {
    if (!activeChallenge) return;
    sound.playCheckin();

    const updatedHabits = activeChallenge.habits.map((h) =>
      h.id === habitId ? { ...h, completed: !h.completed } : h
    );

    const updatedChallenge = { ...activeChallenge, habits: updatedHabits };
    setActiveChallenge(updatedChallenge);
    setChallenges((prev) => prev.map((c) => (c._id === activeChallenge._id ? updatedChallenge : c)));

    await api.updateHabits(activeChallenge._id, { action: 'toggle', habitId });
  };

  const handleAddHabit = async (text) => {
    if (!activeChallenge) return;
    const newHabit = { id: `h_${Date.now()}`, text, completed: false };
    const updatedHabits = [...activeChallenge.habits, newHabit];

    const updatedChallenge = { ...activeChallenge, habits: updatedHabits };
    setActiveChallenge(updatedChallenge);
    setChallenges((prev) => prev.map((c) => (c._id === activeChallenge._id ? updatedChallenge : c)));

    await api.updateHabits(activeChallenge._id, { action: 'add', text });
  };

  const handleDeleteHabit = async (habitId) => {
    if (!activeChallenge) return;
    const updatedHabits = activeChallenge.habits.filter((h) => h.id !== habitId);

    const updatedChallenge = { ...activeChallenge, habits: updatedHabits };
    setActiveChallenge(updatedChallenge);
    setChallenges((prev) => prev.map((c) => (c._id === activeChallenge._id ? updatedChallenge : c)));

    await api.updateHabits(activeChallenge._id, { action: 'delete', habitId });
  };

  // Select Active Challenge and synchronize its habits with today's tasks
  const handleSelectChallenge = (ch) => {
    setActiveChallenge(ch);
    if (!ch) {
      setDailyTasks([]);
      return;
    }

    // Populate daily tasks from challenge habits
    if (ch.habits && ch.habits.length > 0) {
      const challengeTasks = ch.habits.map((h, idx) => ({
        id: h.id || `h_${Date.now()}_${idx}`,
        text: h.text,
        category: ch.category || 'Routine',
        time: 'Daily',
        completed: Boolean(h.completed),
        done: Boolean(h.completed),
        challengeId: ch._id
      }));
      setDailyTasks(challengeTasks);
      localStorage.setItem('daybyday_user_daily_tasks', JSON.stringify(challengeTasks));
      localStorage.setItem(`daybyday_tasks_${ch._id}`, JSON.stringify(challengeTasks));
    } else {
      const saved = localStorage.getItem(`daybyday_tasks_${ch._id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setDailyTasks(parsed);
          return;
        } catch (e) {}
      }
      setDailyTasks([]);
      localStorage.setItem('daybyday_user_daily_tasks', JSON.stringify([]));
    }
  };

  // Create New Challenge (isolated to current user)
  const handleCreateChallenge = async (payload) => {
    const uid = currentUser?.id || currentUser?._id;
    const newSprint = await api.createChallenge({ ...payload, userId: uid });
    setChallenges((prev) => [newSprint, ...prev]);
    handleSelectChallenge(newSprint);
    sound.playMilestone();

    // Dynamic notification for creating sprint
    addNotification({
      title: `Sprint Created: ${newSprint.title} 🚀`,
      message: `Your ${newSprint.days?.length || 30}-day challenge is live. Day 1 is waiting for your check-in!`,
      type: 'sprint'
    });
  };

  // Daily User Tasks handlers
  const handleToggleDailyTask = (id) => {
    setDailyTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      const willBeCompleted = target ? !target.completed : false;
      const updated = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed, done: !t.done } : t));
      localStorage.setItem('daybyday_user_daily_tasks', JSON.stringify(updated));
      if (activeChallenge?._id) {
        localStorage.setItem(`daybyday_tasks_${activeChallenge._id}`, JSON.stringify(updated));
      }

      if (willBeCompleted && target) {
        addNotification({
          title: `Task Completed! ✅`,
          message: `Nice progress! "${target.text}" checked off.`,
          type: 'task'
        });
      }

      return updated;
    });

    // Synchronize with active challenge habits
    if (activeChallenge?.habits) {
      const targetHabit = activeChallenge.habits.find((h) => h.id === id || h.text === id);
      if (targetHabit) {
        handleToggleHabit(targetHabit.id);
      }
    }

    sound.playCheckin();
  };

  const handleAddDailyTask = (taskPayload) => {
    const text = typeof taskPayload === 'string' ? taskPayload : taskPayload.text;
    const category = (typeof taskPayload === 'object' && taskPayload.category) || activeChallenge?.category || 'Routine';
    const time = (typeof taskPayload === 'object' && taskPayload.time) || 'Today';
    const newTask = {
      id: `t_${Date.now()}`,
      text,
      category,
      time,
      completed: false,
      done: false,
      challengeId: activeChallenge?._id
    };
    setDailyTasks((prev) => {
      const updated = [...prev, newTask];
      localStorage.setItem('daybyday_user_daily_tasks', JSON.stringify(updated));
      if (activeChallenge?._id) {
        localStorage.setItem(`daybyday_tasks_${activeChallenge._id}`, JSON.stringify(updated));
      }
      return updated;
    });

    if (activeChallenge) {
      handleAddHabit(text);
    }
    sound.playCheckin();

    // Dynamic notification for new task
    addNotification({
      title: `New Task Added 📝`,
      message: `"${text}" was added to Today's execution list.`,
      type: 'task'
    });
  };

  const handleDeleteDailyTask = (id) => {
    setDailyTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      localStorage.setItem('daybyday_user_daily_tasks', JSON.stringify(updated));
      if (activeChallenge?._id) {
        localStorage.setItem(`daybyday_tasks_${activeChallenge._id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleEditDailyTask = (id, updatedFields) => {
    setDailyTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t));
      localStorage.setItem('daybyday_user_daily_tasks', JSON.stringify(updated));
      if (activeChallenge?._id) {
        localStorage.setItem(`daybyday_tasks_${activeChallenge._id}`, JSON.stringify(updated));
      }
      return updated;
    });

    if (activeChallenge?.habits) {
      const updatedHabits = activeChallenge.habits.map((h) =>
        h.id === id || h.text === id ? { ...h, text: updatedFields.text || h.text } : h
      );
      const updatedChallenge = { ...activeChallenge, habits: updatedHabits };
      setActiveChallenge(updatedChallenge);
      setChallenges((prev) => prev.map((c) => (c._id === activeChallenge._id ? updatedChallenge : c)));
      api.updateHabits(activeChallenge._id, { action: 'edit', habitId: id, text: updatedFields.text });
    }
    sound.playCheckin();
  };

  // Enroll template
  const handleEnrollTemplate = (title) => {
    handleCreateChallenge({
      title,
      category: title.includes('Hydration') ? 'Fitness & Health' : (title.includes('Pages') ? 'Mindset' : 'Fitness & Health'),
      description: `Curated blueprint: ${title}. Commit to 30 continuous days of execution.`,
      startDate: new Date().toISOString().split('T')[0],
      initialHabits: ['Morning execution', 'Afternoon hydration check', 'Evening reflection']
    });
    setInfoModalNotice({
      isOpen: true,
      title: 'Blueprint Enrolled! 🎯',
      message: `You have successfully enrolled in "${title}".\n\nYour 30-day habits and execution milestones have been activated and loaded into your dashboard.`,
      type: 'success'
    });
  };

  // If user is not logged in, render the Auth/Login Screen
  if (!currentUser) {
    return (
      <AuthView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          sound.playMilestone();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        activeStreak={activeChallenge?.streak || 0}
      />

      {/* 2. Main Work Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <TopHeader
          challenges={challenges}
          activeChallenge={activeChallenge}
          onSelectChallenge={handleSelectChallenge}
          onOpenNewChallenge={() => setIsNewChallengeOpen(true)}
          streak={activeChallenge?.streak || 0}
          todayProgress={dailyTasks.length > 0 ? Math.round((dailyTasks.filter((t) => t.completed || t.done).length / dailyTasks.length) * 100) : 0}
          currentUser={currentUser}
          notifications={notifications}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onMarkNotificationRead={handleMarkNotificationRead}
          onDismissNotification={handleDismissNotification}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          onLogout={() => {
            api.logout();
            setCurrentUser(null);
            setChallenges([]);
            setActiveChallenge(null);
            setDailyTasks([]);
          }}
        />

        {/* View Router */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          
          {/* TAB 0: Dashboard (Home) */}
          {activeTab === 'dashboard' && (
            <DashboardHomeView
              currentUser={currentUser}
              activeChallenge={activeChallenge}
              tasks={dailyTasks}
              onToggleTask={handleToggleDailyTask}
              onToggleDay={handleToggleDayStatus}
              onOpenDayModal={(day) => setSelectedDayForModal(day)}
              onOpenTodayTasks={() => handleSelectTab('today')}
              onOpenSprintView={() => handleSelectTab('calendar')}
              onOpenNewChallenge={() => setIsNewChallengeOpen(true)}
              onOpenLockNotice={handleOpenLockNotice}
            />
          )}

          {/* TAB 1: My Challenges (Sprint Hub & Archives) */}
          {activeTab === 'challenges' && (
            <MyChallengesView
              challenges={challenges}
              activeChallenge={activeChallenge}
              onSelectChallenge={handleSelectChallenge}
              onOpenNewChallenge={() => setIsNewChallengeOpen(true)}
              onOpenCalendar={() => handleSelectTab('calendar')}
              onOpenTodayTasks={() => handleSelectTab('today')}
              onOpenAnalytics={() => handleSelectTab('analytics')}
              onOpenCertificate={() => handleSelectTab('completion')}
              onEnrollTemplate={handleEnrollTemplate}
            />
          )}

          {/* TAB 2: Sprint Calendar Grid */}
          {activeTab === 'calendar' && (
            <CalendarGridView
              activeChallenge={activeChallenge}
              dailyTasks={dailyTasks}
              onToggleDay={handleToggleDayStatus}
              onOpenDayModal={(day) => setSelectedDayForModal(day)}
              onOpenTelemetry={() => setIsShareModalOpen(true)}
              onOpenLockNotice={handleOpenLockNotice}
              onOpenNewChallenge={() => setIsNewChallengeOpen(true)}
            />
          )}

          {/* TAB 3: Today's Tasks */}
          {activeTab === 'today' && (
            <TodayTasksView
              activeChallenge={activeChallenge}
              tasks={dailyTasks}
              onToggleTask={handleToggleDailyTask}
              onAddTask={handleAddDailyTask}
              onDeleteTask={handleDeleteDailyTask}
              onEditTask={handleEditDailyTask}
              onMarkDayDone={handleMarkTodayDone}
              onReopenDay={handleReopenToday}
              onOpenNewChallenge={() => setIsNewChallengeOpen(true)}
              onFocusSessionComplete={(minutes) => {
                addNotification({
                  title: `Deep Focus Complete! 🧘`,
                  message: `You completed a ${minutes}-minute zero-distraction sprint focus block!`,
                  type: 'focus'
                });
              }}
            />
          )}

          {/* TAB 4: Progress & Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CircularGauge
                  activeChallenge={activeChallenge}
                  onOpenShareModal={() => setIsShareModalOpen(true)}
                  onResetChallenge={() => {}}
                />
                <SprintRoadmap
                  completedCount={activeChallenge?.days?.filter((d) => d.status === 'completed').length || 0}
                />
              </div>
              <MotivationalCard />
            </div>
          )}

          {/* TAB 5: Challenge Completion */}
          {activeTab === 'completion' && (
            <CompletionView
              userName={currentUser?.name || "High Performer"}
              activeChallenge={activeChallenge}
              completedChallenges={challenges.filter(c => {
                const total = c.days?.length || 30;
                const done = c.days?.filter(d => d.status === 'completed').length || 0;
                return done >= total;
              })}
              onOpenNewChallenge={() => setIsNewChallengeOpen(true)}
              onSelectChallenge={handleSelectChallenge}
            />
          )}

          {/* TAB 6: Settings */}
          {activeTab === 'settings' && (
            <div className="rounded-2xl bg-[#131b2e] border border-white/10 p-6 space-y-6 max-w-xl animate-in fade-in duration-200">
              <h2 className="text-xl font-display font-bold text-white">Sprint Preferences</h2>
              <div className="space-y-4 text-xs font-display">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0b1326] border border-white/5">
                  <div>
                    <span className="font-bold text-white block">Sound Effects</span>
                    <span className="text-[11px] text-[#908fa0]">Chimes & Milestone fanfares</span>
                  </div>
                  <button
                    onClick={handleToggleSound}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${isSoundOn ? 'bg-[#4edea3] text-[#002113]' : 'bg-white/10 text-white'}`}
                  >
                    {isSoundOn ? 'Enabled' : 'Muted'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0b1326] border border-white/5">
                  <div>
                    <span className="font-bold text-white block">Theme Appearance</span>
                    <span className="text-[11px] text-[#908fa0]">
                      Current: {isDark ? 'Dark Theme (Night Sky)' : 'Light Theme (Clean Crisp)'}
                    </span>
                  </div>
                  <button
                    onClick={handleToggleTheme}
                    className="px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer bg-[#8083ff] hover:bg-[#6c70ff] text-[#0b1326] shadow-[0_0_12px_rgba(128,131,255,0.3)]"
                  >
                    {isDark ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
                  </button>
                </div>

                {/* Custom Color Theme Picker */}
                <div className="p-3.5 rounded-xl bg-[#0b1326] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Custom Accent Theme Color</span>
                      <span className="text-[11px] text-[#908fa0]">Personalize sprint buttons, highlights & badges</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-white uppercase">{accentColor}</span>
                      <div
                        className="w-5 h-5 rounded-full border border-white/30 shadow-sm"
                        style={{ backgroundColor: accentColor }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {[
                      { name: 'Indigo Neon', hex: '#8083ff' },
                      { name: 'Emerald Peak', hex: '#10b981' },
                      { name: 'Cyber Cyan', hex: '#06b6d4' },
                      { name: 'Amber Sunrise', hex: '#f59e0b' },
                      { name: 'Rose Flame', hex: '#f43f5e' },
                      { name: 'Violet Aura', hex: '#a855f7' }
                    ].map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setAccentColor(preset.hex)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-display font-semibold transition-all cursor-pointer ${
                          accentColor.toLowerCase() === preset.hex.toLowerCase()
                            ? 'border-white text-white bg-white/10 shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                            : 'border-white/5 text-[#908fa0] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span>{preset.name}</span>
                      </button>
                    ))}

                    {/* Custom HTML Color Picker */}
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-display font-semibold text-white transition-all cursor-pointer">
                      <span>Custom Color:</span>
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 p-0"
                      />
                    </label>
                  </div>
                </div>

                {/* Security & Password */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0b1326] border border-white/5">
                  <div>
                    <span className="font-bold text-white block">Account Security</span>
                    <span className="text-[11px] text-[#908fa0]">Update login password & credentials</span>
                  </div>
                  <button
                    onClick={handleOpenPasswordModal}
                    className="px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  >
                    Change Password
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0b1326] border border-white/5">
                  <div>
                    <span className="font-bold text-white block">Database Connection</span>
                    <span className="text-[11px] text-[#908fa0]">Local & Cloud sync</span>
                  </div>
                  <span className="text-[#4edea3] font-bold px-2 py-1 rounded bg-[#00885d]/20 border border-[#4edea3]/30">
                    {dbStatus}
                  </span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Global Modals */}
      <DayDetailModal
        isOpen={Boolean(selectedDayForModal)}
        day={selectedDayForModal}
        currentDayNum={activeChallenge ? getSprintCurrentDay(activeChallenge) : 1}
        onClose={() => setSelectedDayForModal(null)}
        onSave={handleSaveDayDetails}
      />

      <LockNoticeModal
        isOpen={lockNotice.isOpen}
        dayNumber={lockNotice.dayNumber}
        currentDayNum={lockNotice.currentDayNum}
        isPast={lockNotice.isPast}
        unlockDateStr={lockNotice.unlockDateStr}
        onClose={() => setLockNotice((prev) => ({ ...prev, isOpen: false }))}
      />

      <InfoModal
        isOpen={infoModalNotice.isOpen}
        title={infoModalNotice.title}
        message={infoModalNotice.message}
        type={infoModalNotice.type}
        onClose={() => setInfoModalNotice((prev) => ({ ...prev, isOpen: false }))}
      />

      <NewChallengeModal
        isOpen={isNewChallengeOpen}
        onClose={() => setIsNewChallengeOpen(false)}
        onCreate={handleCreateChallenge}
      />

      <CelebrationModal
        isOpen={isCelebrationOpen}
        milestoneDay={celebrationData.milestoneDay}
        streak={celebrationData.streak}
        progress={celebrationData.progress}
        onClose={() => setIsCelebrationOpen(false)}
      />

      <ShareCardModal
        isOpen={isShareModalOpen}
        activeChallenge={activeChallenge}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Change Password Dialog Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="max-w-md w-full rounded-2xl bg-[#131b2e] border border-white/10 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="font-display font-bold text-lg text-white">Change Account Password</h3>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-[#908fa0] hover:text-white transition-colors cursor-pointer text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-display">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs font-display">
              <div className="space-y-1.5">
                <label className="text-[#908fa0] block font-semibold">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter your current password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b1326] border border-white/10 text-white placeholder-[#908fa0]/50 focus:border-[#8083ff] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#908fa0] block font-semibold">New Password (min 6 characters)</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter your new password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b1326] border border-white/10 text-white placeholder-[#908fa0]/50 focus:border-[#8083ff] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#908fa0] block font-semibold">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm your new password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b1326] border border-white/10 text-white placeholder-[#908fa0]/50 focus:border-[#8083ff] focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2 rounded-xl bg-[#8083ff] hover:bg-[#6c70ff] text-[#0b1326] font-bold shadow-[0_0_12px_rgba(128,131,255,0.3)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
