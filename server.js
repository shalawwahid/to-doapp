const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const TODOS_FILE = path.join(DATA_DIR, 'todos.json');
const SCHEDULE_FILE = path.join(DATA_DIR, 'schedules.json');
const PROGRESSION_FILE = path.join(DATA_DIR, 'progression.json');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial tasks
const defaultTodos = [
  {
    id: '1',
    title: 'Welcome to your new To-Do app!',
    completed: true,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '2',
    title: 'Add your own task using the input box above',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Mark tasks as complete or delete them when done',
    completed: false,
    createdAt: new Date().toISOString()
  }
];

// Helper to format YYYY-MM-DD
function getIsoDate(dateObj = new Date()) {
  const d = new Date(dateObj);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Timezone-safe date arithmetic
function shiftIsoDate(isoDateStr, daysDelta) {
  const [y, m, d] = isoDateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + daysDelta);
  return getIsoDate(date);
}

const todayStr = getIsoDate();
const yesterdayStr = shiftIsoDate(todayStr, -1);
const twoDaysAgoStr = shiftIsoDate(todayStr, -2);

// Default initial daily schedule
const defaultSchedules = [
  // 2 days ago
  {
    id: 's-1001',
    date: twoDaysAgoStr,
    startTime: '06:00',
    endTime: '06:45',
    title: 'Morning Prayer & Quran Recitation',
    category: 'spiritual',
    completed: true,
    notes: '2 pages of Surah Al-Kahf read with contemplation',
    xp: 25,
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 's-1002',
    date: twoDaysAgoStr,
    startTime: '07:15',
    endTime: '08:00',
    title: 'English Vocabulary & Reading (3 words)',
    category: 'learning',
    completed: true,
    notes: 'Learned: Resilience, Diligence, Perspective',
    xp: 20,
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 's-1003',
    date: twoDaysAgoStr,
    startTime: '09:00',
    endTime: '12:00',
    title: 'Deep Focus & Skills Development',
    category: 'work',
    completed: true,
    notes: 'Built clean interface components',
    xp: 35,
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 's-1004',
    date: twoDaysAgoStr,
    startTime: '17:00',
    endTime: '18:00',
    title: 'Cardio & Strength Training',
    category: 'health',
    completed: true,
    notes: '45 mins workout + 15 mins stretching',
    xp: 30,
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  // Yesterday
  {
    id: 's-2001',
    date: yesterdayStr,
    startTime: '06:00',
    endTime: '06:45',
    title: 'Morning Prayer & Quran Recitation',
    category: 'spiritual',
    completed: true,
    notes: 'Recited 2 pages calmly',
    xp: 25,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 's-2002',
    date: yesterdayStr,
    startTime: '07:15',
    endTime: '08:00',
    title: 'English Vocabulary & Pronunciation',
    category: 'learning',
    completed: true,
    notes: 'Practiced active sentence construction',
    xp: 20,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 's-2003',
    date: yesterdayStr,
    startTime: '09:30',
    endTime: '12:30',
    title: 'Core Project Coding & Architecture',
    category: 'work',
    completed: true,
    notes: 'Zero distraction block completed',
    xp: 35,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 's-2004',
    date: yesterdayStr,
    startTime: '17:00',
    endTime: '17:45',
    title: 'Outdoor Walking & Fresh Air',
    category: 'health',
    completed: true,
    notes: '6,500 steps brisk walk',
    xp: 25,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 's-2005',
    date: yesterdayStr,
    startTime: '21:00',
    endTime: '21:30',
    title: 'Evening Progression Review & Reading',
    category: 'personal',
    completed: true,
    notes: 'Reflected on daily wins',
    xp: 20,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  // Today
  {
    id: 's-3001',
    date: todayStr,
    startTime: '06:00',
    endTime: '06:45',
    title: 'Morning Prayer & Quran Recitation',
    category: 'spiritual',
    completed: true,
    notes: 'Started early with Quran recitation (٢ لاپەڕە قوران)',
    xp: 25,
    createdAt: new Date().toISOString()
  },
  {
    id: 's-3002',
    date: todayStr,
    startTime: '07:15',
    endTime: '08:00',
    title: 'English Vocabulary & Daily Sentences',
    category: 'learning',
    completed: true,
    notes: 'Mastered 3 new words and idioms (٣ وشەی ئینگلیزی)',
    xp: 20,
    createdAt: new Date().toISOString()
  },
  {
    id: 's-3003',
    date: todayStr,
    startTime: '09:30',
    endTime: '12:30',
    title: 'Focused Work & Deep Execution',
    category: 'work',
    completed: false,
    notes: 'Prioritize top high-impact objectives',
    xp: 35,
    createdAt: new Date().toISOString()
  },
  {
    id: 's-3004',
    date: todayStr,
    startTime: '16:30',
    endTime: '17:30',
    title: 'Physical Workout & Body Conditioning',
    category: 'health',
    completed: false,
    notes: 'Mobility, pushups, core, and hydration',
    xp: 30,
    createdAt: new Date().toISOString()
  },
  {
    id: 's-3005',
    date: todayStr,
    startTime: '20:30',
    endTime: '21:15',
    title: 'Evening Reflection & Personal Growth Review',
    category: 'personal',
    completed: false,
    notes: 'Log daily progression score and schedule tomorrow',
    xp: 20,
    createdAt: new Date().toISOString()
  }
];

// Level titles and XP thresholds
const LEVEL_TIERS = [
  { level: 1, title: 'Novice Explorer', minXp: 0, maxXp: 150 },
  { level: 2, title: 'Dedicated Builder', minXp: 150, maxXp: 350 },
  { level: 3, title: 'Rising Achiever', minXp: 350, maxXp: 650 },
  { level: 4, title: 'Disciplined Master', minXp: 650, maxXp: 1100 },
  { level: 5, title: 'Peak Performer', minXp: 1100, maxXp: 1800 },
  { level: 6, title: 'Unstoppable Force', minXp: 1800, maxXp: 99999 }
];

function getLevelInfo(xp) {
  let tier = LEVEL_TIERS[0];
  for (const t of LEVEL_TIERS) {
    if (xp >= t.minXp) {
      tier = t;
    }
  }
  const nextTier = LEVEL_TIERS.find(t => t.level === tier.level + 1) || tier;
  const xpIntoLevel = xp - tier.minXp;
  const levelSpan = Math.max(1, (nextTier.minXp || tier.maxXp) - tier.minXp);
  const percentage = Math.min(100, Math.round((xpIntoLevel / levelSpan) * 100));

  return {
    level: tier.level,
    title: tier.title,
    currentXp: xp,
    minXp: tier.minXp,
    nextLevelXp: nextTier.minXp || tier.maxXp,
    xpToNext: Math.max(0, (nextTier.minXp || tier.maxXp) - xp),
    percentage
  };
}

// Default initial progression
const defaultProgression = {
  xp: 360,
  reflections: {
    [yesterdayStr]: {
      mood: 'energized',
      notes: 'Strong day! Completed all routine activities and stayed disciplined.'
    },
    [todayStr]: {
      mood: 'focused',
      notes: 'Morning habits completed on time. Keeping momentum forward!'
    }
  },
  milestones: [
    { id: 'first_activity', title: 'First Step', desc: 'Completed your first scheduled activity', icon: '🎯', unlocked: true },
    { id: 'morning_momentum', title: 'Morning Momentum', desc: 'Finished morning routine before 08:00 AM', icon: '🌅', unlocked: true },
    { id: 'streak_3', title: '3-Day Consistency', desc: 'Maintained activity for 3 days in a row', icon: '🔥', unlocked: true },
    { id: 'polymath', title: 'Holistic Growth', desc: 'Completed activities in 3+ distinct categories', icon: '⚖️', unlocked: true },
    { id: 'streak_7', title: 'Week Champion', desc: 'Hold an unbroken 7-day consistency streak', icon: '👑', unlocked: false },
    { id: 'xp_1000', title: 'Millennium Achiever', desc: 'Accumulate 1,000 Total Progression XP', icon: '💎', unlocked: false }
  ]
};

// Helpers for Reading/Writing files
function readJson(filePath, defaultVal) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2), 'utf-8');
      return defaultVal;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultVal;
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

function readTodos() {
  return readJson(TODOS_FILE, defaultTodos);
}

function writeTodos(todos) {
  return writeJson(TODOS_FILE, todos);
}

function readSchedules() {
  return readJson(SCHEDULE_FILE, defaultSchedules);
}

function writeSchedules(schedules) {
  return writeJson(SCHEDULE_FILE, schedules);
}

function readProgression() {
  return readJson(PROGRESSION_FILE, defaultProgression);
}

function writeProgression(prog) {
  return writeJson(PROGRESSION_FILE, prog);
}

// Calculate streaks from schedules and todos
function calculateStreaks(schedules, todos) {
  const activeDaysSet = new Set();

  schedules.forEach(s => {
    if (s.completed && s.date) {
      activeDaysSet.add(s.date);
    }
  });

  todos.forEach(t => {
    if (t.completed && t.createdAt) {
      activeDaysSet.add(getIsoDate(new Date(t.createdAt)));
    }
  });

  const sortedDays = Array.from(activeDaysSet).sort().reverse();
  if (sortedDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Calculate current streak
  const today = getIsoDate();
  const yesterday = shiftIsoDate(today, -1);
  
  let currentStreak = 0;
  let checkDateStr = today;
  
  // If today isn't active yet, start checking from yesterday to keep streak alive
  if (!activeDaysSet.has(today)) {
    if (activeDaysSet.has(yesterday)) {
      checkDateStr = yesterday;
    } else {
      checkDateStr = null;
    }
  }

  if (checkDateStr) {
    while (activeDaysSet.has(checkDateStr)) {
      currentStreak++;
      checkDateStr = shiftIsoDate(checkDateStr, -1);
    }
  }

  // Calculate longest streak across all recorded days
  let longestStreak = 0;
  let tempStreak = 0;
  const allDaysSortedAsc = Array.from(activeDaysSet).sort();

  for (let i = 0; i < allDaysSortedAsc.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const expectedPrev = shiftIsoDate(allDaysSortedAsc[i], -1);
      if (allDaysSortedAsc[i - 1] === expectedPrev) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  return { currentStreak, longestStreak };
}

// Update milestones and progression
function refreshProgressionStatus(deltaXp = 0) {
  const prog = readProgression();
  const schedules = readSchedules();
  const todos = readTodos();

  prog.xp = Math.max(0, (prog.xp || 0) + deltaXp);

  const { currentStreak, longestStreak } = calculateStreaks(schedules, todos);
  prog.currentStreak = currentStreak;
  prog.longestStreak = Math.max(longestStreak, currentStreak);

  const completedActivities = schedules.filter(s => s.completed);
  const categoriesPresent = new Set(completedActivities.map(s => s.category));

  if (!prog.milestones) prog.milestones = defaultProgression.milestones;

  prog.milestones.forEach(m => {
    if (m.id === 'first_activity' && (completedActivities.length > 0 || todos.some(t => t.completed))) {
      m.unlocked = true;
    }
    if (m.id === 'streak_3' && prog.currentStreak >= 3) {
      m.unlocked = true;
    }
    if (m.id === 'streak_7' && (prog.currentStreak >= 7 || prog.longestStreak >= 7)) {
      m.unlocked = true;
    }
    if (m.id === 'polymath' && categoriesPresent.size >= 3) {
      m.unlocked = true;
    }
    if (m.id === 'morning_momentum' && completedActivities.some(s => s.startTime && s.startTime < '08:00')) {
      m.unlocked = true;
    }
    if (m.id === 'xp_1000' && prog.xp >= 1000) {
      m.unlocked = true;
    }
  });

  writeProgression(prog);
  return prog;
}

// ==========================================
// --- API Endpoints ---
// ==========================================

// ------------------------------------------
// 1. TODOS (Task Management)
// ------------------------------------------

app.get('/api/todos', (req, res) => {
  const todos = readTodos();
  res.json({ success: true, data: todos });
});

app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ success: false, error: 'Task title is required.' });
  }

  const todos = readTodos();
  const newTodo = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.unshift(newTodo);
  writeTodos(todos);

  res.status(201).json({ success: true, data: newTodo });
});

app.delete('/api/todos/completed', (req, res) => {
  const todos = readTodos();
  const remaining = todos.filter((todo) => !todo.completed);
  const deletedCount = todos.length - remaining.length;
  writeTodos(remaining);

  res.json({ success: true, count: deletedCount });
});

app.patch('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { completed, title } = req.body;

  const todos = readTodos();
  const todoIndex = todos.findIndex((t) => t.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ success: false, error: 'Todo not found.' });
  }

  let xpDiff = 0;
  if (typeof completed === 'boolean') {
    if (completed && !todos[todoIndex].completed) {
      xpDiff = 15; // +15 XP for completing a task
    } else if (!completed && todos[todoIndex].completed) {
      xpDiff = -15;
    }
    todos[todoIndex].completed = completed;
    todos[todoIndex].updatedAt = new Date().toISOString();
  }

  if (typeof title === 'string' && title.trim()) {
    todos[todoIndex].title = title.trim();
    todos[todoIndex].updatedAt = new Date().toISOString();
  }

  writeTodos(todos);

  if (xpDiff !== 0) {
    refreshProgressionStatus(xpDiff);
  }

  res.json({ success: true, data: todos[todoIndex] });
});

app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const todos = readTodos();
  const initialLength = todos.length;
  const filtered = todos.filter((t) => t.id !== id);

  if (filtered.length === initialLength) {
    return res.status(404).json({ success: false, error: 'Todo not found.' });
  }

  writeTodos(filtered);
  res.json({ success: true, message: 'Todo deleted successfully.' });
});

// ------------------------------------------
// 2. DAILY SCHEDULE (Time-Blocked Progression)
// ------------------------------------------

// GET /api/schedule?date=YYYY-MM-DD
app.get('/api/schedule', (req, res) => {
  const { date, month } = req.query;
  const schedules = readSchedules();

  let filtered = schedules;
  if (date) {
    filtered = schedules.filter(s => s.date === date);
  } else if (month) {
    filtered = schedules.filter(s => s.date && s.date.startsWith(month));
  }

  // Sort by startTime ascending
  filtered.sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

  res.json({ success: true, data: filtered });
});

// POST /api/schedule
app.post('/api/schedule', (req, res) => {
  const { title, date, startTime, endTime, category, notes, xp } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ success: false, error: 'Schedule title is required.' });
  }

  const schedules = readSchedules();
  const newSchedule = {
    id: 's-' + Date.now().toString() + Math.random().toString(36).substring(2, 5),
    date: date || getIsoDate(),
    startTime: startTime || '09:00',
    endTime: endTime || '10:00',
    title: title.trim(),
    category: category || 'personal', // spiritual, learning, health, work, personal
    completed: false,
    notes: (notes || '').trim(),
    xp: typeof xp === 'number' ? xp : 25,
    createdAt: new Date().toISOString()
  };

  schedules.push(newSchedule);
  writeSchedules(schedules);

  res.status(201).json({ success: true, data: newSchedule });
});

// PATCH /api/schedule/:id
app.patch('/api/schedule/:id', (req, res) => {
  const { id } = req.params;
  const { completed, title, startTime, endTime, category, notes, xp } = req.body;

  const schedules = readSchedules();
  const index = schedules.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Schedule item not found.' });
  }

  const item = schedules[index];
  let xpDiff = 0;

  if (typeof completed === 'boolean') {
    const itemXp = item.xp || 25;
    if (completed && !item.completed) {
      xpDiff = itemXp;
    } else if (!completed && item.completed) {
      xpDiff = -itemXp;
    }
    item.completed = completed;
    item.completedAt = completed ? new Date().toISOString() : null;
  }

  if (typeof title === 'string' && title.trim()) item.title = title.trim();
  if (typeof startTime === 'string') item.startTime = startTime;
  if (typeof endTime === 'string') item.endTime = endTime;
  if (typeof category === 'string') item.category = category;
  if (typeof notes === 'string') item.notes = notes.trim();
  if (typeof xp === 'number') item.xp = xp;

  item.updatedAt = new Date().toISOString();
  writeSchedules(schedules);

  let updatedProg = null;
  if (xpDiff !== 0) {
    updatedProg = refreshProgressionStatus(xpDiff);
  }

  res.json({ success: true, data: item, progression: updatedProg });
});

// DELETE /api/schedule/:id
app.delete('/api/schedule/:id', (req, res) => {
  const { id } = req.params;
  const schedules = readSchedules();
  const initialLen = schedules.length;
  const filtered = schedules.filter(s => s.id !== id);

  if (filtered.length === initialLen) {
    return res.status(404).json({ success: false, error: 'Schedule item not found.' });
  }

  writeSchedules(filtered);
  res.json({ success: true, message: 'Schedule item deleted successfully.' });
});

// POST /api/schedule/copy-day (Copies template or previous day)
app.post('/api/schedule/copy-day', (req, res) => {
  const { sourceDate, targetDate } = req.body;
  if (!sourceDate || !targetDate) {
    return res.status(400).json({ success: false, error: 'Both sourceDate and targetDate are required.' });
  }

  const schedules = readSchedules();
  const sourceItems = schedules.filter(s => s.date === sourceDate);

  if (sourceItems.length === 0) {
    return res.status(404).json({ success: false, error: 'No schedule items found for source date.' });
  }

  const newItems = sourceItems.map(item => ({
    id: 's-' + Date.now().toString() + Math.random().toString(36).substring(2, 5),
    date: targetDate,
    startTime: item.startTime,
    endTime: item.endTime,
    title: item.title,
    category: item.category,
    completed: false,
    notes: item.notes || '',
    xp: item.xp || 25,
    createdAt: new Date().toISOString()
  }));

  schedules.push(...newItems);
  writeSchedules(schedules);

  res.status(201).json({ success: true, count: newItems.length, data: newItems });
});

// ------------------------------------------
// 3. MONTHLY TRACKER (Calendar Heatmap & Activity Matrix)
// ------------------------------------------

// GET /api/monthly-tracker?year=YYYY&month=M (1-12)
app.get('/api/monthly-tracker', (req, res) => {
  const now = new Date();
  const year = parseInt(req.query.year, 10) || now.getFullYear();
  const month = parseInt(req.query.month, 10) || (now.getMonth() + 1);

  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const daysInMonth = new Date(year, month, 0).getDate();

  const schedules = readSchedules();
  const todos = readTodos();
  const prog = readProgression();

  // Filter schedules for this month
  const monthSchedules = schedules.filter(s => s.date && s.date.startsWith(monthStr));

  // Build daily data map
  const daysMap = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${monthStr}-${String(d).padStart(2, '0')}`;
    daysMap[dateStr] = {
      day: d,
      date: dateStr,
      dayOfWeek: new Date(year, month - 1, d).toLocaleDateString(undefined, { weekday: 'short' }),
      total: 0,
      completed: 0,
      percentage: 0,
      xpEarned: 0,
      activities: []
    };
  }

  // Populate schedules into daysMap
  monthSchedules.forEach(s => {
    if (daysMap[s.date]) {
      const entry = daysMap[s.date];
      entry.total++;
      if (s.completed) {
        entry.completed++;
        entry.xpEarned += (s.xp || 25);
      }
      entry.activities.push({
        id: s.id,
        title: s.title,
        startTime: s.startTime,
        endTime: s.endTime,
        category: s.category,
        completed: s.completed
      });
    }
  });

  // Calculate percentages and statistics
  let totalScheduled = 0;
  let totalCompleted = 0;
  let activeDaysCount = 0;
  let totalXpEarned = 0;

  const categoryBreakdown = {
    spiritual: { title: 'Spiritual & Faith', total: 0, completed: 0, color: '#8b5cf6' },
    learning: { title: 'Learning & Skills', total: 0, completed: 0, color: '#3b82f6' },
    health: { title: 'Health & Fitness', total: 0, completed: 0, color: '#10b981' },
    work: { title: 'Deep Work & Career', total: 0, completed: 0, color: '#f59e0b' },
    personal: { title: 'Personal Routine', total: 0, completed: 0, color: '#ec4899' }
  };

  monthSchedules.forEach(s => {
    const cat = categoryBreakdown[s.category] || categoryBreakdown.personal;
    cat.total++;
    if (s.completed) cat.completed++;
  });

  const calendarDays = Object.values(daysMap).map(entry => {
    entry.percentage = entry.total > 0 ? Math.round((entry.completed / entry.total) * 100) : 0;
    totalScheduled += entry.total;
    totalCompleted += entry.completed;
    totalXpEarned += entry.xpEarned;
    if (entry.completed > 0) activeDaysCount++;
    return entry;
  });

  const overallCompletionRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
  const streaks = calculateStreaks(schedules, todos);

  // Habit consistency matrix for key recurring activities
  const distinctHabitTitles = Array.from(new Set(monthSchedules.map(s => s.title.trim())));
  const habitMatrix = distinctHabitTitles.slice(0, 6).map(title => {
    const daysStatus = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${monthStr}-${String(d).padStart(2, '0')}`;
      const found = monthSchedules.find(s => s.date === dateStr && s.title.trim() === title);
      daysStatus.push({
        day: d,
        scheduled: !!found,
        completed: found ? found.completed : false
      });
    }
    const completedCount = daysStatus.filter(x => x.completed).length;
    return {
      title,
      completedCount,
      days: daysStatus
    };
  });

  res.json({
    success: true,
    data: {
      year,
      month,
      monthName: new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'long' }),
      daysInMonth,
      calendarDays,
      summary: {
        totalScheduled,
        totalCompleted,
        overallCompletionRate,
        activeDaysCount,
        totalXpEarned,
        currentStreak: streaks.currentStreak,
        longestStreak: streaks.longestStreak
      },
      categoryBreakdown,
      habitMatrix
    }
  });
});

// ------------------------------------------
// 4. PERSON PROGRESSION & REFLECTION HUB
// ------------------------------------------

// GET /api/progression
app.get('/api/progression', (req, res) => {
  const prog = readProgression();
  const schedules = readSchedules();
  const todos = readTodos();
  const streaks = calculateStreaks(schedules, todos);

  prog.currentStreak = streaks.currentStreak;
  prog.longestStreak = Math.max(streaks.longestStreak, prog.longestStreak || 0);

  const levelInfo = getLevelInfo(prog.xp || 0);

  res.json({
    success: true,
    data: {
      ...prog,
      levelInfo,
      totalCompletedActivities: schedules.filter(s => s.completed).length,
      totalCompletedTasks: todos.filter(t => t.completed).length
    }
  });
});

// POST /api/progression/reflection
app.post('/api/progression/reflection', (req, res) => {
  const { date, mood, notes } = req.body;
  const targetDate = date || getIsoDate();

  const prog = readProgression();
  if (!prog.reflections) prog.reflections = {};

  const isNew = !prog.reflections[targetDate];
  prog.reflections[targetDate] = {
    mood: mood || 'neutral',
    notes: (notes || '').trim(),
    updatedAt: new Date().toISOString()
  };

  // Award +10 XP for daily reflection journal
  let addedXp = 0;
  if (isNew) {
    addedXp = 10;
    prog.xp = (prog.xp || 0) + addedXp;
  }

  writeProgression(prog);
  const updated = refreshProgressionStatus(0);

  res.json({
    success: true,
    addedXp,
    data: {
      ...updated,
      levelInfo: getLevelInfo(updated.xp)
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`CleanFlow Progression & Daily Schedule server running at http://localhost:${PORT}`);
});
