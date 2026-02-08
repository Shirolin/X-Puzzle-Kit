import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
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
  plugins: [preact()],
  root: "test", // 设置根目录为 test
  publicDir: "../public", // 如果有 public 资源
  build: {
    outDir: "../dist-test",
  },
  server: {
    open: true, // 自动打开浏览器
  },
  optimizeDeps: {
    include: ["preact", "preact/hooks", "preact/compat"],
  },
  define: {
    __IS_EXTENSION__: true,
  },
});
