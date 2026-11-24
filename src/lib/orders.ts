import { siteConfig } from "@/config/site";
import { findCountry } from "@/data/countries";
import type { Product, Workshop } from "@/types/domain";
import type {
  ArtisanReply,
  Customer,
  Handover,
  Order,
  OrderLine,
  Parcel,
  ParcelEvent,
  ParcelEventType,
  ParcelStatus,
  PaymentMethod,
  PhotoStage,
} from "@/types/order";
import type { Currency } from "@/types/domain";
import { splitPrice, sumBreakdowns } from "./pricing";

const { pricing, logistics } = siteConfig;

/* ---------- Fechas ---------- */

/** Suma días hábiles (lunes a viernes). */
export function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let left = days;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) left--;
  }
  return d;
}

/**
 * Fecha de pago al artesano: el primer viernes con al menos 3 días desde la entrega,
 * para dejar pasar las 48 h en que el comprador puede reportar daños.
 */
export function payoutDate(deliveredAt: Date): Date {
  const d = new Date(deliveredAt);
  d.setDate(d.getDate() + 3);
  while (d.getDay() !== 5) d.setDate(d.getDate() + 1);
  return d;
}

/* ---------- Envío ---------- */

export function isLimaDestination(department: string): boolean {
  return department === "Lima" || department === "Callao";
}

export function isInternational(country: string): boolean {
  return country !== "PE";
}

export interface ShippingQuote {
  international: boolean;
  /** Costo por taller (nacional) o 0 (internacional: se cobra una vez por pedido). */
  perWorkshop: number;
  total: number;
  transitDays: number;
}

/**
 * Nacional: un envío por taller, porque cada uno despacha desde su comunidad.
 * Internacional: todo se consolida en Lima y sale en un solo paquete, con tarifa por zona.
 */
export function shippingQuote(country: string, department: string, workshops: number): ShippingQuote {
  if (isInternational(country)) {
    const zone = findCountry(country)?.zone;
    const intl = logistics.international;
    const total = zone && zone !== "domestic" ? intl.shipping[zone] : intl.shipping.world;
    return { international: true, perWorkshop: 0, total, transitDays: intl.transitDays };
  }
  const lima = isLimaDestination(department);
  const perWorkshop = lima ? logistics.shippingLima : logistics.shippingProvince;
  return {
    international: false,
    perWorkshop,
    total: perWorkshop * workshops,
    transitDays: lima ? logistics.transitDaysLima : logistics.transitDaysProvince,
  };
}

/* ---------- Crear pedido ---------- */

export interface CartEntry {
  product: Product;
  quantity: number;
  /** Pieza a medida ya cotizada: detalles acordados y días de elaboración. */
  custom?: { requestId: string; details: string; days: number };
}

export interface PlaceOrderInput {
  customer: Customer;
  currency?: Currency;
  payment: { method: PaymentMethod; detail: string };
  entries: CartEntry[];
  workshops: Workshop[];
}

const digits = (n: number, random: () => number) =>
  Array.from({ length: n }, () => Math.floor(random() * 10)).join("");

export function toOrderLine({ product, quantity, custom }: CartEntry): OrderLine {
  return {
    productId: product.id,
    name: product.name,
    image: product.image.src,
    quantity,
    unitPrice: product.price,
    breakdown: splitPrice(product.price * quantity, pricing),
    ...(custom ? { custom: { requestId: custom.requestId, details: custom.details } } : {}),
  };
}

/** Agrupa las piezas por taller: cada taller prepara y despacha su propio envío. */
export function createOrder(input: PlaceOrderInput, now = new Date(), random: () => number = Math.random): Order {
  const groups = new Map<string, CartEntry[]>();
  for (const entry of input.entries) {
    const list = groups.get(entry.product.artisanId) ?? [];
    list.push(entry);
    groups.set(entry.product.artisanId, list);
  }
  const quote = shippingQuote(input.customer.country, input.customer.department, groups.size);

  const id = `CAP-${digits(5, random)}`;
  const at = now.toISOString();
  const parcels: Parcel[] = [...groups.entries()].map(([workshopId, entries], i) => {
    const workshop = input.workshops.find((w) => w.id === workshopId);
    // Catálogo: la pieza ya existe (2 días hábiles para despachar). A medida: el plazo cotizado.
    const customDays = Math.max(0, ...entries.map((e) => e.custom?.days ?? 0));
    const dispatchBy = addBusinessDays(now, customDays || logistics.dispatchDays);
    const fullName = workshop?.artisanName.es ?? entries[0].product.artisanName;
    return {
      id: `${id}-${i + 1}`,
      workshopId,
      artisanFirstName: fullName.split(" ")[0],
      artisanFullName: fullName,
      regionName: workshop?.regionName ?? entries[0].product.originRegion,
      community: workshop?.community.es.split(",")[0] ?? entries[0].product.location,
      lines: entries.map(toOrderLine),
      shipping: quote.perWorkshop,
      transitDays: quote.transitDays,
      dispatchBy: dispatchBy.toISOString(),
      deliveryBy: addBusinessDays(dispatchBy, quote.transitDays).toISOString(),
      courier: logistics.courier,
      trackingCode: `OLV-${digits(8, random)}`,
      pickupAvailable: workshop?.handover.pickupAvailable ?? false,
      dropOff: workshop?.handover.dropOff ?? {
        name: `Agencia ${logistics.courier}`,
        address: "Agencia más cercana",
        hours: "lun a sáb, 9:00 a 18:00",
      },
      international: quote.international,
      intlCourier: logistics.international.courier,
      intlTrackingCode: quote.international ? `DHL-${digits(10, random)}` : "",
      payoutAccount: workshop?.payoutAccount ?? "cuenta registrada",
      artisanPhoneMasked: workshop?.whatsappMasked ?? "+51 9•• ••• •••",
      ...(customDays ? { custom: true } : {}),
      events: [{ type: "created", at, dispatchBy: dispatchBy.toISOString() }],
    };
  });

  const products = sumBreakdowns(parcels.flatMap((p) => p.lines.map((l) => l.breakdown)));
  const shipping = quote.total;

  return {
    id,
    createdAt: at,
    customer: input.customer,
    international: quote.international,
    currency: input.currency ?? (quote.international ? "USD" : "PEN"),
    payment: input.payment,
    parcels,
    totals: {
      products: products.total,
      artisan: products.artisan,
      commission: products.commission,
      igv: products.igv,
      shipping,
      total: Math.round((products.total + shipping) * 100) / 100,
    },
  };
}

/* ---------- Estado ---------- */

const statusByEvent: Record<ParcelEventType, ParcelStatus> = {
  created: "awaiting_artisan",
  asked_days: "awaiting_artisan",
  confirmed: "preparing",
  extended: "preparing",
  packed: "preparing",
  no_stock: "cancelled",
  photo: "preparing", // no se usa: es informativo (ver statusEvent)
  ready: "ready",
  picked_up: "in_transit",
  at_hub: "at_hub",
  intl_shipped: "intl_transit",
  out_for_delivery: "out_for_delivery",
  delivered: "delivered",
  paid_out: "delivered",
  payout_confirmed: "delivered",
  thanks: "delivered", // informativos (ver INFO_EVENTS)
  thanks_reply: "delivered",
  delay_detected: "delayed",
  delay_reason: "delayed",
  delay_accepted: "preparing",
  delay_cancelled: "cancelled",
  delay_abandoned: "cancelled",
  courier_delay: "in_transit", // no se usa: es informativo (ver statusEvent)
};

/** Eventos que solo informan y no cambian el estado del envío. */
const INFO_EVENTS = new Set<ParcelEventType>(["courier_delay", "photo", "thanks", "thanks_reply"]);

export function lastEvent(parcel: Parcel): ParcelEvent {
  return parcel.events[parcel.events.length - 1];
}

/** Último evento que define el estado (ignora avisos como el retraso del courier). */
export function statusEvent(parcel: Parcel): ParcelEvent {
  for (let i = parcel.events.length - 1; i >= 0; i--) {
    if (!INFO_EVENTS.has(parcel.events[i].type)) return parcel.events[i];
  }
  return parcel.events[0];
}

export function parcelStatus(parcel: Parcel): ParcelStatus {
  return statusByEvent[statusEvent(parcel).type];
}

export function hasEvent(parcel: Parcel, type: ParcelEventType): boolean {
  return parcel.events.some((e) => e.type === type);
}

export function parcelTotal(parcel: Parcel): number {
  return parcel.lines.reduce((n, l) => n + l.breakdown.total, 0) + parcel.shipping;
}

export function parcelArtisanAmount(parcel: Parcel): number {
  return sumBreakdowns(parcel.lines.map((l) => l.breakdown)).artisan;
}

/* ---------- Fotos del taller ---------- */

/**
 * Qué foto toca mandar ahora. A medida: un avance mientras la elabora y la pieza terminada.
 * Catálogo: la pieza real antes de empacarla (la que recibirá el comprador, no la del catálogo).
 */
export function nextPhotoStage(parcel: Parcel): PhotoStage | null {
  const stages: PhotoStage[] = parcel.custom ? ["progress", "finished"] : ["finished"];
  const sent = parcel.events.filter((e) => e.type === "photo").length;
  return stages[sent] ?? null;
}

/** Imagen simulada de cada foto: el artesano en su taller o la pieza terminada. */
export function photoSrc(parcel: Parcel, stage: PhotoStage): string {
  return stage === "progress" ? `/images/artisans/${parcel.workshopId}.jpg` : parcel.lines[0].image;
}

export function parcelPhotos(parcel: Parcel): Extract<ParcelEvent, { type: "photo" }>[] {
  return parcel.events.filter((e): e is Extract<ParcelEvent, { type: "photo" }> => e.type === "photo");
}

/* ---------- Respuestas del artesano (WhatsApp) ---------- */

/** Qué puede responder el artesano en este momento. */
export function availableReplies(parcel: Parcel): ArtisanReply[] {
  const status = parcelStatus(parcel);
  const last = statusEvent(parcel).type;
  if (status === "awaiting_artisan") {
    if (last === "asked_days") return ["days_2", "days_5"];
    // Una pieza a medida ya se acordó: no hay "sin stock", solo empezarla o pedir más días.
    return parcel.custom ? ["confirm", "more_days"] : ["confirm", "no_stock", "more_days"];
  }
  if (status === "delayed") return last === "delay_detected" ? ["delay_sick", "delay_material", "delay_cannot"] : [];
  if (status === "delivered") {
    const replies: ArtisanReply[] = last === "paid_out" ? ["payout_received"] : [];
    if (hasEvent(parcel, "thanks") && !hasEvent(parcel, "thanks_reply")) replies.push("thanks_reply");
    return replies;
  }
  if (status === "preparing") {
    if (last === "packed") return ["handover_agency", "handover_pickup"];
    return nextPhotoStage(parcel) ? ["send_photo", "ready"] : ["ready"];
  }
  return [];
}

/** El retraso está esperando que el comprador elija: nueva fecha o cancelación. */
export function awaitingBuyerDecision(parcel: Parcel): Extract<ParcelEvent, { type: "delay_reason" }> | null {
  const last = statusEvent(parcel);
  return last.type === "delay_reason" ? last : null;
}

/** Cómo entregó (o entregará) el artesano el paquete, si ya lo decidió. */
export function handoverOf(parcel: Parcel): Handover | null {
  const ready = parcel.events.find((e) => e.type === "ready");
  return ready && ready.type === "ready" ? ready.handover : null;
}

function updateParcel(order: Order, parcelId: string, fn: (p: Parcel) => Parcel): Order {
  return { ...order, parcels: order.parcels.map((p) => (p.id === parcelId ? fn(p) : p)) };
}

function withReady(p: Parcel, handover: Handover, now: Date): Parcel {
  const pickupOn = addBusinessDays(now, 1).toISOString();
  return { ...p, events: [...p.events, { type: "ready", at: now.toISOString(), handover, pickupOn }] };
}

export function applyArtisanReply(order: Order, parcelId: string, reply: ArtisanReply, now = new Date()): Order {
  const at = now.toISOString();
  return updateParcel(order, parcelId, (p) => {
    if (!availableReplies(p).includes(reply)) return p;
    switch (reply) {
      case "confirm":
        return { ...p, events: [...p.events, { type: "confirmed", at }] };
      case "no_stock":
        return { ...p, events: [...p.events, { type: "no_stock", at }] };
      case "more_days":
        return { ...p, events: [...p.events, { type: "asked_days", at }] };
      case "days_2":
      case "days_5": {
        const days = reply === "days_2" ? 2 : 5;
        const dispatchBy = addBusinessDays(new Date(p.dispatchBy), days);
        return {
          ...p,
          dispatchBy: dispatchBy.toISOString(),
          deliveryBy: addBusinessDays(dispatchBy, p.transitDays).toISOString(),
          events: [...p.events, { type: "extended", at, days, dispatchBy: dispatchBy.toISOString() }],
        };
      }
      case "send_photo": {
        const stage = nextPhotoStage(p);
        if (!stage) return p;
        return { ...p, events: [...p.events, { type: "photo", at, stage, src: photoSrc(p, stage) }] };
      }
      case "ready":
        // Con recojo disponible se le pregunta cómo prefiere entregarlo; si no, va a la agencia.
        if (p.pickupAvailable) return { ...p, events: [...p.events, { type: "packed", at }] };
        return withReady(p, "agency", now);
      case "handover_agency":
        return withReady(p, "agency", now);
      case "handover_pickup":
        return withReady(p, "pickup", now);
      case "thanks_reply":
        return { ...p, events: [...p.events, { type: "thanks_reply", at }] };
      case "payout_received":
        return { ...p, events: [...p.events, { type: "payout_confirmed", at }] };
      case "delay_sick":
      case "delay_material": {
        const days = reply === "delay_sick" ? 3 : 5;
        const newDispatch = addBusinessDays(now, days);
        const event: ParcelEvent = {
          type: "delay_reason",
          at,
          reason: reply === "delay_sick" ? "sick" : "material",
          days,
          newDispatch: newDispatch.toISOString(),
          newDelivery: addBusinessDays(newDispatch, p.transitDays).toISOString(),
        };
        return { ...p, events: [...p.events, event] };
      }
      case "delay_cannot":
        return { ...p, events: [...p.events, { type: "delay_abandoned", at }] };
    }
  });
}

/** El comprador decide ante el retraso: aceptar la nueva fecha o cancelar con reembolso. */
export function applyBuyerDelayDecision(order: Order, parcelId: string, accept: boolean, now = new Date()): Order {
  const at = now.toISOString();
  return updateParcel(order, parcelId, (p) => {
    const proposal = awaitingBuyerDecision(p);
    if (!proposal) return p;
    if (!accept) return { ...p, events: [...p.events, { type: "delay_cancelled", at }] };
    return {
      ...p,
      dispatchBy: proposal.newDispatch,
      deliveryBy: proposal.newDelivery,
      events: [...p.events, { type: "delay_accepted", at }],
    };
  });
}

/* ---------- Mensaje del comprador al artesano ---------- */

export interface ThanksInput {
  message: string;
  photo?: string;
  publicOk: boolean;
  translation?: { text: string; from: string } | null;
}

/** Se puede dejar un mensaje una vez, cuando la pieza ya fue entregada. */
export function canThank(parcel: Parcel): boolean {
  return hasEvent(parcel, "delivered") && parcelStatus(parcel) === "delivered" && !hasEvent(parcel, "thanks");
}

export function applyBuyerThanks(order: Order, parcelId: string, input: ThanksInput, now = new Date()): Order {
  const message = input.message.trim().slice(0, 450);
  if (!message) return order;
  return updateParcel(order, parcelId, (p) =>
    canThank(p)
      ? {
          ...p,
          events: [
            ...p.events,
            {
              type: "thanks",
              at: now.toISOString(),
              message,
              publicOk: input.publicOk,
              ...(input.photo ? { photo: input.photo } : {}),
              ...(input.translation ? { translation: input.translation } : {}),
            },
          ],
        }
      : p,
  );
}

/* ---------- Incidencias (simuladas desde el panel de demostración) ---------- */

export type Incident = "artisan_delay" | "courier_delay";

/** Qué incidencia se puede simular ahora (una de cada tipo por envío). */
export function nextIncident(parcel: Parcel): Incident | null {
  const status = parcelStatus(parcel);
  if (status === "preparing" && statusEvent(parcel).type !== "packed" && !hasEvent(parcel, "delay_detected")) {
    return "artisan_delay";
  }
  if ((status === "in_transit" || status === "at_hub" || status === "intl_transit") && !hasEvent(parcel, "courier_delay")) {
    return "courier_delay";
  }
  return null;
}

export function simulateIncident(order: Order, parcelId: string, now = new Date()): Order {
  const at = now.toISOString();
  return updateParcel(order, parcelId, (p) => {
    const incident = nextIncident(p);
    if (incident === "artisan_delay") {
      return { ...p, events: [...p.events, { type: "delay_detected", at, dueBy: p.dispatchBy }] };
    }
    if (incident === "courier_delay") {
      const days = 3;
      return {
        ...p,
        deliveryBy: addBusinessDays(new Date(p.deliveryBy), days).toISOString(),
        events: [...p.events, { type: "courier_delay", at, days }],
      };
    }
    return p;
  });
}

/* ---------- Courier (simulado desde el panel de demostración) ---------- */

/** Pasos que se simulan desde el panel de demo: courier y, al final, la transferencia al artesano. */
export type CourierStep = "picked_up" | "at_hub" | "intl_shipped" | "out_for_delivery" | "delivered" | "paid_out";

export function nextCourierStep(parcel: Parcel): CourierStep | null {
  switch (parcelStatus(parcel)) {
    case "ready":
      return "picked_up";
    case "in_transit":
      return parcel.international ? "at_hub" : "out_for_delivery";
    case "at_hub":
      return "intl_shipped";
    case "intl_transit":
      return "out_for_delivery";
    case "out_for_delivery":
      return "delivered";
    case "delivered":
      return hasEvent(parcel, "paid_out") ? null : "paid_out";
    default:
      return null;
  }
}

export function advanceCourier(order: Order, parcelId: string, now = new Date()): Order {
  const at = now.toISOString();
  return updateParcel(order, parcelId, (p) => {
    const step = nextCourierStep(p);
    if (!step) return p;
    const event: ParcelEvent =
      step === "delivered"
        ? { type: step, at, payoutOn: payoutDate(now).toISOString() }
        : step === "paid_out"
          ? { type: step, at, operation: digits(8, Math.random) }
          : { type: step, at };
    return { ...p, events: [...p.events, event] };
  });
}
