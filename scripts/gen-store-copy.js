const fs = require("fs");
const path = require("path");

/**
 * 生成 Chrome 网上应用店「本地化商品详情」的复制粘贴稿。
 *
 * 背景：CWS 只会从上传包自动读取 manifest 的 name / description
 * （即 _locales/<locale>/messages.json 的 appName / appDesc），
 * 而**详细描述必须逐语言在 Developer Dashboard 手动粘贴**
 * （见 doc/上线流程指南.md）。本脚本把 _locales 作为唯一事实来源，
 * 导出可直接粘贴的三段文案，避免手抄漂移。
 */

const LOCALES_DIR = path.resolve(__dirname, "../src/_locales");
const OUT_FILE = path.resolve(__dirname, "../doc/store-listing-copy.md");

// CWS Dashboard 语言选择器的代码（与 manifest 目录名不同处在此映射）
const DASHBOARD_CODE = {
  zh_CN: "zh-CN",
  zh_TW: "zh-TW",
  pt_BR: "pt-BR",
};

// 展示顺序：英文在前，其余按 manifest 目录名排序
const locales = fs
  .readdirSync(LOCALES_DIR)
  .filter((d) => fs.statSync(path.join(LOCALES_DIR, d)).isDirectory())
  .sort((a, b) => (a === "en" ? -1 : b === "en" ? 1 : a.localeCompare(b)));

const rows = locales.map((locale) => {
  const data = JSON.parse(
    fs.readFileSync(path.join(LOCALES_DIR, locale, "messages.json"), "utf8"),
  );
  return {
    locale,
    dashboardCode: DASHBOARD_CODE[locale] || locale,
    name: data.appName.message,
    short: data.appDesc.message,
    detailed: data.longDescription.message,
  };
});

const lines = [
  "# Chrome 网上应用店 本地化文案（复制粘贴稿）",
  "",
  "> **本文件由 `scripts/gen-store-copy.js` 从 `src/_locales/*/messages.json` 生成，请勿手工编辑。**",
  "> 修改文案请改 `_locales`，然后执行 `npm run store-copy`。",
  "",
  "## 哪些是自动的，哪些要手填",
  "",
  "| 字段 | 来源 | 是否需要手动操作 |",
  "| --- | --- | --- |",
  "| **名称 (Name)** | 上传包 `_locales/<locale>/messages.json` 的 `appName` | 否，随新版本包自动生效 |",
  "| **简短描述 (Summary)** | 上传包 `_locales/<locale>/messages.json` 的 `appDesc` | 否，随新版本包自动生效 |",
  "| **详细描述 (Detailed description)** | 仅存在于 Dashboard | **是**，每个语言都要单独粘贴（见下） |",
  "| **截图** | 仅存在于 Dashboard | **是**，每个语言可单独上传 |",
  "",
  "字段上限：名称 75 字符、简短描述 132 字符、详细描述 16000 字符。",
  "",
  "## 操作步骤",
  "",
  "1. 打开 [Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard) 中本扩展的条目。",
  "2. 进入 **Store listing** 标签页，在语言选择器中依次选择下表对应的语言。",
  "3. 把「详细描述」一节对应的文本整段粘贴进 *Detailed description* 输入框并保存。",
  "4. 全部语言处理完后，回到 **Package** 标签页提交审核。",
  "",
  "## 语言对照表",
  "",
  "| manifest 目录 | Dashboard 语言代码 | 名称长度 | 简短描述长度 | 详细描述长度 |",
  "| --- | --- | --- | --- | --- |",
  ...rows.map(
    (r) =>
      `| \`${r.locale}\` | \`${r.dashboardCode}\` | ${r.name.length} | ${r.short.length} | ${r.detailed.length} |`,
  ),
  "",
];

for (const r of rows) {
  lines.push(
    `## ${r.locale} — Dashboard 代码 \`${r.dashboardCode}\``,
    "",
    "**名称 (Name)**",
    "",
    "```text",
    r.name,
    "```",
    "",
    "**简短描述 (Summary)**",
    "",
    "```text",
    r.short,
    "```",
    "",
    "**详细描述 (Detailed description)**",
    "",
    "```text",
    r.detailed,
    "```",
    "",
  );
}

fs.writeFileSync(OUT_FILE, lines.join("\n"));
console.log(
  `✅ Wrote ${path.relative(process.cwd(), OUT_FILE)} (${rows.length} locales)`,
);
for (const r of rows) {
  console.log(
    `   ${r.locale.padEnd(7)} name=${String(r.name.length).padStart(3)} short=${String(r.short.length).padStart(3)} detailed=${String(r.detailed.length).padStart(4)}`,
  );
}
