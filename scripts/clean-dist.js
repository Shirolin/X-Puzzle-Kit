const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

/**
 * 清理构建产物目录，避免历史残留文件被一并打包进发布包。
 *
 * 背景：vite-plugin-web-extension 在多阶段构建中强制 emptyOutDir: false，
 * 构建不会清空 dist，导致旧格式 chunk、已删除的 locale 目录等持续累积，
 * 并被 scripts/package.js 整体打包（实测曾累积约 192 KB 无用文件）。
 *
 * vite.test.config.ts 的 outDir（../dist-test）位于其 root 之外，
 * Vite 同样不会自动清空，故一并纳入。
 */
const TARGETS = ["dist", "dist-test"];

let cleaned = 0;

for (const name of TARGETS) {
  const target = path.join(ROOT, name);
  if (!fs.existsSync(target)) {
    console.log(`[Clean] ${name}/ not found, skipped`);
    continue;
  }
  try {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`[Clean] removed ${name}/`);
    cleaned++;
  } catch (err) {
    // 中止构建，避免产出包含陈旧文件的发布包
    console.error(`[Clean] failed to remove ${name}/: ${err.message}`);
    console.error(
      "[Clean] aborting build to avoid packaging stale files. Close any browser loading this extension, then retry.",
    );
    process.exit(1);
  }
}

console.log(`[Clean] done. ${cleaned} director(ies) removed.`);
