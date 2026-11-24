import { useCurrency } from "@/state/CurrencyProvider";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { AfterDelivery } from "./AfterDelivery";
import { findCountry } from "@/data/countries";
import { workshops } from "@/data/workshops";
import type { Currency } from "@/types/domain";
import { useI18n } from "@/i18n/I18nProvider";
import {
  awaitingBuyerDecision,
  handoverOf,
  parcelArtisanAmount,
  parcelPhotos,
  parcelStatus,
  parcelTotal,
  statusEvent,
} from "@/lib/orders";
import { useOrders } from "@/state/OrdersProvider";
import { formatAmount, formatPen } from "@/lib/pricing";
import { fill, formatDateTime, formatDay } from "@/lib/text";
import type { Order, Parcel, ParcelEvent, ParcelStatus } from "@/types/order";

const STEPS = ["paid", "confirmed", "ready", "in_transit", "out_for_delivery", "delivered"] as const;

/** Índice del último paso completado según el estado. */
const doneIndex: Record<Exclude<ParcelStatus, "cancelled">, number> = {
  awaiting_artisan: 0,
  preparing: 1,
  ready: 2,
  in_transit: 3,
  at_hub: 3,
  intl_transit: 3,
  delayed: 1,
  out_for_delivery: 4,
  delivered: 5,
};

interface Props {
  order: Order;
  parcel: Parcel;
  index: number;
  count: number;
}

/** El texto del "ahora" cambia según cómo entregó el artesano y si el envío es internacional. */
function nowKey(parcel: Parcel, status: ParcelStatus) {
  if (status === "ready" && handoverOf(parcel) === "agency") return "ready_agency" as const;
  if (status === "in_transit" && parcel.international) return "in_transit_intl" as const;
  if (status === "delayed" && awaitingBuyerDecision(parcel)) return "delayed_decision" as const;
  if (status === "cancelled" && ["delay_cancelled", "delay_abandoned"].includes(statusEvent(parcel).type)) {
    return "cancelled_delay" as const;
  }
  return status;
}

function eventKey(parcel: Parcel, e: ParcelEvent) {
  const agency = handoverOf(parcel) === "agency";
  if (e.type === "ready" && agency) return "ready_agency" as const;
  if (e.type === "picked_up" && agency) return "picked_up_agency" as const;
  if (e.type === "photo") return `photo_${e.stage}` as const;
  return e.type;
}

const findEvent = <T extends ParcelEvent["type"]>(parcel: Parcel, type: T) =>
  parcel.events.find((e): e is Extract<ParcelEvent, { type: T }> => e.type === type);

/** Seguimiento de un envío: pasos, mensaje humano del momento actual, camino del pago e historial. */
export function ParcelTracking({ order, parcel, index, count }: Props) {
  const { t, locale } = useI18n();
  const { rate: penPerUsd } = useCurrency();
  const { delayDecision } = useOrders();
  const o = t.order;
  const detected = findEvent(parcel, "delay_detected");
  const reasonEvent = findEvent(parcel, "delay_reason");
  const courierDelay = findEvent(parcel, "courier_delay");
  const decision = awaitingBuyerDecision(parcel);
  const displayCurrency: Currency = locale === "en" || order.currency === "USD" ? "USD" : "PEN";
  const community = workshops.find((w) => w.id === parcel.workshopId)?.community[locale].split(",")[0] ?? parcel.community;
  const status = parcelStatus(parcel);
  const cancelled = status === "cancelled";
  const done = cancelled ? -1 : doneIndex[status];
  const paidOut = findEvent(parcel, "paid_out");
  const photos = parcelPhotos(parcel);
  const [openPhoto, setOpenPhoto] = useState<number | null>(null);
  const vars = {
    artisan: parcel.artisanFirstName,
    courier: parcel.courier,
    community,
    region: parcel.regionName,
    amount: formatAmount(parcelTotal(parcel), displayCurrency, penPerUsd),
    date: formatDay(parcel.dispatchBy, locale),
    intlCourier: parcel.intlCourier,
    intlCode: parcel.intlTrackingCode,
    country: findCountry(order.customer.country)?.name[locale] ?? order.customer.country,
    account: parcel.payoutAccount,
    due: detected ? formatDay(detected.dueBy, locale) : "",
    reason: reasonEvent ? o.delay.reasons[reasonEvent.reason] : "",
    newDispatch: reasonEvent ? formatDay(reasonEvent.newDispatch, locale) : "",
    newDelivery: reasonEvent ? formatDay(reasonEvent.newDelivery, locale) : "",
    days: courierDelay?.days ?? 0,
    delivery: formatDay(parcel.deliveryBy, locale),
  };
  const courierName = parcel.international && parcel.events.some((e) => e.type === "intl_shipped")
    ? parcel.intlCourier
    : parcel.courier;
  const now = o.now[nowKey(parcel, status)];
  const abroad =
    status === "intl_transit" || (parcel.international && (status === "out_for_delivery" || status === "delivered"));
  const initials = parcel.artisanFullName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <article className={`parcel${cancelled ? " is-cancelled" : ""}`}>
      <header className="parcel-head">
        <div>
          {count > 1 && <p className="parcel-of">{fill(o.parcelOf, { n: index + 1, total: count })}</p>}
          <p className="parcel-from">
            {fill(o.fromWorkshop, {
              artisan: parcel.artisanFirstName,
              community,
              region: parcel.regionName,
            })}
          </p>
          <ul className="parcel-lines">
            {parcel.lines.map((l) => (
              <li key={l.productId}>
                <img src={l.image} alt="" />
                <span>
                  {l.quantity} × {l.name[locale]}
                  {l.custom && <small className="line-custom">{l.custom.details}</small>}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {!cancelled && (
          <div className="parcel-eta">
            <small>{o.estimated}</small>
            <b>{formatDay(parcel.deliveryBy, locale)}</b>
          </div>
        )}
      </header>

      {!cancelled && (
        <ol className="steps" aria-label={o.history}>
          {STEPS.map((s, i) => (
            <li key={s} className={i <= done ? "done" : i === done + 1 ? "current" : ""}>
              <span className="steps-dot" aria-hidden="true" />
              <span className="steps-label">{o.steps[s]}</span>
              {/* Las fotos del taller cuelgan del tramo "Confirmado → Empacado", cuando el artesano la prepara. */}
              {s === "confirmed" && photos.length > 0 && (
                <span className="steps-photos" aria-label={o.photos.label}>
                  {photos.map((ph, n) => (
                    <button
                      key={`${ph.stage}-${n}`}
                      type="button"
                      className="steps-photo"
                      onClick={() => setOpenPhoto(n)}
                      aria-label={`${o.photos.open}: ${fill(o.photos[ph.stage], vars)}`}
                    >
                      <img src={ph.src} alt="" />
                    </button>
                  ))}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}

      <div className="now">
        <span className="now-avatar" aria-hidden="true">
          {initials}
        </span>
        <div>
          <p className="now-title">{fill(now.title, vars)}</p>
          <p className="now-body">{fill(now.body, vars)}</p>
          {"note" in now && <p className="now-note">{fill(now.note, vars)}</p>}
          {abroad ? (
            <p className="now-code">
              {o.tracking}: <b>{parcel.intlTrackingCode}</b> · {parcel.intlCourier}
            </p>
          ) : (
            (status === "in_transit" || status === "at_hub" || status === "out_for_delivery" || status === "delivered") && (
              <p className="now-code">
                {o.tracking}: <b>{parcel.trackingCode}</b> · {parcel.courier}
              </p>
            )
          )}
        </div>
        {decision && (
          <div className="delay-actions">
            <button type="button" className="btn" onClick={() => delayDecision(order.id, parcel.id, true)}>
              {o.delay.accept}
            </button>
            <button type="button" className="btn o" onClick={() => delayDecision(order.id, parcel.id, false)}>
              {o.delay.cancel}
            </button>
            <p className="now-note">{fill(o.delay.refundNote, vars)}</p>
          </div>
        )}
      </div>

      <Modal open={openPhoto !== null} onClose={() => setOpenPhoto(null)} labelledBy={`photo-${parcel.id}`}>
        {openPhoto !== null && photos[openPhoto] && (
          <figure className="photo-view">
            <img src={photos[openPhoto].src} alt={fill(o.photos[photos[openPhoto].stage], vars)} />
            <figcaption>
              <b id={`photo-${parcel.id}`}>{fill(o.photos[photos[openPhoto].stage], vars)}</b>
              <span>{fill(o.photos.note, { ...vars, date: formatDateTime(photos[openPhoto].at, locale) })}</span>
            </figcaption>
            {photos.length > 1 && (
              <div className="photo-view-nav">
                {photos.map((ph, n) => (
                  <button
                    key={`${ph.stage}-${n}`}
                    type="button"
                    className={n === openPhoto ? "on" : ""}
                    onClick={() => setOpenPhoto(n)}
                    aria-label={fill(o.photos[ph.stage], vars)}
                  >
                    <img src={ph.src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </figure>
        )}
      </Modal>

      {courierDelay && (status === "in_transit" || status === "at_hub" || status === "intl_transit") && (
        <div className="courier-delay" role="status">
          <b>⏱ {o.delay.courierTitle}</b>
          <span>{fill(o.delay.courierNote, { ...vars, courier: courierName })}</span>
        </div>
      )}

      {status === "delivered" && <AfterDelivery order={order} parcel={parcel} />}

      {!cancelled && <PayoutTrace order={order} parcel={parcel} paidOut={paidOut} currency={displayCurrency} />}

      <details className="history">
        <summary>{o.history}</summary>
        <ul>
          {[...parcel.events].reverse().map((e, i) => (
            <li key={i}>
              <time>{formatDateTime(e.at, locale)}</time>
              <span>
                {fill(o.events[eventKey(parcel, e)], {
                  ...vars,
                  ...(e.type === "extended" && e.dispatchBy ? { date: formatDay(e.dispatchBy, locale) } : {}),
                  ...(e.type === "courier_delay" ? { courier: courierName } : {}),
                })}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </article>
  );
}

/**
 * "El camino de tu pago": transparencia opcional para el comprador. El último paso lo
 * confirma el propio artesano por WhatsApp, no solo la plataforma.
 */
function PayoutTrace({
  order,
  parcel,
  paidOut,
  currency,
}: {
  order: Order;
  parcel: Parcel;
  paidOut?: Extract<ParcelEvent, { type: "paid_out" }>;
  currency: Currency;
}) {
  const { t, locale } = useI18n();
  const { rate: penPerUsd } = useCurrency();
  const p = t.order.payout;
  const delivered = findEvent(parcel, "delivered");
  const confirmed = findEvent(parcel, "payout_confirmed");
  const artisanPen = parcelArtisanAmount(parcel);
  // El artesano cobra en soles; al comprador extranjero le mostramos también el equivalente.
  const artisanAmount =
    currency === "USD"
      ? `${formatPen(artisanPen)} (≈ ${formatAmount(artisanPen, "USD", penPerUsd)})`
      : formatPen(artisanPen);
  const v = { artisan: parcel.artisanFirstName, artisanAmount, account: parcel.payoutAccount };

  const steps = [
    {
      done: true,
      title: p.received,
      body: fill(p.receivedBody, {
        amount: formatAmount(parcelTotal(parcel), currency, penPerUsd),
        date: formatDay(order.createdAt, locale),
      }),
    },
    { done: Boolean(delivered), title: p.held, body: p.heldBody },
    {
      done: Boolean(paidOut),
      title: fill(p.sent, v),
      body: paidOut
        ? fill(p.sentBody, { ...v, operation: paidOut.operation, date: formatDay(paidOut.at, locale) })
        : delivered
          ? fill(p.sentScheduled, { ...v, date: formatDay(delivered.payoutOn, locale) })
          : fill(p.sentPending, v),
    },
    {
      done: Boolean(confirmed),
      title: fill(p.confirmed, v),
      body: confirmed ? fill(p.confirmedBody, { date: formatDay(confirmed.at, locale) }) : p.confirmedPending,
      extra:
        confirmed && paidOut ? (
          <ConfirmationShot
            parcel={parcel}
            amount={formatPen(artisanPen)}
            operation={paidOut.operation}
            sentAt={paidOut.at}
            confirmedAt={confirmed.at}
            caption={fill(p.shotCaption, v)}
          />
        ) : null,
    },
  ];

  return (
    <details className="payout">
      <summary>
        <span aria-hidden="true">💸</span> {p.toggle}
        {confirmed && <span className="payout-ok">✓</span>}
      </summary>
      <p className="payout-intro">{p.intro}</p>
      <ol className="payout-steps">
        {steps.map((s) => (
          <li key={s.title} className={s.done ? "done" : ""}>
            <b>{s.title}</b>
            <span>{s.body}</span>
            {"extra" in s && s.extra}
          </li>
        ))}
      </ol>
    </details>
  );
}

const clock = (iso: string) =>
  new Intl.DateTimeFormat("es-PE", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

/** "Julián Ricse Poma" → "Julián R. P.": nombre de pila y solo iniciales de los apellidos. */
function maskName(fullName: string): string {
  const [first, ...rest] = fullName.split(" ").filter((w) => /^\p{Lu}/u.test(w));
  return [first, ...rest.slice(0, 2).map((w) => `${w[0]}.`)].join(" ");
}

/**
 * Captura del chat de WhatsApp (vista desde la cuenta de Conecta) donde el artesano
 * confirma que recibió su pago. Foto, apellidos y número van ocultos.
 * El chat se muestra tal como ocurrió: en español.
 */
function ConfirmationShot(props: {
  parcel: Parcel;
  amount: string;
  operation: string;
  sentAt: string;
  confirmedAt: string;
  caption: string;
}) {
  const { parcel, amount, operation, sentAt, confirmedAt, caption } = props;
  return (
    <figure className="wa-shot">
      <div className="wa-shot-screen">
        <div className="wa-shot-head">
          <span className="wa-shot-avatar" aria-hidden="true">
            <span>{parcel.artisanFirstName[0]}</span>
          </span>
          <div>
            <p className="wa-shot-name">{maskName(parcel.artisanFullName)}</p>
            <p className="wa-shot-phone">{parcel.artisanPhoneMasked}</p>
          </div>
        </div>
        <div className="wa-shot-body">
          <div className="wa-msg out">
            💰 Te depositamos <b>{amount}</b> en tu cuenta <b>{parcel.payoutAccount}</b>.{"\n"}N.° de operación:{" "}
            <b>{operation}</b>
            <span className="wa-time">
              {clock(sentAt)}
              <span className="wa-ticks"> ✓✓</span>
            </span>
          </div>
          <div className="wa-msg in">
            1. Sí, lo recibí 🙏
            <span className="wa-time">{clock(confirmedAt)}</span>
          </div>
        </div>
      </div>
      <figcaption>🔒 {caption}</figcaption>
    </figure>
  );
}
