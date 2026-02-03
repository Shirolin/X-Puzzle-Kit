/**
 * Cloudflare Pages Function - Twitter Proxy API
 * 迁移自 Cloudflare Workers，由 Pages 自动部署。
 * 端点地址: /api
 */

const PRODUCTION_ORIGIN = "https://x-puzzle-kit.pages.dev"; // 生产环境域名

// 缓存配置
const CACHE_TTL = 3600; // 缓存 1 小时

export async function onRequest(context) {
    const { request, env, ctx } = context;
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode");
    const target = url.searchParams.get("url");
    const isMock = url.searchParams.get("mock") === "true";

    // --- 0. 基础安全校验 & CORS ---
    if (request.method === "OPTIONS") return handleOptions(request);

    const headers = getCorsHeaders(request);

    // --- Mock Mode ---
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
}

// --- 动态 CORS Headers ---
function getCorsHeaders(request) {
    const origin = request.headers.get("Origin");
    let allowed = PRODUCTION_ORIGIN;

    if (origin) {
        // 允许生产域名
        if (origin === PRODUCTION_ORIGIN) {
            allowed = origin;
        }
        // 允许本地开发 (localhost)
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
    const cacheKey = new Request(cacheUrl.toString(), request);
    const cache = caches.default;

    // 1. 尝试读取缓存
    let response = await cache.match(cacheKey);
    if (response) {
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
    const match = tweetUrl.match(
        /(twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status\/(\d+)/,
    );
    const username = match ? match[2] : "Twitter";
    const tweetId = match ? match[3] : null;

    if (!tweetId) {
        return new Response(JSON.stringify({ error: "Invalid Tweet URL" }), {
            status: 400,
            headers: { ...corsHeadersObj, "Content-Type": "application/json" },
        });
    }

    const sources = [
        {
            name: "FxTwitter",
            path: (user, id) => `https://api.fxtwitter.com/${user}/status/${id}`,
        },
        {
            name: "VxTwitter",
            path: (user, id) => `https://api.vxtwitter.com/${user}/status/${id}`,
        },
    ];

    let errors = [];
    let finalData = null;

    for (const source of sources) {
        try {
            const apiUrl = source.path(username, tweetId);
            const apiResp = await fetch(apiUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    Accept: "application/json",
                },
            });

            if (apiResp.ok) {
                const data = await apiResp.json();
                let images = [];
                if (source.name === "FxTwitter") {
                    if (data.tweet?.media?.photos) images = data.tweet.media.photos.map((p) => p.url);
                } else {
                    if (data.media_extended) images = data.media_extended.filter((m) => m.type === "image").map((m) => m.url);
                }

                if (images.length > 0) {
                    finalData = { images };
                    break;
                }
            }
        } catch (e) {
            errors.push(`${source.name}: ${e.message}`);
        }
    }

    if (!finalData) {
        return new Response(JSON.stringify({ error: "All upstream failed", details: errors }), {
            status: 502,
            headers: { ...corsHeadersObj, "Content-Type": "application/json" },
        });
    }

    response = new Response(JSON.stringify(finalData), {
        headers: {
            ...corsHeadersObj,
            "Content-Type": "application/json",
            "Cache-Control": `public, max-age=${CACHE_TTL}`,
            "X-Cache-Status": "MISS",
        },
    });

    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
}

// --- 核心逻辑 B: 代理下载 ---
async function handleProxy(imageUrl, corsHeadersObj) {
    try {
        const u = new URL(imageUrl);
        if (!u.hostname.endsWith("twimg.com")) {
            return new Response("Forbidden Host", { status: 403, headers: corsHeadersObj });
        }
    } catch (e) {
        return new Response("Invalid URL", { status: 400, headers: corsHeadersObj });
    }

    const imageResp = await fetch(imageUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Referer: "https://twitter.com/",
        },
    });

    const newHeaders = new Headers();
    for (const key in corsHeadersObj) {
        newHeaders.set(key, corsHeadersObj[key]);
    }

    const allowedHeaders = ["content-type", "content-length", "last-modified", "cache-control", "date", "etag"];
    for (const [key, value] of imageResp.headers) {
        if (allowedHeaders.includes(key.toLowerCase())) {
            newHeaders.set(key, value);
        }
    }

    return new Response(imageResp.body, { status: imageResp.status, headers: newHeaders });
}
