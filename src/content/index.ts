console.log("[X-Puzzle-Stitcher] Content script loaded");

import { parseTweets } from "./parser";

// 简单的观察者模式，监听 DOM 变化
const observer = new MutationObserver(() => {
  parseTweets();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// 初始执行一次
parseTweets();
