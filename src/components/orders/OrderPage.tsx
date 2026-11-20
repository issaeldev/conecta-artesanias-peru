import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { fill, formatDateTime, formatDay } from "@/lib/text";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import { useOrders } from "@/state/OrdersProvider";
import { PaymentSummary } from "@/components/checkout/PaymentSummary";
import { openAssistant } from "@/components/assistant/assistantBus";
import { findCountry } from "@/data/countries";
import { ArtisanPanel } from "./ArtisanPanel";
import { EmailModal, useEmailText } from "./EmailModal";
import { ParcelTracking } from "./ParcelTracking";
import { orderEmails, type SimEmail } from "./emails";
import "@/components/checkout/Checkout.css";
import "./Orders.css";

/** Página del pedido: seguimiento del comprador y, al lado, cómo lo vive el artesano. */
export function OrderPage({ id }: { id: string }) {
  const { t, locale } = useI18n();
  const o = t.order;
  const { getOrder } = useOrders();
  const wa = useWhatsApp();
  const emailText = useEmailText();
  const order = getOrder(id);
  const [openEmail, setOpenEmail] = useState<SimEmail | null>(null);
  const [view, setView] = useState<"buyer" | "artisan">("buyer");
  const isNew = window.location.hash.includes("?nuevo");

  if (!order) {
    return (
      <section className="co-page">
        <div className="w co-empty">
          <h1>{o.notFound}</h1>
          <p>{o.notFoundHint}</p>
          <a className="btn" href="#top">
            {o.backHome}
          </a>
        </div>
      </section>
    );
  }

  const emails = orderEmails(order);
  const confirmation = emails.find((e) => e.kind === "confirmation") ?? null;
  const c = order.customer;
  const lastDelivery = order.parcels.map((p) => p.deliveryBy).sort().at(-1)!;

  return (
    <section className="co-page">
      <div className="w">
        {isNew && (
          <div className="thanks" role="status">
            <span className="thanks-ico" aria-hidden="true">
              ✓
            </span>
            <div>
              <p className="thanks-title">{fill(o.thanks, { name: c.name.split(" ")[0] })}</p>
              <p>
                {fill(o.emailSent, { email: c.email })}{" "}
                <button type="button" className="linkish" onClick={() => setOpenEmail(confirmation)}>
                  {o.seeEmail}
                </button>
              </p>
            </div>
          </div>
        )}

        <div className="view-toggle" role="tablist">
          {(["buyer", "artisan"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              className={view === v ? "on" : ""}
              onClick={() => setView(v)}
            >
              {v === "buyer" ? o.viewBuyer : o.viewArtisan}
            </button>
          ))}
        </div>

        <div className={`op show-${view}`}>
          <div className="op-buyer">
            <div className="op-head">
              <div>
                <p className="op-label">{o.number}</p>
                <h1 className="op-id">{order.id}</h1>
                <p className="op-meta">{fill(o.placed, { date: formatDateTime(order.createdAt, locale) })}</p>
              </div>
              <dl className="op-facts">
                <div>
                  <dt>{o.deliverTo}</dt>
                  <dd>
                    {c.address}
                    {order.international && c.reference ? `, ${c.reference}` : ""}, {c.city} · {c.department}
                    {order.international && ` ${c.postalCode} · ${findCountry(c.country)?.name[locale] ?? c.country}`}
                  </dd>
                </div>
                <div>
                  <dt>{o.estimated}</dt>
                  <dd>{formatDay(lastDelivery, locale)}</dd>
                </div>
                <div>
                  <dt>{o.paidWith}</dt>
                  <dd>{order.payment.detail}</dd>
                </div>
              </dl>
            </div>

            {order.parcels.map((p, i) => (
              <ParcelTracking key={p.id} order={order} parcel={p} index={i} count={order.parcels.length} />
            ))}

            <div className="op-card">
              <h2 className="op-h">{fill(o.inbox, { email: c.email })}</h2>
              <p className="hint">{o.inboxNote}</p>
              <ul className="inbox">
                {emails.map((e) => (
                  <li key={e.id}>
                    <button type="button" onClick={() => setOpenEmail(e)}>
                      <span className="inbox-from">◆ Conecta Artesanías Perú</span>
                      <span className="inbox-subject">{emailText(order, e).subject}</span>
                      <time>{formatDateTime(e.at, locale)}</time>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="op-grid">
              <div className="op-card">
                <h2 className="op-h">{o.payment}</h2>
                <PaymentSummary
                  totals={order.totals}
                  workshops={order.parcels.length}
                  international={order.international}
                  currency={order.currency}
                />
              </div>
              <div className="op-card">
                <h2 className="op-h">{o.help}</h2>
                <p className="op-help">{o.helpBody}</p>
                <button type="button" className="btn o" onClick={openAssistant}>
                  {o.helpButton}
                </button>
                <a className="op-human" href={wa(fill(o.helpMessage, { id: order.id }))} target="_blank" rel="noopener">
                  {o.helpHuman}
                </a>
              </div>
            </div>
          </div>

          <aside className="op-artisan">
            <ArtisanPanel order={order} />
          </aside>
        </div>
      </div>

      <EmailModal order={order} email={openEmail} onClose={() => setOpenEmail(null)} />
    </section>
  );
}
