import { NextResponse } from "next/server";

export type CapsulePayload = {
  id: "johan" | "luisa" | "pareja" | "test";
  title: string;
  recipientEmail: string;
  targetDate: string;
  message: string;
};

export const runtime = "edge";

// Respaldo en memoria del proceso (útil para pruebas locales antes de configurar Google Apps Script)
let memorySealed = false;

export async function GET() {
  const scriptUrl = process.env.GOOGLE_CAPSULES_SCRIPT_URL;

  // 1. Si no hay script configurado, retornamos el estado de memoria local
  if (!scriptUrl) {
    return NextResponse.json({
      ok: true,
      sealed: memorySealed,
      configured: false,
      note: "Modo local: no hay GOOGLE_CAPSULES_SCRIPT_URL definida en .env.local",
    });
  }

  try {
    const res = await fetch(scriptUrl, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({
        ok: true,
        sealed: memorySealed,
        error: "Script returned status " + res.status,
      });
    }

    const data = await res.json().catch(() => null);
    const remoteSealed = Boolean(data?.sealed);
    if (remoteSealed) {
      memorySealed = true;
    }

    return NextResponse.json({
      ok: true,
      sealed: remoteSealed,
      totalCapsules: data?.totalCapsules ?? 0,
      configured: true,
    });
  } catch (error) {
    return NextResponse.json({ ok: true, sealed: memorySealed, error: String(error) });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    // Caso A: Prueba de envío de correo inmediato
    if (body?.action === "test_email") {
      const email = body.email;
      if (!email || !email.includes("@")) {
        return NextResponse.json(
          { ok: false, message: "Por favor indicá un correo válido para la prueba." },
          { status: 400 },
        );
      }

      const scriptUrl = process.env.GOOGLE_CAPSULES_SCRIPT_URL;
      if (!scriptUrl) {
        return NextResponse.json({
          ok: true,
          mock: true,
          message: "Prueba simulada con éxito. (Para recibir el correo real en tu bandeja, configurá GOOGLE_CAPSULES_SCRIPT_URL en .env.local).",
        });
      }

      const testRes = await fetch(scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_email", email }),
      });

      const testJson = await testRes.json().catch(() => ({ ok: true }));
      return NextResponse.json(testJson);
    }

    // Caso B: Sellado de las cápsulas
    const capsules = body?.capsules as CapsulePayload[] | undefined;

    if (!capsules || !Array.isArray(capsules) || capsules.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Faltan las cápsulas del tiempo en la petición." },
        { status: 400 },
      );
    }

    const now = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 5);
    maxDate.setDate(maxDate.getDate() + 1);

    for (const cap of capsules) {
      if (!cap.recipientEmail || !cap.recipientEmail.includes("@")) {
        return NextResponse.json(
          { ok: false, message: `El correo de la cápsula "${cap.title || cap.id}" no es válido.` },
          { status: 400 },
        );
      }

      if (!cap.message || cap.message.trim().length < 1) {
        return NextResponse.json(
          { ok: false, message: `El mensaje de la cápsula "${cap.title || cap.id}" está vacío.` },
          { status: 400 },
        );
      }

      const capDate = new Date(cap.targetDate);
      if (isNaN(capDate.getTime())) {
        return NextResponse.json(
          { ok: false, message: `La fecha de la cápsula "${cap.title || cap.id}" no es válida.` },
          { status: 400 },
        );
      }

      if (capDate <= now && cap.id !== "test") {
        return NextResponse.json(
          { ok: false, message: `La fecha de la cápsula "${cap.title || cap.id}" debe ser en el futuro.` },
          { status: 400 },
        );
      }

      if (capDate > maxDate) {
        return NextResponse.json(
          { ok: false, message: `La fecha máxima permitida para las cápsulas es de 5 años hacia el futuro.` },
          { status: 400 },
        );
      }
    }

    // Marcamos en memoria que ya fue sellado
    memorySealed = true;

    const scriptUrl = process.env.GOOGLE_CAPSULES_SCRIPT_URL;

    if (!scriptUrl) {
      return NextResponse.json({
        ok: true,
        mock: true,
        message: "Cápsulas selladas correctamente en modo local. (Configurá GOOGLE_CAPSULES_SCRIPT_URL para guardarlas en Google Sheets).",
      });
    }

    const googleResponse = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ capsules }),
    });

    if (!googleResponse.ok) {
      throw new Error(`Google Apps Script respondió con status: ${googleResponse.status}`);
    }

    const result = await googleResponse.json().catch(() => ({ ok: true }));

    return NextResponse.json({
      ok: true,
      message: "Las cápsulas fueron selladas y guardadas exitosamente en Google Drive.",
      data: result,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, message: "Error conectando con el servicio de cápsulas: " + errorMsg },
      { status: 500 },
    );
  }
}
