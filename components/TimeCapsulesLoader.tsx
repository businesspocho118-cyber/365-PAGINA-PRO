"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { CapsuleModal, type CapsuleData, type CapsuleDefinition } from "@/components/CapsuleModal";
import styles from "./TimeCapsulesLoader.module.css";

const CAPSULES_STORAGE_KEY = "secret-365-capsules-sealed";
const CAPSULES_DRAFT_KEY = "secret-365-capsules-draft-v1";

const CAPSULE_DEFINITIONS: CapsuleDefinition[] = [
  {
    id: "johan",
    title: "Cápsula de Johan",
    subtitle: "Una carta y promesa personal de Johan para el futuro.",
    imageSrc: "/365-assets/capsules/johan.jpg",
    defaultEmailPlaceholder: "johan@ejemplo.com",
    promptHint: "Escribe aquí lo que quieres que Johan del futuro sienta, recuerde o reflexione...",
  },
  {
    id: "pareja",
    title: "Cápsula de Pareja",
    subtitle: "Nuestro pacto, recuerdos y promesas compartidas.",
    imageSrc: "/365-assets/capsules/pareja.jpg",
    defaultEmailPlaceholder: "correo@ejemplo.com",
    promptHint: "Escribe una promesa de los dos, un sueño que quieren cumplir o una carta para leer juntos...",
  },
  {
    id: "luisa",
    title: "Cápsula de Luisa",
    subtitle: "Una carta y mensaje íntimo de Luisa para el futuro.",
    imageSrc: "/365-assets/capsules/luisa.jpg",
    defaultEmailPlaceholder: "luisa@ejemplo.com",
    promptHint: "Escribe aquí un mensaje para que Luisa reciba en la fecha que elijas...",
  },
];

type TimeCapsulesLoaderProps = {
  onComplete: () => void;
};

export function TimeCapsulesLoader({ onComplete }: TimeCapsulesLoaderProps) {
  const [mounted, setMounted] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isSealed, setIsSealed] = useState(false);
  const [activeModalCapsule, setActiveModalCapsule] = useState<CapsuleDefinition | null>(null);
  const [capsulesData, setCapsulesData] = useState<Record<string, CapsuleData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTriumph, setShowTriumph] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Estado para la prueba de envío inmediato
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    setMounted(true);

    // 1. Verificación rápida local (0ms en el mismo dispositivo)
    const localSealed = localStorage.getItem(CAPSULES_STORAGE_KEY);
    if (localSealed === "true") {
      setIsSealed(true);
      setCheckingStatus(false);
      onComplete();
      return;
    }

    // Cargar borradores si existen
    try {
      const savedDraft = localStorage.getItem(CAPSULES_DRAFT_KEY);
      if (savedDraft) {
        setCapsulesData(JSON.parse(savedDraft));
      }
    } catch {
      // ignore
    }

    // 2. Verificación global cross-device (para cuando Luisa u otro dispositivo entre)
    fetch("/api/capsules")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.sealed) {
          // Ya fue sellada remotamente por Johan (u otro dispositivo)
          localStorage.setItem(CAPSULES_STORAGE_KEY, "true");
          setIsSealed(true);
          onComplete();
        } else {
          // Aún no está sellada: mostramos la pantalla ceremonial
          setCheckingStatus(false);
        }
      })
      .catch(() => {
        // Si hay fallo de red, permitimos continuar
        setCheckingStatus(false);
      });
  }, [onComplete]);

  const configuredCount = useMemo(() => {
    return CAPSULE_DEFINITIONS.filter((cap) => Boolean(capsulesData[cap.id])).length;
  }, [capsulesData]);

  const handleSaveCapsule = (data: CapsuleData) => {
    if (!activeModalCapsule) return;

    const next = {
      ...capsulesData,
      [activeModalCapsule.id]: data,
    };
    setCapsulesData(next);
    localStorage.setItem(CAPSULES_DRAFT_KEY, JSON.stringify(next));
    setActiveModalCapsule(null);
  };

  const handleSealAll = async () => {
    if (configuredCount < 3) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const payload = CAPSULE_DEFINITIONS.map((def) => ({
      id: def.id,
      title: def.title,
      recipientEmail: capsulesData[def.id].recipientEmail,
      targetDate: capsulesData[def.id].targetDate,
      message: capsulesData[def.id].message,
    }));

    try {
      const res = await fetch("/api/capsules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capsules: payload }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.message || "Error al sellar las cápsulas en el servidor.");
      }

      // Marcar como sellado permanentemente en cliente
      localStorage.setItem(CAPSULES_STORAGE_KEY, "true");
      localStorage.removeItem(CAPSULES_DRAFT_KEY);
      setShowTriumph(true);

      setTimeout(() => {
        onComplete();
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSubmitError(msg);
      setIsSubmitting(false);
    }
  };


  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail || !testEmail.includes("@")) return;

    setTestLoading(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/capsules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_email", email: testEmail }),
      });
      const data = await res.json();
      setTestResult({
        ok: data.ok,
        message: data.message || (data.ok ? "Correo enviado con éxito" : "Error al enviar correo"),
      });
    } catch (err: unknown) {
      setTestResult({
        ok: false,
        message: "Error de conexión: " + (err instanceof Error ? err.message : String(err)),
      });
    } finally {
      setTestLoading(false);
    }
  };

  // Mientras verifica el estado remoto (Luisa en otro PC), no mostramos las cápsulas
  if (!mounted || checkingStatus || isSealed) {
    return (
      <div className={styles.container}>
        <div className={styles.ambientGlow} />
        <div className={styles.content}>
          <div className={styles.badge}>365 THE BEGINNING</div>
          <p className={styles.description}>Alineando el universo de recuerdos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} role="region" aria-label="Cápsulas del tiempo iniciales">
      <div className={styles.ambientGlow} />

      {showTriumph && (
        <div className={styles.triumphOverlay}>
          <h2 className={styles.triumphTitle}>✨ Cápsulas Selladas ✨</h2>
          <p className={styles.triumphSubtitle}>
            Tus cartas han sido enviadas al continuo espacio-tiempo. Viajarán con seguridad y llegarán
            exactamente en la fecha elegida.
          </p>
          <div className={styles.badge}>Iniciando universo 365...</div>
        </div>
      )}

      <div className={styles.content}>
        <header className={styles.header}>
          <span className={styles.badge}>Cápsulas del Tiempo</span>
          <h1 className={styles.title}>Tres promesas para el futuro</h1>
          <p className={styles.description}>
            Antes de comenzar tu viaje por 365, dejemos tres cartas selladas que viajarán a través de los años.
            Cada cápsula se abrirá por correo en la fecha que elijas (hasta 5 años en el futuro).
          </p>
        </header>

        <div className={styles.grid}>
          {CAPSULE_DEFINITIONS.map((capsule) => {
            const data = capsulesData[capsule.id];
            const isConfigured = Boolean(data);

            return (
              <div
                key={capsule.id}
                className={`${styles.card} ${isConfigured ? styles.cardConfigured : ""}`}
                onClick={() => setActiveModalCapsule(capsule)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setActiveModalCapsule(capsule);
                  }
                }}
              >
                <div className={styles.imageContainer}>
                  <Image
                    src={capsule.imageSrc}
                    alt={capsule.title}
                    width={180}
                    height={180}
                    className={styles.capsuleImage}
                    priority
                  />
                </div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardTitle}>{capsule.title}</h3>
                  <p className={styles.cardSubtitle}>{capsule.subtitle}</p>

                  <div
                    className={`${styles.statusPill} ${
                      isConfigured ? styles.statusConfigured : styles.statusPending
                    }`}
                  >
                    {isConfigured ? `✨ Abre: ${data.targetDate}` : "🟡 Configurar cápsula"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.footerActions}>
          <div className={styles.progressNote}>
            {configuredCount === 3
              ? "✨ Las 3 cápsulas están listas para sellar"
              : `Progreso: ${configuredCount} de 3 cápsulas preparadas`}
          </div>

          {submitError && (
            <div className={styles.errorMessage}>
              {submitError}
            </div>
          )}

          <button
            type="button"
            className={styles.sealButton}
            disabled={configuredCount < 3 || isSubmitting}
            onClick={handleSealAll}
          >
            {isSubmitting ? (
              "Sellando promesas en el tiempo..."
            ) : configuredCount < 3 ? (
              `Prepara las 3 cápsulas (${configuredCount}/3)`
            ) : (
              "Sellar Cápsulas y Entrar al Universo 365 ✨"
            )}
          </button>

          {/* Botones de prueba y simulación */}
          <div className={styles.testActionsRow}>
            <button
              type="button"
              className={styles.testBtnTrigger}
              onClick={() => setShowTestModal(true)}
            >
              🧪 Probar envío de correo inmediato
            </button>
          </div>
        </div>
      </div>

      {/* Modal de edición de cápsula */}
      {activeModalCapsule && (
        <CapsuleModal
          capsule={activeModalCapsule}
          initialData={capsulesData[activeModalCapsule.id]}
          onSave={handleSaveCapsule}
          onClose={() => setActiveModalCapsule(null)}
        />
      )}

      {/* Modal de prueba de correo */}
      {showTestModal && (
        <div className={styles.testModalOverlay} onClick={() => setShowTestModal(false)}>
          <div className={styles.testModalDialog} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.testModalTitle}>🧪 Prueba de Envío Inmediato</h3>
            <p className={styles.testModalDesc}>
              Ingresa tu correo para enviar una cápsula de prueba instantánea y comprobar que el sistema entrega
              correctamente en tu bandeja de entrada.
            </p>

            <form onSubmit={handleSendTestEmail} className={styles.testForm}>
              <input
                type="email"
                placeholder="tu-correo@gmail.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                required
                className={styles.testInput}
              />

              {testResult && (
                <div
                  className={testResult.ok ? styles.testSuccessNotice : styles.testErrorNotice}
                >
                  {testResult.message}
                </div>
              )}

              <div className={styles.testActions}>
                <button
                  type="button"
                  className={styles.testCancelBtn}
                  onClick={() => setShowTestModal(false)}
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className={styles.testSubmitBtn}
                  disabled={testLoading}
                >
                  {testLoading ? "Enviando correo..." : "Enviar Correo de Prueba"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
