export default function handler(req, res) {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const redirect_uri = encodeURIComponent(process.env.SPOTIFY_REDIRECT_URI);
  const scopes = encodeURIComponent('user-read-currently-playing user-read-playback-state');
  res.redirect(
    `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${scopes}&redirect_uri=${redirect_uri}`
  );
}
