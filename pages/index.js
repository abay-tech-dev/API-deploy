import { useEffect, useState } from "react";

export default function Home() {
  const [userId, setUserId] = useState(null);
  const [track, setTrack] = useState(null);

  // Récupère userId depuis l’URL après callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("userId");
    if (id) setUserId(id);
  }, []);

  // Fetch le “Now Playing”
  const fetchTrack = async () => {
    if (!userId) return;
    const res = await fetch(`/api/spotify/current?userId=${userId}`);
    const data = await res.json();
    setTrack(data);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", justifyContent: "center", background: "#181818" }}>
      {!userId ? (
        <a href="/api/auth/spotify/login">
          <button style={{ padding: "1rem 2rem", borderRadius: 999, background: "#1DB954", color: "#fff", border: "none", fontSize: "1.2rem" }}>
            Connecter Spotify
          </button>
        </a>
      ) : (
        <>
          <button onClick={fetchTrack} style={{ marginBottom: 20, padding: "0.7rem 1.5rem", borderRadius: 999, background: "#1DB954", color: "#fff", border: "none" }}>
            Afficher la musique en cours
          </button>
          {track && track.item && (
            <div style={{
              background: "#282828",
              borderRadius: 20,
              padding: 30,
              boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
              textAlign: "center",
              color: "#fff",
              maxWidth: 350
            }}>
              <img src={track.item.album.images[0].url} alt="album" width={250} style={{ borderRadius: 16, marginBottom: 20 }} />
              <h2 style={{ fontSize: 22 }}>{track.item.name}</h2>
              <p style={{ color: "#1DB954", fontWeight: 600, fontSize: 18 }}>{track.item.artists.map(a => a.name).join(', ')}</p>
              <p>{track.item.album.name}</p>
              <audio controls src={track.item.preview_url} style={{ marginTop: 20, width: "100%" }}/>
            </div>
          )}
        </>
      )}
    </div>
  );
}
