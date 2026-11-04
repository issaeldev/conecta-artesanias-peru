import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
	plugins: [react()],
	// La caché de Vite va fuera de la carpeta del proyecto: OneDrive bloquea
	// node_modules/.vite al sincronizar y provoca errores EPERM al iniciar.
	cacheDir: join(tmpdir(), "vite-conecta-artesanias-peru"),
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
});
