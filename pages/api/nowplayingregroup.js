const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

// URL de login Spotify
const getSpotifyAuthUrl = () => {
  const scopes = [
    "user-read-currently-playing",
    "user-read-playback-state",
    "playlist-read-private",
    "user-library-read",
  ].join(' ');

  return (
    'https://accounts.spotify.com/authorize' +
    `?response_type=code` +
    `&client_id=${client_id}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&redirect_uri=${encodeURIComponent(redirect_uri)}`
  );
};


export default async function handler(req, res) {
  // 1. Premier passage : on redirige l'utilisateur vers Spotify
  if (!req.query.code) {
    res.redirect(getSpotifyAuthUrl());
    return;
  }

  // 2. Callback Spotify avec le code : on échange contre un access_token
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

  if (!tokenData.access_token) {
    res.status(400).json({ error: "No access token", details: tokenData });
    return;
  }

  // 3. On utilise le token pour récupérer les infos Spotify de l'utilisateur

  // -- Musique en cours
  const nowPlayingRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
  });

  let nowPlaying = {};
  if (nowPlayingRes.status === 200) {
    nowPlaying = await nowPlayingRes.json();
  }

  const item = nowPlaying.item;
if (!item) {
  res.status(200).json(null); // aucune musique en cours
  return;
}

res.status(200).json({
  title: item.name,
  artist: item.artists?.map(a => a.name).join(', '),
  album: item.album?.name,
  albumImageUrl: item.album?.images?.[0]?.url,
});

}
