import { useMemo, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { fill } from "@/lib/text";
import { filterProducts, type CategoryFilter } from "@/lib/catalogFilter";
import { useCatalog } from "@/state/CatalogProvider";
import { useCurrency } from "@/state/CurrencyProvider";
import { useProductModal } from "@/state/ProductModalProvider";
import { Chip } from "@/components/ui/Chip";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/product/ProductCard";
import "./Catalog.css";

const CATEGORIES: CategoryFilter[] = ["all", "textil", "ceramica", "decoracion"];

export function Catalog() {
  const { t, locale } = useI18n();
  const { products, status } = useCatalog();
  const { currency, toggleCurrency, rate: penPerUsd, rateDate } = useCurrency();
  const { openProduct } = useProductModal();

  const [category, setCategory] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");

  const rate = penPerUsd.toFixed(rateDate ? 3 : 2);
  const rateLabel = locale === "es" ? rate.replace(".", ",") : rate;

  const visible = useMemo(
    () => filterProducts(products, { category, query, locale }),
    [products, category, query, locale],
  );

  return (
    <section id="catalogo">
      <div className="w">
        <SectionHeading title={t.catalog.title} sub={t.catalog.sub} />
        <div className="tb">
          <input
            type="search"
            aria-label={t.catalog.searchLabel}
            placeholder={t.catalog.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Chip onClick={toggleCurrency}>{t.catalog.currencyToggle}</Chip>
          <small>
            {currency === "USD" ? fill(rateDate ? t.catalog.fxLive : t.catalog.fxNote, { rate: rateLabel, date: rateDate ? new Date(`${rateDate}T12:00:00`).toLocaleDateString(locale === "en" ? "en-US" : "es-PE", { day: "numeric", month: "short" }) : "" }) : ""}
          </small>
        </div>
        <div className="chips">
          {CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {t.catalog.categories[c]}
            </Chip>
          ))}
        </div>
        <div className="grid">
          {status === "loading" && <p className="sub">{t.catalog.loading}</p>}
          {status === "error" && <p className="sub">{t.catalog.error}</p>}
          {status === "ready" &&
            (visible.length ? (
              visible.map((p) => <ProductCard key={p.id} product={p} onOpen={openProduct} />)
            ) : (
              <p className="sub">{t.catalog.noResults}</p>
            ))}
        </div>
      </div>
    </section>
  );
}
