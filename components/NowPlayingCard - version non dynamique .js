import React, { useEffect, useState } from "react";
import styles from "./NowPlayingCard.module.css";

export default function NowPlayingCard() {
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/nowplaying")
      .then(res => res.json())
      .then(data => {
        setTrack(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
    <div className={styles.spotifyBg}>
      <div className={styles.npcard} style={{ backgroundImage: `url(${albumImageUrl})` }}>
        <div className={styles.overlay}>
          <div className={styles.content}>
            <div className={styles.title}>{title}</div>
            <div className={styles.artist}>{artist}</div>
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
            <div className={styles.playBtn}>
              <svg viewBox="0 0 32 32" width="36" height="36">
                <circle cx="16" cy="16" r="16" fill="#1db954" />
                <polygon points="12,8 26,16 12,24" fill="#fff" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}