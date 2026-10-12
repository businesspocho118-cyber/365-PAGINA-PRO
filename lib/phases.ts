export type Phase = {
  id: string;
  title: string;
  dayReference: number;
  riddle: string;
  hints: string[];
  reward: {
    title: string;
    description: string;
  };
  recap: string;
  easterEggs: string[];
  medal: {
    title: string;
    message: string;
    imageSrc?: string;
  };
  audioSrc?: string;
  unsolvedDocSrc?: string;
  solutionDocSrc?: string;
  solutionVideoSrc?: string;
};

export const SECRET_KEY_UNLOCK_PHASE_ID = "day-275";

export const phases: Phase[] = [
  {
    id: "day-050",
    title: "Código & Fútbol",
    dayReference: 50,
    riddle:
      "Busca la página donde la pasión de la cancha y la tecnología se encuentran. Una clave legendaria que todo fanático del fútbol reconoce al instante.",
    hints: [
      "Piensa en el número 7 más grande de la historia.",
      "Tecnología, precisión y goles en un solo nombre.",
      "El Bicho.",
    ],
    reward: {
      title: "Cancha Digital",
      description:
        "La pasión del fútbol y el código abren la primera puerta secreta de la experiencia.",
    },
    recap:
      "El comienzo de la jugada perfecta. Precisión, disciplina y pasión en cada toque.",
    easterEggs: ["Toca el 365 tres veces después de resolver esta fase."],
    medal: {
      title: "Medalla de Código & Fútbol",
      message: "La primera señal de cancha y tecnología ya forma parte del archivo.",
      imageSrc: "/365-assets/medals/medal-1.png",
    },
    audioSrc: "/365-assets/audio/phase-1.m4a",
    unsolvedDocSrc: "/365-assets/phase-docs/fase-1-sin-solucion.pdf",
    solutionDocSrc: "/365-assets/phase-docs/fase-1-con-solucion.pdf",
  },
  {
    id: "day-095",
    title: "El Truco de Magia",
    dayReference: 95,
    riddle:
      "Nada por aquí, nada por allá. La siguiente llave se esconde detrás de un truco de magia que desafía la lógica y revela un número secreto.",
    hints: [
      "Mira con atención donde la ilusión se vuelve real.",
      "No es truco, es magia de cinco cifras.",
      "La secuencia numérica guarda el secreto.",
    ],
    reward: {
      title: "Cámara del Ilusionista",
      description:
        "Se abre un rincón misterioso donde la magia transforma lo invisible en realidad.",
    },
    recap:
      "La verdadera magia ocurre cuando prestas atención a lo que parece imposible.",
    easterEggs: ["Escribe 365 en cualquier parte de la página para despertar el archivo."],
    medal: {
      title: "Medalla de la Magia",
      message: "El truco ha sido revelado y su magia quedó guardada.",
      imageSrc: "/365-assets/medals/medal-2.png",
    },
    audioSrc: "/365-assets/audio/phase-2.m4a",
    unsolvedDocSrc: "/365-assets/phase-docs/fase-2-sin-solucion.pdf",
    solutionDocSrc: "/365-assets/phase-docs/fase-2-con-solucion.pdf",
  },
  {
    id: "day-140",
    title: "Frecuencia Musical",
    dayReference: 140,
    riddle:
      "Esta respuesta suena en el aire. Entre compases, letras y ritmos urbanos, encuentra al artista cuya voz acompaña los momentos favoritos.",
    hints: [
      "Busca en la música que suena de fondo.",
      "Un nombre referente de la nueva música argentina.",
      "Rimas, flow y un talento joven.",
    ],
    reward: {
      title: "Sintonía de Recuerdos",
      description:
        "Las canciones que marcaron este camino ahora resuenan en la bóveda sonora.",
    },
    recap:
      "La música no solo se escucha: revive instantes y guarda memorias imborrables.",
    easterEggs: ["Pasa despacio por el núcleo del libro; responde con movimiento."],
    medal: {
      title: "Medalla de la Música",
      message: "La melodía de este viaje quedó preservada para siempre.",
      imageSrc: "/365-assets/medals/medal-3.png",
    },
    audioSrc: "/365-assets/audio/phase-3.m4a",
    unsolvedDocSrc: "/365-assets/phase-docs/fase-3-sin-solucion.pdf",
    solutionDocSrc: "/365-assets/phase-docs/fase-3-con-solucion.pdf",
  },
  {
    id: "day-185",
    title: "Mundo Gamer",
    dayReference: 185,
    riddle:
      "Entrando al reino de los videojuegos y las batallas legendarias. Una criatura eléctrica y mítica que solo los verdaderos maestros conocen.",
    hints: [
      "Un Pokémon mítico de tipo eléctrico.",
      "Velocidad fulgurante y garras de trueno.",
      "Empieza con Z y domina la arena.",
    ],
    reward: {
      title: "Zona Gamer Desbloqueada",
      description:
        "Se desbloquea la sala arcade y las victorias compartidas en el mundo de los videojuegos.",
    },
    recap:
      "Cada nivel superado juntos es una victoria guardada en la partida de la vida.",
    easterEggs: ["La línea de fases recuerda exactamente hasta dónde llegaste."],
    medal: {
      title: "Medalla Gamer",
      message: "Nivel legendario completado con éxito.",
      imageSrc: "/365-assets/medals/medal-4.png",
    },
    audioSrc: "/365-assets/audio/phase-4.mp3",
    unsolvedDocSrc: "/365-assets/phase-docs/fase-4-sin-solucion.pdf",
    solutionDocSrc: "/365-assets/phase-docs/fase-4-con-solucion.pdf",
  },
  {
    id: "day-230",
    title: "Caja de Regalos",
    dayReference: 230,
    riddle:
      "El momento de abrir la caja y descubrir la sorpresa. Los mejores regalos no son cosas: son detalles guardados con amor para un día muy especial.",
    hints: [
      "Piensa en la fecha que más se celebra en el año.",
      "Cajas, lazos y un deseo al soplar las velas.",
      "Lo que se festeja una vez cada 365 días.",
    ],
    reward: {
      title: "Bóveda de Sorpresas",
      description:
        "El archivo atesora los detalles y regalos más significativos del recorrido.",
    },
    recap:
      "El valor de un regalo está en el tiempo y el amor puesto en prepararlo.",
    easterEggs: ["Las recompensas brillan distinto cuando las fases anteriores están resueltas."],
    medal: {
      title: "Medalla de los Regalos",
      message: "La sorpresa y los detalles han sido descubiertos con éxito.",
      imageSrc: "/365-assets/medals/medal-5.png",
    },
    audioSrc: "/365-assets/audio/phase-5.mp3",
    unsolvedDocSrc: "/365-assets/phase-docs/fase-5-sin-solucion.pdf",
    solutionDocSrc: "/365-assets/phase-docs/fase-5-con-solucion.pdf",
  },
  {
    id: "day-275",
    title: "Protocolo de Hackeo",
    dayReference: 275,
    riddle:
      "Acceso restringido al sistema central. Descifra la fórmula elemental que hackea los cortafuegos y fluye vitalmente como el agua misma.",
    hints: [
      "Dos partes de hidrógeno y una de oxígeno.",
      "La molécula que da la vida y hackea la sed.",
      "Elemental, líquida y transparente.",
    ],
    reward: {
      title: "Terminal Vulnerada",
      description:
        "Se abren los registros clasificados y las confesiones más íntimas del sistema.",
    },
    recap:
      "Ni el cortafuegos más blindado puede ocultar lo que está destinado a revelarse.",
    easterEggs: ["La cerradura acepta intención, no solo mayúsculas exactas."],
    medal: {
      title: "Medalla de Hackeo",
      message: "Protocolo superado: acceso total concedido a la bóveda central.",
      imageSrc: "/365-assets/medals/medal-6.png",
    },
    audioSrc: "/365-assets/audio/phase-6.mp3",
    unsolvedDocSrc: "/365-assets/phase-docs/fase-6-sin-solucion.pdf",
    solutionVideoSrc: "/365-assets/video/fase-6-con-resolucion.mp4",
  },
  {
    id: "day-320",
    title: "Deseo de Cumpleaños",
    dayReference: 320,
    riddle:
      "Cerrar los ojos, pedir un deseo y proyectar el futuro con certeza. Cuando la mente y el corazón se alinean, lo que deseas se vuelve realidad.",
    hints: [
      "Visualizar con fe para que ocurra.",
      "No es solo desear: es decretarlo y atraerlo.",
      "La palabra clave para hacer realidad los sueños.",
    ],
    reward: {
      title: "Luz de Celebración",
      description:
        "La energía de los deseos proyectados ilumina el tramo final del archivo.",
    },
    recap:
      "Cumplir años y soñar juntos: manifestar lo que queremos es el primer paso para vivirlo.",
    easterEggs: ["La última fase cambia de presencia cuando llegas hasta aquí."],
    medal: {
      title: "Medalla de Cumpleaños",
      message: "El deseo de cumpleaños quedó sellado en el archivo.",
      imageSrc: "/365-assets/medals/medal-7.png",
    },
    audioSrc: "/365-assets/audio/phase-7.mp3",
    unsolvedDocSrc: "/365-assets/phase-docs/fase-7-sin-solucion.pdf",
    solutionVideoSrc: "/365-assets/video/fase-7-con-resolucion.mp4",
  },
  {
    id: "day-365",
    title: "El Gran Viaje Final",
    dayReference: 365,
    riddle:
      "Llegamos al final del libro, pero este final es en realidad el inicio de un viaje soñado. Una fecha prometida que marca nuestro próximo gran destino juntos.",
    hints: [
      "Una fecha exacta marcada en el calendario para viajar juntos.",
      "Formato de día, mes y año: DD/MM/AAAA.",
      "El día en que el sueño del viaje se hace realidad en 2026.",
    ],
    reward: {
      title: "Pasaporte al Destino Soñado",
      description:
        "Se completa el archivo entero y se abre el boleto hacia la gran aventura final.",
    },
    recap:
      "El final de los 365 días no es una despedida: es la partida del mejor viaje juntos.",
    easterEggs: ["El 365 se convierte en llave final después de la última fase."],
    medal: {
      title: "Medalla del Viaje Final",
      message: "Todas las fases superadas: destino alcanzado y viaje asegurado.",
      imageSrc: "/365-assets/medals/medal-8.png",
    },
    unsolvedDocSrc: "/365-assets/phase-docs/fase-8-sin-solucion.pdf",
    solutionDocSrc: "/365-assets/phase-docs/fase-8-con-solucion.pdf",
  },
];
