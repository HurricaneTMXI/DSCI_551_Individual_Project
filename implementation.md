# implementation.md — EPL Squads & Matches App (DSCI 551)

This document is a **precise implementation guide** for building the project in a consistent way (easy for any AI tool or teammate to follow).  
Goal: deliver a runnable app that queries and updates a PostgreSQL database, using EPL squads + matches data.

---

## 0) Tech stack (fixed)

### Languages / frameworks
- **Frontend:** React (Vite) + TypeScript
- **Backend:** Node.js (Express) + TypeScript
- **Database:** PostgreSQL

### Why this stack
- Fast to build with a simple API boundary (React → REST API → Postgres).
- UI polish is not required; focus is on correct queries and database behavior.

---

## 1) Repo structure (fixed)

Create a single repo with this layout:

```
epl-squads-matches/
  README.md
  .gitignore

  data/
    seasons.csv
    teams.csv
    players.csv
    squad_memberships.csv
    matches.csv

  db/
    schema.sql
    load.sql
    indexes.sql
    reset.sql

  backend/
    package.json
    tsconfig.json
    .env.example
    src/
      server.ts
      db.ts
      routes/
        seasons.ts
        teams.ts
        players.ts
        admin.ts

  frontend/
    package.json
    tsconfig.json
    vite.config.ts
    src/
      main.tsx
      api/
        client.ts
        types.ts
      pages/
        Home.tsx
        Teams.tsx
        TeamDetail.tsx
        PlayerSearch.tsx
        Admin.tsx
      components/
        SeasonSelector.tsx
        TeamList.tsx
        PlayerTable.tsx
        MatchTable.tsx
      App.tsx
```

Notes:
- `data/` contains the final cleaned CSVs.
- `db/` contains SQL scripts for schema and loading.
- `backend/` is the REST API.
- `frontend/` is the React UI.

---

## 2) Database schema (must match)

### Tables

**seasons**
- `season_id` TEXT PRIMARY KEY  (examples: `2023-24`, `2024-25`)

**teams**
- `team_id` SERIAL PRIMARY KEY
- `name` TEXT UNIQUE NOT NULL

**players**
- `player_id` SERIAL PRIMARY KEY
- `name` TEXT NOT NULL
- `birth_year` INT NULL

**squad_memberships**
- `season_id` TEXT NOT NULL REFERENCES seasons(season_id)
- `team_id` INT NOT NULL REFERENCES teams(team_id)
- `player_id` INT NOT NULL REFERENCES players(player_id)
- `shirt_number` INT NOT NULL
- `position` TEXT NOT NULL  -- one of GK/DF/MF/FW
- PRIMARY KEY (`season_id`, `team_id`, `player_id`)

**matches**
- `match_id` SERIAL PRIMARY KEY
- `season_id` TEXT NOT NULL REFERENCES seasons(season_id)
- `matchday` INT NOT NULL
- `kickoff_ts` TIMESTAMP NOT NULL
- `home_team_id` INT NOT NULL REFERENCES teams(team_id)
- `away_team_id` INT NOT NULL REFERENCES teams(team_id)
- `home_goals` INT NOT NULL
- `away_goals` INT NOT NULL

---

## 3) CSV format (must match)

All CSV files must include a header row.

### `seasons.csv`
Columns:
- `season_id`

### `teams.csv`
Columns:
- `team_id`  (integer, stable)
- `name`

### `players.csv`
Columns:
- `player_id` (integer, stable)
- `name`
- `birth_year` (empty allowed)

### `squad_memberships.csv`
Columns:
- `season_id`
- `team_id`
- `player_id`
- `shirt_number`
- `position`

### `matches.csv`
Columns:
- `season_id`
- `matchday`
- `kickoff_ts`  (ISO timestamp recommended: `YYYY-MM-DD HH:MM:SS`)
- `home_team_id`
- `away_team_id`
- `home_goals`
- `away_goals`

---

## 4) SQL scripts (db/)

### `db/schema.sql`
- Creates all tables with constraints as specified above.

### `db/load.sql`
- Uses `COPY` to load each CSV into the correct table.
- Load order:
  1) seasons
  2) teams
  3) players
  4) squad_memberships
  5) matches

### `db/indexes.sql` (required for query performance demos)
Create these indexes:

- `CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_name ON teams(name);`
- `CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);`
- `CREATE INDEX IF NOT EXISTS idx_squad_team_order ON squad_memberships(season_id, team_id, position, shirt_number);`
- `CREATE INDEX IF NOT EXISTS idx_matches_home_time ON matches(season_id, home_team_id, kickoff_ts);`
- `CREATE INDEX IF NOT EXISTS idx_matches_away_time ON matches(season_id, away_team_id, kickoff_ts);`

### `db/reset.sql`
- Drops tables in dependency order, then re-runs `schema.sql`.

---

## 5) Backend implementation (Node/Express + TypeScript)

### 5.1 Environment variables (backend/.env)
Create `backend/.env` from `backend/.env.example`:

Required:
- `DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME`
- `PORT=4000`

### 5.2 Database connection (backend/src/db.ts)
Use `pg` Pool:
- export a single Pool instance
- all route handlers use parameterized queries

### 5.3 API routes (fixed)

Base URL: `http://localhost:4000/api`

#### Seasons
- `GET /api/seasons`
  - returns list of seasons

#### Teams
- `GET /api/teams?season=2023-24`
  - returns all teams that appear in that season (derived from squad_memberships or matches)

- `GET /api/teams/:teamId/squad?season=2023-24`
  - returns squad list ordered by position then shirt_number

- `GET /api/teams/:teamId/matches?season=2023-24`
  - returns matches where team is home OR away, ordered by kickoff_ts

#### Players
- `GET /api/players/search?season=2023-24&q=son`
  - returns players matching case-insensitive pattern, with their team and position for that season

#### Admin (writes)
- `PATCH /api/admin/player/:playerId`
  - body: `{ "birth_year": 1998 }` or `{ "name": "New Name" }`
  - updates a single player row

- `PATCH /api/admin/match/:matchId`
  - body: `{ "home_goals": 2, "away_goals": 1 }`
  - updates a single match row

Notes:
- No authentication is required; admin is just a separate page and endpoint namespace.

---

## 6) Frontend implementation (React)

### 6.1 Environment variables (frontend/.env)
- `VITE_API_BASE_URL=http://localhost:4000/api`

### 6.2 Pages (fixed)

1) `Home.tsx`
- season selector (dropdown)

2) `Teams.tsx`
- list teams for selected season
- click team → navigate to `/team/:teamId`

3) `TeamDetail.tsx`
- tabs:
  - Squad: calls `GET /teams/:teamId/squad`
  - Matches: calls `GET /teams/:teamId/matches`

4) `PlayerSearch.tsx`
- search input
- calls `GET /players/search`
- show results table

5) `Admin.tsx`
- simple forms:
  - update player birth_year by playerId
  - update match score by matchId

---

## 7) Running the project (local)

### 7.1 Start PostgreSQL and load data
1) Create database (example name: `epl`)
2) Run:
```bash
psql -d epl -f db/schema.sql
psql -d epl -f db/load.sql
psql -d epl -f db/indexes.sql
```

### 7.2 Start backend
```bash
cd backend
npm install
npm run dev
```

Backend runs at `http://localhost:4000`.

### 7.3 Start frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## 8) Query plans (for report/demo)

During development and for the final report:
- Use `EXPLAIN (ANALYZE, BUFFERS)` on the key queries used by the endpoints:
  - player search
  - team squad view
  - team match history
- Capture and include the output in the final report to connect:
  - application operation → planner choice (seq scan vs index scan) → why it matters.
