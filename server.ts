import express from "express";
import { createServer as createViteServer } from "vite";

const BAD_WORDS = ['kut', 'lul', 'slet', 'hoer', 'kanker', 'tyfus', 'tering', 'mongool', 'klootzak', 'fuck', 'shit', 'bitch', 'dick', 'pussy', 'cunt', 'whore', 'slut', 'asshole', 'nigger', 'nigga', 'fag', 'faggot', 'penis', 'vagina', 'porno', 'porn'];

// ─── Matt Parker Pi-video cache ───────────────────────────────────────────────
// Stand-up Maths channel ID
const STANDUP_MATHS_CHANNEL_ID = "UCSju5G2aFaWMqn-_0YBtq5A";
const PI_KEYWORDS = /\bpi\b|π|pi-dag|pi day|3\.14/i;

interface YTVideo { id: string; title: string; published: string; }

let videoCache: { videos: YTVideo[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 uur

async function fetchMattParkerPiVideos(): Promise<YTVideo[]> {
  // YouTube biedt een gratis Atom-RSS feed per kanaal (geen API key nodig)
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${STANDUP_MATHS_CHANNEL_ID}`;
  const res = await fetch(feedUrl, { headers: { "Accept": "application/xml, text/xml" } });
  if (!res.ok) throw new Error(`YouTube feed returned ${res.status}`);
  const xml = await res.text();

  // Simpele regex-parser voor de Atom feed (vermijdt een extra XML-dependency)
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  const videoIdRegex = /<yt:videoId>([^<]+)<\/yt:videoId>/;
  const titleRegex   = /<title>([^<]+)<\/title>/;
  const publishedRegex = /<published>([^<]+)<\/published>/;

  const videos: YTVideo[] = [];
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const idMatch        = videoIdRegex.exec(entry);
    const titleMatch     = titleRegex.exec(entry);
    const publishedMatch = publishedRegex.exec(entry);
    if (!idMatch || !titleMatch) continue;

    const title = titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    if (PI_KEYWORDS.test(title)) {
      videos.push({
        id: idMatch[1],
        title,
        published: publishedMatch ? publishedMatch[1] : "",
      });
    }
  }

  return videos;
}

const containsProfanity = (text: string) => {
  const lower = text.toLowerCase();
  const noSpaces = lower.replace(/[\s_.-]+/g, '');
  
  const hasWord = BAD_WORDS.some(word => new RegExp(`\\b${word}\\b`, 'i').test(lower));
  
  const longBadWords = ['kanker', 'tyfus', 'tering', 'mongool', 'klootzak', 'asshole', 'faggot', 'bitch', 'pussy'];
  const hasHiddenWord = longBadWords.some(word => noSpaces.includes(word));
  
  return hasWord || hasHiddenWord;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json()); // Parse JSON bodies

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Matt Parker Pi-video's (YouTube RSS feed – geen API key nodig)
  app.get("/api/matt-parker-videos", async (_req, res) => {
    try {
      const now = Date.now();
      if (videoCache && now - videoCache.fetchedAt < CACHE_TTL_MS) {
        return res.json({ videos: videoCache.videos, cached: true });
      }
      const videos = await fetchMattParkerPiVideos();
      videoCache = { videos, fetchedAt: now };
      res.json({ videos, cached: false });
    } catch (error) {
      console.error("Matt Parker video fetch error:", error);
      res.status(500).json({ error: "Kon de video's niet ophalen. Probeer het later opnieuw." });
    }
  });

  // ─── CubeRover / Griffin-1 missie-data ──────────────────────────────────────
  // Proxy naar The Space Devs API (vermijdt CORS in de browser)
  let launchCache: { data: unknown; fetchedAt: number } | null = null;
  const LAUNCH_CACHE_TTL = 15 * 60 * 1000; // 15 minuten

  app.get("/api/cuberover-launch", async (_req, res) => {
    try {
      const now = Date.now();
      if (launchCache && now - launchCache.fetchedAt < LAUNCH_CACHE_TTL) {
        return res.json(launchCache.data);
      }
      // Zoek op "Griffin" in de aankomende lanceringen (Space Devs dev endpoint)
      const r = await fetch(
        "https://lldev.thespacedevs.com/2.2.0/launch/upcoming/?search=Griffin&limit=5",
        { headers: { "Accept": "application/json" } }
      );
      if (!r.ok) throw new Error(`Space Devs API: ${r.status}`);
      const data = await r.json();
      launchCache = { data, fetchedAt: now };
      res.json(data);
    } catch (err) {
      console.error("CubeRover launch fetch error:", err);
      res.status(500).json({ error: "Lanceerdata momenteel niet beschikbaar." });
    }
  });

  // Proxy voor maannieuws via rss2json (vermijdt CORS)
  let rssCache: { data: unknown; fetchedAt: number } | null = null;

  app.get("/api/cuberover-news", async (_req, res) => {
    try {
      const now = Date.now();
      if (rssCache && now - rssCache.fetchedAt < LAUNCH_CACHE_TTL) {
        return res.json(rssCache.data);
      }
      const rssUrl = encodeURIComponent("https://www.space.com/feeds/all");
      const r = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`, {
        headers: { "Accept": "application/json" }
      });
      if (!r.ok) throw new Error(`rss2json: ${r.status}`);
      const data = await r.json();
      rssCache = { data, fetchedAt: now };
      res.json(data);
    } catch (err) {
      console.error("CubeRover news fetch error:", err);
      res.status(500).json({ error: "Nieuws momenteel niet beschikbaar." });
    }
  });

  // Global Leaderboard API
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const response = await fetch("https://geraldburke.com/apis/simple-leaderboard-api/?action=topScores&gameID=36&count=50");
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Leaderboard fetch error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.post("/api/leaderboard", async (req, res) => {
    const { name, score } = req.body;
    
    if (!name || typeof name !== 'string' || typeof score !== 'number') {
      return res.status(400).json({ error: "Invalid data" });
    }

    if (containsProfanity(name)) {
      return res.status(400).json({ error: "Profanity not allowed" });
    }

    const cleanName = encodeURIComponent(name.trim().substring(0, 30)); // Max 30 chars

    try {
      const response = await fetch(`https://geraldburke.com/apis/simple-leaderboard-api/?action=newScore&gameID=36&score=${score}&userName=${cleanName}`);
      if (!response.ok) throw new Error("Failed to submit score");
      res.json({ success: true });
    } catch (error) {
      console.error("Leaderboard submit error:", error);
      res.status(500).json({ error: "Failed to submit score" });
    }
  });

  app.get("/api/search-pi", async (req, res) => {
    try {
      const q = req.query.q;
      if (!q) {
        return res.status(400).json({ error: "Missing query parameter 'q'" });
      }

      const response = await fetch(`https://www.angio.net/newpi/piquery?q=${q}`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error searching Pi:", error);
      res.status(500).json({ error: "Failed to search Pi" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
