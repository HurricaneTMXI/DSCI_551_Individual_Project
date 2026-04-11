# EPL Squads & Matches

DSCI 551 Individual Project — Simou Chen | Spring 2026

A full-stack web application for browsing English Premier League squads and match results (seasons 2023-24 and 2024-25), built on **PostgreSQL 17** to demonstrate heap storage, B-tree indexes, and MVCC.

## Prerequisites

- **PostgreSQL 17** (running locally)
- **Node.js 18+** and npm

## Setup

### 1. Create the database and load data

```bash
createdb epl

# Run from the project root directory:
psql -d epl -f db/schema.sql
psql -d epl -f db/load.sql
psql -d epl -f db/indexes.sql
```

### 2. Configure the backend

Create a `backend/.env` file:

```
DATABASE_URL=postgresql://<your-username>@localhost:5432/epl
PORT=4000
```

Replace `<your-username>` with your PostgreSQL username (e.g. `simouchen`).

### 3. Start the backend

```bash
cd backend
npm install
npm run dev
```

The API server starts at `http://localhost:4000`.

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The UI opens at `http://localhost:5173`.

## Project Structure

```
data/              CSV datasets (seasons, teams, players, squad_memberships, matches)
db/                SQL scripts (schema.sql, load.sql, indexes.sql, reset.sql)
backend/           Express + TypeScript REST API
frontend/          React + Vite + TypeScript UI
```

## Features

| Page | Description |
|------|-------------|
| Teams | List all teams for a selected season |
| Team Detail | Squad tab (roster by position) and Matches tab (results with scores) |
| Player Search | Case-insensitive name search across players |
| Admin | Update player info or match scores via PATCH endpoints |

## Database Focus Areas

- **Heap storage + B-tree indexes:** Secondary indexes on player names, squad ordering, and match lookups enable index scans instead of full table scans. Use `EXPLAIN ANALYZE` on the key queries to observe planner choices.
- **MVCC:** Admin updates create new row versions without blocking concurrent readers, demonstrating PostgreSQL's multi-version concurrency control.

## Resetting the database

```bash
psql -d epl -f db/reset.sql
psql -d epl -f db/schema.sql
psql -d epl -f db/load.sql
psql -d epl -f db/indexes.sql
```

## Data Source

[OpenFootball — England](https://github.com/openfootball/england)
