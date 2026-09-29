const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const packageJson = require("../package.json");

const DIST_DIR = path.resolve(__dirname, "../dist");
const RELEASE_DIR = path.resolve(__dirname, "../release");

const appName = packageJson.name;
const appVersion = packageJson.version;

if (!fs.existsSync(DIST_DIR)) {
  console.error(`Error: ${DIST_DIR} not found. Run "npm run build" first.`);
  process.exit(1);
}

if (!fs.existsSync(RELEASE_DIR)) {
  fs.mkdirSync(RELEASE_DIR);
}

// Copy LICENSE to dist to ensure it is included
const licensePath = path.resolve(__dirname, "../LICENSE");
if (fs.existsSync(licensePath)) {
  fs.copyFileSync(licensePath, path.join(DIST_DIR, "LICENSE"));
  console.log("✅ Copied LICENSE to dist");
}

/**
 * 只产出 ZIP，不产出 .crx。
 *
 * Chrome Web Store 接收的是 ZIP，并由 Google 用自己的密钥重新签名、分配 ID；
 * 「加载已解压的扩展」同样用 ZIP。而 .crx 需要一个固定的私钥才能得到稳定的
 * 扩展 ID —— 该私钥从未纳入版本控制（.gitignore 含 *.pem），CI 每次构建都会
 * 临时生成一把新密钥，导致每个版本的 .crx 扩展 ID 都不同：既无法互相增量
 * 更新，也与商店 ID 不一致，只会诱导用户装出第二个扩展。故不再生成。
 */
const zipName = `${appName}-v${appVersion}.zip`;
const zipOutput = fs.createWriteStream(path.join(RELEASE_DIR, zipName));
const archive = archiver("zip", { zlib: { level: 9 } });

zipOutput.on("close", function () {
  console.log(
    `✅ ZIP package created: ${zipName} (${archive.pointer()} bytes)`,
  );
});

archive.on("error", function (err) {
  throw err;
});

archive.pipe(zipOutput);
archive.directory(DIST_DIR, false);
archive.finalize();
