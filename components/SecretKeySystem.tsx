"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  finalSecret,
  importantSecretKeys,
  importantSecretKeysByValue,
  normalizeSecretEntry,
  normalSecretKeys,
  type NormalSecretKey,
  type SecretGameId,
} from "@/lib/secret-keys";
import { SecretGameModal } from "@/components/SecretGameModal";
import styles from "./SecretKeySystem.module.css";

type SecretKeyProgress = {
  activatedNormalKeys: string[];
  completedGames: SecretGameId[];
  finalUnlocked: boolean;
};

const storageKey = "secret-365-key-progress-v1";
const emptyProgress: SecretKeyProgress = {
  activatedNormalKeys: [],
  completedGames: [],
  finalUnlocked: false,
};

type SecretKeySystemProps = {
  onNormalKeyCountChange?: (count: number) => void;
};

type ActiveGame = {
  id: SecretGameId;
  mode: "play" | "review";
  nonce: number;
};

function ClueIcon({ index, locked }: { index: number; locked: boolean }) {
  const ornament = index % 2 === 0 ? "M12 3v3M12 18v3M3 12h3M18 12h3" : "M5 5l2.2 2.2M16.8 16.8 19 19M19 5l-2.2 2.2M7.2 16.8 5 19";

  return (
    <svg aria-hidden="true" height="18" viewBox="0 0 24 24" width="18">
      {locked ? (
        <>
          <rect height="9" rx="1.5" width="12" x="6" y="11" />
          <path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3M12 14.5v2" />
        </>
      ) : (
        <>
          <path d="M8.5 11V8a3.5 3.5 0 0 1 6.1-2.3" />
          <rect height="9" rx="1.5" width="12" x="6" y="11" />
          <path d="m9.5 15 1.7 1.7 3.6-3.6" />
          <path d={ornament} opacity="0.65" />
        </>
      )}
    </svg>
  );
}

function ClueStateIcon({ locked }: { locked: boolean }) {
  return (
    <svg aria-hidden="true" height="15" viewBox="0 0 24 24" width="15">
      {locked ? (
        <>
          <rect height="9" rx="1.5" width="12" x="6" y="11" />
          <path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
        </>
      ) : (
        <path d="m5 12.5 4.25 4.25L19 7" />
      )}
    </svg>
  );
}

function readProgress(): SecretKeyProgress {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return emptyProgress;
    const parsed = JSON.parse(raw) as Partial<SecretKeyProgress>;
    const validGames = new Set(importantSecretKeys.map((secret) => secret.id));
    return {
      activatedNormalKeys: Array.isArray(parsed.activatedNormalKeys)
        ? parsed.activatedNormalKeys.filter((key) => Boolean(normalSecretKeys[key]))
        : [],
      completedGames: Array.isArray(parsed.completedGames)
        ? parsed.completedGames.filter((id): id is SecretGameId => validGames.has(id as SecretGameId))
        : [],
      finalUnlocked: Boolean(parsed.finalUnlocked),
    };
  } catch {
    return emptyProgress;
  }
}

export function SecretKeySystem({ onNormalKeyCountChange }: SecretKeySystemProps) {
  const [progress, setProgress] = useState<SecretKeyProgress>(emptyProgress);
  const [hydrated, setHydrated] = useState(false);
  const [entry, setEntry] = useState("");
  const [status, setStatus] = useState("");
  const [activeGameState, setActiveGameState] = useState<ActiveGame | null>(null);
  const [activeNormal, setActiveNormal] = useState<{ secret: NormalSecretKey; nonce: number } | null>(null);
  const [showFinal, setShowFinal] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const gameNonceRef = useRef(0);
  const pendingClueAnimationRef = useRef<SecretGameId | null>(null);

  const completedSet = useMemo(() => new Set(progress.completedGames), [progress.completedGames]);
  const allCluesFound = importantSecretKeys.every((secret) => completedSet.has(secret.id));
  const activeGame = activeGameState
    ? importantSecretKeys.find((secret) => secret.id === activeGameState.id) ?? null
    : null;

  useEffect(() => {
    setProgress(readProgress());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [hydrated, progress]);

  useEffect(() => {
    if (!hydrated) return;
    onNormalKeyCountChange?.(progress.activatedNormalKeys.length);
  }, [hydrated, onNormalKeyCountChange, progress.activatedNormalKeys.length]);

  useEffect(() => {
    if (!activeNormal) return;
    const timeout = window.setTimeout(() => setActiveNormal(null), 6200);
    return () => window.clearTimeout(timeout);
  }, [activeNormal]);

  useGSAP(
    () => {
      if (!activeNormal) return;
      const toast = sectionRef.current?.querySelector(`.${styles.normalReward}`);
      if (!toast) return;
      gsap.fromTo(toast, { y: 22, scale: 0.96, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.42, ease: "power3.out" });
      gsap.fromTo(
        toast.querySelectorAll(`.${styles.effectParticle}`),
        { scale: 0.2, autoAlpha: 0, rotate: -30 },
        { scale: 1, autoAlpha: 1, rotate: 0, stagger: 0.055, duration: 0.5, ease: "back.out(2)" },
      );
    },
    { dependencies: [activeNormal?.nonce], scope: sectionRef },
  );

  const closeGame = useCallback(() => {
    setActiveGameState(null);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const completeGame = useCallback(
    (id: SecretGameId) => {
      if (!completedSet.has(id)) pendingClueAnimationRef.current = id;
      setProgress((current) => ({
        ...current,
        completedGames: current.completedGames.includes(id)
          ? current.completedGames
          : [...current.completedGames, id],
      }));
    },
    [completedSet],
  );

  const openGame = useCallback((id: SecretGameId, mode: ActiveGame["mode"]) => {
    gameNonceRef.current += 1;
    setActiveGameState({ id, mode, nonce: gameNonceRef.current });
  }, []);

  useEffect(() => {
    if (activeGameState || !pendingClueAnimationRef.current) return;
    const clueId = pendingClueAnimationRef.current;
    pendingClueAnimationRef.current = null;
    const card = sectionRef.current?.querySelector<HTMLElement>(`[data-clue-id="${clueId}"]`);
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      card,
      { y: 22, scale: 0.92, boxShadow: "0 0 0 rgba(73, 255, 194, 0)" },
      {
        y: 0,
        scale: 1,
        boxShadow: "0 0 48px rgba(73, 255, 194, 0.26)",
        duration: 0.72,
        ease: "back.out(1.5)",
        clearProps: "transform,boxShadow",
      },
    );
  }, [activeGameState]);

  function submitKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeSecretEntry(entry);

    if (!normalized.startsWith("!")) {
      setStatus("");
      return;
    }

    const normalSecret = normalSecretKeys[normalized];
    if (normalSecret) {
      setProgress((current) => ({
        ...current,
        activatedNormalKeys: current.activatedNormalKeys.includes(normalized)
          ? current.activatedNormalKeys
          : [...current.activatedNormalKeys, normalized],
      }));
      setActiveNormal({ secret: normalSecret, nonce: Date.now() });
      setStatus(`Señal reconocida: ${normalSecret.title}.`);
      setEntry("");
      return;
    }

    const importantSecret = importantSecretKeysByValue[normalized];
    if (importantSecret) {
      openGame(importantSecret.id, "play");
      setStatus(`Prueba abierta: ${importantSecret.title}.`);
      setEntry("");
      return;
    }

    if (normalized === finalSecret.key) {
      if (!allCluesFound) {
        setStatus("La palabra responde, pero el archivo todavía exige las cuatro pistas.");
        return;
      }
      setProgress((current) => ({ ...current, finalUnlocked: true }));
      setShowFinal(true);
      setStatus("La palabra final encontró su forma.");
      setEntry("");
      return;
    }

    setStatus("La señal empieza bien, pero no coincide con ninguna frecuencia guardada.");
  }

  return (
    <section
      aria-labelledby="secret-key-title"
      className={styles.terminal}
      data-scroll-section
      id="claves-secretas"
      ref={sectionRef}
    >
      <div className={styles.terminalIntro} data-scroll-reveal>
        <span className={styles.eyebrow}>frecuencia secundaria</span>
        <h2 id="secret-key-title">Hay palabras que no abren páginas. Abren capas.</h2>
        <p>
          Si encontrás una señal escondida, escribila completa. Las frecuencias secretas siempre
          empiezan con <strong>!</strong>; cualquier otro texto queda en silencio.
        </p>
      </div>

      <div className={styles.console} data-parallax="4" data-scroll-reveal>
        <form className={styles.keyForm} onSubmit={submitKey}>
          <label htmlFor="secret-key-entry">Frecuencia secreta</label>
          <div className={styles.inputRow}>
            <input
              autoCapitalize="none"
              autoComplete="off"
              id="secret-key-entry"
              onChange={(event) => setEntry(event.target.value)}
              placeholder="!palabra"
              ref={inputRef}
              spellCheck={false}
              type="text"
              value={entry}
            />
            <button className={styles.primaryButton} type="submit">Enviar señal</button>
          </div>
          <p aria-live="polite" className={styles.status}>{status}</p>
        </form>

        <div className={styles.signalMeter} aria-label={`${progress.activatedNormalKeys.length} de 8 señales menores encontradas`}>
          <span>señales menores</span>
          <div>
            {Object.values(normalSecretKeys).map((secret) => {
              const found = progress.activatedNormalKeys.includes(secret.key);
              return <i aria-label={found ? secret.title : "Señal todavía oculta"} className={found ? styles.isFound : ""} key={secret.key} />;
            })}
          </div>
        </div>
      </div>

      <div className={styles.clueArchive} data-scroll-reveal>
        <div className={styles.clueHeading}>
          <div>
            <span className={styles.eyebrow}>archivo manifestación</span>
            <h3>Cuatro pruebas. Una palabra final.</h3>
          </div>
          <span className={styles.clueCount}>{progress.completedGames.length}/4 pistas</span>
        </div>
        <div className={styles.clueGrid}>
          {importantSecretKeys.map((secret, index) => {
            const completed = completedSet.has(secret.id);
            return (
              <button
                aria-label={completed ? `Revisar pista ${index + 1}: ${secret.clueLabel}` : `Pista ${index + 1} bloqueada`}
                className={completed ? styles.clueCardFound : styles.clueCard}
                data-clue-id={secret.id}
                disabled={!completed}
                key={secret.id}
                onClick={() => openGame(secret.id, "review")}
                type="button"
              >
                <span className={styles.clueCardTopline}>
                  <ClueIcon index={index} locked={!completed} />
                  <span>0{index + 1}</span>
                </span>
                <small>{secret.clueLabel}</small>
                <strong className={index === 3 ? styles.clueValueDescription : undefined}>
                  {completed ? secret.clueValue : "?"}
                </strong>
                <span className={styles.clueState}>
                  <ClueStateIcon locked={!completed} />
                  {completed ? "Encontrada · revisar" : "Bloqueada"}
                </span>
              </button>
            );
          })}
        </div>
        {progress.finalUnlocked ? (
          <button className={styles.replayButton} onClick={() => setShowFinal(true)} type="button">
            Volver a abrir la manifestación
          </button>
        ) : (
          <p className={styles.finalHint}>{allCluesFound ? "Las cuatro pistas ya pueden formar una última frecuencia." : "Las pistas completas quedarán guardadas acá, incluso después de recargar."}</p>
        )}
      </div>

      {activeNormal ? <NormalReward reward={activeNormal.secret} /> : null}
      {activeGame ? (
        <SecretGameModal
          completed={completedSet.has(activeGame.id)}
          game={activeGame}
          onClose={closeGame}
          onComplete={completeGame}
        />
      ) : null}
      {showFinal ? <FinalReward onClose={() => setShowFinal(false)} /> : null}
    </section>
  );
}

function NormalReward({ reward }: { reward: NormalSecretKey }) {
  return (
    <div className={styles.normalReward} data-effect={reward.animation} role="status">
      <div aria-hidden="true" className={styles.effectStage}>
        {Array.from({ length: 7 }, (_, index) => <span className={styles.effectParticle} key={index} />)}
      </div>
      <span className={styles.eyebrow}>easter egg encontrado</span>
      <strong>{reward.title}</strong>
      <p>{reward.message}</p>
    </div>
  );
}

function FinalReward({ onClose }: { onClose: () => void }) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  useGSAP(
    () => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .fromTo(rootRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45 })
        .fromTo(`.${styles.finalWord} span`, { yPercent: 120, rotate: 7 }, { yPercent: 0, rotate: 0, stagger: 0.045, duration: 0.72 }, "-=0.2")
        .fromTo(`.${styles.finalLine}`, { scaleX: 0 }, { scaleX: 1, stagger: 0.08, duration: 0.7 }, "-=0.5")
        .fromTo(`.${styles.finalCopy} > *`, { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.42 }, "-=0.36");
    },
    { scope: rootRef },
  );

  return (
    <div aria-labelledby="final-secret-title" aria-modal="true" className={styles.finalReward} ref={rootRef} role="dialog">
      <div aria-hidden="true" className={styles.finalLines}>
        {Array.from({ length: 9 }, (_, index) => <span className={styles.finalLine} key={index} />)}
      </div>
      <button aria-label="Cerrar manifestación" className={styles.closeButton} onClick={onClose} type="button">
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19" /></svg>
      </button>
      <div className={styles.finalCopy}>
        <span className={styles.eyebrow}>archivo completo</span>
        <h2 className={styles.finalWord} id="final-secret-title">
          {finalSecret.title.split("").map((letter, index) => <span key={`${letter}-${index}`}>{letter}</span>)}
        </h2>
        <p>{finalSecret.message}</p>
        <button className={styles.primaryButton} onClick={onClose} type="button">Guardar este momento</button>
      </div>
    </div>
  );
}
