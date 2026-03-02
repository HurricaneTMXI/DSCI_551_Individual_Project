import { Router } from "express";
import pool from "../db";

const router = Router();

// PATCH /api/admin/player/:playerId
router.patch("/player/:playerId", async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const { name, birth_year } = req.body;

    // Build SET clause dynamically
    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (name !== undefined) {
      sets.push(`name = $${idx++}`);
      values.push(name);
    }
    if (birth_year !== undefined) {
      sets.push(`birth_year = $${idx++}`);
      values.push(birth_year === null ? null : Number(birth_year));
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(playerId);
    const result = await pool.query(
      `UPDATE players SET ${sets.join(", ")} WHERE player_id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Player not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update player" });
  }
});

// PATCH /api/admin/match/:matchId
router.patch("/match/:matchId", async (req, res) => {
  try {
    const matchId = parseInt(req.params.matchId, 10);
    const { home_goals, away_goals } = req.body;

    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (home_goals !== undefined) {
      sets.push(`home_goals = $${idx++}`);
      values.push(Number(home_goals));
    }
    if (away_goals !== undefined) {
      sets.push(`away_goals = $${idx++}`);
      values.push(Number(away_goals));
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(matchId);
    const result = await pool.query(
      `UPDATE matches SET ${sets.join(", ")} WHERE match_id = $${idx} RETURNING
        match_id, season_id, matchday, kickoff_ts,
        home_team_id, away_team_id, home_goals, away_goals`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Match not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update match" });
  }
});

export default router;
