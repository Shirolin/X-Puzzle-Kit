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
