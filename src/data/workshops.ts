import type { Workshop } from "@/types/domain";

const sampleBio = {
  es: "Perfil de ejemplo: aquí irá la historia real del taller, cómo empezó y qué lo inspira.",
  en: "Sample profile: the workshop's real story will go here, how it started and what inspires it.",
};

export const workshops: Workshop[] = [
  {
    id: "taller-puno",
    regionName: "Puno",
    color: "#c2185b",
    productIds: ["manta-telar-cintura"],
    title: { es: "Taller de tejidos de telar de cintura", en: "Backstrap-loom weaving workshop" },
    technique: { es: "Telar de cintura", en: "Backstrap loom" },
    materials: { es: "Lana de alpaca y oveja", en: "Alpaca and sheep wool" },
    bio: sampleBio,
  },
  {
    id: "taller-ayacucho",
    regionName: "Ayacucho",
    color: "#0a7c82",
    productIds: ["jarron-pintado-quinua", "retablo-ayacuchano"],
    title: { es: "Taller de cerámica y retablos", en: "Ceramics and retablo workshop" },
    technique: { es: "Pintado a mano y modelado", en: "Hand painting and modeling" },
    materials: { es: "Arcilla, yeso y madera", en: "Clay, plaster and wood" },
    bio: sampleBio,
  },
  {
    id: "taller-cusco",
    regionName: "Cusco",
    color: "#6a3d8f",
    productIds: ["chullo-alpaca", "set-tazas-artesanales"],
    title: { es: "Taller de tejidos y cerámica", en: "Weaving and ceramics workshop" },
    technique: { es: "Tejido y esmaltado", en: "Weaving and glazing" },
    materials: { es: "Fibra de alpaca y arcilla", en: "Alpaca fiber and clay" },
    bio: sampleBio,
  },
  {
    id: "taller-junin",
    regionName: "Junín",
    color: "#2f8f4e",
    productIds: ["mate-burilado"],
    title: { es: "Taller de mates burilados", en: "Carved-gourd workshop" },
    technique: { es: "Burilado a mano", en: "Hand carving" },
    materials: { es: "Calabaza", en: "Gourd" },
    bio: sampleBio,
  },
];
