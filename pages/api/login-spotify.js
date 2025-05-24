const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

export default async function handler(req, res) {
  if (!req.query.code) {
    // Étape 1 : Redirige vers Spotify pour login
    const scopes = [
      "user-read-currently-playing",
      "user-read-playback-state"
    ].join(' ');
    const authUrl = 
      "https://accounts.spotify.com/authorize" +
      `?response_type=code` +
      `&client_id=${client_id}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&redirect_uri=${encodeURIComponent(redirect_uri)}`;
    res.redirect(authUrl);
    return;
  }

  // Étape 2 : Callback Spotify, échange code contre refresh_token
  const code = req.query.code;
  const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      redirect_uri,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenData.refresh_token) {
    res.status(400).json({ error: "No refresh token", details: tokenData });
    return;
  }

  // ⚠️ Affiche le refresh_token une fois (copie-le !)
  res.status(200).json({
    message: "Copie ce refresh_token et colle-le dans .env.local sous le nom SPOTIFY_REFRESH_TOKEN",
    refresh_token: tokenData.refresh_token,
    access_token: tokenData.access_token
  });
}
