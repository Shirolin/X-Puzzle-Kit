const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

/**
 * 清理构建产物目录，避免历史残留文件被一并打包进发布包。
 *
 * 背景：vite.config.ts 未设置 emptyOutDir，构建不会清空 dist，
 * 导致旧格式 chunk（icons.js / utils.js / vendor.js）、已删除的 locale
 * 目录等持续累积，并被 scripts/package.js 整体打包。
 */
const TARGETS = ["dist"];

let cleaned = 0;

for (const name of TARGETS) {
  const target = path.join(ROOT, name);
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`[Clean] removed ${name}/`);
    cleaned++;
  } else {
    console.log(`[Clean] ${name}/ not found, skipped`);
  }
}

console.log(`[Clean] done. ${cleaned} director(ies) removed.`);
