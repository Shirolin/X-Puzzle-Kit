import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import webExtension from "vite-plugin-web-extension";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "virtual:pwa-register/react": path.resolve(
        __dirname,
        "./src/mocks/pwa-register.ts",
      ),
      "@/core/twitter": path.resolve(__dirname, "./src/mocks/twitter.ts"),
      // Also map the direct path if imported relatively
      [path.resolve(__dirname, "./src/core/twitter")]: path.resolve(
        __dirname,
        "./src/mocks/twitter.ts",
      ),
    },
  },
  plugins: [
    preact(),
    webExtension({
      manifest: "src/manifest.json",

      disableAutoLaunch: true,
    }),
  ],
  define: {
    __IS_EXTENSION__: true,
  },
});
