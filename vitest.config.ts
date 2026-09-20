import { defineConfig } from "vitest/config";
import preact from "@preact/preset-vite";
import path from "path";

/**
 * 单元测试配置。
 *
 * 与 vite.config.ts 分离，原因：
 *   - 生产配置含 vite-plugin-web-extension，会干扰测试环境
 *   - 测试环境需要 __IS_EXTENSION__ = false，以便 platformStorage 走 localStorage 回退分支
 *
 * 手动测试台（test/index.html + test/main.ts）仍由 `npm run dev:test` 提供，
 * 本配置的 include 只匹配 *.test.ts，不会误抓测试台入口。
 */
export default defineConfig({
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
      "virtual:pwa-register/react": path.resolve(
        __dirname,
        "./src/mocks/pwa-register.ts",
      ),
      "@/core/twitter": path.resolve(__dirname, "./src/mocks/twitter.ts"),
      [path.resolve(__dirname, "./src/core/twitter")]: path.resolve(
        __dirname,
        "./src/mocks/twitter.ts",
      ),
    },
  },
  plugins: [preact()],
  define: {
    __IS_EXTENSION__: JSON.stringify(false),
    __APP_VERSION__: JSON.stringify("test"),
    __BUILD_ID__: JSON.stringify("TEST"),
  },
  test: {
    include: ["test/**/*.test.ts"],
    environment: "node",
    setupFiles: ["test/setup.ts"],
  },
});
