import type { PriceBreakdown } from "@/types/order";

export interface PricingRules {
  commissionRate: number;
  igvRate: number;
  igvBase: "commission" | "all";
}

const cents = (n: number) => Math.round(n * 100) / 100;

/**
 * Reparte un precio final (IGV incluido) entre artesano, comisión e IGV.
 * El precio de catálogo = precio del artesano + comisión + IGV, así que se calcula hacia atrás.
 * El IGV absorbe el redondeo para que las tres partes sumen exactamente el total.
 */
export function splitPrice(total: number, rules: PricingRules): PriceBreakdown {
  const { commissionRate: r, igvRate: g, igvBase } = rules;
  const divisor = igvBase === "commission" ? 1 + r * (1 + g) : (1 + r) * (1 + g);
  const artisan = cents(total / divisor);
  const commission = cents(artisan * r);
  const igv = cents(total - artisan - commission);
  return { artisan, commission, igv, total: cents(total) };
}

/** Suma varios repartos. */
export function sumBreakdowns(parts: PriceBreakdown[]): PriceBreakdown {
  return parts.reduce<PriceBreakdown>(
    (acc, p) => ({
      artisan: cents(acc.artisan + p.artisan),
      commission: cents(acc.commission + p.commission),
      igv: cents(acc.igv + p.igv),
      total: cents(acc.total + p.total),
    }),
    { artisan: 0, commission: 0, igv: 0, total: 0 },
  );
}

const penFormatter = new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "S/ 1,271.88": soles con céntimos, para checkout, correos y liquidaciones. */
export function formatPen(amount: number): string {
  return `S/ ${penFormatter.format(amount)}`;
}

const usdFormatter = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Monto (guardado siempre en soles) en la moneda del pedido: "S/ 420.00" o "US$ 120.00".
 * Los compradores del extranjero ven y pagan en dólares; el artesano siempre cobra en soles.
 */
export function formatAmount(amountPen: number, currency: "PEN" | "USD", penPerUsd: number): string {
  return currency === "PEN" ? formatPen(amountPen) : `US$ ${usdFormatter.format(amountPen / penPerUsd)}`;
}

/**
 * Inverso de splitPrice: a partir de lo que pide el artesano, el precio final para el
 * comprador (con Servicio Conecta e IGV), redondeado a soles enteros como el catálogo.
 */
export function grossUp(artisanPrice: number, rules: PricingRules): number {
  const { commissionRate: r, igvRate: g, igvBase } = rules;
  const factor = igvBase === "commission" ? 1 + r * (1 + g) : (1 + r) * (1 + g);
  return Math.round(artisanPrice * factor);
}
