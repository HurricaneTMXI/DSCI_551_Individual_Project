import { Router } from "express";
import pool from "../db";

const router = Router();

// GET /api/seasons
router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT season_id FROM seasons ORDER BY season_id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch seasons" });
  }
});

export default router;
