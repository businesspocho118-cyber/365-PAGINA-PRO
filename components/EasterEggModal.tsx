"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { EasterEggData } from "@/lib/easter-eggs";
import styles from "./EasterEggModal.module.css";

type EasterEggModalProps = {
  easterEgg: EasterEggData;
  onClose: () => void;
};

export function EasterEggModal({ easterEgg, onClose }: EasterEggModalProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const currentVideo = easterEgg.videos[currentVideoIndex] ?? easterEgg.videos[0];

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(root, { autoAlpha: 1 });
        return;
      }

      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
        .fromTo(
          `.${styles.dialog}`,
          { y: 36, scale: 0.92, autoAlpha: 0 },
          { y: 0, scale: 1, autoAlpha: 1, duration: 0.6, ease: "back.out(1.3)" },
          "-=0.15",
        );
    },
    { scope: rootRef },
  );

  const handleTabChange = (index: number) => {
    setCurrentVideoIndex(index);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
      ref={rootRef}
    >
      <section
        aria-describedby="easter-egg-desc"
        aria-labelledby="easter-egg-title"
        aria-modal="true"
        className={styles.dialog}
        data-lenis-prevent
        role="dialog"
      >
        <button
          aria-label="Cerrar recompensa secreta"
          className={styles.close}
          onClick={onClose}
          ref={closeRef}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M5 5l14 14M19 5 5 19" />
          </svg>
        </button>

        <div className={styles.header}>
          <div className={styles.badge}>{easterEgg.badge}</div>
          <h2 className={styles.title} id="easter-egg-title">
            {easterEgg.title}
          </h2>
          <p className={styles.subtitle}>{easterEgg.subtitle}</p>
          <p className={styles.description} id="easter-egg-desc">
            {easterEgg.description}
          </p>
        </div>

        <div className={styles.videoSection}>
          {easterEgg.videos.length > 1 ? (
            <div className={styles.playlistTabs} role="tablist">
              {easterEgg.videos.map((video, idx) => (
                <button
                  aria-selected={currentVideoIndex === idx}
                  className={`${styles.tabButton} ${currentVideoIndex === idx ? styles.tabButtonActive : ""}`}
                  key={video.src}
                  onClick={() => handleTabChange(idx)}
                  role="tab"
                  type="button"
                >
                  <span>📹 {video.title}</span>
                </button>
              ))}
            </div>
          ) : null}

          <div className={styles.videoWrapper}>
            <video
              autoPlay
              className={styles.videoPlayer}
              controls
              key={currentVideo.src}
              playsInline
              preload="metadata"
              ref={videoRef}
              src={currentVideo.src}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.actionButton} onClick={onClose} type="button">
            Continuar explorando el archivo
          </button>
        </div>
      </section>
    </div>
  );
}
