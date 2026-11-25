const mongoose = require('mongoose');

const DaySchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 365
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'missed'],
    default: 'pending'
  },
  note: {
    type: String,
    default: ''
  },
  mood: {
    type: Number, // 1 to 5
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, { _id: false });

const HabitSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const ChallengeSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'anonymous',
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: 'Fitness & Health'
  },
  description: {
    type: String,
    default: ''
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  days: {
    type: [DaySchema],
    default: () => {
      const initialDays = [];
      for (let i = 1; i <= 30; i++) {
        initialDays.push({
          dayNumber: i,
          status: 'pending',
          note: '',
          mood: null,
          completedAt: null
        });
      }
      return initialDays;
    }
  },
  habits: {
    type: [HabitSchema],
    default: [
      { id: 'h1', text: '45-minute focused execution', completed: false },
      { id: 'h2', text: 'Track daily reflection in journal', completed: false },
      { id: 'h3', text: 'Hydrate 3L & clean nutrition', completed: false }
    ]
  },
  streak: {
    type: Number,
    default: 0
  },
  bestStreak: {
    type: Number,
    default: 0
  },
  colorTheme: {
    type: String,
    default: 'indigo'
  }
}, {
  timestamps: true
});

// Helper to compute consecutive streak from day 1 upwards
ChallengeSchema.methods.calculateStreak = function () {
  let currentStreak = 0;
  let maxStreak = this.bestStreak || 0;
  
  // Sort days by dayNumber
  const sortedDays = [...this.days].sort((a, b) => a.dayNumber - b.dayNumber);

  for (const day of sortedDays) {
    if (day.status === 'completed') {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else if (day.status === 'missed') {
      currentStreak = 0;
    } else {
      // Pending
      break;
    }
  }

  this.streak = currentStreak;
  this.bestStreak = maxStreak;
};

module.exports = mongoose.model('Challenge', ChallengeSchema);
