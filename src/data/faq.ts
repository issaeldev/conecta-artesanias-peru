import type { FaqItem } from "@/types/domain";

export const faqItems: FaqItem[] = [
  {
    id: "envio-costo",
    question: { es: "¿Cuánto cuesta el envío y cuánto demora?", en: "How much is shipping and how long does it take?" },
    answer: {
      es: "Antes de pagar verás el costo total y el plazo estimado según tu destino.",
      en: "Before paying you will see the total cost and estimated time for your destination.",
    },
  },
  {
    id: "autenticidad",
    question: { es: "¿Cómo sé que la pieza es auténtica?", en: "How do I know a piece is authentic?" },
    answer: {
      es: "Cada ficha indica el artesano, su procedencia, materiales y técnica.",
      en: "Each page lists the artisan, origin, materials and technique.",
    },
  },
  {
    id: "como-pago",
    question: { es: "¿Cómo pago?", en: "How do I pay?" },
    answer: {
      es: "Con los métodos de pago de la plataforma, explicados paso a paso en cada compra.",
      en: "With the platform’s payment methods, explained step by step at checkout.",
    },
  },
  {
    id: "problema-pedido",
    question: { es: "¿Qué pasa si tengo un problema con mi pedido?", en: "What if I have a problem with my order?" },
    answer: {
      es: "Escríbenos por WhatsApp y te ayudamos a resolverlo.",
      en: "Message us on WhatsApp and we will help you solve it.",
    },
  },
  {
    id: "compra-asistida",
    question: { es: "¿Cómo funciona la compra asistida?", en: "How does assisted purchase work?" },
    answer: {
      es: "Armas tu pedido en la web y lo envías por WhatsApp. Un asesor confirma disponibilidad, precio final y envío antes de que pagues. Es un flujo de demostración: todavía no hay pagos en línea.",
      en: "You build your order on the site and send it through WhatsApp. An advisor confirms availability, final price and shipping before you pay. This is a demo flow: there are no online payments yet.",
    },
  },
  {
    id: "coordinacion-envio",
    question: { es: "¿Cómo se coordina el envío?", en: "How is shipping coordinated?" },
    answer: {
      es: "El pedido se recoge en un punto de acopio y se despacha al destino. El costo y el plazo se informan antes del pago. (Propuesta del proyecto.)",
      en: "The order is collected at a collection point and shipped to its destination. Cost and timing are shown before payment. (Project proposal.)",
    },
  },
  {
    id: "medios-pago",
    question: { es: "¿Qué medios de pago están previstos?", en: "Which payment methods are planned?" },
    answer: {
      es: "Se prevén transferencia, billeteras digitales y tarjeta mediante un intermediario seguro. Aún por definir.",
      en: "Bank transfer, digital wallets and card through a secure intermediary are planned. Still to be defined.",
    },
  },
  {
    id: "cambios-reclamos",
    question: { es: "¿Cómo se gestionan cambios o reclamos?", en: "How are exchanges or claims handled?" },
    answer: {
      es: "Política propuesta: si la pieza llega dañada o distinta a su ficha, avísanos dentro de 7 días con fotos y buscamos una solución junto con el artesano.",
      en: "Proposed policy: if the piece arrives damaged or different from its page, tell us within 7 days with photos and we will find a solution together with the artisan.",
    },
  },
];
