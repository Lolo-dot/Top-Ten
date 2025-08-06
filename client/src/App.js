import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css"; // We'll add styles next

const platformLogos = {
  Netflix: "/netflix.png",
  Hulu: "/hulu.png",
  "Prime Video": "/prime_video.png",
  "Disney+": "/disneyplus.png",
  "HBO Max": "/max.png",
};

const PLATFORMS = [
  { name: "Netflix", id: "netflix" },
  { name: "Hulu", id: "hulu" },
  { name: "Disney+", id: "disneyplus" },
  { name: "HBO Max", id: "hbomax" },
  { name: "Prime Video", id: "prime" },
  { name: "Popular Anime", id: "crunchyroll" },
];

function App() {
  const [activeTab, setActiveTab] = useState("shows");
  const [seriesData, setSeriesData] = useState({});
  const [movieData, setMovieData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const seriesResults = {};
      const movieResults = {};

      for (const platform of PLATFORMS) {
        try {
          const [seriesRes, movieRes] = await Promise.all([
            axios.get(
              `https://top-ten-backend.vercel.app/api/shows/top/series/${platform.id}`
            ),
            axios.get(
              `https://top-ten-backend.vercel.app/api/shows/top/movie/${platform.id}`
            ),
          ]);
          seriesResults[platform.name] = seriesRes.data;
          movieResults[platform.name] = movieRes.data;
        } catch (err) {
          console.error(`Error loading ${platform.name}:`, err);
          seriesResults[platform.name] = [];
          movieResults[platform.name] = [];
        }
      }

      setSeriesData(seriesResults);
      setMovieData(movieResults);
      setLoading(false);
    }

    fetchAll();
  }, []);

  const renderPlatformSection = (title, items) => (
    <div key={title} className="platform-section">
      <h2>
        <img
          src={platformLogos[title]}
          alt={title}
          style={{ height: "120px", width: "120px", marginBottom: "10px" }}
        />
      </h2>
      <div className="scroll-row">
        {items.map((item, index) => (
          <div key={item.id} className="card">
            <div className="card-rank">
              {String(index + 1).padStart(2, "0")}
            </div>
            <img
              src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
              alt={item.title}
            />
            <div className="card-title">{item.title}</div>
            <div className="card-meta">
              IMDb: {item.imdbRating || "N/A"}
              <br />
              RT: {item.rtScore || "N/A"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const currentData = activeTab === "shows" ? seriesData : movieData;

  return (
    <div className="app">
      <div className="toggle-switch">
        <button
          className={activeTab === "shows" ? "active" : ""}
          onClick={() => setActiveTab("shows")}
        >
          Shows
        </button>
        <button
          className={activeTab === "movies" ? "active" : ""}
          onClick={() => setActiveTab("movies")}
        >
          Movies
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        PLATFORMS.map((p) =>
          currentData[p.name]?.length > 0
            ? renderPlatformSection(p.name, currentData[p.name])
            : null
        )
      )}
    </div>
  );
}

export default App;
