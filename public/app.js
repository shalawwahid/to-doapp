/**
 * CleanFlow To-Do App
 * Client-side Controller & API Client
 */

// Application State
let todos = [];
let currentFilter = 'all';
let lastDeletedTodo = null;
let deferredPrompt = null;

// DOM Elements
const elements = {
  body: document.body,
  installAppBtn: document.getElementById('install-app-btn'),
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  currentDate: document.getElementById('current-date'),
  todoForm: document.getElementById('todo-form'),
  taskInput: document.getElementById('task-input'),
  todoList: document.getElementById('todo-list'),
  emptyState: document.getElementById('empty-state'),
  emptyTitle: document.getElementById('empty-state-title'),
  emptySubtitle: document.getElementById('empty-state-subtitle'),
  progressCard: document.getElementById('progress-card'),
  progressBarFill: document.getElementById('progress-bar-fill'),
  progressText: document.getElementById('progress-text'),
  progressPercentage: document.getElementById('progress-percentage'),
  filterTabs: document.querySelectorAll('.tab-btn'),
  countAll: document.getElementById('count-all'),
  countActive: document.getElementById('count-active'),
  countCompleted: document.getElementById('count-completed'),
  clearCompletedBtn: document.getElementById('clear-completed-btn'),
  footerSummary: document.getElementById('footer-summary'),
  toastContainer: document.getElementById('toast-container')
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderDate();
  attachEventListeners();
  initPWA();
  loadTodos();
});

// PWA & Service Worker Registration
function initPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('ServiceWorker registration error:', err);
      });
    });
  }

  // Handle Before Install Prompt
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

// 1. Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('cleanflow-theme') || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'theme-dark' : 'theme-light');
  
  elements.body.className = savedTheme;
  
  elements.themeToggleBtn.addEventListener('click', () => {
    const isDark = elements.body.classList.contains('theme-dark');
    const newTheme = isDark ? 'theme-light' : 'theme-dark';
    elements.body.className = newTheme;
    localStorage.setItem('cleanflow-theme', newTheme);
  });
}

// 2. Date Formatting
function renderDate() {
  const now = new Date();
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  elements.currentDate.textContent = now.toLocaleDateString(undefined, options);
}

// 3. Event Listeners
function attachEventListeners() {
  // Add task form submission
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

  // Filter tab buttons
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

  // Clear completed tasks button
  elements.clearCompletedBtn.addEventListener('click', async () => {
    const completedCount = todos.filter((t) => t.completed).length;
    if (completedCount === 0) return;
    
    if (confirm(`Are you sure you want to delete ${completedCount} completed task${completedCount > 1 ? 's' : ''}?`)) {
      await clearCompletedTodos();
    }
  });
}

// --- API Interactions ---

// Fetch all todos from backend
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

// Create new todo
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
    console.error('Create todo error:', err);
    showToast('Failed to add task', null, true);
  }
}

// Toggle todo completion
async function toggleTodo(id, completed) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  // Optimistic update
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
      // Revert if failed
      todo.completed = previousState;
      renderTodos();
      showToast('Failed to update task status', null, true);
    }
  } catch (err) {
    todo.completed = previousState;
    renderTodos();
    showToast('Network error while updating task', null, true);
  }
}

// Update todo title
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

// Delete single todo
async function deleteTodo(id, element) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  lastDeletedTodo = { ...todo };

  // Animate exit if element is provided
  if (element) {
    element.classList.add('deleting');
    await new Promise((r) => setTimeout(r, 220));
  }

  // Remove locally
  todos = todos.filter((t) => t.id !== id);
  renderTodos();

  try {
    const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(`Deleted "${truncate(todo.title, 25)}"`, async () => {
        // Undo deletion
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

// Clear all completed todos
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

// --- Rendering Functions ---

function renderTodos() {
  // Calculate counts
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;

  // Update Counters
  elements.countAll.textContent = totalCount;
  elements.countActive.textContent = activeCount;
  elements.countCompleted.textContent = completedCount;

  // Update Progress Bar
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  elements.progressBarFill.style.width = `${percentage}%`;
  elements.progressPercentage.textContent = `${percentage}%`;
  elements.progressText.textContent = `${completedCount} of ${totalCount} completed`;

  // Clear completed button visibility
  elements.clearCompletedBtn.style.display = completedCount > 0 ? 'inline-flex' : 'none';

  // Footer summary
  if (totalCount === 0) {
    elements.footerSummary.textContent = 'No tasks yet';
  } else if (activeCount === 0) {
    elements.footerSummary.textContent = '🎉 All tasks completed!';
  } else {
    elements.footerSummary.textContent = `${activeCount} task${activeCount === 1 ? '' : 's'} remaining`;
  }

  // Filter tasks
  let filteredTodos = todos;
  if (currentFilter === 'active') {
    filteredTodos = todos.filter((t) => !t.completed);
  } else if (currentFilter === 'completed') {
    filteredTodos = todos.filter((t) => t.completed);
  }

  // Handle empty states
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

  // Render list items
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

  // Checkbox container
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

  // Content (title & relative time)
  const content = document.createElement('div');
  content.className = 'todo-content';

  const titleSpan = document.createElement('span');
  titleSpan.className = 'todo-title';
  titleSpan.id = `task-title-${todo.id}`;
  titleSpan.textContent = todo.title;

  // Double click to edit title
  titleSpan.addEventListener('dblclick', () => {
    enableInlineEditing(todo, content, titleSpan);
  });

  const timeSpan = document.createElement('span');
  timeSpan.className = 'todo-time';
  timeSpan.textContent = formatTime(todo.createdAt);

  content.appendChild(titleSpan);
  content.appendChild(timeSpan);

  // Actions (Edit & Delete)
  const actions = document.createElement('div');
  actions.className = 'todo-actions';

  // Edit Button
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

  // Delete Button
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

  // Assemble
  li.appendChild(checkboxContainer);
  li.appendChild(content);
  li.appendChild(actions);

  return li;
}

// Inline editing helper
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

// Relative time formatting
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

// Toast notification helper
function showToast(message, undoCallback = null, isError = false) {
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

  // Auto remove after 3.5s
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
