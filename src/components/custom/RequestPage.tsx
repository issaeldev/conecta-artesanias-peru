import { useState } from "react";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/I18nProvider";
import { buildRequestChat, requestReplyLabel } from "@/lib/artisanChat";
import { addBusinessDays, isInternational, shippingQuote } from "@/lib/orders";
import { formatAmount, formatPen } from "@/lib/pricing";
import { availableRequestReplies, counterDecision, counterRange, requestDetailText, requestQuote, requestStatus } from "@/lib/requests";
import { fill, formatDateTime, formatDay } from "@/lib/text";
import { navigate, paths } from "@/hooks/useRoute";
import { useOrders } from "@/state/OrdersProvider";
import type { CustomRequest, RequestReply } from "@/types/request";
import { Modal } from "@/components/ui/Modal";
import { ArtisanSide } from "@/components/orders/ArtisanPanel";
import "@/components/checkout/Checkout.css";
import "@/components/orders/Orders.css";
import "./Custom.css";

const STEPS = ["sent", "reviewing", "quoted", "paid"] as const;
const doneIndex = { awaiting_artisan: 0, awaiting_quote: 1, quoted: 2, accepted: 3 } as const;

type MailKind = "received" | "quote" | "rejected" | "counter";
interface Mail {
  id: string;
  kind: MailKind;
  at: string;
}

/** Correos que recibe el comprador durante la cotización. */
function requestMails(req: CustomRequest): Mail[] {
  const list: Mail[] = [];
  req.events.forEach((e, i) => {
    const kind: MailKind | null = e.type === "created" ? "received"
      : e.type === "quoted" ? "quote"
      : e.type === "cannot_do" ? "rejected"
      : e.type === "counter_reply" ? "counter" : null;
    if (kind) list.push({ id: `${req.id}-${i}`, kind, at: e.at });
  });
  return list.reverse();
}

/** Seguimiento de una solicitud a medida: lado del comprador y el WhatsApp del artesano. */
export function RequestPage({ id }: { id: string }) {
  const { t, locale } = useI18n();
  const c = t.custom;
  const { getRequest, requestReply, declineQuote, counterRequest } = useOrders();
  const [view, setView] = useState<"buyer" | "artisan">("buyer");
  const [openMail, setOpenMail] = useState<Mail | null>(null);
  const [counterOpen, setCounterOpen] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterError, setCounterError] = useState(false);
  const req = getRequest(id);

  if (!req) {
    return (
      <section className="co-page">
        <div className="w co-empty">
          <h1>{t.order.notFound}</h1>
          <p>{t.order.notFoundHint}</p>
          <a className="btn" href="#top">
            {t.order.backHome}
          </a>
        </div>
      </section>
    );
  }

  const status = requestStatus(req);
  const quote = requestQuote(req);
  const counter = req.events.find((e) => e.type === "counter");
  const decision = counterDecision(req);
  const accepted = req.events.find((e) => e.type === "accepted");
  const currency = locale === "en" || isInternational(req.customer.country) ? "USD" : "PEN";
  const money = (n: number) => formatAmount(n, currency, siteConfig.penPerUsd);
  const counterRangePen = counterRange(req);
  const counterToDisplay = (pen: number) => currency === "USD" ? pen / siteConfig.penPerUsd : pen;
  const counterToPen = (amount: number) => currency === "USD" ? amount * siteConfig.penPerUsd : amount;
  const first = req.customer.name.split(" ")[0];
  const vars = {
    artisan: req.artisanFirstName,
    name: first,
    email: req.customer.email,
    id: req.id,
    product: req.productName[locale],
    price: quote ? money(quote.buyerPrice) : "",
    days: quote?.days ?? 0,
    counter: counter && counter.type === "counter" ? money(counter.buyerPrice) : "",
    result: decision ? c.results[decision] : "",
  };
  const now = c.now[status];
  const done = status in doneIndex ? doneIndex[status as keyof typeof doneIndex] : -1;
  const isNew = window.location.hash.includes("?nuevo");
  const eta =
    quote &&
    addBusinessDays(
      addBusinessDays(new Date(), quote.days),
      shippingQuote(req.customer.country, req.customer.department, 1).transitDays,
    );
  const mails = requestMails(req);
  const replies = availableRequestReplies(req);

  return (
    <section className="co-page">
      <div className="w">
        {isNew && (
          <div className="thanks" role="status">
            <span className="thanks-ico" aria-hidden="true">
              ✓
            </span>
            <div>
              <p className="thanks-title">{fill(c.sent, vars)}</p>
              <p>{fill(c.sentEmail, vars)}</p>
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
              {v === "buyer" ? t.order.viewBuyer : t.order.viewArtisan}
            </button>
          ))}
        </div>

        <div className={`op show-${view}`}>
          <div className="op-buyer">
            <div className="op-head">
              <div>
                <p className="op-label">{c.label}</p>
                <h1 className="op-id">{req.id}</h1>
                <p className="op-meta">{fill(t.order.placed, { date: formatDateTime(req.createdAt, locale) })}</p>
              </div>
            </div>

            <article className="parcel">
              <div className="cr-asked">
                <img src={req.image} alt="" />
                <div>
                  <p className="parcel-from">
                    {req.productName[locale]} <span className="cr-tag">{c.tag}</span>
                  </p>
                  <p className="op-label">{c.yourRequest}</p>
                  <ul className="cr-details">
                    {req.details.size && (
                      <li>
                        <b>{t.custom.size}:</b> {requestDetailText(req.details.size, locale)}
                      </li>
                    )}
                    {req.details.colors && (
                      <li>
                        <b>{t.custom.colors}:</b> {requestDetailText(req.details.colors, locale)}
                      </li>
                    )}
                    {req.details.notes && (
                      <li>
                        <b>{t.custom.notes}:</b> {requestDetailText(req.details.notes, locale)}
                      </li>
                    )}
                    <li>{fill(c.quantityLine, { n: req.quantity })}</li>
                  </ul>
                </div>
              </div>

              {done >= 0 && (
                <ol className="steps steps-4">
                  {STEPS.map((s, i) => (
                    <li key={s} className={i <= done ? "done" : i === done + 1 ? "current" : ""}>
                      <span className="steps-dot" aria-hidden="true" />
                      <span className="steps-label">{c.steps[s]}</span>
                    </li>
                  ))}
                </ol>
              )}

              <div className="now">
                <span className="now-avatar" aria-hidden="true">
                  {req.artisanFirstName[0]}
                </span>
                <div>
                  <p className="now-title">{fill(now.title, vars)}</p>
                  <p className="now-body">{fill(now.body, vars)}</p>
                </div>
              </div>

              {quote && (status === "quoted" || status === "countered" || status === "accepted") && (
                <div className="quote">
                  <p className="quote-title">{fill(c.quoteTitle, vars)}</p>
                  <p className="quote-price">{fill(c.perPiece, { price: money(quote.buyerPrice) })}</p>
                  <ul>
                    <li>{fill(c.prepTime, vars)}</li>
                    {eta && status === "quoted" && <li>{fill(c.deliveryEta, { date: formatDay(eta.toISOString(), locale) })}</li>}
                    <li className="quote-fair">{fill(c.artisanGets, { ...vars, amount: formatPen(quote.artisanPrice) })}</li>
                  </ul>
                  {status === "countered" && counter && counter.type === "counter" && (
                    <p className="counter-yours">{fill(c.counterYours, { price: money(counter.buyerPrice) })}</p>
                  )}
                  {decision && <p className="counter-result">{fill(c.counterResult[decision], vars)} {c.finalNote}</p>}
                  {status === "quoted" && (
                    <>
                      <p className="hint">{c.shippingNote}</p>
                      <div className="cta">
                        <button className="btn" type="button" onClick={() => navigate(paths.customCheckout(req.id))}>
                          {c.accept} →
                        </button>
                        <button className="btn o" type="button" onClick={() => declineQuote(req.id)}>
                          {c.decline}
                        </button>
                      </div>
                      {status === "quoted" && !req.events.some((event) => event.type === "counter") && (
                        <button className="btn o counter-offer-btn" type="button" onClick={() => {
                          setCounterPrice(currency === "USD" ? counterToDisplay(counterRangePen.max).toFixed(2) : String(counterRangePen.max));
                          setCounterError(false);
                          setCounterOpen(true);
                        }}>
                          {c.counter}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {accepted && accepted.type === "accepted" && (
                <div className="cta">
                  <a className="btn" href={paths.order(accepted.orderId)}>
                    {fill(c.viewOrder, { id: accepted.orderId })} →
                  </a>
                </div>
              )}
              {(status === "rejected" || status === "declined") && (
                <div className="cta">
                  <a className="btn o" href="#catalogo">
                    {c.explore}
                  </a>
                </div>
              )}
            </article>

            <div className="op-card">
              <h2 className="op-h">{fill(t.order.inbox, { email: req.customer.email })}</h2>
              <p className="hint">{t.order.inboxNote}</p>
              <ul className="inbox">
                {mails.map((m) => (
                  <li key={m.id}>
                    <button type="button" onClick={() => setOpenMail(m)}>
                      <span className="inbox-from">◆ Conecta Artesanías Perú</span>
                      <span className="inbox-subject">{fill(c.emails[m.kind].subject, vars)}</span>
                      <time>{formatDateTime(m.at, locale)}</time>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="op-artisan">
            <ArtisanSide
              artisan={req.artisanFirstName}
              phoneKey={req.id}
              messages={buildRequestChat(req)}
              replies={replies.map((r) => ({ id: r, label: requestReplyLabel(r, req) }))}
              onReply={(r) => requestReply(req.id, r as RequestReply)}
            >
              <p className="demo-wait">{replies.length ? c.demoNote : t.demo.finished}</p>
            </ArtisanSide>
          </aside>
        </div>
      </div>

      {openMail && (
        <Modal open onClose={() => setOpenMail(null)} labelledBy="req-mail-subject">
          <div className="mail">
            <p className="mail-meta">
              <span className="mail-from">◆ {t.order.emails.from}</span>
              <time>{formatDateTime(openMail.at, locale)}</time>
            </p>
            <p className="mail-to">
              {t.order.emails.to}: {req.customer.email}
            </p>
            <h2 id="req-mail-subject" className="mail-subject">
              {fill(c.emails[openMail.kind].subject, vars)}
            </h2>
            <div className="mail-body">
              <p>{fill(t.order.emails.hello, vars)}</p>
              <p>{fill(c.emails[openMail.kind].body, vars)}</p>
              <button type="button" className="btn mail-cta" onClick={() => setOpenMail(null)}>
                {openMail.kind === "quote" ? c.accept : t.order.emails.track}
              </button>
              <p className="mail-sign">{t.order.emails.sign}</p>
            </div>
          </div>
        </Modal>
      )}
      {counterOpen && quote && (
        <Modal open onClose={() => setCounterOpen(false)} labelledBy="counter-title">
          <form className="counter-form" onSubmit={(event) => {
            event.preventDefault();
            const amount = Number(counterPrice);
            const amountInPen = counterToPen(amount);
            if (!counterPrice.trim() || !Number.isFinite(amountInPen) || amountInPen < counterRangePen.min || amountInPen > counterRangePen.max) {
              setCounterError(true);
              return;
            }
            counterRequest(req.id, amountInPen);
            setCounterOpen(false);
          }}>
            <h2 id="counter-title">{c.counterTitle}</h2>
            <p>{fill(c.counterHint, { artisan: req.artisanFirstName, min: money(counterRange(req).min), max: money(counterRange(req).max) })}</p>
            <label htmlFor="counter-price">{fill(c.counterLabel, { currency })}</label>
            <input id="counter-price" type="number" step="any" aria-invalid={counterError} aria-describedby={counterError ? "counter-error" : undefined} value={counterPrice} onChange={(event) => { setCounterPrice(event.target.value); setCounterError(false); }} />
            {counterError && <p id="counter-error" className="counter-error" role="alert">{fill(c.counterInvalid, { min: money(counterRange(req).min), max: money(counterRange(req).max) })}</p>}
            <div className="cta">
              <button className="btn" type="submit">{c.counterSend}</button>
              <button className="btn o" type="button" onClick={() => setCounterOpen(false)}>{c.counterCancel}</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
