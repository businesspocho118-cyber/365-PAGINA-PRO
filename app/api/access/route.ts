import { NextResponse } from "next/server";
import { isAcceptedAccessCode, isFirstPhaseAccessCode } from "@/lib/answer-vault";

export const runtime = "edge";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { code?: string } | null;
  const code = body?.code ?? "";

  if (!code.trim()) {
    return NextResponse.json(
      { ok: false, message: "Escribe la llave privada que viene con el regalo." },
      { status: 400 },
    );
  }

  if (isFirstPhaseAccessCode(code)) {
    return NextResponse.json({ ok: true, rewardRoute: "/fase-1-resuelta" });
  }

  if (!isAcceptedAccessCode(code)) {
    return NextResponse.json(
      { ok: false, message: "Esa llave todavía no abre este archivo." },
      { status: 401 },
    );
  }

  return NextResponse.json({ ok: true });
}
