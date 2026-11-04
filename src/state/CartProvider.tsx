import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/** productId → cantidad */
export type CartItems = Record<string, number>;

interface CartValue {
  items: CartItems;
  count: number;
  isOpen: boolean;
  add: (productId: string, quantity: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

const STORAGE_KEY = "cap-cart";
const CartContext = createContext<CartValue | null>(null);

function loadCart(): CartItems {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === "object") {
      return Object.fromEntries(
        Object.entries(parsed).filter(([, q]) => typeof q === "number" && q > 0),
      ) as CartItems;
    }
  } catch {
    /* carrito corrupto o storage no disponible */
  }
  return {};
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItems>(loadCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignorar */
    }
  }, [items]);

  const add = useCallback((id: string, quantity: number) => {
    setItems((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + quantity }));
  }, []);

  const increment = useCallback((id: string) => add(id, 1), [add]);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const decrement = useCallback((id: string) => {
    setItems((prev) => {
      const q = (prev[id] ?? 0) - 1;
      const next = { ...prev };
      if (q < 1) delete next[id];
      else next[id] = q;
      return next;
    });
  }, []);

  const clear = useCallback(() => setItems({}), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartValue>(
    () => ({
      items,
      count: Object.values(items).reduce((n, q) => n + q, 0),
      isOpen,
      add,
      increment,
      decrement,
      remove,
      clear,
      open,
      close,
    }),
    [items, isOpen, add, increment, decrement, remove, clear, open, close],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
