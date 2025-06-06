import React, { useEffect, useState } from "react";
import styles from "./NowPlayingCard.module.css";

export default function NowPlayingCard() {
  // States pour les credentials Spotify
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  // State pour la track
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(false);

  // Formulaire de connexion
  function handleSubmit(e) {
    e.preventDefault();
    setIsConnected(true);
  }

  // Fetch la musique toutes les secondes si connecté
  useEffect(() => {
    if (!isConnected) return;

    setLoading(true);

    const fetchTrack = () => {
      fetch("/api/nowplaying", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, clientSecret, refreshToken }),
      })
        .then(res => res.json())
        .then(data => {
          setTrack(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    fetchTrack(); // première récupération
    const interval = setInterval(fetchTrack, 1000); // toutes les secondes

    return () => clearInterval(interval);
  }, [isConnected, clientId, clientSecret, refreshToken]);

  // Format mm:ss
  function formatMs(ms) {
    if (!ms && ms !== 0) return "--:--";
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  // Formulaire AVANT la carte
  if (!isConnected) {
    return (
      <form
        className={styles.npcard}
        onSubmit={handleSubmit}
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: "#191414",
          color: "#fff",
          boxShadow: "0 8px 40px #0a0f1d77, 0 2px 6px #1db95433",
        }}
      >
        <div>
          <label>Client ID</label><br />
          <input
            type="text"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            required
            style={{ width: 250, borderRadius: 8, marginTop: 4 }}
          />
        </div>
        <div>
          <label>Client Secret</label><br />
          <input
            type="password"
            value={clientSecret}
            onChange={e => setClientSecret(e.target.value)}
            required
            style={{ width: 250, borderRadius: 8, marginTop: 4 }}
          />
        </div>
        <div>
          <label>Refresh Token</label><br />
          <input
            type="text"
            value={refreshToken}
            onChange={e => setRefreshToken(e.target.value)}
            required
            style={{ width: 250, borderRadius: 8, marginTop: 4 }}
          />
        </div>
        <button
          type="submit"
          style={{
            marginTop: 18,
            padding: "8px 24px",
            background: "#1db954",
            color: "#191414",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: "1.06rem",
            cursor: "pointer",
            boxShadow: "0 1px 8px #1db95455",
            letterSpacing: "1px",
          }}
        >
          Se connecter à Spotify
        </button>
      </form>
    );
  }

  if (loading) return <div className={styles.npcard}>Chargement…</div>;
  if (!track) return <div className={styles.npcard}>Aucune musique en cours</div>;

  const { albumImageUrl, title, artist, duration_ms, progress_ms } = track;

  return (
    <div className={styles.npcard} style={{ backgroundImage: `url(${albumImageUrl})` }}>
      <div className={styles.overlay}>
        <div className={styles.content}>
          <div className={styles.title}>{title}</div>
          <div className={styles.artist}>{artist}</div>
        </div>
        <div className={styles.progressRow}>
          <span className={styles.time}>{formatMs(progress_ms)}</span>
          <div className={styles.progressBarBG}>
            <div
              className={styles.progressBar}
              style={{ width: `${(progress_ms / duration_ms) * 100}%` }}
            />
          </div>
          <span className={styles.time}>{formatMs(duration_ms)}</span>
        </div>
      </div>
    </div>
  );
}
