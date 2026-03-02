-- indexes.sql — Create secondary B-tree indexes for query performance
-- These are the indexes referenced in the DSCI 551 report for internals mapping.

-- Fast team lookup by name (already UNIQUE on table, but explicit index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_name
    ON teams(name);

-- Player name search (ILIKE / pattern matching)
CREATE INDEX IF NOT EXISTS idx_players_name
    ON players(name);

-- Squad view: ordered by position then shirt_number for a given season+team
CREATE INDEX IF NOT EXISTS idx_squad_team_order
    ON squad_memberships(season_id, team_id, position, shirt_number);

-- Match history: find matches by season + home team, ordered by kickoff
CREATE INDEX IF NOT EXISTS idx_matches_home_time
    ON matches(season_id, home_team_id, kickoff_ts);

-- Match history: find matches by season + away team, ordered by kickoff
CREATE INDEX IF NOT EXISTS idx_matches_away_time
    ON matches(season_id, away_team_id, kickoff_ts);
