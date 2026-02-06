const PRODUCTION_ORIGIN = "https://x-puzzle-kit.pages.dev"; // 生产环境域名

// 缓存配置
const CACHE_TTL = 3600; // 缓存 1 小时

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode");
    const target = url.searchParams.get("url");
    const isMock = url.searchParams.get("mock") === "true";

    // --- 0. 基础安全校验 & CORS ---
    if (request.method === "OPTIONS") return handleOptions(request);

    const headers = getCorsHeaders(request);

    // --- 0.1 APP Token Check ---
    const token = request.headers.get("X-App-Token");
    if (
      token !== "xpuzzle-v1-open-access" &&
      !url.hostname.includes("localhost") &&
      !url.hostname.includes("127.0.0.1")
    ) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // --- Mock Mode (本地调试救星) ---
    if (isMock) {
      await new Promise((r) => setTimeout(r, 1500)); // 模拟网络延迟
      const mockData = {
        images: [
          "https://pbs.twimg.com/media/GicXRbWbMAAlF_V?format=jpg&name=large",
          "https://pbs.twimg.com/media/GicXRbXboAACDK9?format=jpg&name=large",
          "https://pbs.twimg.com/media/GicXRbWbAAIm1dG?format=jpg&name=large",
        ],
      };
      return new Response(JSON.stringify(mockData), {
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    if (!target) return new Response("Missing URL", { status: 400, headers });

    try {
      // --- 场景 A: 解析推特帖子 (带缓存) ---
      if (mode === "parse") {
        return await handleParseWithCache(target, request, ctx, headers);
      }

      // --- 场景 B: 代理下载图片 ---
      else if (mode === "proxy") {
        return await handleProxy(target, headers);
      }

      return new Response("Invalid mode", { status: 400, headers });
    } catch (e) {
      return new Response(`Error: ${e.message}`, { status: 500, headers });
    }
  },
};

// --- 动态 CORS Headers ---
function getCorsHeaders(request) {
  const origin = request.headers.get("Origin");
  let allowed = PRODUCTION_ORIGIN;

  if (origin) {
    // 允许生产域名
    if (origin === PRODUCTION_ORIGIN) {
      allowed = origin;
    }
    // 允许本地开发 (localhost 或 127.0.0.1 任意端口)
    else if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      allowed = origin;
    }
  }

  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function handleOptions(request) {
  return new Response(null, { headers: getCorsHeaders(request) });
}

// --- 核心逻辑 A: 解析 (带缓存) ---
async function handleParseWithCache(tweetUrl, request, ctx, corsHeadersObj) {
  const cacheUrl = new URL(request.url);
  // 优化缓存 Key: 仅保留必要参数
  const cacheKeyUrl = new URL(cacheUrl.origin + cacheUrl.pathname);
  if (cacheUrl.searchParams.has("url")) {
    cacheKeyUrl.searchParams.set("url", cacheUrl.searchParams.get("url"));
  }
  // 仅在 parse 模式下缓存
  // cacheKeyUrl.searchParams.set("mode", "parse");

  const cacheKey = new Request(cacheKeyUrl.toString(), request);
  const cache = caches.default;

  // 1. 尝试读取缓存
  let response = await cache.match(cacheKey);
  if (response) {
    console.log("Cache Hit:", tweetUrl);
    // 重新构造 Response 以确保 CORS 头正确 (缓存的头可能不包含动态 Origin)
    const newHeaders = new Headers(response.headers);
    newHeaders.set(
      "Access-Control-Allow-Origin",
      corsHeadersObj["Access-Control-Allow-Origin"],
    );
    newHeaders.set("X-Cache-Status", "HIT");
    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  }

  // 2. 缓存未命中，执行解析
  console.log("Cache Miss:", tweetUrl);

  // 提取 Tweet ID 和 Username
  const match = tweetUrl.match(
    /(twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status\/(\d+)/,
  );
  const username = match ? match[2] : "Twitter";
  const tweetId = match ? match[3] : null;

  // 定义解析源策略
  const sources = [
    {
      name: "FxTwitter",
      host: "api.fxtwitter.com",
      path: (user, id) => `https://api.fxtwitter.com/${user}/status/${id}`,
    },
    {
      name: "VxTwitter",
      host: "api.vxtwitter.com",
      path: (user, id) => `https://api.vxtwitter.com/${user}/status/${id}`,
    },
  ];

  if (!tweetId) {
    return new Response(JSON.stringify({ error: "Invalid Tweet URL" }), {
      status: 400,
      headers: { ...corsHeadersObj, "Content-Type": "application/json" },
    });
  }

  let errors = [];
  let finalData = null; // 修复 ReferenceError

  // 3. 轮询尝试解析源
  for (const source of sources) {
    try {
      console.log(`Trying source: ${source.name}`);
      const apiUrl = source.path(username, tweetId);
      const apiResp = await fetch(apiUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json",
        },
      });

      if (apiResp.ok) {
        const data = await apiResp.json();

        // 统一数据格式 (VxTwitter 和 FxTwitter 结构略有不同，需适配)
        let images = [];
        if (source.name === "FxTwitter") {
          if (data.tweet?.media?.photos)
            images = data.tweet.media.photos.map((p) => p.url);
        } else if (source.name === "VxTwitter") {
          if (data.media_extended)
            images = data.media_extended
              .filter((m) => m.type === "image")
              .map((m) => m.url);
        }

        if (images.length > 0) {
          finalData = { images };
          break; // 成功拿到数据，跳出循环
        } else {
          errors.push(`${source.name}: No images found in response`);
        }
      } else {
        errors.push(`${source.name}: HTTP ${apiResp.status}`);
      }
    } catch (e) {
      console.error(`Source ${source.name} failed:`, e);
      errors.push(`${source.name}: ${e.message}`);
      lastError = e;
    }
  }

  if (!finalData) {
    return new Response(
      JSON.stringify({
        error: "All upstream services failed",
        details: errors,
      }),
      {
        status: 502,
        headers: { ...corsHeadersObj, "Content-Type": "application/json" },
      },
    );
  }

  const resultBody = JSON.stringify(finalData);

  // 4. 构造响应并写入缓存
  response = new Response(resultBody, {
    headers: {
      ...corsHeadersObj,
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${CACHE_TTL}`, // 指示 Cloudflare 缓存
      "X-Cache-Status": "MISS",
    },
  });

  // 异步写入缓存 (不阻塞响应)
  ctx.waitUntil(cache.put(cacheKey, response.clone()));

  return response;
}

// --- 核心逻辑 B: 代理下载 ---
async function handleProxy(imageUrl, corsHeadersObj) {
  // 校验目标 URL 是否合法 (防止 SSRF)
  try {
    const u = new URL(imageUrl);
    // 修复 SSRF: 严格校验域名后缀
    if (u.hostname !== "twimg.com" && !u.hostname.endsWith(".twimg.com")) {
      return new Response("Forbidden Host", {
        status: 403,
        headers: corsHeadersObj,
      });
    }
  } catch (e) {
    return new Response("Invalid URL", {
      status: 400,
      headers: corsHeadersObj,
    });
  }

  const imageResp = await fetch(imageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Referer: "https://twitter.com/",
    },
  });

  // 转发必要的 Headers，过滤敏感/无用 Headers
  const newHeaders = new Headers();

  // 先设置基础 CORS 头
  for (const key in corsHeadersObj) {
    newHeaders.set(key, corsHeadersObj[key]);
  }

  const allowedForwardHeaders = [
    "content-type",
    "content-length",
    "last-modified",
    "cache-control",
    "date",
    "etag",
  ];

  for (const [key, value] of imageResp.headers) {
    if (allowedForwardHeaders.includes(key.toLowerCase())) {
      newHeaders.set(key, value);
    }
  }

  return new Response(imageResp.body, {
    status: imageResp.status,
    headers: newHeaders,
  });
}
