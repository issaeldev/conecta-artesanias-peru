import { useCallback, useEffect, useRef, useState } from "react";

const supported = typeof window !== "undefined" && "IntersectionObserver" in window;

/**
 * Aparición suave al entrar en pantalla (clases `.rv` / `.rv.in`).
 * Devuelve un ref para el elemento y la clase que debe añadirse.
 */
export function useReveal<T extends Element>() {
  const [visible, setVisible] = useState(!supported);
  const observer = useRef<IntersectionObserver | null>(null);

  const ref = useCallback((el: T | null) => {
    observer.current?.disconnect();
    if (!el || !supported) return;
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.current?.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.current.observe(el);
  }, []);

  useEffect(() => () => observer.current?.disconnect(), []);

  return { ref, revealClass: supported ? (visible ? "rv in" : "rv") : "" };
}
