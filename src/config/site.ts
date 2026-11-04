/** Configuración del sitio. Los valores sensibles al entorno se leen de variables VITE_*. */
export const siteConfig = {
  name: "Conecta Artesanías Perú",
  /** Número de WhatsApp Business (formato internacional, sin "+"). Vacío = wa.me sin destinatario. */
  whatsappNumber: (import.meta.env.VITE_WHATSAPP_NUMBER ?? "").replace(/\D/g, ""),
  /** Tipo de cambio supuesto (no actualizado en línea): soles por dólar. */
  penPerUsd: Number(import.meta.env.VITE_PEN_PER_USD) || 3.5,
  /** Cantidad máxima de una misma pieza por pedido. */
  maxQuantityPerItem: 20,
  social: ["Instagram", "Facebook", "TikTok"],
  copyrightYear: 2026,
} as const;
