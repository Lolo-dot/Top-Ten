const express = require("express");
const axios = require("axios");
const router = express.Router();

// TMDb Watch Provider IDs for movies
const MOVIE_PROVIDERS = {
  netflix: 8,
  hulu: 15,
  disneyplus: 337,
  hbomax: 384,
  prime: 9,
};

// TMDb Network IDs for TV shows
const TV_NETWORKS = {
  netflix: 213,
  hulu: 453,
  disneyplus: 2739,
  hbomax: 3186,
  prime: 1024,
};

router.get("/top/:type/:platform", async (req, res) => {
  const { type, platform } = req.params;
  const endpoint = type === "movie" ? "movie" : "tv";
  let query;

  try {
    if (type === "movie") {
      const providerId = MOVIE_PROVIDERS[platform.toLowerCase()];
      if (!providerId)
        return res.status(400).json({ error: "Invalid movie platform" });

      query = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&with_watch_providers=${providerId}&watch_region=US&sort_by=popularity.desc`;
    } else {
      const networkId = TV_NETWORKS[platform.toLowerCase()];
      if (!networkId)
        return res.status(400).json({ error: "Invalid series platform" });

      query = `https://api.themoviedb.org/3/discover/tv?api_key=${process.env.TMDB_API_KEY}&with_networks=${networkId}&sort_by=popularity.desc`;
    }

    const tmdbRes = await axios.get(query);
    const top10 = tmdbRes.data.results.slice(0, 10);

    const enriched = await Promise.all(
      top10.map(async (item) => {
        try {
          const title = item.title || item.name;
          const omdbRes = await axios.get(
            `https://www.omdbapi.com/?apikey=${
              process.env.OMDB_API_KEY
            }&t=${encodeURIComponent(title)}`
          );
          return {
            ...item,
            title,
            imdbRating: omdbRes.data.imdbRating,
            rtScore: omdbRes.data.Ratings?.find(
              (r) => r.Source === "Rotten Tomatoes"
            )?.Value,
          };
        } catch {
          return item;
        }
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

module.exports = router;
