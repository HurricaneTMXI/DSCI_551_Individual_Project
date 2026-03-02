import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

const API = "/api";

interface Player {
  player_id: number;
  name: string;
  birth_year: number | null;
  shirt_number: number;
  position: string;
}

interface Match {
  match_id: number;
  matchday: number;
  kickoff_ts: string;
  home_team: string;
  away_team: string;
  home_goals: number;
  away_goals: number;
  home_team_id: number;
  away_team_id: number;
}

export default function TeamDetail({ season }: { season: string }) {
  const { teamId } = useParams<{ teamId: string }>();
  const [searchParams] = useSearchParams();
  const activeSeason = searchParams.get("season") || season;

  const [tab, setTab] = useState<"squad" | "matches">("squad");
  const [squad, setSquad] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamName, setTeamName] = useState("");

  useEffect(() => {
    if (!teamId || !activeSeason) return;

    fetch(`${API}/teams/${teamId}/squad?season=${activeSeason}`)
      .then((r) => r.json())
      .then((data) => setSquad(data))
      .catch(console.error);

    fetch(`${API}/teams/${teamId}/matches?season=${activeSeason}`)
      .then((r) => r.json())
      .then((data) => {
        setMatches(data);
        if (data.length > 0) {
          const tid = Number(teamId);
          setTeamName(
            data[0].home_team_id === tid ? data[0].home_team : data[0].away_team
          );
        }
      })
      .catch(console.error);
  }, [teamId, activeSeason]);

  const tabStyle = (active: boolean) => ({
    padding: "8px 16px",
    cursor: "pointer" as const,
    borderBottom: active ? "3px solid #333" : "3px solid transparent",
    fontWeight: active ? "bold" as const : "normal" as const,
    background: "none",
    border: "none",
    fontSize: 16,
  });

  return (
    <div>
      <h2>{teamName || `Team ${teamId}`} — {activeSeason}</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button style={tabStyle(tab === "squad")} onClick={() => setTab("squad")}>
          Squad
        </button>
        <button style={tabStyle(tab === "matches")} onClick={() => setTab("matches")}>
          Matches
        </button>
      </div>

      {tab === "squad" && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
              <th style={{ padding: 8 }}>#</th>
              <th style={{ padding: 8 }}>Name</th>
              <th style={{ padding: 8 }}>Pos</th>
              <th style={{ padding: 8 }}>Born</th>
              <th style={{ padding: 8 }}>Player ID</th>
            </tr>
          </thead>
          <tbody>
            {squad.map((p) => (
              <tr key={p.player_id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{p.shirt_number}</td>
                <td style={{ padding: 8 }}>{p.name}</td>
                <td style={{ padding: 8 }}>{p.position}</td>
                <td style={{ padding: 8 }}>{p.birth_year ?? "—"}</td>
                <td style={{ padding: 8, color: "#888" }}>{p.player_id}</td>
              </tr>
            ))}
            {squad.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 16, textAlign: "center", color: "#888" }}>
                  No squad data for this team/season
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {tab === "matches" && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
              <th style={{ padding: 8 }}>MD</th>
              <th style={{ padding: 8 }}>Date</th>
              <th style={{ padding: 8 }}>Home</th>
              <th style={{ padding: 8 }}>Score</th>
              <th style={{ padding: 8 }}>Away</th>
              <th style={{ padding: 8 }}>ID</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => {
              const isHome = m.home_team_id === Number(teamId);
              const won = isHome
                ? m.home_goals > m.away_goals
                : m.away_goals > m.home_goals;
              const draw = m.home_goals === m.away_goals;
              const color = won ? "#2a7" : draw ? "#888" : "#c44";

              return (
                <tr key={m.match_id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: 8 }}>{m.matchday}</td>
                  <td style={{ padding: 8 }}>
                    {new Date(m.kickoff_ts).toLocaleDateString()}
                  </td>
                  <td style={{ padding: 8, fontWeight: isHome ? "bold" : "normal" }}>
                    {m.home_team}
                  </td>
                  <td style={{ padding: 8, fontWeight: "bold", color }}>
                    {m.home_goals} – {m.away_goals}
                  </td>
                  <td style={{ padding: 8, fontWeight: !isHome ? "bold" : "normal" }}>
                    {m.away_team}
                  </td>
                  <td style={{ padding: 8, color: "#888" }}>{m.match_id}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
