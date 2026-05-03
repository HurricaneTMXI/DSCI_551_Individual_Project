# EPL Squads & Matches

DSCI 551 Individual Project — Simou Chen | Spring 2026

A full-stack web app for browsing English Premier League squads and match
results (seasons **2023-24** and **2024-25**), built on **PostgreSQL 17** to
demonstrate **heap storage**, **B-tree indexes**, and **MVCC**.

- **Frontend:** React + Vite + TypeScript (port 5173)
- **Backend:** Node.js + Express + TypeScript (port 4000)
- **Database:** PostgreSQL 17 (port 5432, database name `epl`)

---

## 1. Prerequisites

You must have these three things installed before starting:

| Tool | Version | Check with |
|------|---------|------------|
| PostgreSQL | 17+ | `psql --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ (ships with Node) | `npm --version` |

Make sure your local PostgreSQL server is running. On macOS with Homebrew:

```bash
brew services start postgresql@17
```

---

## 2. Clone the repo

```bash
git clone https://github.com/HurricaneTMXI/DSCI_551_Individual_Project.git
cd DSCI_551_Individual_Project
```

---

## 3. Create the database and load the data

The dataset (5 CSV files in `data/`) is included in the repo, so no external
download is needed.

Run these commands **from the project root** (the same folder as this README):

```bash
# Create the empty database
createdb epl

# Create tables, load CSVs, build indexes
psql -d epl -f db/schema.sql
psql -d epl -f db/load.sql
psql -d epl -f db/indexes.sql
```

You should see `COPY 2`, `COPY 23`, `COPY 1041`, `COPY 1977`, `COPY 733` from
the load step. That confirms all 5 tables loaded successfully.

If you ever want to start over from a clean database, run:

```bash
psql -d epl -f db/reset.sql
psql -d epl -f db/schema.sql
psql -d epl -f db/load.sql
psql -d epl -f db/indexes.sql
```

---

## 4. Configure the backend

Copy the example env file and fill in your PostgreSQL username:

```bash
cd backend
cp .env.example .env
```

Then open `backend/.env` in any editor and edit the `DATABASE_URL` line so the
username matches the one you use locally:

```
DATABASE_URL=postgresql://<your-postgres-username>@localhost:5432/epl
PORT=4000
```

For example, if your username is `simouchen`:

```
DATABASE_URL=postgresql://simouchen@localhost:5432/epl
PORT=4000
```

> **No API keys, tokens, or passwords are required for this project.** The
> only configuration is the local `DATABASE_URL` above. If your local
> PostgreSQL requires a password, append it like
> `postgresql://user:password@localhost:5432/epl`.

---

## 5. Start the backend

From the `backend/` directory:

```bash
npm install
npm run dev
```

The API server starts at <http://localhost:4000>.

Quick health check (in a new terminal):

```bash
curl http://localhost:4000/api/health
# {"status":"ok"}
```

---

## 6. Start the frontend

Open a new terminal, then from the project root:

```bash
cd frontend
npm install
npm run dev
```

The UI opens at <http://localhost:5173>.

---

## 7. Try it out

Open <http://localhost:5173> in your browser. You should be able to:

| Page | What you can do |
|------|------------------|
| **Teams** | Pick a season, see all 20 teams |
| **Team Detail** | Click any team — see the squad list and the match history |
| **Player Search** | Case-insensitive name search (try `Bruno`, `Saka`, `Salah`) |
| **Admin** | Update a player's name/birth year, or a match score |

Sample admin test (round-trips a value):

1. Go to **Player Search**, type `Bruno Fernandes`, note the player ID (`685`).
2. Go to **Admin**, enter Player ID `685`, Birth Year `1999`, click **Update**.
3. Search `Bruno` again — birth year is now 1999.
4. Go back to **Admin**, set it back to `1994`.

---

## 8. Project Structure

```
DSCI_551_Individual_Project/
├── data/        # 5 CSV files (seasons, teams, players, squad_memberships, matches)
├── db/          # SQL scripts: schema.sql, load.sql, indexes.sql, reset.sql
├── backend/     # Express + TypeScript REST API
│   ├── src/
│   │   ├── server.ts          # entry point
│   │   ├── db.ts              # pg connection pool
│   │   └── routes/            # seasons, teams, players, admin
│   ├── .env.example
│   └── package.json
├── frontend/    # React + Vite + TypeScript UI
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── pages/             # Teams, TeamDetail, PlayerSearch, Admin
│   └── package.json
└── README.md
```

---

## 9. REST API endpoints

Base URL: `http://localhost:4000/api`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/seasons` | List all seasons |
| GET | `/teams?season=2023-24` | List teams in a season |
| GET | `/teams/:id/squad?season=2023-24` | Team roster (sorted GK→DF→MF→FW, then shirt #) |
| GET | `/teams/:id/matches?season=2023-24` | Team match history (sorted by kickoff time) |
| GET | `/players/search?season=2023-24&q=bruno` | Case-insensitive name search |
| PATCH | `/admin/player/:id` | Body: `{ "name"?: "...", "birth_year"?: 1998 }` |
| PATCH | `/admin/match/:id` | Body: `{ "home_goals"?: 2, "away_goals"?: 1 }` |
| GET | `/health` | Returns `{"status":"ok"}` |

---

## 10. Database focus areas (for the report)

This project demonstrates two PostgreSQL internals:

- **Heap storage + B-tree indexes.** The 5 secondary indexes in
  `db/indexes.sql` enable index scans and BitmapOr plans for the player
  search, squad view, and match history queries. Run
  `EXPLAIN ANALYZE <query>` in `psql -d epl` to see the planner choices.
- **MVCC.** Admin `PATCH` updates create new row versions without blocking
  concurrent readers. To see this, open two `psql -d epl` sessions, run
  `BEGIN; UPDATE players SET birth_year=1999 WHERE player_id=685;` in one
  (without committing), and `SELECT birth_year FROM players WHERE player_id=685;`
  in the other — the second session still sees the old value until the first
  commits.