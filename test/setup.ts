/**
 * 单元测试环境准备。
 *
 * 测试以 __IS_EXTENSION__ = false 运行（见 vitest.config.ts），
 * 此时 src/core/platform.ts 的 platformStorage 会回退到 localStorage。
 * Node 环境没有 localStorage，因此这里注入一个内存实现。
 *
 * 同时 i18n.ts 在模块加载时会执行 `export const i18nInit = initI18n()`，
 * 即读取一次语言设置 —— 没有 localStorage 会导致未处理的 rejection。
 */

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  key(index: number): string | null {
    return [...this.store.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

if (typeof globalThis.localStorage === "undefined") {
  Object.defineProperty(globalThis, "localStorage", {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  });
}

/**
 * 固定 navigator.language。
 *
 * 两个必要性：
 *   1. Node < 21 没有 navigator 全局对象（CI 锁定 Node 20），而 i18n.ts 在
 *      模块加载时即执行 i18nInit → resolveAutoLanguage → navigator.language，
 *      缺失会导致未处理的 rejection 并让测试进程以非 0 退出。
 *   2. Node 21.2+ 虽有 navigator.language，但其取值取决于宿主操作系统语言，
 *      会使语言解析结果随开发机漂移。这里无条件固定，保证可复现。
 *
 * configurable: true 是必需的 —— 测试内 vi.stubGlobal("navigator", ...)
 * 需要能覆盖它，且 vi.unstubAllGlobals() 会恢复到这里设定的值。
 */
Object.defineProperty(globalThis, "navigator", {
  value: { language: "en-US" },
  configurable: true,
  writable: true,
});
