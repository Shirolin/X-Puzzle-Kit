import langEn from "../../public/_locales/en/messages.json";
import langZhCN from "../../public/_locales/zh_CN/messages.json";
import langZhTW from "../../public/_locales/zh_TW/messages.json";
import langJa from "../../public/_locales/ja/messages.json";
import langKo from "../../public/_locales/ko/messages.json";
import langEs from "../../public/_locales/es/messages.json";
import langFr from "../../public/_locales/fr/messages.json";

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

/**
 * Initialize language settings
 */
export async function initI18n() {
  let savedLang = "auto";
  if (typeof chrome !== "undefined" && chrome.storage) {
    const res = await chrome.storage.local.get({
      "x-puzzle-kit-lang": "auto",
    });
    savedLang = res["x-puzzle-kit-lang"] as string;
  }
  await setLanguage(savedLang);
}

export const i18nInit = initI18n();

/**
 * Simple i18n wrapper function
 * @param messageName Message key
 * @param substitutions Substitution parameters
 * @returns Translated text
 */
export function t(
  messageName: string,
  substitutions?: string | string[],
): string {
  if (currentMessages && currentMessages[messageName]) {
    return currentMessages[messageName].message;
  }
  return chrome?.i18n?.getMessage(messageName, substitutions) || messageName;
}
