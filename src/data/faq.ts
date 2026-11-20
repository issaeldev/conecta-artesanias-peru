import type { FaqItem } from "@/types/domain";

export const faqItems: FaqItem[] = [
  {
    id: "envio-costo",
    question: { es: "¿Cuánto cuesta el envío y cuánto demora?", en: "How much is shipping and how long does it take?" },
    answer: {
      es: "En Perú: S/ 12 a Lima y Callao, S/ 22 al resto del país, por cada taller, en 4 a 6 días hábiles. Al extranjero reunimos tu pedido en Lima y lo enviamos en un solo paquete desde S/ 130, en unos 10 a 15 días hábiles. Siempre ves el costo y la fecha estimada antes de pagar.",
      en: "Within Peru: S/ 12 to Lima and Callao, S/ 22 elsewhere, per workshop, in 4 to 6 business days. Abroad, we gather your order in Lima and send it in a single package from S/ 130, in about 10 to 15 business days. You always see the cost and estimated date before paying.",
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
      es: "Con tarjeta de crédito o débito, o con Yape. Cobramos en soles y antes de pagar ves el desglose completo: cuánto recibe el artesano, el Servicio Conecta y el IGV.",
      en: "By credit or debit card, or with Yape. We charge in soles, and before paying you see the full breakdown: what the artisan receives, the Conecta service and IGV.",
    },
  },
  {
    id: "problema-pedido",
    question: { es: "¿Qué pasa si tengo un problema con mi pedido?", en: "What if I have a problem with my order?" },
    answer: {
      es: "Pregúntale a nuestro asistente o revisa la página de seguimiento de tu pedido. Si hay un retraso, daño o extravío, nosotros lo gestionamos con el artesano y el courier, y si hace falta te atiende una persona.",
      en: "Ask our assistant or check your order tracking page. If there is a delay, damage or loss, we handle it with the artisan and the courier, and a person steps in whenever needed.",
    },
  },
  {
    id: "garantia",
    question: { es: "¿Qué es la Garantía Conecta?", en: "What is the Conecta Guarantee?" },
    answer: {
      es: "Si el artesano no confirma tu pedido o la pieza no llega, te devolvemos tu dinero. Si llega dañada o distinta a su ficha, la reponemos o te reembolsamos. Solo aplica a compras pagadas en Conecta Artesanías Perú: por eso te pedimos no pagar por fuera de la plataforma.",
      en: "If the artisan does not confirm your order or the piece does not arrive, you get your money back. If it arrives damaged or different from its page, we replace or refund it. It only applies to purchases paid on Conecta Artesanías Perú, which is why we ask you not to pay outside the platform.",
    },
  },
  {
    id: "coordinacion-envio",
    question: { es: "¿Cómo se coordina el envío?", en: "How is shipping coordinated?" },
    answer: {
      es: "Cada artesano entrega su paquete a Olva Courier: lo lleva a la agencia más cercana o, si su zona tiene cobertura, lo recogen en su taller. Los envíos internacionales pasan por nuestro centro en Lima, donde se revisan y se consolidan en un solo paquete.",
      en: "Each artisan hands their package to Olva Courier: they take it to the nearest branch or, if their area is covered, it is picked up at the workshop. International shipments go through our Lima hub, where they are inspected and consolidated into a single package.",
    },
  },
  {
    id: "medios-pago",
    question: { es: "¿Cuándo recibe su pago el artesano?", en: "When does the artisan get paid?" },
    answer: {
      es: "El primer viernes después de que pasen las 48 horas para reportar daños tras la entrega. El artesano recibe el aviso y su liquidación por WhatsApp.",
      en: "On the first Friday after the 48-hour window to report damage following delivery. The artisan gets the notice and their settlement on WhatsApp.",
    },
  },
  {
    id: "cambios-reclamos",
    question: { es: "¿Cómo se gestionan cambios o reclamos?", en: "How are exchanges or claims handled?" },
    answer: {
      es: "Si la pieza llega dañada o distinta a su ficha, avísanos dentro de las 48 horas con fotos y la reponemos o te reembolsamos. Cada pieza es hecha a mano: pequeñas variaciones de color, textura o acabado son propias de su técnica y no se consideran defecto.",
      en: "If the piece arrives damaged or different from its page, tell us within 48 hours with photos and we will replace or refund it. Every piece is handmade: small variations in color, texture or finish are part of the technique and are not considered defects.",
    },
  },
];
