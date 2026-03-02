import { useState } from "react";

const API = "/api";

export default function Admin() {
  // Player update
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerBirthYear, setPlayerBirthYear] = useState("");
  const [playerMsg, setPlayerMsg] = useState("");

  // Match update
  const [matchId, setMatchId] = useState("");
  const [homeGoals, setHomeGoals] = useState("");
  const [awayGoals, setAwayGoals] = useState("");
  const [matchMsg, setMatchMsg] = useState("");

  const updatePlayer = async () => {
    const body: any = {};
    if (playerName) body.name = playerName;
    if (playerBirthYear) body.birth_year = Number(playerBirthYear);

    try {
      const res = await fetch(`${API}/admin/player/${playerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setPlayerMsg(`Updated: ${data.name} (born ${data.birth_year})`);
      } else {
        setPlayerMsg(`Error: ${data.error}`);
      }
    } catch (err) {
      setPlayerMsg("Network error");
    }
  };

  const updateMatch = async () => {
    const body: any = {};
    if (homeGoals !== "") body.home_goals = Number(homeGoals);
    if (awayGoals !== "") body.away_goals = Number(awayGoals);

    try {
      const res = await fetch(`${API}/admin/match/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setMatchMsg(
          `Updated match ${data.match_id}: ${data.home_goals} – ${data.away_goals}`
        );
      } else {
        setMatchMsg(`Error: ${data.error}`);
      }
    } catch (err) {
      setMatchMsg("Network error");
    }
  };

  const sectionStyle = {
    border: "1px solid #ddd",
    padding: 16,
    marginBottom: 16,
    borderRadius: 4,
  };

  const inputStyle = { padding: 8, fontSize: 14, width: 200 };

  return (
    <div>
      <h2>Admin Panel</h2>

      <div style={sectionStyle}>
        <h3>Update Player</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <input
            style={inputStyle}
            placeholder="Player ID"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
          />
          <input
            style={inputStyle}
            placeholder="New name (optional)"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <input
            style={inputStyle}
            placeholder="New birth year (optional)"
            value={playerBirthYear}
            onChange={(e) => setPlayerBirthYear(e.target.value)}
          />
          <button onClick={updatePlayer} style={{ padding: "8px 16px" }}>
            Update
          </button>
        </div>
        {playerMsg && <p style={{ color: playerMsg.startsWith("Error") ? "red" : "green" }}>{playerMsg}</p>}
        <p style={{ color: "#888", fontSize: 12 }}>
          Tip: Find player IDs on the Team Squad or Player Search pages.
        </p>
      </div>

      <div style={sectionStyle}>
        <h3>Update Match Score</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <input
            style={inputStyle}
            placeholder="Match ID"
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
          />
          <input
            style={{ ...inputStyle, width: 120 }}
            placeholder="Home goals"
            value={homeGoals}
            onChange={(e) => setHomeGoals(e.target.value)}
          />
          <input
            style={{ ...inputStyle, width: 120 }}
            placeholder="Away goals"
            value={awayGoals}
            onChange={(e) => setAwayGoals(e.target.value)}
          />
          <button onClick={updateMatch} style={{ padding: "8px 16px" }}>
            Update
          </button>
        </div>
        {matchMsg && <p style={{ color: matchMsg.startsWith("Error") ? "red" : "green" }}>{matchMsg}</p>}
        <p style={{ color: "#888", fontSize: 12 }}>
          Tip: Find match IDs on the Team Matches tab.
        </p>
      </div>
    </div>
  );
}
