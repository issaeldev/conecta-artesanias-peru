import type { Order, Parcel, PhotoStage } from "@/types/order";
import { findCountry } from "@/data/countries";
import { addBusinessDays, hasEvent, parcelArtisanAmount, parcelPhotos } from "./orders";

/**
 * "Pasaporte de la pieza": certificado de autenticidad que se emite al entregar un envío.
 *
 * Todo lo necesario viaja DENTRO del enlace (codificado en el hash), así el QR funciona en
 * cualquier celular aunque no haya backend: quien lo escanee ve el mismo certificado.
 * Los datos fijos (pieza, taller, técnica) se completan desde el catálogo por su id.
 */
export interface PassportData {
  v: 1;
  /** N.° de serie: el id del envío (p. ej. CAP-12345-1). */
  serial: string;
  workshopId: string;
  productIds: string[];
  /** Detalles acordados si fue a medida. */
  custom?: string;
  /** Días hábiles de elaboración (solo a medida). */
  workDays?: number;
  buyer: string;
  /** Ciudad y país de destino. */
  destination: string;
  deliveredAt: string;
  photos: { stage: PhotoStage; src: string; at: string }[];
  /** Pago al artesano (soles), si ya se transfirió. */
  payout?: { amount: number; at: string; operation: string; confirmedAt?: string };
}

export function canIssuePassport(parcel: Parcel): boolean {
  return hasEvent(parcel, "delivered");
}

export function buildPassport(order: Order, parcel: Parcel): PassportData | null {
  const delivered = parcel.events.find((e) => e.type === "delivered");
  if (!delivered) return null;
  const created = parcel.events.find((e) => e.type === "created");
  const paidOut = parcel.events.find((e) => e.type === "paid_out");
  const confirmed = parcel.events.find((e) => e.type === "payout_confirmed");
  const country = findCountry(order.customer.country)?.name.es ?? order.customer.country;
  const city = order.customer.city || order.customer.department;
  const customLine = parcel.lines.find((l) => l.custom);
  const workDays =
    parcel.custom && created?.type === "created" && created.dispatchBy
      ? businessDaysBetween(new Date(created.at), new Date(created.dispatchBy))
      : undefined;

  return {
    v: 1,
    serial: parcel.id,
    workshopId: parcel.workshopId,
    productIds: parcel.lines.map((l) => l.productId),
    ...(customLine?.custom ? { custom: customLine.custom.details } : {}),
    ...(workDays ? { workDays } : {}),
    buyer: order.customer.name.trim().split(/\s+/)[0] || "",
    destination: order.international ? `${city}, ${country}` : city,
    deliveredAt: delivered.at,
    photos: parcelPhotos(parcel).map((p) => ({ stage: p.stage, src: p.src, at: p.at })),
    ...(paidOut?.type === "paid_out"
      ? {
          payout: {
            amount: parcelArtisanAmount(parcel),
            at: paidOut.at,
            // Solo los últimos 4 dígitos: el certificado es público.
            operation: `••••${paidOut.operation.slice(-4)}`,
            ...(confirmed ? { confirmedAt: confirmed.at } : {}),
          },
        }
      : {}),
  };
}

function businessDaysBetween(from: Date, to: Date): number {
  let n = 0;
  while (addBusinessDays(from, n + 1) <= to) n++;
  return n;
}

/* ---------- Enlace (base64url de JSON, seguro con tildes) ---------- */

export function encodePassport(data: PassportData): string {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodePassport(code: string): PassportData | null {
  try {
    const bin = atob(code.replace(/-/g, "+").replace(/_/g, "/"));
    const data = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))) as PassportData;
    return data?.v === 1 && typeof data.serial === "string" && Array.isArray(data.productIds) ? data : null;
  } catch {
    return null;
  }
}

/** Enlace absoluto al pasaporte (lo que codifica el QR). */
export function passportUrl(data: PassportData, base = `${window.location.origin}${window.location.pathname}`): string {
  return `${base}#/pasaporte/${encodePassport(data)}`;
}
