import { useI18n } from "@/i18n/I18nProvider";
import { useCurrency } from "@/state/CurrencyProvider";
import type { Product } from "@/types/domain";
import { ProductImage } from "./ProductImage";
import "./Product.css";

interface ProductCardProps {
  product: Product;
  onOpen: (id: string) => void;
}

export function ProductCard({ product, onOpen }: ProductCardProps) {
  const { t, locale } = useI18n();
  const { format } = useCurrency();
  const name = product.name[locale];

  return (
    <button type="button" className="card pc" onClick={() => onOpen(product.id)}>
      <ProductImage product={product} alt={name} />
      <h3>{name}</h3>
      <div className="tag">
        {product.artisanName} · {product.location}
      </div>
      <p className="tag">{product.technique[locale]}</p>
      <div className="price">{format(product.price)}</div>
      <span className="more">{t.catalog.viewDetail}</span>
    </button>
  );
}
