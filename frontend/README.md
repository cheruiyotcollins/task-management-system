# Task Manager

![Task Manager Preview](screenshot.png)

A modern task management application built with React, TypeScript, and Redux featuring authentication and real-time task management.

## ✨ Features

### 🔐 Authentication

- JWT-based login/logout flow
- Protected routes with React Router
- Session persistence
- Form validation

### 📋 Task Management

- Kanban board (Todo/In Progress/Done)
- Create/Edit/Delete tasks
- Assign tasks to users
- Filter by:
  - Status
  - Priority
  - Assignee
- Search functionality

### 🎨 UI Components

- Responsive design with Tailwind CSS
- Modal dialogs
- Toast notifications
- Loading states

## 🛠 Tech Stack

**Frontend**

- React 18
- TypeScript
- Redux Toolkit
- React Router v6
- Tailwind CSS
- HeadlessUI

**Tooling**

- ESLint + Prettier
- Jest + React Testing Library
- Husky git hooks

**Here's a look at the beautiful dashboard:**

![Dashboard Overview](images/dashboard.png "Main application dashboard")

### Login

Users can easily log in:

![Login Screen](images/login.png)

### Register

Users can easily register to the system:

![Login Screen](images/register.png)

### Logout

Users can logout:

![Login Screen](images/logout.png)

### User Profile

Users can view their profile:

![Login Screen](images/user_profile.png)

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- Yarn or npm

### Installation

```bash
# Clone repository
git clone https://github.com/cheruiyotcollins/task-management-system.git
cd task-manager

# Install dependencies
npm install

# Start development server
npm start
```
