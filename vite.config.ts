import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import webExtension from "vite-plugin-web-extension";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: "preact/compat",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
      "react/jsx-dev-runtime": "preact/jsx-runtime",
      // Explicitly alias preact/jsx-dev-runtime to avoid resolution issues
      "preact/jsx-dev-runtime": "preact/jsx-runtime",
      preact: path.resolve(__dirname, "node_modules/preact"),
      "preact/hooks": path.resolve(__dirname, "node_modules/preact/hooks"),
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
    viteStaticCopy({
      targets: [
        {
          src: "src/_locales",
          dest: ".",
        },
      ],
    }),
  ],
  define: {
    __IS_EXTENSION__: true,
  },
});
