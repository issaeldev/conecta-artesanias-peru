import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/I18nProvider";
import { openAssistant } from "@/components/assistant/assistantBus";
import { navigate, paths } from "@/hooks/useRoute";
import { ShieldIcon } from "@/components/checkout/Guarantee";
import { useCart } from "@/state/CartProvider";
import { useCatalog } from "@/state/CatalogProvider";
import { useCurrency } from "@/state/CurrencyProvider";
import { useProductModal } from "@/state/ProductModalProvider";
import { Modal } from "@/components/ui/Modal";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { ProductImage } from "./ProductImage";
import "./Product.css";

/** Ficha completa de una pieza: historia, técnica, especificaciones y botón para agregar al pedido. */
export function ProductDetailModal() {
  const { t, locale } = useI18n();
  const { productId, closeProduct } = useProductModal();
  const { getProduct } = useCatalog();
  const { format } = useCurrency();
  const cart = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => setQuantity(1), [productId]);

  const product = productId ? getProduct(productId) : undefined;
  if (!product) return null;

  const p = t.product;
  const name = product.name[locale];

  const addToOrder = () => {
    cart.add(product.id, quantity);
    closeProduct();
    cart.open();
  };

  return (
    <Modal open onClose={closeProduct} labelledBy="product-title">
      <ProductImage product={product} alt={name} large />
      <h2 id="product-title">{name}</h2>
      <div className="tag">
        {product.location} · {p.sample}
      </div>
      <div className="price">{format(product.price)}</div>
      <p className="story">{product.story[locale]}</p>
      <div className="creation-meta">
        <div>
          <b>{p.createdBy}</b>
          {product.artisanName}
        </div>
        <div>
          <b>{p.technique}</b>
          <span className="technique">{product.technique[locale]}</span>
        </div>
        <div>
          <b>{p.materials}</b>
          {product.materials[locale]}
        </div>
        <div>
          <b>{p.meaning}</b>
          {product.meaning[locale]}
        </div>
      </div>
      <ul className="spec">
        <li>
          <b>{p.material}:</b> {product.material[locale]}
        </li>
        <li>
          <b>{p.size}:</b> {product.size[locale]}
        </li>
        <li>
          <b>{p.shipping}:</b> {p.shippingValue}
        </li>
        <li>
          <b>{p.region}:</b> {product.originRegion}
        </li>
        <li>
          <b>{p.availability}:</b> {p.availabilityValue}
        </li>
        <li>
          <b>{p.eta}:</b> {product.eta[locale]}
        </li>
      </ul>
      <h3>{p.photosTitle}</h3>
      <ul className="spec">
        {product.photoChecklist[locale].map((photo) => (
          <li key={photo}>{photo}</li>
        ))}
      </ul>
      <p className="tag">{p.photoRule}</p>
      <div className="buy">
        <QuantityStepper
          value={quantity}
          onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
          onIncrease={() => setQuantity((q) => Math.min(siteConfig.maxQuantityPerItem, q + 1))}
          decreaseLabel={p.decrease}
          increaseLabel={p.increase}
        />
        <button className="btn" type="button" onClick={addToOrder}>
          {p.addToOrder} · S/ {product.price}
        </button>
      </div>
      <button
        className="btn o"
        type="button"
        onClick={() => {
          closeProduct();
          navigate(paths.customForm(product.id));
        }}
      >
        ✎ {t.custom.button}
      </button>
      <p className="guarantee-line">
        <ShieldIcon /> {p.guarantee}
      </p>
      <button
        className="btn o"
        type="button"
        onClick={() => {
          closeProduct();
          openAssistant();
        }}
      >
        {p.askWhatsApp}
      </button>
    </Modal>
  );
}
