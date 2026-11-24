/**
 * Tipo de cambio oficial del BCRP (Banco Central de Reserva del Perú).
 * Serie PD04640PD: TC sistema bancario SBS, venta (soles por dólar), publicada cada día hábil.
 * Sin dependencias para poder usarlo tanto en la app como en la función de Vercel (api/).
 */
export const BCRP_SERIES = "PD04640PD";

export interface ExchangeRate {
  /** Soles por dólar. */
  penPerUsd: number;
  /** Día del dato (ISO, AAAA-MM-DD). */
  date: string;
  source: "BCRP";
}

interface BcrpResponse {
  periods?: { name: string; values: string[] }[];
}

const MONTHS: Record<string, string> = {
  Ene: "01", Jan: "01", Feb: "02", Mar: "03", Abr: "04", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Ago: "08", Aug: "08", Set: "09", Sep: "09", Oct: "10", Nov: "11", Dic: "12", Dec: "12",
};

/** "23.Nov.26" → "2026-11-23". */
export function parseBcrpDay(name: string): string | null {
  const m = /^(\d{1,2})\.(\w{3})\.(\d{2})$/.exec(name.trim());
  const month = m && MONTHS[m[2]];
  return m && month ? `20${m[3]}-${month}-${m[1].padStart(2, "0")}` : null;
}

/** El último día con dato (el de hoy suele venir como "n.d." hasta la tarde). */
export function parseBcrpRate(data: BcrpResponse): ExchangeRate | null {
  const periods = data.periods ?? [];
  for (let i = periods.length - 1; i >= 0; i--) {
    const value = Number(periods[i].values?.[0]);
    const date = parseBcrpDay(periods[i].name);
    if (Number.isFinite(value) && value > 0 && date) return { penPerUsd: value, date, source: "BCRP" };
  }
  return null;
}

/**
 * La API a veces agrega avisos de PHP en HTML después del JSON ("}<br />…"):
 * se corta en la primera etiqueta antes de interpretarlo.
 */
export function parseBcrpText(text: string): ExchangeRate | null {
  const json = text.split("<")[0].trim();
  try {
    return parseBcrpRate(JSON.parse(json) as BcrpResponse);
  } catch {
    return null;
  }
}

/** URL de la API con una ventana de 15 días (cubre feriados largos). */
export function bcrpUrl(today = new Date()): string {
  const from = new Date(today);
  from.setDate(from.getDate() - 15);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return `https://estadisticas.bcrp.gob.pe/estadisticas/series/api/${BCRP_SERIES}/json/${iso(from)}/${iso(today)}`;
}
