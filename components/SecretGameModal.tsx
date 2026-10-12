"use client";

import { CSSProperties, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { ImportantSecretKey, SecretGameId } from "@/lib/secret-keys";
import styles from "./SecretKeySystem.module.css";

type SecretGameModalProps = {
  game: ImportantSecretKey;
  completed: boolean;
  onClose: () => void;
  onComplete: (id: SecretGameId) => void;
};

export function SecretGameModal({ game, completed, onClose, onComplete }: SecretGameModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

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
      gsap.fromTo(
        modalRef.current,
        { autoAlpha: 0, scale: 0.94, y: 28 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.38, ease: "power3.out" },
      );
    },
    { dependencies: [game.id], scope: modalRef },
  );

  return (
    <div
      className={styles.modalScrim}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div
        aria-labelledby="secret-game-title"
        aria-modal="true"
        className={styles.modal}
        data-lenis-prevent
        ref={modalRef}
        role="dialog"
      >
        <header className={styles.modalHeader}>
          <div>
            <span className={styles.eyebrow}>prueba secreta</span>
            <h2 id="secret-game-title">{game.title}</h2>
            <p>{game.theme}</p>
          </div>
          <button aria-label="Cerrar minijuego" className={styles.closeButton} onClick={onClose} ref={closeRef} type="button">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </header>

        {completed ? (
          <VictoryPanel game={game} onClose={onClose} />
        ) : (
          <GameById gameId={game.id} onComplete={() => onComplete(game.id)} />
        )}
      </div>
    </div>
  );
}

function VictoryPanel({ game, onClose }: { game: ImportantSecretKey; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        `.${styles.victoryRay}`,
        { scale: 0.2, rotate: -20, autoAlpha: 0 },
        { scale: 1, rotate: 0, autoAlpha: 1, stagger: 0.06, duration: 0.55, ease: "back.out(1.8)" },
      );
    },
    { scope: panelRef },
  );

  return (
    <div className={styles.victory} ref={panelRef}>
      <div aria-hidden="true" className={styles.victoryMark}>
        {Array.from({ length: 8 }, (_, index) => (
          <span className={styles.victoryRay} key={index} />
        ))}
        <strong>✓</strong>
      </div>
      <span className={styles.eyebrow}>prueba completada</span>
      <h3>Encontraste una parte de la respuesta.</h3>
      <dl className={styles.clueReveal}>
        <div>
          <dt>{game.clueLabel}</dt>
          <dd>{game.clueValue}</dd>
        </div>
      </dl>
      <button className={styles.primaryButton} onClick={onClose} type="button">
        Guardar pista y cerrar
      </button>
    </div>
  );
}

function GameById({ gameId, onComplete }: { gameId: SecretGameId; onComplete: () => void }) {
  if (gameId === "felicitaciones") return <CelebrationGame onComplete={onComplete} />;
  if (gameId === "indispensable") return <NumberMergeGame onComplete={onComplete} />;
  if (gameId === "confio") return <WordGuessGame onComplete={onComplete} />;
  return <ArithmeticFlashGame onComplete={onComplete} />;
}

type StarTarget = { id: number; x: number; y: number };

const STAR_GOAL = 10;
const STAR_DURATION = 15;

function createStarTarget(id: number, previous: StarTarget | null): StarTarget {
  let x = randomBetween(10, 90);
  let y = randomBetween(12, 88);

  // Keep successive targets apart so the new star is visibly somewhere else.
  for (let attempts = 0; previous && attempts < 8; attempts += 1) {
    if (Math.hypot(x - previous.x, y - previous.y) >= 20) break;
    x = randomBetween(10, 90);
    y = randomBetween(12, 88);
  }

  return { id, x, y };
}

function CelebrationGame({ onComplete }: { onComplete: () => void }) {
  const [hits, setHits] = useState(0);
  const [seconds, setSeconds] = useState(STAR_DURATION);
  const [target, setTarget] = useState<StarTarget | null>(() => createStarTarget(1, null));
  const [state, setState] = useState<"playing" | "failed" | "completed">("playing");
  const lastTargetRef = useRef<StarTarget | null>(target);
  const nextTargetIdRef = useRef(2);
  const completionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (state !== "playing") return;
    const timer = window.setTimeout(() => {
      if (seconds <= 1) {
        setSeconds(0);
        setTarget(null);
        setState("failed");
        return;
      }
      setSeconds((current) => current - 1);
      setTarget((current) => {
        const next = createStarTarget(nextTargetIdRef.current, current ?? lastTargetRef.current);
        nextTargetIdRef.current += 1;
        lastTargetRef.current = next;
        return next;
      });
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [seconds, state]);

  useEffect(() => () => {
    if (completionTimerRef.current !== null) window.clearTimeout(completionTimerRef.current);
  }, []);

  function hitStar(element: HTMLButtonElement) {
    if (state !== "playing" || !target) return;
    gsap.to(element, { scale: 1.7, autoAlpha: 0, rotate: 24, duration: 0.18, ease: "power2.out" });
    setTarget(null);
    setHits((current) => {
      const next = current + 1;
      if (next === STAR_GOAL) {
        setState("completed");
        completionTimerRef.current = window.setTimeout(onComplete, 260);
      }
      return next;
    });
  }

  function retry() {
    if (completionTimerRef.current !== null) window.clearTimeout(completionTimerRef.current);
    const firstTarget = createStarTarget(1, null);
    setHits(0);
    setSeconds(STAR_DURATION);
    setTarget(firstTarget);
    setState("playing");
    lastTargetRef.current = firstTarget;
    nextTargetIdRef.current = 2;
  }

  return (
    <div className={styles.gameBody}>
      <div className={styles.gameStatus}>
        <span>{hits}/{STAR_GOAL} estrellas</span>
        <span>{seconds}s</span>
      </div>
      <p className={styles.gameInstruction} id="star-game-instruction">
        Haz clic en 10 estrellas antes de que termine el tiempo. Aparece una nueva cada segundo: no la pierdas de vista.
      </p>
      <div aria-describedby="star-game-instruction" aria-label="Panel de estrellas" className={styles.sparkField}>
        {target ? (
          <button
            aria-label={`Atrapar estrella ${hits + 1} de ${STAR_GOAL}`}
            className={styles.spark}
            disabled={state !== "playing"}
            key={target.id}
            onClick={(event) => hitStar(event.currentTarget)}
            style={{ "--spark-x": `${target.x}%`, "--spark-y": `${target.y}%` } as CSSProperties}
            type="button"
          >
            <span />
          </button>
        ) : null}
      </div>
      <p aria-live="polite" className={styles.srOnly}>{state === "completed" ? "Diez estrellas capturadas." : `${hits} de ${STAR_GOAL} estrellas capturadas. Quedan ${seconds} segundos.`}</p>
      {state === "failed" ? (
        <div className={styles.retryLine} role="status">
          <span>Se acabó el tiempo. Prueba otra vez.</span>
          <button onClick={retry} type="button">Reintentar</button>
        </div>
      ) : null}
    </div>
  );
}

type MergeBoard = number[][];
type MergeGameState = "intro" | "playing" | "won" | "over";
type Direction = "up" | "down" | "left" | "right";

const BOARD_SIZE = 4;
const MERGE_TARGET = 1012;

function emptyMergeBoard(): MergeBoard {
  return Array.from({ length: BOARD_SIZE }, () => Array<number>(BOARD_SIZE).fill(0));
}

function addMergeTile(board: MergeBoard): MergeBoard {
  const emptyCells: Array<[number, number]> = [];
  board.forEach((row, rowIndex) => row.forEach((value, columnIndex) => {
    if (value === 0) emptyCells.push([rowIndex, columnIndex]);
  }));
  if (!emptyCells.length) return board;

  const [row, column] = emptyCells[randomBetween(0, emptyCells.length - 1)];
  const next = board.map((line) => [...line]);
  next[row][column] = Math.random() < 0.82 ? 2 : 4;
  return next;
}

function createMergeBoard() {
  return addMergeTile(addMergeTile(emptyMergeBoard()));
}

function mergeLine(line: number[]) {
  const compacted = line.filter(Boolean);
  const merged: number[] = [];
  let mergedTarget = false;

  for (let index = 0; index < compacted.length; index += 1) {
    if (compacted[index] === compacted[index + 1]) {
      const sum = compacted[index] * 2;
      // 2 and 4 can only create powers of two. The final 512 + 512 fusion is
      // deliberately capped at the challenge's requested 1012 finish line.
      const value = sum === 1024 ? MERGE_TARGET : sum;
      merged.push(value);
      mergedTarget ||= value === MERGE_TARGET;
      index += 1;
    } else {
      merged.push(compacted[index]);
    }
  }

  return { line: [...merged, ...Array<number>(BOARD_SIZE - merged.length).fill(0)], mergedTarget };
}

function moveMergeBoard(board: MergeBoard, direction: Direction) {
  const next = emptyMergeBoard();
  let changed = false;
  let mergedTarget = false;

  for (let index = 0; index < BOARD_SIZE; index += 1) {
    const source = direction === "left" || direction === "right"
      ? board[index]
      : board.map((row) => row[index]);
    const ordered = direction === "right" || direction === "down" ? [...source].reverse() : source;
    const outcome = mergeLine(ordered);
    const output = direction === "right" || direction === "down" ? [...outcome.line].reverse() : outcome.line;

    if (source.some((value, cellIndex) => value !== output[cellIndex])) changed = true;
    mergedTarget ||= outcome.mergedTarget;

    if (direction === "left" || direction === "right") next[index] = output;
    else output.forEach((value, rowIndex) => { next[rowIndex][index] = value; });
  }

  return { board: next, changed, mergedTarget };
}

function canMoveMergeBoard(board: MergeBoard) {
  if (board.some((row) => row.some((value) => value === 0))) return true;
  return board.some((row, rowIndex) => row.some((value, columnIndex) =>
    value === row[columnIndex + 1] || value === board[rowIndex + 1]?.[columnIndex],
  ));
}

function NumberMergeGame({ onComplete }: { onComplete: () => void }) {
  const [board, setBoard] = useState<MergeBoard>(() => createMergeBoard());
  const [state, setState] = useState<MergeGameState>("intro");
  const [feedback, setFeedback] = useState("Prepara el tablero cuando estés lista.");
  const completionTimerRef = useRef<number | null>(null);

  const restart = useCallback(() => {
    if (completionTimerRef.current !== null) window.clearTimeout(completionTimerRef.current);
    setBoard(createMergeBoard());
    setState("playing");
    setFeedback("Combina fichas iguales. El límite exacto es 1012.");
  }, []);

  const move = useCallback((direction: Direction) => {
    if (state !== "playing") return;
    const outcome = moveMergeBoard(board, direction);
    if (!outcome.changed) return;

    const nextBoard = outcome.mergedTarget ? outcome.board : addMergeTile(outcome.board);
    setBoard(nextBoard);
    if (outcome.mergedTarget) {
      setState("won");
      setFeedback("Llegaste exactamente a 1012. El tablero quedó resuelto.");
      completionTimerRef.current = window.setTimeout(onComplete, 500);
      return;
    }
    if (!canMoveMergeBoard(nextBoard)) {
      setState("over");
      setFeedback("No quedan movimientos. Reinicia el tablero para probar otra combinación.");
    }
  }, [board, onComplete, state]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const keyToDirection: Record<string, Direction> = {
        ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      };
      const direction = keyToDirection[event.key];
      if (!direction || state !== "playing") return;
      event.preventDefault();
      move(direction);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [move, state]);

  useEffect(() => () => {
    if (completionTimerRef.current !== null) window.clearTimeout(completionTimerRef.current);
  }, []);

  if (state === "intro") {
    return (
      <div className={`${styles.gameBody} ${styles.mergeIntro}`}>
        <div className={styles.mergeMark} aria-hidden="true"><span>2</span><span>4</span><span>+</span><strong>1012</strong></div>
        <p className={styles.gameInstruction}>
          Desliza o usa las flechas para unir fichas del mismo número. Cada unión las duplica y aparece una nueva ficha. Llega a <strong>1012 exacto</strong>: no hay que superar ese límite.
        </p>
        <button autoFocus className={styles.primaryButton} onClick={restart} type="button">Jugar ahora</button>
      </div>
    );
  }

  return (
    <div className={`${styles.gameBody} ${styles.mergeGame}`}>
      <div className={styles.mergeStatus}>
        <span>Objetivo <strong>1012</strong></span>
        <span>{state === "won" ? "completado" : state === "over" ? "sin movimientos" : "tablero activo"}</span>
      </div>
      <p className={styles.gameInstruction} id="merge-instruction">Une números iguales para llegar a 1012. Usa las flechas del teclado o los controles del panel.</p>
      <div aria-describedby="merge-instruction" aria-label="Tablero de números 4 por 4" className={styles.mergeBoard} role="grid">
        {board.flatMap((row, rowIndex) => row.map((value, columnIndex) => (
          <div aria-label={value ? `Fila ${rowIndex + 1}, columna ${columnIndex + 1}: ${value}` : `Fila ${rowIndex + 1}, columna ${columnIndex + 1}: vacía`} className={`${styles.mergeTile} ${value ? styles[`tile${value}`] ?? "" : ""}`} key={`${rowIndex}-${columnIndex}`} role="gridcell">
            {value || ""}
          </div>
        )))}
      </div>
      <div aria-label="Controles de dirección" className={styles.mergeControls}>
        <button aria-label="Mover arriba" disabled={state !== "playing"} onClick={() => move("up")} type="button">↑</button>
        <button aria-label="Mover izquierda" disabled={state !== "playing"} onClick={() => move("left")} type="button">←</button>
        <button aria-label="Mover abajo" disabled={state !== "playing"} onClick={() => move("down")} type="button">↓</button>
        <button aria-label="Mover derecha" disabled={state !== "playing"} onClick={() => move("right")} type="button">→</button>
      </div>
      <p aria-live="polite" className={styles.gameInstruction} role="status">{feedback}</p>
      <button className={styles.restartGame} onClick={restart} type="button">Reiniciar tablero</button>
    </div>
  );
}

const WORD_LENGTH = 5;
const WORD_ATTEMPTS = 6;
// Keep the challenge fair: answers and guesses come from this curated set of
// The secret answer is always a real Spanish word. Guesses remain open-ended
// so the player can test any five-letter combination.
const WORD_BANK = [
  "AMIGO", "ARBOL", "ARENA", "BAILE", "BARCO", "BRISA", "CAMPO", "CARTA", "CIELO",
  "CLAVE", "COLOR", "CORAL", "DULCE", "FUEGO", "GATOS", "IDEAL", "JUEGO", "LIBRO", "LUCES",
  "MAGIA", "MARCO", "MUNDO", "NIEVE", "NOCHE", "NORTE", "NUBES", "PALMA", "PIANO", "PLATA",
  "QUESO", "RADIO", "RITMO", "SABOR", "SALON", "SENAL", "SUEÑO", "TARDE", "TORRE", "VALOR",
  "VERDE", "VIAJE", "VISTA", "VOCAL", "ZORRO",
];
const SPANISH_KEYBOARD = ["QWERTYUIOP", "ASDFGHJKLÑ", "ZXCVBNM"];

type LetterState = "correct" | "present" | "absent";

function chooseWord(excluding?: string) {
  const options = excluding ? WORD_BANK.filter((word) => word !== excluding) : WORD_BANK;
  return options[randomBetween(0, options.length - 1)];
}

function getKeyStates(guesses: string[], answer: string) {
  const priority: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 };
  return guesses.reduce<Record<string, LetterState>>((result, guess) => {
    evaluateGuess(guess, answer).forEach((letterState, index) => {
      const letter = guess[index];
      if (!result[letter] || priority[letterState] > priority[result[letter]]) result[letter] = letterState;
    });
    return result;
  }, {});
}

function evaluateGuess(guess: string, answer: string): LetterState[] {
  const states: LetterState[] = Array<LetterState>(WORD_LENGTH).fill("absent");
  const remaining = answer.split("");

  guess.split("").forEach((letter, index) => {
    if (letter === answer[index]) {
      states[index] = "correct";
      remaining[index] = "";
    }
  });
  guess.split("").forEach((letter, index) => {
    if (states[index] === "correct") return;
    const availableAt = remaining.indexOf(letter);
    if (availableAt >= 0) {
      states[index] = "present";
      remaining[availableAt] = "";
    }
  });
  return states;
}

function WordGuessGame({ onComplete }: { onComplete: () => void }) {
  const [answer, setAnswer] = useState(() => chooseWord());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [state, setState] = useState<"playing" | "won" | "lost">("playing");
  const [feedback, setFeedback] = useState("Descubre la combinación de cinco letras. Tienes seis intentos.");
  const keyboardRef = useRef<HTMLButtonElement | null>(null);
  const completionTimerRef = useRef<number | null>(null);

  const restart = useCallback(() => {
    if (completionTimerRef.current !== null) window.clearTimeout(completionTimerRef.current);
    setAnswer((current) => chooseWord(current));
    setGuesses([]);
    setDraft("");
    setState("playing");
    setFeedback("Nueva combinación lista. Tienes seis intentos.");
    window.setTimeout(() => keyboardRef.current?.focus(), 0);
  }, []);

  const enterLetter = useCallback((rawLetter: string) => {
    if (state !== "playing" || draft.length >= WORD_LENGTH) return;
    const upperLetter = rawLetter.toUpperCase();
    // Preserve Ñ while stripping accents from vowels (NFD decomposes Ñ too).
    const letter = upperLetter === "Ñ" ? "Ñ" : upperLetter.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (!/^[A-ZÑ]$/.test(letter)) return;
    // Gray letters are spent: only letters confirmed as present/correct (or
    // letters not tried yet) can be entered again.
    if (getKeyStates(guesses, answer)[letter] === "absent") {
      setFeedback(`La letra ${letter} ya fue descartada.`);
      return;
    }
    setDraft((current) => current.length < WORD_LENGTH ? `${current}${letter}` : current);
  }, [answer, draft.length, guesses, state]);

  const removeLetter = useCallback(() => {
    if (state === "playing") setDraft((current) => current.slice(0, -1));
  }, [state]);

  const submitGuess = useCallback(() => {
    if (state !== "playing") return;
    if (draft.length !== WORD_LENGTH) {
      setFeedback("La palabra necesita cinco letras.");
      return;
    }
    const nextGuesses = [...guesses, draft];
    setGuesses(nextGuesses);
    setDraft("");
    if (draft === answer) {
      setState("won");
      setFeedback(`¡Correcto! ${answer} era la palabra secreta.`);
      completionTimerRef.current = window.setTimeout(onComplete, 520);
      return;
    }
    if (nextGuesses.length === WORD_ATTEMPTS) {
      setState("lost");
      setFeedback(`Se terminaron los intentos. La combinación era ${answer}.`);
      return;
    }
    setFeedback(`Intento ${nextGuesses.length} de ${WORD_ATTEMPTS}. Sigue probando.`);
  }, [answer, draft, guesses, onComplete, state]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === "Enter") { event.preventDefault(); submitGuess(); return; }
      if (event.key === "Backspace") { event.preventDefault(); removeLetter(); return; }
      enterLetter(event.key);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enterLetter, removeLetter, submitGuess]);

  useEffect(() => () => {
    if (completionTimerRef.current !== null) window.clearTimeout(completionTimerRef.current);
  }, []);

  const keyStates = getKeyStates(guesses, answer);

  return (
    <div className={`${styles.gameBody} ${styles.wordGame}`}>
      <p className={styles.gameInstruction} id="word-game-instruction">
        Descubrí la combinación secreta de cinco letras. Puede ser cualquier combinación: no hace falta formar una palabra. Verde: letra y lugar correctos. Dorado: la letra está, pero va en otro lugar. Gris: no aparece y queda bloqueada para los siguientes intentos.
      </p>
      <div aria-describedby="word-game-instruction" aria-label="Tablero de seis intentos para adivinar una palabra de cinco letras" className={styles.wordGrid} role="grid">
        {Array.from({ length: WORD_ATTEMPTS }, (_, rowIndex) => {
          const word = guesses[rowIndex] ?? (rowIndex === guesses.length ? draft : "");
          const evaluation = guesses[rowIndex] ? evaluateGuess(guesses[rowIndex], answer) : [];
          return Array.from({ length: WORD_LENGTH }, (_, columnIndex) => (
            <div
              aria-label={`Intento ${rowIndex + 1}, letra ${columnIndex + 1}: ${word[columnIndex] ?? "vacía"}`}
              className={`${styles.wordTile} ${evaluation[columnIndex] ? styles[`word${evaluation[columnIndex][0].toUpperCase()}${evaluation[columnIndex].slice(1)}`] : ""}`}
              key={`${rowIndex}-${columnIndex}`}
              role="gridcell"
            >
              {word[columnIndex]}
            </div>
          ));
        })}
      </div>
      <p aria-live="polite" className={styles.gameInstruction} role="status">{feedback}</p>
      <div aria-label="Teclado en pantalla" className={styles.wordKeyboard}>
        {SPANISH_KEYBOARD.map((row, rowIndex) => (
          <div className={styles.wordKeyboardRow} key={row}>
            {rowIndex === 2 ? <button aria-label="Borrar letra" className={styles.wordKeyWide} disabled={state !== "playing"} onClick={removeLetter} type="button">⌫</button> : null}
            {row.split("").map((letter, index) => (
              <button
                aria-label={keyStates[letter] === "absent" ? `Letra ${letter}, descartada` : `Letra ${letter}`}
                className={`${styles.wordKey} ${keyStates[letter] ? styles[`key${keyStates[letter][0].toUpperCase()}${keyStates[letter].slice(1)}`] : ""}`}
                disabled={state !== "playing" || keyStates[letter] === "absent"}
                key={letter}
                onClick={() => enterLetter(letter)}
                ref={rowIndex === 0 && index === 0 ? keyboardRef : undefined}
                type="button"
              >
                {letter}
              </button>
            ))}
            {rowIndex === 2 ? <button className={styles.wordKeyWide} disabled={state !== "playing"} onClick={submitGuess} type="button">Enter</button> : null}
          </div>
        ))}
      </div>
      {(state === "won" || state === "lost") ? <button className={styles.restartGame} onClick={restart} type="button">Nueva palabra</button> : null}
    </div>
  );
}

type ArithmeticRound = { tokens: string[]; result: number };

const randomBetween = (minimum: number, maximum: number) =>
  Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const replacement = randomBetween(0, index);
    [next[index], next[replacement]] = [next[replacement], next[index]];
  }
  return next;
}

function createArithmeticRound(): ArithmeticRound {
  const operators = shuffle(["+", "-", "×", "÷", "+", "×"]);
  let result = randomBetween(14, 32);
  const tokens = [String(result)];

  operators.forEach((operator) => {
    let operand = 2;
    if (operator === "+") {
      operand = randomBetween(3, 18);
      result += operand;
    } else if (operator === "-") {
      operand = randomBetween(1, Math.max(1, Math.min(result, 16)));
      result -= operand;
    } else if (operator === "×") {
      operand = result > 32 ? 2 : randomBetween(2, 3);
      result *= operand;
    } else if (result === 0) {
      operand = randomBetween(2, 9);
    } else {
      const smallDivisors = Array.from({ length: Math.min(result, 12) - 1 }, (_, index) => index + 2)
        .filter((divisor) => result % divisor === 0);
      operand = smallDivisors.length
        ? smallDivisors[randomBetween(0, smallDivisors.length - 1)]
        : result;
      result /= operand;
    }
    // Show each intermediate result before the next operation.
    tokens.push(operator, String(operand));
  });

  return { tokens, result };
}

function ArithmeticFlashGame({ onComplete }: { onComplete: () => void }) {
  const [round, setRound] = useState<ArithmeticRound>(() => createArithmeticRound());
  const [phase, setPhase] = useState<"intro" | "countdown" | "flashing" | "answer">("intro");
  const [countdown, setCountdown] = useState(3);
  const [tokenIndex, setTokenIndex] = useState(0);
  const [showToken, setShowToken] = useState(true);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("La secuencia empieza en breve.");
  const answerRef = useRef<HTMLInputElement | null>(null);
  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const startGame = useCallback(() => {
    setRound(createArithmeticRound());
    setPhase("countdown");
    setCountdown(3);
    setTokenIndex(0);
    setShowToken(true);
    setAnswer("");
    setFeedback("Prepárate: la cuenta empieza en breve.");
  }, []);

  const restart = useCallback(() => {
    setRound(createArithmeticRound());
    setPhase("intro");
    setCountdown(3);
    setTokenIndex(0);
    setShowToken(true);
    setAnswer("");
    setFeedback("Cuando estés listo, empezá la cuenta.");
  }, []);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown === 0) {
      setPhase(reducedMotion ? "answer" : "flashing");
      setFeedback(reducedMotion ? "La cuenta está completa. Resolvela de izquierda a derecha." : "Calculá cada paso y conservá el resultado para la siguiente operación.");
      return;
    }
    const timeout = window.setTimeout(() => setCountdown((current) => current - 1), 900);
    return () => window.clearTimeout(timeout);
  }, [countdown, phase, reducedMotion]);

  useEffect(() => {
    if (phase !== "flashing") return;
    const timeout = window.setTimeout(() => {
      if (showToken) {
        setShowToken(false);
        return;
      }
      if (tokenIndex === round.tokens.length - 1) {
        setPhase("answer");
        setFeedback("¿Cuál fue el resultado final?");
        window.setTimeout(() => answerRef.current?.focus(), 0);
        return;
      }
      setTokenIndex((current) => current + 1);
      setShowToken(true);
    }, showToken ? 640 : 120);
    return () => window.clearTimeout(timeout);
  }, [phase, round.tokens.length, showToken, tokenIndex]);

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (Number(answer) === round.result && answer.trim() !== "") {
      setFeedback("Resultado correcto. Descifraste la cuenta.");
      window.setTimeout(onComplete, 420);
      return;
    }
    restart();
    setFeedback("Ese resultado no cierra. Mira una nueva cuenta y vuelve a intentar.");
  }

  const currentToken = phase === "countdown" ? String(countdown) : phase === "flashing" && showToken ? round.tokens[tokenIndex] : "";
  const liveDescription = phase === "answer" ? `Cuenta completa: ${round.tokens.join(" ")}` : "Cuenta relámpago en curso";

  return (
    <div className={`${styles.gameBody} ${styles.arithmeticGame}`}>
      <p className={styles.gameInstruction}>
        Primero aparece un número, después un signo y luego otro número. Haz esa operación internamente; después llegará otro signo y otro número para seguir calculando. Repite la secuencia hasta obtener el resultado final.
      </p>
      {phase === "intro" ? (
        <div className={styles.arithmeticIntro}>
          <span className={styles.arithmeticLabel}>cómo se juega</span>
          <p>Los números y signos aparecen uno por uno. Resuelve cada paso de izquierda a derecha y guarda cada resultado internamente hasta llegar al final.</p>
          <button className={styles.primaryButton} onClick={startGame} type="button">▶ Empezar cuenta</button>
        </div>
      ) : <div aria-label={liveDescription} className={`${styles.arithmeticDisplay} ${phase === "countdown" ? styles.isCountdown : ""} ${phase === "flashing" && showToken ? styles.isFlashing : ""}`}>
        <span className={styles.arithmeticLabel}>{phase === "countdown" ? "iniciando transmisión" : phase === "answer" ? "transmisión cerrada" : "señal activa"}</span>
        <strong aria-hidden="true">{currentToken}</strong>
        <span className={styles.arithmeticProgress}>{phase === "flashing" ? `${tokenIndex + 1}/${round.tokens.length}` : phase === "answer" ? "resultado" : "3 · 2 · 1"}</span>
      </div>}
      {phase === "answer" && reducedMotion ? <p className={styles.expressionFallback}>{round.tokens.join(" ")}</p> : null}
      <p className={styles.gameInstruction} role="status">{feedback}</p>
      <form className={styles.answerForm} onSubmit={submitAnswer}>
        <label htmlFor="arithmetic-answer">Resultado final</label>
        <div>
          <input disabled={phase !== "answer"} id="arithmetic-answer" inputMode="numeric" onChange={(event) => setAnswer(event.target.value)} pattern="-?[0-9]*" ref={answerRef} type="text" value={answer} />
          <button className={styles.primaryButton} disabled={phase !== "answer"} type="submit">Comprobar</button>
        </div>
      </form>
      <button className={styles.restartGame} onClick={restart} type="button">Nueva cuenta</button>
    </div>
  );
}



