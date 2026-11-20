/**
 * Asistente guiado (sin IA): reconoce el tema por palabras clave en español e inglés
 * y detecta números de pedido. Gratis, instantáneo y predecible para una demo en vivo.
 */
export type AssistantTopic = "order" | "shipping" | "payment" | "guarantee" | "authenticity" | "custom" | "human";

export const assistantTopics: AssistantTopic[] = [
  "order",
  "shipping",
  "payment",
  "guarantee",
  "authenticity",
  "custom",
  "human",
];

/** Orden de prioridad: lo más específico primero (p. ej. "persona" gana a "pedido"). */
const keywords: [AssistantTopic, string[]][] = [
  ["human", ["persona", "humano", "asesor", "agente", "hablar con", "whatsapp", "human", "agent", "someone", "real person"]],
  ["custom", ["personaliz", "a medida", "medida", "tamano", "otro color", "diseno propio", "custom", "made to", "bespoke"]],
  ["guarantee", ["garant", "devol", "reembols", "danad", "roto", "rota", "defect", "reclam", "cambio", "guarantee", "refund", "return", "damag", "broken"]],
  ["order", ["mi pedido", "donde esta", "seguimiento", "rastre", "mi orden", "llego mi", "track", "where is", "my order"]],
  ["payment", ["pago", "pagar", "yape", "tarjeta", "visa", "mastercard", "igv", "comision", "precio", "pay", "card", "price", "commission"]],
  ["shipping", ["envio", "enviar", "envian", "despacho", "demora", "plazo", "cuanto tarda", "internacional", "aduana", "courier", "olva", "dhl", "ship", "delivery", "customs", "abroad"]],
  ["authenticity", ["autentic", "original", "quien lo hizo", "quien la hizo", "hecho a mano", "authentic", "handmade", "who made"]],
];

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Devuelve "CAP-12345" si el texto contiene un número de pedido. */
export function findOrderId(text: string): string | null {
  const m = /cap[\s-]?(\d{5})/i.exec(text);
  return m ? `CAP-${m[1]}` : null;
}

export function detectTopic(text: string): AssistantTopic | null {
  const t = normalize(text);
  for (const [topic, words] of keywords) {
    if (words.some((w) => t.includes(w))) return topic;
  }
  // "pedido" solo, sin otra pista, suele ser una consulta de seguimiento.
  if (/\b(pedido|orden|order)\b/.test(t)) return "order";
  return null;
}
