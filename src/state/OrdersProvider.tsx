import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  advanceCourier,
  applyArtisanReply,
  applyBuyerDelayDecision,
  createOrder,
  simulateIncident,
  type PlaceOrderInput,
} from "@/lib/orders";
import {
  applyRequestReply,
  createRequest,
  declineRequest,
  markRequestAccepted,
  type NewRequestInput,
} from "@/lib/requests";
import type { ArtisanReply, Order } from "@/types/order";
import type { CustomRequest, RequestReply } from "@/types/request";

interface OrdersValue {
  orders: Order[];
  getOrder: (id: string) => Order | undefined;
  placeOrder: (input: PlaceOrderInput) => Order;
  artisanReply: (orderId: string, parcelId: string, reply: ArtisanReply) => void;
  advance: (orderId: string, parcelId: string) => void;
  /** Incidencia simulada desde el panel de demo (retraso del artesano o del courier). */
  incident: (orderId: string, parcelId: string) => void;
  /** El comprador responde a un retraso: acepta la nueva fecha o cancela con reembolso. */
  delayDecision: (orderId: string, parcelId: string, accept: boolean) => void;
  requests: CustomRequest[];
  getRequest: (id: string) => CustomRequest | undefined;
  sendRequest: (input: NewRequestInput) => CustomRequest;
  requestReply: (requestId: string, reply: RequestReply) => void;
  acceptRequest: (requestId: string, orderId: string) => void;
  declineQuote: (requestId: string) => void;
  resetDemo: () => void;
}

/**
 * Pedidos y solicitudes a medida de la demostración. Se guardan en este navegador (no hay
 * backend) y se sincronizan entre pestañas: puedes abrir la vista del comprador en una y
 * el celular del artesano en otra.
 */
const ORDERS_KEY = "cap-orders";
const REQUESTS_KEY = "cap-requests";
const OrdersContext = createContext<OrdersValue | null>(null);

function loadOrders(): Order[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(ORDERS_KEY) ?? "[]");
    // Descarta pedidos guardados con un formato anterior (sin país ni datos de entrega).
    if (!Array.isArray(parsed)) return [];
    return (parsed as Order[])
      .filter((o) => typeof o?.international === "boolean" && o.parcels?.every((p) => p.dropOff))
      .map((o) => ({
        ...o,
        currency: o.currency ?? (o.international ? "USD" : "PEN"),
        parcels: o.parcels.map((p) => ({
          ...p,
          payoutAccount: p.payoutAccount ?? "cuenta registrada",
          artisanPhoneMasked: p.artisanPhoneMasked ?? "+51 9•• ••• •••",
        })),
      }));
  } catch {
    return [];
  }
}

function loadRequests(): CustomRequest[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(REQUESTS_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as CustomRequest[]).filter((r) => Array.isArray(r?.events)) : [];
  } catch {
    return [];
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage no disponible: la demo sigue funcionando en memoria */
  }
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(loadOrders);
  const [requests, setRequests] = useState<CustomRequest[]>(loadRequests);

  useEffect(() => save(ORDERS_KEY, orders), [orders]);
  useEffect(() => save(REQUESTS_KEY, requests), [requests]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === ORDERS_KEY) setOrders(loadOrders());
      if (e.key === REQUESTS_KEY) setRequests(loadRequests());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const updateOrder = useCallback((orderId: string, fn: (o: Order) => Order) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? fn(o) : o)));
  }, []);
  const updateRequest = useCallback((requestId: string, fn: (r: CustomRequest) => CustomRequest) => {
    setRequests((prev) => prev.map((r) => (r.id === requestId ? fn(r) : r)));
  }, []);

  const placeOrder = useCallback((input: PlaceOrderInput) => {
    const order = createOrder(input);
    setOrders((prev) => [order, ...prev]);
    return order;
  }, []);

  const sendRequest = useCallback((input: NewRequestInput) => {
    const req = createRequest(input);
    setRequests((prev) => [req, ...prev]);
    return req;
  }, []);

  const value = useMemo<OrdersValue>(
    () => ({
      orders,
      getOrder: (id) => orders.find((o) => o.id === id),
      placeOrder,
      artisanReply: (orderId, parcelId, reply) => updateOrder(orderId, (o) => applyArtisanReply(o, parcelId, reply)),
      advance: (orderId, parcelId) => updateOrder(orderId, (o) => advanceCourier(o, parcelId)),
      incident: (orderId, parcelId) => updateOrder(orderId, (o) => simulateIncident(o, parcelId)),
      delayDecision: (orderId, parcelId, accept) =>
        updateOrder(orderId, (o) => applyBuyerDelayDecision(o, parcelId, accept)),
      requests,
      getRequest: (id) => requests.find((r) => r.id === id),
      sendRequest,
      requestReply: (requestId, reply) => updateRequest(requestId, (r) => applyRequestReply(r, reply)),
      acceptRequest: (requestId, orderId) => updateRequest(requestId, (r) => markRequestAccepted(r, orderId)),
      declineQuote: (requestId) => updateRequest(requestId, (r) => declineRequest(r)),
      resetDemo: () => {
        setOrders([]);
        setRequests([]);
      },
    }),
    [orders, requests, placeOrder, sendRequest, updateOrder, updateRequest],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): OrdersValue {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders debe usarse dentro de <OrdersProvider>");
  return ctx;
}
