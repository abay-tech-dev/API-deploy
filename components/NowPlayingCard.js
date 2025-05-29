import React, { useEffect, useState } from "react";
import styles from "./NowPlayingCard.module.css";

export default function NowPlayingCard() {
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour fetch la track en cours toutes les secondes
  const fetchTrack = () => {
    fetch("/api/nowplaying")
      .then(res => res.json())
      .then(data => {
        setTrack(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchTrack();
    const interval = setInterval(fetchTrack, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format mm:ss
  function formatMs(ms) {
    if (!ms && ms !== 0) return "--:--";
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, "0")}`;
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
