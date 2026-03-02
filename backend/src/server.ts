import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import seasonsRouter from "./routes/seasons";
import teamsRouter from "./routes/teams";
import playersRouter from "./routes/players";
import adminRouter from "./routes/admin";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/seasons", seasonsRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/players", playersRouter);
app.use("/api/admin", adminRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
