import { MAX_TRANSLATE_CHARS, myMemoryUrl, parseMyMemory } from "../src/lib/translate.js"; // .js: Vercel ejecuta ESM

/**
 * GET /api/traducir?q=texto → { translation: { text, from } | null }
 *
 * Traduce al español los mensajes que los compradores le dejan al artesano.
 * null = ya estaba en español. Se hace en el servidor para no depender de CORS
 * y poder cambiar de proveedor (p. ej. a la API de Claude) sin tocar la app.
 */
export async function GET(request: Request): Promise<Response> {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, MAX_TRANSLATE_CHARS);
  if (!q) return Response.json({ translation: null });
  try {
    const res = await fetch(myMemoryUrl(q));
    const translation = parseMyMemory(await res.json());
    return Response.json({ translation }, { headers: { "Cache-Control": "public, s-maxage=86400" } });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "error" }, { status: 502 });
  }
}
