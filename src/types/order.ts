import type { Currency, Localized } from "./domain";

export type PaymentMethod = "card" | "yape";

export interface Customer {
  name: string;
  email: string;
  phone: string;
  /** Código ISO del país ("PE" = envío nacional). */
  country: string;
  /** Departamento en Perú; estado o provincia en el extranjero. */
  department: string;
  postalCode: string;
  city: string;
  address: string;
  reference: string;
}

/** Cómo se reparte un monto pagado (en soles, con céntimos). */
export interface PriceBreakdown {
  artisan: number;
  commission: number;
  igv: number;
  total: number;
}

export interface OrderLine {
  productId: string;
  name: Localized;
  image: string;
  quantity: number;
  unitPrice: number;
  /** Reparto del total de la línea (precio × cantidad). */
  breakdown: PriceBreakdown;
  /** Solo piezas a medida: lo acordado con el artesano (tamaño, colores, detalles). */
  custom?: { requestId: string; details: string };
}

/** Lo que va pasando con un envío. El estado se deriva del último evento. */
export type ParcelEvent =
  | { type: "created"; at: string; dispatchBy?: string }
  | { type: "confirmed"; at: string }
  | { type: "asked_days"; at: string }
  | { type: "extended"; at: string; days: number; dispatchBy?: string }
  | { type: "no_stock"; at: string }
  /** Dijo LISTO y se le pregunta cómo entregará el paquete (solo si su zona tiene recojo). */
  | { type: "packed"; at: string }
  /** pickupOn: día del recojo en el taller o fecha límite para dejarlo en la agencia. */
  | { type: "ready"; at: string; handover: Handover; pickupOn: string }
  | { type: "picked_up"; at: string }
  /** Solo internacional: llegó al centro de Lima (revisión y consolidación) y salió del país. */
  | { type: "at_hub"; at: string }
  | { type: "intl_shipped"; at: string }
  | { type: "out_for_delivery"; at: string }
  | { type: "delivered"; at: string; payoutOn: string }
  /** Transparencia: transferencia al artesano y su confirmación de que la recibió. */
  | { type: "paid_out"; at: string; operation: string }
  | { type: "payout_confirmed"; at: string }
  /**
   * Retraso del artesano (procedimiento de incidencias): se detecta que venció la fecha
   * límite, el artesano explica y propone fecha, y el comprador acepta o cancela.
   */
  | { type: "delay_detected"; at: string; dueBy: string }
  | { type: "delay_reason"; at: string; reason: DelayReason; days: number; newDispatch: string; newDelivery: string }
  | { type: "delay_accepted"; at: string }
  | { type: "delay_cancelled"; at: string }
  | { type: "delay_abandoned"; at: string }
  /** Retraso del courier: solo informa; lo gestiona Conecta y no cambia el estado. */
  | { type: "courier_delay"; at: string; days: number };

export type DelayReason = "sick" | "material";

export type ParcelEventType = ParcelEvent["type"];

/** Cómo entrega el artesano el paquete al courier. */
export type Handover = "agency" | "pickup";

export type ParcelStatus =
  | "awaiting_artisan"
  | "preparing"
  | "ready"
  | "in_transit"
  | "at_hub"
  | "intl_transit"
  | "delayed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

/** Respuestas que el artesano puede dar por WhatsApp. */
export type ArtisanReply =
  | "confirm"
  | "no_stock"
  | "more_days"
  | "days_2"
  | "days_5"
  | "ready"
  | "handover_agency"
  | "handover_pickup"
  | "payout_received"
  | "delay_sick"
  | "delay_material"
  | "delay_cannot";

/** Agencia del courier más cercana al taller (datos simulados). */
export interface DropOffPoint {
  name: string;
  address: string;
  hours: string;
}

/** Parte del pedido que prepara y despacha un mismo taller. */
export interface Parcel {
  id: string;
  workshopId: string;
  artisanFirstName: string;
  artisanFullName: string;
  regionName: string;
  community: string;
  lines: OrderLine[];
  shipping: number;
  transitDays: number;
  /** Fecha límite de despacho (ISO). Se mueve si el artesano pide más días. */
  dispatchBy: string;
  /** Entrega estimada (ISO). */
  deliveryBy: string;
  courier: string;
  trackingCode: string;
  /** Si el courier recoge en esa zona; si no, el artesano lo lleva a la agencia. */
  pickupAvailable: boolean;
  dropOff: DropOffPoint;
  /** Internacional: el paquete va al centro de Lima y sale consolidado con el resto del pedido. */
  international: boolean;
  intlCourier: string;
  intlTrackingCode: string;
  /** Pieza a medida: el artesano la elabora, por eso su plazo de despacho es el cotizado. */
  custom?: boolean;
  /** WhatsApp del artesano, enmascarado (p. ej. "+51 9•• ••• 391"). */
  artisanPhoneMasked: string;
  /** Cuenta del artesano, enmascarada (p. ej. "BCP ****1907"). */
  payoutAccount: string;
  events: ParcelEvent[];
}

export interface OrderTotals {
  products: number;
  artisan: number;
  commission: number;
  igv: number;
  shipping: number;
  total: number;
}

export interface Order {
  id: string;
  createdAt: string;
  customer: Customer;
  international: boolean;
  /** Moneda en que se muestra y cobra el pedido: soles en Perú, dólares en el extranjero. */
  currency: Currency;
  payment: { method: PaymentMethod; detail: string };
  parcels: Parcel[];
  totals: OrderTotals;
}
