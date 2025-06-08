import axios from "axios";

globalThis.users = globalThis.users || {};

export default async function handler(req, res) {
  const { userId } = req.query;
  if (!userId || !globalThis.users[userId]) {
    return res.status(401).json({ error: "Utilisateur non authentifié" });
  }
  const refresh_token = globalThis.users[userId].refresh_token;

  try {
    // Récupère un access_token à partir du refresh_token
    const tokenRes = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    const { access_token } = tokenRes.data;

    // Récupère la musique en cours
    const playerRes = await axios.get(
      "https://api.spotify.com/v1/me/player/currently-playing",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    res.status(200).json(playerRes.data);
  } catch (err) {
    res.status(400).json({ error: "Impossible de récupérer la musique", details: err.message });
  }
}
