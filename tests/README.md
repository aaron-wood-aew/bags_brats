# 🎭 Bags & Brats Testing & Docker Guide

This project is fully containerized and includes a professional E2E testing suite using **Playwright**.

## 🚀 Quick Start (Docker)

To start the entire stack (Frontend, Backend, MongoDB):

```bash
npm run start
```

Default access points:
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001](http://localhost:5001)
- **Database**: `mongodb://localhost:27017`

---

## 🧪 Running Tests

Ensure the application is running in Docker before starting E2E tests.

### 1. Install Test Dependencies
If this is your first time running tests locally:
```bash
cd tests
npm install
npx playwright install chromium
```

### 2. Run Headless Tests
Perfect for quick verification:
```bash
npm test
```

### 3. Run in UI Mode (Highly Recommended)
This provides a visual, interactive way to debug and watch tournament flows:
```bash
npm run test:ui
```

---

## 🛠️ Common Operations

### Seeding Test Data
Quickly populate the database with 24 test players:
```bash
npm run seed
```

### Rebuilding Containers
Use this if you make changes to `Dockerfile` or `requirements.txt`:
```bash
npm run build
```

---

## 🔍 What is being tested?
The **Tournament Lifecycle Smoke Test** (`tests/tests/tournament_lifecycle.spec.js`) verifies:
1. **Admin Orchestration**: Creating tournaments, generating pairings, and activating gameday.
2. **Real-time Sync**: Verifying visual cues like timers and opponent data.
3. **Scoring Integrity**: Submitting results and ensuring admin scores take precedence.
4. **Mobile Responsiveness**: Basic layout checks for mobile viewports.
