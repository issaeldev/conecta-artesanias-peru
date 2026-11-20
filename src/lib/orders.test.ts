import { describe, expect, it } from "vitest";
import { products } from "@/data/products";
import { workshops } from "@/data/workshops";
import { buildArtisanChat, buildRequestChat } from "./artisanChat";
import {
  applyRequestReply,
  availableRequestReplies,
  createRequest,
  markRequestAccepted,
  requestQuote,
  requestStatus,
  requestSummary,
} from "./requests";
import {
  addBusinessDays,
  advanceCourier,
  applyArtisanReply,
  applyBuyerDelayDecision,
  availableReplies,
  awaitingBuyerDecision,
  createOrder,
  handoverOf,
  nextCourierStep,
  nextIncident,
  simulateIncident,
  parcelStatus,
  payoutDate,
} from "./orders";
import { formatAmount, splitPrice } from "./pricing";
import { detectTopic, findOrderId } from "./assistant";

const customer = {
  name: "Ana Torres",
  email: "ana@ejemplo.com",
  phone: "987654321",
  country: "PE",
  department: "Lima",
  postalCode: "",
  city: "Miraflores",
  address: "Av. Larco 812",
  reference: "",
};
const usCustomer = { ...customer, country: "US", department: "California", postalCode: "94110", city: "San Francisco" };
const byId = (id: string) => products.find((p) => p.id === id)!;
// Jueves 19 de noviembre de 2026, 10:00
const NOW = new Date(2026, 10, 19, 10, 0);

function sampleOrder(ids = ["manta-telar-cintura"], buyer = customer) {
  return createOrder(
    {
      customer: buyer,
      payment: { method: "card", detail: "Tarjeta terminada en 1111" },
      entries: ids.map((id) => ({ product: byId(id), quantity: 1 })),
      workshops,
    },
    NOW,
    () => 0.5,
  );
}

describe("splitPrice", () => {
  it("reparte el precio con IGV solo sobre la comisión y suma exacto", () => {
    const b = splitPrice(320, { commissionRate: 0.15, igvRate: 0.18, igvBase: "commission" });
    expect(b.artisan).toBe(271.88);
    expect(b.commission).toBe(40.78);
    expect(b.igv).toBe(7.34);
    expect(b.artisan + b.commission + b.igv).toBeCloseTo(320, 2);
  });

  it("reparte el precio con IGV sobre todo", () => {
    const b = splitPrice(320, { commissionRate: 0.15, igvRate: 0.18, igvBase: "all" });
    expect(b.artisan).toBe(235.81);
    expect(b.artisan + b.commission + b.igv).toBeCloseTo(320, 2);
  });
});

describe("fechas", () => {
  it("salta fines de semana", () => {
    // Sábado 21 + 2 días hábiles = martes 24
    expect(addBusinessDays(new Date(2026, 10, 21), 2).getDate()).toBe(24);
  });

  it("paga el primer viernes con al menos 3 días desde la entrega", () => {
    expect(payoutDate(new Date(2026, 10, 19)).getDate()).toBe(27); // jueves 19 → viernes 27
    expect(payoutDate(new Date(2026, 10, 24)).getDate()).toBe(27); // martes 24 → viernes 27
  });
});

describe("createOrder", () => {
  it("agrupa por taller y cobra un envío por taller", () => {
    const order = sampleOrder(["jarron-pintado-quinua", "retablo-ayacuchano", "manta-telar-cintura"]);
    expect(order.parcels).toHaveLength(2);
    expect(order.totals.shipping).toBe(24);
    expect(order.totals.products).toBe(950);
    expect(order.totals.total).toBe(974);
    expect(order.parcels.every((p) => parcelStatus(p) === "awaiting_artisan")).toBe(true);
  });

  it("usa el primer nombre del artesano y su fecha límite de despacho", () => {
    const [p] = sampleOrder().parcels;
    expect(p.artisanFirstName).toBe("Rosa");
    expect(new Date(p.dispatchBy).getDate()).toBe(23); // jueves + 2 hábiles = lunes
  });
});

describe("flujo del envío", () => {
  it("recorre confirmación, empaque y courier hasta la entrega", () => {
    let order = sampleOrder();
    const pid = order.parcels[0].id;
    expect(availableReplies(order.parcels[0])).toEqual(["confirm", "no_stock", "more_days"]);
    expect(nextCourierStep(order.parcels[0])).toBeNull();

    order = applyArtisanReply(order, pid, "confirm", NOW);
    expect(parcelStatus(order.parcels[0])).toBe("preparing");
    order = applyArtisanReply(order, pid, "ready", NOW);
    expect(parcelStatus(order.parcels[0])).toBe("ready");
    order = advanceCourier(order, pid, NOW);
    order = advanceCourier(order, pid, NOW);
    order = advanceCourier(order, pid, NOW);
    expect(parcelStatus(order.parcels[0])).toBe("delivered");
    expect(nextCourierStep(order.parcels[0])).toBe("paid_out");

    const chat = buildArtisanChat(order, order.parcels[0]);
    expect(chat[0].text).toContain("pedido nuevo");
    expect(chat.at(-1)?.text).toContain("S/ 271.88");
  });

  it("al pedir más días mueve la fecha de despacho y la entrega", () => {
    let order = sampleOrder();
    const pid = order.parcels[0].id;
    const before = order.parcels[0].deliveryBy;
    order = applyArtisanReply(order, pid, "more_days", NOW);
    expect(availableReplies(order.parcels[0])).toEqual(["days_2", "days_5"]);
    order = applyArtisanReply(order, pid, "days_5", NOW);
    expect(parcelStatus(order.parcels[0])).toBe("preparing");
    expect(order.parcels[0].deliveryBy > before).toBe(true);
  });

  it("sin stock cancela el envío e ignora respuestas fuera de lugar", () => {
    let order = sampleOrder();
    const pid = order.parcels[0].id;
    order = applyArtisanReply(order, pid, "ready", NOW); // aún no confirmó: se ignora
    expect(parcelStatus(order.parcels[0])).toBe("awaiting_artisan");
    order = applyArtisanReply(order, pid, "no_stock", NOW);
    expect(parcelStatus(order.parcels[0])).toBe("cancelled");
    expect(availableReplies(order.parcels[0])).toEqual([]);
  });
});

describe("entrega del paquete al courier", () => {
  it("sin recojo en su zona, LISTO lleva directo a la agencia", () => {
    let order = sampleOrder(["manta-telar-cintura"]); // Puno: sin recojo
    const pid = order.parcels[0].id;
    order = applyArtisanReply(order, pid, "confirm", NOW);
    order = applyArtisanReply(order, pid, "ready", NOW);
    expect(handoverOf(order.parcels[0])).toBe("agency");
    expect(buildArtisanChat(order, order.parcels[0]).at(-1)?.text).toContain("Agencia Olva Courier · Puno");
  });

  it("con recojo disponible pregunta y respeta la elección", () => {
    let order = sampleOrder(["retablo-ayacuchano"]); // Ayacucho: con recojo
    const pid = order.parcels[0].id;
    order = applyArtisanReply(order, pid, "confirm", NOW);
    order = applyArtisanReply(order, pid, "ready", NOW);
    expect(availableReplies(order.parcels[0])).toEqual(["handover_agency", "handover_pickup"]);
    order = applyArtisanReply(order, pid, "handover_pickup", NOW);
    expect(parcelStatus(order.parcels[0])).toBe("ready");
    expect(handoverOf(order.parcels[0])).toBe("pickup");
  });
});

describe("envío internacional", () => {
  it("cobra un solo envío por zona aunque haya varios talleres", () => {
    const order = sampleOrder(["manta-telar-cintura", "retablo-ayacuchano"], usCustomer);
    expect(order.international).toBe(true);
    expect(order.parcels).toHaveLength(2);
    expect(order.totals.shipping).toBe(130);
    expect(order.parcels.every((p) => p.shipping === 0 && p.intlTrackingCode.startsWith("DHL-"))).toBe(true);
  });

  it("pasa por el centro de Lima y sale del país antes del reparto", () => {
    let order = sampleOrder(["manta-telar-cintura"], usCustomer);
    const pid = order.parcels[0].id;
    order = applyArtisanReply(order, pid, "confirm", NOW);
    order = applyArtisanReply(order, pid, "ready", NOW);
    const steps: string[] = [];
    for (let i = 0; i < 5; i++) {
      steps.push(nextCourierStep(order.parcels[0]) ?? "fin");
      order = advanceCourier(order, pid, NOW);
    }
    expect(steps).toEqual(["picked_up", "at_hub", "intl_shipped", "out_for_delivery", "delivered"]);
    expect(buildArtisanChat(order, order.parcels[0])[0].text).toContain("Estados Unidos");
  });
});

describe("asistente", () => {
  it("detecta números de pedido y temas en español e inglés", () => {
    expect(findOrderId("hola, mi pedido es cap 12345")).toBe("CAP-12345");
    expect(detectTopic("¿Cuánto demora el envío a Lima?")).toBe("shipping");
    expect(detectTopic("Mi pieza llegó rota")).toBe("guarantee");
    expect(detectTopic("¿Puedo pagar con Yape?")).toBe("payment");
    expect(detectTopic("quiero hablar con una persona sobre mi pedido")).toBe("human");
    expect(detectTopic("where is my order?")).toBe("order");
    expect(detectTopic("hola")).toBeNull();
  });
});

describe("transparencia del pago", () => {
  it("transfiere al artesano y registra su confirmación", () => {
    let order = sampleOrder();
    const pid = order.parcels[0].id;
    order = applyArtisanReply(order, pid, "confirm", NOW);
    order = applyArtisanReply(order, pid, "ready", NOW);
    for (let i = 0; i < 3; i++) order = advanceCourier(order, pid, NOW); // hasta entregado
    expect(availableReplies(order.parcels[0])).toEqual([]);
    order = advanceCourier(order, pid, NOW); // transferencia
    expect(order.parcels[0].events.at(-1)?.type).toBe("paid_out");
    expect(availableReplies(order.parcels[0])).toEqual(["payout_received"]);
    order = applyArtisanReply(order, pid, "payout_received", NOW);
    expect(order.parcels[0].events.at(-1)?.type).toBe("payout_confirmed");
    expect(nextCourierStep(order.parcels[0])).toBeNull();
    const chat = buildArtisanChat(order, order.parcels[0]);
    expect(chat.some((m) => m.text.includes("Caja Arequipa ****4821"))).toBe(true);
  });

  it("los pedidos del extranjero se cobran en dólares", () => {
    expect(sampleOrder().currency).toBe("PEN");
    expect(sampleOrder(["manta-telar-cintura"], usCustomer).currency).toBe("USD");
    expect(formatAmount(420, "USD", 3.5)).toBe("US$ 120.00");
    expect(formatAmount(420, "PEN", 3.5)).toBe("S/ 420.00");
  });
});

describe("retraso del artesano", () => {
  function preparing() {
    let order = sampleOrder();
    const pid = order.parcels[0].id;
    order = applyArtisanReply(order, pid, "confirm", NOW);
    return { order, pid };
  }

  it("detecta, pide explicación y el comprador acepta la nueva fecha", () => {
    let { order, pid } = preparing();
    expect(nextIncident(order.parcels[0])).toBe("artisan_delay");
    order = simulateIncident(order, pid, NOW);
    expect(parcelStatus(order.parcels[0])).toBe("delayed");
    expect(availableReplies(order.parcels[0])).toEqual(["delay_sick", "delay_material", "delay_cannot"]);
    order = applyArtisanReply(order, pid, "delay_material", NOW);
    expect(awaitingBuyerDecision(order.parcels[0])?.days).toBe(5);
    expect(availableReplies(order.parcels[0])).toEqual([]);
    const before = order.parcels[0].deliveryBy;
    order = applyBuyerDelayDecision(order, pid, true, NOW);
    expect(parcelStatus(order.parcels[0])).toBe("preparing");
    expect(order.parcels[0].deliveryBy).not.toBe(before);
    expect(nextIncident(order.parcels[0])).toBeNull(); // un retraso del artesano por envío
    expect(availableReplies(order.parcels[0])).toEqual(["ready"]);
  });

  it("si el comprador cancela, el envío queda cancelado", () => {
    let { order, pid } = preparing();
    order = simulateIncident(order, pid, NOW);
    order = applyArtisanReply(order, pid, "delay_sick", NOW);
    order = applyBuyerDelayDecision(order, pid, false, NOW);
    expect(parcelStatus(order.parcels[0])).toBe("cancelled");
  });

  it("si el artesano ya no puede, se cancela sin preguntar al comprador", () => {
    let { order, pid } = preparing();
    order = simulateIncident(order, pid, NOW);
    order = applyArtisanReply(order, pid, "delay_cannot", NOW);
    expect(parcelStatus(order.parcels[0])).toBe("cancelled");
  });

  it("el retraso del courier solo avisa y mueve la fecha estimada", () => {
    let { order, pid } = preparing();
    order = applyArtisanReply(order, pid, "ready", NOW);
    order = advanceCourier(order, pid, NOW); // en camino
    expect(nextIncident(order.parcels[0])).toBe("courier_delay");
    const before = order.parcels[0].deliveryBy;
    order = simulateIncident(order, pid, NOW);
    expect(parcelStatus(order.parcels[0])).toBe("in_transit");
    expect(order.parcels[0].deliveryBy > before).toBe(true);
    expect(nextCourierStep(order.parcels[0])).toBe("out_for_delivery");
  });
});

describe("pedido personalizado", () => {
  const product = byId("mate-burilado");
  const workshop = workshops.find((w) => w.id === product.artisanId);
  const newReq = () =>
    createRequest(
      {
        product,
        workshop,
        details: { size: "35 cm", colors: "azul", notes: "" },
        quantity: 2,
        customer: { name: "Ana Torres", email: "ana@ejemplo.com", country: "PE", department: "Lima" },
      },
      NOW,
      () => 0.5,
    );

  it("cotiza por WhatsApp y el precio final incluye Servicio Conecta e IGV", () => {
    let req = newReq();
    expect(requestStatus(req)).toBe("awaiting_artisan");
    req = applyRequestReply(req, "can_do", NOW);
    expect(availableRequestReplies(req)).toEqual(["quote_0", "quote_1", "quote_2"]);
    req = applyRequestReply(req, "quote_1", NOW);
    const q = requestQuote(req)!;
    expect(q.days).toBe(15);
    // El reparto del precio final devuelve (casi) exacto lo que pidió el artesano.
    expect(Math.abs(splitPrice(q.buyerPrice, { commissionRate: 0.15, igvRate: 0.18, igvBase: "commission" }).artisan - q.artisanPrice)).toBeLessThan(1);
    expect(buildRequestChat(req).at(-1)?.text).toContain(`S/ ${q.buyerPrice}`);
  });

  it("al pagar crea un pedido con el plazo cotizado y sin opción 'sin stock'", () => {
    let req = applyRequestReply(applyRequestReply(newReq(), "can_do", NOW), "quote_0", NOW);
    const q = requestQuote(req)!;
    const order = createOrder(
      {
        customer,
        payment: { method: "card", detail: "x" },
        entries: [{ product: { ...product, price: q.buyerPrice }, quantity: 2, custom: { requestId: req.id, details: requestSummary(req), days: q.days } }],
        workshops,
      },
      NOW,
    );
    const p = order.parcels[0];
    expect(p.custom).toBe(true);
    expect(new Date(p.dispatchBy).getTime()).toBe(addBusinessDays(NOW, q.days).getTime());
    expect(availableReplies(p)).toEqual(["confirm", "more_days"]);
    req = markRequestAccepted(req, order.id, NOW);
    expect(requestStatus(req)).toBe("accepted");
  });

  it("si el artesano no puede, la solicitud queda rechazada", () => {
    const req = applyRequestReply(newReq(), "cannot_do", NOW);
    expect(requestStatus(req)).toBe("rejected");
    expect(availableRequestReplies(req)).toEqual([]);
  });
});
