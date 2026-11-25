# DayByDay - 30 Days Challenge Tracker 🚀
> Focused Momentum, Habit Mastery, and Celebratory Accomplishment.

Built with **React 18**, **Tailwind CSS**, **Node.js / Express**, and **MongoDB (Mongoose)**.

---

## 🌟 Key Features

1. **Signature 30-Day Matrix Grid (10x3 / 6x5)**:
   - **Completed**: Emerald gradient glow with checkmark icon (`#10B981`).
   - **Active Today**: Double-ring pulsing Indigo highlight (`#6366F1`).
   - **Missed**: Muted slate indicator.
   - **Upcoming**: Ghosted futuristic border.
   - **Reflections**: Double click or click "Note" on any day to log mood/energy (1–5) and journal reflections.

2. **Progress Meters & Circular SVG Gauge**:
   - Smooth dual-stroke SVG telemetry gauge driven by gradient `#6366F1` ➔ `#8B5CF6` ➔ `#10B981`.
   - Jitter-free tabular numbers display (`font-feature-settings: "tnum" 1, "cv05" 1`).

3. **Dynamic Flame Streak Badges**:
   - Ambient glowing flame pill badge with live animation.
   - Automatically computes consecutive daily streaks and records best streaks.

4. **Celebration Confetti & Milestones**:
   - Triggers on Day 7, Day 14, Day 21, and Day 30 milestones with trophy overlay, confetti cannon blast, and sound effects.

5. **Shareable Streak Card Generator**:
   - Client-side Canvas card generator to export or copy high-resolution sprint cards for social sharing.

6. **Daily Micro-Habit Checklist**:
   - Interactive habit tasks with custom bouncy checkbox animations and strikethrough transitions.

7. **MongoDB Database Persistence**:
   - Complete Mongoose schemas for Challenges, Days (1..30), Notes, Moods, and Habits.
   - Built-in resilient fallback: if MongoDB is starting or offline, it transparently keeps working.

---

## 🛠️ Project Structure

```
Demo/
├── package.json               # Root scripts
├── server/                    # Node.js + Express + MongoDB backend
│   ├── models/
│   │   └── Challenge.js       # Mongoose Schema
│   ├── server.js              # Express REST API endpoints
│   ├── package.json
│   └── .env.example
└── client/                    # React + Vite + Tailwind CSS frontend
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── HeroSection.jsx
    │   │   ├── CircularGauge.jsx
    │   │   ├── MatrixGrid.jsx
    │   │   ├── DayCell.jsx
    │   │   ├── HabitChecklist.jsx
    │   │   ├── MotivationalCard.jsx
    │   │   ├── SprintRoadmap.jsx
    │   │   ├── DayDetailModal.jsx
    │   │   ├── NewChallengeModal.jsx
    │   │   ├── CelebrationModal.jsx
    │   │   └── ShareCardModal.jsx
    │   ├── services/
    │   │   └── api.js         # API integration
    │   ├── utils/
    │   │   └── sound.js       # Web Audio API chime generator
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 How to Run (எப்படி Run பண்ணுவது)

### Step 1: Install Dependencies (Packages install பண்ணுங்க)

Run from `Demo` directory:

```bash
cd Demo
npm run install:all
```

Or install separately:
```bash
# Server packages
cd Demo/server
npm install

# Client packages
cd ../client
npm install
```

---

### Step 2: Start MongoDB (MongoDB Start பண்ணுங்க)

Ensure your MongoDB service is running locally on port 27017:
```bash
mongod
# OR start MongoDB Service in Windows Services / Docker
```
*(Note: If MongoDB is not yet running, the server automatically uses the in-memory fallback store so the UI will still work!)*

---

### Step 3: Run the Application (Run பண்ணுங்க)

**Terminal 1 (Start Server):**
```bash
cd Demo/server
npm run dev
# Running on http://localhost:5000
```

**Terminal 2 (Start React Vite Client):**
```bash
cd Demo/client
npm run dev
# Running on http://localhost:3000
```

Open your browser at **`http://localhost:3000`** to start crushing your 30-day sprint!
