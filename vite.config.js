import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, URL } from "node:url";
export default defineConfig({
    plugins: [
        react(),
        // En `npm run dev` no hay funciones de Vercel: /api/<nombre> ejecuta api/<nombre>.ts con el mismo código.
        {
            name: "api-dev",
            configureServer(server) {
                server.middlewares.use("/api", async (req, res, next) => {
                    const name = /^\/([\w-]+)/.exec(req.url ?? "")?.[1];
                    if (!name)
                        return next();
                    try {
                        // Carga dinámica (no import estático) para que tsc no compile api/ junto con este archivo.
                        const { GET } = await server.ssrLoadModule(`/api/${name}.ts`);
                        const r = await GET(new Request(`http://localhost/api${req.url}`));
                        res.statusCode = r.status;
                        res.setHeader("Content-Type", "application/json");
                        res.end(await r.text());
                    }
                    catch {
                        next();
                    }
                });
            },
        },
    ],
    // La caché de Vite va fuera de la carpeta del proyecto: OneDrive bloquea
    // node_modules/.vite al sincronizar y provoca errores EPERM al iniciar.
    cacheDir: join(tmpdir(), "vite-conecta-artesanias-peru"),
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
});
