import type { Localized } from "./domain";

/** Pedido personalizado: solicitud → el artesano responde por WhatsApp → cotización → pago. */
export interface CustomRequest {
  id: string;
  createdAt: string;
  productId: string;
  productName: Localized;
  image: string;
  /** Precio de catálogo de la pieza original (soles). */
  basePrice: number;
  workshopId: string;
  artisanFirstName: string;
  artisanFullName: string;
  regionName: string;
  details: { size: string; colors: string; notes: string };
  quantity: number;
  customer: { name: string; email: string; country: string; department: string };
  events: RequestEvent[];
}

/** Respuesta del artesano a la contraoferta: aceptarla, punto medio o mantener su precio. */
export type CounterDecision = "accept" | "meet" | "keep";

export type RequestEvent =
  | { type: "created"; at: string }
  | { type: "can_do"; at: string }
  | { type: "cannot_do"; at: string }
  /** artisanPrice: lo que recibe el artesano por pieza; buyerPrice: precio final por pieza con Servicio Conecta e IGV. */
  | { type: "quoted"; at: string; artisanPrice: number; buyerPrice: number; days: number }
  /** Contraoferta del comprador (una sola ronda). artisanPrice: lo que recibiría el artesano con ese precio. */
  | { type: "counter"; at: string; buyerPrice: number; artisanPrice: number }
  /** Respuesta del artesano: es la cotización final, ya no se negocia más. */
  | { type: "counter_reply"; at: string; decision: CounterDecision; artisanPrice: number; buyerPrice: number; days: number }
  | { type: "accepted"; at: string; orderId: string }
  | { type: "declined"; at: string };

export type RequestStatus =
  | "awaiting_artisan"
  | "awaiting_quote"
  | "quoted"
  | "countered"
  | "accepted"
  | "rejected"
  | "declined";

/** Respuestas del artesano por WhatsApp: si puede hacerla, su cotización y su respuesta a la contraoferta. */
export type RequestReply =
  | "can_do"
  | "cannot_do"
  | "quote_0"
  | "quote_1"
  | "quote_2"
  | "counter_accept"
  | "counter_meet"
  | "counter_keep";
