import { products } from "@/data/products";
import { regions } from "@/data/regions";
import { workshops } from "@/data/workshops";
import type { Product, Region, Workshop } from "@/types/domain";

export interface CatalogData {
  products: Product[];
  regions: Region[];
  workshops: Workshop[];
}

/**
 * Capa de acceso a datos del catálogo.
 *
 * Hoy devuelve datos de ejemplo locales. Para conectar un backend real basta con
 * reemplazar el cuerpo por `fetch(`${import.meta.env.VITE_API_URL}/catalog`)`
 * (u otro cliente) manteniendo la misma firma: el resto de la app no cambia.
 */
export async function fetchCatalog(): Promise<CatalogData> {
  return { products, regions, workshops };
}
