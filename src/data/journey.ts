import type { JourneyStep } from "@/types/domain";

/** "El camino de una pieza": de la materia prima hasta la casa del comprador. */
export const journeySteps: JourneyStep[] = [
  {
    id: "tierra",
    title: { es: "1. La tierra y la fibra", en: "1. Land and fiber" },
    body: {
      es: "Todo empieza en los Andes: la fibra de alpaca, la arcilla de la quebrada, la calabaza que madura al sol. Cada artesano conoce su material desde niño.",
      en: "It all starts in the Andes: alpaca fiber, clay from the ravine, gourds ripening in the sun. Every artisan has known their materials since childhood.",
    },
    culturalValue: {
      es: "Materiales que muchas familias andinas trabajan desde hace generaciones.",
      en: "Materials that many Andean families have worked with for generations.",
    },
    photo: { src: "/images/journey/paso-1.jpg", position: "center" },
  },
  {
    id: "colores",
    title: { es: "2. Colores con significado", en: "2. Colors with meaning" },
    body: {
      es: "Los tintes se preparan con plantas, minerales e insectos como la cochinilla. Muchas recetas se transmiten dentro de la familia, de manos a manos.",
      en: "Dyes are made from plants, minerals and insects such as cochineal. Many recipes are passed down within the family, from hand to hand.",
    },
    culturalValue: {
      es: "Los colores y los símbolos hablan de la tierra, el agua y las fiestas de cada comunidad.",
      en: "Colors and symbols speak of the land, the water and each community's festivals.",
    },
    photo: { src: "/images/journey/paso-2.jpg", position: "center 35%" },
  },
  {
    id: "a-mano",
    title: { es: "3. Hecho a mano, sin prisa", en: "3. Handmade, unhurried" },
    body: {
      es: "Un tejido puede tomar días o semanas. Cada puntada guarda una técnica que se aprende mirando y practicando junto a la familia.",
      en: "A weaving can take days or weeks. Every stitch holds a technique learned by watching and practicing alongside family.",
    },
    culturalValue: {
      es: "Una técnica viva: cuando se compra una pieza, el oficio sigue.",
      en: "A living technique: every purchase keeps the craft alive.",
    },
    photo: { src: "/images/journey/paso-3.jpg", position: "center" },
  },
  {
    id: "quien-la-hizo",
    title: { es: "4. Conoce a quien la hizo", en: "4. Meet the maker" },
    body: {
      es: "Detrás de cada pieza hay un nombre, una comunidad y una historia. En su ficha verás su rostro, su taller y cómo trabaja.",
      en: "Behind every piece there is a name, a community and a story. On its page you will see their face, their workshop and how they work.",
    },
    culturalValue: {
      es: "Cada artesano cuenta su historia con sus propias palabras.",
      en: "Each artisan tells their story in their own words.",
    },
    photo: { src: "/images/journey/paso-4.jpg", position: "72% 35%" },
  },
  {
    id: "viaje-seguro",
    title: { es: "5. Un viaje seguro", en: "5. A safe journey" },
    body: {
      es: "Tu compra viaja protegida, desde el taller del artesano hasta ti.",
      en: "Your purchase travels protected, from the artisan's workshop to you.",
    },
    culturalValue: {
      es: "Tu compra llega protegida, y el artesano cobra de forma justa y a tiempo.",
      en: "Your purchase arrives protected, and the artisan is paid fairly and on time.",
    },
    highlights: {
      es: [
        { label: "Pago:", text: "Seguro, a través de la plataforma." },
        { label: "Envío:", text: "Desde un punto de acopio hasta tu destino." },
        { label: "Antes de pagar:", text: "Ves el costo y el plazo." },
      ],
      en: [
        { label: "Payment:", text: "Secure, through the platform." },
        { label: "Shipping:", text: "From a collection point to your destination." },
        { label: "Before paying:", text: "You see the cost and timing." },
      ],
    },
  },
  {
    id: "llega-a-casa",
    title: { es: "6. Llega a tu casa", en: "6. Arrives at your home" },
    body: {
      es: "No recibes un objeto cualquiera: recibes una historia viva del Perú.",
      en: "You do not receive just any object: you receive a living story of Peru.",
    },
    culturalValue: {
      es: "Cada compra ayuda a que el oficio y la cultura sigan vivos.",
      en: "Every purchase helps the craft and the culture stay alive.",
    },
    highlights: {
      es: [
        { label: "Tu pieza:", text: "Llega con su ficha y su historia." },
        { label: "Ayuda:", text: "Escríbenos por WhatsApp si algo falla." },
        { label: "Cambios:", text: "Avísanos en 7 días con fotos (política propuesta)." },
      ],
      en: [
        { label: "Your piece:", text: "It arrives with its page and its story." },
        { label: "Help:", text: "Message us on WhatsApp if anything goes wrong." },
        { label: "Exchanges:", text: "Tell us within 7 days with photos (proposed policy)." },
      ],
    },
  },
];
