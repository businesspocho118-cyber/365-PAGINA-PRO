/**
 * CÁPSULAS DEL TIEMPO 365 — GOOGLE APPS SCRIPT
 * 
 * INSTRUCCIONES DE INSTALACIÓN:
 * 1. Abrí Google Drive con tu cuenta de Google (la que no vas a cambiar la contraseña).
 * 2. Creá una nueva "Hoja de cálculo de Google" (Google Sheet) y llamala "365 Cápsulas del Tiempo".
 * 3. En el menú superior de la hoja, andá a: Extensiones -> Apps Script.
 * 4. Borrá cualquier código que haya en el editor y pegá TODO este código.
 * 5. Guardá con el icono de disquete (Ctrl + S).
 * 6. Hacé clic en "Implementar" (arriba a la derecha) -> "Nueva implementación".
 *    - Tipo: Aplicación web.
 *    - Descripción: "API Cápsulas 365"
 *    - Ejecutar como: "Yo" (tu cuenta).
 *    - Quién tiene acceso: "Cualquier usuario" (Anyone).
 * 7. Hacé clic en "Implementar", autorizá los permisos con tu cuenta de Google.
 * 8. Copiá la "URL de la aplicación web" (termina en /exec) y pegala en tu archivo .env.local:
 *    GOOGLE_CAPSULES_SCRIPT_URL="https://script.google.com/macros/s/.../exec"
 * 
 * CONFIGURACIÓN DEL DISPARADOR DIARIO (CRON):
 * 1. En el menú izquierdo de Apps Script, hacé clic en el ícono del reloj ("Activadores" / Triggers).
 * 2. Clic en el botón azul "Añadir activador" (abajo a la derecha).
 * 3. Seleccioná:
 *    - Función a ejecutar: "revisarYEnviarCapsulas"
 *    - Fuentes del evento: "Según tiempo" (Time-driven)
 *    - Tipo de activador: "Temporizador por días" (Day timer)
 *    - Hora del día: "De 8:00 a 9:00" (o la hora que prefieras)
 * 4. Guardar. ¡Listo! Google revisará todos los días de forma automática por los próximos 5 años.
 */

const SHEET_NAME = "Capsulas";

function obtenerOCrearHoja() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "ID",
      "Título",
      "Correo Destino",
      "Fecha Programada",
      "Mensaje",
      "Estado",
      "Fecha Creación",
      "Fecha Despacho"
    ]);
    sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#200c32").setFontColor("#ffd6a5");
  }
  return sheet;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Acción especial: prueba de envío inmediato
    if (data.action === "test_email") {
      const emailTest = data.email;
      if (!emailTest) {
        return ContentService.createTextOutput(JSON.stringify({ ok: false, message: "Falta el correo de prueba" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      const enviado = enviarCorreoCapsula(
        "Cápsula de Prueba (Test Instantáneo)",
        emailTest,
        "¡Hola! Esta es una prueba instantánea para confirmar que tu sistema de Cápsulas del Tiempo 365 está conectado con éxito y puede enviar correos a través de Gmail sin problemas.",
        new Date().toISOString()
      );
      return ContentService.createTextOutput(JSON.stringify({ 
        ok: enviado, 
        message: enviado ? "Correo de prueba enviado correctamente a " + emailTest : "No se pudo enviar el correo de prueba" 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const capsules = data.capsules || [];
    
    if (!capsules.length) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, message: "No se recibieron cápsulas" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = obtenerOCrearHoja();
    const nowStr = new Date().toISOString();

    capsules.forEach(function(cap) {
      sheet.appendRow([
        cap.id || "",
        cap.title || "",
        cap.recipientEmail || "",
        cap.targetDate || "",
        cap.message || "",
        "PENDIENTE",
        nowStr,
        ""
      ]);
    });

    return ContentService.createTextOutput(JSON.stringify({ 
      ok: true, 
      message: "Cápsulas guardadas con éxito en Google Drive." 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      ok: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = obtenerOCrearHoja();
    const rows = sheet.getDataRange().getValues();
    const hasCapsules = rows.length > 1; // Más de la fila de cabecera

    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      sealed: hasCapsules,
      totalCapsules: Math.max(0, rows.length - 1)
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function revisarYEnviarCapsulas() {
  const sheet = obtenerOCrearHoja();
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return;

  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);

  for (let i = 1; i < rows.length; i++) {
    const id = rows[i][0];
    const titulo = rows[i][1];
    const email = rows[i][2];
    const fechaProgramadaRaw = rows[i][3];
    const mensaje = rows[i][4];
    const estado = rows[i][5];

    if (estado === "PENDIENTE" && email && fechaProgramadaRaw) {
      const fechaObj = new Date(fechaProgramadaRaw);
      
      if (!isNaN(fechaObj.getTime()) && fechaObj <= hoy) {
        // Enviar correo
        const enviado = enviarCorreoCapsula(titulo, email, mensaje, fechaProgramadaRaw);
        if (enviado) {
          sheet.getRange(i + 1, 6).setValue("ENVIADO");
          sheet.getRange(i + 1, 8).setValue(new Date().toISOString());
        }
      }
    }
  }
}

function enviarCorreoCapsula(titulo, emailDestino, mensaje, fechaOriginal) {
  try {
    const asunto = `✨ Tu Cápsula del Tiempo 365 ha llegado: ${titulo} ✨`;
    
    const htmlBody = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0214; color: #f5efff; padding: 40px 20px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255, 214, 165, 0.4); box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #ffd6a5; font-size: 26px; margin: 0; letter-spacing: 2px;">CÁPSULA DEL TIEMPO 365</h1>
          <p style="color: #c4b5fd; font-size: 14px; margin-top: 8px;">Un mensaje que viajó a través de los años para encontrarte hoy.</p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 214, 165, 0.2); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0; border-bottom: 1px solid rgba(255, 214, 165, 0.2); padding-bottom: 10px;">${titulo}</h2>
          <div style="font-size: 16px; line-height: 1.8; color: #e9d5ff; white-space: pre-wrap;">
${mensaje}
          </div>
        </div>
        
        <div style="text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 16px;">
          <p style="margin: 0;">Sellado en el universo de <strong>365 The Beginning</strong>.</p>
          <p style="margin: 4px 0 0 0;">Programado originalmente para abrirse en esta fecha.</p>
        </div>
      </div>
    `;

    MailApp.sendEmail({
      to: emailDestino,
      subject: asunto,
      htmlBody: htmlBody
    });
    
    return true;
  } catch (err) {
    Logger.log("Error enviando email a " + emailDestino + ": " + err.toString());
    return false;
  }
}
