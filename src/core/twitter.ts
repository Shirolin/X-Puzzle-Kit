import { APP_CONFIG } from "./config";

// 这里的 workerBase 应该替换为你实际部署后的 Worker 地址
export const DEFAULT_WORKER_URL = APP_CONFIG.WORKER.DEFAULT_URL;

export interface ParsedTwitterData {
  images: string[];
  error?: string;
}

/**
 * 检查字符串是否包含推特链接
 */
export function extractTwitterUrl(text: string): string | null {
  const match = text.match(APP_CONFIG.TWITTER.URL_REGEX);
  return match ? match[0] : null;
}

/**
 * 清洗推特链接，移除追踪参数以提高缓存命中率
 */
export function cleanTwitterUrl(url: string): string {
  try {
    const u = new URL(url);
    // 移除常见追踪参数
    APP_CONFIG.TWITTER.TRACKING_PARAMS.forEach((param) =>
      u.searchParams.delete(param),
    );
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * 简单的重试包装器
 */
async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      // 4xx 错误通常不可重试 (除非是 429)
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        return res;
      }
      throw new Error(`Status ${res.status}`);
    } catch (e) {
      lastError = e;
      if (i < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1))); // 指数退避
      }
    }
  }
  throw lastError;
}

/**
 * 调用 Worker 解析推特链接获取图片列表
 */
export async function parseTwitterMetadata(
  tweetUrl: string,
  workerUrl: string = DEFAULT_WORKER_URL,
): Promise<string[]> {
  if (__IS_EXTENSION__) {
    throw new Error("Twitter parsing is not supported in extension mode");
  }

  try {
    const cleanedUrl = cleanTwitterUrl(tweetUrl);
    const apiUrl = `${workerUrl}/?mode=parse&url=${encodeURIComponent(cleanedUrl)}`;

    const resp = await fetchWithRetry(apiUrl);

    if (!resp.ok) {
      throw new Error(`Worker parse failed: ${resp.status}`);
    }

    const data = (await resp.json()) as ParsedTwitterData;

    if (data.error) {
      throw new Error(`API Error: ${data.error}`);
    }

    return data.images || [];
  } catch (e) {
    console.error("Failed to parse twitter metadata", e);
    throw e;
  }
}

/**
 * 通过 Worker 代理下载图片为 Blob
 */
export async function fetchTwitterImageBlob(
  imageUrl: string,
  workerUrl: string = DEFAULT_WORKER_URL,
  _onProgress?: (loaded: number, total: number) => void, // 预留，fetch流式进度较为复杂，暂不实现
): Promise<Blob> {
  if (__IS_EXTENSION__) {
    throw new Error(
      "Twitter image fetching is not supported in extension mode",
    );
  }

  const proxyUrl = `${workerUrl}/?mode=proxy&url=${encodeURIComponent(imageUrl)}`;

  const resp = await fetchWithRetry(proxyUrl);

  if (!resp.ok) {
    throw new Error(`Worker proxy failed: ${resp.status}`);
  }

  return await resp.blob();
}
