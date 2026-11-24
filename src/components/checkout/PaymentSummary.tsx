import { useCurrency } from "@/state/CurrencyProvider";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/I18nProvider";
import { formatAmount } from "@/lib/pricing";
import { fill } from "@/lib/text";
import type { Currency } from "@/types/domain";
import type { OrderTotals } from "@/types/order";

const pct = (n: number) => `${Math.round(n * 100)}%`;

/** Totales del pedido con el desglose transparente de a dónde va el dinero. */
interface Props {
  totals: OrderTotals;
  workshops: number;
  international?: boolean;
  currency?: Currency;
}

export function PaymentSummary({ totals, workshops, international = false, currency = "PEN" }: Props) {
  const { t } = useI18n();
  const { rate: penPerUsd } = useCurrency();
  const c = t.checkout;
  const { commissionRate, igvRate, igvBase } = siteConfig.pricing;
  const formatPen = (n: number) => formatAmount(n, currency, penPerUsd);
  const share = totals.products > 0 ? totals.artisan / totals.products : 0;

  return (
    <div className="paysum">
      <dl className="paysum-rows">
        <div>
          <dt>{c.products}</dt>
          <dd>{formatPen(totals.products)}</dd>
        </div>
        <div>
          <dt>
            {international
              ? c.shippingIntl
              : fill(c.shipping, { count: workshops === 1 ? c.shippingOne : fill(c.shippingMany, { count: workshops }) })}
          </dt>
          <dd>{formatPen(totals.shipping)}</dd>
        </div>
        <div className="paysum-total">
          <dt>{c.total}</dt>
          <dd>{formatPen(totals.total)}</dd>
        </div>
      </dl>

      <div className="money">
        <p className="money-title">{c.whereMoney}</p>
        <div className="money-bar" aria-hidden="true">
          <span className="seg-artisan" style={{ flexGrow: totals.artisan }} />
          <span className="seg-commission" style={{ flexGrow: totals.commission }} />
          <span className="seg-igv" style={{ flexGrow: totals.igv }} />
        </div>
        <dl className="money-rows">
          <div>
            <dt>
              <i className="dot seg-artisan" /> {c.toArtisans}
            </dt>
            <dd>{formatPen(totals.artisan)}</dd>
          </div>
          <div>
            <dt>
              <i className="dot seg-commission" /> {fill(c.commission, { rate: pct(commissionRate) })}
              <small className="money-sub">{c.commissionSub}</small>
            </dt>
            <dd>{formatPen(totals.commission)}</dd>
          </div>
          <div>
            <dt>
              <i className="dot seg-igv" />{" "}
              {fill(igvBase === "commission" ? c.igvCommission : c.igvAll, { rate: pct(igvRate) })}
            </dt>
            <dd>{formatPen(totals.igv)}</dd>
          </div>
        </dl>
        <p className="money-share">{fill(c.artisanShare, { pct: pct(share) })}</p>
        <p className="money-note">{c.commissionExplain}</p>
      </div>
    </div>
  );
}
