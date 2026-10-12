"use client";

import { useEffect, useState } from "react";

// Instancia singleton para que la música NUNCA se corte al desmontar o cambiar de pantalla en React
let sharedAudio: HTMLAudioElement | null = null;

function getSharedAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudio) {
    sharedAudio = new Audio("/365-assets/audio/musica-fondo.mp3");
    sharedAudio.loop = true;
    sharedAudio.volume = 0.16;
    sharedAudio.preload = "auto";
  }
  return sharedAudio;
}

export function BackgroundAudio() {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = getSharedAudio();
    if (!audio) return;

    const syncState = () => {
      setIsPlaying(!audio.paused);
    };

    audio.addEventListener("play", syncState);
    audio.addEventListener("pause", syncState);

    // Sincronizar estado actual
    setIsPlaying(!audio.paused);

    const userPrefersPaused = window.sessionStorage.getItem("secret-365-audio-paused") === "true";

    if (!userPrefersPaused && audio.paused) {
      const startAudio = () => {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      };

      startAudio();

      const handleFirstInteraction = () => {
        if (audio.paused && window.sessionStorage.getItem("secret-365-audio-paused") !== "true") {
          startAudio();
        }
        window.removeEventListener("pointerdown", handleFirstInteraction);
        window.removeEventListener("keydown", handleFirstInteraction);
      };

      window.addEventListener("pointerdown", handleFirstInteraction, { passive: true });
      window.addEventListener("keydown", handleFirstInteraction, { passive: true });

      return () => {
        audio.removeEventListener("play", syncState);
        audio.removeEventListener("pause", syncState);
        window.removeEventListener("pointerdown", handleFirstInteraction);
        window.removeEventListener("keydown", handleFirstInteraction);
      };
    }

    return () => {
      audio.removeEventListener("play", syncState);
      audio.removeEventListener("pause", syncState);
    };
  }, []);

  const togglePlayback = () => {
    const audio = getSharedAudio();
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
      window.sessionStorage.setItem("secret-365-audio-paused", "true");
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          window.sessionStorage.setItem("secret-365-audio-paused", "false");
        })
        .catch(() => {});
    }
  };

  return (
    <div className="bg-audio-container" aria-label="Música de fondo">
      <button
        type="button"
        className={`bg-audio-pill ${isPlaying ? "is-playing" : "is-paused"}`}
        onClick={togglePlayback}
        title={isPlaying ? "Pausar música de fondo" : "Reanudar música de fondo"}
      >
        <span className="bg-audio-icon">
          {isPlaying ? (
            <span className="equalizer-bars" aria-hidden="true">
              <span className="eq-bar eq-bar-1" />
              <span className="eq-bar eq-bar-2" />
              <span className="eq-bar eq-bar-3" />
            </span>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </span>
        <span className="bg-audio-label">
          {isPlaying ? "Música de fondo" : "Música en pausa"}
        </span>
        <span className="bg-audio-hint" aria-hidden="true">
          {isPlaying ? "Pausar" : "Play"}
        </span>
      </button>
    </div>
  );
}
