const fs = require("fs");
const path = require("path");

const localesDir = path.join(__dirname, "../src/_locales");
const baseLang = "en";

// Read all locales
const locales = fs
  .readdirSync(localesDir)
  .filter((file) => fs.statSync(path.join(localesDir, file)).isDirectory());

console.log(
  `\n🔍 Scanning ${locales.length} locales against baseline: [${baseLang}]...\n`,
);

// Load base JSON
const baseFile = path.join(localesDir, baseLang, "messages.json");
if (!fs.existsSync(baseFile)) {
  console.error(`❌ Base language file not found at: ${baseFile}`);
  process.exit(1);
}

const baseData = JSON.parse(fs.readFileSync(baseFile, "utf8"));
const baseKeys = Object.keys(baseData);
let totalMissing = 0;
const missingReport = {};

// Compare each locale against base
for (const lang of locales) {
  if (lang === baseLang) continue;

  const targetFile = path.join(localesDir, lang, "messages.json");
  if (!fs.existsSync(targetFile)) {
    console.warn(`⚠️ Warning: ${targetFile} does not exist. Skipping.`);
    continue;
  }

  const targetData = JSON.parse(fs.readFileSync(targetFile, "utf8"));
  const missingKeys = [];

  for (const key of baseKeys) {
    if (!targetData[key]) {
      missingKeys.push(key);
    }
  }

  if (missingKeys.length > 0) {
    missingReport[lang] = missingKeys;
    totalMissing += missingKeys.length;
    console.log(`❌ [${lang}] is missing ${missingKeys.length} keys:`);
    console.log(`   └─ ${missingKeys.join(", ")}`);
  } else {
    console.log(`✅ [${lang}] is fully synced.`);
  }
}

console.log("\n=======================================");
if (totalMissing === 0) {
  console.log("🎉 All locales are perfectly synchronized with English!");
} else {
  console.log(
    `⚠️ Found ${totalMissing} missing translations across ${Object.keys(missingReport).length} locales.`,
  );
  console.log(
    "💡 Tip: You can automate adding these keys or translate them manually.",
  );
}
console.log("=======================================\n");

// Chrome 对 manifest 字段有硬上限：name ≤ 75、description ≤ 132 字符。
// 超限的 description 会在商店列表页被静默截断（实测 pt_BR/tr 曾被截成 "…"），
// 且截断发生在 Google 侧，本地构建无法察觉，故在此显式拦截。
const LIMITS = { appName: 75, appDesc: 132 };
const overLimit = [];

for (const lang of locales) {
  const data = JSON.parse(
    fs.readFileSync(path.join(localesDir, lang, "messages.json"), "utf8"),
  );
  for (const [key, max] of Object.entries(LIMITS)) {
    const len = data[key]?.message?.length ?? 0;
    if (len > max) overLimit.push({ lang, key, len, max });
  }
}

console.log("📏 Manifest length limits (name ≤ 75, description ≤ 132):");
if (overLimit.length === 0) {
  console.log("✅ All locales within limits.");
} else {
  for (const { lang, key, len, max } of overLimit) {
    console.log(`❌ [${lang}] ${key} is ${len} chars, exceeds ${max} by ${len - max}.`);
  }
}
console.log("");

if (totalMissing > 0 || overLimit.length > 0) {
  process.exit(1);
}
