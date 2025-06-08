import axios from "axios";

// Simule une "base" utilisateur en mémoire
globalThis.users = globalThis.users || {};

export default async function handler(req, res) {
  const code = req.query.code;
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

  try {
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri,
        client_id,
        client_secret,
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { refresh_token } = tokenResponse.data;

    // Crée un "userId" temporaire (ici Date.now, à remplacer par login si tu veux)
    const userId = Date.now().toString();
    globalThis.users[userId] = { refresh_token };

    // Redirige le user sur la page front avec son userId
    res.redirect(`/?userId=${userId}`);
  } catch (err) {
    res.status(400).json({ error: "Callback failed", details: err.message });
  }
}
