import { parseTweets } from "./parser";
import { i18nInit } from "../core/i18n";
import { StitchTask } from "../core/types";

// Simple observer pattern to listen for DOM changes
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node instanceof Element) {
        // 单个节点解析失败不应中断整批处理 —— parseTweets 内部用
        // forEach(processTweet)，一个异常节点会让同批次后续节点全部漏处理。
        try {
          // 1. Scan for tweets within the added node (or if node is tweet)
          parseTweets(node);

          // 2. Check if the added node is part of an existing tweet (e.g. image loaded later)
          const parentTweet = node.closest('article[data-testid="tweet"]');
          if (parentTweet) {
            parseTweets(parentTweet);
          }
        } catch (err) {
          console.error("[X-Puzzle-Kit] 节点解析失败，已跳过：", err);
        }
      }
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Wait for language to load before performing initial scan.
// 语言初始化失败时（如扩展上下文失效）仍需执行首轮扫描，
// 否则 i18nInit 的 rejection 会让内容脚本静默失效。
i18nInit
  .catch((err) => {
    console.error("[X-Puzzle-Kit] i18n 初始化失败，以默认语言继续：", err);
  })
  .finally(() => {
    parseTweets();
  })
  .catch((err) => {
    console.error("[X-Puzzle-Kit] 首轮扫描失败：", err);
  });

// Listen for context menu messages
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.type === "OPEN_SPLITTER" && message.url) {
    import("../ui").then(({ mountUI }) => {
      // Mock task for splitter mode
      const emptyTask: StitchTask = {
        taskId: "splitter-" + Date.now(),
        tweetId: "external",
        artistHandle: "external",
        pageTitle: "Split Image",
        userImages: [],
        layout: "GRID_2x2",
        outputFormat: "png",
        backgroundColor: "transparent",
        globalGap: 0,
      };
      mountUI(emptyTask, message.url);
    });
  }
});
