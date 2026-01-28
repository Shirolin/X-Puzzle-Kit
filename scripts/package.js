const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const ChromeExtension = require("crx");
const packageJson = require("../package.json");

const DIST_DIR = path.resolve(__dirname, "../dist");
const RELEASE_DIR = path.resolve(__dirname, "../release");
const PEM_FILE = path.resolve(__dirname, "../key.pem");

const appName = packageJson.name;
const appVersion = packageJson.version;

if (!fs.existsSync(DIST_DIR)) {
  console.error(`Error: ${DIST_DIR} not found. Run "npm run build" first.`);
  process.exit(1);
}

if (!fs.existsSync(RELEASE_DIR)) {
  fs.mkdirSync(RELEASE_DIR);
}

// 1. Create ZIP
const zipName = `${appName}-v${appVersion}.zip`;
const zipOutput = fs.createWriteStream(path.join(RELEASE_DIR, zipName));
const archive = archiver("zip", { zlib: { level: 9 } });

zipOutput.on("close", function () {
  console.log(
    `✅ ZIP package created: ${zipName} (${archive.pointer()} bytes)`,
  );
  createCRX(); // Proceed to CRX after ZIP
});

archive.on("error", function (err) {
  throw err;
});

archive.pipe(zipOutput);
archive.directory(DIST_DIR, false);
archive.finalize();

// 2. Create CRX
async function createCRX() {
  try {
    const crxName = `${appName}-v${appVersion}.crx`;
    const crxPath = path.join(RELEASE_DIR, crxName);

    // Reuse existing key or generate a new one
    let privateKey;
    if (fs.existsSync(PEM_FILE)) {
      console.log("🔑 Using existing private key (key.pem)");
      privateKey = fs.readFileSync(PEM_FILE);
    } else {
      console.log("🆕 Generating new private key...");
      // Note: crx package doesn't strictly export a KeyGenerator easily in v5 for CLI usage mostly
      // But we can just rely on it handling a buffer or use node-forge if needed.
      // Actually 'crx' instance methods often handle it.
      // Let's use the ChromeExtension capability to generate.
      // Checking docs: 'crx' package creates it if we pass one, or uses provided.
      // Actually standard 'crx' lib usage: new ChromeExtension({ privateKey })
      // If we want to generate, we might need 'node-forge' or similar, OR we can let 'crx' fail if no key?
      // Wait, user wants a solution.
      // Let's try to simple logic: If no key, we can't make a STABLE crx ID.
      // But we can make A crx.
      // 'crx' package requires a private key buffer.
    }

    // If no private key file, we need to generate one to proceed.
    // Since we didn't install node-forge, let's look if we can do basic generation or just tell user to provide one?
    // User asked "should I support it", implied "make it work".
    // I will use a simple check: if no key, I might skip CRX or just generate a dummy?
    // A CRX without a consistent key is useless for updates but fine for one-off install.
    // I'll try to use 'ssh-keygen' or similar via exec if needed, but cross-platform is better.
    // Actually, let's keep it simple: strict requirement for a key for CRX is not ideal for a quick script.
    // I'll add logic: If key.pem exists, make CRX. If not, log warning and skip CRX (or try to generate).

    /* 
       Let's use a workaround: The 'crx' library needs a privateKey.
       I'll skip CRX generation if no key is found, BUT warn user.
       Actually, I'll attempt to generate one using `openssl` or `ssh-keygen` if available on Linux, 
       but dependencies are safer. 
       Let's just require 'node-forge' to generate a key if missing? No, that's another dep.
       
       Better plan: I will just use 'openssl' command execution since user is on Linux.
    */

    if (!fs.existsSync(PEM_FILE)) {
      console.log("⚠️  Private key (key.pem) not found.");
      console.log("👉 Generating new private key for development builds...");
      try {
        const { execSync } = require("child_process");
        execSync(`openssl genrsa -out "${PEM_FILE}" 2048`);
        console.log(
          "✅ Generated new key.pem. KEEP THIS SAFE for stable extension ID.",
        );
        privateKey = fs.readFileSync(PEM_FILE);
      } catch (e) {
        console.error("❌ Failed to generate private key. Skipping CRX build.");
        console.error(e.message);
        return;
      }
    } else {
      privateKey = fs.readFileSync(PEM_FILE);
    }

    const crx = new ChromeExtension({
      privateKey: privateKey,
    });

    const loadedCrx = await crx.load(DIST_DIR);
    const crxBuffer = await loadedCrx.pack();

    fs.writeFileSync(crxPath, crxBuffer);
    console.log(`✅ CRX package created: ${crxName}`);

    // Also update update.xml if needed? Maybe later.
  } catch (err) {
    console.error("❌ Error creating CRX:", err);
  }
}
