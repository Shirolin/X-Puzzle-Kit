import langEn from "../../public/_locales/en/messages.json";
import langZhCN from "../../public/_locales/zh_CN/messages.json";
import langZhTW from "../../public/_locales/zh_TW/messages.json";
import langJa from "../../public/_locales/ja/messages.json";

const locales: Record<string, any> = {
  en: langEn,
  zh_CN: langZhCN,
  zh_TW: langZhTW,
  ja: langJa,
};

let currentMessages: any = null;

/**
 * 识别浏览器当前语言
 */
function resolveAutoLanguage(): string {
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("zh-cn")) return "zh_CN";
  if (lang.startsWith("zh")) return "zh_TW";
  if (lang.startsWith("ja")) return "ja";
  return "en";
}

/**
 * 设置手动覆盖的语言
 */
export async function setLanguage(lang: string) {
  const targetLang = lang === "auto" ? resolveAutoLanguage() : lang;
  currentMessages = locales[targetLang] || locales["zh_CN"];
  if (typeof chrome !== "undefined" && chrome.storage) {
    await chrome.storage.local.set({ "x-puzzle-stitcher-lang": lang });
  }
}

/**
 * 初始化语言设置
 */
export async function initI18n() {
  let savedLang = "auto";
  if (typeof chrome !== "undefined" && chrome.storage) {
    const res = await chrome.storage.local.get({
      "x-puzzle-stitcher-lang": "auto",
    });
    savedLang = res["x-puzzle-stitcher-lang"] as string;
  }
  await setLanguage(savedLang);
}

export const i18nInit = initI18n();

/**
 * 简单的 i18n 包装函数
 * @param messageName 消息 key
 * @param substitutions 替换参数
 * @returns 翻译后的文本
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
