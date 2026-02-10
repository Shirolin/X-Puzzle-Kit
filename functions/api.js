/**
 * Cloudflare Pages Function - Twitter Proxy API
 */

const PRODUCTION_ORIGIN = "https://x-puzzle-kit.pages.dev";

// 缓存配置
const CACHE_TTL = 3600;

export async function onRequest(context) {
  const { request, waitUntil } = context;
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode");
  const target = url.searchParams.get("url");
  const isMock = url.searchParams.get("mock") === "true";

  // --- 0. CORS ---
  if (request.method === "OPTIONS") return handleOptions(request);
  const headers = getCorsHeaders(request);

  // --- 0.1 APP Token Check ---
  const token = request.headers.get("X-App-Token");
  // 优先从环境变量读取 Secret
  const secretToken = context.env.X_APP_TOKEN || "xpuzzle-v1-open-access";

  if (
    token !== secretToken ||
    (token === secretToken && !url.hostname.includes("localhost"))
  ) {
    // 强化 Origin 校验：不仅校验 Token，还强制检查来源（防跨站调用）
    const origin = request.headers.get("Origin");
    if (
      origin &&
      origin !== PRODUCTION_ORIGIN &&
      !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      return new Response(JSON.stringify({ error: "Forbidden Origin" }), {
        status: 403,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }
  }

  if (token !== secretToken && !url.hostname.includes("localhost")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  // --- Mock Mode ---
  if (isMock) {
    return new Response(
      JSON.stringify({
        images: [
          "https://pbs.twimg.com/media/GicXRbWbMAAlF_V?format=jpg&name=large",
          "https://pbs.twimg.com/media/GicXRbXboAACDK9?format=jpg&name=large",
        ],
      }),
      { headers: { ...headers, "Content-Type": "application/json" } },
    );
  }

  if (!target) return new Response("Missing URL", { status: 400, headers });

  try {
    if (mode === "parse") {
      return await handleParseWithCache(target, request, waitUntil, headers);
    } else if (mode === "proxy") {
      return await handleProxy(target, headers);
    }
    return new Response("Invalid mode", { status: 400, headers });
  } catch (e) {
    // 生产环境隐藏详细错误，防止指纹泄露
    console.error("API Error:", e);
    const isLocal = url.hostname.includes("localhost");
    return new Response(
      JSON.stringify({
        error: isLocal ? e.message : "Internal Server Error",
        type: isLocal ? "Debug info" : "Internal Error",
      }),
      {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" },
      },
    );
  }
}

function getCorsHeaders(request) {
  const origin = request.headers.get("Origin");
  let allowed = PRODUCTION_ORIGIN;
  if (
    origin &&
    (origin === PRODUCTION_ORIGIN ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
  ) {
    allowed = origin;
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

async function handleParseWithCache(
  tweetUrl,
  request,
  waitUntil,
  corsHeadersObj,
) {
  // 优化缓存 Key: 仅保留必要参数，防止缓存投毒
  const cacheUrl = new URL(request.url);
  const cacheKeyUrl = new URL(cacheUrl.origin + cacheUrl.pathname);
  if (cacheUrl.searchParams.has("url")) {
    cacheKeyUrl.searchParams.set("url", cacheUrl.searchParams.get("url"));
  }
  // 暂时注释掉 mode，因为当前只缓存 mode=parse，如果需要区分 mode 可以解开
  // cacheKeyUrl.searchParams.set("mode", "parse");

  const cacheKey = new Request(cacheKeyUrl.toString(), request);

  // 安全地获取缓存对象
  let cache;
  try {
    cache = caches.default;
  } catch (e) {
    cache = null;
  }

  // 1. 尝试缓存
  if (cache) {
    try {
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) {
        const newHeaders = new Headers(cachedResponse.headers);
        newHeaders.set(
          "Access-Control-Allow-Origin",
          corsHeadersObj["Access-Control-Allow-Origin"],
        );
        newHeaders.set("X-Cache-Status", "HIT");
        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          headers: newHeaders,
        });
      }
    } catch (e) {
      console.error("Cache match failed", e);
    }
  }

  // 2. 执行解析
  const match = tweetUrl.match(
    /(?:mobile\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status\/(\d+)/,
  );
  const username = match ? match[1] : null;
  const tweetId = match ? match[2] : null;

  if (!tweetId) {
    return new Response(JSON.stringify({ error: "Invalid Tweet URL" }), {
      status: 400,
      headers: { ...corsHeadersObj, "Content-Type": "application/json" },
    });
  }

  const sources = [
    {
      name: "FxTwitter",
      path: (u, id) => `https://api.fxtwitter.com/${u}/status/${id}`,
    },
    {
      name: "VxTwitter",
      path: (u, id) => `https://api.vxtwitter.com/${u}/status/${id}`,
    },
  ];

  let finalData = null;
  let errors = [];

  for (const source of sources) {
    try {
      const apiResp = await fetch(source.path(username, tweetId), {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "application/json",
        },
      });
      if (apiResp.ok) {
        const data = await apiResp.json();
        let images = [];
        let detectedHandle = username;
        let detectedId = tweetId;

        if (source.name === "FxTwitter" && data.tweet) {
          if (data.tweet.media?.photos) {
            images = data.tweet.media.photos
              .map((p) => p.url)
              .filter((u) => u && typeof u === "string");
          }
          if (data.tweet.author?.screen_name) {
            detectedHandle = data.tweet.author.screen_name;
          }
          if (data.tweet.id_str) {
            detectedId = data.tweet.id_str;
          }
        } else if (data.media_extended) {
          images = data.media_extended
            .filter((m) => m.type === "image" && m.url)
            .map((m) => m.url);
          // VxTwitter mapping if available
          if (data.user_screen_name) detectedHandle = data.user_screen_name;
          if (data.tweetID) detectedId = data.tweetID;
        }

        // 安全校验：确保图片 URL 合法且为字符串数组
        if (Array.isArray(images) && images.length > 0) {
          finalData = {
            images,
            userHandle: String(detectedHandle),
            tweetId: String(detectedId),
          };
          break;
        }
      } else {
        errors.push(`${source.name}: HTTP ${apiResp.status}`);
      }
    } catch (e) {
      errors.push(`${source.name}: ${e.message}`);
    }
  }

  if (!finalData) {
    return new Response(
      JSON.stringify({ error: "All providers failed", details: errors }),
      {
        status: 502,
        headers: { ...corsHeadersObj, "Content-Type": "application/json" },
      },
    );
  }

  const response = new Response(JSON.stringify(finalData), {
    headers: {
      ...corsHeadersObj,
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${CACHE_TTL}`,
      "X-Cache-Status": "MISS",
    },
  });

  // 异步写入缓存
  if (cache && waitUntil) {
    waitUntil(
      cache
        .put(cacheKey, response.clone())
        .catch((e) => console.error("Cache put failed", e)),
    );
  }

  return response;
}

async function handleProxy(imageUrl, corsHeadersObj) {
  try {
    const u = new URL(imageUrl);
    // 强化 SSRF 防御：不仅校验后缀，还严格限制域名和协议
    const isAllowedHost =
      u.hostname === "pbs.twimg.com" || u.hostname === "video.twimg.com";
    const isAllowedProtocol = u.protocol === "https:";

    if (!isAllowedHost || !isAllowedProtocol) {
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
      "User-Agent": "Mozilla/5.0",
      Referer: "https://x.com/",
    },
  });

  const newHeaders = new Headers();
  for (const key in corsHeadersObj) {
    newHeaders.set(key, corsHeadersObj[key]);
  }

  const allowed = [
    "content-type",
    "content-length",
    "last-modified",
    "cache-control",
    "date",
    "etag",
  ];
  for (const [key, value] of imageResp.headers) {
    if (allowed.includes(key.toLowerCase())) newHeaders.set(key, value);
  }

  return new Response(imageResp.body, {
    status: imageResp.status,
    headers: newHeaders,
  });
}
