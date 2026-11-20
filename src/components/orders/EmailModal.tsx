import { useI18n } from "@/i18n/I18nProvider";
import { parcelTotal } from "@/lib/orders";
import { siteConfig } from "@/config/site";
import { formatAmount, formatPen, sumBreakdowns } from "@/lib/pricing";
import { fill, formatDateTime, formatDay } from "@/lib/text";
import type { Order } from "@/types/order";
import { Modal } from "@/components/ui/Modal";
import { PaymentSummary } from "@/components/checkout/PaymentSummary";
import type { SimEmail } from "./emails";

/** Asunto del correo, también usado en la bandeja. */
export function useEmailText() {
  const { t, locale } = useI18n();
  const delayVars = (p?: Order["parcels"][number]): Record<string, string> => {
    const reason = p?.events.find((e) => e.type === "delay_reason");
    if (!reason || reason.type !== "delay_reason") return {};
    return {
      reason: t.order.delay.reasons[reason.reason],
      newDispatch: formatDay(reason.newDispatch, locale),
      newDelivery: formatDay(reason.newDelivery, locale),
    };
  };
  return (order: Order, email: SimEmail) => {
    const p = email.parcel;
    const vars = {
      id: order.id,
      name: order.customer.name.split(" ")[0],
      artisan: p?.artisanFirstName ?? "",
      community: p?.community ?? "",
      courier: p?.courier ?? "",
      code: p?.trackingCode ?? "",
      intlCourier: p?.intlCourier ?? "",
      intlCode: p?.intlTrackingCode ?? "",
      date: p ? formatDay(p.dispatchBy, locale) : "",
      delivery: p ? formatDay(p.deliveryBy, locale) : "",
      amount: p ? formatAmount(parcelTotal(p), order.currency, siteConfig.penPerUsd) : "",
      artisanAmount: p ? formatPen(sumBreakdowns(p.lines.map((l) => l.breakdown)).artisan) : "",
      ...delayVars(p),
    };
    const tpl = t.order.emails[email.kind];
    return { subject: fill(tpl.subject, vars), body: fill(tpl.body, vars), vars };
  };
}

interface Props {
  order: Order;
  email: SimEmail | null;
  onClose: () => void;
}

/** Vista previa de un correo simulado, con el aspecto de un correo real. */
export function EmailModal({ order, email, onClose }: Props) {
  const { t, locale } = useI18n();
  const text = useEmailText();
  const e = t.order.emails;
  if (!email) return null;
  const { subject, body, vars } = text(order, email);

  return (
    <Modal open onClose={onClose} labelledBy="email-subject">
      <div className="mail">
        <p className="mail-meta">
          <span className="mail-from">
            <i aria-hidden="true">◆</i> {e.from}
          </span>
          <time>{formatDateTime(email.at, locale)}</time>
        </p>
        <p className="mail-to">
          {e.to}: {order.customer.email}
        </p>
        <h2 id="email-subject" className="mail-subject">
          {subject}
        </h2>
        <div className="mail-body">
          <p>{fill(e.hello, vars)}</p>
          <p>{body}</p>
          {email.kind === "confirmation" && (
            <>
              <div className="mail-order">
                <p className="mail-order-id">
                  {t.order.number} <b>{order.id}</b>
                </p>
                {order.parcels.flatMap((p) =>
                  p.lines.map((l) => (
                    <div className="co-line" key={`${p.id}-${l.productId}`}>
                      <img src={l.image} alt="" />
                      <span>
                        {l.name[locale]}
                        <small>
                          × {l.quantity} · {fill(t.checkout.fromWorkshop, { artisan: p.artisanFirstName, region: p.regionName })}
                        </small>
                      </span>
                      <b>{formatAmount(l.breakdown.total, order.currency, siteConfig.penPerUsd)}</b>
                    </div>
                  )),
                )}
              </div>
              <PaymentSummary
                totals={order.totals}
                workshops={order.parcels.length}
                international={order.international}
                currency={order.currency}
              />
            </>
          )}
          <button type="button" className="btn mail-cta" onClick={onClose}>
            {e.track}
          </button>
          <p className="mail-sign">{e.sign}</p>
        </div>
      </div>
    </Modal>
  );
}
