import { useState } from "react";

const API = "/api";

interface PlayerResult {
  player_id: number;
  name: string;
  birth_year: number | null;
  shirt_number: number;
  position: string;
  team_id: number;
  team_name: string;
}

export default function PlayerSearch({ season }: { season: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [searched, setSearched] = useState(false);

  const doSearch = () => {
    if (query.length < 1) return;
    setSearched(true);
    fetch(`${API}/players/search?season=${season}&q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then(setResults)
      .catch(console.error);
  };

  return (
    <div>
      <h2>Player Search — {season}</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doSearch()}
          placeholder="Search by name (e.g. Saka, Salah)"
          style={{ padding: 8, fontSize: 16, flex: 1 }}
        />
        <button onClick={doSearch} style={{ padding: "8px 16px", fontSize: 16 }}>
          Search
        </button>
      </div>

      {searched && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
              <th style={{ padding: 8 }}>Name</th>
              <th style={{ padding: 8 }}>Team</th>
              <th style={{ padding: 8 }}>#</th>
              <th style={{ padding: 8 }}>Pos</th>
              <th style={{ padding: 8 }}>Born</th>
              <th style={{ padding: 8 }}>ID</th>
            </tr>
          </thead>
          <tbody>
            {results.map((p, i) => (
              <tr key={`${p.player_id}-${i}`} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{p.name}</td>
                <td style={{ padding: 8 }}>{p.team_name}</td>
                <td style={{ padding: 8 }}>{p.shirt_number}</td>
                <td style={{ padding: 8 }}>{p.position}</td>
                <td style={{ padding: 8 }}>{p.birth_year ?? "—"}</td>
                <td style={{ padding: 8, color: "#888" }}>{p.player_id}</td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 16, textAlign: "center", color: "#888" }}>
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
