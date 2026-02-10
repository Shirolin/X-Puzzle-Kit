import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import path from "path";
import { execSync } from "child_process";

import { VitePWA } from "vite-plugin-pwa";

// Web 版专用构建配置
export default defineConfig({
  root: "./",
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: "preact/compat",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
      "react/jsx-dev-runtime": "preact/jsx-runtime",
      "preact/jsx-dev-runtime": "preact/jsx-runtime",
      preact: path.resolve(__dirname, "node_modules/preact"),
      "preact/hooks": path.resolve(__dirname, "node_modules/preact/hooks"),
    },
  },
  plugins: [
    preact(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.ico", "assets/*.png", "assets/*.svg"],
      manifest: {
        name: "X-Puzzle-Kit - 推特拼图/切图助手",
        short_name: "X-Puzzle-Kit",
        description: "专业的推特多图拼接与长图切割工具",
        theme_color: "#000000",
        share_target: {
          action: "/",
          method: "GET",
          enctype: "application/x-www-form-urlencoded",
          params: {
            title: "title",
            text: "text",
            url: "url",
          },
        },
        icons: [
          {
            src: "assets/icon-128.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "assets/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "assets/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "assets/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        background_color: "#000000",
        display: "standalone",
        orientation: "portrait",
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  define: {
    __IS_EXTENSION__: false,
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "1.1.2"),
    __BUILD_ID__: JSON.stringify(
      (() => {
        try {
          return execSync("git rev-parse --short HEAD").toString().trim();
        } catch (e) {
          return (
            process.env.CF_PAGES_COMMIT_SHA ||
            process.env.GITHUB_SHA ||
            "dev"
          ).substring(0, 8);
        }
      })().toUpperCase(),
    ),
  },

  build: {
    outDir: "dist-web",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
      output: {
        manualChunks: {
          vendor: ["preact", "preact/hooks", "preact/compat"],
          utils: ["jszip", "sortablejs"],
          icons: ["lucide-preact"],
        },
      },
    },
  },
});
