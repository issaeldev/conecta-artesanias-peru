import type { Localized } from "@/types/domain";

/** Zonas de tarifa para el envío internacional (consolidado en Lima). */
export type ShippingZone = "americas" | "europe" | "world";

export interface Country {
  code: string;
  name: Localized;
  zone: ShippingZone | "domestic";
}

/** Países de destino disponibles en el checkout. Perú va primero (envío nacional). */
export const countries: Country[] = [
  { code: "PE", name: { es: "Perú", en: "Peru" }, zone: "domestic" },
  { code: "US", name: { es: "Estados Unidos", en: "United States" }, zone: "americas" },
  { code: "CA", name: { es: "Canadá", en: "Canada" }, zone: "americas" },
  { code: "MX", name: { es: "México", en: "Mexico" }, zone: "americas" },
  { code: "CO", name: { es: "Colombia", en: "Colombia" }, zone: "americas" },
  { code: "EC", name: { es: "Ecuador", en: "Ecuador" }, zone: "americas" },
  { code: "BO", name: { es: "Bolivia", en: "Bolivia" }, zone: "americas" },
  { code: "CL", name: { es: "Chile", en: "Chile" }, zone: "americas" },
  { code: "AR", name: { es: "Argentina", en: "Argentina" }, zone: "americas" },
  { code: "UY", name: { es: "Uruguay", en: "Uruguay" }, zone: "americas" },
  { code: "BR", name: { es: "Brasil", en: "Brazil" }, zone: "americas" },
  { code: "ES", name: { es: "España", en: "Spain" }, zone: "europe" },
  { code: "FR", name: { es: "Francia", en: "France" }, zone: "europe" },
  { code: "DE", name: { es: "Alemania", en: "Germany" }, zone: "europe" },
  { code: "IT", name: { es: "Italia", en: "Italy" }, zone: "europe" },
  { code: "PT", name: { es: "Portugal", en: "Portugal" }, zone: "europe" },
  { code: "NL", name: { es: "Países Bajos", en: "Netherlands" }, zone: "europe" },
  { code: "BE", name: { es: "Bélgica", en: "Belgium" }, zone: "europe" },
  { code: "CH", name: { es: "Suiza", en: "Switzerland" }, zone: "europe" },
  { code: "GB", name: { es: "Reino Unido", en: "United Kingdom" }, zone: "europe" },
  { code: "SE", name: { es: "Suecia", en: "Sweden" }, zone: "europe" },
  { code: "JP", name: { es: "Japón", en: "Japan" }, zone: "world" },
  { code: "KR", name: { es: "Corea del Sur", en: "South Korea" }, zone: "world" },
  { code: "CN", name: { es: "China", en: "China" }, zone: "world" },
  { code: "AU", name: { es: "Australia", en: "Australia" }, zone: "world" },
  { code: "NZ", name: { es: "Nueva Zelanda", en: "New Zealand" }, zone: "world" },
];

export function findCountry(code: string): Country | undefined {
  return countries.find((c) => c.code === code);
}
