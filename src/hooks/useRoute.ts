import { useEffect, useState } from "react";

/**
 * Enrutador mínimo por hash. Las rutas empiezan con "#/" para no chocar con las
 * anclas de la página principal (#catalogo, #faq…), que siguen funcionando igual.
 * El hash además evita configurar reescrituras de URL en Vercel.
 */
export type Route =
  | { name: "home" }
  | { name: "checkout"; requestId?: string }
  | { name: "order"; id: string }
  | { name: "customForm"; productId: string }
  | { name: "request"; id: string };

export function parseRoute(hash: string): Route {
  const customCheckout = /^#\/checkout\/solicitud\/([\w-]+)/.exec(hash);
  if (customCheckout) return { name: "checkout", requestId: customCheckout[1] };
  if (hash.startsWith("#/checkout")) return { name: "checkout" };
  const order = /^#\/pedido\/([\w-]+)/.exec(hash);
  if (order) return { name: "order", id: order[1] };
  const form = /^#\/a-medida\/([\w-]+)/.exec(hash);
  if (form) return { name: "customForm", productId: form[1] };
  const request = /^#\/solicitud\/([\w-]+)/.exec(hash);
  if (request) return { name: "request", id: request[1] };
  return { name: "home" };
}

export const paths = {
  home: "#top",
  checkout: "#/checkout",
  customCheckout: (requestId: string) => `#/checkout/solicitud/${requestId}`,
  order: (id: string) => `#/pedido/${id}`,
  customForm: (productId: string) => `#/a-medida/${productId}`,
  request: (id: string) => `#/solicitud/${id}`,
};

export function navigate(path: string) {
  window.location.hash = path;
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
