import type { Currency } from "@/types/domain";

/** Convierte soles a dólares con el tipo de cambio supuesto (redondeado). */
export function penToUsd(amountPen: number, penPerUsd: number): number {
  return Math.round(amountPen / penPerUsd);
}

/** Formatea un precio en soles en la moneda elegida, igual que el prototipo: "S/ 320" o "US$ 91". */
export function formatMoney(amountPen: number, currency: Currency, penPerUsd: number): string {
  return currency === "PEN" ? `S/ ${amountPen}` : `US$ ${penToUsd(amountPen, penPerUsd)}`;
}
