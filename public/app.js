/**
 * CleanFlow — Personal Progression, Daily Schedule & Monthly Tracker
 * Client-Side Controller & API Integration
 */

// Application State
let todos = [];
let currentFilter = 'all';
let lastDeletedTodo = null;
let deferredPrompt = null;

let currentView = 'schedule'; // 'schedule' | 'tracker' | 'progression' | 'tasks'
let selectedScheduleDate = getIsoDate(new Date());
let scheduleItems = [];
let currentProgression = null;
let currentMonthlyData = null;
let trackerYear = new Date().getFullYear();
let trackerMonth = new Date().getMonth() + 1;
let selectedMood = 'focused';

// DOM Elements Cache
const elements = {
  body: document.body,
  installAppBtn: document.getElementById('install-app-btn'),
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  currentDate: document.getElementById('current-date'),
  toastContainer: document.getElementById('toast-container'),
  footerSummary: document.getElementById('footer-summary'),

  // Header Progression Pill
  headerProgPill: document.getElementById('header-prog-pill'),
  pillLevelBadge: document.getElementById('pill-level-badge'),
  pillStreakBadge: document.getElementById('pill-streak-badge'),
  pillXpBadge: document.getElementById('pill-xp-badge'),

  // Primary Navigation
  navTabs: document.querySelectorAll('.nav-tab'),
  views: {
    schedule: document.getElementById('view-schedule'),
    tracker: document.getElementById('view-tracker'),
    progression: document.getElementById('view-progression'),
    tasks: document.getElementById('view-tasks')
  },

  // Daily Schedule View
  schedPrevDayBtn: document.getElementById('sched-prev-day-btn'),
  schedNextDayBtn: document.getElementById('sched-next-day-btn'),
  schedDisplayDate: document.getElementById('sched-display-date'),
  schedTodayBadge: document.getElementById('sched-today-badge'),
  schedDatePicker: document.getElementById('sched-date-picker'),
  schedProgressText: document.getElementById('sched-progress-text'),
  schedPercentageText: document.getElementById('sched-percentage-text'),
  schedBarFill: document.getElementById('sched-bar-fill'),
  schedCopyYesterdayBtn: document.getElementById('sched-copy-yesterday-btn'),
  scheduleForm: document.getElementById('schedule-form'),
  schedTitleInput: document.getElementById('sched-title-input'),
  schedStartTime: document.getElementById('sched-start-time'),
  schedEndTime: document.getElementById('sched-end-time'),
  schedNotesInput: document.getElementById('sched-notes-input'),
  schedCategoryRadios: document.querySelectorAll('input[name="schedCategory"]'),
  quickPickBtns: document.querySelectorAll('.quick-pick-btn'),
  scheduleItemsList: document.getElementById('schedule-items-list'),
  scheduleEmptyState: document.getElementById('schedule-empty-state'),
  liveTimeIndicator: document.getElementById('live-time-indicator'),
  liveTimeBadge: document.getElementById('live-time-badge'),

  // Monthly Tracker View
  trackerPrevMonthBtn: document.getElementById('tracker-prev-month-btn'),
  trackerNextMonthBtn: document.getElementById('tracker-next-month-btn'),
  trackerMonthHeading: document.getElementById('tracker-month-heading'),
  trackerMonthSubtitle: document.getElementById('tracker-month-subtitle'),
  kpiCurrentStreak: document.getElementById('kpi-current-streak'),
  kpiLongestStreak: document.getElementById('kpi-longest-streak'),
  kpiMonthlyRate: document.getElementById('kpi-monthly-rate'),
  kpiActivitiesCount: document.getElementById('kpi-activities-count'),
  kpiActiveDays: document.getElementById('kpi-active-days'),
  kpiXpEarned: document.getElementById('kpi-xp-earned'),
  trackerCalendarGrid: document.getElementById('tracker-calendar-grid'),
  habitMatrixContainer: document.getElementById('habit-matrix-container'),
  categoryBarsList: document.getElementById('category-bars-list'),

  // Progression Hub View
  heroLevelNum: document.getElementById('hero-level-num'),
  heroTierTitle: document.getElementById('hero-tier-title'),
  heroMotivationText: document.getElementById('hero-motivation-text'),
  heroCurrentXp: document.getElementById('hero-current-xp'),
  heroTargetXp: document.getElementById('hero-target-xp'),
  heroXpBar: document.getElementById('hero-xp-bar'),
  heroRemainingText: document.getElementById('hero-remaining-text'),
  progStatActivities: document.getElementById('prog-stat-activities'),
  progStatStreak: document.getElementById('prog-stat-streak'),
  progStatTasks: document.getElementById('prog-stat-tasks'),
  progStatLevel: document.getElementById('prog-stat-level'),
  milestonesGrid: document.getElementById('milestones-grid'),
  reflectionForm: document.getElementById('reflection-form'),
  moodBtns: document.querySelectorAll('.mood-btn'),
  reflectionInput: document.getElementById('reflection-input'),
  recentReflectionsList: document.getElementById('recent-reflections-list'),

  // Tasks View
  todoForm: document.getElementById('todo-form'),
  taskInput: document.getElementById('task-input'),
  todoList: document.getElementById('todo-list'),
  emptyState: document.getElementById('empty-state'),
  emptyTitle: document.getElementById('empty-state-title'),
  emptySubtitle: document.getElementById('empty-state-subtitle'),
  progressBarFill: document.getElementById('progress-bar-fill'),
  progressText: document.getElementById('progress-text'),
  progressPercentage: document.getElementById('progress-percentage'),
  filterTabs: document.querySelectorAll('.tab-btn'),
  countAll: document.getElementById('count-all'),
  countActive: document.getElementById('count-active'),
  countCompleted: document.getElementById('count-completed'),
  clearCompletedBtn: document.getElementById('clear-completed-btn')
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderDate();
  initNavigation();
  initPWA();

  // Attach event handlers
  attachScheduleListeners();
  attachTrackerListeners();
  attachProgressionListeners();
  attachTaskListeners();

  // Initial Data Loads
  loadProgression();
  loadSchedule(selectedScheduleDate);
  loadMonthlyTracker(trackerYear, trackerMonth);
  loadTodos();

  // Start live clock indicator
  updateLiveTimeIndicator();
  setInterval(updateLiveTimeIndicator, 30000);
});

// Helper: Format Date to YYYY-MM-DD
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

// 1. Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('cleanflow-theme') ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'theme-dark' : 'theme-light');

  elements.body.className = savedTheme;

  if (elements.themeToggleBtn) {
    elements.themeToggleBtn.addEventListener('click', () => {
      const isDark = elements.body.classList.contains('theme-dark');
      const newTheme = isDark ? 'theme-light' : 'theme-dark';
      elements.body.className = newTheme;
      localStorage.setItem('cleanflow-theme', newTheme);
    });
  }
}

// 2. Date Formatting in Header
function renderDate() {
  const now = new Date();
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  if (elements.currentDate) {
    elements.currentDate.textContent = now.toLocaleDateString(undefined, options);
  }
}

// 3. Navigation between Views
function initNavigation() {
  elements.navTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const viewKey = tab.dataset.view;
      switchView(viewKey);
    });
  });

  // Clicking Header Progression Pill jumps straight to Progression Hub
  if (elements.headerProgPill) {
    elements.headerProgPill.addEventListener('click', () => {
      switchView('progression');
    });
  }
}

function switchView(viewKey) {
  currentView = viewKey;

  // Update tabs active state
  elements.navTabs.forEach((tab) => {
    const isActive = tab.dataset.view === viewKey;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // Toggle view visibility
  Object.keys(elements.views).forEach((key) => {
    const viewEl = elements.views[key];
    if (viewEl) {
      if (key === viewKey) {
        viewEl.style.display = 'flex';
      } else {
        viewEl.style.display = 'none';
      }
    }
  });

  // Specific refresh actions
  if (viewKey === 'schedule') {
    loadSchedule(selectedScheduleDate);
  } else if (viewKey === 'tracker') {
    loadMonthlyTracker(trackerYear, trackerMonth);
  } else if (viewKey === 'progression') {
    loadProgression();
  } else if (viewKey === 'tasks') {
    loadTodos();
  }
}

// ========================================================
// --- PROGRESSION HUB & HEADER PILL ---
// ========================================================

async function loadProgression() {
  try {
    const res = await fetch('/api/progression');
    const data = await res.json();
    if (data.success) {
      currentProgression = data.data;
      renderProgressionPill(currentProgression);
      renderProgressionHub(currentProgression);
    }
  } catch (err) {
    console.error('Error loading progression:', err);
  }
}

function renderProgressionPill(prog) {
  if (!prog || !prog.levelInfo) return;
  const { level, currentXp } = prog.levelInfo;
  const streak = prog.currentStreak || 0;

  if (elements.pillLevelBadge) elements.pillLevelBadge.textContent = `Lvl ${level}`;
  if (elements.pillStreakBadge) elements.pillStreakBadge.textContent = `🔥 ${streak}d`;
  if (elements.pillXpBadge) elements.pillXpBadge.textContent = `${currentXp} XP`;
}

function renderProgressionHub(prog) {
  if (!prog || !prog.levelInfo) return;
  const { level, title, currentXp, nextLevelXp, xpToNext, percentage } = prog.levelInfo;

  if (elements.heroLevelNum) elements.heroLevelNum.textContent = level;
  if (elements.heroTierTitle) elements.heroTierTitle.textContent = title;
  if (elements.heroCurrentXp) elements.heroCurrentXp.textContent = `${currentXp} XP`;
  if (elements.heroTargetXp) elements.heroTargetXp.textContent = `${nextLevelXp} XP (Level ${level + 1})`;
  if (elements.heroXpBar) elements.heroXpBar.style.width = `${percentage}%`;
  if (elements.heroRemainingText) {
    elements.heroRemainingText.textContent = xpToNext > 0
      ? `${xpToNext} XP needed for next tier`
      : 'Max tier achieved!';
  }

  // Counters
  if (elements.progStatActivities) elements.progStatActivities.textContent = prog.totalCompletedActivities || 0;
  if (elements.progStatStreak) elements.progStatStreak.textContent = `${prog.currentStreak || 0}d`;
  if (elements.progStatTasks) elements.progStatTasks.textContent = prog.totalCompletedTasks || 0;
  if (elements.progStatLevel) elements.progStatLevel.textContent = `Lvl ${level}`;

  // Milestones
  if (elements.milestonesGrid && prog.milestones) {
    elements.milestonesGrid.innerHTML = '';
    prog.milestones.forEach((m) => {
      const card = document.createElement('div');
      card.className = `milestone-card ${m.unlocked ? 'unlocked' : 'locked'}`;
      card.innerHTML = `
        <div class="milestone-icon">${m.icon || '🏆'}</div>
        <div class="milestone-info">
          <div class="milestone-title">${m.title} ${m.unlocked ? '✓' : '🔒'}</div>
          <div class="milestone-desc">${m.desc}</div>
        </div>
      `;
      elements.milestonesGrid.appendChild(card);
    });
  }

  // Reflections List
  if (elements.recentReflectionsList && prog.reflections) {
    elements.recentReflectionsList.innerHTML = '';
    const dates = Object.keys(prog.reflections).sort().reverse();
    if (dates.length === 0) {
      elements.recentReflectionsList.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-muted);">No reflection entries yet. Record your first insight above!</p>`;
    } else {
      dates.forEach((dateKey) => {
        const item = prog.reflections[dateKey];
        const row = document.createElement('div');
        row.className = 'reflection-item';
        row.innerHTML = `
          <div class="ref-header">
            <span class="ref-date">${formatFriendlyDate(dateKey)}</span>
            <span class="ref-mood-badge">${getMoodEmoji(item.mood)} ${item.mood}</span>
          </div>
          <p class="ref-notes">${escapeHtml(item.notes || 'No notes added.')}</p>
        `;
        elements.recentReflectionsList.appendChild(row);
      });
    }
  }
}

function getMoodEmoji(mood) {
  switch (mood) {
    case 'focused': return '🎯';
    case 'energized': return '⚡';
    case 'calm': return '😌';
    case 'tired': return '😴';
    default: return '🌟';
  }
}

function attachProgressionListeners() {
  // Mood selection buttons
  elements.moodBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      elements.moodBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMood = btn.dataset.mood;
    });
  });

  // Reflection form submit
  if (elements.reflectionForm) {
    elements.reflectionForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const notes = elements.reflectionInput.value.trim();
      if (!notes) {
        showToast('Please enter your daily reflection notes', null, true);
        return;
      }

      try {
        const res = await fetch('/api/progression/reflection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: selectedScheduleDate,
            mood: selectedMood,
            notes
          })
        });
        const data = await res.json();
        if (data.success) {
          elements.reflectionInput.value = '';
          currentProgression = data.data;
          renderProgressionPill(currentProgression);
          renderProgressionHub(currentProgression);
          showToast(`Reflection saved! +${data.addedXp || 10} XP gained 🎉`);
        } else {
          showToast('Failed to save reflection', null, true);
        }
      } catch (err) {
        showToast('Network error while saving reflection', null, true);
      }
    });
  }
}

// ========================================================
// --- DAILY SCHEDULE CONTROLLER ---
// ========================================================

function attachScheduleListeners() {
  // Date navigation: Prev Day
  if (elements.schedPrevDayBtn) {
    elements.schedPrevDayBtn.addEventListener('click', () => {
      selectedScheduleDate = shiftIsoDate(selectedScheduleDate, -1);
      loadSchedule(selectedScheduleDate);
    });
  }

  // Date navigation: Next Day
  if (elements.schedNextDayBtn) {
    elements.schedNextDayBtn.addEventListener('click', () => {
      selectedScheduleDate = shiftIsoDate(selectedScheduleDate, 1);
      loadSchedule(selectedScheduleDate);
    });
  }

  // Today jump button
  if (elements.schedTodayBadge) {
    elements.schedTodayBadge.addEventListener('click', () => {
      selectedScheduleDate = getIsoDate(new Date());
      loadSchedule(selectedScheduleDate);
    });
  }

  // Hidden date picker
  if (elements.schedDisplayDate && elements.schedDatePicker) {
    elements.schedDisplayDate.addEventListener('click', () => {
      elements.schedDatePicker.showPicker ? elements.schedDatePicker.showPicker() : elements.schedDatePicker.click();
    });

    elements.schedDatePicker.addEventListener('change', (e) => {
      if (e.target.value) {
        selectedScheduleDate = e.target.value;
        loadSchedule(selectedScheduleDate);
      }
    });
  }

  // Quick Pick Habit Buttons
  elements.quickPickBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const { title, cat, start, end } = btn.dataset;
      if (elements.schedTitleInput) elements.schedTitleInput.value = title;
      if (elements.schedStartTime) elements.schedStartTime.value = start || '09:00';
      if (elements.schedEndTime) elements.schedEndTime.value = end || '10:00';

      const radio = document.querySelector(`input[name="schedCategory"][value="${cat}"]`);
      if (radio) radio.checked = true;

      if (elements.schedTitleInput) elements.schedTitleInput.focus();
    });
  });

  // Copy Yesterday's Schedule
  if (elements.schedCopyYesterdayBtn) {
    elements.schedCopyYesterdayBtn.addEventListener('click', async () => {
      const yesterday = shiftIsoDate(selectedScheduleDate, -1);

      try {
        const res = await fetch('/api/schedule/copy-day', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceDate: yesterday,
            targetDate: selectedScheduleDate
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Copied ${data.count} activities from yesterday!`);
          loadSchedule(selectedScheduleDate);
        } else {
          showToast(data.error || 'No activities found from yesterday to copy', null, true);
        }
      } catch (err) {
        showToast('Network error while copying schedule', null, true);
      }
    });
  }

  // Schedule Form Submit
  if (elements.scheduleForm) {
    elements.scheduleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = elements.schedTitleInput.value.trim();
      if (!title) return;

      const startTime = elements.schedStartTime.value || '09:00';
      const endTime = elements.schedEndTime.value || '10:00';
      const notes = elements.schedNotesInput ? elements.schedNotesInput.value.trim() : '';

      let category = 'personal';
      const checkedCat = document.querySelector('input[name="schedCategory"]:checked');
      if (checkedCat) category = checkedCat.value;

      try {
        const res = await fetch('/api/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            date: selectedScheduleDate,
            startTime,
            endTime,
            category,
            notes,
            xp: 25
          })
        });
        const data = await res.json();
        if (data.success) {
          elements.schedTitleInput.value = '';
          if (elements.schedNotesInput) elements.schedNotesInput.value = '';
          showToast('Activity added to schedule!');
          loadSchedule(selectedScheduleDate);
        } else {
          showToast(data.error || 'Failed to add activity', null, true);
        }
      } catch (err) {
        showToast('Network error while scheduling activity', null, true);
      }
    });
  }
}

async function loadSchedule(dateStr) {
  try {
    const res = await fetch(`/api/schedule?date=${dateStr}`);
    const data = await res.json();
    if (data.success) {
      scheduleItems = data.data;
      renderScheduleView();
    }
  } catch (err) {
    console.error('Error loading schedule:', err);
  }
}

function renderScheduleView() {
  const isToday = selectedScheduleDate === getIsoDate(new Date());

  // Date bar
  if (elements.schedDisplayDate) {
    elements.schedDisplayDate.textContent = formatFriendlyDate(selectedScheduleDate);
  }
  if (elements.schedTodayBadge) {
    elements.schedTodayBadge.style.display = isToday ? 'none' : 'inline-block';
  }

  // Summary Metrics
  const total = scheduleItems.length;
  const completed = scheduleItems.filter((s) => s.completed).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (elements.schedProgressText) {
    elements.schedProgressText.textContent = `${completed} of ${total} activities completed`;
  }
  if (elements.schedPercentageText) {
    elements.schedPercentageText.textContent = `${pct}%`;
  }
  if (elements.schedBarFill) {
    elements.schedBarFill.style.width = `${pct}%`;
  }

  // Live time indicator
  if (elements.liveTimeIndicator) {
    elements.liveTimeIndicator.style.display = isToday ? 'flex' : 'none';
  }

  // Items List & Empty State
  if (scheduleItems.length === 0) {
    elements.scheduleItemsList.innerHTML = '';
    elements.scheduleEmptyState.style.display = 'flex';
    return;
  }

  elements.scheduleEmptyState.style.display = 'none';
  elements.scheduleItemsList.innerHTML = '';

  scheduleItems.forEach((item) => {
    const card = createScheduleCard(item);
    elements.scheduleItemsList.appendChild(card);
  });
}

function createScheduleCard(item) {
  const card = document.createElement('div');
  card.className = `schedule-card cat-${item.category || 'personal'} ${item.completed ? 'completed' : ''}`;
  card.id = `sched-item-${item.id}`;

  // Left Section (Checkbox + Content)
  const left = document.createElement('div');
  left.className = 'schedule-card-left';

  // Custom Checkbox
  const label = document.createElement('label');
  label.className = 'checkbox-container';
  label.setAttribute('title', item.completed ? 'Mark incomplete' : 'Mark complete');

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = item.completed;
  input.addEventListener('change', () => {
    toggleScheduleItem(item.id, input.checked);
  });

  const checkmark = document.createElement('span');
  checkmark.className = 'checkmark';
  checkmark.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `;

  label.appendChild(input);
  label.appendChild(checkmark);
  left.appendChild(label);

  // Content
  const content = document.createElement('div');
  content.className = 'schedule-card-content';

  const metaRow = document.createElement('div');
  metaRow.className = 'schedule-meta-row';

  const timeBadge = document.createElement('span');
  timeBadge.className = 'schedule-time-badge';
  timeBadge.textContent = `${item.startTime || '09:00'} — ${item.endTime || '10:00'}`;

  const catBadge = document.createElement('span');
  catBadge.className = `schedule-cat-badge cat-${item.category || 'personal'}`;
  catBadge.textContent = item.category || 'personal';

  const xpBadge = document.createElement('span');
  xpBadge.className = 'schedule-xp-badge';
  xpBadge.textContent = `+${item.xp || 25} XP`;

  metaRow.appendChild(timeBadge);
  metaRow.appendChild(catBadge);
  metaRow.appendChild(xpBadge);

  // Check if currently ongoing activity (for today)
  const isToday = selectedScheduleDate === getIsoDate(new Date());
  let isNow = false;
  if (isToday && item.startTime && item.endTime) {
    const now = new Date();
    const curMin = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = item.startTime.split(':').map(Number);
    const [eh, em] = item.endTime.split(':').map(Number);
    const startMin = (sh || 0) * 60 + (sm || 0);
    const endMin = (eh || 0) * 60 + (em || 0);
    isNow = !item.completed && curMin >= startMin && curMin <= endMin;
  }

  if (isNow) {
    card.classList.add('is-now');
    const nowBadge = document.createElement('span');
    nowBadge.className = 'schedule-now-badge';
    nowBadge.textContent = '● NOW';
    metaRow.appendChild(nowBadge);
  }

  const title = document.createElement('div');
  title.className = 'schedule-card-title';
  title.setAttribute('dir', 'auto');
  title.textContent = item.title;

  title.addEventListener('dblclick', () => {
    enableScheduleInlineEditing(item, content, title);
  });

  content.appendChild(metaRow);
  content.appendChild(title);

  if (item.notes) {
    const notes = document.createElement('div');
    notes.className = 'schedule-card-notes';
    notes.setAttribute('dir', 'auto');
    notes.textContent = item.notes;
    content.appendChild(notes);
  }

  left.appendChild(content);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'schedule-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'action-btn';
  editBtn.setAttribute('title', 'Edit activity');
  editBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>
  `;
  editBtn.addEventListener('click', () => {
    enableScheduleInlineEditing(item, content, title);
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'action-btn delete-btn';
  deleteBtn.setAttribute('title', 'Delete activity');
  deleteBtn.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  `;
  deleteBtn.addEventListener('click', () => {
    deleteScheduleItem(item.id, card);
  });

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  card.appendChild(left);
  card.appendChild(actions);

  return card;
}

function enableScheduleInlineEditing(item, container, titleEl) {
  const originalTitle = item.title;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'todo-edit-input';
  input.value = originalTitle;
  input.maxLength = 150;
  input.setAttribute('dir', 'auto');

  container.replaceChild(input, titleEl);
  input.focus();
  input.select();

  let isSaved = false;

  const save = () => {
    if (isSaved) return;
    isSaved = true;
    const newTitle = input.value.trim();
    if (newTitle && newTitle !== originalTitle) {
      updateScheduleItem(item.id, { title: newTitle });
    } else {
      container.replaceChild(titleEl, input);
    }
  };

  const cancel = () => {
    if (isSaved) return;
    isSaved = true;
    container.replaceChild(titleEl, input);
  };

  input.addEventListener('blur', save);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      save();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  });
}

async function updateScheduleItem(id, updates) {
  try {
    const res = await fetch(`/api/schedule/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (data.success) {
      showToast('Activity updated');
      loadSchedule(selectedScheduleDate);
      loadMonthlyTracker(trackerYear, trackerMonth);
    } else {
      showToast('Failed to update activity', null, true);
    }
  } catch (err) {
    showToast('Network error while updating activity', null, true);
  }
}

async function toggleScheduleItem(id, completed) {
  const item = scheduleItems.find((s) => s.id === id);
  if (!item) return;

  const previousState = item.completed;
  item.completed = completed;
  renderScheduleView();

  try {
    const res = await fetch(`/api/schedule/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed })
    });
    const data = await res.json();
    if (data.success) {
      if (data.progression) {
        currentProgression = data.progression;
        renderProgressionPill(currentProgression);
        renderProgressionHub(currentProgression);
      }
      showToast(completed ? `Activity completed! +${item.xp || 25} XP ⭐` : 'Activity marked incomplete');
      loadMonthlyTracker(trackerYear, trackerMonth);
    } else {
      item.completed = previousState;
      renderScheduleView();
      showToast('Failed to update activity status', null, true);
    }
  } catch (err) {
    item.completed = previousState;
    renderScheduleView();
    showToast('Network error while updating status', null, true);
  }
}

async function deleteScheduleItem(id, element) {
  if (element) {
    element.style.opacity = '0';
    element.style.transform = 'translateX(20px)';
    await new Promise((r) => setTimeout(r, 200));
  }

  scheduleItems = scheduleItems.filter((s) => s.id !== id);
  renderScheduleView();

  try {
    const res = await fetch(`/api/schedule/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('Activity deleted from schedule');
      loadMonthlyTracker(trackerYear, trackerMonth);
    } else {
      showToast('Failed to delete activity', null, true);
      loadSchedule(selectedScheduleDate);
    }
  } catch (err) {
    showToast('Network error while deleting', null, true);
    loadSchedule(selectedScheduleDate);
  }
}

// Live Time Indicator on Schedule View
function updateLiveTimeIndicator() {
  if (!elements.liveTimeBadge) return;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  elements.liveTimeBadge.textContent = timeStr;
}

// ========================================================
// --- MONTHLY TRACKER CONTROLLER ---
// ========================================================

function attachTrackerListeners() {
  if (elements.trackerPrevMonthBtn) {
    elements.trackerPrevMonthBtn.addEventListener('click', () => {
      trackerMonth--;
      if (trackerMonth < 1) {
        trackerMonth = 12;
        trackerYear--;
      }
      loadMonthlyTracker(trackerYear, trackerMonth);
    });
  }

  if (elements.trackerNextMonthBtn) {
    elements.trackerNextMonthBtn.addEventListener('click', () => {
      trackerMonth++;
      if (trackerMonth > 12) {
        trackerMonth = 1;
        trackerYear++;
      }
      loadMonthlyTracker(trackerYear, trackerMonth);
    });
  }
}

async function loadMonthlyTracker(year, month) {
  try {
    const res = await fetch(`/api/monthly-tracker?year=${year}&month=${month}`);
    const data = await res.json();
    if (data.success) {
      currentMonthlyData = data.data;
      renderMonthlyTracker(currentMonthlyData);
    }
  } catch (err) {
    console.error('Error loading monthly tracker:', err);
  }
}

function renderMonthlyTracker(data) {
  if (!data) return;

  // Month Headings
  if (elements.trackerMonthHeading) {
    elements.trackerMonthHeading.textContent = `${data.monthName} ${data.year}`;
  }

  // KPI Metrics
  const { summary } = data;
  if (elements.kpiCurrentStreak) elements.kpiCurrentStreak.textContent = `${summary.currentStreak} Days`;
  if (elements.kpiLongestStreak) elements.kpiLongestStreak.textContent = `Longest: ${summary.longestStreak} Days`;
  if (elements.kpiMonthlyRate) elements.kpiMonthlyRate.textContent = `${summary.overallCompletionRate}%`;
  if (elements.kpiActivitiesCount) elements.kpiActivitiesCount.textContent = `${summary.totalCompleted} / ${summary.totalScheduled} finished`;
  if (elements.kpiActiveDays) elements.kpiActiveDays.textContent = `${summary.activeDaysCount} Days`;
  if (elements.kpiXpEarned) elements.kpiXpEarned.textContent = `+${summary.totalXpEarned} XP`;

  // Render Calendar Heatmap Grid
  if (elements.trackerCalendarGrid) {
    elements.trackerCalendarGrid.innerHTML = '';

    // Calculate leading blanks (Monday as first day of week: Mon=1, Sun=7)
    const firstDayDate = new Date(data.year, data.month - 1, 1);
    let startDayOfWeek = firstDayDate.getDay(); // 0 is Sun, 1 is Mon...
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // 0 for Mon, 6 for Sun

    for (let i = 0; i < startDayOfWeek; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-day-cell cell-empty';
      elements.trackerCalendarGrid.appendChild(emptyCell);
    }

    const todayStr = getIsoDate(new Date());

    data.calendarDays.forEach((dayEntry) => {
      const cell = document.createElement('div');
      const isToday = dayEntry.date === todayStr;

      let lvlClass = 'cell-lvl-0';
      if (dayEntry.total > 0) {
        if (dayEntry.percentage === 100) lvlClass = 'cell-lvl-4';
        else if (dayEntry.percentage >= 75) lvlClass = 'cell-lvl-3';
        else if (dayEntry.percentage >= 50) lvlClass = 'cell-lvl-2';
        else if (dayEntry.percentage > 0) lvlClass = 'cell-lvl-1';
      }

      cell.className = `calendar-day-cell ${lvlClass} ${isToday ? 'is-today' : ''}`;
      cell.setAttribute('title', `${dayEntry.date}: ${dayEntry.completed}/${dayEntry.total} activities completed (${dayEntry.percentage}%)`);

      cell.innerHTML = `
        <span class="cell-day-num">${dayEntry.day}</span>
        ${dayEntry.total > 0 ? `<span class="cell-percentage-badge">${dayEntry.percentage}%</span>` : ''}
        <div class="cell-dots-row">
          ${dayEntry.activities.slice(0, 3).map((a) => `<span class="mini-dot" style="background:${a.completed ? '#10b981' : 'var(--text-muted)'}"></span>`).join('')}
        </div>
      `;

      // Clicking any day opens Daily Schedule for that day
      cell.addEventListener('click', () => {
        selectedScheduleDate = dayEntry.date;
        switchView('schedule');
      });

      elements.trackerCalendarGrid.appendChild(cell);
    });
  }

  // Render Habit Consistency Matrix
  if (elements.habitMatrixContainer && data.habitMatrix) {
    if (data.habitMatrix.length === 0) {
      elements.habitMatrixContainer.innerHTML = `<p style="padding: 1rem; font-size: 0.8rem; color: var(--text-muted); text-align: center;">No scheduled habits recorded yet this month.</p>`;
    } else {
      let tableHtml = `<table class="matrix-table"><thead><tr><th class="habit-col-header">Habit Activity</th>`;
      for (let d = 1; d <= data.daysInMonth; d++) {
        tableHtml += `<th>${d}</th>`;
      }
      tableHtml += `</tr></thead><tbody>`;

      data.habitMatrix.forEach((habit) => {
        tableHtml += `<tr><td class="habit-col-title">${escapeHtml(habit.title)}</td>`;
        habit.days.forEach((dayObj) => {
          let dotClass = 'matrix-dot-none';
          if (dayObj.completed) dotClass = 'matrix-dot-completed';
          else if (dayObj.scheduled) dotClass = 'matrix-dot-scheduled';

          tableHtml += `<td><span class="matrix-day-dot ${dotClass}" title="Day ${dayObj.day}: ${dayObj.completed ? 'Completed' : (dayObj.scheduled ? 'Pending' : 'Not scheduled')}"></span></td>`;
        });
        tableHtml += `</tr>`;
      });

      tableHtml += `</tbody></table>`;
      elements.habitMatrixContainer.innerHTML = tableHtml;
    }
  }

  // Render Category Distribution
  if (elements.categoryBarsList && data.categoryBreakdown) {
    elements.categoryBarsList.innerHTML = '';
    const cats = Object.keys(data.categoryBreakdown);
    cats.forEach((catKey) => {
      const cat = data.categoryBreakdown[catKey];
      const pct = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;

      const row = document.createElement('div');
      row.className = 'category-bar-row';
      row.innerHTML = `
        <div class="cat-bar-header">
          <span style="color: ${cat.color}; font-weight: 700;">${cat.title}</span>
          <span style="color: var(--text-secondary);">${cat.completed} of ${cat.total} completed (${pct}%)</span>
        </div>
        <div class="cat-bar-track">
          <div class="cat-bar-fill" style="width: ${pct}%; background: ${cat.color};"></div>
        </div>
      `;
      elements.categoryBarsList.appendChild(row);
    });
  }
}

// ========================================================
// --- TASKS CONTROLLER (CleanFlow Original Preserved) ---
// ========================================================

function attachTaskListeners() {
  if (elements.todoForm) {
    elements.todoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = elements.taskInput.value.trim();
      if (!title) return;

      elements.taskInput.disabled = true;
      await createTodo(title);
      elements.taskInput.disabled = false;
      elements.taskInput.value = '';
      elements.taskInput.focus();
    });
  }

  elements.filterTabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      elements.filterTabs.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      currentFilter = btn.dataset.filter;
      renderTodos();
    });
  });

  if (elements.clearCompletedBtn) {
    elements.clearCompletedBtn.addEventListener('click', async () => {
      const completedCount = todos.filter((t) => t.completed).length;
      if (completedCount === 0) return;

      if (confirm(`Are you sure you want to delete ${completedCount} completed task${completedCount > 1 ? 's' : ''}?`)) {
        await clearCompletedTodos();
      }
    });
  }
}

async function loadTodos() {
  try {
    const res = await fetch('/api/todos');
    const data = await res.json();
    if (data.success) {
      todos = data.data;
      renderTodos();
    } else {
      showToast('Failed to load tasks', null, true);
    }
  } catch (err) {
    console.error('Fetch todos error:', err);
    showToast('Could not connect to server', null, true);
  }
}

async function createTodo(title) {
  try {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    const data = await res.json();
    if (data.success) {
      todos.unshift(data.data);
      renderTodos();
      showToast('Task added successfully');
    } else {
      showToast(data.error || 'Failed to add task', null, true);
    }
  } catch (err) {
    showToast('Failed to add task', null, true);
  }
}

async function toggleTodo(id, completed) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  const previousState = todo.completed;
  todo.completed = completed;
  renderTodos();

  try {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed })
    });
    const data = await res.json();
    if (!data.success) {
      todo.completed = previousState;
      renderTodos();
      showToast('Failed to update task status', null, true);
    } else {
      loadProgression();
    }
  } catch (err) {
    todo.completed = previousState;
    renderTodos();
    showToast('Network error while updating task', null, true);
  }
}

async function updateTodoTitle(id, newTitle) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  const previousTitle = todo.title;
  todo.title = newTitle;
  renderTodos();

  try {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle })
    });
    const data = await res.json();
    if (!data.success) {
      todo.title = previousTitle;
      renderTodos();
      showToast('Failed to update title', null, true);
    } else {
      showToast('Task updated');
    }
  } catch (err) {
    todo.title = previousTitle;
    renderTodos();
    showToast('Network error while updating title', null, true);
  }
}

async function deleteTodo(id, element) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  lastDeletedTodo = { ...todo };

  if (element) {
    element.classList.add('deleting');
    await new Promise((r) => setTimeout(r, 220));
  }

  todos = todos.filter((t) => t.id !== id);
  renderTodos();

  try {
    const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(`Deleted "${truncate(todo.title, 25)}"`, async () => {
        if (lastDeletedTodo) {
          await createTodo(lastDeletedTodo.title);
        }
      });
    } else {
      showToast('Failed to delete task', null, true);
      loadTodos();
    }
  } catch (err) {
    showToast('Network error while deleting', null, true);
    loadTodos();
  }
}

async function clearCompletedTodos() {
  try {
    const res = await fetch('/api/todos/completed', { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      todos = todos.filter((t) => !t.completed);
      renderTodos();
      showToast(`Cleared ${data.count} completed task${data.count > 1 ? 's' : ''}`);
    } else {
      showToast('Failed to clear completed tasks', null, true);
    }
  } catch (err) {
    showToast('Network error while clearing completed', null, true);
  }
}

function renderTodos() {
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;

  if (elements.countAll) elements.countAll.textContent = totalCount;
  if (elements.countActive) elements.countActive.textContent = activeCount;
  if (elements.countCompleted) elements.countCompleted.textContent = completedCount;

  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  if (elements.progressBarFill) elements.progressBarFill.style.width = `${percentage}%`;
  if (elements.progressPercentage) elements.progressPercentage.textContent = `${percentage}%`;
  if (elements.progressText) elements.progressText.textContent = `${completedCount} of ${totalCount} completed`;

  if (elements.clearCompletedBtn) {
    elements.clearCompletedBtn.style.display = completedCount > 0 ? 'inline-flex' : 'none';
  }

  if (elements.footerSummary) {
    if (totalCount === 0) {
      elements.footerSummary.textContent = 'No tasks yet';
    } else if (activeCount === 0) {
      elements.footerSummary.textContent = '🎉 All tasks completed!';
    } else {
      elements.footerSummary.textContent = `${activeCount} task${activeCount === 1 ? '' : 's'} remaining`;
    }
  }

  let filteredTodos = todos;
  if (currentFilter === 'active') {
    filteredTodos = todos.filter((t) => !t.completed);
  } else if (currentFilter === 'completed') {
    filteredTodos = todos.filter((t) => t.completed);
  }

  if (filteredTodos.length === 0) {
    elements.todoList.innerHTML = '';
    elements.emptyState.style.display = 'flex';

    if (totalCount === 0) {
      elements.emptyTitle.textContent = 'All caught up!';
      elements.emptySubtitle.textContent = 'You have no tasks right now. Add a task above to get started.';
    } else if (currentFilter === 'active') {
      elements.emptyTitle.textContent = 'No active tasks';
      elements.emptySubtitle.textContent = 'Great job! You have finished all your active tasks.';
    } else if (currentFilter === 'completed') {
      elements.emptyTitle.textContent = 'No completed tasks yet';
      elements.emptySubtitle.textContent = 'Mark tasks as done by checking the circle beside them.';
    }
    return;
  }

  elements.emptyState.style.display = 'none';
  elements.todoList.innerHTML = '';
  filteredTodos.forEach((todo) => {
    const item = createTodoElement(todo);
    elements.todoList.appendChild(item);
  });
}

function createTodoElement(todo) {
  const li = document.createElement('li');
  li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
  li.id = `todo-${todo.id}`;

  const checkboxContainer = document.createElement('label');
  checkboxContainer.className = 'checkbox-container';
  checkboxContainer.setAttribute('title', todo.completed ? 'Mark as incomplete' : 'Mark as complete');

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = `task-check-${todo.id}`;
  input.checked = todo.completed;
  input.addEventListener('change', () => {
    toggleTodo(todo.id, input.checked);
  });

  const checkmark = document.createElement('span');
  checkmark.className = 'checkmark';
  checkmark.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `;

  checkboxContainer.appendChild(input);
  checkboxContainer.appendChild(checkmark);

  const content = document.createElement('div');
  content.className = 'todo-content';

  const titleSpan = document.createElement('span');
  titleSpan.className = 'todo-title';
  titleSpan.id = `task-title-${todo.id}`;
  titleSpan.textContent = todo.title;

  titleSpan.addEventListener('dblclick', () => {
    enableInlineEditing(todo, content, titleSpan);
  });

  const timeSpan = document.createElement('span');
  timeSpan.className = 'todo-time';
  timeSpan.textContent = formatTime(todo.createdAt);

  content.appendChild(titleSpan);
  content.appendChild(timeSpan);

  const actions = document.createElement('div');
  actions.className = 'todo-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'action-btn';
  editBtn.id = `task-edit-${todo.id}`;
  editBtn.setAttribute('aria-label', `Edit "${todo.title}"`);
  editBtn.setAttribute('title', 'Edit title');
  editBtn.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>
  `;
  editBtn.addEventListener('click', () => {
    enableInlineEditing(todo, content, titleSpan);
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'action-btn delete-btn';
  deleteBtn.id = `task-delete-${todo.id}`;
  deleteBtn.setAttribute('aria-label', `Delete "${todo.title}"`);
  deleteBtn.setAttribute('title', 'Delete task');
  deleteBtn.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  `;
  deleteBtn.addEventListener('click', () => {
    deleteTodo(todo.id, li);
  });

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(checkboxContainer);
  li.appendChild(content);
  li.appendChild(actions);

  return li;
}

function enableInlineEditing(todo, container, titleSpan) {
  const originalTitle = todo.title;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'todo-edit-input';
  input.value = originalTitle;
  input.maxLength = 150;

  container.replaceChild(input, titleSpan);
  input.focus();
  input.select();

  let isSaved = false;

  const save = () => {
    if (isSaved) return;
    isSaved = true;
    const newTitle = input.value.trim();
    if (newTitle && newTitle !== originalTitle) {
      updateTodoTitle(todo.id, newTitle);
    } else {
      container.replaceChild(titleSpan, input);
    }
  };

  const cancel = () => {
    if (isSaved) return;
    isSaved = true;
    container.replaceChild(titleSpan, input);
  };

  input.addEventListener('blur', save);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      save();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  });
}

// ========================================================
// --- UTILITIES & PWA ---
// ========================================================

function formatFriendlyDate(isoDateStr) {
  if (!isoDateStr) return '';
  const [y, m, d] = isoDateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

function formatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function truncate(str, max) {
  return str.length > max ? str.substring(0, max) + '…' : str;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message, undoCallback = null, isError = false) {
  if (!elements.toastContainer) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  if (isError) {
    toast.style.background = '#ef4444';
    toast.style.color = '#ffffff';
  }

  const textSpan = document.createElement('span');
  textSpan.textContent = message;
  toast.appendChild(textSpan);

  if (undoCallback) {
    const undoBtn = document.createElement('button');
    undoBtn.className = 'toast-undo-btn';
    undoBtn.textContent = 'Undo';
    undoBtn.addEventListener('click', () => {
      undoCallback();
      removeToast(toast);
    });
    toast.appendChild(undoBtn);
  }

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    removeToast(toast);
  }, 3500);
}

function removeToast(toast) {
  toast.classList.add('toast-leave');
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 250);
}

function initPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('ServiceWorker registration error:', err);
      });
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (elements.installAppBtn) {
      elements.installAppBtn.style.display = 'inline-flex';
    }
  });

  if (elements.installAppBtn) {
    elements.installAppBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('App installed successfully!', 'success');
      }
      deferredPrompt = null;
      elements.installAppBtn.style.display = 'none';
    });
  }

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (elements.installAppBtn) {
      elements.installAppBtn.style.display = 'none';
    }
    showToast('CleanFlow is now installed on your system!', 'success');
  });
}
