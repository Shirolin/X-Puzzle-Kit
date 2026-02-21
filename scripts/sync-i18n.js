const fs = require("fs");
const path = require("path");

const localesDir = path.join(__dirname, "../src/_locales");
const baseLang = "en";

const dictPath = path.join(__dirname, "i18n-dictionary.json");
let translationsDictionary = {};
if (fs.existsSync(dictPath)) {
  translationsDictionary = JSON.parse(fs.readFileSync(dictPath, "utf8"));
} // Read all locales
const locales = fs
  .readdirSync(localesDir)
  .filter((file) => fs.statSync(path.join(localesDir, file)).isDirectory());

console.log(`\n🔄 Starting Auto-Sync. Baseline: [${baseLang}]...\n`);

const baseFile = path.join(localesDir, baseLang, "messages.json");
const baseData = JSON.parse(fs.readFileSync(baseFile, "utf8"));
const baseKeys = Object.keys(baseData);

let totalAdded = 0;

for (const lang of locales) {
  if (lang === baseLang) continue;

  const targetFile = path.join(localesDir, lang, "messages.json");
  if (!fs.existsSync(targetFile)) continue;

  const targetData = JSON.parse(fs.readFileSync(targetFile, "utf8"));
  let isModified = false;

  for (const key of baseKeys) {
    if (!targetData[key]) {
      // Find translated text from our dictionary, or fallback to English
      const englishText = baseData[key].message;
      let newText = englishText;

      if (translationsDictionary[key] && translationsDictionary[key][lang]) {
        newText = translationsDictionary[key][lang];
      } else {
        // If no dictionary match, fallback explicitly
        newText = `[TODO: Translate] ${englishText}`;
      }

      // Add to target data
      targetData[key] = {
        message: newText,
        description: baseData[key].description,
      };

      isModified = true;
      totalAdded++;
      console.log(`➕ Added [${key}] to ${lang}`);
    }
  }

  // Rewrite the JSON file if modified
  if (isModified) {
    // Keep the keys ordered exactly as in en/messages.json
    const syncedData = {};
    for (const key of baseKeys) {
      if (targetData[key]) {
        syncedData[key] = targetData[key];
      }
    }

    fs.writeFileSync(targetFile, JSON.stringify(syncedData, null, 2) + "\n");
    console.log(`✅ Saved ${lang}/messages.json`);
  }
}

console.log(
  `\n🎉 Synced! Added ${totalAdded} keys total across all languages.`,
);
