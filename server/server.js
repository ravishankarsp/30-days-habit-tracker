const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Challenge = require("./models/Challenge");
const User = require("./models/User");
const Notification = require("./models/Notification");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/daybyday";

app.use(cors());
app.use(express.json());

// In-Memory Fallback store in case MongoDB is temporarily offline
let isMongoConnected = false;
let memoryChallenges = [];
let memoryNotifications = [];
let memoryUsers = [];

const seedDefaultChallenges = () => [];

// Initialize MongoDB Connection
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 2500,
  })
  .then(async () => {
    isMongoConnected = true;
    console.log("✅ Connected to MongoDB successfully at:", MONGO_URI);

    // Check if initial seeding is needed
    const count = await Challenge.countDocuments();
    if (count === 0) {
      const seeds = seedDefaultChallenges().map((c) => {
        const { _id, ...rest } = c;
        return rest;
      });
      await Challenge.insertMany(seeds);
      console.log("🌱 Seeded default 30-day challenges into MongoDB");
    }
  })
  .catch((err) => {
    isMongoConnected = false;
    console.warn("⚠️ MongoDB connection not reached (" + err.message + ").");
    console.warn(
      "🚀 Running with resilient In-Memory Store so the application works seamlessly!",
    );
    memoryChallenges = seedDefaultChallenges();
  });

// Helper for calculating streak in memory
function calculateStreakInMemory(challenge) {
  let currentStreak = 0;
  let maxStreak = challenge.bestStreak || 0;
  const sorted = [...challenge.days].sort((a, b) => a.dayNumber - b.dayNumber);
  for (const day of sorted) {
    if (day.status === "completed") {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else if (day.status === "missed") {
      currentStreak = 0;
    } else {
      break;
    }
  }
  challenge.streak = currentStreak;
  challenge.bestStreak = maxStreak;
}

/* ==================== API ROUTES ==================== */

// Health & DB Status Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: isMongoConnected
      ? "MongoDB (Connected)"
      : "In-Memory Resilient Store",
    mongoUri: MONGO_URI,
    timestamp: new Date(),
  });
});

// Auth: Login with database / credential verification
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = null;

    if (isMongoConnected) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      user = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    }

    if (!user) {
      return res.status(404).json({
        error:
          'Account not found! Please create an account first by clicking "Sign up for free".',
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        error: "Incorrect password. Please enter the correct password.",
      });
    }

    res.json({
      message: "Login successful!",
      token: "jwt_mock_token_30day_tracker",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        streak: user.streak || 0,
        avatar: user.avatar || "",
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth: Register and save to database
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Full name, email, and password are required." });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isMongoConnected) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res
          .status(400)
          .json({
            error: "An account with this email already exists. Please sign in.",
          });
      }
      const newUser = new User({
        name,
        email: cleanEmail,
        password,
        streak: 12,
      });
      await newUser.save();

      return res.status(201).json({
        message: "Account created successfully!",
        token: "jwt_mock_token_30day_tracker",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          streak: newUser.streak,
          avatar: newUser.avatar,
        },
      });
    }

    // In-Memory Fallback
    const existing = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res
        .status(400)
        .json({
          error: "An account with this email already exists. Please sign in.",
        });
    }

    const newUser = {
      _id: `mem_user_${Date.now()}`,
      name,
      email: cleanEmail,
      password,
      streak: 12,
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
    };
    memoryUsers.push(newUser);

    res.status(201).json({
      message: "Account created successfully!",
      token: "jwt_mock_token_30day_tracker",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        streak: newUser.streak,
        avatar: newUser.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth: Change Password
app.post("/api/auth/change-password", async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    const uid = userId || req.headers["x-user-id"];

    if (!uid || !currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current password and new password are required." });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters long." });
    }

    if (isMongoConnected) {
      const user = await User.findById(uid);
      if (!user) {
        return res.status(404).json({ error: "User account not found." });
      }

      if (user.password !== currentPassword) {
        return res
          .status(401)
          .json({ error: "Current password does not match." });
      }

      user.password = newPassword;
      await user.save();
      return res.json({
        success: true,
        message: "Password updated successfully!",
      });
    }

    // In-memory fallback
    const user = memoryUsers.find((u) => u._id === uid);
    if (!user) {
      return res.status(404).json({ error: "User account not found." });
    }

    if (user.password !== currentPassword) {
      return res
        .status(401)
        .json({ error: "Current password does not match." });
    }

    user.password = newPassword;
    return res.json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET challenges (filtered per user)
app.get("/api/challenges", async (req, res) => {
  try {
    const userId = req.query.userId || req.headers["x-user-id"];
    if (isMongoConnected) {
      const filter = userId ? { userId } : {};
      const challenges = await Challenge.find(filter).sort({ createdAt: -1 });
      return res.json(challenges);
    }
    const filtered = userId
      ? memoryChallenges.filter((c) => c.userId === userId)
      : memoryChallenges;
    return res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single challenge
app.get("/api/challenges/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      const challenge = await Challenge.findById(id);
      if (!challenge)
        return res.status(404).json({ error: "Challenge not found" });
      return res.json(challenge);
    }
    const challenge = memoryChallenges.find((c) => c._id === id);
    if (!challenge)
      return res.status(404).json({ error: "Challenge not found" });
    return res.json(challenge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new challenge (isolated per user)
app.post("/api/challenges", async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      startDate,
      initialHabits,
      colorTheme,
      totalDays,
      userId,
    } = req.body;
    const creatorId = userId || req.headers["x-user-id"] || "anonymous";

    const habitsList =
      initialHabits && Array.isArray(initialHabits) && initialHabits.length > 0
        ? initialHabits.map((text, idx) => ({
            id: `h_${Date.now()}_${idx}`,
            text,
            completed: false,
          }))
        : [
            {
              id: `h_${Date.now()}_1`,
              text: "45-minute deep focus sprint",
              completed: false,
            },
            {
              id: `h_${Date.now()}_2`,
              text: "Daily reflection & mood record",
              completed: false,
            },
            {
              id: `h_${Date.now()}_3`,
              text: "Hydration & clean nutrition",
              completed: false,
            },
          ];

    const sprintLength = Math.max(
      1,
      Math.min(365, parseInt(totalDays, 10) || 30),
    );

    const days = Array.from({ length: sprintLength }, (_, i) => ({
      dayNumber: i + 1,
      status: "pending",
      note: "",
      mood: null,
      completedAt: null,
    }));

    if (isMongoConnected) {
      const newChallenge = new Challenge({
        userId: creatorId,
        title,
        category: category || "General Mastery",
        description: description || "",
        startDate: startDate ? new Date(startDate) : new Date(),
        days,
        habits: habitsList,
        streak: 0,
        bestStreak: 0,
        colorTheme: colorTheme || "indigo",
      });
      await newChallenge.save();
      return res.status(201).json(newChallenge);
    }

    const newMemoryChallenge = {
      _id: `mem_${Date.now()}`,
      userId: creatorId,
      title,
      category: category || "General Mastery",
      description: description || "",
      startDate: startDate ? new Date(startDate) : new Date(),
      days,
      habits: habitsList,
      streak: 0,
      bestStreak: 0,
      colorTheme: colorTheme || "indigo",
      createdAt: new Date(),
    };
    memoryChallenges.unshift(newMemoryChallenge);
    return res.status(201).json(newMemoryChallenge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update day state & reflection
app.patch("/api/challenges/:id/day/:dayNumber", async (req, res) => {
  try {
    const { id, dayNumber } = req.params;
    const { status, note, mood } = req.body;
    const dayNum = parseInt(dayNumber, 10);

    if (isMongoConnected) {
      const challenge = await Challenge.findById(id);
      if (!challenge)
        return res.status(404).json({ error: "Challenge not found" });

      const day = challenge.days.find((d) => d.dayNumber === dayNum);
      if (!day) return res.status(404).json({ error: "Day not found" });

      if (status !== undefined) {
        day.status = status;
        day.completedAt = status === "completed" ? new Date() : null;
      }
      if (note !== undefined) day.note = note;
      if (mood !== undefined) day.mood = mood;

      challenge.calculateStreak();
      await challenge.save();
      return res.json(challenge);
    }

    const challenge = memoryChallenges.find((c) => c._id === id);
    if (!challenge)
      return res.status(404).json({ error: "Challenge not found" });

    const day = challenge.days.find((d) => d.dayNumber === dayNum);
    if (!day) return res.status(404).json({ error: "Day not found" });

    if (status !== undefined) {
      day.status = status;
      day.completedAt = status === "completed" ? new Date() : null;
    }
    if (note !== undefined) day.note = note;
    if (mood !== undefined) day.mood = mood;

    calculateStreakInMemory(challenge);
    return res.json(challenge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH habits (toggle completed or add task)
app.patch("/api/challenges/:id/habits", async (req, res) => {
  try {
    const { id } = req.params;
    const { action, habitId, text } = req.body;

    if (isMongoConnected) {
      const challenge = await Challenge.findById(id);
      if (!challenge)
        return res.status(404).json({ error: "Challenge not found" });

      if (action === "toggle") {
        const habit = challenge.habits.find((h) => h.id === habitId);
        if (habit) habit.completed = !habit.completed;
      } else if (action === "add" && text) {
        challenge.habits.push({
          id: `h_${Date.now()}`,
          text,
          completed: false,
        });
      } else if (action === "edit" && habitId && text) {
        const habit = challenge.habits.find(
          (h) => h.id === habitId || h.text === habitId,
        );
        if (habit) habit.text = text;
      } else if (action === "delete") {
        challenge.habits = challenge.habits.filter((h) => h.id !== habitId);
      }

      await challenge.save();
      return res.json(challenge);
    }

    const challenge = memoryChallenges.find((c) => c._id === id);
    if (!challenge)
      return res.status(404).json({ error: "Challenge not found" });

    if (action === "toggle") {
      const habit = challenge.habits.find((h) => h.id === habitId);
      if (habit) habit.completed = !habit.completed;
    } else if (action === "add" && text) {
      challenge.habits.push({ id: `h_${Date.now()}`, text, completed: false });
    } else if (action === "edit" && habitId && text) {
      const habit = challenge.habits.find(
        (h) => h.id === habitId || h.text === habitId,
      );
      if (habit) habit.text = text;
    } else if (action === "delete") {
      challenge.habits = challenge.habits.filter((h) => h.id !== habitId);
    }

    return res.json(challenge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST reset challenge days
app.post("/api/challenges/:id/reset", async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      const challenge = await Challenge.findById(id);
      if (!challenge)
        return res.status(404).json({ error: "Challenge not found" });

      challenge.days.forEach((d) => {
        d.status = "pending";
        d.note = "";
        d.mood = null;
        d.completedAt = null;
      });
      challenge.streak = 0;
      challenge.habits.forEach((h) => (h.completed = false));

      await challenge.save();
      return res.json(challenge);
    }

    const challenge = memoryChallenges.find((c) => c._id === id);
    if (!challenge)
      return res.status(404).json({ error: "Challenge not found" });

    challenge.days.forEach((d) => {
      d.status = "pending";
      d.note = "";
      d.mood = null;
      d.completedAt = null;
    });
    challenge.streak = 0;
    challenge.habits.forEach((h) => (h.completed = false));

    return res.json(challenge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE challenge
app.delete("/api/challenges/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await Challenge.findByIdAndDelete(id);
      return res.json({ success: true });
    }
    memoryChallenges = memoryChallenges.filter((c) => c._id !== id);
    return res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// NOTIFICATIONS API (User-scoped Database Storage)
// ==========================================

// GET /api/notifications?userId=xxx
app.get("/api/notifications", async (req, res) => {
  try {
    const userId = req.query.userId || req.headers["x-user-id"];
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (isMongoConnected) {
      const notifs = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(30);
      return res.json(notifs);
    }

    const notifs = memoryNotifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 30);
    return res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications - Create new user notification
app.post("/api/notifications", async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;
    const uid = userId || req.headers["x-user-id"];
    if (!uid || !title || !message) {
      return res
        .status(400)
        .json({ error: "userId, title, and message are required" });
    }

    if (isMongoConnected) {
      const created = await Notification.create({
        userId: uid,
        title,
        message,
        type: type || "system",
        read: false,
        time: "Just now",
      });
      return res.status(201).json(created);
    }

    const created = {
      _id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: uid,
      title,
      message,
      type: type || "system",
      read: false,
      time: "Just now",
      createdAt: new Date(),
    };
    memoryNotifications.unshift(created);
    return res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/:id/read - Mark single notification as read
app.put("/api/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      const updated = await Notification.findByIdAndUpdate(
        id,
        { read: true },
        { new: true },
      );
      return res.json(updated || { success: true });
    }

    const target = memoryNotifications.find((n) => n._id === id);
    if (target) target.read = true;
    return res.json(target || { success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/read-all - Mark all user notifications as read
app.put("/api/notifications/read-all", async (req, res) => {
  try {
    const { userId } = req.body;
    const uid = userId || req.headers["x-user-id"];
    if (!uid) return res.status(400).json({ error: "userId is required" });

    if (isMongoConnected) {
      await Notification.updateMany(
        { userId: uid, read: false },
        { read: true },
      );
      return res.json({ success: true });
    }

    memoryNotifications.forEach((n) => {
      if (n.userId === uid) n.read = true;
    });
    return res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notifications/:id - Dismiss notification
app.delete("/api/notifications/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await Notification.findByIdAndDelete(id);
      return res.json({ success: true });
    }
    memoryNotifications = memoryNotifications.filter((n) => n._id !== id);
    return res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 DayByDay API Server running on http://localhost:${PORT}`);
});
