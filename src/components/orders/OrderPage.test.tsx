/** Prueba de humo: la página del pedido se renderiza en todos los estados, incluida la transferencia al artesano. */
import { describe, expect, it } from "vitest";
import type React from "react";
import { renderToString } from "react-dom/server";
import { products } from "@/data/products";
import { workshops } from "@/data/workshops";
import { I18nProvider } from "@/i18n/I18nProvider";
import { OrdersProvider } from "@/state/OrdersProvider";
import { CatalogProvider } from "@/state/CatalogProvider";
import { CurrencyProvider } from "@/state/CurrencyProvider";
import { CartProvider } from "@/state/CartProvider";
import { OrderPage } from "@/components/orders/OrderPage";
import { Assistant } from "@/components/assistant/Assistant";
import { advanceCourier, applyArtisanReply, applyBuyerDelayDecision, createOrder, simulateIncident } from "@/lib/orders";
import { applyRequestReply, createRequest } from "@/lib/requests";
import { RequestPage } from "@/components/custom/RequestPage";

const store: Record<string, string> = {};
(globalThis as any).navigator ??= { language: "es" };
(globalThis as any).localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => (store[k] = v) };
(globalThis as any).window ??= { location: { hash: "#/pedido/X?nuevo" }, addEventListener() {}, removeEventListener() {} };

describe("página del pedido (render completo)", () => {
  for (const country of ["PE", "US"])
    for (const steps of [5, 6]) {
      it(`se dibuja sin errores: ${country}, ${steps} pasos del courier`, () => {
        let order = createOrder({
          customer: { name: "Ana", email: "a@b.c", phone: "1", country, department: "Lima", postalCode: "1", city: "X", address: "Y", reference: "" },
          payment: { method: "card", detail: "x" },
          entries: [{ product: products.find((p) => p.id === "mate-burilado")!, quantity: 1 }],
          workshops,
        });
        const pid = order.parcels[0].id;
        order = applyArtisanReply(order, pid, "confirm");
        order = applyArtisanReply(order, pid, "ready");
        order = applyArtisanReply(order, pid, "handover_pickup");
        for (let i = 0; i < steps; i++) order = advanceCourier(order, pid);
        store["cap-orders"] = JSON.stringify([order]);
        renderToString(
          <I18nProvider>
            <CatalogProvider>
              <CurrencyProvider>
                <CartProvider>
                  <OrdersProvider>
                    <OrderPage id={order.id} />
                    <Assistant />
                  </OrdersProvider>
                </CartProvider>
              </CurrencyProvider>
            </CatalogProvider>
          </I18nProvider>,
        );
      });
    }
});

describe("incidencias y pedidos a medida (render completo)", () => {
  const wrap = (node: React.ReactNode) =>
    renderToString(
      <I18nProvider>
        <CatalogProvider>
          <CurrencyProvider>
            <CartProvider>
              <OrdersProvider>{node}</OrdersProvider>
            </CartProvider>
          </CurrencyProvider>
        </CatalogProvider>
      </I18nProvider>,
    );
  const baseOrder = () =>
    createOrder({
      customer: { name: "Ana", email: "a@b.c", phone: "1", country: "PE", department: "Lima", postalCode: "", city: "X", address: "Y", reference: "" },
      payment: { method: "card", detail: "x" },
      entries: [{ product: products.find((p) => p.id === "mate-burilado")!, quantity: 1 }],
      workshops,
    });

  it("se dibuja con un retraso esperando la decisión del comprador y tras cancelar", () => {
    let order = baseOrder();
    const pid = order.parcels[0].id;
    order = applyArtisanReply(order, pid, "confirm");
    order = simulateIncident(order, pid);
    order = applyArtisanReply(order, pid, "delay_sick");
    store["cap-orders"] = JSON.stringify([order]);
    expect(wrap(<OrderPage id={order.id} />)).toContain("delay-actions");
    order = applyBuyerDelayDecision(order, pid, false);
    store["cap-orders"] = JSON.stringify([order]);
    wrap(<OrderPage id={order.id} />);
  });

  it("la solicitud a medida se dibuja en todos sus estados", () => {
    const product = products.find((p) => p.id === "mate-burilado")!;
    let req = createRequest({
      product,
      workshop: workshops.find((w) => w.id === product.artisanId),
      details: { size: "35 cm", colors: "", notes: "" },
      quantity: 1,
      customer: { name: "Emily", email: "e@x.com", country: "US", department: "CA" },
    });
    for (const reply of [null, "can_do", "quote_2"] as const) {
      if (reply) req = applyRequestReply(req, reply);
      store["cap-requests"] = JSON.stringify([req]);
      wrap(<RequestPage id={req.id} />);
    }
    expect(wrap(<RequestPage id={req.id} />)).toContain("US$");
  });
});
