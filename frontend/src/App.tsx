import { Routes, Route, Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import PlayerSearch from "./pages/PlayerSearch";
import Admin from "./pages/Admin";

const API = "/api";

function Home() {
  return (
    <div>
      <h2>Welcome to EPL Squads & Matches</h2>
      <p>Select a page from the navigation above, then choose a season.</p>
    </div>
  );
}

function App() {
  const [seasons, setSeasons] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const season = searchParams.get("season") || "";

  useEffect(() => {
    fetch(`${API}/seasons`)
      .then((r) => r.json())
      .then((data) => {
        const ids = data.map((s: any) => s.season_id);
        setSeasons(ids);
        if (!season && ids.length > 0) {
          setSearchParams({ season: ids[0] });
        }
      })
      .catch(console.error);
  }, []);

  const setSeason = (s: string) => {
    setSearchParams({ season: s });
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 960, margin: "0 auto", padding: 16 }}>
      <h1 style={{ borderBottom: "2px solid #333", paddingBottom: 8 }}>
        ⚽ EPL Squads & Matches
      </h1>

      <nav style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <Link to={`/?season=${season}`}>Home</Link>
        <Link to={`/teams?season=${season}`}>Teams</Link>
        <Link to={`/search?season=${season}`}>Player Search</Link>
        <Link to={`/admin?season=${season}`}>Admin</Link>
        <span style={{ marginLeft: "auto" }}>
          <label>
            Season:{" "}
            <select value={season} onChange={(e) => setSeason(e.target.value)}>
              {seasons.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </span>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teams" element={<Teams season={season} />} />
        <Route path="/team/:teamId" element={<TeamDetail season={season} />} />
        <Route path="/search" element={<PlayerSearch season={season} />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;
