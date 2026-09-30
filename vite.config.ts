import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

/**
 * Where the site is hosted. "/" for a normal domain; the GitHub Pages
 * workflow builds with BASE_PATH=/1stOctober/ (the repository name).
 */
const base = process.env.BASE_PATH || "/";

/** GitHub Pages has no rewrites: serve the app for deep links like /menu via 404.html. */
function spaFallback(): Plugin {
  let outDir = "dist";
  return {
    name: "spa-404-fallback",
    apply: "build",
    configResolved(c) {
      outDir = c.build.outDir;
    },
    closeBundle() {
      copyFileSync(resolve(outDir, "index.html"), resolve(outDir, "404.html"));
    },
  };
}

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["favicon.svg", "favicon-64.png", "apple-touch-icon.png"],
      manifest: {
        id: base,
        name: "A Day Made for You",
        short_name: "For A’ida",
        description: "A birthday surprise, made for one person.",
        lang: "en",
        start_url: base,
        scope: base,
        display: "standalone",
        orientation: "portrait",
        theme_color: "#f5eee3",
        background_color: "#f5eee3",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // The app shell (code, styles, fonts, icons) works offline once visited.
        globPatterns: ["**/*.{js,css,html,svg,png,woff2,webmanifest}"],
        // …but not the photo placeholders and big media; those use the runtime rules below.
        // …and not the admin editor (only you need it, and the HEIC converter alone is 3 MB).
        globIgnores: ["**/assets/**", "404.html", "**/static/AdminApp-*.js", "**/static/heic-to-*.js", "**/static/full.esm-*.js"],
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Photos: keep a copy after the first view.
            urlPattern: ({ url }) => url.pathname.includes("/assets/photos/"),
            handler: "CacheFirst",
            options: {
              cacheName: "memories-photos",
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Music and videos are streamed straight from the network (range
          // requests), so the service worker deliberately leaves them alone.
        ],
      },
    }),
    spaFallback(),
  ],
  build: {
    // Keep Vite's hashed bundles away from /public/assets (your photos, videos & music).
    assetsDir: "static",
    chunkSizeWarningLimit: 700,
  },
  server: { host: true },
});
