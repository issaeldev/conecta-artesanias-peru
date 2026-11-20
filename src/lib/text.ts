/** Reemplaza {clave} en un texto traducido: fill("Hola, {name}", { name: "Ana" }). */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}

/** Fecha larga en el idioma activo: "lunes, 24 de noviembre" / "Monday, November 24". */
export function formatDay(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

/** Fecha y hora cortas: "19 nov, 10:32". */
export function formatDateTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-PE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
