import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { formatMoney } from "@/lib/money";
import type { Currency } from "@/types/domain";

interface CurrencyValue {
  currency: Currency;
  toggleCurrency: () => void;
  /** Formatea un monto en soles en la moneda activa. */
  format: (amountPen: number) => string;
}

const CurrencyContext = createContext<CurrencyValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("PEN");
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
