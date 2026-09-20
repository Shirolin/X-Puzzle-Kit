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
import langUk from "../_locales/uk/messages.json";
import langRu from "../_locales/ru/messages.json";
import langIt from "../_locales/it/messages.json";
import langId from "../_locales/id/messages.json";
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
  uk: langUk,
  ru: langRu,
  it: langIt,
  id: langId,
  in: langId, // 印尼语的历史语言代码，与 prefixMap 的兜底保持一致
};

let currentMessages: Record<string, { message: string }> | null = null;

/**
 * Identify the current browser language
 */
function resolveAutoLanguage(): string {
  const lang = navigator.language.toLowerCase();

  // 顺序敏感：具体的 zh-* 标签必须排在裸 "zh" 兜底之前，
  // 否则 zh-Hant / zh-MO 等会被 startsWith("zh") 命中而误判为简体。
  const prefixMap: Record<string, string> = {
    "zh-hans": "zh_CN", // 简体（含 zh-Hans-CN）
    "zh-cn": "zh_CN",
    "zh-hant": "zh_TW", // 繁体（含 zh-Hant-TW / -HK / -MO）
    "zh-tw": "zh_TW",
    "zh-hk": "zh_TW",
    "zh-mo": "zh_TW", // 中国澳门使用繁体
    zh: "zh_CN", // 兜底中文
    ja: "ja",
    ko: "ko",
    es: "es",
    fr: "fr",
    de: "de",
    pt: "pt_BR", // 葡萄牙语家族统一回落 pt_BR
    tr: "tr",
    uk: "uk",
    ru: "ru",
    it: "it",
    id: "id",
    in: "id", // 印尼语的历史语言代码（旧版 ICU / Java 使用），兼容性兜底
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
  // 与 getResolvedLanguage 保持一致：未知语言代码回落到 default_locale（en），
  // 避免出现「中文文案 + data-lang=en 字体栈」的错配
  currentMessages = locales[targetLang] || locales["en"];

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
