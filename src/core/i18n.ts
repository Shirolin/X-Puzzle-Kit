import langEn from "../_locales/en/messages.json";
import { platformStorage } from "./platform";

export type LocaleMessages = Readonly<
  Record<string, Readonly<{ message: string }>>
>;

const LOCALE_ALIASES: Record<string, string> = {
  pt: "pt_BR", // 保持 pt 引用，确保插件内部逻辑与旧配置兼容
  in: "id", // 印尼语的历史语言代码，与 LANGUAGE_PREFIX_MAP 的兜底保持一致
};

const localeLoaders: Record<
  string,
  () => Promise<{ default: LocaleMessages }>
> = {
  zh_CN: () => import("../_locales/zh_CN/messages.json"),
  zh_TW: () => import("../_locales/zh_TW/messages.json"),
  ja: () => import("../_locales/ja/messages.json"),
  ko: () => import("../_locales/ko/messages.json"),
  es: () => import("../_locales/es/messages.json"),
  fr: () => import("../_locales/fr/messages.json"),
  de: () => import("../_locales/de/messages.json"),
  pt_BR: () => import("../_locales/pt_BR/messages.json"),
  tr: () => import("../_locales/tr/messages.json"),
  uk: () => import("../_locales/uk/messages.json"),
  ru: () => import("../_locales/ru/messages.json"),
  it: () => import("../_locales/it/messages.json"),
  id: () => import("../_locales/id/messages.json"),
};

const loadedLocales: Record<string, LocaleMessages> = {
  en: langEn,
};

function normalizeLocaleCode(lang: string): string {
  return LOCALE_ALIASES[lang] ?? lang;
}

function isSupportedLocale(lang: string): boolean {
  const canonical = normalizeLocaleCode(lang);
  return canonical === "en" || canonical in localeLoaders;
}

let currentMessages: LocaleMessages | null = null;

/**
 * 语言标签前缀 → 语言包代码的映射表。
 *
 * 顺序敏感：具体的 zh-* 标签必须排在裸 "zh" 兜底之前，
 * 否则 zh-Hant / zh-MO 等会被 startsWith("zh") 命中而误判为简体。
 * 匹配采用 startsWith 前缀比较，因此 Object.entries 的遍历顺序即优先级顺序。
 */
const LANGUAGE_PREFIX_MAP: Record<string, string> = {
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

/**
 * Identify the current browser language
 */
function resolveAutoLanguage(): string {
  // 非浏览器环境（如单元测试的 Node 环境）可能没有 navigator，
  // 直接回落 en，避免模块加载期的 i18nInit 抛出未处理的 rejection
  const lang = (
    typeof navigator !== "undefined" && navigator.language
      ? navigator.language
      : "en"
  ).toLowerCase();

  for (const [prefix, locale] of Object.entries(LANGUAGE_PREFIX_MAP)) {
    if (lang.startsWith(prefix)) return locale;
  }

  return "en";
}

/**
 * 按需加载指定语言代码对应的消息集并缓存。
 * 未知语言代码返回 undefined。
 */
export async function loadLocaleMessages(
  lang: string,
): Promise<LocaleMessages | undefined> {
  const canonical = normalizeLocaleCode(lang);
  if (loadedLocales[canonical]) return loadedLocales[canonical];
  const loader = localeLoaders[canonical];
  if (!loader) return undefined;
  const mod = await loader();
  loadedLocales[canonical] = mod.default;
  return loadedLocales[canonical];
}

/**
 * Set the manually overridden language
 */
export async function setLanguage(lang: string) {
  const targetLang = lang === "auto" ? resolveAutoLanguage() : lang;
  // 与 getResolvedLanguage 保持一致：未知语言代码回落到 default_locale（en），
  // 避免出现「中文文案 + data-lang=en 字体栈」的错配
  currentMessages = (await loadLocaleMessages(targetLang)) ?? loadedLocales.en;

  if (typeof chrome !== "undefined" && chrome.storage) {
    await chrome.storage.local.set({ "x-puzzle-kit-lang": lang });
  }
}

/**
 * Get the currently effective language code (e.g. "zh_CN" instead of "auto")
 */
export function getResolvedLanguage(currentLangSetting: string): string {
  if (currentLangSetting === "auto") return resolveAutoLanguage();
  return isSupportedLocale(currentLangSetting) ? currentLangSetting : "en";
}

/**
 * 获取已加载缓存中指定语言代码对应的消息集。
 *
 * 用途：验证别名映射（如 pt 与 pt_BR 指向同一语言包）以及调试。
 * 未加载或未知语言代码返回 undefined。
 */
export function getLocaleMessages(lang: string): LocaleMessages | undefined {
  return loadedLocales[normalizeLocaleCode(lang)];
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
 * 替换 Chrome 格式的占位符：$1 / $2... 与命名占位符 $name$
 */
function applySubstitutions(
  message: string,
  substitutions?: string | string[],
): string {
  if (!substitutions) return message;
  const args = Array.isArray(substitutions) ? substitutions : [substitutions];
  let result = message;
  args.forEach((val, idx) => {
    result = result.replace(`$${idx + 1}`, val);
  });
  // 特殊处理命名占位符（例如 $status$）
  result = result.replace(/\$[a-zA-Z0-9_]+\$/g, (match) => {
    if (match === "$status$" && args.length > 0) return args[0];
    return match;
  });
  return result;
}

/**
 * Simple i18n wrapper function
 */
export function t(
  messageName: string,
  substitutions?: string | string[],
): string {
  // 1. 当前语言的消息集；当前语言缺该键时回落到 en（default_locale）。
  //    en 是静态导入的，必然存在，因此「漏键 → 显示英文」这一兜底是真实生效的；
  //    只有当 en 也没有该键时才返回键名本身，作为开发期错误信号。
  const entry = currentMessages?.[messageName] ?? loadedLocales.en[messageName];
  if (entry) return applySubstitutions(entry.message, substitutions);

  // 2. 兜底尝试原生插件 API。
  //    注：上一步已回落到 en，且 14 个语言包键集完全一致，走到这里意味着该键
  //    在所有语言中都不存在，故实际不会在此命中；保留以兼容键集不一致的场景。
  if (typeof chrome !== "undefined" && chrome.i18n) {
    const msg = chrome.i18n.getMessage(messageName, substitutions);
    if (msg) return msg;
  }

  return messageName;
}
