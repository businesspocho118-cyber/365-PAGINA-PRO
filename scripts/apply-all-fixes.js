import fs from "fs";

console.log("Iniciando aplicación de correcciones...");

// 1. APP/GLOBALS.CSS
let globalsCss = fs.readFileSync("app/globals.css", "utf8");

const medalStyles = `
/* Recompensas de Medalla */
.reward-artifacts-shell {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 14px;
  max-width: 540px;
}

.reward-medal-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border-radius: 18px;
  transition: all 0.3s ease;
}

.reward-medal-item.is-unlocked {
  background: linear-gradient(135deg, rgba(38, 14, 60, 0.7), rgba(16, 4, 26, 0.9));
  border: 1px solid rgba(255, 214, 165, 0.4);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45), 0 0 20px rgba(255, 214, 165, 0.15);
}

.reward-medal-item.is-silhouette {
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  opacity: 0.55;
}

.reward-medal-thumb-wrap {
  width: 62px;
  height: 62px;
  flex-shrink: 0;
  border-radius: 14px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 214, 165, 0.2);
}

.reward-medal-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reward-medal-silhouette {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0) invert(1) opacity(0.22);
}

.reward-medal-fallback {
  font-family: var(--mono);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--dim);
}

.reward-medal-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reward-medal-tag {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #ffd6a5;
}

.reward-medal-item.is-silhouette .reward-medal-tag {
  color: #fca5a5;
}

.reward-medal-info h4 {
  margin: 0;
  font-family: var(--serif);
  font-size: 1.05rem;
  color: #fff;
}

.reward-medal-info p {
  margin: 0;
  font-size: 0.8rem;
  color: #c4b5fd;
  line-height: 1.4;
}
`;

if (!globalsCss.includes("reward-artifacts-shell")) {
  globalsCss += medalStyles;
  fs.writeFileSync("app/globals.css", globalsCss, "utf8");
  console.log("✓ globals.css actualizado con estilos de medallas.");
}

// 2. COMPONENTS/SECRETEXPERIENCE.TSX
let exp = fs.readFileSync("components/SecretExperience.tsx", "utf8");

// Subtítulo debajo de 365
if (!exp.includes('<p className="hero-copy">')) {
  exp = exp.replace(
    '</h1>\r\n              <div className="hero-couple-showcase">',
    '</h1>\r\n              <p className="hero-copy">Un libro, una historia, un año juntos. Cada página guarda un recuerdo y cada fase una llave secreta.</p>\r\n              <div className="hero-couple-showcase">'
  );
  exp = exp.replace(
    '</h1>\n              <div className="hero-couple-showcase">',
    '</h1>\n              <p className="hero-copy">Un libro, una historia, un año juntos. Cada página guarda un recuerdo y cada fase una llave secreta.</p>\n              <div className="hero-couple-showcase">'
  );
}

// Medalla en las recompensas resueltas
const oldRewardAudioBlock = `{phase.audioSrc ? (
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
                              <span>⚠️ Audio y medalla anulados (usaste el canjeable antes de resolver la fase)</span>
                            </div>
                          )
                        ) : null}`;

const newRewardArtifactsBlock = `<div className="reward-artifacts-shell">
                          {/* Recompensa de Medalla */}
                          <div className={\`reward-medal-item \${isCanjeableUsed ? "is-silhouette" : "is-unlocked"}\`}>
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
                        </div>`;

if (exp.includes("reward-audio-box") && !exp.includes("reward-artifacts-shell")) {
  // Reemplazar el bloque de audio por el bloque completo de artefactos (medalla + audio)
  exp = exp.replace(oldRewardAudioBlock, newRewardArtifactsBlock);
}

// Neutralizar español en SecretExperience.tsx
const replacementsExp = [
  ["Escribí la llave privada", "Escribe la llave privada"],
  ["Escribí una clave", "Escribe una clave"],
  ["Recordá que", "Recuerda que"],
  ["Recordá", "Recuerda"],
  ["Podés escribir", "Puedes escribir"],
  ["podés", "puedes"],
  ["querés", "quieres"],
  ["pensás", "piensas"],
  ["¡Escribí aquí", "¡Escribe aquí"],
  ["Si lo usás, no recibirás", "Si lo usas, no recibirás"],
  ["Mirá el recorrido", "Mira el recorrido"],
  ["si necesitás volver", "si necesitas volver"],
  ["abrí el manual", "abre el manual"],
  ["Si usás este canjeable", "Si usas este canjeable"]
];

for (const [arg, neu] of replacementsExp) {
  exp = exp.split(arg).join(neu);
}

fs.writeFileSync("components/SecretExperience.tsx", exp, "utf8");
console.log("✓ SecretExperience.tsx actualizado.");

// 3. COMPONENTS/CAPSULEMODAL.TSX
let capModal = fs.readFileSync("components/CapsuleModal.tsx", "utf8");
capModal = capModal.split("Por favor ingresá").join("Por favor ingresa");
capModal = capModal.split("Por favor seleccioná").join("Por favor selecciona");
capModal = capModal.split("Escribí un mensaje").join("Escribe un mensaje");
capModal = capModal.split("Asegurate de usar").join("Asegúrate de usar");
fs.writeFileSync("components/CapsuleModal.tsx", capModal, "utf8");
console.log("✓ CapsuleModal.tsx actualizado a español neutro.");

// 4. COMPONENTS/TIMECAPSULESLOADER.TSX
let timeLoader = fs.readFileSync("components/TimeCapsulesLoader.tsx", "utf8");
timeLoader = timeLoader.split("Escribí aquí lo que querés").join("Escribe aquí lo que quieres");
timeLoader = timeLoader.split("Escribí una promesa").join("Escribe una promesa");
timeLoader = timeLoader.split("Escribí aquí un mensaje").join("Escribe aquí un mensaje");
timeLoader = timeLoader.split("Prepará las 3 cápsulas").join("Prepara las 3 cápsulas");
timeLoader = timeLoader.split("Ingresá tu correo").join("Ingresa tu correo");
fs.writeFileSync("components/TimeCapsulesLoader.tsx", timeLoader, "utf8");
console.log("✓ TimeCapsulesLoader.tsx actualizado a español neutro.");

// 5. LIB/PHASES.TS
let phasesContent = fs.readFileSync("lib/phases.ts", "utf8");
const replacementsPhases = [
  ["Buscá la página", "Busca la página"],
  ["Pensá en el número", "Piensa en el número"],
  ["Tocá el 365", "Toca el 365"],
  ["Mirá con atención", "Mira con atención"],
  ["Escribí 365", "Escribe 365"],
  ["Buscá en la música", "Busca en la música"],
  ["Mirá la fase", "Mira la fase"],
  ["pensá en", "piensa en"],
  ["buscá", "busca"],
  ["mirá", "mira"]
];
for (const [arg, neu] of replacementsPhases) {
  phasesContent = phasesContent.split(arg).join(neu);
}
fs.writeFileSync("lib/phases.ts", phasesContent, "utf8");
console.log("✓ lib/phases.ts actualizado a español neutro.");

// 6. LIB/SECRET-KEYS.TS
let secretKeysContent = fs.readFileSync("lib/secret-keys.ts", "utf8");
secretKeysContent = secretKeysContent.split("cuando querés que algo pase y pensás").join("cuando quieres que algo pase y piensas");
secretKeysContent = secretKeysContent.split("Cuando querés que algo pase y pensás").join("Cuando quieres que algo pase y piensas");
fs.writeFileSync("lib/secret-keys.ts", secretKeysContent, "utf8");
console.log("✓ lib/secret-keys.ts actualizado a español neutro.");

// 7. COMPONENTS/SECRETGAMEMODAL.TSX
let gameModal = fs.readFileSync("components/SecretGameModal.tsx", "utf8");
const replacementsGame = [
  ["Hacé clic", "Haz clic"],
  ["Prepará el tablero", "Prepara el tablero"],
  ["cuando estés lista", "cuando estés lista"],
  ["Preparáte:", "Prepárate:"],
  ["Mirá una nueva cuenta y volvé a intentar", "Mira una nueva cuenta y vuelve a intentar"],
  ["Hacé esa operación", "Haz esa operación"],
  ["Repetí la secuencia", "Repite la secuencia"],
  ["Resolvé cada paso", "Resuelve cada paso"],
  ["guardá cada resultado", "guarda cada resultado"]
];
for (const [arg, neu] of replacementsGame) {
  gameModal = gameModal.split(arg).join(neu);
}
fs.writeFileSync("components/SecretGameModal.tsx", gameModal, "utf8");
console.log("✓ SecretGameModal.tsx actualizado a español neutro.");

console.log("¡Todas las correcciones fueron aplicadas con éxito!");
