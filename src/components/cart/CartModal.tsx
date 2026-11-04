import { useState } from "react";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/I18nProvider";
import { penToUsd } from "@/lib/money";
import { buildOrderMessage, type OrderLine } from "@/lib/whatsapp";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import { useCart } from "@/state/CartProvider";
import { useCatalog } from "@/state/CatalogProvider";
import { Modal } from "@/components/ui/Modal";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import "./CartModal.css";

/** "Mi pedido (simulación)": resumen del pedido y envío de la solicitud por WhatsApp. */
export function CartModal() {
  const { t, locale } = useI18n();
  const cart = useCart();
  const { getProduct } = useCatalog();
  const wa = useWhatsApp();
  const [customerName, setCustomerName] = useState("");
  const [destination, setDestination] = useState("");

  const c = t.cart;

  const lines = Object.entries(cart.items).flatMap(([id, quantity]) => {
    const product = getProduct(id);
    return product ? [{ product, quantity, total: product.price * quantity }] : [];
  });
  const subtotal = lines.reduce((sum, l) => sum + l.total, 0);

  const goToCatalog = () => {
    cart.close();
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  };

  const sendOrder = () => {
    const orderLines: OrderLine[] = lines.map((l) => ({
      name: l.product.name[locale],
      quantity: l.quantity,
      total: l.total,
    }));
    const message = buildOrderMessage(c.message, orderLines, { name: customerName, destination });
    window.open(wa(message), "_blank", "noopener");
  };

  return (
    <Modal open={cart.isOpen} onClose={cart.close} labelledBy="cart-title">
      <h2 id="cart-title">{c.title}</h2>
      {lines.length === 0 ? (
        <>
          <p>{c.empty}</p>
          <button className="btn" type="button" onClick={goToCatalog}>
            {c.explore}
          </button>
        </>
      ) : (
        <>
          {lines.map(({ product, quantity, total }) => (
            <div className="ln" key={product.id}>
              <span>{product.name[locale]}</span>
              <QuantityStepper
                value={quantity}
                onDecrease={() => cart.decrement(product.id)}
                onIncrease={() => cart.increment(product.id)}
                decreaseLabel={t.product.decrease}
                increaseLabel={t.product.increase}
              />
              <span>S/ {total}</span>
              <button type="button" className="rmv" aria-label={c.remove} onClick={() => cart.remove(product.id)}>
                ×
              </button>
            </div>
          ))}
          <p className="tot">
            <b>
              {c.subtotal}: S/ {subtotal}
            </b>{" "}
            <small>
              (≈ US$ {penToUsd(subtotal, siteConfig.penPerUsd)}, {c.fx})
            </small>
          </p>
          <label htmlFor="cn">{c.name}</label>
          <input id="cn" autoComplete="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <label htmlFor="cd">{c.destination}</label>
          <input id="cd" value={destination} onChange={(e) => setDestination(e.target.value)} />
          <p className="tag">{c.note}</p>
          <button className="btn" type="button" onClick={sendOrder}>
            {c.send}
          </button>
        </>
      )}
    </Modal>
  );
}
