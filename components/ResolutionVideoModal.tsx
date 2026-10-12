"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import styles from "./ResolutionVideoModal.module.css";

type ResolutionVideoModalProps = {
  phaseNumber: number;
  phaseTitle: string;
  videoSrc: string;
  onClose: () => void;
};

export function ResolutionVideoModal({
  phaseNumber,
  phaseTitle,
  videoSrc,
  onClose,
}: ResolutionVideoModalProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
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

      gsap.fromTo(
        root,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.28, ease: "power2.out" },
      );
      gsap.fromTo(
        `.${styles.modal}`,
        { y: 28, scale: 0.94, autoAlpha: 0 },
        { y: 0, scale: 1, autoAlpha: 1, duration: 0.45, ease: "back.out(1.4)" },
      );
    },
    { scope: rootRef },
  );

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
      ref={rootRef}
    >
      <div
        aria-labelledby="resolution-video-title"
        aria-modal="true"
        className={styles.modal}
        role="dialog"
      >
        <header className={styles.header}>
          <div>
            <span className={styles.badge}>🎬 RESOLUCIÓN OFICIAL</span>
            <h2 id="resolution-video-title">Fase {phaseNumber}: {phaseTitle}</h2>
            <p>Video explicativo con la solución completa del enigma.</p>
          </div>
          <button
            aria-label="Cerrar video"
            className={styles.closeButton}
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            ✕
          </button>
        </header>

        <div className={styles.playerShell}>
          <video
            autoPlay
            className={styles.video}
            controls
            playsInline
            preload="metadata"
            ref={videoRef}
            src={videoSrc}
          />
        </div>

        <footer className={styles.footer}>
          <span className={styles.notice}>
            ⚠️ Recuerda que al haber utilizado el comodín, la medalla y el audio de esta fase quedan anulados.
          </span>
          <button className={styles.closeFooterBtn} onClick={onClose} type="button">
            Cerrar video
          </button>
        </footer>
      </div>
    </div>
  );
}
