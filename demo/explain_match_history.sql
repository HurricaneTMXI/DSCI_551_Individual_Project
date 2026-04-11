-- Match history for Arsenal (team_id = 2), season 2023-24
EXPLAIN ANALYZE
SELECT m.match_id, m.matchday, m.kickoff_ts,
       m.home_team_id, ht.name AS home_team,
       m.away_team_id, at.name AS away_team,
       m.home_goals, m.away_goals
FROM matches m
JOIN teams ht ON ht.team_id = m.home_team_id
JOIN teams at ON at.team_id = m.away_team_id
WHERE m.season_id = '2023-24'
  AND (m.home_team_id = 2 OR m.away_team_id = 2)
ORDER BY m.kickoff_ts;
