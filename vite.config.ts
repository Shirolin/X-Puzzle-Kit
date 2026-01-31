import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import webExtension from "vite-plugin-web-extension";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    preact(),
    webExtension({
      manifest: "src/manifest.json",
      watchMode: true,
      disableAutoLaunch: true,
    }),
  ],
});
