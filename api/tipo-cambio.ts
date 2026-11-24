import { bcrpUrl, parseBcrpText } from "../src/lib/bcrp.js"; // con .js: Vercel ejecuta ESM y exige la extensión

/**
 * GET /api/tipo-cambio → { penPerUsd, date, source }
 *
 * Función de Vercel: el BCRP no permite llamadas desde el navegador (CORS), así que se
 * consulta aquí. La CDN de Vercel guarda la respuesta 12 h, de modo que el BCRP se
 * consulta como mucho un par de veces al día y el dato se renueva solo a diario.
 * Si falla, responde 502 y la app sigue con el tipo de cambio de respaldo (VITE_PEN_PER_USD).
 */
export async function GET(): Promise<Response> {
  try {
    const res = await fetch(bcrpUrl(), { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`BCRP ${res.status}`);
    const rate = parseBcrpText(await res.text());
    if (!rate) throw new Error("BCRP sin datos");
    return Response.json(rate, {
      headers: { "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400" },
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "error" },
      { status: 502, headers: { "Cache-Control": "public, s-maxage=300" } },
    );
  }
}
