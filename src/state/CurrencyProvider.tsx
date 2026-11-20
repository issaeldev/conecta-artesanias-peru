import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { formatMoney } from "@/lib/money";
import type { Currency } from "@/types/domain";
import { useI18n } from "@/i18n/I18nProvider";

interface CurrencyValue {
  currency: Currency;
  toggleCurrency: () => void;
  /** Formatea un monto en soles en la moneda activa. */
  format: (amountPen: number) => string;
}

const CurrencyContext = createContext<CurrencyValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  const localeCurrency: Currency = locale === "en" ? "USD" : "PEN";
  const [currency, setCurrency] = useState<Currency>(localeCurrency);
  useEffect(() => setCurrency(localeCurrency), [localeCurrency]);
  const toggleCurrency = useCallback(() => setCurrency((c) => (c === "PEN" ? "USD" : "PEN")), []);

  const value = useMemo<CurrencyValue>(
    () => ({
      currency,
      toggleCurrency,
      format: (amount) => formatMoney(amount, currency, siteConfig.penPerUsd),
    }),
    [currency, toggleCurrency],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency debe usarse dentro de <CurrencyProvider>");
  return ctx;
}
