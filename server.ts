import express from "express";
import { createServer as createViteServer } from "vite";

const BAD_WORDS = ['kut', 'lul', 'slet', 'hoer', 'kanker', 'tyfus', 'tering', 'mongool', 'klootzak', 'fuck', 'shit', 'bitch', 'dick', 'pussy', 'cunt', 'whore', 'slut', 'asshole', 'nigger', 'nigga', 'fag', 'faggot', 'penis', 'vagina', 'porno', 'porn'];

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
