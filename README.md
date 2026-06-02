# 💸 Expense Tracker

A polished, full-stack expense tracker with multi-user accounts, an analytics dashboard,
and a custom dark-themed UI.

- **Backend:** Express + MySQL (mysql2), JWT auth, bcrypt
- **Frontend:** React + Vite, Tailwind CSS v4, Recharts
- **Features:** signup/login, private per-user expenses, categories, search & filters, analytics dashboard

---

## Project layout

```
expense-tracker/
├─ server/   # Express API + MySQL
└─ client/   # React + Vite frontend
```

---

## Prerequisites

- **Node.js** ≥ 18 (tested on Node 24)
- **MySQL** ≥ 8 running and reachable (local or remote)

---

## 1. Install everything

From the project root:

```bash
npm run install-all
```

This installs root, `server/`, and `client/` dependencies.

---

## 2. Configure the database (do this on the machine that has MySQL)

```bash
cd server
cp .env.example .env      # Windows: copy .env.example .env
```

Edit `server/.env` and fill in your MySQL connection:

```env
PORT=5000
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=expense_tracker

JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
```

> The app reads **all** DB settings from `.env`, so it adapts to whatever machine it runs on.
> Nothing is hard-coded.

---

## 3. Create the database schema

```bash
npm run db:init
```

This creates the `expense_tracker` database (if missing) and all tables. Safe to re-run.

---

## 4. Run it

From the project root:

```bash
npm run dev
```

- API → http://localhost:5000
- App → http://localhost:5173 (open this in your browser)

The Vite dev server proxies `/api` → the Express server, so there's no CORS setup needed in dev.

---

## Production build

```bash
npm run build          # builds the React app into client/dist
npm start              # starts the API server
```

Serve `client/dist` with any static host (or point the API at it).

---

## Useful scripts

| Command | What it does |
| --- | --- |
| `npm run install-all` | Install root + server + client deps |
| `npm run dev` | Run API + frontend together (hot reload) |
| `npm run db:init` | Create DB + tables |
| `npm run build` | Build the frontend |
| `npm start` | Start the API server |

---

## API overview

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create account (seeds default categories) |
| POST | `/api/auth/login` | Log in, returns JWT |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/expenses` | List (with filters) / create |
| PUT/DELETE | `/api/expenses/:id` | Update / delete |
| GET/POST | `/api/categories` | List / create |
| PUT/DELETE | `/api/categories/:id` | Update / delete |
| GET | `/api/analytics/summary` | Totals + month-over-month |
| GET | `/api/analytics/by-category` | Spend per category |
| GET | `/api/analytics/over-time` | Spend time series |
| GET | `/api/health` | Server + DB status |

All endpoints except register/login require an `Authorization: Bearer <token>` header.
