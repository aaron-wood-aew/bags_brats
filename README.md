# 🏆 Bags & Brats Tournament System

A modern, high-performance web application designed for church communities to manage cornhole tournaments with real-time updates and a professional gameday atmosphere.

---

## 🛠️ Tech Stack
- **Frontend**: React (Vite) + Vanilla CSS + Framer Motion
- **Backend**: Flask (Python 3.11) + Socket.IO + Eventlet
- **Database**: MongoDB
- **Containerization**: Docker & Docker Compose
- **Testing**: Playwright (E2E)

---

## 🚀 Getting Started (Recommended: Docker)

The easiest way to run the entire stack is using Docker.

### 1. Prerequisites
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [Node.js](https://nodejs.org/) (for running scripts and tools)

### 2. Launch the Application
From the root directory, run:
```bash
npm install
npm run start
```
This will:
- Build and start the **MongoDB** database.
- Start the **Backend API** on [http://localhost:5001](http://localhost:5001).
- Start the **Frontend** on [http://localhost:5173](http://localhost:5173).

---

## 🧑‍💻 Developer Guide

### Environment Variables
The system uses pre-configured defaults in `docker-compose.yml`. For local development without Docker, copy `.env` files in both `backend` and `frontend` folders.

### Seeding Test Data
To populate the database with 24 test players for scaling and pairing tests:
```bash
npm run seed
```

### Creating an Admin
To promote a specific email to ADMIN status:
1. Update `backend/make_admin.py` with your email.
2. Run (inside the backend container or locally if venv is active):
```bash
python backend/make_admin.py
```

---

## 🧪 Automated Testing

We use **Playwright** for high-velocity E2E verification of the tournament lifecycle.

### 1. Setup
```bash
cd tests
npm install
npx playwright install chromium
```

### 2. Run Tests (Headless)
```bash
npm test
```

### 3. Run Tests (Interactive UI)
Highly recommended for seeing the "Gameday Pulse" and pairing logic in action:
```bash
npm run test:ui
```

---

## 📁 Project Structure

```text
├── backend/          # Flask API & Socket.IO server
├── frontend/         # React SPA
├── tests/            # Playwright E2E test suite
├── docker-compose.yml
└── package.json      # Workspace-level orchestration scripts
```

---

## ⚜️ Archaiforge Integration
This project is maintained using **Archaiforge Intelligence**. Strategic decisions, evolution logs, and architectural boundaries are persisted in the [`.archaiforge/`](file:///.archaiforge/) directory.
