import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface ProductModalValue {
  productId: string | null;
  openProduct: (id: string) => void;
  closeProduct: () => void;
}

const ProductModalContext = createContext<ProductModalValue | null>(null);

/** Permite abrir la ficha de una pieza desde cualquier sección (catálogo, mapa, perfiles, quiz). */
export function ProductModalProvider({ children }: { children: ReactNode }) {
  const [productId, setProductId] = useState<string | null>(null);
  const openProduct = useCallback((id: string) => setProductId(id), []);
  const closeProduct = useCallback(() => setProductId(null), []);

  const value = useMemo(() => ({ productId, openProduct, closeProduct }), [productId, openProduct, closeProduct]);
  return <ProductModalContext.Provider value={value}>{children}</ProductModalContext.Provider>;
}

export function useProductModal(): ProductModalValue {
  const ctx = useContext(ProductModalContext);
  if (!ctx) throw new Error("useProductModal debe usarse dentro de <ProductModalProvider>");
  return ctx;
}
