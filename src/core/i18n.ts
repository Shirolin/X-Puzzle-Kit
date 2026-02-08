import langEn from "../_locales/en/messages.json";
import langZhCN from "../_locales/zh_CN/messages.json";
import langZhTW from "../_locales/zh_TW/messages.json";
import langJa from "../_locales/ja/messages.json";
import langKo from "../_locales/ko/messages.json";
import langEs from "../_locales/es/messages.json";
import langFr from "../_locales/fr/messages.json";

const locales: Record<string, Record<string, { message: string }>> = {
  en: langEn,
  zh_CN: langZhCN,
  zh_TW: langZhTW,
  ja: langJa,
  ko: langKo,
  es: langEs,
  fr: langFr,
};

let currentMessages: Record<string, { message: string }> | null = null;

/**
 * Identify the current browser language
 */
function resolveAutoLanguage(): string {
  const lang = navigator.language.toLowerCase();

  // 优先全字匹配
  if (lang === "zh-cn" || lang === "zh") return "zh_CN";
  if (lang === "zh-tw" || lang === "zh-hk") return "zh_TW";

  const prefixMap: Record<string, string> = {
    "zh-cn": "zh_CN",
    zh: "zh_CN", // 兜底中文
    ja: "ja",
    ko: "ko",
    es: "es",
    fr: "fr",
  };

  for (const [prefix, locale] of Object.entries(prefixMap)) {
    if (lang.startsWith(prefix)) return locale;
  }
  return "en";
}

/**
 * Set the manually overridden language
 */
export async function setLanguage(lang: string) {
  const targetLang = lang === "auto" ? resolveAutoLanguage() : lang;
  currentMessages = locales[targetLang] || locales["zh_CN"];
  if (typeof chrome !== "undefined" && chrome.storage) {
    await chrome.storage.local.set({ "x-puzzle-kit-lang": lang });
  }
}

/**
 * Get the currently effective language code (e.g. "zh_CN" instead of "auto")
 */
export function getResolvedLanguage(currentLangSetting: string): string {
  if (currentLangSetting === "auto") return resolveAutoLanguage();
  return locales[currentLangSetting] ? currentLangSetting : "en";
}

import { platformStorage } from "./platform";

// ... (locales 定义保持不变)

/**
 * Initialize language settings
 */
export async function initI18n() {
  const res = await platformStorage.get({
    "x-puzzle-kit-lang": "auto",
  });
  const savedLang = res["x-puzzle-kit-lang"] as string;
  await setLanguage(savedLang);
}

export const i18nInit = initI18n();

/**
 * Simple i18n wrapper function
 */
export function t(
  messageName: string,
  substitutions?: string | string[],
): string {
  // 如果在插件环境，优先尝试调用原生 API（支持参数替换）
  if (typeof chrome !== "undefined" && chrome.i18n) {
    const msg = chrome.i18n.getMessage(messageName, substitutions);
    if (msg) return msg;
  }

  // 兜底：使用本地加载的 JSON (PWA / Web 环境或插件 API 获取失败)
  if (currentMessages && currentMessages[messageName]) {
    let message = currentMessages[messageName].message;
    if (substitutions) {
      const args = Array.isArray(substitutions)
        ? substitutions
        : [substitutions];
      // 处理 Chrome 格式的占位符 $1, $2... 和命名占位符 $name$
      args.forEach((val, idx) => {
        message = message.replace(`$${idx + 1}`, val);
      });
      // 特殊处理命名占位符（例如 $status$），如果 JSON 中定义了命名占位符，
      // 我们可以尝试基于约定进行替换，或者简化为通配符替换。
      // 为保持简单且兼容 Chrome 定义，由于我们在 placeholders 中定义了 status 为 $1，
      // 上面的 $1 替换已经涵盖了核心需求。
      // 如果手动使用了 $status$ 这种格式，也可以一并兼容：
      message = message.replace(/\$[a-zA-Z0-9_]+\$/g, (match) => {
        // 如果是 workerStatusError 特有的 $status$，直接用第一个参数
        if (match === "$status$" && args.length > 0) return args[0];
        return match;
      });
    }
    return message;
  }

  return messageName;
}
