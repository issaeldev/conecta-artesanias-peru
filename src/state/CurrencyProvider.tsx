import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { formatMoney } from "@/lib/money";
import type { ExchangeRate } from "@/lib/bcrp";
import type { Currency } from "@/types/domain";
import { useI18n } from "@/i18n/I18nProvider";

interface CurrencyValue {
  currency: Currency;
  toggleCurrency: () => void;
  /** Formatea un monto en soles en la moneda activa. */
  format: (amountPen: number) => string;
  /** Soles por dólar en uso: el del BCRP si se pudo obtener, si no el de respaldo. */
  rate: number;
  /** Día del dato del BCRP (ISO); null = se usa el tipo de cambio de respaldo. */
  rateDate: string | null;
}

const CurrencyContext = createContext<CurrencyValue | null>(null);
const CACHE_KEY = "cap-fx";

/** Último tipo de cambio guardado, para no esperar la red en cada visita del mismo día. */
function cachedRate(): ExchangeRate | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const saved = raw ? (JSON.parse(raw) as ExchangeRate & { fetchedOn: string }) : null;
    return saved && saved.fetchedOn === new Date().toDateString() ? saved : null;
  } catch {
    return null;
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  const localeCurrency: Currency = locale === "en" ? "USD" : "PEN";
  const [currency, setCurrency] = useState<Currency>(localeCurrency);
  const [live, setLive] = useState<ExchangeRate | null>(cachedRate);
  useEffect(() => setCurrency(localeCurrency), [localeCurrency]);
  const toggleCurrency = useCallback(() => setCurrency((c) => (c === "PEN" ? "USD" : "PEN")), []);

  // Tipo de cambio del día (BCRP vía /api/tipo-cambio). Si falla, se queda el de respaldo.
  useEffect(() => {
    if (live) return;
    let cancelled = false;
    fetch("/api/tipo-cambio")
      .then((r) => (r.ok ? (r.json() as Promise<ExchangeRate>) : null))
      .then((data) => {
        if (cancelled || !data || !(data.penPerUsd > 0)) return;
        setLive(data);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, fetchedOn: new Date().toDateString() }));
        } catch {
          /* sin localStorage */
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [live]);

  const rate = live?.penPerUsd ?? siteConfig.penPerUsd;
  const value = useMemo<CurrencyValue>(
    () => ({
      currency,
      toggleCurrency,
      format: (amount) => formatMoney(amount, currency, rate),
      rate,
      rateDate: live?.date ?? null,
    }),
    [currency, toggleCurrency, rate, live],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency debe usarse dentro de <CurrencyProvider>");
  return ctx;
}
