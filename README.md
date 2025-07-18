# 🛠️ Task Management System – React + Spring Boot

This is a full-stack **Task Management System** built using **React (TypeScript)** for the frontend and **Spring Boot** for the backend. It includes secure authentication, user roles, task assignment, and task tracking across statuses.

> ⚡ This repository contains **two separate projects**:
>
> - `frontend/` – React application for user interface and interaction
> - `backend/` – Spring Boot application for RESTful APIs and authentication

---

## 📂 Project Structure

---

## 🔍 Overview

### ✅ Backend (Spring Boot)
- JWT-based authentication and role-based access
- RESTful APIs for task CRUD operations
- Filter tasks by status and assignee
- Assign tasks to users and manage status transitions
- H2 or PostgreSQL support

📖 **See [`backend/README.md`](./backend/README.md)** for complete setup and API documentation.

---

### ✅ Frontend (React + TypeScript)
- Secure login form and protected routes
- Dashboard with task columns (TODO, IN_PROGRESS, DONE)
- Task creation, editing, filtering, and assignment
- Redux Toolkit for state management
- Styled using TailwindCSS

📖 **See [`frontend/README.md`](./frontend/README.md)** for setup instructions and feature breakdown.

---

## 🚀 Getting Started

1. Clone the repository:

```bash
git clone https://github.com/cheruiyotcollins/task-management-system.git
cd task-management-system


