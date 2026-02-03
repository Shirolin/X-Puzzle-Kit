import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import path from "path";

import { VitePWA } from "vite-plugin-pwa";

// Web 版专用构建配置
export default defineConfig({
  root: "./",
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
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
        theme_color: "#007aff",
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
    }),
  ],
  build: {
    outDir: "dist-web",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
    },
  },
});
