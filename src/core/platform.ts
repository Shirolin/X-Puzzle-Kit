/**
 * 跨平台环境适配层
 * 用于隔离 Chrome 插件 API 与标准 Web API (PWA/Website)
 */

export interface PlatformEnv {
  isExtension: boolean;
  isStandalone: boolean;
  isShortcut: boolean;
  isIOS: boolean;
  isPopup: boolean;
}

export const getPlatformEnv = (): PlatformEnv => {
  const isExtension =
    typeof __IS_EXTENSION__ !== "undefined" ? __IS_EXTENSION__ : false;
  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  // 检测是否来自 iOS 快捷指令分享 (通过 URL 参数)
  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const isShortcut = isIOS && params?.get("source") === "shortcut";

  // 检测是否为 PWA Standalone 模式
  const isStandalone = !!(
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (typeof navigator !== "undefined" &&
        "standalone" in navigator &&
        (navigator as { standalone?: boolean }).standalone))
  );

  // 检测是否为插件 Popup (通常可以通过 URL 或特定标记)
  const isPopup =
    isExtension &&
    typeof window !== "undefined" &&
    (window.location.pathname.includes("popup.html") ||
      window.name === "x-puzzle-kit-popup");

  return {
    isExtension,
    isStandalone,
    isShortcut,
    isIOS,
    isPopup,
  };
};

export const isExtension =
  typeof __IS_EXTENSION__ !== "undefined" ? __IS_EXTENSION__ : false;

/**
 * 抽象存储接口：优先使用 chrome.storage.local，环境不存在时回退到 localStorage
 */
export const platformStorage = {
  async get<T extends Record<string, unknown>>(
    keys: string | string[] | T,
  ): Promise<T> {
    if (__IS_EXTENSION__ && typeof chrome !== "undefined" && chrome.storage) {
      return chrome.storage.local.get(keys) as Promise<T>;
    }

    const res = {} as T;
    const keyList = Array.isArray(keys)
      ? keys
      : typeof keys === "string"
        ? [keys]
        : Object.keys(keys as T);

    const defaults = (
      !Array.isArray(keys) && typeof keys === "object" ? keys : {}
    ) as T;

    for (const key of keyList) {
      const val = localStorage.getItem(key);
      let parsed: unknown;
      try {
        parsed = val !== null ? JSON.parse(val) : defaults[key];
      } catch {
        parsed = val ?? defaults[key];
      }
      res[key as keyof T] = parsed as T[keyof T];
    }
    return res;
  },

  async set(items: Record<string, unknown>): Promise<void> {
    if (__IS_EXTENSION__ && typeof chrome !== "undefined" && chrome.storage) {
      return chrome.storage.local.set(items);
    }

    for (const [key, value] of Object.entries(items)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },
};

/**
 * 图片抓取适配：插件模式走 Background Proxy，Web 模式直接 fetch (需确保已处理 CORS)
 */
export const fetchImageData = async (
  url: string,
): Promise<{ dataUrl?: string; error?: string }> => {
  if (__IS_EXTENSION__ && typeof chrome !== "undefined" && chrome.runtime) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "FETCH_IMAGE", url }, (response) => {
        resolve(response);
      });
    });
  }

  // Web 模式：通常图片已通过系统分享或剪贴板传入，若需动态抓取则尝试直接 fetch
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve({ dataUrl: reader.result as string });
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return { error: (e as Error).message };
  }
};

/**
 * 资产路径适配：插件环境使用 chrome-extension://，Web 环境使用相对路径
 */
export const getAssetUrl = (path: string): string => {
  if (__IS_EXTENSION__ && typeof chrome !== "undefined" && chrome.runtime) {
    return chrome.runtime.getURL(path);
  }
  // Web 版本直接返回相对或绝对路径
  return path.startsWith("/") ? path : `/${path}`;
};
