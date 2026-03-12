import type { VercelRequest, VercelResponse } from '@vercel/node';

const BAD_WORDS = ['kut', 'lul', 'slet', 'hoer', 'kanker', 'tyfus', 'tering', 'mongool', 'klootzak', 'fuck', 'shit', 'bitch', 'dick', 'pussy', 'cunt', 'whore', 'slut', 'asshole', 'nigger', 'nigga', 'fag', 'faggot', 'penis', 'vagina', 'porno', 'porn'];

const containsProfanity = (text: string) => {
  const lower = text.toLowerCase();
  const noSpaces = lower.replace(/[\s_.-]+/g, '');
  
  const hasWord = BAD_WORDS.some(word => new RegExp(`\\b${word}\\b`, 'i').test(lower));
  
  const longBadWords = ['kanker', 'tyfus', 'tering', 'mongool', 'klootzak', 'asshole', 'faggot', 'bitch', 'pussy'];
  const hasHiddenWord = longBadWords.some(word => noSpaces.includes(word));
  
  return hasWord || hasHiddenWord;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const response = await fetch("https://geraldburke.com/apis/simple-leaderboard-api/?action=topScores&gameID=36&count=50");
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error("Leaderboard fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  } else if (req.method === 'POST') {
    const { name, score } = req.body || {};
    
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
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Leaderboard submit error:", error);
      return res.status(500).json({ error: "Failed to submit score" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
