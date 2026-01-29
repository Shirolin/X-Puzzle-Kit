const fs = require("fs");
const path = require("path");
const packageJson = require("../package.json");

const MANIFEST_PATH = path.resolve(__dirname, "../src/manifest.json");

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error("❌ Manifest file not found at:", MANIFEST_PATH);
  process.exit(1);
}

try {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const oldVersion = manifest.version;
  const newVersion = packageJson.version;

  if (oldVersion === newVersion) {
    console.log(
      `ℹ️  Version in manifest is already up to date (${newVersion}).`,
    );
  } else {
    manifest.version = newVersion;
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
    console.log(
      `✅ Updated manifest.json version: ${oldVersion} -> ${newVersion}`,
    );
  }
} catch (err) {
  console.error("❌ Error updating manifest version:", err);
  process.exit(1);
}
