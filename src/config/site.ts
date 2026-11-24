/** Configuración del sitio. Los valores sensibles al entorno se leen de variables VITE_*. */
export const siteConfig = {
  name: "Conecta Artesanías Perú",
  /** Número de WhatsApp Business (formato internacional, sin "+"). Vacío = wa.me sin destinatario. */
  whatsappNumber: (import.meta.env.VITE_WHATSAPP_NUMBER ?? "").replace(/\D/g, ""),
  /** Tipo de cambio de respaldo (soles por dólar) si no se obtiene el del BCRP del día. */
  penPerUsd: Number(import.meta.env.VITE_PEN_PER_USD) || 3.5,
  /** Cantidad máxima de una misma pieza por pedido. */
  maxQuantityPerItem: 20,
  /**
   * Cómo se forma el precio de catálogo: precio del artesano + comisión + IGV.
   * SUPUESTOS del prototipo: confirmar con contabilidad antes de usar en producción.
   */
  pricing: {
    /** Comisión de la plataforma como % del precio del artesano. */
    commissionRate: 0.15,
    igvRate: 0.18,
    /**
     * Sobre qué se aplica el IGV:
     * - "commission": solo sobre la comisión (artesano en Nuevo RUS, sin IGV propio).
     * - "all": sobre precio del artesano + comisión.
     */
    igvBase: "commission" as "commission" | "all",
  },
  /** Logística simulada (un envío por taller, porque cada uno despacha desde su comunidad). */
  logistics: {
    courier: "Olva Courier",
    /** Costo de envío por taller, en soles. */
    shippingLima: 12,
    shippingProvince: 22,
    /** Días hábiles que tiene el artesano para despachar una pieza de catálogo. */
    dispatchDays: 2,
    transitDaysLima: 2,
    transitDaysProvince: 4,
    /**
     * Internacional: cada taller envía a nuestro centro en Lima, donde se revisa y
     * consolida todo el pedido en UN solo paquete. Un único costo por pedido, según zona.
     */
    international: {
      courier: "DHL Express",
      hub: "Centro Conecta · Lima",
      shipping: { americas: 130, europe: 170, world: 200 },
      /** Días hábiles desde la fecha de despacho del taller hasta la entrega. */
      transitDays: 10,
    },
  },
  social: ["Instagram", "Facebook", "TikTok"],
  copyrightYear: 2026,
} as const;
