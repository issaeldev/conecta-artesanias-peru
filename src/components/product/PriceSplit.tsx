import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/I18nProvider";
import { formatAmount, splitPrice } from "@/lib/pricing";
import { fill } from "@/lib/text";
import { useCurrency } from "@/state/CurrencyProvider";
import type { Product } from "@/types/domain";

const pct = (n: number) => `${Math.round(n * 100)}%`;

/** "Wilber, esposo de Lucía" → "Wilber"; "Rosa Mamani Quispe" → "Rosa". */
export const artisanFirstName = (fullName: string) => fullName.split(/[\s,]+/)[0];

/**
 * A dónde va el precio de una pieza: artesano, Servicio Conecta e IGV.
 * Es el mismo cálculo del checkout (splitPrice), mostrado antes de comprar.
 * - compact: barra fina + "84% para Rosa" (tarjeta del catálogo).
 * - full: barra, montos y la promesa de transferencia (ficha de producto).
 */
export function PriceSplit({ product, variant }: { product: Product; variant: "compact" | "full" }) {
  const { t } = useI18n();
  const { currency, rate } = useCurrency();
  const p = t.product.split;
  const c = t.checkout;
  const split = splitPrice(product.price, siteConfig.pricing);
  const artisan = artisanFirstName(product.artisanName);
  const share = pct(split.artisan / split.total);
  const money = (n: number) => formatAmount(n, currency, rate);
  const { commissionRate, igvRate, igvBase } = siteConfig.pricing;

  const bar = (
    <div className="split-bar" aria-hidden="true">
      <span className="seg-artisan" style={{ flexGrow: split.artisan }} />
      <span className="seg-commission" style={{ flexGrow: split.commission }} />
      <span className="seg-igv" style={{ flexGrow: split.igv }} />
    </div>
  );

  if (variant === "compact") {
    return (
      <div className="split split-compact">
        {bar}
        <span className="split-share">{fill(p.share, { pct: share, artisan })}</span>
      </div>
    );
  }

  return (
    <section className="split split-full" aria-labelledby={`split-${product.id}`}>
      <h3 id={`split-${product.id}`}>{fill(p.title, { price: money(split.total) })}</h3>
      {bar}
      <dl className="split-rows">
        <div>
          <dt>
            <i className="dot seg-artisan" /> {fill(p.artisan, { artisan })}
          </dt>
          <dd>
            <b>{money(split.artisan)}</b> <small>{share}</small>
          </dd>
        </div>
        <div>
          <dt>
            <i className="dot seg-commission" /> {fill(c.commission, { rate: pct(commissionRate) })}
            <small className="split-sub">{c.commissionSub}</small>
          </dt>
          <dd>{money(split.commission)}</dd>
        </div>
        <div>
          <dt>
            <i className="dot seg-igv" /> {fill(igvBase === "commission" ? c.igvCommission : c.igvAll, { rate: pct(igvRate) })}
          </dt>
          <dd>{money(split.igv)}</dd>
        </div>
      </dl>
      <p className="split-note">{fill(p.note, { artisan })}</p>
    </section>
  );
}
