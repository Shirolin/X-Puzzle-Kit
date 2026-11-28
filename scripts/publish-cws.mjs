#!/usr/bin/env node
/**
 * 通过 Chrome Web Store API v2 上传 / 发布扩展。
 *
 * 用法：
 *   node scripts/publish-cws.mjs                 # 只上传，不上架
 *   node scripts/publish-cws.mjs --publish       # 上传后立即提交审核（批准即发布）
 *   node scripts/publish-cws.mjs --stage         # 上传后提交，批准后暂存待手动发布
 *   node scripts/publish-cws.mjs --status        # 只看商店当前状态
 *   node scripts/publish-cws.mjs --dry-run       # 校验配置与 ZIP，不调用接口
 *
 * 必需环境变量（也可写在项目根目录 .env，已被 .gitignore 忽略）：
 *   CWS_PUBLISHER_ID   发布者 ID，见开发者后台 URL /publishers/<publisherId>
 *   CWS_EXTENSION_ID   扩展 ID，同 URL 的 /items/<extensionId>
 *   CWS_CLIENT_ID      Google Cloud OAuth 客户端 ID
 *   CWS_CLIENT_SECRET  对应 client secret
 *   CWS_REFRESH_TOKEN  OAuth Playground 换取的 refresh token（scope: chromewebstore）
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://chromewebstore.googleapis.com";

function loadEnvFile() {
  const file = path.join(ROOT, ".env");
  if (!existsSync(file)) return;
  for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = line
      .slice(eq + 1)
      .trim()
      .replace(/^(['"])(.*)\1$/, "$2");
    if (!(key in process.env)) process.env[key] = value;
  }
}

function parseArgs(argv) {
  const args = { publish: false, stage: false, status: false, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--zip") args.zip = argv[++i];
    else if (arg === "--publish") args.publish = true;
    else if (arg === "--stage") args.stage = true;
    else if (arg === "--status") args.status = true;
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--help" || arg === "-h") args.help = true;
    else throw new Error(`未知参数：${arg}`);
  }
  return args;
}

function requireEnv(names) {
  const missing = names.filter((name) => !process.env[name]);
  if (missing.length) {
    console.error(`❌ 缺少环境变量：${missing.join(", ")}`);
    console.error("   可在项目根目录 .env 中配置，参见脚本头部说明。");
    process.exit(1);
  }
}

async function accessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.CWS_CLIENT_ID,
      client_secret: process.env.CWS_CLIENT_SECRET,
      refresh_token: process.env.CWS_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(
      `❌ 换取 access token 失败（${res.status}）：${data.error_description ?? data.error ?? "未知错误"}`,
    );
    console.error(
      "   常见原因：refresh token 被撤销、client id/secret 不匹配。",
    );
    process.exit(1);
  }
  return data.access_token;
}

const itemPath = `/v2/publishers/${process.env.CWS_PUBLISHER_ID}/items/${process.env.CWS_EXTENSION_ID}`;

async function call(url, token, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  return { res, data };
}

async function fetchStatus(token) {
  const { res, data } = await call(`${API}${itemPath}:fetchStatus`, token);
  if (!res.ok)
    throw new Error(`查询状态失败（${res.status}）：${JSON.stringify(data)}`);
  return data;
}

async function upload(token, zipPath) {
  const body = readFileSync(zipPath);
  const { res, data } = await call(
    `${API}/upload${itemPath}:upload?uploadType=media`,
    token,
    {
      method: "POST",
      headers: { "content-type": "application/zip" },
      body,
    },
  );
  if (!res.ok) {
    console.error(
      `❌ 上传失败（${res.status}）：${JSON.stringify(data, null, 2)}`,
    );
    process.exit(1);
  }

  let state = data.uploadState;
  for (let attempt = 0; state === "IN_PROGRESS" && attempt < 20; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    state = (await fetchStatus(token)).lastAsyncUploadState;
  }
  if (state !== "SUCCEEDED") {
    console.error(`❌ 上传未成功：uploadState=${state ?? "UNKNOWN"}`);
    process.exit(1);
  }
  console.log(
    `✅ 已上传 v${data.crxVersion ?? "?"}（item ${data.itemId ?? ""}）`,
  );
}

async function publish(token, publishType) {
  const { res, data } = await call(`${API}${itemPath}:publish`, token, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ publishType }),
  });
  if (!res.ok) {
    console.error(
      `❌ 提交发布失败（${res.status}）：${JSON.stringify(data, null, 2)}`,
    );
    process.exit(1);
  }
  console.log(
    `✅ 已提交审核（${publishType}），当前状态：${data.state ?? "未知"}。审核通常 24–48 小时。`,
  );
}

function printStatus(data) {
  const published = data.publishedItemRevisionStatus?.state ?? "未发布";
  const submitted = data.submittedItemRevisionStatus?.state ?? "无待审提交";
  const lines = [
    `已发布版本状态：${published}`,
    `待审提交状态：${submitted}`,
    `最近上传：${data.lastAsyncUploadState ?? "无记录"}`,
  ];
  if (data.takenDown) lines.push("⚠️ 已被下架，请查看开发者后台");
  if (data.warned) lines.push("⚠️ 收到政策警告，请查看开发者后台");
  console.log(lines.join("\n"));
}

async function main() {
  loadEnvFile();
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(
      [
        "用法：node scripts/publish-cws.mjs [--zip <path>] [--publish|--stage] [--status] [--dry-run]",
        "  --zip <path>  ZIP 路径，默认 release/x-puzzle-kit-v<版本>.zip",
        "  --publish     上传后立即提交审核",
        "  --stage       上传后提交，批准后暂存",
        "  --status      只查询商店状态",
        "  --dry-run     只校验配置与 ZIP，不调用接口",
      ].join("\n"),
    );
    return;
  }

  requireEnv([
    "CWS_PUBLISHER_ID",
    "CWS_EXTENSION_ID",
    "CWS_CLIENT_ID",
    "CWS_CLIENT_SECRET",
    "CWS_REFRESH_TOKEN",
  ]);

  const zipPath = path.resolve(
    ROOT,
    args.zip ??
      `release/x-puzzle-kit-v${JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8")).version}.zip`,
  );
  if (!args.status) {
    if (!existsSync(zipPath)) {
      console.error(`❌ 找不到 ZIP：${zipPath}\n   先运行 npm run package。`);
      process.exit(1);
    }
    if (args.dryRun) {
      console.log(
        `配置完整，ZIP 存在：${zipPath}（${readFileSync(zipPath).length} 字节）`,
      );
      return;
    }
  }

  const token = await accessToken();

  if (args.status) {
    printStatus(await fetchStatus(token));
    return;
  }

  await upload(token, zipPath);
  if (args.publish || args.stage) {
    await publish(token, args.stage ? "STAGED_PUBLISH" : "DEFAULT_PUBLISH");
  } else {
    console.log("未提交审核；加 --publish 可上传后直接提交。");
  }
}

main().catch((error) => {
  console.error(`❌ ${error.message}`);
  process.exit(1);
});
