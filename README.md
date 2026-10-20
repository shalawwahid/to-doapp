# CleanFlow — Personal Progression, Daily Schedule & Monthly Tracker

A modern, elegant, and comprehensive personal development and progression application built with **Node.js** and Vanilla JavaScript/CSS.

## ✨ Features

### ⏰ 1. Daily Schedule & Timeline
- **Time-Blocked Routine**: Schedule activities throughout the day with precise start/end times and categories.
- **5 Core Progression Categories**:
  - 📖 **Spiritual & Faith** (e.g., Quran recitation, prayer, meditation)
  - 💡 **Learning & Skills** (e.g., language vocabulary, reading, courses)
  - 💼 **Deep Work & Focus** (e.g., coding, project building)
  - 🏋️ **Health & Fitness** (e.g., workouts, cardio, walking)
  - 🌱 **Personal Routine** (e.g., evening review, planning)
- **Live Current Time Indicator**: Dynamic indicator highlighting where you are in your day.
- **Quick Habits**: One-click preset habits for quick scheduling.
- **Copy Yesterday**: Clone yesterday's routine to today with one click.
- **Interactive Checkoffs**: Completing activities grants Progression XP and maintains habit streaks.

### 📅 2. Monthly Tracker & Heatmap
- **Calendar Activity Heatmap**: Visual month-at-a-glance grid with color intensity (0% to 100% completion rates).
- **Habit Consistency Matrix**: Continuous 31-day status matrix across key recurring daily activities.
- **Monthly KPI Dashboard**:
  - 🔥 **Current Streak & Longest Streak**
  - 🎯 **Monthly Completion Rate**
  - ⏱️ **Active Days Count**
  - ⭐ **Monthly XP Earned**
- **Category Distribution**: Visual balance tracking across mind, body, work, and spirit.
- **Direct Navigation**: Click any calendar day to jump directly to that date's daily schedule.

### 🌟 3. Person Progression & Reflection Hub
- **Level & Tier System**: Level up as you accumulate XP from completed activities and tasks (e.g., *Novice Explorer* → *Dedicated Builder* → *Rising Achiever* → *Disciplined Master*).
- **Live Progression Pill in Header**: Instant visibility of Level, Streak, and total XP.
- **Milestones & Achievements**: Unlock milestones like *First Step*, *Morning Momentum*, *3-Day Consistency*, *Holistic Growth*, and *Millennium Achiever*.
- **Daily Mindset & Reflection Journal**: Log daily takeaways and choose mindset moods (🎯 Focused, ⚡ Energized, 😌 Calm, 😴 Tired) with +10 XP rewards.

### 📋 4. Tasks & To-Dos
- Clean task management preserved with filters (**All**, **Active**, **Completed**), inline editing, and undo notifications.

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v16 or newer).

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Server
```bash
npm start
```
Or for development:
```bash
npm run dev
```

### 4. Open in Browser
Visit [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📡 REST API Endpoints

### Tasks
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/todos` | Retrieve all tasks |
| `POST` | `/api/todos` | Create a new task (`{ title: string }`) |
| `PATCH` | `/api/todos/:id` | Update status or title (`{ completed?: boolean, title?: string }`) |
| `DELETE` | `/api/todos/:id` | Delete a single task |
| `DELETE` | `/api/todos/completed` | Clear all completed tasks |

### Daily Schedule
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/schedule?date=YYYY-MM-DD` | Retrieve schedule for a specific date |
| `POST` | `/api/schedule` | Add a schedule block (`{ title, date, startTime, endTime, category, notes, xp }`) |
| `PATCH` | `/api/schedule/:id` | Update or mark complete (`{ completed?: boolean, title?: string, ... }`) |
| `DELETE` | `/api/schedule/:id` | Delete a scheduled block |
| `POST` | `/api/schedule/copy-day` | Copy schedule from `sourceDate` to `targetDate` |

### Monthly Tracker & Progression
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/monthly-tracker?year=YYYY&month=M` | Aggregated monthly calendar, heatmap, habit matrix, and stats |
| `GET` | `/api/progression` | Overall XP, Level info, active streaks, milestones, and reflections |
| `POST` | `/api/progression/reflection` | Save daily mindset mood and journal notes (`{ date, mood, notes }`) |

