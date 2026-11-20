import { useI18n } from "@/i18n/I18nProvider";
import { useCart } from "@/state/CartProvider";
import "./FloatingActions.css";

/** Botón flotante "Mi pedido (n)". Debajo va el del Asistente Conecta. */
export function FloatingActions() {
  const { t } = useI18n();
  const { count, open } = useCart();

  return (
    <button className="cartb" type="button" onClick={open}>
      {t.cart.button} ({count})
    </button>
  );
}
