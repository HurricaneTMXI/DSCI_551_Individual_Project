-- load.sql — Load CSVs into PostgreSQL
-- Run from the project root: psql -d epl -f db/load.sql

-- 1) Seasons
\copy seasons(season_id) FROM 'data/seasons.csv' WITH (FORMAT csv, HEADER true);

-- 2) Teams
\copy teams(team_id, name) FROM 'data/teams.csv' WITH (FORMAT csv, HEADER true);

-- 3) Players
\copy players(player_id, name, birth_year) FROM 'data/players.csv' WITH (FORMAT csv, HEADER true, NULL '');

-- 4) Squad memberships
\copy squad_memberships(season_id, team_id, player_id, shirt_number, position) FROM 'data/squad_memberships.csv' WITH (FORMAT csv, HEADER true);

-- 5) Matches (match_id is SERIAL, auto-generated)
\copy matches(season_id, matchday, kickoff_ts, home_team_id, away_team_id, home_goals, away_goals) FROM 'data/matches.csv' WITH (FORMAT csv, HEADER true);

-- Reset sequences to match loaded data
SELECT setval('teams_team_id_seq', (SELECT MAX(team_id) FROM teams));
SELECT setval('players_player_id_seq', (SELECT MAX(player_id) FROM players));
SELECT setval('matches_match_id_seq', (SELECT MAX(match_id) FROM matches));
