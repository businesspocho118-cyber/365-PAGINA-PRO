"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { phases, SECRET_KEY_UNLOCK_PHASE_ID, type Phase } from "@/lib/phases";
import { TimeCapsulesLoader } from "@/components/TimeCapsulesLoader";
import { ThreeNebula } from "@/components/ThreeNebula";
import { SmoothScrollController } from "@/components/SmoothScrollController";
import { ScrollChoreography } from "@/components/ScrollChoreography";
import { SecretKeySystem } from "@/components/SecretKeySystem";
import { PhaseMedalModal } from "@/components/PhaseMedalModal";
import { EasterEggModal } from "@/components/EasterEggModal";
import { EASTER_EGGS, type EasterEggData } from "@/lib/easter-eggs";
import { BackgroundAudio } from "@/components/BackgroundAudio";
import { ResolutionVideoModal } from "@/components/ResolutionVideoModal";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

type Progress = {
  accessGranted: boolean;
  currentPhaseIndex: number;
  selectedPhaseIndex: number;
  solvedPhaseIds: string[];
  foundEasterEggs: string[];
  usedCanjeableIds: string[];
  startedPhaseIds: string[];
  phase5Lives: number;
  phase7StartedAt?: number;
};

const emptyProgress: Progress = {
  accessGranted: false,
  currentPhaseIndex: 0,
  selectedPhaseIndex: 0,
  solvedPhaseIds: [],
  foundEasterEggs: [],
  usedCanjeableIds: [],
  startedPhaseIds: [],
  phase5Lives: 3,
  phase7StartedAt: undefined,
};

const storageKey = "secret-365-progress-v1";
const pendingPhaseMedalKey = "secret-365-pending-phase-medal-v1";

const redeemables = [
  {
    id: "canjeable-1",
    title: "Canjeable I",
    detail: "Una llave física para reclamar un momento del regalo.",
    src: "/365-assets/redeemables/redeemable-1.png",
  },
  {
    id: "canjeable-2",
    title: "Canjeable II",
    detail: "Un permiso guardado para cuando el libro pida una pausa.",
    src: "/365-assets/redeemables/redeemable-2.png",
  },
  {
    id: "canjeable-3",
    title: "Canjeable III",
    detail: "Una pieza reservada para una recompensa más grande.",
    src: "/365-assets/redeemables/redeemable-3.png",
  },
  {
    id: "canjeable-4",
    title: "Canjeable IV",
    detail: "Una señal de cierre para una fase importante.",
    src: "/365-assets/redeemables/redeemable-4.png",
  },
  {
    id: "canjeable-5",
    title: "Canjeable V",
    detail: "Un gesto reservado para convertir una página en un recuerdo compartido.",
    src: "/365-assets/redeemables/redeemable-5.png",
  },
  {
    id: "canjeable-6",
    title: "Canjeable VI",
    detail: "Una llave especial guardada para una ocasión que merezca abrirse.",
    src: "/365-assets/redeemables/redeemable-6.png",
  },
  {
    id: "canjeable-7",
    title: "Canjeable VII",
    detail: "Un pase de celebración guardado para una ocasión especial.",
    src: "/365-assets/redeemables/redeemable-7.png",
  },
  {
    id: "canjeable-8",
    title: "Canjeable VIII",
    detail: "El ticket final del viaje, la recompensa definitiva al completar el año.",
    src: "/365-assets/redeemables/redeemable-8.png",
  },
];

const coupleMoments = [
  { id: 1, src: "/365-assets/couple/moment-01.png", caption: "Nuestro comienzo" },
  { id: 2, src: "/365-assets/couple/moment-02.jpg", caption: "Miradas" },
  { id: 3, src: "/365-assets/couple/moment-03.jpg", caption: "Cielo y risas" },
  { id: 4, src: "/365-assets/couple/moment-04.jpg", caption: "Complicidad" },
  { id: 5, src: "/365-assets/couple/moment-05.jpg", caption: "Luz" },
  { id: 6, src: "/365-assets/couple/moment-06.jpg", caption: "Aventuras" },
  { id: 7, src: "/365-assets/couple/moment-07.jpg", caption: "Destino" },
  { id: 8, src: "/365-assets/couple/moment-08.jpg", caption: "Sonrisas" },
  { id: 9, src: "/365-assets/couple/moment-09.jpg", caption: "Recuerdos" },
  { id: 10, src: "/365-assets/couple/moment-10.jpg", caption: "Magia" },
  { id: 11, src: "/365-assets/couple/moment-11.jpg", caption: "Abrazos" },
  { id: 12, src: "/365-assets/couple/moment-12.jpg", caption: "Instantes" },
  { id: 13, src: "/365-assets/couple/moment-13.jpg", caption: "Momentos" },
  { id: 14, src: "/365-assets/couple/moment-14.jpg", caption: "Juntos" },
  { id: 15, src: "/365-assets/couple/moment-15.jpg", caption: "Siempre" },
  { id: 16, src: "/365-assets/couple/moment-16.jpg", caption: "Conexión" },
  { id: 17, src: "/365-assets/couple/moment-17.jpg", caption: "Incondicional" },
  { id: 18, src: "/365-assets/couple/moment-18.jpg", caption: "Cómplices" },
  { id: 19, src: "/365-assets/couple/moment-19.jpg", caption: "Noche y luz" },
  { id: 20, src: "/365-assets/couple/moment-20.jpg", caption: "Risas" },
  { id: 21, src: "/365-assets/couple/moment-21.jpg", caption: "Historias" },
  { id: 22, src: "/365-assets/couple/moment-22.jpg", caption: "Cariño" },
  { id: 23, src: "/365-assets/couple/moment-23.jpg", caption: "Alegría" },
  { id: 24, src: "/365-assets/couple/moment-24.jpg", caption: "Promesas" },
  { id: 25, src: "/365-assets/couple/moment-25.jpg", caption: "Ternura" },
  { id: 26, src: "/365-assets/couple/moment-26.jpg", caption: "Amor puro" },
  { id: 27, src: "/365-assets/couple/moment-27.jpg", caption: "Por siempre" },
];

function clampPhaseIndex(index: number) {
  const safeIndex = Number.isFinite(index) ? Math.trunc(index) : 0;
  return Math.min(Math.max(safeIndex, 0), phases.length - 1);
}

function readProgress(): Progress {
  if (typeof window === "undefined") {
    return emptyProgress;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return emptyProgress;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Progress>;
    const validPhaseIds = new Set(phases.map((phase) => phase.id));
    const solvedPhaseIds = Array.isArray(parsed.solvedPhaseIds)
      ? [
          ...new Set(
            parsed.solvedPhaseIds.filter(
              (id): id is string => typeof id === "string" && validPhaseIds.has(id),
            ),
          ),
        ]
      : [];
    const highestSolvedIndex = phases.reduce(
      (highest, phase, index) =>
        solvedPhaseIds.includes(phase.id) ? Math.max(highest, index) : highest,
      -1,
    );
    const storedFrontier = clampPhaseIndex(Number(parsed.currentPhaseIndex ?? 0));
    const derivedFrontier = highestSolvedIndex >= 0 ? clampPhaseIndex(highestSolvedIndex + 1) : 0;
    const currentPhaseIndex = Math.max(storedFrontier, derivedFrontier);
    const storedSelection =
      typeof parsed.selectedPhaseIndex === "number"
        ? clampPhaseIndex(parsed.selectedPhaseIndex)
        : currentPhaseIndex;

    const usedCanjeableIds = Array.isArray(parsed.usedCanjeableIds)
      ? parsed.usedCanjeableIds.filter((id): id is string => typeof id === "string")
      : [];

    const startedPhaseIds = Array.isArray(parsed.startedPhaseIds)
      ? parsed.startedPhaseIds.filter((id): id is string => typeof id === "string")
      : [];

    const phase5Lives =
      typeof parsed.phase5Lives === "number"
        ? Math.max(0, Math.min(3, parsed.phase5Lives))
        : 3;

    const phase7StartedAt =
      typeof parsed.phase7StartedAt === "number" && Number.isFinite(parsed.phase7StartedAt)
        ? parsed.phase7StartedAt
        : undefined;

    return {
      accessGranted: Boolean(parsed.accessGranted),
      currentPhaseIndex,
      selectedPhaseIndex: Math.min(storedSelection, currentPhaseIndex),
      solvedPhaseIds,
      foundEasterEggs: Array.isArray(parsed.foundEasterEggs) ? parsed.foundEasterEggs : [],
      usedCanjeableIds,
      startedPhaseIds,
      phase5Lives,
      phase7StartedAt,
    };
  } catch {
    return emptyProgress;
  }
}

function writeProgress(progress: Progress) {
  window.localStorage.setItem(storageKey, JSON.stringify(progress));
}

export function SecretExperience() {
  const router = useRouter();
  const [loaderDone, setLoaderDone] = useState(false);
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const [toastExiting, setToastExiting] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastExitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    if (toastExitTimeoutRef.current) clearTimeout(toastExitTimeoutRef.current);

    setToastExiting(false);
    setToast({ id: Date.now(), message });

    toastTimeoutRef.current = setTimeout(() => {
      setToastExiting(true);
      toastExitTimeoutRef.current = setTimeout(() => {
        setToast(null);
        setToastExiting(false);
      }, 350);
    }, 4200);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    if (toastExitTimeoutRef.current) clearTimeout(toastExitTimeoutRef.current);

    setToastExiting(true);
    toastExitTimeoutRef.current = setTimeout(() => {
      setToast(null);
      setToastExiting(false);
    }, 350);
  }, []);

  const handleToastMouseEnter = useCallback(() => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    if (toastExitTimeoutRef.current) clearTimeout(toastExitTimeoutRef.current);
    setToastExiting(false);
  }, []);

  const handleToastMouseLeave = useCallback(() => {
    if (!toast) return;
    toastTimeoutRef.current = setTimeout(() => {
      setToastExiting(true);
      toastExitTimeoutRef.current = setTimeout(() => {
        setToast(null);
        setToastExiting(false);
      }, 350);
    }, 2000);
  }, [toast]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (toastExitTimeoutRef.current) clearTimeout(toastExitTimeoutRef.current);
    };
  }, []);

  const [accessCode, setAccessCode] = useState("");
  const [phaseAnswer, setPhaseAnswer] = useState("");
  const [earnedMedalPhase, setEarnedMedalPhase] = useState<Phase | null>(null);
  const [confirmCanjeableId, setConfirmCanjeableId] = useState<string | null>(null);
  const [confirmStartPhase, setConfirmStartPhase] = useState<Phase | null>(null);
  const [videoModalPhase, setVideoModalPhase] = useState<Phase | null>(null);
  const [activeEasterEgg, setActiveEasterEgg] = useState<EasterEggData | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const appRef = useRef<HTMLDivElement | null>(null);
  const heroNumberRef = useRef<HTMLSpanElement | null>(null);
  const redeemableViewportRef = useRef<HTMLDivElement | null>(null);
  const activePhase = phases[progress.selectedPhaseIndex];
  const isPhaseStarted = (progress.startedPhaseIds ?? []).includes(activePhase.id);
  const solvedSet = useMemo(() => new Set(progress.solvedPhaseIds), [progress.solvedPhaseIds]);
  const solvedRewards = phases.filter((phase) => solvedSet.has(phase.id));
  const allSolved = solvedRewards.length === phases.length;
  const genuineMedalsCount = useMemo(() => {
    return phases.filter(
      (phase, index) =>
        solvedSet.has(phase.id) && !progress.usedCanjeableIds.includes(`canjeable-${index + 1}`),
    ).length;
  }, [solvedSet, progress.usedCanjeableIds]);
  const secretKeySystemUnlocked = solvedSet.has(SECRET_KEY_UNLOCK_PHASE_ID);
  const handleNormalKeyCountChange = useCallback(() => {}, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const phase7TimeRemaining = useMemo(() => {
    if (!progress.phase7StartedAt) return null;
    const totalMs = 24 * 60 * 60 * 1000;
    const elapsed = now - progress.phase7StartedAt;
    return Math.max(0, totalMs - elapsed);
  }, [now, progress.phase7StartedAt]);

  useEffect(() => {
    if (
      progress.phase7StartedAt &&
      phase7TimeRemaining !== null &&
      phase7TimeRemaining === 0 &&
      !progress.usedCanjeableIds.includes("canjeable-7") &&
      !progress.solvedPhaseIds.includes("day-320")
    ) {
      const nextUsed = [...progress.usedCanjeableIds, "canjeable-7"];
      const updated: Progress = {
        ...progress,
        usedCanjeableIds: nextUsed,
      };
      setProgress(updated);
      writeProgress(updated);
      showToast(
        "⏰ ¡El tiempo de 24 horas para la Fase 7 se ha agotado! Se activó automáticamente el comodín. La medalla y el audio quedaron anulados.",
      );
    }
  }, [phase7TimeRemaining, progress, showToast]);

  const formatTimer = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleResetProgress = () => {
    const fresh: Progress = {
      accessGranted: true,
      currentPhaseIndex: 0,
      selectedPhaseIndex: 0,
      solvedPhaseIds: [],
      foundEasterEggs: [],
      usedCanjeableIds: [],
      startedPhaseIds: [],
      phase5Lives: 3,
      phase7StartedAt: undefined,
    };
    setProgress(fresh);
    writeProgress(fresh);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(pendingPhaseMedalKey);
      window.localStorage.removeItem("secret-key-system-state-v1");
    }
    setEarnedMedalPhase(null);
    setConfirmCanjeableId(null);
    setConfirmStartPhase(null);
    setVideoModalPhase(null);
    showToast("Fases y canjeables reiniciados (Modo Test). Todas las fases vuelven a estar bloqueadas.");
  };

  const handleRequestUseCanjeable = (canjeableId: string) => {
    const canjeableNumber = parseInt(canjeableId.replace("canjeable-", ""), 10);
    const canjeableIndex = canjeableNumber - 1;

    // Sequential rule: Can ONLY use canjeable of the current active phase!
    if (canjeableIndex !== progress.currentPhaseIndex) {
      if (canjeableIndex > progress.currentPhaseIndex) {
        showToast(`Este canjeable está bloqueado. Se desbloquea al alcanzar la Fase ${canjeableNumber}.`);
      } else {
        showToast("Esta fase ya fue resuelta. El canjeable ya no puede utilizarse.");
      }
      return;
    }

    if (progress.usedCanjeableIds.includes(canjeableId)) {
      showToast("Este canjeable ya fue utilizado.");
      return;
    }

    // Trigger confirmation modal
    setConfirmCanjeableId(canjeableId);
  };

  const handleConfirmUseCanjeable = () => {
    if (!confirmCanjeableId) return;
    const canjeableNumber = parseInt(confirmCanjeableId.replace("canjeable-", ""), 10);
    const targetPhase = phases[canjeableNumber - 1];
    const nextUsed = [...progress.usedCanjeableIds, confirmCanjeableId];
    const updated: Progress = {
      ...progress,
      usedCanjeableIds: nextUsed,
      phase5Lives: canjeableNumber === 5 ? 0 : progress.phase5Lives,
    };
    setProgress(updated);
    writeProgress(updated);
    setConfirmCanjeableId(null);

    if (targetPhase?.solutionVideoSrc) {
      setVideoModalPhase(targetPhase);
      showToast(
        `¡Comodín ${canjeableNumber} utilizado! Se abrió el video con la resolución de la Fase ${canjeableNumber}. Recuerda que la medalla y el audio quedaron anulados.`,
      );
    } else if (targetPhase?.solutionDocSrc) {
      window.open(targetPhase.solutionDocSrc, "_blank", "noopener,noreferrer");
      showToast(
        `¡Comodín ${canjeableNumber} utilizado! Se abrió el documento con la solución de la Fase ${canjeableNumber}. Recuerda que la medalla y el audio quedaron anulados.`,
      );
    } else {
      showToast(
        `¡Canjeable ${canjeableNumber} utilizado! Recuerda que al resolver la Fase ${canjeableNumber} no obtendrás la medalla ni el audio.`,
      );
    }
  };

  const handleInitiatePhaseClick = (phase: Phase) => {
    const started = progress.startedPhaseIds ?? [];
    if (started.includes(phase.id)) {
      if (phase.unsolvedDocSrc) {
        window.open(phase.unsolvedDocSrc, "_blank", "noopener,noreferrer");
      }
      return;
    }
    setConfirmStartPhase(phase);
  };

  const handleConfirmStartPhase = () => {
    if (!confirmStartPhase) return;
    const target = confirmStartPhase;
    const phaseIndex = phases.findIndex((p) => p.id === target.id);
    const phaseNumber = phaseIndex + 1;
    const started = progress.startedPhaseIds ?? [];
    const nextStarted = started.includes(target.id) ? started : [...started, target.id];

    // If Phase 7 (day-320), begin 24-hour countdown if not already started
    const isPhase7 = target.id === "day-320";
    const nextPhase7StartedAt =
      isPhase7 && !progress.phase7StartedAt ? Date.now() : progress.phase7StartedAt;

    const updated: Progress = {
      ...progress,
      startedPhaseIds: nextStarted,
      phase7StartedAt: nextPhase7StartedAt,
    };
    setProgress(updated);
    writeProgress(updated);
    setConfirmStartPhase(null);

    if (target.unsolvedDocSrc) {
      window.open(target.unsolvedDocSrc, "_blank", "noopener,noreferrer");
    }
    showToast(
      `📄 ¡Fase ${phaseNumber} iniciada! Se abrió el enigma sin solución para "${target.title}".`,
    );
  };

  useEffect(() => {
    const savedProgress = readProgress();
    setProgress(savedProgress);
    const pendingPhaseId = window.localStorage.getItem(pendingPhaseMedalKey);
    const pendingPhase = phases.find((phase) => phase.id === pendingPhaseId);
    if (pendingPhase && savedProgress.solvedPhaseIds.includes(pendingPhase.id)) {
      setEarnedMedalPhase(pendingPhase);
    }
    window.localStorage.removeItem(pendingPhaseMedalKey);
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && hasHydrated) {
      writeProgress(progress);
    }
  }, [hasHydrated, progress]);

  useGSAP(
    () => {
      if (!loaderDone || !progress.accessGranted) {
        return;
      }

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        return;
      }

      const root = appRef.current;
      if (!root) {
        return;
      }

      const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
      entrance
        .from(".topbar", { y: -18, autoAlpha: 0, duration: 0.55 })
        .from(".hero-copy-block > *", { y: 34, autoAlpha: 0, duration: 0.74, stagger: 0.08 }, "-=0.2")
        .from(".artifact-stage", { y: 42, autoAlpha: 0, rotateX: 5, duration: 0.82 }, "-=0.56");

      const sceneTriggers: ReturnType<typeof ScrollTrigger.create>[] = [];
      const applyScene = (scene: string, vars: gsap.TweenVars) => {
        root.dataset.scene = scene;
        gsap.to(root, {
          duration: 0.85,
          ease: "power2.out",
          overwrite: "auto",
          ...vars,
        });
      };

      const sceneThemes = [
        {
          trigger: ".hero",
          scene: "inicio",
          vars: {
            "--wash-a-x": "12%",
            "--wash-a-y": "10%",
            "--wash-b-x": "74%",
            "--wash-b-y": "18%",
            "--wash-a-color": "rgba(141, 73, 255, 0.38)",
            "--wash-b-color": "rgba(255, 214, 165, 0.12)",
            "--scene-dim": "0.08",
          },
        },
        {
          trigger: ".constellation",
          scene: "mapa",
          vars: {
            "--wash-a-x": "76%",
            "--wash-a-y": "18%",
            "--wash-b-x": "16%",
            "--wash-b-y": "76%",
            "--wash-a-color": "rgba(95, 196, 255, 0.2)",
            "--wash-b-color": "rgba(141, 73, 255, 0.34)",
            "--scene-dim": "0.18",
          },
        },
        {
          trigger: ".riddle-spread",
          scene: "pliego",
          vars: {
            "--wash-a-x": "50%",
            "--wash-a-y": "42%",
            "--wash-b-x": "84%",
            "--wash-b-y": "70%",
            "--wash-a-color": "rgba(255, 214, 165, 0.18)",
            "--wash-b-color": "rgba(111, 45, 189, 0.34)",
            "--scene-dim": "0.28",
          },
        },
        {
          trigger: ".reward-stream",
          scene: "rio",
          vars: {
            "--wash-a-x": "18%",
            "--wash-a-y": "64%",
            "--wash-b-x": "82%",
            "--wash-b-y": "22%",
            "--wash-a-color": "rgba(217, 183, 255, 0.2)",
            "--wash-b-color": "rgba(255, 214, 165, 0.15)",
            "--scene-dim": "0.22",
          },
        },
        {
          trigger: "#claves-secretas",
          scene: "claves",
          vars: {
            "--wash-a-x": "28%",
            "--wash-a-y": "34%",
            "--wash-b-x": "76%",
            "--wash-b-y": "72%",
            "--wash-a-color": "rgba(73, 255, 194, 0.16)",
            "--wash-b-color": "rgba(141, 73, 255, 0.32)",
            "--scene-dim": "0.24",
          },
        },
        {
          trigger: ".tool-vault",
          scene: "canjeables",
          vars: {
            "--wash-a-x": "62%",
            "--wash-a-y": "72%",
            "--wash-b-x": "18%",
            "--wash-b-y": "18%",
            "--wash-a-color": "rgba(73, 255, 194, 0.15)",
            "--wash-b-color": "rgba(141, 73, 255, 0.26)",
            "--scene-dim": "0.25",
          },
        },
        {
          trigger: ".video-chamber",
          scene: "video",
          vars: {
            "--wash-a-x": "50%",
            "--wash-a-y": "50%",
            "--wash-b-x": "82%",
            "--wash-b-y": "18%",
            "--wash-a-color": "rgba(255, 214, 165, 0.18)",
            "--wash-b-color": "rgba(95, 196, 255, 0.16)",
            "--scene-dim": "0.32",
          },
        },
        {
          trigger: ".medal-archive",
          scene: "medallas",
          vars: {
            "--wash-a-x": "48%",
            "--wash-a-y": "18%",
            "--wash-b-x": "50%",
            "--wash-b-y": "92%",
            "--wash-a-color": "rgba(141, 73, 255, 0.18)",
            "--wash-b-color": "rgba(52, 17, 96, 0.52)",
            "--scene-dim": "0.36",
          },
        },
      ];

      sceneThemes.forEach(({ trigger, scene, vars }) => {
        if (!root.querySelector(trigger)) return;
        sceneTriggers.push(
          ScrollTrigger.create({
            trigger,
            start: "top 58%",
            end: "bottom 42%",
            onEnter: () => applyScene(scene, vars),
            onEnterBack: () => applyScene(scene, vars),
          }),
        );
      });

      gsap.set(".story-orbit", {
        x: 0,
        y: 0,
        xPercent: -50,
        yPercent: -50,
        scale: 1,
        rotate: 0,
        autoAlpha: 0.62,
      });

      const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

      if (!isMobile) {
        const scrollStory = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ".app-shell",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.35,
            invalidateOnRefresh: true,
          },
        });

        scrollStory
          .to(
            ".story-orbit",
            {
              keyframes: [
                { x: "-34vw", y: "-30vh", scale: 0.72, rotate: -18, autoAlpha: 0.34, duration: 0.12, ease: "sine.inOut" },
                { x: "24vw", y: "-14vh", scale: 0.92, rotate: 20, autoAlpha: 0.42, duration: 0.18, ease: "sine.inOut" },
                { x: "-20vw", y: "24vh", scale: 0.64, rotate: 54, autoAlpha: 0.3, duration: 0.18, ease: "sine.inOut" },
                { x: "31vw", y: "12vh", scale: 0.82, rotate: 88, autoAlpha: 0.4, duration: 0.18, ease: "sine.inOut" },
                { x: "-28vw", y: "-4vh", scale: 0.58, rotate: 126, autoAlpha: 0.28, duration: 0.18, ease: "sine.inOut" },
                { x: "18vw", y: "28vh", scale: 0.7, rotate: 170, autoAlpha: 0.34, duration: 0.16, ease: "sine.inOut" },
              ],
              duration: 1,
            },
            0,
          )
          .to(".story-word-libro", { x: "21vw", y: "-12vh", rotate: -4, autoAlpha: 0.16 }, 0)
          .to(".hero-digit-3", { xPercent: -18, yPercent: -10, rotate: -5 }, 0)
          .to(".hero-digit-6", { xPercent: 4, yPercent: 12, rotate: 2 }, 0)
          .to(".hero-digit-5", { xPercent: 17, yPercent: -8, rotate: 5 }, 0)
          .to(".hero-couple-showcase", { y: -58, autoAlpha: 0.34 }, 0.06)
          .to(".artifact-stage", { y: -82, rotate: 2, scale: 0.94 }, 0.08)
          .to(".story-word-senal", { x: "-16vw", y: "-6vh", rotate: 5, autoAlpha: 0.18 }, 0.26)
          .to(".story-word-respuesta", { x: "9vw", y: "-24vh", rotate: -2, autoAlpha: 0.16 }, 0.5)
          .to(".story-word-recuerdo", { x: "-10vw", y: "-34vh", rotate: 4, autoAlpha: 0.2 }, 0.74);
      }

      return () => {
        sceneTriggers.forEach((trigger) => trigger.kill());
      };
    },
    { dependencies: [loaderDone, progress.accessGranted, secretKeySystemUnlocked], scope: appRef },
  );

  const revealEasterEgg = useCallback((message: string) => {
    showToast(message);
    setProgress((current) => {
      if (current.foundEasterEggs.includes(message)) {
        return current;
      }

      return {
        ...current,
        foundEasterEggs: [...current.foundEasterEggs, message],
      };
    });
  }, [showToast]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const isWritingField =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable);

      if (isWritingField) {
        return;
      }

      if (!/^\d$/.test(event.key)) {
        return;
      }

      const recent = `${window.sessionStorage.getItem("secret-365-sequence") ?? ""}${event.key}`.slice(-3);
      window.sessionStorage.setItem("secret-365-sequence", recent);

      if (recent === "365") {
        revealEasterEgg("Señal 365 encontrada. El archivo te estaba mirando.");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [revealEasterEgg]);

  async function submitAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback("");
    const submittedCode = accessCode;

    const response = await fetch("/api/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: submittedCode }),
    });
    const payload = (await response.json()) as { ok: boolean; message?: string; rewardRoute?: string };

    setIsSubmitting(false);

    if (!payload.ok) {
      setFeedback(payload.message ?? "Esa llave todavía no abre este archivo.");
      return;
    }

    if (payload.rewardRoute) {
      const savedProgress = readProgress();
      const firstPhaseId = phases[0].id;
      const solvedPhaseIds = savedProgress.solvedPhaseIds.includes(firstPhaseId)
        ? savedProgress.solvedPhaseIds
        : [...savedProgress.solvedPhaseIds, firstPhaseId];
      const currentPhaseIndex = Math.max(savedProgress.currentPhaseIndex, clampPhaseIndex(1));
      const firstPhaseProgress: Progress = {
        ...savedProgress,
        accessGranted: true,
        currentPhaseIndex,
        selectedPhaseIndex:
          savedProgress.solvedPhaseIds.length > 0
            ? Math.min(savedProgress.selectedPhaseIndex, currentPhaseIndex)
            : currentPhaseIndex,
        solvedPhaseIds,
      };

      writeProgress(firstPhaseProgress);
      window.localStorage.setItem(pendingPhaseMedalKey, firstPhaseId);
      setProgress(firstPhaseProgress);
      router.push(payload.rewardRoute);
      return;
    }

    setProgress((current) => ({ ...current, accessGranted: true }));
    setFeedback("");
  }

  async function submitPhaseAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    if (!isPhaseStarted) {
      setFeedback("⚠️ Debes iniciar esta fase antes de poder ingresar o probar una clave.");
      return;
    }

    const trimmed = phaseAnswer.trim();
    if (!trimmed) {
      setFeedback("Escribe una clave o easter egg antes de probar.");
      return;
    }

    // Required prefix rule: must start with ! (or ¡)
    if (!trimmed.startsWith("!") && !trimmed.startsWith("¡")) {
      setFeedback("⚠️ Recuerda que toda contraseña o easter egg debe iniciar siempre con el signo ! al principio para que funcione.");
      return;
    }

    setIsSubmitting(true);
    const submittedAnswer = phaseAnswer;

    const response = await fetch("/api/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phaseId: activePhase.id, answer: submittedAnswer }),
    });
    const payload = (await response.json()) as {
      correct: boolean;
      message: string;
      isEasterEgg?: boolean;
      easterEgg?: EasterEggData;
    };

    setIsSubmitting(false);
    setFeedback(payload.message);

    if (payload.isEasterEgg && payload.easterEgg) {
      const discovered = payload.easterEgg;
      setActiveEasterEgg(discovered);
      setPhaseAnswer("");
      showToast(`🎉 ¡Easter Egg descubierto: ${discovered.title}!`);

      setProgress((current) => {
        if (current.foundEasterEggs.includes(discovered.id)) {
          return current;
        }
        const updated: Progress = {
          ...current,
          foundEasterEggs: [...current.foundEasterEggs, discovered.id],
        };
        writeProgress(updated);
        return updated;
      });
      return;
    }

    if (!payload.correct) {
      if (activePhase.id === "day-230") {
        const currentLives = progress.phase5Lives ?? 3;
        const nextLives = Math.max(0, currentLives - 1);

        if (nextLives === 0) {
          const canjeable5Id = "canjeable-5";
          const alreadyUsed = progress.usedCanjeableIds.includes(canjeable5Id);
          const nextUsed = alreadyUsed ? progress.usedCanjeableIds : [...progress.usedCanjeableIds, canjeable5Id];
          const updated: Progress = {
            ...progress,
            phase5Lives: 0,
            usedCanjeableIds: nextUsed,
          };
          setProgress(updated);
          writeProgress(updated);

          if (activePhase.solutionDocSrc) {
            window.open(activePhase.solutionDocSrc, "_blank", "noopener,noreferrer");
          }
          setFeedback(
            "💀 Agotaste tus 3 vidas en la Fase 5. Se activó el comodín: perdiste la medalla y el audio, pero se abrió el documento con la solución para que puedas avanzar.",
          );
          showToast("⚠️ Agotaste tus 3 vidas en la Fase 5. Comodín activado y solución abierta.");
          return;
        }

        const updated: Progress = {
          ...progress,
          phase5Lives: nextLives,
        };
        setProgress(updated);
        writeProgress(updated);
        const livesMsg =
          nextLives === 1
            ? "❌ Clave incorrecta. ¡Cuidado! Te queda solo 1 vida en la Fase 5."
            : `❌ Clave incorrecta. Te quedan ${nextLives} vidas en la Fase 5.`;
        setFeedback(livesMsg);
        return;
      }
      return;
    }

    setPhaseAnswer("");
    const solvedPhaseIndex = phases.findIndex((phase) => phase.id === activePhase.id);

    setProgress((current) => {
      const solvedPhaseIds = current.solvedPhaseIds.includes(activePhase.id)
        ? current.solvedPhaseIds
        : [...current.solvedPhaseIds, activePhase.id];

      const currentPhaseIndex = Math.max(
        current.currentPhaseIndex,
        clampPhaseIndex(solvedPhaseIndex + 1),
      );

      return {
        ...current,
        solvedPhaseIds,
        currentPhaseIndex,
        selectedPhaseIndex:
          solvedPhaseIndex === current.currentPhaseIndex
            ? currentPhaseIndex
            : current.selectedPhaseIndex,
      };
    });
    setEarnedMedalPhase(activePhase);

    const canjeableId = `canjeable-${solvedPhaseIndex + 1}`;
    if (progress.usedCanjeableIds.includes(canjeableId)) {
      showToast(`Fase ${solvedPhaseIndex + 1} resuelta. Como usaste el canjeable antes de resolverla, la medalla y el audio no fueron otorgados.`);
    }
  }

  function choosePhase(index: number) {
    if (index > progress.currentPhaseIndex) {
      setFeedback("Esa fase sigue sellada. Primero resuelve el acertijo actual.");
      return;
    }

    setProgress((current) => ({ ...current, selectedPhaseIndex: clampPhaseIndex(index) }));
    setFeedback("");
  }

  function tapHeroNumber() {
    const count = Number(window.sessionStorage.getItem("secret-365-hero-taps") ?? "0") + 1;
    window.sessionStorage.setItem("secret-365-hero-taps", String(count));

    gsap.fromTo(
      heroNumberRef.current,
      { scale: 0.98 },
      { scale: 1, duration: 0.24, ease: "back.out(2)" },
    );

    if (count >= 3) {
      window.sessionStorage.setItem("secret-365-hero-taps", "0");
      revealEasterEgg("Triple toque encontrado. Algunas puertas se abren prestando atención.");
    }
  }

  function scrollRedeemables(direction: -1 | 1) {
    const viewport = redeemableViewportRef.current;
    if (!viewport) {
      return;
    }

    viewport.scrollBy({
      left: direction * Math.max(viewport.clientWidth * 0.82, 320),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  if (!loaderDone) {
    return (
      <div className="experience">
        <ThreeNebula />
        <div className="ambient-gradient" />
        <div className="grain" />
        <TimeCapsulesLoader onComplete={() => setLoaderDone(true)} />
      </div>
    );
  }

  if (!progress.accessGranted) {
    return (
      <main className="experience gate" ref={appRef}>
        <ThreeNebula />
        <div className="ambient-gradient" />
        <div className="grain" />
        <form className="gate-panel" onSubmit={submitAccess}>
          <div className="gate-number" aria-hidden="true">
            365
          </div>
          <p className="gate-lead">
            Esta página pertenece a una sola persona y a un solo libro. La llave viene escondida con
            el regalo.
          </p>
          <label className="sr-only" htmlFor="access-code">
            Llave privada
          </label>
          <div className="gate-form">
            <input
              autoComplete="off"
              className="answer-field"
              id="access-code"
              name="code"
              onChange={(event) => setAccessCode(event.target.value)}
              onKeyDown={(event) => event.stopPropagation()}
              placeholder="Escribe la llave privada"
              type="password"
              value={accessCode}
            />
            <button className="button button-primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Abriendo..." : "Abrir archivo"}
            </button>
          </div>
          <div className="feedback" role="status">
            {feedback}
          </div>
          <div className="gate-audio-shell">
            <BackgroundAudio />
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="experience" data-scene="inicio" ref={appRef}>
      <SmoothScrollController active={loaderDone && progress.accessGranted} />
      <ScrollChoreography
        active={loaderDone && progress.accessGranted}
        contentVersion={secretKeySystemUnlocked ? 1 : 0}
      />
      <ThreeNebula />
      <div className="ambient-gradient" />
      <div className="grain" />

      <div className="app-shell">
        <nav className="topbar" aria-label="Navegación del archivo">
          <div className="brand">
            <span className="brand-mark">365</span>
            <span>THE BEGINNING</span>
          </div>
          <div className="topbar-actions">
            <button
              type="button"
              className="test-reset-btn"
              onClick={handleResetProgress}
              title="Botón de prueba provisional: bloquea las 8 fases para probar el avance de claves de nuevo"
            >
              <span className="test-reset-icon" aria-hidden="true">↺</span> Reiniciar fases (Test)
            </button>
            <div className="progress-line" aria-label="Progreso">
              <span>{solvedRewards.length} fases abiertas</span>
            </div>
            <BackgroundAudio />
          </div>
        </nav>

        {allSolved ? (
          <section className="hall-of-medals" aria-labelledby="hall-title" data-scroll-section id="hall-de-medallas">
            <div className="hall-header" data-scroll-reveal>
              <span className="hall-eyebrow">★ 365 THE BEGINNING · SALÓN DE LA GLORIA ★</span>
              <h2 id="hall-title">Hall de Medallas</h2>
              <p className="hall-subtitle">
                El archivo ha sido completado en su totalidad. Este es tu registro de honor definitivo:
                únicamente cuentan las medallas conseguidas <strong>por mérito puro sin usar canjeables</strong>.
              </p>
            </div>

            <div className="hall-score-card" data-scroll-reveal>
              <div className="hall-score-badge">
                <span className="hall-score-number">{genuineMedalsCount}</span>
                <span className="hall-score-total">/ {phases.length}</span>
              </div>
              <div className="hall-score-details">
                <span className="hall-score-rank">
                  {genuineMedalsCount === 8
                    ? "👑 CUSTODIO SUPREMO · PERFECCIÓN ABSOLUTA"
                    : genuineMedalsCount >= 6
                      ? "🌟 GRAN GUARDIÁN DE LA MEMORIA"
                      : genuineMedalsCount >= 4
                        ? "🛡️ EXPLORADOR DEL TIEMPO"
                        : genuineMedalsCount >= 1
                          ? "📜 VIAJERO DEL CAMINO"
                          : "⚡ MAESTRO DEL CANJE"}
                </span>
                <p>
                  {genuineMedalsCount === 8
                    ? "¡Resolviste absolutamente todas las fases sin utilizar ningún canjeable! Conservaste todas las medallas de honor y todos los audios secretos."
                    : genuineMedalsCount > 0
                      ? `Conseguiste ${genuineMedalsCount} medallas de honor genuinas y sus respectivos audios de recompensa. Las fases donde utilizaste canjeable quedaron resueltas pero sin medalla.`
                      : "Completaste las 8 fases utilizando los canjeables en cada etapa. El archivo está abierto, aunque las medallas de honor no fueron otorgadas."}
                </p>
              </div>
            </div>

            <div className="hall-medals-grid" data-scroll-reveal>
              {phases.map((phase, index) => {
                const canjeableId = `canjeable-${index + 1}`;
                const wasCanjeableUsed = progress.usedCanjeableIds.includes(canjeableId);
                const isGenuine = !wasCanjeableUsed;

                return (
                  <div
                    className={`hall-medal-card ${isGenuine ? "is-honor" : "is-forfeited"}`}
                    key={`hall-${phase.id}`}
                  >
                    <div className="hall-medal-thumb">
                      {phase.medal.imageSrc ? (
                        <img alt={phase.medal.title} loading="lazy" src={phase.medal.imageSrc} />
                      ) : (
                        <span className="hall-medal-placeholder">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      )}
                      <span className={`hall-medal-badge ${isGenuine ? "badge-honor" : "badge-forfeited"}`}>
                        {isGenuine ? "✓ Honor Puro" : "⚠️ Canjeada"}
                      </span>
                    </div>
                    <div className="hall-medal-info">
                      <h3>Fase {String(index + 1).padStart(2, "0")}</h3>
                      <h4>{phase.medal.title}</h4>
                      <p>
                        {isGenuine
                          ? "Medalla y audio conseguidos por mérito."
                          : "Medalla y audio anulados por canjeable previo."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RECOMPENSA DEFINITIVA: EL LIBRO COMPLETO DE LOS 365 DÍAS */}
            <div className="hall-grand-reward" data-scroll-reveal>
              <div className="hall-grand-reward-header">
                <span className="hall-grand-reward-kicker">✦ RECOMPENSA DE HONOR DEFINITIVA ✦</span>
                <h3>El Libro Completo de los 365 Días</h3>
                <p>
                  Has descifrado cada secreto y recorrido las 8 fases de nuestra historia. La bóveda final está abierta y aquí puedes guardar y descargar el libro completo en sus dos ediciones oficiales:
                </p>
              </div>

              <div className="hall-books-grid">
                <div className="hall-book-card">
                  <div className="hall-book-top">
                    <div className="hall-book-thumb-wrap">
                      <img
                        src="/365-assets/cover/portada-libro.png"
                        alt="365 Libro Completo Edición Visual"
                      />
                    </div>
                    <div className="hall-book-info">
                      <span className="hall-book-badge">🎨 Edición Visual Ilustrada</span>
                      <h4>365 · El Libro Visual Completo</h4>
                      <p>
                        El libro con diseño íntegro a todo color: 365 días ilustrados con cada fotografía, dedicatoria original y detalle visual de nuestro año.
                      </p>
                    </div>
                  </div>
                  <a
                    className="button-download-book"
                    href="/365-assets/books/365-libro-completo-visual.pdf"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span>🎨 Abrir / Descargar Edición Visual (PDF)</span>
                  </a>
                </div>

                <div className="hall-book-card">
                  <div className="hall-book-top">
                    <div className="hall-book-thumb-wrap">
                      <span className="hall-book-icon-reading" aria-hidden="true">📖</span>
                    </div>
                    <div className="hall-book-info">
                      <span className="hall-book-badge">📘 Edición de Lectura</span>
                      <h4>365 · El Libro de Lectura Completo</h4>
                      <p>
                        Edición optimizada para una lectura íntima y fluida: contiene todos los textos, cartas y mensajes día por día con total nitidez.
                      </p>
                    </div>
                  </div>
                  <a
                    className="button-download-book"
                    href="/365-assets/books/365-libro-completo-lectura.pdf"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span>📖 Abrir / Descargar Edición Lectura (PDF)</span>
                  </a>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <header className="hero" data-scroll-section>
          <div className="hero-grid">
            <div className="hero-copy-block" data-scroll-reveal>
              <h1 className="hero-title">
                <button
                  aria-label="Marca secreta 365"
                  className="hero-title-button"
                  onClick={tapHeroNumber}
                  type="button"
                >
                  <span className="hero-number" ref={heroNumberRef}>
                    <span className="hero-digit hero-digit-3">3</span>
                    <span className="hero-digit hero-digit-6">6</span>
                    <span className="hero-digit hero-digit-5">5</span>
                  </span>
                </button>
              </h1>
              <p className="hero-copy">Un libro, una historia, un año juntos. Cada página guarda un recuerdo y cada fase una llave secreta.</p>
              <div className="hero-couple-showcase">
                <div className="hero-couple-img-wrap">
                  <img
                    alt="Luisa y Johan - 365 días juntos"
                    className="hero-couple-img"
                    src="/365-assets/couple/photo-4.jpg"
                  />
                  <span className="hero-couple-sparkle" aria-hidden="true">✨</span>
                </div>
                <div className="hero-couple-info">
                  <div className="hero-couple-badge">
                    <span className="hero-couple-badge-dot" aria-hidden="true" />
                    <span>365 días juntos · cada página un recuerdo</span>
                  </div>
                  <p className="hero-couple-dedication">
                    Una experiencia única de 365, explícitamente para ti y personalizado para Luisa, hecho por Johan completamente.
                  </p>
                  <span className="hero-couple-signature">
                    ✦ Edición personalizada · Con todo mi amor
                  </span>
                </div>
              </div>
              <div className="cta-row">
                <a className="button button-primary" href="#acertijo">
                  Continuar acertijo
                </a>
                <a className="button button-secondary" href="#recuerdos">
                  Ver recuerdos abiertos
                </a>
              </div>
            </div>

            <aside className="artifact-stage" aria-label="Artefacto del archivo" data-parallax="5" data-scroll-reveal>
              <div className="orbit">
                <span className="orbit-ring" />
                <span className="orbit-ring" />
                <span className="orbit-ring" />
                <div className="book-core">
                  <img
                    alt="Portada del libro 365"
                    className="book-cover-img"
                    src="/365-assets/cover/portada-libro.png"
                  />
                </div>
              </div>
              <dl className="artifact-data">
                <div>
                  <dt>Día activo</dt>
                  <dd>{activePhase.dayReference}</dd>
                </div>
                <div>
                  <dt>Regla</dt>
                  <dd>resolver para avanzar</dd>
                </div>
                <div>
                  <dt>Estado</dt>
                  <dd>{allSolved ? "archivo completo" : "archivo vivo"}</dd>
                </div>
              </dl>
            </aside>
          </div>
        </header>

        <div className="chapter-flow">
          <section className="constellation" aria-labelledby="phase-map-title" data-scroll-section>
            <h2 data-scroll-reveal id="phase-map-title">El mapa se abre de una señal a la siguiente.</h2>
            <p data-scroll-reveal>
              No hay calendario automático: cada fase espera una respuesta del libro antes de dejar
              pasar a la siguiente.
            </p>
            <div className="constellation-rail" data-scroll-reveal>
              {phases.map((phase, index) => {
                const solved = solvedSet.has(phase.id);
                const locked = index > progress.currentPhaseIndex;
                const active = index === progress.selectedPhaseIndex;

                return (
                  <button
                    aria-current={active ? "step" : undefined}
                    className={`phase-node ${solved ? "is-solved" : ""} ${locked ? "is-locked" : ""}`}
                    disabled={locked}
                    key={phase.id}
                    onClick={() => choosePhase(index)}
                    type="button"
                  >
                    <span className="node-day">{phase.dayReference}</span>
                    <span className="node-title">{phase.title}</span>
                    <span className="node-state">
                      {solved ? "abierta" : locked ? "sellada" : "disponible"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="riddle-spread" id="acertijo" aria-labelledby="riddle-title" data-scroll-section>
            <div className="riddle-drift">
              <div className="riddle-page riddle-question" data-parallax="3" data-scroll-reveal>
                <h2 id="riddle-title">{activePhase.title}</h2>
                <p>{activePhase.riddle}</p>
                <ol className="hint-path" aria-label="Pistas">
                  {activePhase.hints.map((hint) => (
                    <li key={hint}>{hint}</li>
                  ))}
                </ol>

                {activePhase.unsolvedDocSrc ? (
                  <div className="phase-doc-card">
                    <div className="phase-doc-info">
                      <span className="phase-doc-tag">
                        {isPhaseStarted
                          ? "✓ FASE INICIADA"
                          : "📄 ENIGMA DE LA FASE"}
                      </span>
                      <p>
                        {isPhaseStarted
                          ? "Documento sin solución iniciado. Puedes volver a abrirlo en cualquier momento."
                          : "Inicia la fase para recibir el documento oficial del enigma (sin solución) y habilitar la cerradura."}
                      </p>
                    </div>
                    {isPhaseStarted && activePhase.unsolvedDocSrc ? (
                      <a
                        className="button-start-phase"
                        href={activePhase.unsolvedDocSrc}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        📄 Ver documento sin solución
                      </a>
                    ) : (
                      <button
                        className="button-start-phase"
                        onClick={() => handleInitiatePhaseClick(activePhase)}
                        type="button"
                      >
                        ▶️ Iniciar fase (Abrir documento)
                      </button>
                    )}

                    {isPhaseStarted && (activePhase.readingDocSrc || activePhase.visualDocSrc) ? (
                      <div className="phase-extra-docs">
                        {activePhase.readingDocSrc ? (
                          <a
                            className="button-phase-extra"
                            href={activePhase.readingDocSrc}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            📖 Versión Lectura (PDF)
                          </a>
                        ) : null}
                        {activePhase.visualDocSrc ? (
                          <a
                            className="button-phase-extra"
                            href={activePhase.visualDocSrc}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            🎨 Versión Visual (PDF)
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="riddle-page riddle-lock" data-parallax="-3" data-scroll-reveal>
                <h2>La cerradura no quiere velocidad. Quiere lectura.</h2>
                <p>
                  Puedes escribir con mayúsculas, tildes o espacios de más. La respuesta real se valida
                  en el servidor, fuera del código visible del navegador.
                </p>

                <div className="prefix-required-notice" role="note">
                  <span className="prefix-notice-icon">⚠️</span>
                  <div className="prefix-notice-text">
                    <strong>Aviso de la cerradura:</strong> Toda contraseña o easter egg debe iniciar siempre con el signo <code>!</code> al principio para que funcione.
                  </div>
                </div>

                {!isPhaseStarted ? (
                  <div className="phase-locked-notice" role="alert">
                    <span className="phase-locked-icon">🔒</span>
                    <div className="phase-locked-text">
                      <strong>Cerradura bloqueada:</strong> Debes presionar el botón <em>&quot;Iniciar fase&quot;</em> para abrir el documento del enigma y habilitar el ingreso de la clave.
                    </div>
                  </div>
                ) : null}

                {activePhase.id === "day-230" && isPhaseStarted && !solvedSet.has("day-230") ? (
                  <div className="phase-lives-counter">
                    <div className="lives-counter-header">
                      <span className="lives-title">Vidas para descubrir la clave de la Fase 5:</span>
                      <div className="lives-hearts" aria-label={`Vidas: ${progress.phase5Lives ?? 3} de 3`}>
                        {[1, 2, 3].map((heart) => (
                          <span
                            className={`heart-icon ${heart <= (progress.phase5Lives ?? 3) ? "is-alive" : "is-lost"}`}
                            key={heart}
                          >
                            {heart <= (progress.phase5Lives ?? 3) ? "❤️" : "🖤"}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="lives-description">
                      {(progress.phase5Lives ?? 3) === 0
                        ? "💀 0 vidas restantes: Se activó el comodín de la Fase 5. La medalla y el audio quedaron anulados."
                        : `Tienes ${progress.phase5Lives ?? 3} intento${(progress.phase5Lives ?? 3) === 1 ? "" : "s"} para poner la clave verdadera. Si fallas en los 3, perderás la medalla y el audio como si usaras un comodín.`}
                    </p>
                  </div>
                ) : null}

                {activePhase.id === "day-320" && isPhaseStarted && !solvedSet.has("day-320") ? (
                  progress.usedCanjeableIds.includes("canjeable-7") ? null : phase7TimeRemaining !== null ? (
                    <div className="phase-timer-counter" role="timer" aria-live="off">
                      <div className="timer-header">
                        <span className="timer-tag">⏳ Temporizador de la Fase 7 (24h)</span>
                        <span className="timer-clock">{formatTimer(phase7TimeRemaining)}</span>
                      </div>
                      <p className="timer-description">
                        Tienes 24 horas continuas desde que iniciaste la fase para descifrar la clave. Si el tiempo expira antes de resolverla, se activará automáticamente el comodín (anulando medalla y audio).
                      </p>
                    </div>
                  ) : null
                ) : null}

                {progress.usedCanjeableIds.includes(`canjeable-${phases.findIndex((p) => p.id === activePhase.id) + 1}`) ? (
                  <div className="phase-solution-banner">
                    <div className="phase-solution-info">
                      <span className="solution-tag">⚠️ Comodín activado</span>
                      <p>
                        El comodín fue utilizado en esta fase. Tienes acceso a la resolución oficial completa.
                      </p>
                    </div>
                    {activePhase.solutionVideoSrc ? (
                      <button
                        className="button-view-solution"
                        onClick={() => setVideoModalPhase(activePhase)}
                        type="button"
                      >
                        🎬 Ver video con resolución
                      </button>
                    ) : activePhase.solutionDocSrc ? (
                      <a
                        className="button-view-solution"
                        href={activePhase.solutionDocSrc}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        🔓 Ver documento con solución (PDF)
                      </a>
                    ) : null}
                  </div>
                ) : null}

                <form className="answer-form" onSubmit={submitPhaseAnswer}>
                  <label className="sr-only" htmlFor="phase-answer">
                    Respuesta del acertijo
                  </label>
                  <input
                    autoComplete="off"
                    className="answer-field"
                    disabled={!isPhaseStarted || isSubmitting || allSolved}
                    id="phase-answer"
                    inputMode="text"
                    name="answer"
                    onChange={(event) => setPhaseAnswer(event.target.value)}
                    onKeyDown={(event) => event.stopPropagation()}
                    placeholder={
                      !isPhaseStarted
                        ? "Inicia la fase primero para ingresar la clave..."
                        : "!Escribe aquí la clave o easter egg..."
                    }
                    type="text"
                    value={phaseAnswer}
                  />
                  <button
                    className="button button-primary"
                    disabled={!isPhaseStarted || isSubmitting || allSolved}
                    type="submit"
                  >
                    {!isPhaseStarted
                      ? "🔒 Fase no iniciada"
                      : allSolved
                        ? "Archivo completo"
                        : isSubmitting
                          ? "Probando..."
                          : "Probar llave"}
                  </button>
                  <div className="feedback" role="status">
                    {feedback}
                  </div>
                </form>

                {progress.foundEasterEggs.length > 0 ? (
                  <div className="found-easter-eggs-bar">
                    <span className="found-eggs-title">✨ Easter Eggs descubiertos ({progress.foundEasterEggs.length}/3):</span>
                    <div className="found-eggs-list">
                      {progress.foundEasterEggs.map((eggId) => {
                        const egg = EASTER_EGGS[eggId];
                        if (!egg) return null;
                        return (
                          <button
                            className="button-open-easter-egg"
                            key={egg.id}
                            onClick={() => setActiveEasterEgg(egg)}
                            type="button"
                          >
                            <span>{egg.badge}</span>
                            <small>Ver video</small>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="reward-stream" id="recuerdos" aria-labelledby="reward-title" data-scroll-section>
            <h2 data-scroll-reveal id="reward-title">Lo resuelto deja algo encendido.</h2>
            {solvedRewards.length > 0 ? (
              <div className="reward-river" data-scroll-reveal>
                {solvedRewards.map((phase, index) => {
                  const phaseNumber = phases.findIndex((p) => p.id === phase.id) + 1;
                  const canjeableId = `canjeable-${phaseNumber}`;
                  const isCanjeableUsed = progress.usedCanjeableIds.includes(canjeableId);
                  return (
                    <article className="reward-row" key={phase.id}>
                      <span className="reward-index">{String(index + 1).padStart(2, "0")}</span>
                      <div className="reward-content">
                        <h3>{phase.reward.title}</h3>
                        <p>{phase.reward.description}</p>
                        <div className="reward-artifacts-shell">
                          {/* Recompensa de Medalla */}
                          <div className={`reward-medal-item ${isCanjeableUsed ? "is-silhouette" : "is-unlocked"}`}>
                            <div className="reward-medal-thumb-wrap">
                              {phase.medal.imageSrc ? (
                                <img
                                  src={phase.medal.imageSrc}
                                  alt={phase.medal.title}
                                  className={isCanjeableUsed ? "reward-medal-silhouette" : "reward-medal-img"}
                                />
                              ) : (
                                <span className="reward-medal-fallback">{String(phaseNumber).padStart(2, "0")}</span>
                              )}
                            </div>
                            <div className="reward-medal-info">
                              <span className="reward-medal-tag">
                                {isCanjeableUsed ? "⚠️ Medalla anulada (canjeable usado)" : "★ Medalla de honor conseguida"}
                              </span>
                              <h4>{phase.medal.title}</h4>
                              <p>
                                {isCanjeableUsed
                                  ? "Canjeable utilizado antes de resolver. Queda únicamente la silueta."
                                  : phase.medal.message}
                              </p>
                            </div>
                          </div>

                          {/* Recompensa de Audio */}
                          {phase.audioSrc ? (
                            !isCanjeableUsed ? (
                              <div className="reward-audio-box">
                                <div className="reward-audio-header">
                                  <span className="reward-audio-tag">🎵 Recompensa de fase</span>
                                  <span className="reward-audio-hint">Audio desbloqueado</span>
                                </div>
                                <audio controls preload="metadata" src={phase.audioSrc} />
                              </div>
                            ) : (
                              <div className="reward-audio-used">
                                <span>⚠️ Audio anulado (usaste el canjeable antes de resolver la fase)</span>
                              </div>
                            )
                          ) : null}

                          {/* Documentos de lectura y visual si existen */}
                          {phase.readingDocSrc || phase.visualDocSrc ? (
                            <div className="reward-phase-docs">
                              {phase.readingDocSrc ? (
                                <a
                                  className="button-phase-reward-doc"
                                  href={phase.readingDocSrc}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                >
                                  📖 Ver fase en formato lectura (PDF)
                                </a>
                              ) : null}
                              {phase.visualDocSrc ? (
                                <a
                                  className="button-phase-reward-doc"
                                  href={phase.visualDocSrc}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                >
                                  🎨 Ver fase en formato visual (PDF)
                                </a>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}

                {allSolved ? (
                  <div className="reward-grand-finale" data-scroll-reveal>
                    <div className="grand-finale-badge">👑 RECOMPENSA SUPREMA · LIBRO COMPLETO</div>
                    <h3>El Libro Completo de los 365 Días</h3>
                    <p>
                      Completaste las 8 fases de esta gran historia. Como recompensa suprema, aquí tienes acceso completo a las dos ediciones definitivas del libro:
                    </p>
                    <div className="grand-finale-actions">
                      <a
                        className="button-grand-book button-grand-visual"
                        href="/365-assets/books/365-libro-completo-visual.pdf"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <span className="book-btn-icon">🎨</span>
                        <span className="book-btn-text">
                          <strong>Libro Completo · Edición Visual</strong>
                          <small>365 páginas a todo color (PDF)</small>
                        </span>
                      </a>
                      <a
                        className="button-grand-book button-grand-reading"
                        href="/365-assets/books/365-libro-completo-lectura.pdf"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <span className="book-btn-icon">📖</span>
                        <span className="book-btn-text">
                          <strong>Libro Completo · Edición Lectura</strong>
                          <small>365 días de cartas y reflexiones (PDF)</small>
                        </span>
                      </a>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="empty-line" data-scroll-reveal>
                Todavía no hay recompensas abiertas. La primera respuesta convierte esta página en
                un lugar.
              </p>
            )}
          </section>

          <section className="couple-memories" aria-label="Recuerdos" data-scroll-section id="momentos">
            <div className="couple-memories-header" data-scroll-reveal>
              <span className="couple-memories-eyebrow">365 THE BEGINNING · RECUERDOS</span>
              <h2>Nuestros momentos.</h2>
              <p>Fragmentos guardados a lo largo del camino.</p>
            </div>
            <div className="couple-marquee-viewport" data-scroll-reveal>
              <div className="couple-marquee-track">
                {[...coupleMoments, ...coupleMoments].map((item, index) => {
                  const tiltClass = `card-tilt-${(index % 5) + 1}`;
                  return (
                    <figure className={`couple-card ${tiltClass}`} key={`${item.id}-${index}`}>
                      <div className="couple-card-img-wrap">
                        <img alt={item.caption} loading="lazy" src={item.src} />
                      </div>
                      <figcaption>{item.caption}</figcaption>
                    </figure>
                  );
                })}
              </div>
            </div>
          </section>

          {secretKeySystemUnlocked ? (
            <SecretKeySystem onNormalKeyCountChange={handleNormalKeyCountChange} />
          ) : null}

          <section className="tool-vault" aria-labelledby="tool-title" data-scroll-section id="canjeables">
            <div className="tool-copy" data-scroll-reveal>
              <h2 id="tool-title">Canjeables.</h2>
              <p>
                Llegaste a la bóveda. Recorre las vitrinas con el gesto horizontal o con las flechas,
                una llave por vez y sin perder tu lugar en la página.
              </p>
              <span className="tool-scroll-hint">desliza o usa las flechas · ocho canjeables</span>
              <span className="tool-title-meter" aria-hidden="true" />
              <div className="tool-controls" aria-label="Controles de canjeables">
                <button aria-label="Canjeable anterior" onClick={() => scrollRedeemables(-1)} type="button">
                  <span aria-hidden="true">←</span>
                </button>
                <button aria-label="Canjeable siguiente" onClick={() => scrollRedeemables(1)} type="button">
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
            <div
              aria-label="Lista desplazable de canjeables"
              className="tool-track-viewport"
              data-scroll-reveal
              ref={redeemableViewportRef}
              role="region"
              tabIndex={0}
            >
              <div className="tool-stream">
                {redeemables.map((item, index) => {
                  const correspondingPhase = phases[index];
                  const isPhaseSolved = correspondingPhase ? solvedSet.has(correspondingPhase.id) : false;
                  const isUsed = progress.usedCanjeableIds.includes(item.id);
                  const isCurrentPhase = index === progress.currentPhaseIndex;
                  const isFuturePhase = index > progress.currentPhaseIndex;
                  const canUse = !isPhaseSolved && !isUsed && isCurrentPhase;

                  return (
                    <article
                      className={`tool-token ${canUse ? "is-lit is-available" : ""} ${isUsed ? "is-used" : ""} ${isPhaseSolved && !isUsed ? "is-closed" : ""} ${isFuturePhase ? "is-future" : ""}`}
                      key={item.id || item.title}
                    >
                      <span className="tool-number">{String(index + 1).padStart(2, "0")}</span>
                      <img alt="" aria-hidden="true" loading="lazy" src={item.src} />
                      <div className="tool-token-copy">
                        <h3>{item.title}</h3>
                        <p>{item.detail}</p>
                        <div className="canjeable-action-shell">
                          {isUsed ? (
                            <>
                              <div className="canjeable-used-tag">
                                <span className="canjeable-check">✓</span> Canjeado / Usado
                              </div>
                              <span className="canjeable-state-hint">
                                Usado antes de resolver · Anuló la medalla y el audio de la Fase {index + 1}
                              </span>
                              {correspondingPhase?.solutionVideoSrc ? (
                                <button
                                  className="button-view-solution-token"
                                  onClick={() => setVideoModalPhase(correspondingPhase)}
                                  type="button"
                                >
                                  🎬 Ver resolución en video
                                </button>
                              ) : correspondingPhase?.solutionDocSrc ? (
                                <a
                                  className="button-view-solution-token"
                                  href={correspondingPhase.solutionDocSrc}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                >
                                  🔓 Ver solución oficial (PDF)
                                </a>
                              ) : null}
                            </>
                          ) : isPhaseSolved ? (
                            <>
                              <div className="canjeable-closed-tag">
                                🔒 No disponible
                              </div>
                              <span className="canjeable-state-hint">
                                Fase {index + 1} resuelta · Conservaste la medalla y el audio
                              </span>
                            </>
                          ) : isFuturePhase ? (
                            <>
                              <div className="canjeable-locked-tag">
                                🔒 Bloqueado
                              </div>
                              <span className="canjeable-locked-hint">
                                Se desbloquea al alcanzar la Fase {index + 1}
                              </span>
                            </>
                          ) : (
                            <>
                              <button
                                className="button-use-canjeable"
                                onClick={() => handleRequestUseCanjeable(item.id)}
                                type="button"
                              >
                                Usar canjeable
                              </button>
                              <span className="canjeable-warning-hint">
                                ⚠️ Disponible para Fase {index + 1}. Si lo usas, no recibirás la medalla ni el audio al poner la clave.
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="video-chamber" aria-labelledby="video-title" data-scroll-section id="video-manual">
            <div className="video-frame" data-parallax="4" data-scroll-reveal>
              <video controls playsInline preload="metadata" src="/365-assets/video/signal-video.mp4">
                Tu navegador no puede reproducir este video.
              </video>
            </div>
            <div className="video-copy" data-scroll-reveal>
              <h2 id="video-title">Hay una señal que no se lee: se mira.</h2>
              <p>
                Mira el recorrido completo y, si necesitas volver a un paso concreto, abre el manual
                del libro junto al video.
              </p>
              <a
                className="manual-link"
                href="/365-assets/manual/libro-365-manual.pdf"
                rel="noreferrer"
                target="_blank"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M6 3.75h8.25L18 7.5v12.75H6z" />
                  <path d="M14.25 3.75V7.5H18M9 11.25h6M9 14.5h6" />
                </svg>
                <span>
                  <strong>Abrir manual del libro</strong>
                  <small>PDF · se abre en otra pestaña</small>
                </span>
              </a>
            </div>
          </section>

          <section className="medal-archive" aria-labelledby="medal-title" data-scroll-section id="medallas">
            <h2 data-scroll-reveal id="medal-title">El final no es una línea: es una bóveda.</h2>
            <p data-scroll-reveal>
              Las fases resueltas dejan siluetas encendidas. Las que faltan no desaparecen: esperan
              como metal apagado.
            </p>
            <div className="medal-grid" data-scroll-reveal>
              {phases.map((phase, index) => {
                const unlocked = solvedSet.has(phase.id);
                const canjeableId = `canjeable-${index + 1}`;
                const canjeableUsed = progress.usedCanjeableIds.includes(canjeableId);
                const medalWon = unlocked && !canjeableUsed;
                const medalForfeited = unlocked && canjeableUsed;

                return (
                  <article
                    aria-label={`${phase.medal.title}: ${medalWon ? "conseguida" : medalForfeited ? "sin medalla (canjeable usado)" : "bloqueada"}`}
                    className={`medal-token ${medalWon ? "is-lit" : medalForfeited ? "is-forfeited" : "is-locked"}`}
                    key={phase.id}
                  >
                    <div className="medal-image-shell">
                      {phase.medal.imageSrc ? (
                        <img alt="" aria-hidden="true" loading="lazy" src={phase.medal.imageSrc} />
                      ) : (
                        <span aria-hidden="true" className="medal-placeholder">
                          <svg viewBox="0 0 64 64">
                            <path d="M19 7h26l5 18-18 31L14 25 19 7Z" />
                            <path d="m25 25 7-5 7 5-3 8 5 7-9-1-9 1 5-7-3-8Z" />
                          </svg>
                          <strong>{String(index + 1).padStart(2, "0")}</strong>
                        </span>
                      )}
                      {!unlocked ? (
                        <span aria-hidden="true" className="medal-question">?</span>
                      ) : medalForfeited ? (
                        <span aria-hidden="true" className="medal-forfeited-badge">Sin medalla</span>
                      ) : null}
                    </div>
                    <div>
                      <h3>{phase.medal.title}</h3>
                      <p>
                        {medalWon
                          ? phase.medal.message
                          : medalForfeited
                            ? "Fase resuelta · La medalla y el audio se perdieron por usar el canjeable antes de resolverla."
                            : `Fase ${index + 1} · pendiente de desbloqueo.`}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {toast ? (
        <div
          aria-live="polite"
          className={`easter-toast ${toastExiting ? "easter-toast-exiting" : ""}`}
          onMouseEnter={handleToastMouseEnter}
          onMouseLeave={handleToastMouseLeave}
          role="status"
        >
          <span className="easter-toast-text">{toast.message}</span>
          <button
            aria-label="Cerrar notificación"
            className="easter-toast-close"
            onClick={dismissToast}
            type="button"
          >
            ✕
          </button>
        </div>
      ) : null}
      {earnedMedalPhase ? (
        <PhaseMedalModal
          isCanjeableUsed={progress.usedCanjeableIds.includes(
            `canjeable-${phases.findIndex((phase) => phase.id === earnedMedalPhase.id) + 1}`,
          )}
          onClose={() => setEarnedMedalPhase(null)}
          phase={earnedMedalPhase}
          phaseNumber={phases.findIndex((phase) => phase.id === earnedMedalPhase.id) + 1}
        />
      ) : null}

      {activeEasterEgg ? (
        <EasterEggModal
          easterEgg={activeEasterEgg}
          onClose={() => setActiveEasterEgg(null)}
        />
      ) : null}

      {videoModalPhase && videoModalPhase.solutionVideoSrc ? (
        <ResolutionVideoModal
          onClose={() => setVideoModalPhase(null)}
          phaseNumber={phases.findIndex((phase) => phase.id === videoModalPhase.id) + 1}
          phaseTitle={videoModalPhase.title}
          videoSrc={videoModalPhase.solutionVideoSrc}
        />
      ) : null}

      {confirmStartPhase ? (
        <div
          aria-labelledby="confirm-start-title"
          aria-modal="true"
          className="start-phase-confirm-overlay"
          role="dialog"
        >
          <div className="start-phase-confirm-modal">
            <div className="start-phase-confirm-badge">📖 Inicio de fase · Libro 365</div>
            <h3 id="confirm-start-title">
              ¿Estás segura de iniciar la Fase {phases.findIndex((p) => p.id === confirmStartPhase.id) + 1} del libro?
            </h3>
            <p>
              Estás a punto de iniciar esta fase. Al presionar iniciar, se abrirá el documento del enigma sin resolver en otra pestaña y se desbloqueará la cerradura para que puedas ingresar la clave.
            </p>
            {confirmStartPhase.id === "day-230" ? (
              <div className="phase-warning-box warning-lives">
                <strong>⚠️ Advertencia de la Fase 5:</strong>
                <span>En esta fase dispondrás únicamente de 3 vidas para ingresar la clave correcta. Si fallas los 3 intentos, se activará automáticamente el comodín.</span>
              </div>
            ) : null}
            {confirmStartPhase.id === "day-320" ? (
              <div className="phase-warning-box warning-timer">
                <strong>⚠️ Advertencia crítica de la Fase 7:</strong>
                <span>Al iniciar esta fase comenzará a correr un temporizador ininterrumpido de <strong>24 horas</strong>. Si no ingresas la clave correcta antes de que termine el tiempo, la fase contará como comodín utilizado y no podrás obtener la medalla ni el audio de recompensa.</span>
              </div>
            ) : null}
            <div className="start-phase-confirm-actions">
              <button
                className="button-confirm-cancel"
                onClick={() => setConfirmStartPhase(null)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="button-confirm-start"
                onClick={handleConfirmStartPhase}
                type="button"
              >
                Sí, iniciar fase
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmCanjeableId ? (
        <div
          aria-labelledby="confirm-modal-title"
          aria-modal="true"
          className="canjeable-confirm-overlay"
          role="dialog"
        >
          <div className="canjeable-confirm-modal">
            <div className="canjeable-confirm-badge">⚠️ Advertencia de canjeable</div>
            <h3 id="confirm-modal-title">¿Estás segura de usar este canjeable?</h3>
            <p>
              Al usar este comodín se te abrirá automáticamente{" "}
              {phases[parseInt(confirmCanjeableId.replace("canjeable-", ""), 10) - 1]?.solutionVideoSrc
                ? "el video oficial con la resolución"
                : "el documento oficial con la solución"}{" "}
              de la <strong>Fase {confirmCanjeableId.replace("canjeable-", "")}</strong>.
              Podrás avanzar con la clave, pero <strong>NO tendrás acceso ni al audio de recompensa ni a la medalla</strong> (quedarán anulados permanentemente).
            </p>
            <div className="canjeable-confirm-actions">
              <button
                className="button-confirm-cancel"
                onClick={() => setConfirmCanjeableId(null)}
                type="button"
              >
                Cancelar / No usar
              </button>
              <button
                className="button-confirm-danger"
                onClick={handleConfirmUseCanjeable}
                type="button"
              >
                Sí, usar canjeable
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
