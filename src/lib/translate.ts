/**
 * Traducción de mensajes para el artesano (que lee en español), vía la API pública de
 * MyMemory (gratuita, sin clave, detecta el idioma de origen).
 * Sin dependencias para poder usarlo en la app y en la función de Vercel (api/).
 */
export interface Translation {
  /** Texto en español. */
  text: string;
  /** Código ISO del idioma original (p. ej. "en"). */
  from: string;
}

interface MyMemoryResponse {
  responseStatus?: number | string;
  responseDetails?: string;
  responseData?: { translatedText?: string; detectedLanguage?: string | null };
}

/** MyMemory admite hasta ~500 bytes por consulta. */
export const MAX_TRANSLATE_CHARS = 450;

export function myMemoryUrl(text: string, to = "es"): string {
  return `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${to}`;
}

/**
 * null = no hace falta traducir (ya está en español). Si el texto ya está en el idioma
 * destino, MyMemory responde 403 "PLEASE SELECT TWO DISTINCT LANGUAGES".
 * Lanza error si la respuesta no sirve, para que quien llama decida qué hacer.
 */
export function parseMyMemory(data: MyMemoryResponse, to = "es"): Translation | null {
  const details = data.responseDetails ?? "";
  if (/DISTINCT LANGUAGES/i.test(details)) return null;
  const from = (data.responseData?.detectedLanguage ?? "").slice(0, 2).toLowerCase();
  const text = data.responseData?.translatedText?.trim();
  if (Number(data.responseStatus) !== 200 || !text) throw new Error(details || "sin traducción");
  if (from === to) return null;
  return { text, from: from || "xx" };
}

/** "en" → "inglés" (nombre del idioma en español, para el chat del artesano). */
export function languageName(code: string): string {
  try {
    return new Intl.DisplayNames(["es"], { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** Desde la app: pide la traducción a /api/traducir. Si falla, devuelve null (se envía el original). */
export async function translateForArtisan(text: string): Promise<Translation | null> {
  try {
    const r = await fetch(`/api/traducir?q=${encodeURIComponent(text.slice(0, MAX_TRANSLATE_CHARS))}`);
    if (!r.ok) return null;
    const data = (await r.json()) as { translation: Translation | null };
    return data.translation ?? null;
  } catch {
    return null;
  }
}
