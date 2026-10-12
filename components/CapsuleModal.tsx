"use client";

import { useState, useId, useMemo } from "react";
import Image from "next/image";
import styles from "./CapsuleModal.module.css";

export type CapsuleData = {
  recipientEmail: string;
  targetDate: string;
  message: string;
};

export type CapsuleDefinition = {
  id: "johan" | "luisa" | "pareja";
  title: string;
  subtitle: string;
  imageSrc: string;
  defaultEmailPlaceholder: string;
  promptHint: string;
};

type CapsuleModalProps = {
  capsule: CapsuleDefinition;
  initialData?: CapsuleData;
  onSave: (data: CapsuleData) => void;
  onClose: () => void;
};

export function CapsuleModal({ capsule, initialData, onSave, onClose }: CapsuleModalProps) {
  const [email, setEmail] = useState(initialData?.recipientEmail || "");
  const [date, setDate] = useState(initialData?.targetDate || "");
  const [message, setMessage] = useState(initialData?.message || "");
  const [error, setError] = useState<string | null>(null);

  const emailId = useId();
  const dateId = useId();
  const messageId = useId();

  // Constraints: Min tomorrow, Max 5 years from today
  const { minDate, maxDate } = useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const max = new Date(now);
    max.setFullYear(max.getFullYear() + 5);

    return {
      minDate: tomorrow.toISOString().split("T")[0],
      maxDate: max.toISOString().split("T")[0],
    };
  }, []);

  const handleQuickYears = (years: number) => {
    const target = new Date();
    target.setFullYear(target.getFullYear() + years);
    setDate(target.toISOString().split("T")[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes("@")) {
      setError("Por favor ingresa un correo electrónico válido.");
      return;
    }

    if (!date) {
      setError("Por favor selecciona una fecha en el futuro (máximo 5 años).");
      return;
    }

    if (date < minDate || date > maxDate) {
      setError("La fecha debe estar entre mañana y un máximo de 5 años en el futuro.");
      return;
    }

    if (!message.trim() || message.trim().length < 5) {
      setError("Escribe un mensaje para sellar en la cápsula.");
      return;
    }

    onSave({
      recipientEmail: email.trim(),
      targetDate: date,
      message: message.trim(),
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} type="button" aria-label="Cerrar modal">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className={styles.header}>
          <div className={styles.imageWrap}>
            <Image
              src={capsule.imageSrc}
              alt={capsule.title}
              width={110}
              height={110}
              className={styles.capsuleImg}
              priority
            />
            <div className={styles.imageGlow} />
          </div>
          <div className={styles.headerInfo}>
            <span className={styles.tag}>Cápsula del Tiempo</span>
            <h2 className={styles.title}>{capsule.title}</h2>
            <p className={styles.subtitle}>{capsule.subtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorBox}>{error}</div>}

          {/* Fecha al futuro */}
          <div className={styles.field}>
            <label htmlFor={dateId} className={styles.label}>
              1. ¿Cuándo se abrirá este mensaje? (Máximo 5 años)
            </label>
            <div className={styles.quickButtons}>
              <button
                type="button"
                className={styles.quickBtn}
                onClick={() => handleQuickYears(1)}
              >
                +1 Año
              </button>
              <button
                type="button"
                className={styles.quickBtn}
                onClick={() => handleQuickYears(2)}
              >
                +2 Años
              </button>
              <button
                type="button"
                className={styles.quickBtn}
                onClick={() => handleQuickYears(3)}
              >
                +3 Años
              </button>
              <button
                type="button"
                className={styles.quickBtn}
                onClick={() => handleQuickYears(5)}
              >
                +5 Años (Máx)
              </button>
            </div>
            <input
              id={dateId}
              type="date"
              className={styles.input}
              value={date}
              min={minDate}
              max={maxDate}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <span className={styles.helperText}>
              Llegará automáticamente a las 8:00 AM de la fecha elegida.
            </span>
          </div>

          {/* Correo destino */}
          <div className={styles.field}>
            <label htmlFor={emailId} className={styles.label}>
              2. Correo electrónico donde se enviará
            </label>
            <input
              id={emailId}
              type="email"
              className={styles.input}
              placeholder={capsule.defaultEmailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className={styles.helperText}>
              Asegúrate de usar una cuenta de correo que siga activa en los próximos años.
            </span>
          </div>

          {/* Mensaje de la cápsula */}
          <div className={styles.field}>
            <label htmlFor={messageId} className={styles.label}>
              3. Mensaje para viajar en el tiempo
            </label>
            <textarea
              id={messageId}
              rows={5}
              className={styles.textarea}
              placeholder={capsule.promptHint}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <div className={styles.charCount}>
              {message.length} caracteres
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn}>
              Guardar en Cápsula
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
