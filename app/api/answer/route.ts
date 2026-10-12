import { NextResponse } from "next/server";
import { isAcceptedPhaseAnswer, hasRequiredPrefix } from "@/lib/answer-vault";
import { matchEasterEgg } from "@/lib/easter-eggs";
import { phases } from "@/lib/phases";

export const runtime = "edge";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { phaseId?: string; answer?: string }
    | null;
  const phaseId = body?.phaseId ?? "";
  const answer = body?.answer ?? "";
  const phase = phases.find((item) => item.id === phaseId);

  if (!phase) {
    return NextResponse.json(
      { correct: false, message: "Esta fase no existe." },
      { status: 404 },
    );
  }

  if (!answer.trim()) {
    return NextResponse.json(
      { correct: false, message: "Escribe una respuesta antes de probar la cerradura." },
      { status: 400 },
    );
  }

  // 1. Mandatory prefix check: every password or easter egg MUST start with !
  if (!hasRequiredPrefix(answer)) {
    return NextResponse.json({
      correct: false,
      requiresPrefix: true,
      message: "⚠️ Recuerda que toda contraseña o easter egg debe iniciar siempre con el signo ! al principio para que funcione.",
    });
  }

  // 2. Easter Egg check
  const easterEgg = matchEasterEgg(answer);
  if (easterEgg) {
    return NextResponse.json({
      correct: false,
      isEasterEgg: true,
      easterEgg,
      message: `🎉 ¡Easter Egg encontrado! Desbloqueaste "${easterEgg.title}".`,
    });
  }

  // 3. Regular phase answer check
  const correct = isAcceptedPhaseAnswer(phaseId, answer);

  return NextResponse.json({
    correct,
    phaseId,
    unlockNext: correct,
    message: correct
      ? "¡Desbloqueado! La fase ha sido aprobada correctamente."
      : "Clave incorrecta. Lee la pista e intenta de nuevo (recuerda iniciar con !).",
  });
}
