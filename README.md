# Todo Manager — Full-Stack Application

React + Next.js frontend · Express + SQLite backend

**Live demo:** https://YOUR_USERNAME.github.io/YOUR_REPO_NAME

> The live demo runs without a backend — data is stored in your browser (localStorage).
> To use with a real backend, run it locally (see below).

---

## Local Development

### Prerequisites
- Node.js ≥ 18

### 1. Start the backend (port 4000)
```bash
cd backend
npm install
npm run dev
```

### 2. Start the frontend (port 3000)
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**

The frontend auto-detects the backend on startup. If the backend is running — data is saved to SQLite. If not — the app works in demo mode using localStorage.

---

## Deploy to GitHub Pages (frontend only)

### 1. Push the repo to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 2. Enable GitHub Pages

Go to **Settings → Pages** → Source: **GitHub Actions**

### 3. Add a repository variable

Go to **Settings → Secrets and variables → Actions → Variables**:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_BASE_PATH` | `/YOUR_REPO_NAME` (e.g. `/todo-app`) |

> `NEXT_PUBLIC_API_URL` can be left empty — the app will work in demo mode without a backend.

### 4. Deploy

Push to `main` or trigger manually: **Actions → Deploy Frontend to GitHub Pages → Run workflow**

The app will be live at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME
```

---

## Running Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

---

## Docker (local only)

```bash
docker-compose up --build
# Frontend → http://localhost:3000
# Backend  → http://localhost:4000
```

---

## Tech Stack

| | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript, MUI v9 |
| Forms | React Hook Form |
| HTTP | Axios |
| Backend | Node.js, Express.js, TypeScript |
| Database | SQLite (better-sqlite3) |
| Tests | Jest, React Testing Library |
| CI/CD | GitHub Actions |
| Hosting | GitHub Pages (frontend) |
