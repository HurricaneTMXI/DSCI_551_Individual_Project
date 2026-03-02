import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "/api";

interface Team {
  team_id: number;
  name: string;
}

export default function Teams({ season }: { season: string }) {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    if (!season) return;
    fetch(`${API}/teams?season=${season}`)
      .then((r) => r.json())
      .then(setTeams)
      .catch(console.error);
  }, [season]);

  return (
    <div>
      <h2>Teams — {season}</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
            <th style={{ padding: 8 }}>ID</th>
            <th style={{ padding: 8 }}>Team</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => (
            <tr key={t.team_id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>{t.team_id}</td>
              <td style={{ padding: 8 }}>
                <Link to={`/team/${t.team_id}?season=${season}`}>{t.name}</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
