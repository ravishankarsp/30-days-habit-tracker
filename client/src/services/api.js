// API Client connecting to Express/MongoDB backend with local fallback
const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) || '/api';

export const api = {
  // Check backend & DB status
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch {
      return { status: 'fallback', database: 'Local Client Store' };
    }
  },

  // Fetch challenges for the currently authenticated user
  async getChallenges(userId) {
    const uid = userId || this.getCurrentUser()?.id || this.getCurrentUser()?._id;
    if (!uid) return [];

    try {
      const res = await fetch(`${API_BASE}/challenges?userId=${encodeURIComponent(uid)}`, {
        headers: { 'x-user-id': uid }
      });
      if (!res.ok) throw new Error('Failed to fetch challenges');
      const data = await res.json();
      localStorage.setItem(`daybyday_challenges_cache_${uid}`, JSON.stringify(data));
      return data;
    } catch {
      const cached = localStorage.getItem(`daybyday_challenges_cache_${uid}`);
      if (cached) return JSON.parse(cached);
      return [];
    }
  },

  // Create new challenge (isolated per user)
  async createChallenge(payload) {
    const uid = payload.userId || this.getCurrentUser()?.id || this.getCurrentUser()?._id || 'anonymous';
    const enrichedPayload = { ...payload, userId: uid };

    try {
      const res = await fetch(`${API_BASE}/challenges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': uid
        },
        body: JSON.stringify(enrichedPayload)
      });
      if (!res.ok) throw new Error('Failed to create challenge');
      const created = await res.json();
      
      // Update local cache
      try {
        const cached = JSON.parse(localStorage.getItem(`daybyday_challenges_cache_${uid}`) || '[]');
        localStorage.setItem(`daybyday_challenges_cache_${uid}`, JSON.stringify([created, ...cached]));
      } catch (e) {}

      return created;
    } catch {
      // Local fallback creation
      const sprintLength = Math.max(1, Math.min(365, parseInt(payload.totalDays, 10) || 30));
      const days = Array.from({ length: sprintLength }, (_, i) => ({
        dayNumber: i + 1,
        status: 'pending',
        note: '',
        mood: null,
        completedAt: null
      }));
      const fallback = {
        _id: `local_${Date.now()}`,
        userId: uid,
        title: payload.title,
        category: payload.category || 'Fitness & Health',
        description: payload.description || '',
        startDate: payload.startDate || new Date(),
        days,
        habits: (payload.initialHabits && payload.initialHabits.length > 0)
          ? payload.initialHabits.map((text, idx) => ({ id: `h_${Date.now()}_${idx}`, text, completed: false }))
          : [{ id: 'h1', text: '45-min daily focus sprint', completed: false }],
        streak: 0,
        bestStreak: 0,
        colorTheme: payload.colorTheme || 'indigo',
        createdAt: new Date()
      };

      try {
        const cached = JSON.parse(localStorage.getItem(`daybyday_challenges_cache_${uid}`) || '[]');
        localStorage.setItem(`daybyday_challenges_cache_${uid}`, JSON.stringify([fallback, ...cached]));
      } catch (e) {}

      return fallback;
    }
  },

  // Update day status, note, or mood
  async updateDay(challengeId, dayNumber, updateData) {
    try {
      const res = await fetch(`${API_BASE}/challenges/${challengeId}/day/${dayNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (!res.ok) throw new Error('Failed to update day');
      return await res.json();
    } catch {
      return null;
    }
  },

  // Toggle habit or add habit task
  async updateHabits(challengeId, habitAction) {
    try {
      const res = await fetch(`${API_BASE}/challenges/${challengeId}/habits`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habitAction)
      });
      if (!res.ok) throw new Error('Failed to update habits');
      return await res.json();
    } catch {
      return null;
    }
  },

  // Reset challenge days
  async resetChallenge(challengeId) {
    try {
      const res = await fetch(`${API_BASE}/challenges/${challengeId}/reset`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to reset challenge');
      return await res.json();
    } catch {
      return null;
    }
  },

  // Delete challenge
  async deleteChallenge(challengeId) {
    try {
      const res = await fetch(`${API_BASE}/challenges/${challengeId}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch {
      return { success: true };
    }
  },

  // Auth: Login
  async login(email, password) {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check credentials.');
      }
      localStorage.setItem('daybyday_auth_user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      // If error came from server response, rethrow it directly
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        throw err;
      }

      // Local resilient fallback storage
      const defaultDemoUsers = [
        {
          id: 'user_demo_1',
          name: 'Karthik V.',
          email: 'alex@example.com',
          password: 'password123',
          streak: 12,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'
        }
      ];

      const raw = localStorage.getItem('daybyday_registered_users');
      const users = raw ? JSON.parse(raw) : defaultDemoUsers;
      if (!raw) {
        localStorage.setItem('daybyday_registered_users', JSON.stringify(defaultDemoUsers));
      }

      const found = users.find(u => u.email.toLowerCase() === cleanEmail);
      if (!found) {
        throw new Error('Account not found! Please create an account first by clicking "Sign up for free".');
      }

      if (found.password !== password) {
        throw new Error('Incorrect password. Please enter the correct password.');
      }

      const sessionUser = {
        id: found.id || `user_${Date.now()}`,
        name: found.name,
        email: found.email,
        streak: found.streak || 12,
        avatar: found.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'
      };
      localStorage.setItem('daybyday_auth_user', JSON.stringify(sessionUser));
      return sessionUser;
    }
  },

  // Auth: Register
  async register(name, email, password) {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: cleanEmail, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }
      localStorage.setItem('daybyday_auth_user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        throw err;
      }

      // Local resilient fallback storage
      const defaultDemoUsers = [
        {
          id: 'user_demo_1',
          name: 'Karthik V.',
          email: 'alex@example.com',
          password: 'password123',
          streak: 12,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'
        }
      ];

      const raw = localStorage.getItem('daybyday_registered_users');
      const users = raw ? JSON.parse(raw) : defaultDemoUsers;

      const exists = users.find(u => u.email.toLowerCase() === cleanEmail);
      if (exists) {
        throw new Error('An account with this email already exists. Please sign in.');
      }

      const newUser = {
        id: `user_${Date.now()}`,
        name: name || 'Achiever',
        email: cleanEmail,
        password,
        streak: 12,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'
      };

      users.push(newUser);
      localStorage.setItem('daybyday_registered_users', JSON.stringify(users));
      localStorage.setItem('daybyday_auth_user', JSON.stringify(newUser));
      return newUser;
    }
  },

  // Auth: Get current logged-in user
  getCurrentUser() {
    try {
      const u = localStorage.getItem('daybyday_auth_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  // Auth: Logout
  logout() {
    localStorage.removeItem('daybyday_auth_user');
  },

  // Auth: Change Password
  async changePassword({ userId, currentPassword, newPassword }) {
    const uid = userId || this.getCurrentUser()?.id || this.getCurrentUser()?._id;
    if (!uid) throw new Error('User is not authenticated.');

    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': uid
        },
        body: JSON.stringify({ userId: uid, currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password.');
      }
      return data;
    } catch (err) {
      // Local fallback in case server is not running
      const raw = localStorage.getItem('daybyday_registered_users');
      if (raw) {
        try {
          const users = JSON.parse(raw);
          const userIdx = users.findIndex(u => u.id === uid || u._id === uid);
          if (userIdx !== -1) {
            if (users[userIdx].password && users[userIdx].password !== currentPassword) {
              throw new Error('Current password does not match.');
            }
            users[userIdx].password = newPassword;
            localStorage.setItem('daybyday_registered_users', JSON.stringify(users));
            return { success: true, message: 'Password updated successfully!' };
          }
        } catch (e) {
          if (e.message) throw e;
        }
      }
      throw err;
    }
  },

  // ==========================================
  // NOTIFICATIONS API (MongoDB Backend Persistence)
  // ==========================================

  // Get notifications for a user from DB
  async getNotifications(userId) {
    const uid = userId || this.getCurrentUser()?.id || this.getCurrentUser()?._id;
    if (!uid) return [];

    try {
      const res = await fetch(`${API_BASE}/notifications?userId=${encodeURIComponent(uid)}`, {
        headers: { 'x-user-id': uid }
      });
      if (!res.ok) throw new Error('Failed to load notifications from database');
      return await res.json();
    } catch (e) {
      console.warn('Notification DB fetch error, returning empty', e);
      return [];
    }
  },

  // Create/Save a notification to DB
  async createNotification({ userId, title, message, type = 'system' }) {
    const uid = userId || this.getCurrentUser()?.id || this.getCurrentUser()?._id;
    if (!uid) return null;

    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': uid
        },
        body: JSON.stringify({ userId: uid, title, message, type })
      });
      if (!res.ok) throw new Error('Failed to create notification in DB');
      return await res.json();
    } catch (e) {
      console.warn('Notification DB create error', e);
      return null;
    }
  },

  // Mark single notification as read in DB
  async markNotificationRead(notifId) {
    try {
      const res = await fetch(`${API_BASE}/notifications/${notifId}/read`, {
        method: 'PUT'
      });
      return res.ok;
    } catch (e) {
      console.warn('Notification DB mark read error', e);
      return false;
    }
  },

  // Mark all notifications for a user as read in DB
  async markAllNotificationsRead(userId) {
    const uid = userId || this.getCurrentUser()?.id || this.getCurrentUser()?._id;
    if (!uid) return false;

    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': uid
        },
        body: JSON.stringify({ userId: uid })
      });
      return res.ok;
    } catch (e) {
      console.warn('Notification DB mark all read error', e);
      return false;
    }
  },

  // Delete/dismiss notification in DB
  async deleteNotification(notifId) {
    try {
      const res = await fetch(`${API_BASE}/notifications/${notifId}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (e) {
      console.warn('Notification DB delete error', e);
      return false;
    }
  }
};
