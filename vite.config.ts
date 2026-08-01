import inertia from "@inertiajs/vite";
import { wayfinder } from "@laravel/vite-plugin-wayfinder";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";
import { bunny } from "laravel-vite-plugin/fonts";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    laravel({
      input: ["resources/css/app.css", "resources/js/app.tsx"],
      refresh: true,
      fonts: [
        bunny("Instrument Sans", {
          weights: [400, 500, 600],
        }),
      ],
    }),
    inertia(),
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    tailwindcss(),
    wayfinder({
      formVariants: true,
    }),
    VitePWA({
      registerType: "autoUpdate",
      filename: "../sw.js",
      scope: "/",
      includeAssets: [
        "favicon.ico",
        "favicon.svg",
        "apple-touch-icon.png",
        "brand/bas-stockflow-mark.png",
        "offline.html",
      ],
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        additionalManifestEntries: [
          { url: "/offline.html", revision: null },
          { url: "/brand/bas-stockflow-mark.png", revision: null },
        ],
        manifestTransforms: [
          async (entries) => ({
            manifest: entries.map((entry) => ({
              ...entry,
              url: entry.url.startsWith("/")
                ? entry.url
                : `/build/${entry.url}`,
            })),
            warnings: [],
          }),
        ],
        navigateFallback: "/offline.html",
        navigateFallbackDenylist: [
          /^\/notifications/,
          /^\/reports\/export/,
          /\/document$/,
          /\/evidence\//,
        ],
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
