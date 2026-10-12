"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { Phase } from "@/lib/phases";
import styles from "./PhaseMedalModal.module.css";

type PhaseMedalModalProps = {
  phase: Phase;
  phaseNumber: number;
  isCanjeableUsed?: boolean;
  onClose: () => void;
};

export function PhaseMedalModal({ phase, phaseNumber, isCanjeableUsed = false, onClose }: PhaseMedalModalProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !rootRef.current) return;
      const focusable = Array.from(
        rootRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
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
        .fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.34 })
        .fromTo(
          `.${styles.medalStage}`,
          { y: 46, scale: 0.82, rotate: -5, autoAlpha: 0 },
          { y: 0, scale: 1, rotate: 0, autoAlpha: 1, duration: 0.72, ease: "back.out(1.45)" },
          "-=0.16",
        )
        .fromTo(
          `.${styles.copy} > *`,
          { y: 18, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, stagger: 0.07, duration: 0.38 },
          "-=0.38",
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
      <section
        aria-describedby="phase-medal-message"
        aria-labelledby="phase-medal-title"
        aria-modal="true"
        className={styles.dialog}
        data-lenis-prevent
        role="dialog"
      >
        <button
          aria-label="Cerrar medalla conseguida"
          className={styles.close}
          onClick={onClose}
          ref={closeRef}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M5 5l14 14M19 5 5 19" />
          </svg>
        </button>

        <div className={styles.medalStage}>
          <span aria-hidden="true" className={styles.halo} />
          <div
            aria-label={`${phase.medal.title}, ${isCanjeableUsed ? "sin medalla (canjeable usado)" : "conseguida"}`}
            className={isCanjeableUsed ? styles.medalArtworkForfeited : styles.medalArtwork}
            role="img"
          >
            {phase.medal.imageSrc ? (
              <img alt="" src={phase.medal.imageSrc} />
            ) : (
              <div className={styles.placeholder}>
                <svg aria-hidden="true" viewBox="0 0 64 64">
                  <path d="M19 7h26l5 18-18 31L14 25 19 7Z" />
                  <path d="m25 25 7-5 7 5-3 8 5 7-9-1-9 1 5-7-3-8Z" />
                </svg>
                <strong>{String(phaseNumber).padStart(2, "0")}</strong>
              </div>
            )}
            {isCanjeableUsed ? (
              <span className={styles.forfeitedBadge}>Canjeable usado</span>
            ) : null}
          </div>
        </div>

        <div className={styles.copy}>
          <span>
            {isCanjeableUsed
              ? `fase ${String(phaseNumber).padStart(2, "0")} resuelta · sin recompensa`
              : `fase ${String(phaseNumber).padStart(2, "0")} conseguida`}
          </span>
          <h2 id="phase-medal-title">{phase.medal.title}</h2>
          <p id="phase-medal-message">
            {isCanjeableUsed
              ? "Resolviste la fase y avanzás en el recorrido, pero como usaste el canjeable antes de resolverla, no obtuviste la medalla ni el audio de recompensa."
              : phase.medal.message}
          </p>
          {phase.audioSrc ? (
            !isCanjeableUsed ? (
              <div className={styles.audioReward}>
                <div className={styles.audioRewardHeader}>
                  <span className={styles.audioBadge}>Recompensa de fase</span>
                  <span className={styles.audioSubtitle}>Audio especial desbloqueado</span>
                </div>
                <audio controls className={styles.rewardAudioPlayer} src={phase.audioSrc} />
              </div>
            ) : (
              <div className={styles.audioRewardUsed}>
                <span className={styles.usedBadge}>⚠️ Sin recompensa de audio</span>
                <p className={styles.usedMessage}>
                  El audio y la medalla no se otorgan porque el canjeable fue utilizado previamente.
                </p>
              </div>
            )
          ) : null}
          <button className={styles.action} onClick={onClose} type="button">
            {isCanjeableUsed ? "Continuar" : "Guardar medalla"}
          </button>
        </div>
      </section>
    </div>
  );
}
