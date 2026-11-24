import { useCurrency } from "@/state/CurrencyProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { penToUsd } from "@/lib/money";
import { navigate, paths } from "@/hooks/useRoute";
import { useCart } from "@/state/CartProvider";
import { useCatalog } from "@/state/CatalogProvider";
import { useOrders } from "@/state/OrdersProvider";
import { Modal } from "@/components/ui/Modal";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import "./CartModal.css";

/** "Mi pedido": piezas elegidas y paso al checkout. */
export function CartModal() {
  const { t, locale } = useI18n();
  const { rate: penPerUsd } = useCurrency();
  const cart = useCart();
  const { getProduct } = useCatalog();
  const { orders } = useOrders();

  const c = t.cart;
  const lastOrder = orders[0];

  const lines = Object.entries(cart.items).flatMap(([id, quantity]) => {
    const product = getProduct(id);
    return product ? [{ product, quantity, total: product.price * quantity }] : [];
  });
  const subtotal = lines.reduce((sum, l) => sum + l.total, 0);

  const goTo = (path: string) => {
    cart.close();
    navigate(path);
  };

  return (
    <Modal open={cart.isOpen} onClose={cart.close} labelledBy="cart-title">
      <h2 id="cart-title">{c.title}</h2>
      {lines.length === 0 ? (
        <>
          <p>{c.empty}</p>
          <div className="cta">
            <button
              className="btn"
              type="button"
              onClick={() => {
                cart.close();
                document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {c.explore}
            </button>
            {lastOrder && (
              <button className="btn o" type="button" onClick={() => goTo(paths.order(lastOrder.id))}>
                {c.track} {lastOrder.id}
              </button>
            )}
          </div>
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
              (≈ US$ {penToUsd(subtotal, penPerUsd)}, {c.fx})
            </small>
          </p>
          <p className="tag">{c.note}</p>
          <button className="btn" type="button" onClick={() => goTo(paths.checkout)}>
            {c.checkout} →
          </button>
        </>
      )}
    </Modal>
  );
}
