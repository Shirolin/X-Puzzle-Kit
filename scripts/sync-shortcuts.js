const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "../src/core/config.ts");
const OUTPUT_PATH = path.join(__dirname, "../public/shortcuts-update.json");

/**
 * 从 config.ts 中同步快捷指令配置到 public/shortcuts-update.json
 */
function syncShortcuts() {
  try {
    const configContent = fs.readFileSync(CONFIG_PATH, "utf-8");

    // 匹配常量定义
    const verMatch = configContent.match(/IOS_SHORTCUT_VER:\s*["'](.+?)["']/);
    const urlMatch = configContent.match(/IOS_SHORTCUT_URL:\s*["'](.+?)["']/);
    const noteMatch = configContent.match(/IOS_SHORTCUT_NOTE:\s*["'](.+?)["']/);

    if (!verMatch || !urlMatch || !noteMatch) {
      console.error("❌ [Sync] 未能在 config.ts 中找到完整的快捷指令配置信息");
      process.exit(1);
    }

    const shortcutData = {
      version: verMatch[1],
      // 将 1.0.0 转换为 100, 1.2.3 -> 123
      versionCode: parseInt(verMatch[1].replace(/\./g, "")),
      url: urlMatch[1],
      notes: noteMatch[1].replace(/\\n/g, "\n"), // 处理换行符
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(shortcutData, null, 2));

    console.log(
      "✅ [Sync] 快捷指令配置已成功同步到 public/shortcuts-update.json",
    );
    console.log(`   版本: ${shortcutData.version}`);
  } catch (error) {
    console.error("❌ [Sync] 同步失败:", error.message);
    process.exit(1);
  }
}

syncShortcuts();
