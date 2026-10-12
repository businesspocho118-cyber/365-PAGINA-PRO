export type EasterEggVideo = {
  title: string;
  src: string;
};

export type EasterEggData = {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  videos: EasterEggVideo[];
};

export const EASTER_EGGS: Record<string, EasterEggData> = {
  termo: {
    id: "termo",
    code: "!termo",
    title: "Easter Egg: Termo",
    subtitle: "El compañero fiel de cada día",
    description: "¡Descubriste el secreto del termo! Un video exclusivo y especial guardado para este momento.",
    badge: "🧉 SECRETO DEL TERMO",
    videos: [
      {
        title: "Video Termo",
        src: "/365-assets/easter-eggs/termo.mp4",
      },
    ],
  },
  topstore: {
    id: "topstore",
    code: "!topstore",
    title: "Easter Egg: Topstore",
    subtitle: "Momentos y risas exclusivas",
    description: "¡Acceso concedido a la colección de Topstore! Descubriste 3 videos especiales guardados como tesoro.",
    badge: "🛍️ SECRETO TOPSTORE",
    videos: [
      {
        title: "Momento 1",
        src: "/365-assets/easter-eggs/topstore-1.mp4",
      },
      {
        title: "Momento 2",
        src: "/365-assets/easter-eggs/topstore-2.mp4",
      },
      {
        title: "Momento 3",
        src: "/365-assets/easter-eggs/topstore-3.mp4",
      },
    ],
  },
  reflexion: {
    id: "reflexion",
    code: "!reflexión",
    title: "Easter Egg: Reflexión",
    subtitle: "Un mensaje desde lo profundo del corazón",
    description: "¡Encontraste la reflexión secreta! Palabras para guardar y escuchar con el corazón abierto.",
    badge: "✨ REFLEXIÓN ESPECIAL",
    videos: [
      {
        title: "Video Reflexión",
        src: "/365-assets/easter-eggs/reflexion.mp4",
      },
    ],
  },
};

export function matchEasterEgg(input: string): EasterEggData | null {
  const raw = input.trim();
  // Must start with ¡ or !
  if (!raw.startsWith("¡") && !raw.startsWith("!")) {
    return null;
  }

  // Remove leading ¡ or ! and normalize
  const clean = raw
    .slice(1)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // removes accents (ó -> o)

  if (clean === "termo") {
    return EASTER_EGGS.termo;
  }
  if (clean === "topstore") {
    return EASTER_EGGS.topstore;
  }
  if (clean === "reflexion") {
    return EASTER_EGGS.reflexion;
  }

  return null;
}
