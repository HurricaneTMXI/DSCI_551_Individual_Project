# DSCI 551 Course Project Idea (Spring ’26)

## Title
**EPL Squads & Matches App (PostgreSQL)**

## What the application is
A small, runnable system that uses **PostgreSQL** to support:
- **User (read-only):** search and query EPL teams, squads, and match results
- **Admin (write):** manually update existing data entries (e.g., fix a player field or match score)

This satisfies the “application” requirement: at least one working feature/query and runnable by the instructor/TA, with a small dataset included. 

---

## Database
- **PostgreSQL**

---

## Dataset
- **Public dataset (real):** OpenFootball EPL text files
- **Scope:** Premier League seasons **2023–24** and **2024–25**
- **Included in submission:** a small dataset extracted from those seasons (matches + squads). 

Example formats in the dataset:
- Matches include matchday/date/time and scores (e.g., `15.00 ... 0-2 ...`). 
- Squads include shirt number, player name, position, and birth year (e.g., `1, Aaron Ramsdale, GK, b. 1998`). 

---

## Core internal focus areas (2)
### Focus Area 1 — Heap storage + secondary B-tree indexes
PostgreSQL stores table data in heap pages and uses separate secondary B-tree indexes for fast lookups and ordered retrieval.

### Focus Area 2 — MVCC (concurrent read & write)
PostgreSQL uses MVCC so user queries can run while admin updates occur without blocking reads. 

---

## Schema (based on the existing text data)
### `seasons`
- `season_id` (PK) — e.g., `2023-24`, `2024-25`

### `teams`
- `team_id` (PK)
- `name` (unique)

### `players`
- `player_id` (PK)
- `name`
- `birth_year` (nullable)

### `squad_memberships`
- `season_id` (FK → seasons)
- `team_id` (FK → teams)
- `player_id` (FK → players)
- `shirt_number`
- `position` (GK/DF/MF/FW)
- PK: (`season_id`, `team_id`, `player_id`)

### `matches`
- `match_id` (PK)
- `season_id` (FK → seasons)
- `matchday`
- `kickoff_ts`
- `home_team_id` (FK → teams)
- `away_team_id` (FK → teams)
- `home_goals`
- `away_goals`

---

## Major application operations (for internals mapping)
For each operation, the final report will explicitly explain:
1) what the app does, 2) what PostgreSQL does internally, 3) why it matters. 

### User operations (read-only)
1. **Player search by name**
   - Find players by name pattern and show their team/position for a season.
2. **Team squad view**
   - View all squad members for a team in a season, ordered by position and shirt number.
3. **Team match history**
   - List matches for a team in a season, ordered by kickoff time.

### Admin operation (write)
4. **Manual update of an entry**
   - Update a player field (e.g., birth_year) or match score; demonstrate MVCC behavior during concurrent reads. 
