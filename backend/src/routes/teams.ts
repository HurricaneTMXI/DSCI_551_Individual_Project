import { Router } from "express";
import pool from "../db";

const router = Router();

// GET /api/teams?season=2023-24
router.get("/", async (req, res) => {
  try {
    const season = req.query.season as string | undefined;
    let query: string;
    let params: any[];

    if (season) {
      // Teams that appear in matches for this season
      query = `
        SELECT DISTINCT t.team_id, t.name
        FROM teams t
        JOIN (
          SELECT home_team_id AS tid FROM matches WHERE season_id = $1
          UNION
          SELECT away_team_id FROM matches WHERE season_id = $1
        ) m ON t.team_id = m.tid
        ORDER BY t.name
      `;
      params = [season];
    } else {
      query = "SELECT team_id, name FROM teams ORDER BY name";
      params = [];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

// GET /api/teams/:teamId/squad?season=2023-24
router.get("/:teamId/squad", async (req, res) => {
  try {
    const teamId = parseInt(req.params.teamId, 10);
    const season = (req.query.season as string) || "2023-24";

    const result = await pool.query(
      `SELECT sm.shirt_number, p.player_id, p.name, p.birth_year, sm.position
       FROM squad_memberships sm
       JOIN players p ON p.player_id = sm.player_id
       WHERE sm.season_id = $1 AND sm.team_id = $2
       ORDER BY
         CASE sm.position
           WHEN 'GK' THEN 1
           WHEN 'DF' THEN 2
           WHEN 'MF' THEN 3
           WHEN 'FW' THEN 4
         END,
         sm.shirt_number`,
      [season, teamId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch squad" });
  }
});

// GET /api/teams/:teamId/matches?season=2023-24
router.get("/:teamId/matches", async (req, res) => {
  try {
    const teamId = parseInt(req.params.teamId, 10);
    const season = (req.query.season as string) || "2023-24";

    const result = await pool.query(
      `SELECT m.match_id, m.matchday, m.kickoff_ts,
              m.home_team_id, ht.name AS home_team,
              m.away_team_id, at.name AS away_team,
              m.home_goals, m.away_goals
       FROM matches m
       JOIN teams ht ON ht.team_id = m.home_team_id
       JOIN teams at ON at.team_id = m.away_team_id
       WHERE m.season_id = $1
         AND (m.home_team_id = $2 OR m.away_team_id = $2)
       ORDER BY m.kickoff_ts`,
      [season, teamId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

export default router;
