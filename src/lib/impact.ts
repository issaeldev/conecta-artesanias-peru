import { impactBaseline, sampleTestimonials, type Testimonial } from "@/data/impact";
import type { Workshop } from "@/types/domain";
import type { Order } from "@/types/order";
import { hasEvent, parcelArtisanAmount } from "./orders";

export interface Impact {
  /** Soles transferidos a artesanos (base + pagos hechos en esta demo). */
  transferredPen: number;
  /** De esos, cuánto se sumó en esta demo. */
  liveTransferredPen: number;
  deliveredOrders: number;
  artisans: number;
  communities: number;
  countries: number;
}

/**
 * Contador de impacto. Se calcula con los mismos eventos del seguimiento: un pago cuenta
 * recién cuando hay "paid_out" (transferido al artesano), no al cobrarle al comprador.
 */
export function computeImpact(orders: Order[], workshops: Workshop[]): Impact {
  const parcels = orders.flatMap((o) => o.parcels);
  const live = parcels.filter((p) => hasEvent(p, "paid_out")).reduce((n, p) => n + parcelArtisanAmount(p), 0);
  const delivered = orders.filter((o) => o.parcels.some((p) => hasEvent(p, "delivered"))).length;
  const liveCountries = new Set(
    orders.filter((o) => o.parcels.some((p) => hasEvent(p, "delivered"))).map((o) => o.customer.country),
  );
  liveCountries.delete("PE");
  return {
    transferredPen: Math.round((impactBaseline.transferredPen + live) * 100) / 100,
    liveTransferredPen: Math.round(live * 100) / 100,
    deliveredOrders: impactBaseline.deliveredOrders + delivered,
    artisans: workshops.length,
    communities: new Set(workshops.map((w) => w.community.es.split(",")[0])).size,
    countries: impactBaseline.countries,
  };
}

export interface LiveTestimonial extends Omit<Testimonial, "place" | "message"> {
  place: string;
  message: string;
  /** true = lo escribió alguien en esta demo (no es de ejemplo). */
  live: boolean;
}

/** Mensajes que los compradores autorizaron mostrar, del más reciente al más antiguo. */
export function liveTestimonials(orders: Order[]): LiveTestimonial[] {
  const list: (LiveTestimonial & { at: string })[] = [];
  for (const o of orders) {
    for (const p of o.parcels) {
      const thanks = p.events.find((e) => e.type === "thanks");
      if (thanks?.type !== "thanks" || !thanks.publicOk) continue;
      list.push({
        id: `${p.id}-thanks`,
        workshopId: p.workshopId,
        buyer: o.customer.name.trim().split(/\s+/)[0] || "—",
        place: o.customer.city || o.customer.department,
        message: thanks.message,
        ...(thanks.photo ? { photo: thanks.photo } : {}),
        live: true,
        at: thanks.at,
      });
    }
  }
  return list.sort((a, b) => b.at.localeCompare(a.at)).map(({ at: _at, ...t }) => t);
}

export { sampleTestimonials };
