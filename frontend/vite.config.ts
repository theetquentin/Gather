import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const isDev = process.env.VITE_APP_ENV === "dev";
const port = parseInt(process.env.VITE_FRONTEND_PORT || "5173");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: isDev ? "0.0.0.0" : false, // accessible depuis Docker seulement en dev
    port: port,
    strictPort: isDev,
    watch: isDev
      ? { usePolling: true } // utile dans Docker
      : undefined,
    hmr: isDev
      ? {
          protocol: "ws",
          host: "localhost",
          port: port,
        }
      : undefined,
  },
});
