import { siteConfig } from "@/config/site";
import type { Product, Workshop } from "@/types/domain";
import type { CounterDecision, CustomRequest, RequestReply, RequestStatus } from "@/types/request";
import { grossUp, splitPrice } from "./pricing";

/**
 * Pedidos personalizados. Lo que está en el catálogo se compra directo (ya existe);
 * lo que cambia tamaño, color o diseño se consulta primero con el artesano por WhatsApp.
 */
export interface NewRequestInput {
  product: Product;
  workshop?: Workshop;
  details: CustomRequest["details"];
  quantity: number;
  customer: CustomRequest["customer"];
}

const digits = (n: number, random: () => number) =>
  Array.from({ length: n }, () => Math.floor(random() * 10)).join("");

export function createRequest(input: NewRequestInput, now = new Date(), random: () => number = Math.random): CustomRequest {
  const { product, workshop } = input;
  const fullName = workshop?.artisanName.es ?? product.artisanName;
  return {
    id: `SOL-${digits(5, random)}`,
    createdAt: now.toISOString(),
    productId: product.id,
    productName: product.name,
    image: product.image.src,
    basePrice: product.price,
    workshopId: product.artisanId,
    artisanFirstName: fullName.split(" ")[0],
    artisanFullName: fullName,
    regionName: workshop?.regionName ?? product.originRegion,
    details: input.details,
    quantity: input.quantity,
    customer: input.customer,
    events: [{ type: "created", at: now.toISOString() }],
  };
}

const statusByEvent: Record<CustomRequest["events"][number]["type"], RequestStatus> = {
  created: "awaiting_artisan",
  can_do: "awaiting_quote",
  cannot_do: "rejected",
  quoted: "quoted",
  counter: "countered",
  counter_reply: "quoted",
  accepted: "accepted",
  declined: "declined",
};

export function requestStatus(req: CustomRequest): RequestStatus {
  return statusByEvent[req.events[req.events.length - 1].type];
}

export interface Quote {
  artisanPrice: number;
  buyerPrice: number;
  days: number;
}

/** Cotización vigente: la respuesta a la contraoferta si la hubo; si no, la cotización original. */
export function requestQuote(req: CustomRequest): Quote | null {
  for (let i = req.events.length - 1; i >= 0; i--) {
    const e = req.events[i];
    if (e.type === "quoted" || e.type === "counter_reply") {
      return { artisanPrice: e.artisanPrice, buyerPrice: e.buyerPrice, days: e.days };
    }
  }
  return null;
}

/**
 * Cotizaciones sugeridas al artesano (lo que ÉL/ELLA recibe), a partir de lo que gana hoy
 * con la pieza de catálogo. En la versión real el artesano escribe su precio libremente.
 */
export function quoteOptions(req: CustomRequest): Quote[] {
  const base = splitPrice(req.basePrice, siteConfig.pricing).artisan;
  return [
    { factor: 1.15, days: 10 },
    { factor: 1.3, days: 15 },
    { factor: 1.5, days: 20 },
  ].map(({ factor, days }) => {
    const artisanPrice = Math.round((base * factor) / 10) * 10;
    return { artisanPrice, buyerPrice: grossUp(artisanPrice, siteConfig.pricing), days };
  });
}

/* ---------- Contraoferta (una sola ronda) ---------- */

/** Se puede contraofertar una vez, sobre la cotización original. */
export function canCounter(req: CustomRequest): boolean {
  return requestStatus(req) === "quoted" && !req.events.some((e) => e.type === "counter");
}

/** Rango aceptable para la contraoferta (precio final por pieza, en soles): del 60 % al precio cotizado. */
export function counterRange(req: CustomRequest): { min: number; max: number } {
  const q = requestQuote(req);
  if (!q) return { min: 0, max: 0 };
  return { min: Math.ceil(q.buyerPrice * 0.6), max: q.buyerPrice - 1 };
}

export function applyCounter(req: CustomRequest, buyerPrice: number, now = new Date()): CustomRequest {
  const { min, max } = counterRange(req);
  const price = Math.round(buyerPrice);
  if (!canCounter(req) || price < min || price > max) return req;
  const artisanPrice = Math.round(splitPrice(price, siteConfig.pricing).artisan);
  return { ...req, events: [...req.events, { type: "counter", at: now.toISOString(), buyerPrice: price, artisanPrice }] };
}

/** Las tres respuestas posibles del artesano a la contraoferta, con sus precios. */
export function counterOptions(req: CustomRequest): Record<CounterDecision, Quote> | null {
  const counter = req.events.find((e) => e.type === "counter");
  const original = req.events.find((e) => e.type === "quoted");
  if (!counter || counter.type !== "counter" || !original || original.type !== "quoted") return null;
  const midArtisan = Math.round((original.artisanPrice + counter.artisanPrice) / 2 / 5) * 5;
  const days = original.days;
  return {
    accept: { artisanPrice: counter.artisanPrice, buyerPrice: counter.buyerPrice, days },
    meet: { artisanPrice: midArtisan, buyerPrice: grossUp(midArtisan, siteConfig.pricing), days },
    keep: { artisanPrice: original.artisanPrice, buyerPrice: original.buyerPrice, days },
  };
}

/** Cómo respondió el artesano a la contraoferta, si ya lo hizo. */
export function counterDecision(req: CustomRequest): CounterDecision | null {
  const reply = req.events.find((e) => e.type === "counter_reply");
  return reply && reply.type === "counter_reply" ? reply.decision : null;
}

/* ---------- Respuestas del artesano ---------- */

export function availableRequestReplies(req: CustomRequest): RequestReply[] {
  const status = requestStatus(req);
  if (status === "awaiting_artisan") return ["can_do", "cannot_do"];
  if (status === "awaiting_quote") return ["quote_0", "quote_1", "quote_2"];
  if (status === "countered") return ["counter_accept", "counter_meet", "counter_keep"];
  return [];
}

export function applyRequestReply(req: CustomRequest, reply: RequestReply, now = new Date()): CustomRequest {
  if (!availableRequestReplies(req).includes(reply)) return req;
  const at = now.toISOString();
  if (reply === "can_do" || reply === "cannot_do") return { ...req, events: [...req.events, { type: reply, at }] };
  if (reply === "counter_accept" || reply === "counter_meet" || reply === "counter_keep") {
    const decision = reply.replace("counter_", "") as CounterDecision;
    const option = counterOptions(req)?.[decision];
    if (!option) return req;
    return { ...req, events: [...req.events, { type: "counter_reply", at, decision, ...option }] };
  }
  const option = quoteOptions(req)[Number(reply.slice(-1))];
  return { ...req, events: [...req.events, { type: "quoted", at, ...option }] };
}

/** El comprador pagó la cotización: queda enlazada al pedido. */
export function markRequestAccepted(req: CustomRequest, orderId: string, now = new Date()): CustomRequest {
  if (requestStatus(req) !== "quoted") return req;
  return { ...req, events: [...req.events, { type: "accepted", at: now.toISOString(), orderId }] };
}

export function declineRequest(req: CustomRequest, now = new Date()): CustomRequest {
  if (requestStatus(req) !== "quoted") return req;
  return { ...req, events: [...req.events, { type: "declined", at: now.toISOString() }] };
}

/** Resumen de lo pedido en una línea, para el pedido y los mensajes. */
export function requestSummary(req: CustomRequest): string {
  const { size, colors, notes } = req.details;
  return [size && `Tamaño: ${size}`, colors && `Colores: ${colors}`, notes && `Detalles: ${notes}`]
    .filter(Boolean)
    .join(" · ");
}
