import { Router } from "express";
import pool from "../db";

const router = Router();

// GET /api/players/search?season=2023-24&q=saka
router.get("/search", async (req, res) => {
  try {
    const season = (req.query.season as string) || "2023-24";
    const q = (req.query.q as string) || "";

    if (q.length < 1) {
      return res.json([]);
    }

    const result = await pool.query(
      `SELECT p.player_id, p.name, p.birth_year,
              sm.shirt_number, sm.position,
              t.team_id, t.name AS team_name
       FROM players p
       JOIN squad_memberships sm
         ON sm.player_id = p.player_id AND sm.season_id = $1
       JOIN teams t ON t.team_id = sm.team_id
       WHERE p.name ILIKE $2
       ORDER BY p.name
       LIMIT 50`,
      [season, `%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to search players" });
  }
});

export default router;
