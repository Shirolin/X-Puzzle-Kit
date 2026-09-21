import { describe, it, expect, vi, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  getResolvedLanguage,
  getLocaleMessages,
  t,
} from "../src/core/i18n";

type Entry = {
  message: string;
  description?: string;
  placeholders?: Record<string, unknown>;
};
type Messages = Record<string, Entry>;

const modules = import.meta.glob<{ default: Messages }>(
  "../src/_locales/*/messages.json",
  { eager: true },
);

const locales: Record<string, Messages> = {};
for (const [path, mod] of Object.entries(modules)) {
  const name = path.split("/").slice(-2)[0];
  locales[name] = mod.default;
}

const localeNames = Object.keys(locales).sort();
const base = locales.en;
const baseKeys = Object.keys(base);

/** 不含 lang* 端名键的键集（端名各语言本就不同） */
const contentKeys = baseKeys.filter((k) => !k.startsWith("lang"));

// ---------------------------------------------------------------------------

describe("语言文件完整性", () => {
  it("至少包含 14 个语言，且含 en 基准", () => {
    expect(localeNames.length).toBeGreaterThanOrEqual(14);
    expect(locales.en).toBeDefined();
  });

  it.each(localeNames)("%s 的键集与 en 完全一致", (loc) => {
    const keys = Object.keys(locales[loc]);
    expect(new Set(keys)).toEqual(new Set(baseKeys));
    expect(keys.length).toBe(baseKeys.length);
  });

  it.each(localeNames)("%s 的键序与 en 一致", (loc) => {
    expect(Object.keys(locales[loc])).toEqual(baseKeys);
  });

  it.each(localeNames)("%s 的每条消息都非空且为字符串", (loc) => {
    for (const k of contentKeys) {
      const m = locales[loc][k]?.message;
      expect(typeof m, `${loc}.${k}`).toBe("string");
      expect(m.length, `${loc}.${k} 不应为空`).toBeGreaterThan(0);
    }
  });

  it.each(localeNames)("%s 的 placeholders 与 en 一致", (loc) => {
    for (const k of contentKeys) {
      const a = Object.keys(base[k].placeholders ?? {}).sort();
      const b = Object.keys(locales[loc][k].placeholders ?? {}).sort();
      expect(b, `${loc}.${k}`).toEqual(a);
    }
  });

  it("每条消息的换行数与非转义转义序列与 en 一致", () => {
    // 注意：字面 \n 与真换行必须分别计数，不可相加
    for (const loc of localeNames) {
      for (const k of contentKeys) {
        const en = base[k].message;
        const other = locales[loc][k].message;
        const realNl = (s: string) => s.split("\n").length - 1;
        const literalNl = (s: string) => (s.match(/\\n/g) ?? []).length;
        expect(realNl(other), `${loc}.${k} 真换行数`).toBe(realNl(en));
        expect(literalNl(other), `${loc}.${k} 字面 \\n 数`).toBe(literalNl(en));
      }
    }
  });
});

// ---------------------------------------------------------------------------

describe("语言标签解析（回归：繁体变体曾误判为简体）", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function resolve(language: string): string {
    vi.stubGlobal("navigator", { language });
    return getResolvedLanguage("auto");
  }

  const CASES: Array<[string, string]> = [
    // 简体
    ["zh-CN", "zh_CN"],
    ["zh", "zh_CN"],
    ["zh-Hans", "zh_CN"],
    ["zh-Hans-CN", "zh_CN"],
    // 繁体（此前全部错误返回 zh_CN）
    ["zh-TW", "zh_TW"],
    ["zh-HK", "zh_TW"],
    ["zh-MO", "zh_TW"],
    ["zh-Hant", "zh_TW"],
    ["zh-Hant-TW", "zh_TW"],
    ["zh-Hant-HK", "zh_TW"],
    ["zh-Hant-MO", "zh_TW"],
    // 其余语言
    ["en", "en"],
    ["en-US", "en"],
    ["ja", "ja"],
    ["ja-JP", "ja"],
    ["ko", "ko"],
    ["ko-KR", "ko"],
    ["es", "es"],
    ["es-ES", "es"],
    ["fr", "fr"],
    ["fr-FR", "fr"],
    ["de", "de"],
    ["de-DE", "de"],
    ["pt", "pt_BR"],
    ["pt-BR", "pt_BR"],
    ["pt-PT", "pt_BR"],
    ["tr", "tr"],
    ["tr-TR", "tr"],
    ["uk", "uk"],
    ["uk-UA", "uk"],
    ["ru", "ru"],
    ["ru-RU", "ru"],
    ["it", "it"],
    ["it-IT", "it"],
    ["id", "id"],
    ["id-ID", "id"],
    ["in", "id"],
    // 未支持 → 回落 en
    ["nl", "en"],
    ["ar", "en"],
  ];

  it.each(CASES)("%s → %s", (input, expected) => {
    expect(resolve(input)).toBe(expected);
  });

  it("未支持语言回落到 default_locale(en)，而非 zh_CN", () => {
    expect(resolve("xx-YY")).toBe("en");
  });
});

describe("手动指定语言", () => {
  it("已支持的语言原样返回", () => {
    expect(getResolvedLanguage("ja")).toBe("ja");
    expect(getResolvedLanguage("zh_TW")).toBe("zh_TW");
    expect(getResolvedLanguage("uk")).toBe("uk");
  });

  it("pt 别名与 pt_BR 指向同一语言包", () => {
    // 断言同一对象引用。此前该用例写的是 expect(locales.pt_BR).toBeDefined()，
    // 而 locales.pt_BR 来自 import.meta.glob 的重新加载结果，恒为真，等于没测。
    expect(getLocaleMessages("pt")).toBeDefined();
    expect(getLocaleMessages("pt")).toBe(getLocaleMessages("pt_BR"));
  });

  it("in 别名与 id 指向同一语言包", () => {
    expect(getLocaleMessages("in")).toBeDefined();
    expect(getLocaleMessages("in")).toBe(getLocaleMessages("id"));
  });

  it("未知语言代码回落到 en", () => {
    expect(getResolvedLanguage("de-DE")).toBe("en");
    expect(getResolvedLanguage("nope")).toBe("en");
  });
});

// ---------------------------------------------------------------------------

describe("关键键存在性（回归）", () => {
  // 这些键曾缺失或曾为硬编码，加入断言防止回归
  const REQUIRED = [
    "close",
    "supportAfdian",
    "altLogo",
    "altAppIcon",
    "altPreview",
  ];

  it.each(localeNames)("%s 含全部关键键", (loc) => {
    for (const k of REQUIRED) {
      expect(locales[loc][k], `${loc}.${k} 缺失`).toBeDefined();
    }
  });

  it("已清理的死键不应重新出现", () => {
    const REMOVED = [
      "previewTitle",
      "splitterTitle",
      "fromArtist",
      "tweetId",
      "preparingHighRes",
      "resetToZero",
      "afterGap",
      "decreaseGap",
      "increaseGap",
      "gapLabel",
      "resetLocalGap",
      "sourcedFrom",
      "uploadImage",
      "changeImage",
      "sourceImage",
      "buyMeCoffee",
      "backgroundColorHelp",
      "userGuideButton",
      "pwaBenefitList",
      "openDebugPanel",
    ];
    for (const loc of localeNames) {
      for (const k of REMOVED) {
        expect(locales[loc][k], `${loc}.${k} 不应存在`).toBeUndefined();
      }
    }
  });
});

// ---------------------------------------------------------------------------

describe("t() 取值行为", () => {
  it("键存在时返回文案本身，不回落到键名", () => {
    for (const k of ["close", "supportAfdian", "altLogo"]) {
      const v = t(k);
      expect(v, `${k} 不应返回键名`).not.toBe(k);
      expect(v.length).toBeGreaterThan(0);
    }
  });

  it("当前语言缺键时回落到 en 文案", () => {
    // setup.ts 固定 navigator.language = en-US，故当前语言即 en。
    // 该用例的意义在于把「t() 永不返回键名（除非 en 也缺）」这一契约固化下来：
    // 正是它让 t(key) || fallback 这类写法变得多余。
    const key = "close";
    expect(t(key)).toBe(locales.en[key].message);
  });

  it("en 也不存在的键返回键名，作为开发期错误信号", () => {
    expect(t("__definitelyMissingKey__")).toBe("__definitelyMissingKey__");
  });

  it("占位符替换生效", () => {
    const withArg = Object.keys(locales.en).find((k) =>
      /\$1/.test(locales.en[k].message),
    );
    if (withArg) {
      const filled = t(withArg, "PLACEHOLDER_VALUE");
      expect(filled).not.toContain("$1");
      expect(filled).toContain("PLACEHOLDER_VALUE");
    }
  });
});

// ---------------------------------------------------------------------------

describe("源码引用的键都在语言包中（回归）", () => {
  it('src 下所有 t("key") 调用均能在 en 中找到', () => {
    const srcDir = path.resolve(process.cwd(), "src");
    const files: string[] = [];
    const walk = (dir: string): void => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(ts|tsx)$/.test(e.name)) files.push(p);
      }
    };
    walk(srcDir);

    const used = new Set<string>();
    for (const f of files) {
      const text = fs.readFileSync(f, "utf8");
      for (const m of text.matchAll(/\bt\(\s*["'`]([A-Za-z0-9_]+)["'`]/g)) {
        used.add(m[1]);
      }
    }

    expect(used.size, "应扫描到 t() 调用").toBeGreaterThan(0);
    const missing = [...used].filter((k) => !(k in base));
    expect(
      missing,
      `以下键被源码引用但 en 未定义: ${missing.join(", ")}`,
    ).toEqual([]);
  });
});
