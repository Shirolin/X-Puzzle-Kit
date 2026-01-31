const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { execSync } = require("child_process");
const packageJson = require("../package.json");

const DIST_WEB_DIR = path.resolve(__dirname, "../dist-web");
const RELEASE_DIR = path.resolve(__dirname, "../release");

const appName = packageJson.name;
const appVersion = packageJson.version;

console.log(`🚀 Starting Web Release process for ${appName} v${appVersion}...`);

// 1. Build the web version
try {
  console.log("🛠  Building Web production bundle...");
  execSync("npm run build:web", { stdio: "inherit" });
  console.log("✅ Build completed successfully.");
} catch (e) {
  console.error("❌ Build failed. Aborting release.");
  process.exit(1);
}

if (!fs.existsSync(DIST_WEB_DIR)) {
  console.error(`Error: ${DIST_WEB_DIR} not found.`);
  process.exit(1);
}

if (!fs.existsSync(RELEASE_DIR)) {
  fs.mkdirSync(RELEASE_DIR);
}

// 2. Create ZIP
const zipName = `${appName}-web-v${appVersion}.zip`;
const zipOutputPath = path.join(RELEASE_DIR, zipName);
const output = fs.createWriteStream(zipOutputPath);
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", function () {
  const size = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log("-----------------------------------------");
  console.log(`🎉 Web Release Package Created!`);
  console.log(`📦 File: ${zipName}`);
  console.log(`📏 Size: ${size} MB`);
  console.log(`📍 Path: ${zipOutputPath}`);
  console.log("-----------------------------------------");
});

archive.on("error", function (err) {
  throw err;
});

archive.pipe(output);
archive.directory(DIST_WEB_DIR, false);
archive.finalize();
