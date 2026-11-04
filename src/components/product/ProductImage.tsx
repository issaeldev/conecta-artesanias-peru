import type { Product } from "@/types/domain";

interface ProductImageProps {
  product: Product;
  alt: string;
  large?: boolean;
}

/** Contenedor de foto con el color de fondo y el encuadre definidos para cada pieza. */
export function ProductImage({ product, alt, large = false }: ProductImageProps) {
  const { src, fit, background } = product.image;
  return (
    <div className={large ? "pimg big2" : "pimg"} style={{ background }}>
      <img src={src} alt={alt} loading="lazy" style={{ objectFit: fit }} />
    </div>
  );
}
