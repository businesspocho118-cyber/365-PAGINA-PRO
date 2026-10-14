import "server-only";
import { normalizeAnswer } from "@/lib/normalize";

const acceptedAnswersByPhase = new Map<string, string[]>([
  ["day-050", ["CR7", "CR 7"]],
  ["day-095", ["34536"]],
  ["day-140", ["MILOJ", "MILO J", "MILO-J", "MILO_J"]],
  ["day-185", ["ZERAORA"]],
  ["day-230", ["Cumpleaños", "Cumpleanos"]],
  ["day-275", ["H2O", "H 2 O", "H20", "H 2 0"]],
  ["day-320", ["MANIFESTAR", "Manifestar"]],
  ["day-365", ["ANIVERSARIO", "Aniversario"]],
]);

export function hasRequiredPrefix(input: string): boolean {
  const trimmed = input.trim();
  return trimmed.startsWith("¡") || trimmed.startsWith("!");
}

export function isAcceptedPhaseAnswer(phaseId: string, answer: string) {
  // STRICT RULE: All passwords and easter eggs MUST start with ¡ (or !)
  if (!hasRequiredPrefix(answer)) {
    return false;
  }

  // Strip prefix for validation against canonical phase answers
  const rawWithoutPrefix = answer.trim().slice(1).trim();

  const normalizedAnswer = normalizeAnswer(rawWithoutPrefix);
  const compactAnswer = normalizedAnswer.replace(/\s+/g, "");
  const accepted = acceptedAnswersByPhase.get(phaseId) ?? [];

  return accepted.some((candidate) => {
    const normalizedCandidate = normalizeAnswer(candidate);
    const compactCandidate = normalizedCandidate.replace(/\s+/g, "");
    return normalizedCandidate === normalizedAnswer || compactCandidate === compactAnswer;
  });
}

export function isAcceptedAccessCode(code: string) {
  const configuredCode = process.env.SITE_ACCESS_CODE ?? "365";
  const cleanCode = code.trim().startsWith("¡") || code.trim().startsWith("!") ? code.trim().slice(1) : code;
  return normalizeAnswer(cleanCode) === normalizeAnswer(configuredCode);
}

export function isFirstPhaseAccessCode(code: string) {
  const cleanCode = code.trim().startsWith("¡") || code.trim().startsWith("!") ? code.trim().slice(1) : code;
  return normalizeAnswer(cleanCode) === normalizeAnswer("CR7");
}
