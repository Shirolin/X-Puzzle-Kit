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
  return chrome.i18n.getMessage(messageName, substitutions) || messageName;
}
