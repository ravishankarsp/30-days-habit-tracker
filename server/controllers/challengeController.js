const Challenge = require('../models/Challenge');
const { getConnectionStatus } = require('../config/db');
const memoryStore = require('../config/memoryStore');

// Helper for calculating streak in memory
function calculateStreakInMemory(challenge) {
  let currentStreak = 0;
  let maxStreak = challenge.bestStreak || 0;
  const sorted = [...challenge.days].sort((a, b) => a.dayNumber - b.dayNumber);
  for (const day of sorted) {
    if (day.status === 'completed') {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else if (day.status === 'missed') {
      currentStreak = 0;
    } else {
      break;
    }
  }
  challenge.streak = currentStreak;
  challenge.bestStreak = maxStreak;
}

// GET all challenges (filtered per user)
exports.getChallenges = async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'];
    if (getConnectionStatus()) {
      const filter = userId ? { userId } : {};
      const challenges = await Challenge.find(filter).sort({ createdAt: -1 });
      return res.json(challenges);
    }
    const filtered = userId
      ? memoryStore.challenges.filter((c) => c.userId === userId)
      : memoryStore.challenges;
    return res.json(filtered);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET single challenge
exports.getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;
    if (getConnectionStatus()) {
      const challenge = await Challenge.findById(id);
      if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
      return res.json(challenge);
    }
    const challenge = memoryStore.challenges.find((c) => c._id === id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
    return res.json(challenge);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST create new challenge
exports.createChallenge = async (req, res) => {
  try {
    const { title, category, description, startDate, colorTheme, totalDays, initialHabits, userId } = req.body;
    const uid = userId || req.headers['x-user-id'] || 'anonymous';
    const sprintLength = Math.max(1, Math.min(365, parseInt(totalDays, 10) || 30));

    const days = Array.from({ length: sprintLength }, (_, i) => ({
      dayNumber: i + 1,
      status: 'pending',
      note: '',
      mood: null,
      completedAt: null
    }));

    const habits =
      initialHabits && initialHabits.length > 0
        ? initialHabits.map((text, idx) => ({ id: `h_${Date.now()}_${idx}`, text, completed: false }))
        : [
            { id: 'h1', text: '45-min daily focus sprint', completed: false },
            { id: 'h2', text: 'Complete daily checkpoint', completed: false },
            { id: 'h3', text: 'Evening reflection & note', completed: false }
          ];

    if (getConnectionStatus()) {
      const newChallenge = new Challenge({
        userId: uid,
        title,
        category: category || 'Fitness & Health',
        description: description || '',
        startDate: startDate ? new Date(startDate) : new Date(),
        days,
        habits,
        streak: 0,
        bestStreak: 0,
        colorTheme: colorTheme || 'indigo'
      });

      await newChallenge.save();
      return res.status(201).json(newChallenge);
    }

    const newChallenge = {
      _id: `mem_ch_${Date.now()}`,
      userId: uid,
      title,
      category: category || 'Fitness & Health',
      description: description || '',
      startDate: startDate ? new Date(startDate) : new Date(),
      days,
      habits,
      streak: 0,
      bestStreak: 0,
      colorTheme: colorTheme || 'indigo',
      createdAt: new Date()
    };

    memoryStore.challenges.unshift(newChallenge);
    return res.status(201).json(newChallenge);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PUT update single day status
exports.updateDay = async (req, res) => {
  try {
    const { id, dayNumber } = req.params;
    const { status, note, mood } = req.body;
    const dayNum = parseInt(dayNumber, 10);

    if (getConnectionStatus()) {
      const challenge = await Challenge.findById(id);
      if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

      const day = challenge.days.find((d) => d.dayNumber === dayNum);
      if (!day) return res.status(404).json({ error: 'Day not found' });

      if (status !== undefined) day.status = status;
      if (note !== undefined) day.note = note;
      if (mood !== undefined) day.mood = mood;
      if (status === 'completed') day.completedAt = new Date();

      challenge.calculateStreak();
      await challenge.save();
      return res.json(challenge);
    }

    const challenge = memoryStore.challenges.find((c) => c._id === id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    const day = challenge.days.find((d) => d.dayNumber === dayNum);
    if (!day) return res.status(404).json({ error: 'Day not found' });

    if (status !== undefined) day.status = status;
    if (note !== undefined) day.note = note;
    if (mood !== undefined) day.mood = mood;
    if (status === 'completed') day.completedAt = new Date();

    calculateStreakInMemory(challenge);
    return res.json(challenge);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PUT habits management
exports.updateHabits = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, habitId, text } = req.body;

    if (getConnectionStatus()) {
      const challenge = await Challenge.findById(id);
      if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

      if (action === 'toggle') {
        const habit = challenge.habits.find((h) => h.id === habitId);
        if (habit) habit.completed = !habit.completed;
      } else if (action === 'add' && text) {
        challenge.habits.push({ id: `h_${Date.now()}`, text, completed: false });
      } else if (action === 'edit' && habitId && text) {
        const habit = challenge.habits.find((h) => h.id === habitId || h.text === habitId);
        if (habit) habit.text = text;
      } else if (action === 'delete') {
        challenge.habits = challenge.habits.filter((h) => h.id !== habitId);
      }

      await challenge.save();
      return res.json(challenge);
    }

    const challenge = memoryStore.challenges.find((c) => c._id === id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    if (action === 'toggle') {
      const habit = challenge.habits.find((h) => h.id === habitId);
      if (habit) habit.completed = !habit.completed;
    } else if (action === 'add' && text) {
      challenge.habits.push({ id: `h_${Date.now()}`, text, completed: false });
    } else if (action === 'edit' && habitId && text) {
      const habit = challenge.habits.find((h) => h.id === habitId || h.text === habitId);
      if (habit) habit.text = text;
    } else if (action === 'delete') {
      challenge.habits = challenge.habits.filter((h) => h.id !== habitId);
    }

    return res.json(challenge);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST reset challenge
exports.resetChallenge = async (req, res) => {
  try {
    const { id } = req.params;

    if (getConnectionStatus()) {
      const challenge = await Challenge.findById(id);
      if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

      challenge.days.forEach((d) => {
        d.status = 'pending';
        d.note = '';
        d.mood = null;
        d.completedAt = null;
      });
      challenge.streak = 0;
      challenge.habits.forEach((h) => (h.completed = false));

      await challenge.save();
      return res.json(challenge);
    }

    const challenge = memoryStore.challenges.find((c) => c._id === id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    challenge.days.forEach((d) => {
      d.status = 'pending';
      d.note = '';
      d.mood = null;
      d.completedAt = null;
    });
    challenge.streak = 0;
    challenge.habits.forEach((h) => (h.completed = false));

    return res.json(challenge);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE challenge
exports.deleteChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    if (getConnectionStatus()) {
      await Challenge.findByIdAndDelete(id);
      return res.json({ success: true });
    }
    memoryStore.challenges = memoryStore.challenges.filter((c) => c._id !== id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
