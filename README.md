# Todo Manager — Full-Stack Application

React + Next.js frontend · Express + SQLite backend · GitHub Pages + Render deployment

---

## Local Development

### Prerequisites
- Node.js ≥ 18

### Backend (port 4000)
```bash
cd backend
npm install
npm run dev
```

### Frontend (port 3000)
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**

---

## Deployment

### Step 1 — Deploy the backend to Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New → Blueprint**
3. Connect your repo — Render will detect `render.yaml` automatically
4. Click **Apply** — the backend deploys to a URL like:
   `https://todo-backend-xxxx.onrender.com`
5. Copy this URL — you'll need it in Step 2

> **Note:** The free Render plan includes a 1 GB disk for SQLite persistence.
> The backend sleeps after 15 min of inactivity on the free tier (first request takes ~30s to wake up).

---

### Step 2 — Configure GitHub repo settings

Go to your GitHub repo → **Settings**:

#### Secrets (Settings → Secrets and variables → Actions → Secrets)
| Name | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://todo-backend-xxxx.onrender.com` |

#### Variables (Settings → Secrets and variables → Actions → Variables)
| Name | Value |
|---|---|
| `NEXT_PUBLIC_BASE_PATH` | `/your-repo-name` (e.g. `/todo-app`) |

---

### Step 3 — Enable GitHub Pages

Go to **Settings → Pages**:
- Source: **GitHub Actions**
- Save

---

### Step 4 — Trigger deployment

Push any commit to `main` (or go to **Actions → Deploy Frontend → Run workflow**).

Your app will be live at:
```
https://<your-username>.github.io/<your-repo-name>
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
| Frontend | Next.js 16, React 19, TypeScript, MUI v9 |
| Forms | React Hook Form |
| HTTP | Axios |
| Backend | Node.js, Express.js, TypeScript |
| Database | SQLite (better-sqlite3) |
| Tests | Jest, React Testing Library |
| CI/CD | GitHub Actions |
| Hosting | GitHub Pages (frontend) + Render (backend) |
