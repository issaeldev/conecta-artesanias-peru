import { useState } from "react";
import { products } from "@/data/products";
import { workshops } from "@/data/workshops";
import { paths } from "@/hooks/useRoute";
import { useI18n } from "@/i18n/I18nProvider";
import { decodePassport, passportUrl } from "@/lib/passport";
import { formatPen } from "@/lib/pricing";
import { fill, formatDay } from "@/lib/text";
import { useOrders } from "@/state/OrdersProvider";
import { QrCode } from "./QrCode";
import "./Passport.css";

/**
 * Pasaporte de la pieza: certificado público de autenticidad. Se arma solo con el enlace
 * (ver lib/passport.ts), así que funciona al escanear el QR desde cualquier celular.
 */
export function PassportPage({ code }: { code: string }) {
  const { t, locale } = useI18n();
  const p = t.passport;
  const { getOrder } = useOrders();
  const [copied, setCopied] = useState(false);
  const data = decodePassport(code);
  const workshop = data && workshops.find((w) => w.id === data.workshopId);
  const pieces = data ? data.productIds.map((id) => products.find((x) => x.id === id)).filter((x) => !!x) : [];

  if (!data || !workshop || pieces.length === 0) {
    return (
      <section className="co-page">
        <div className="w co-empty">
          <h1>{p.invalid}</h1>
          <p>{p.invalidHint}</p>
          <a className="btn" href="#top">
            {p.home}
          </a>
        </div>
      </section>
    );
  }

  const artisan = workshop.artisanName[locale];
  const firstName = artisan.split(/[\s,]+/)[0];
  const community = workshop.community[locale].split(",")[0];
  const url = passportUrl(data);
  const orderId = data.serial.split("-").slice(0, 2).join("-");
  const ownOrder = getOrder(orderId);
  const main = pieces[0];

  const share = async () => {
    const text = fill(p.shareText, { artisan: firstName, community });
    try {
      if (navigator.share) {
        await navigator.share({ title: p.heading, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* el usuario canceló o no hay permisos */
    }
  };

  return (
    <section className="co-page passport-page">
      <div className="w">
        <article className="passport" aria-labelledby="passport-title">
          <header className="passport-head">
            <span className="passport-seal" aria-hidden="true">
              ◆
            </span>
            <div>
              <p className="passport-issuer">{p.issuer}</p>
              <h1 id="passport-title">{p.heading}</h1>
            </div>
            <p className="passport-serial">
              <small>{p.serial}</small>
              <b>{data.serial}</b>
            </p>
          </header>

          <div className="passport-main">
            <img className="passport-photo" src={main.image.src} alt={main.name[locale]} />
            <div className="passport-info">
              <h2>{pieces.map((x) => x.name[locale]).join(" · ")}</h2>
              {data.custom && (
                <p className="passport-custom">
                  ✎ {p.custom}: {data.custom}
                </p>
              )}
              <div className="passport-maker">
                <img src={workshop.portrait ?? workshop.cover.src} alt="" style={{ objectPosition: workshop.cover.position }} />
                <div>
                  <small>{p.madeBy}</small>
                  <b>{artisan}</b>
                  <span>
                    {community} · {workshop.regionName}, Perú
                  </span>
                </div>
              </div>
              <dl className="passport-facts">
                <div>
                  <dt>{p.technique}</dt>
                  <dd>{main.technique[locale]}</dd>
                </div>
                <div>
                  <dt>{p.materials}</dt>
                  <dd>{main.materials[locale]}</dd>
                </div>
                <div>
                  <dt>{p.years}</dt>
                  <dd>{fill(p.yearsValue, { n: workshop.yearsOfCraft })}</dd>
                </div>
                {data.workDays ? (
                  <div>
                    <dt>{p.workDays}</dt>
                    <dd>{fill(p.workDaysValue, { n: data.workDays })}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </div>

          {data.photos.length > 0 && (
            <div className="passport-section">
              <h3>{p.photos}</h3>
              <ul className="passport-photos">
                {data.photos.map((ph, n) => (
                  <li key={`${ph.stage}-${n}`}>
                    <img src={ph.src} alt="" />
                    <span>
                      {ph.stage === "progress" ? p.photoProgress : p.photoFinished} · {formatDay(ph.at, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={`passport-section passport-pay${data.payout ? " ok" : ""}`}>
            <h3>
              {data.payout?.confirmedAt ? "✓ " : ""}
              {p.fairPay}
            </h3>
            {data.payout ? (
              <p>
                {fill(p.fairPayBody, {
                  artisan: firstName,
                  amount: formatPen(data.payout.amount),
                  date: formatDay(data.payout.at, locale),
                  operation: data.payout.operation,
                })}{" "}
                {data.payout.confirmedAt && fill(p.fairPayConfirmed, { artisan: firstName })}
              </p>
            ) : (
              <p>{fill(p.fairPayPending, { artisan: firstName })}</p>
            )}
          </div>

          <footer className="passport-foot">
            <div>
              <p className="passport-delivered">
                {fill(p.delivered, {
                  buyer: data.buyer,
                  destination: data.destination,
                  date: formatDay(data.deliveredAt, locale),
                })}
              </p>
              <blockquote className="passport-quote">“{workshop.quote[locale]}”</blockquote>
              <p className="passport-demo">{p.demo}</p>
            </div>
            <figure className="passport-qr">
              <QrCode text={url} label={p.scan} size={168} />
              <figcaption>{p.scan}</figcaption>
            </figure>
          </footer>
        </article>

        <div className="passport-actions">
          <button type="button" className="btn" onClick={share}>
            {copied ? p.copied : p.share}
          </button>
          <button type="button" className="btn o" onClick={() => window.print()}>
            {p.print}
          </button>
          {ownOrder ? (
            <a className="btn o" href={paths.order(ownOrder.id)}>
              {p.back}
            </a>
          ) : (
            <a className="btn o" href="#catalogo">
              {p.home}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
