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
 * @param lang 语言代码 (en, zh_CN, ja, zh_TW) 或 'auto'
 */
export async function setLanguage(lang: string) {
  const targetLang = lang === "auto" ? resolveAutoLanguage() : lang;

  try {
    const url = chrome.runtime.getURL(`_locales/${targetLang}/messages.json`);
    const res = await fetch(url);
    if (!res.ok) throw new Error("File not found");
    const data = await res.json();
    currentMessages = data;
  } catch (e) {
    console.error("Failed to load language:", targetLang, e);
    // 最终兜底使用中文
    if (targetLang !== "zh_CN") {
      await setLanguage("zh_CN");
    }
  }
}

// 自动初始化：从存储或浏览器语言读取
const savedLang =
  typeof localStorage !== "undefined"
    ? localStorage.getItem("x-puzzle-stitcher-lang") || "auto"
    : "auto";
export const i18nInit = setLanguage(savedLang);

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
