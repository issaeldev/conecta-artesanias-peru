import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchCatalog, type CatalogData } from "@/services/catalogApi";
import type { Product } from "@/types/domain";

type Status = "loading" | "ready" | "error";

interface CatalogValue extends CatalogData {
  status: Status;
  getProduct: (id: string) => Product | undefined;
}

const empty: CatalogData = { products: [], regions: [], workshops: [] };
const CatalogContext = createContext<CatalogValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CatalogData>(empty);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let active = true;
    fetchCatalog()
      .then((res) => {
        if (!active) return;
        setData(res);
        setStatus("ready");
      })
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<CatalogValue>(() => {
    const byId = new Map(data.products.map((p) => [p.id, p]));
    return { ...data, status, getProduct: (id) => byId.get(id) };
  }, [data, status]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog debe usarse dentro de <CatalogProvider>");
  return ctx;
}
