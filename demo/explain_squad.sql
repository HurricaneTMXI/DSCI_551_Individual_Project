-- Squad view for Arsenal (team_id = 2), season 2023-24
EXPLAIN ANALYZE
SELECT sm.shirt_number, p.player_id, p.name, p.birth_year, sm.position
FROM squad_memberships sm
JOIN players p ON p.player_id = sm.player_id
WHERE sm.season_id = '2023-24' AND sm.team_id = 2
ORDER BY
  CASE sm.position
    WHEN 'GK' THEN 1
    WHEN 'DF' THEN 2
    WHEN 'MF' THEN 3
    WHEN 'FW' THEN 4
  END,
  sm.shirt_number;
