/** Idiomas soportados por la interfaz. */
export type Locale = "es" | "en";

/** Texto traducido a todos los idiomas soportados. */
export type Localized<T = string> = Record<Locale, T>;

export type Currency = "PEN" | "USD";

export type ProductCategory = "textil" | "ceramica" | "decoracion";

export type QuizPurpose = "uso" | "decor" | "regalo";
export type QuizStyle = "color" | "sobrio" | "tradicion";

export interface ProductImage {
  src: string;
  /** Cómo encaja la foto en su contenedor. */
  fit: "cover" | "contain";
  /** Color de fondo detrás de la foto (útil con fit = contain). */
  background: string;
}

export interface Product {
  id: string;
  category: ProductCategory;
  artisanId: string;
  regionId: string;
  /** Precio en soles (PEN). */
  price: number;
  /** Comunidad · región, tal como se muestra en la ficha. */
  location: string;
  /** Región de origen mostrada en la ficha. */
  originRegion: string;
  artisanName: string;
  image: ProductImage;
  name: Localized;
  story: Localized;
  technique: Localized;
  materials: Localized;
  meaning: Localized;
  /** Material resumido para la lista de especificaciones. */
  material: Localized;
  size: Localized;
  /** Plazo estimado de preparación. */
  eta: Localized;
  /** Fotos que se pedirán al artesano. */
  photoChecklist: Localized<string[]>;
  /** Etiquetas para el recomendador "Encuentra tu pieza". */
  quizTags: { purpose: QuizPurpose; style: QuizStyle };
}

export interface Region {
  id: string;
  name: string;
  color: string;
  /** Posición del marcador en el mapa SVG (viewBox 320×460). */
  map: { x: number; y: number; labelSide: "start" | "end" };
  productIds: string[];
  area: Localized;
  technique: Localized;
  materials: Localized;
  description: Localized;
}

export interface Workshop {
  id: string;
  regionName: string;
  color: string;
  productIds: string[];
  title: Localized;
  technique: Localized;
  materials: Localized;
  /** Resumen corto que se ve siempre en la tarjeta. */
  bio: Localized;
  /** Nombre de quien lidera el taller. */
  artisanName: Localized;
  /** Comunidad o localidad, p. ej. "Chucuito, orillas del Titicaca". */
  community: Localized;
  yearsOfCraft: number;
  /** Frase en primera persona del artesano. */
  quote: Localized;
  /** Historia completa, un párrafo por elemento. */
  story: { es: string[]; en: string[] };
  /** Foto de portada del taller (manos, telar, piezas). */
  cover: { src: string; alt: Localized; position?: string };
  /** Retrato del artesano. Si falta, se muestran sus iniciales. */
  portrait?: string;
}

export interface JourneyStep {
  id: string;
  title: Localized;
  body: Localized;
  culturalValue: Localized;
  /** Foto del paso. Si no hay, se muestra la lista `highlights`. */
  photo?: { src: string; position: string };
  /** Puntos clave que se muestran cuando el paso no tiene foto. */
  highlights?: Localized<{ label: string; text: string }[]>;
}

export interface ArtisanPlan {
  id: string;
  name: Localized;
  commission: number;
  featured?: boolean;
  features: Localized<string[]>;
}

export interface FaqItem {
  id: string;
  question: Localized;
  answer: Localized;
}

export interface QuizOption<V extends string = string> {
  value: V;
  label: Localized;
}

export interface QuizQuestion {
  id: "purpose" | "style" | "budget";
  question: Localized;
  options: QuizOption[];
}

export type QuizAnswers = {
  purpose: QuizPurpose;
  style: QuizStyle;
  /** Presupuesto máximo en soles (Infinity = sin límite). */
  budget: number;
};
