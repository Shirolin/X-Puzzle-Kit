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
              const message = msgContent.shortcutUpdateNote.message;
              const iosLocale = locale.replace("_", "-"); // zh_CN -> zh-CN

              // 1. 存入标准 iOS 键名 (zh-CN, zh-TW, ja, en)
              notes[`notes_${iosLocale}`] = message;

              // 2. 存入基础代码 (en, ja, zh) 作为兜底别名
              // 如果是复合代码 (zh-CN), 提取基础代码 (zh)
              if (iosLocale.includes("-")) {
                const baseLang = iosLocale.split("-")[0];
                // 只有当 notes_zh 不存在，或者当前是 zh-CN 时，才更新 notes_zh (默认用简体兜底)
                if (!notes[`notes_${baseLang}`] || iosLocale === "zh-CN") {
                  notes[`notes_${baseLang}`] = message;
                }

                // 特殊处理：如果发现 pt-BR，同步给 pt-PT 确保全覆盖
                if (baseLang === "pt") {
                  notes[`notes_pt-PT`] = message;
                }
              } else {
                notes[`notes_${iosLocale}`] = message;
              }
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
