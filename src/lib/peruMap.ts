/**
 * Geografía simplificada del Perú para el mapa SVG (viewBox 320×460).
 * Los puntos son coordenadas reales aproximadas (longitud, latitud) de la costa y las
 * fronteras; se proyectan con una equirectangular corregida por la latitud media.
 * Es un mapa referencial, no cartográfico.
 */
type LonLat = [number, number];

const LON_MIN = -81.5;
const LAT_MAX = 0.2;
const K = 23; // px por grado de latitud
const KX = K * Math.cos((9.5 * Math.PI) / 180); // px por grado de longitud
const PAD = 10;

export function project([lon, lat]: LonLat): [number, number] {
  return [Math.round((PAD + (lon - LON_MIN) * KX) * 10) / 10, Math.round((PAD + (LAT_MAX - lat) * K) * 10) / 10];
}

/** Contorno en sentido horario desde la frontera con Ecuador en la costa (Tumbes). */
const OUTLINE: LonLat[] = [
  // Frontera con Ecuador
  [-80.3, -3.4], [-80.15, -3.9], [-79.95, -4.38], [-79.45, -4.52], [-79.05, -4.98], [-78.7, -4.55],
  [-78.4, -3.75], [-77.85, -2.98], [-76.65, -2.57], [-75.55, -1.55], [-75.25, -0.95], [-75.45, -0.4],
  [-75.2, -0.04],
  // Frontera con Colombia (río Putumayo y trapecio amazónico)
  [-74.8, -0.2], [-74.25, -0.95], [-73.55, -1.25], [-72.85, -2.35], [-71.75, -2.15], [-70.9, -2.25],
  [-70.05, -2.75], [-70.72, -3.78], [-69.95, -4.23],
  // Frontera con Brasil (río Yavarí, Sierra del Divisor y Acre)
  [-71.4, -4.45], [-72.25, -4.9], [-72.85, -5.15], [-73.2, -5.75], [-73.55, -6.55], [-73.75, -7.35],
  [-73.7, -7.95], [-73.55, -8.4], [-73.0, -9.0], [-72.4, -9.5], [-71.35, -9.95], [-70.55, -9.45],
  [-70.6, -11.0], [-69.6, -10.95],
  // Frontera con Bolivia (río Heath y lago Titicaca)
  [-68.7, -12.5], [-68.95, -12.9], [-68.85, -14.25], [-69.25, -14.8], [-69.4, -15.3], [-69.15, -15.95],
  [-69.03, -16.55], [-69.55, -17.2], [-69.48, -17.5],
  // Frontera con Chile
  [-69.85, -17.8], [-70.15, -18.15], [-70.38, -18.35],
  // Costa del Pacífico, de sur a norte
  [-71.0, -17.85], [-71.34, -17.64], [-72.02, -17.03], [-72.7, -16.62], [-73.7, -16.22], [-74.25, -15.85],
  [-75.2, -15.35], [-75.95, -14.65], [-76.3, -13.85], [-76.4, -13.08], [-76.8, -12.48], [-77.15, -12.05],
  [-77.62, -11.11], [-77.77, -10.75], [-78.17, -10.07], [-78.6, -9.08], [-79.05, -8.1], [-79.57, -7.4],
  [-79.95, -6.84], [-80.6, -6.2], [-81.15, -5.92], [-80.85, -5.55], [-81.12, -5.08], [-81.33, -4.68],
  [-81.05, -4.1], [-80.45, -3.57],
];

const TITICACA: LonLat[] = [
  [-69.95, -15.4], [-69.55, -15.25], [-69.2, -15.55], [-68.95, -16.1], [-69.05, -16.45], [-69.4, -16.3],
  [-69.7, -16.1], [-69.95, -15.75],
];

/** Eje de los Andes, de norte a sur. */
const ANDES: LonLat[] = [
  [-79.35, -5.6], [-78.55, -7.2], [-77.6, -9.1], [-76.7, -10.9], [-75.9, -12.3], [-74.6, -13.6],
  [-73.1, -14.6], [-71.6, -15.4], [-70.6, -16.4], [-70.0, -17.3],
];

/** Cumbres de referencia: Huascarán, Huaytapallana, Ausangate, Coropuna, Misti, etc. */
const PEAKS: LonLat[] = [
  [-78.6, -7.3], [-77.6, -9.12], [-75.05, -11.92], [-74.4, -13.9], [-71.23, -13.79], [-72.65, -15.52],
  [-71.4, -16.29],
];

const toPath = (pts: LonLat[]) =>
  pts.map((p, i) => `${i ? "L" : "M"}${project(p).join(" ")}`).join("") + "Z";

export const PERU_PATH = toPath(OUTLINE);
export const TITICACA_PATH = toPath(TITICACA);
export const ANDES_POINTS = ANDES.map((p) => project(p).join(",")).join(" ");
export const PEAK_POINTS = PEAKS.map(project);
export const LIMA = project([-77.04, -12.05]);

/** Ubicación real de cada región del catálogo (capital o comunidad artesana). */
export const REGION_POSITIONS: Record<string, [number, number]> = {
  puno: project([-70.02, -15.84]),
  cusco: project([-71.97, -13.53]),
  ayacucho: project([-74.14, -13.05]), // Quinua
  junin: project([-75.21, -12.07]), // Huancayo
};
