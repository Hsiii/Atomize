import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "WallPrime",
        short_name: "WallPrime",
        description: "Prime factorization battle PWA",
        theme_color: "#0f172a",
        background_color: "#f4efe2",
        display: "standalone",
        start_url: "/",
        icons: [],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html}"],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
});
