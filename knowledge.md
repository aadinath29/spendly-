# Project Knowledge

Everything you need to understand **what this project is**, **how it's built**, and
**how it helps the user**. (For setup/run steps, see [`startup.md`](startup.md).)

---

## What is it?

**Spendly** is a full-stack, **multi-user expense tracker**. People sign up for a private
account and record what they spend; the app organizes those expenses into categories and
turns them into a visual **analytics dashboard** so users can actually *see* where their
money goes.

It is **expenses-only** (no income tracking) by design — focused on doing one thing well:
understanding spending.

Key characteristics:
- **Private per user** — every account only ever sees its own data.
- **Portable** — all database/secret config is environment-driven, so it runs against any
  MySQL on any machine without code changes.
- **Polished** — a custom dark, glassmorphism UI rather than a bare-bones CRUD form.

---

## What is it built with?

A JavaScript monorepo: an Express API (`server/`) talking to MySQL, and a React single-page
app (`client/`) built with Vite.

### Backend (`server/`)
| Tool | Why it's used |
| --- | --- |
| **Express** | HTTP API framework — routes, middleware, error handling |
| **MySQL** via **mysql2** | Relational data store; promise-based pool, env-configured |
| **jsonwebtoken (JWT)** | Stateless auth — issues a Bearer token on login |
| **bcryptjs** | Hashes passwords so raw passwords are never stored |
| **express-validator** | Validates/sanitizes every write request |
| **helmet** | Sets secure HTTP headers |
| **cors** | Allows the frontend origin to call the API |
| **morgan** | Request logging in dev |
| **dotenv** | Loads config/secrets from `.env` |

### Frontend (`client/`)
| Tool | Why it's used |
| --- | --- |
| **React 18 + Vite** | Component UI + fast dev server / build |
| **React Router** | Client-side routing + protected routes |
| **Tailwind CSS v4** | The custom dark, glassmorphism design system |
| **Recharts** | The dashboard charts (area + donut) |
| **axios** | API calls, with interceptors for auth + 401 handling |
| **lucide-react** | Icon set (nav, category icons) |
| **date-fns** | Date formatting/handling |
| **react-hot-toast** | Toast notifications for feedback |

### Dev tooling
- **concurrently** — one `npm run dev` boots the API and the frontend together.
- **Vite proxy** — forwards `/api` → Express in development, so there's no CORS friction.

---

## How it's put together (architecture)

```
Browser (React SPA, :5173)
        │  axios → /api/*  (proxied in dev)
        ▼
Express API (:5000)
        │  mysql2 connection pool (config from .env)
        ▼
MySQL database (expense_tracker)
```

- The React app holds the logged-in user + JWT in `localStorage`; axios attaches the token
  to every request and redirects to login on a `401`.
- The Express API verifies the JWT on protected routes, then **scopes every query to the
  current user's id** — that's what keeps each account's data private.
- The server is built to **boot even when MySQL is down** (lazy connection pool), so the UI
  always loads; `GET /api/health` reports whether the DB is connected.

### Data model
| Table | Holds | Notes |
| --- | --- | --- |
| `users` | accounts | email is unique; password stored hashed |
| `categories` | a user's spending categories | name + color + icon; 8 defaults seeded at signup |
| `expenses` | individual transactions | amount, date, description, payment method; linked to a user and (optionally) a category |

Deleting a user cascades to their data; deleting a category leaves its expenses
"uncategorized" rather than destroying them.

---

## What it does (features)

- **Accounts** — signup / login / logout with secure JWT sessions.
- **Expenses** — add, edit, delete; search by text; filter by category and date range;
  sortable, paginated list with a running filtered total.
- **Categories** — create custom categories with a color + icon; new accounts start with 8
  sensible defaults (Food, Transport, Shopping, Bills, etc.).
- **Analytics dashboard** —
  - 4 summary cards: total spent, this month, change vs. last month, # of transactions
  - spending-over-time **area chart** (30-day / 90-day / 12-month ranges)
  - by-category **donut chart**
  - a recent-expenses list
- **Experience** — responsive (desktop sidebar, mobile drawer), dark theme, loading
  skeletons, friendly empty states, and toast feedback on every action.

---

## How it helps the user

- **See where the money actually goes.** Raw transactions become categories, totals, and
  charts — the dashboard answers "what am I spending on?" at a glance.
- **Spot trends early.** Month-over-month comparison and the time-series chart show whether
  spending is creeping up or under control.
- **Stay organized.** Custom categories + search/filters make it easy to find and review any
  expense, even months later.
- **Trust it with private data.** Each user's data is isolated, passwords are hashed, and
  sessions use signed tokens.
- **Use it anywhere.** Because every setting comes from `.env`, the same codebase runs
  against a local MySQL or a remote database server with zero code changes.
