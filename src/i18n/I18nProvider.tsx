import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Locale } from "@/types/domain";
import { en } from "./en";
import { es, type Dictionary } from "./es";

const dictionaries: Record<Locale, Dictionary> = { es, en };
const STORAGE_KEY = "lg";

interface I18nValue {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nValue | null>(null);

/** Idioma inicial: el guardado por el usuario o, si no hay, el del navegador. */
function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "es" || saved === "en") return saved;
  } catch {
    /* localStorage no disponible */
  }
  return (navigator.language || "es").slice(0, 2) === "en" ? "en" : "es";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(detectLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignorar */
    }
  }, [locale]);

  const toggleLocale = useCallback(() => setLocale((l) => (l === "es" ? "en" : "es")), []);

  const value = useMemo(
    () => ({ locale, t: dictionaries[locale], setLocale, toggleLocale }),
    [locale, toggleLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n debe usarse dentro de <I18nProvider>");
  return ctx;
}
