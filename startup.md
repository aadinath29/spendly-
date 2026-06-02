# Startup Guide

A step-by-step guide for anyone who just cloned/imported this project. Follow the
steps in order: install → configure → create the database → run.

> **Heads-up:** This app needs a **MySQL** server. All database settings are read from
> a `.env` file, so the project works on any machine — you just point it at whatever
> MySQL you have. Nothing is hard-coded.

---

## 0. Prerequisites

Make sure these are installed and available before you start:

| Tool | Version | Check with |
| --- | --- | --- |
| **Node.js** | ≥ 18 (tested on 24) | `node -v` |
| **npm** | comes with Node | `npm -v` |
| **MySQL** | ≥ 8, running & reachable | `mysql --version` |

---

## 1. Install all dependencies

From the **project root** (`D:\aadinath`):

```bash
npm run install-all
```

This single command installs dependencies for the root, `server/`, and `client/`.

---

## 2. Add your configuration (the part you must fill in)

The server reads its secrets and database connection from `server/.env`, which is **not**
committed to git. You create it from the example template:

```bash
cd server
copy .env.example .env      # Windows
# cp .env.example .env       # macOS / Linux
```

Now open `server/.env` and fill in the values **for the machine you are running on**:

```env
# ── Server ──
PORT=5000                              # API port (leave as-is unless taken)
CLIENT_URL=http://localhost:5173       # the frontend origin (for CORS)

# ── MySQL — THIS is what you must edit ──
DB_HOST=localhost                      # MySQL host (IP/hostname of the DB machine)
DB_PORT=3306                           # MySQL port
DB_USER=root                           # MySQL username
DB_PASSWORD=your_password_here         # MySQL password
DB_NAME=expense_tracker                # database name (created for you in step 3)

# ── Auth ──
JWT_SECRET=replace_with_a_long_random_secret   # any long random string
JWT_EXPIRES_IN=7d                              # how long logins stay valid
```

**What you must change:**
1. **`DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD`** — match the MySQL on your machine.
   If MySQL runs on a *different* machine, set `DB_HOST` to that machine's IP/hostname
   (and make sure that MySQL accepts remote connections + the port is open).
2. **`JWT_SECRET`** — replace `change_me...` with a long random string. Logins are insecure
   without this.

Everything else can stay at its default for local development.

---

## 3. Create the database + tables

Still inside the project (root or `server/`), run:

```bash
npm run db:init
```

This connects to MySQL using your `.env`, creates the `expense_tracker` database if it
doesn't exist, and creates all tables. It's **safe to re-run** — it won't wipe data.

> If this fails, it's almost always the `.env` DB values or MySQL not running. See
> Troubleshooting below.

---

## 4. Run the project

From the **project root**:

```bash
npm run dev
```

This starts **both** servers together with hot reload:

- **API** → http://localhost:5000
- **App** → **http://localhost:5173** ← open this in your browser

The Vite dev server proxies `/api` to the Express server, so there's no CORS setup in dev.

---

## 5. Verify it's working

1. Open **http://localhost:5173** → you should see the **Spendly** login screen.
2. Click **Sign up**, create an account → you'll land on the dashboard
   (it comes pre-seeded with 8 default categories).
3. Quick API check: open http://localhost:5000/api/health — you should see
   `{"success":true,"status":"ok","db":"up"}`. If `db` says `"down"`, MySQL isn't
   reachable yet (revisit steps 2–3).

---

## Production build

```bash
npm run build      # builds the React app into client/dist
npm start          # starts the API server
```

Then serve `client/dist` with any static host (or point the API at it).

---

## Command reference

| Command | What it does |
| --- | --- |
| `npm run install-all` | Install root + server + client deps |
| `npm run dev` | Run API + frontend together (hot reload) |
| `npm run db:init` | Create the database + tables (safe to re-run) |
| `npm run build` | Build the frontend for production |
| `npm start` | Start the API server only |

---

## Troubleshooting

| Symptom | Likely cause & fix |
| --- | --- |
| `/api/health` shows `"db":"down"`, or login returns **503** | MySQL isn't running or `.env` DB values are wrong. Start MySQL, fix `DB_*`, re-run `npm run db:init`. |
| `ECONNREFUSED ... :3306` in the server logs | MySQL not reachable on that host/port. Check `DB_HOST`/`DB_PORT`; if remote, confirm the DB accepts remote connections. |
| `ER_ACCESS_DENIED_ERROR` | Wrong `DB_USER` / `DB_PASSWORD`. |
| Login "works" but logs you out / token errors | `JWT_SECRET` is missing or empty in `.env`. Set a long random string and restart. |
| Port 5000 or 5173 already in use | Stop whatever is using it, or change `PORT` in `.env` (and `CLIENT_URL` accordingly). |
| Styles look broken / blank page | Re-run `npm run install-all`, then `npm run dev`. Make sure you opened **5173**, not 5000. |

> **Note:** The Express server is built to **boot even if the database is down**, so the
> login page always loads. Data routes will return errors until MySQL is connected — that's
> expected, not a crash.
