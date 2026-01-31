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
  const prefixMap: Record<string, string> = {
    "zh-cn": "zh_CN",
    zh: "zh_TW",
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
  if (currentMessages && currentMessages[messageName]) {
    return currentMessages[messageName].message;
  }
  // 如果在插件环境且没有本地翻译，尝试调用原生 API
  if (typeof chrome !== "undefined" && chrome.i18n) {
    return chrome.i18n.getMessage(messageName, substitutions) || messageName;
  }
  return messageName;
}
