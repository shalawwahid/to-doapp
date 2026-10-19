# CleanFlow — Simple & Elegant To-Do App

A clean, modern, and intuitive to-do application built with **Node.js** and Vanilla JavaScript/CSS.

## ✨ Features
- **Add Tasks**: Quickly create tasks with a title by typing and pressing `Enter`.
- **Mark Complete**: Check off completed tasks with smooth strike-through animations and instant progress updates.
- **Delete Tasks**: Remove tasks with one click, complete with an "Undo" toast notification.
- **Inline Editing**: Click or double-click any task title to edit it in-place.
- **Filter Tabs**: Easily switch between **All**, **Active**, and **Completed** tasks.
- **Clear Done**: Bulk delete all finished tasks in one click.
- **Dark & Light Mode**: Toggle between light and dark themes with saved preference.
- **Persistent Data**: Tasks are stored in `data/todos.json` on the Node.js server.
- **Progress Tracking**: Real-time visual progress bar showing completion rate.

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
Or for development with auto-reload:
```bash
npm run dev
```

### 4. Open in Browser
Visit [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/todos` | Retrieve all tasks |
| `POST` | `/api/todos` | Create a new task (`{ title: string }`) |
| `PATCH` | `/api/todos/:id` | Update status or title (`{ completed?: boolean, title?: string }`) |
| `DELETE` | `/api/todos/:id` | Delete a single task |
| `DELETE` | `/api/todos/completed` | Clear all completed tasks |
