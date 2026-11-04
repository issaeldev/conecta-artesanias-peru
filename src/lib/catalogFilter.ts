import type { Locale, Product, ProductCategory } from "@/types/domain";

export type CategoryFilter = ProductCategory | "all";

export interface CatalogFilter {
  category: CategoryFilter;
  query: string;
  locale: Locale;
}

/** Filtra por categoría y por texto (nombre, lugar, artesano o técnica). */
export function filterProducts(products: Product[], { category, query, locale }: CatalogFilter): Product[] {
  const q = query.trim().toLowerCase();
  return products.filter((p) => {
    if (category !== "all" && p.category !== category) return false;
    if (!q) return true;
    const haystack = [p.name[locale], p.location, p.artisanName, p.technique[locale]].join(" ").toLowerCase();
    return haystack.includes(q);
  });
}
