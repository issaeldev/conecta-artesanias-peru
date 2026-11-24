import type { Localized } from "@/types/domain";

/**
 * Base SIMULADA del contador de impacto (lo "ya acumulado" antes de esta demo).
 * Sobre ella se suman en vivo los pedidos que se completan en la demostración.
 * Reemplazar por los datos reales del backend cuando exista.
 */
export const impactBaseline = {
  /** Soles transferidos a artesanos. */
  transferredPen: 48_320,
  /** Pedidos entregados. */
  deliveredOrders: 312,
  /** Países a los que se ha enviado. */
  countries: 9,
};

export interface Testimonial {
  id: string;
  workshopId: string;
  buyer: string;
  place: Localized;
  message: Localized;
  /** Foto de la pieza en casa del comprador (aquí, la del producto). */
  photo?: string;
}

/** Mensajes de ejemplo de compradores a artesanos (también simulados). */
export const sampleTestimonials: Testimonial[] = [
  {
    id: "t-puno",
    workshopId: "taller-puno",
    buyer: "Camila",
    place: { es: "Arequipa", en: "Arequipa, Peru" },
    message: {
      es: "Rosa, la manta llegó perfecta y huele a lana de verdad. Mi abuela lloró al verla: le recordó a la que tenía de niña en Juli. ¡Gracias!",
      en: "Rosa, the blanket arrived perfect and smells of real wool. My grandmother cried when she saw it: it reminded her of the one she had as a child in Juli. Thank you!",
    },
    photo: "/images/products/manta-telar-cintura.jpg",
  },
  {
    id: "t-junin",
    workshopId: "taller-junin",
    buyer: "Daniel",
    place: { es: "Madrid, España", en: "Madrid, Spain" },
    message: {
      es: "Julián, el mate burilado es una obra de arte. Lo tengo en la sala y todos preguntan por la historia que cuenta. Ahora la saben gracias a ti.",
      en: "Julián, the carved gourd is a work of art. It sits in my living room and everyone asks about the story it tells. Now they know it, thanks to you.",
    },
  },
  {
    id: "t-cusco",
    workshopId: "taller-cusco",
    buyer: "Sarah",
    place: { es: "Austin, EE. UU.", en: "Austin, USA" },
    message: {
      es: "Lucía, ver las fotos del chullo mientras lo tejías hizo que la espera valiera la pena. Mi hijo no se lo quiere quitar.",
      en: "Lucía, seeing photos of the chullo while you knitted it made the wait worth it. My son won't take it off.",
    },
    photo: "/images/products/chullo-alpaca.jpg",
  },
];
