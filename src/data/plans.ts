import type { ArtisanPlan } from "@/types/domain";

/** Planes y porcentajes de ejemplo para el prototipo (por definir con el equipo). */
export const artisanPlans: ArtisanPlan[] = [
  {
    id: "basico",
    name: { es: "Básico", en: "Basic" },
    commission: 15,
    features: {
      es: ["Perfil y hasta 5 productos", "Fotos estandarizadas con guía simple", "Publicación en el catálogo web"],
      en: ["Profile and up to 5 products", "Standardized photos with a simple guide", "Listing in the web catalog"],
    },
  },
  {
    id: "intermedio",
    name: { es: "Intermedio", en: "Intermediate" },
    commission: 18,
    featured: true,
    features: {
      es: ["Todo lo del Básico, hasta 15 productos", "Sesión de fotos y video corto", "Historia del artesano en redes"],
      en: ["Everything in Basic, up to 15 products", "Photo session and short video", "Artisan story on social media"],
    },
  },
  {
    id: "premium",
    name: { es: "Premium", en: "Premium" },
    commission: 20,
    features: {
      es: [
        "Todo lo del Intermedio, catálogo amplio",
        "Campañas pagadas y contenido mensual",
        "Mercado internacional (ficha en inglés)",
      ],
      en: [
        "Everything in Intermediate, wide catalog",
        "Paid campaigns and monthly content",
        "International market (page in English)",
      ],
    },
  },
];
