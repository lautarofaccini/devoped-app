import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
  },
  preview: {
    // Lista explícita de hosts permitidos
    allowedHosts: [
      "faccini-web.online",
      "www.faccini-web.online",
      "localhost", // mantén siempre localhost
    ],
    // puerto por defecto (4173) o el que tú prefieras
    port: 3000,
  },
});
