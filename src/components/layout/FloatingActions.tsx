import { useI18n } from "@/i18n/I18nProvider";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import { useCart } from "@/state/CartProvider";
import "./FloatingActions.css";

/** Botones flotantes: "Mi pedido (n)" y WhatsApp. */
export function FloatingActions() {
  const { t } = useI18n();
  const { count, open } = useCart();
  const wa = useWhatsApp();

  return (
    <>
      <button className="cartb" type="button" onClick={open}>
        {t.cart.button} ({count})
      </button>
      <a className="wa" href={wa(t.whatsapp.general)} target="_blank" rel="noopener">
        {t.whatsapp.floating}
      </a>
    </>
  );
}
