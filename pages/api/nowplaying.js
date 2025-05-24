const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN; 

let cached_token = null;
let token_expires = 0; // Timestamp en ms

async function getAccessToken() {
  const now = Date.now();
  if (cached_token && now < token_expires - 60000) { // Prends une marge de 1 min
    return cached_token;
  }
  // Demande un nouveau token avec le refresh_token
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
  token_expires = Date.now() + (tokenData.expires_in * 1000); // expires_in en secondes

  return cached_token;
}

export default async function handler(req, res) {
  try {
    const access_token = await getAccessToken();

    // Appelle l'API Spotify "now playing"
    const nowPlayingRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { 'Authorization': `Bearer ${access_token}` },
    });

    if (nowPlayingRes.status === 204 || nowPlayingRes.status > 400) {
      res.status(200).json(null); // Pas de musique en cours ou erreur
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
