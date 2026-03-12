import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const q = req.query.q as string;
      if (!q) {
        return res.status(400).json({ error: "Missing query parameter 'q'" });
      }

      const response = await fetch(`https://www.angio.net/newpi/piquery?q=${q}`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error searching Pi:", error);
      return res.status(500).json({ error: "Failed to search Pi" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
