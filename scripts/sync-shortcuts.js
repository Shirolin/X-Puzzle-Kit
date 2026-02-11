const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "../src/core/config.ts");
const OUTPUT_PATH = path.join(__dirname, "../public/shortcuts-update.json");

/**
 * 从 config.ts 中同步快捷指令配置到 public/shortcuts-update.json
 */
const LOCALES_DIR = path.resolve(__dirname, "../src/_locales");

function syncShortcuts() {
  try {
    const configContent = fs.readFileSync(CONFIG_PATH, "utf-8");

    // 匹配常量定义
    const verMatch = configContent.match(/IOS_SHORTCUT_VER:\s*["'](.+?)["']/);
    const urlMatch = configContent.match(/IOS_SHORTCUT_URL:\s*["'](.+?)["']/);

    if (!verMatch || !urlMatch) {
      console.error(
        "❌ [Sync] 未能在 config.ts 中找到完整的快捷指令配置信息 (Ver/Url)",
      );
      process.exit(1);
    }

    // 从 _locales 读取多语言 Note
    const notes = {};
    if (fs.existsSync(LOCALES_DIR)) {
      const locales = fs.readdirSync(LOCALES_DIR);
      locales.forEach((locale) => {
        const msgPath = path.join(LOCALES_DIR, locale, "messages.json");
        if (fs.existsSync(msgPath)) {
          try {
            const msgContent = JSON.parse(fs.readFileSync(msgPath, "utf-8"));
            if (
              msgContent.shortcutUpdateNote &&
              msgContent.shortcutUpdateNote.message
            ) {
              const noteKey = `notes_${locale}`; // notes_en, notes_zh_CN
              notes[noteKey] = msgContent.shortcutUpdateNote.message;
            }
          } catch (e) {
            console.warn(`⚠️ [Sync] 无法解析语言文件: ${locale}`);
          }
        }
      });
    }

    const shortcutData = {
      version: verMatch[1],
      // 将 1.0.0 转换为 100, 1.2.3 -> 123
      versionCode: parseInt(verMatch[1].replace(/\./g, "")),
      url: urlMatch[1],
      ...notes, // 展开从 i18n 读取的 notes
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(shortcutData, null, 2));

    console.log(
      "✅ [Sync] 快捷指令配置已成功同步到 public/shortcuts-update.json",
    );
    console.log(`   版本: ${shortcutData.version}`);
    console.log(`   包含语言: ${Object.keys(notes).join(", ")}`);
  } catch (error) {
    console.error("❌ [Sync] 同步失败:", error.message);
    process.exit(1);
  }
}

syncShortcuts();
