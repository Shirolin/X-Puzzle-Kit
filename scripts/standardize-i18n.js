const fs = require("fs");
const path = require("path");

const localesDir = path.resolve(__dirname, "..", "src", "_locales");
const baseLocale = "en";
const baseFilePath = path.join(localesDir, baseLocale, "messages.json");

// 1. Load base locale (template)
const baseContent = fs.readFileSync(baseFilePath, "utf8");
const baseJson = JSON.parse(baseContent);
const baseKeys = Object.keys(baseJson);

// 2. Get all locale directories
const locales = fs.readdirSync(localesDir).filter((f) => {
  return (
    fs.statSync(path.join(localesDir, f)).isDirectory() && !f.startsWith(".")
  );
});

console.log(`Found locales: ${locales.join(", ")}`);

locales.forEach((lang) => {
  const filePath = path.join(localesDir, lang, "messages.json");
  if (!fs.existsSync(filePath)) return;

  console.log(`Processing ${lang}...`);
  const content = fs.readFileSync(filePath, "utf8");
  const json = JSON.parse(content);

  // 3. Rebuild JSON using base keys for ordering
  const newJson = {};

  baseKeys.forEach((key) => {
    if (json[key]) {
      // Keep existing message
      newJson[key] = {
        message: json[key].message,
        description: baseJson[key].description,
      };

      // Sync placeholders if exist in base
      if (baseJson[key].placeholders) {
        newJson[key].placeholders = baseJson[key].placeholders;
      }
    } else {
      // Key missing in this language, use base message but mark it (or just copy)
      console.warn(
        `  Warning: Key "${key}" missing in ${lang}. Copying from ${baseLocale}.`,
      );
      newJson[key] = { ...baseJson[key] };
    }
  });

  // 4. Check for keys in target that are NOT in base (obsolete keys)
  Object.keys(json).forEach((key) => {
    if (!baseJson[key]) {
      console.warn(
        `  Warning: Obsolete key "${key}" found in ${lang}. It will be removed.`,
      );
    }
  });

  // 5. Save standardized file
  fs.writeFileSync(filePath, JSON.stringify(newJson, null, 2) + "\n");
});

console.log("Standardization complete!");
