import langEn from "../_locales/en/messages.json";
import langZhCN from "../_locales/zh_CN/messages.json";
import langZhTW from "../_locales/zh_TW/messages.json";
import langJa from "../_locales/ja/messages.json";
import langKo from "../_locales/ko/messages.json";
import langEs from "../_locales/es/messages.json";
import langFr from "../_locales/fr/messages.json";
import langDe from "../_locales/de/messages.json";
import langPt from "../_locales/pt_BR/messages.json";
import langTr from "../_locales/tr/messages.json";
import { platformStorage } from "./platform";

const locales: Record<string, Record<string, { message: string }>> = {
  en: langEn,
  zh_CN: langZhCN,
  zh_TW: langZhTW,
  ja: langJa,
  ko: langKo,
  es: langEs,
  fr: langFr,
  de: langDe,
  pt_BR: langPt,
  pt: langPt, // 保持 pt 引用，确保插件内部逻辑与旧配置兼容
  tr: langTr,
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
    de: "de",
    pt: "pt_BR",
    tr: "tr",
  };

  for (const [prefix, locale] of Object.entries(prefixMap)) {
    if (lang.startsWith(prefix)) return locale;
  }
  // 特殊处理葡萄牙语家族
  if (lang.startsWith("pt")) return "pt_BR";

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
  // 1. 优先使用本地加载的消息集 (支持在插件环境中运行时切换语言)
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
      // 特殊处理命名占位符（例如 $status$）
      message = message.replace(/\$[a-zA-Z0-9_]+\$/g, (match) => {
        if (match === "$status$" && args.length > 0) return args[0];
        return match;
      });
    }
    return message;
  }

  // 2. 兜底尝试原生插件 API (如果本地没加载或找不到 Key)
  if (typeof chrome !== "undefined" && chrome.i18n) {
    const msg = chrome.i18n.getMessage(messageName, substitutions);
    if (msg) return msg;
  }

  return messageName;
}
