// Version adaptée pour multi-utilisateurs (clé dans body POST)

let cached_token = null;
let token_expires = 0; // Timestamp en ms

async function getAccessToken(client_id, client_secret, refresh_token) {
  const now = Date.now();
  // Optionnel : tu peux aussi cacher séparément les tokens par utilisateur
  if (cached_token && now < token_expires - 60000) {
    return cached_token;
  }
  const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) throw new Error("No access_token from Spotify");

  cached_token = tokenData.access_token;
  token_expires = Date.now() + (tokenData.expires_in * 1000);

  return cached_token;
}

export default async function handler(req, res) {
  // On attend un POST avec les credentials en body JSON
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { clientId, clientSecret, refreshToken } = req.body;

  if (!clientId || !clientSecret || !refreshToken) {
    res.status(400).json({ error: "Missing Spotify credentials" });
    return;
  }

  try {
    const access_token = await getAccessToken(clientId, clientSecret, refreshToken);

    const nowPlayingRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { 'Authorization': `Bearer ${access_token}` },
    });

    if (nowPlayingRes.status === 204 || nowPlayingRes.status > 400) {
      res.status(200).json(null);
      return;
    }

    const nowPlaying = await nowPlayingRes.json();
    const item = nowPlaying.item;

    if (!item) {
      res.status(200).json(null);
      return;
    }

    res.status(200).json({
      title: item.name,
      artist: item.artists?.map(a => a.name).join(', '),
      album: item.album?.name,
      albumImageUrl: item.album?.images?.[0]?.url,
      duration_ms: item.duration_ms,
      progress_ms: nowPlaying.progress_ms
    });

  } catch (err) {
    console.error("Erreur API nowplaying:", err);
    res.status(500).json({ error: "API error", details: err.message });
  }
}
