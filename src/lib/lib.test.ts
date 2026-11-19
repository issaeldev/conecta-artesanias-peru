import { describe, expect, it } from "vitest";
import { products } from "@/data/products";
import { filterProducts } from "./catalogFilter";
import { formatMoney } from "./money";
import { recommendProduct } from "./recommend";
import { buildOrderMessage, whatsappUrl } from "./whatsapp";

describe("formatMoney", () => {
  it("muestra soles y dólares con el tipo de cambio supuesto", () => {
    expect(formatMoney(320, "PEN", 3.5)).toBe("S/ 320");
    expect(formatMoney(320, "USD", 3.5)).toBe("US$ 91");
  });
});

describe("recommendProduct", () => {
  it("recomienda según uso, estilo y presupuesto", () => {
    expect(recommendProduct(products, { purpose: "uso", style: "color", budget: 270 })?.id).toBe("chullo-alpaca");
    expect(recommendProduct(products, { purpose: "decor", style: "sobrio", budget: 300 })?.id).toBe(
      "jarron-pintado-quinua",
    );
    expect(recommendProduct(products, { purpose: "regalo", style: "tradicion", budget: Infinity })?.id).toBe(
      "retablo-ayacuchano",
    );
  });

  it("penaliza las piezas fuera de presupuesto", () => {
    // El retablo (S/ 350) coincide en todo pero excede S/ 300: gana el mate (S/ 290).
    expect(recommendProduct(products, { purpose: "regalo", style: "tradicion", budget: 300 })?.id).toBe(
      "mate-burilado",
    );
  });
});

describe("filterProducts", () => {
  it("filtra por categoría", () => {
    const res = filterProducts(products, { category: "textil", query: "", locale: "es" });
    expect(res.map((p) => p.id)).toEqual(["manta-telar-cintura", "chullo-alpaca"]);
  });

  it("busca por artesano, lugar o técnica sin distinguir mayúsculas", () => {
    expect(filterProducts(products, { category: "all", query: "QUINUA", locale: "es" })).toHaveLength(1);
    expect(filterProducts(products, { category: "all", query: "julián", locale: "es" })[0].id).toBe("mate-burilado");
    expect(filterProducts(products, { category: "all", query: "nada-que-ver", locale: "es" })).toHaveLength(0);
  });
});

describe("whatsapp", () => {
  it("arma el mensaje del pedido y lo codifica en el enlace", () => {
    const msg = buildOrderMessage(
      { greeting: "Hola", subtotal: "Subtotal", name: "Nombre", destination: "Destino" },
      [{ name: "Mate burilado", quantity: 2, total: 580 }],
      { name: "Ana", destination: "Lima, Perú" },
    );
    expect(msg).toBe("Hola\n- 2 × Mate burilado (S/ 580)\nSubtotal: S/ 580\nNombre: Ana\nDestino: Lima, Perú");
    expect(whatsappUrl("51999999999", "Hola mundo")).toBe("https://wa.me/51999999999?text=Hola%20mundo");
  });
});
