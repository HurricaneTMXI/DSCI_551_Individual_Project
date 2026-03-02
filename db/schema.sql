-- schema.sql — EPL Squads & Matches (DSCI 551)

CREATE TABLE IF NOT EXISTS seasons (
    season_id TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS teams (
    team_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS players (
    player_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    birth_year INT NULL
);

CREATE TABLE IF NOT EXISTS squad_memberships (
    season_id TEXT NOT NULL REFERENCES seasons(season_id),
    team_id INT NOT NULL REFERENCES teams(team_id),
    player_id INT NOT NULL REFERENCES players(player_id),
    shirt_number INT NOT NULL,
    position TEXT NOT NULL,
    PRIMARY KEY (season_id, team_id, player_id)
);

CREATE TABLE IF NOT EXISTS matches (
    match_id SERIAL PRIMARY KEY,
    season_id TEXT NOT NULL REFERENCES seasons(season_id),
    matchday INT NOT NULL,
    kickoff_ts TIMESTAMP NOT NULL,
    home_team_id INT NOT NULL REFERENCES teams(team_id),
    away_team_id INT NOT NULL REFERENCES teams(team_id),
    home_goals INT NOT NULL,
    away_goals INT NOT NULL
);
