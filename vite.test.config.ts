import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [preact()],
  root: "test", // 设置根目录为 test
  publicDir: "../public", // 如果有 public 资源
  build: {
    outDir: "../dist-test",
  },
  server: {
    open: true, // 自动打开浏览器
  },
});
