const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'todos.json');

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

// Helper to read todos
function readTodos() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultTodos, null, 2), 'utf-8');
      return defaultTodos;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading todos data:', err);
    return [];
  }
}

// Helper to write todos
function writeTodos(todos) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing todos data:', err);
    return false;
  }
}

// --- API Endpoints ---

// 1. Get all todos
app.get('/api/todos', (req, res) => {
  const todos = readTodos();
  res.json({ success: true, data: todos });
});

// 2. Add a new todo
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

// 3. Delete all completed tasks (placed before :id route)
app.delete('/api/todos/completed', (req, res) => {
  const todos = readTodos();
  const remaining = todos.filter((todo) => !todo.completed);
  const deletedCount = todos.length - remaining.length;
  writeTodos(remaining);

  res.json({ success: true, count: deletedCount });
});

// 4. Update a todo (toggle completed or edit title)
app.patch('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { completed, title } = req.body;

  const todos = readTodos();
  const todoIndex = todos.findIndex((t) => t.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ success: false, error: 'Todo not found.' });
  }

  if (typeof completed === 'boolean') {
    todos[todoIndex].completed = completed;
    todos[todoIndex].updatedAt = new Date().toISOString();
  }

  if (typeof title === 'string' && title.trim()) {
    todos[todoIndex].title = title.trim();
    todos[todoIndex].updatedAt = new Date().toISOString();
  }

  writeTodos(todos);
  res.json({ success: true, data: todos[todoIndex] });
});

// 5. Delete a specific todo
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

// Start server
app.listen(PORT, () => {
  console.log(`To-Do App server running at http://localhost:${PORT}`);
});
