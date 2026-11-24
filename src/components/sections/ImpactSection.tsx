import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/I18nProvider";
import { computeImpact, liveTestimonials, sampleTestimonials } from "@/lib/impact";
import { formatAmount, splitPrice } from "@/lib/pricing";
import { fill } from "@/lib/text";
import { useCatalog } from "@/state/CatalogProvider";
import { useCurrency } from "@/state/CurrencyProvider";
import { useOrders } from "@/state/OrdersProvider";
import { SectionHeading } from "@/components/ui/SectionHeading";
import "./ImpactSection.css";

/** Cuenta animada hasta `value` (desde el valor anterior). Sin animación si se pidió menos movimiento. */
function useCountUp(value: number, ms = 1200): number {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(value);
      from.current = value;
      return;
    }
    const start = performance.now();
    const origin = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - k, 3);
      setShown(origin + (value - origin) * eased);
      if (k < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return shown;
}

/**
 * "Impacto en vivo": soles transferidos, pedidos, talleres, comunidades y países.
 * Se calcula con los mismos eventos del seguimiento (paid_out), así que al completar un
 * pedido en la demo el contador sube. Debajo, los mensajes que los compradores autorizaron.
 */
export function ImpactSection() {
  const { t, locale } = useI18n();
  const i = t.impact;
  const { orders } = useOrders();
  const { workshops } = useCatalog();
  const { currency, rate } = useCurrency();
  const impact = computeImpact(orders, workshops);
  const transferred = useCountUp(impact.transferredPen);
  const delivered = useCountUp(impact.deliveredOrders);
  const share = Math.round((splitPrice(100, siteConfig.pricing).artisan / 100) * 100);
  const money = (n: number) => formatAmount(n, currency, rate).replace(/\.\d\d$/, "");

  const live = liveTestimonials(orders);
  const quotes = [
    ...live.map((q) => ({ ...q, key: q.id })),
    ...sampleTestimonials.map((s) => ({
      ...s,
      key: s.id,
      place: s.place[locale],
      message: s.message[locale],
      live: false,
    })),
  ].slice(0, 3);

  const stats = [
    { value: money(transferred), label: i.transferred, main: true },
    { value: Math.round(delivered).toLocaleString(locale === "en" ? "en-US" : "es-PE"), label: i.orders },
    { value: `${share}%`, label: i.share },
    { value: String(impact.communities), label: i.communities },
    { value: String(impact.countries), label: i.countries },
  ];

  return (
    <section id="impacto" className="impact">
      <div className="w">
        <SectionHeading title={i.title} sub={i.sub} />
        <div className="impact-stats">
          {stats.map((s) => (
            <div key={s.label} className={`impact-stat${s.main ? " main" : ""}`}>
              <b>{s.value}</b>
              <span>{s.label}</span>
              {s.main && impact.liveTransferredPen > 0 && (
                <em className="impact-live">
                  <span className="impact-pulse" aria-hidden="true" />
                  {fill(i.liveAdded, { amount: formatAmount(impact.liveTransferredPen, currency, rate) })}
                </em>
              )}
            </div>
          ))}
        </div>
        <p className="impact-note">{i.demoNote}</p>

        <h3 className="impact-h">{i.testimonialsTitle}</h3>
        <ul className="impact-quotes">
          {quotes.map((q) => {
            const w = workshops.find((x) => x.id === q.workshopId);
            const artisan = w ? w.artisanName[locale].split(/[\s,]+/)[0] : "";
            return (
              <li key={q.key} className="impact-quote">
                {q.photo && <img src={q.photo} alt="" />}
                <blockquote>“{q.message}”</blockquote>
                <p>
                  <b>{q.buyer}</b> · {q.place} · {fill(i.toArtisan, { artisan })}
                  {q.live && <span className="impact-badge">{i.liveBadge}</span>}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
