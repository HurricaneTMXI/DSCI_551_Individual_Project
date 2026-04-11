-- Player search: "Bruno" in season 2023-24
EXPLAIN ANALYZE
SELECT p.player_id, p.name, p.birth_year,
       sm.shirt_number, sm.position,
       t.team_id, t.name AS team_name
FROM players p
JOIN squad_memberships sm
  ON sm.player_id = p.player_id AND sm.season_id = '2023-24'
JOIN teams t ON t.team_id = sm.team_id
WHERE p.name ILIKE '%bruno%'
ORDER BY p.name
LIMIT 50;
