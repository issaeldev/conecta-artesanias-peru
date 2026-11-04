import type { Region } from "@/types/domain";

export const regions: Region[] = [
  {
    id: "puno",
    name: "Puno",
    color: "#c2185b",
    map: { x: 276, y: 382, labelSide: "end" },
    productIds: ["manta-telar-cintura"],
    area: { es: "Altiplano · Lago Titicaca", en: "Altiplano · Lake Titicaca" },
    technique: { es: "Telar de cintura", en: "Backstrap loom" },
    materials: { es: "Lana de alpaca y oveja", en: "Alpaca and sheep wool" },
    description: {
      es: "Mantas y tejidos de colores intensos, hechos en el altiplano con técnicas que pasan de generación en generación.",
      en: "Blankets and textiles in vivid colors, made on the high plateau with techniques passed down through generations.",
    },
  },
  {
    id: "ayacucho",
    name: "Ayacucho",
    color: "#0a7c82",
    map: { x: 175, y: 319, labelSide: "end" },
    productIds: ["jarron-pintado-quinua", "retablo-ayacuchano"],
    area: { es: "Andes centrales", en: "Central Andes" },
    technique: { es: "Pintado a mano y modelado", en: "Hand painting and modeling" },
    materials: { es: "Arcilla, yeso y madera", en: "Clay, plaster and wood" },
    description: {
      es: "Cerámica pintada y retablos llenos de pequeñas figuras que cuentan escenas de la vida cotidiana y las fiestas.",
      en: "Painted ceramics and retablos full of tiny figures that tell scenes of daily life and festivals.",
    },
  },
  {
    id: "cusco",
    name: "Cusco",
    color: "#6a3d8f",
    map: { x: 228, y: 326, labelSide: "start" },
    productIds: ["chullo-alpaca", "set-tazas-artesanales"],
    area: { es: "Andes del sur", en: "Southern Andes" },
    technique: { es: "Tejido y esmaltado", en: "Weaving and glazing" },
    materials: { es: "Fibra de alpaca y arcilla", en: "Alpaca fiber and clay" },
    description: {
      es: "Tejidos de alpaca y cerámica esmaltada, herencia viva del mundo andino.",
      en: "Alpaca textiles and glazed ceramics, a living legacy of the Andean world.",
    },
  },
  {
    id: "junin",
    name: "Junín",
    color: "#2f8f4e",
    map: { x: 151, y: 293, labelSide: "start" },
    productIds: ["mate-burilado"],
    area: { es: "Valle del Mantaro", en: "Mantaro Valley" },
    technique: { es: "Burilado a mano", en: "Hand carving" },
    materials: { es: "Calabaza", en: "Gourd" },
    description: {
      es: "Mates burilados: calabazas grabadas a mano con escenas de la vida andina.",
      en: "Carved gourds: hand-engraved with scenes of Andean life.",
    },
  },
];
