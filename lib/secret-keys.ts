export type NormalSecretAnimation =
  | "steam"
  | "storefront"
  | "archive"
  | "scan"
  | "cipher"
  | "reading"
  | "cosmic"
  | "date";

export type NormalSecretKey = {
  key: `!${string}`;
  title: string;
  message: string;
  animation: NormalSecretAnimation;
};

export type SecretGameId = "felicitaciones" | "indispensable" | "confio" | "8024";

export type ImportantSecretKey = {
  id: SecretGameId;
  key: `!${string}`;
  title: string;
  theme: string;
  clueLabel: string;
  clueValue: string;
};

// Edit the copy here without touching validation or game logic.
export const normalSecretKeys: Record<string, NormalSecretKey> = {
  "!termo": {
    key: "!termo",
    title: "Temperatura compartida",
    message: "Hay conversaciones que empiezan mucho antes del primer sorbo.",
    animation: "steam",
  },
  "!topstore": {
    key: "!topstore",
    title: "Vitrina encendida",
    message: "La tienda reconoció tu señal. Algo especial quedó reservado detrás del mostrador.",
    animation: "storefront",
  },
  "!sarco": {
    key: "!sarco",
    title: "Archivo antiguo",
    message: "El sarcófago se abrió apenas lo suficiente para confirmar que todavía guarda memoria.",
    animation: "archive",
  },
  "!prueba": {
    key: "!prueba",
    title: "Canal de prueba",
    message: "La señal llegó completa. Incluso los secretos necesitan una primera comprobación.",
    animation: "scan",
  },
  "!codigos": {
    key: "!codigos",
    title: "Sintaxis oculta",
    message: "Los códigos no siempre protegen información; a veces protegen el momento correcto.",
    animation: "cipher",
  },
  "!leyendo": {
    key: "!leyendo",
    title: "Lectura activa",
    message: "Quien está leyendo de verdad descubre puertas donde otros solo ven texto.",
    animation: "reading",
  },
  "!marvel": {
    key: "!marvel",
    title: "Universo alterno",
    message: "Una grieta violeta acaba de conectar este archivo con otra línea temporal.",
    animation: "cosmic",
  },
  "!081119": {
    key: "!081119",
    title: "Fecha preservada",
    message: "Algunas fechas no pasan: se quedan orbitando hasta que alguien vuelve a nombrarlas.",
    animation: "date",
  },
};

export const importantSecretKeys: ImportantSecretKey[] = [
  {
    id: "felicitaciones",
    key: "!felicitaciones",
    title: "Felicitaciones",
    theme: "Atrapa 10 estrellas en menos de 15 segundos.",
    clueLabel: "Inicio de la palabra",
    clueValue: "MA",
  },
  {
    id: "indispensable",
    key: "!indispensable",
    title: "Indispensable",
    theme: "Une los números y llega exactamente a 1012.",
    clueLabel: "Cantidad total de letras",
    clueValue: "10",
  },
  {
    id: "confio",
    key: "!confio",
    title: "Confío",
    theme: "Adivina la palabra: verde es exacto, dorado está cerca.",
    clueLabel: "Terminación de la palabra",
    clueValue: "AR",
  },
  {
    id: "8024",
    key: "!8024",
    title: "Cálculo 8024",
    theme: "Sigue la cuenta relámpago y encuentra el resultado final.",
    clueLabel: "Qué significa",
    clueValue: "cuando quieres que algo pase y piensas siempre en eso hasta que sucede",
  },
];

export const importantSecretKeysByValue = Object.fromEntries(
  importantSecretKeys.map((secret) => [secret.key, secret]),
) as Record<string, ImportantSecretKey>;

export const finalSecret = {
  key: "!manifestar" as const,
  title: "MANIFESTAR",
  message: "Cuando quieres que algo pase y piensas siempre en eso hasta que sucede.",
};

export function normalizeSecretEntry(value: string) {
  return value.trim().toLocaleLowerCase("es");
}
