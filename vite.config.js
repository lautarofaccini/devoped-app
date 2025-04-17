import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  preview: {
    // Lista explícita de hosts permitidos
    allowedHosts: [
      "faccini-web.online", // tu dominio
      "localhost", // mantén siempre localhost
    ],
    // puerto por defecto (4173) o el que tú prefieras
    port: 3000,
  },
});
