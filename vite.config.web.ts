import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import path from "path";

// Web 版专用构建配置
export default defineConfig({
  root: "./",
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [preact()],
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
