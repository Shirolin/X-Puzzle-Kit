console.log("[X-Puzzle-Stitcher] Content script loaded");

import { parseTweets } from "./parser";
import { i18nInit } from "../core/i18n";

// 简单的观察者模式，监听 DOM 变化
const observer = new MutationObserver(() => {
  parseTweets();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// 等待语言加载完成后再执行初始扫描
i18nInit.then(() => {
  parseTweets();
});
