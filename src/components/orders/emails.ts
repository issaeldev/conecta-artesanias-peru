import type { Order, Parcel, ParcelEvent } from "@/types/order";

export type EmailKind =
  | "confirmation"
  | "confirmed"
  | "extended"
  | "shipped"
  | "shipped_intl"
  | "delivered"
  | "payout"
  | "delay"
  | "delay_cancelled"
  | "courier_delay"
  | "cancelled";

export interface SimEmail {
  id: string;
  kind: EmailKind;
  at: string;
  parcel?: Parcel;
}

/** Qué correo dispara cada evento. En internacional, "en camino" se avisa cuando sale del Perú. */
function kindFor(parcel: Parcel, e: ParcelEvent): EmailKind | null {
  switch (e.type) {
    case "confirmed":
      return "confirmed";
    case "extended":
      return "extended";
    case "no_stock":
      return "cancelled";
    case "picked_up":
      return parcel.international ? null : "shipped";
    case "intl_shipped":
      return "shipped_intl";
    case "delivered":
      return "delivered";
    case "payout_confirmed":
      return "payout";
    case "delay_reason":
      return "delay";
    case "delay_cancelled":
    case "delay_abandoned":
      return "delay_cancelled";
    case "courier_delay":
      return "courier_delay";
    default:
      return null;
  }
}

/** Correos que el comprador habría recibido, del más reciente al más antiguo. */
export function orderEmails(order: Order): SimEmail[] {
  const list: SimEmail[] = [{ id: `${order.id}-confirmation`, kind: "confirmation", at: order.createdAt }];
  for (const parcel of order.parcels) {
    parcel.events.forEach((e, i) => {
      const kind = kindFor(parcel, e);
      if (kind) list.push({ id: `${parcel.id}-${i}`, kind, at: e.at, parcel });
    });
  }
  return list.sort((a, b) => b.at.localeCompare(a.at) || b.id.localeCompare(a.id));
}
