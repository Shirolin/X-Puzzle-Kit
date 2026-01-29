import { parseTweets } from "./parser";
import { i18nInit } from "../core/i18n";
import { StitchTask } from "../core/types";

// Simple observer pattern to listen for DOM changes
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node instanceof Element) {
        // 1. Scan for tweets within the added node (or if node is tweet)
        parseTweets(node);

        // 2. Check if the added node is part of an existing tweet (e.g. image loaded later)
        const parentTweet = node.closest('article[data-testid="tweet"]');
        if (parentTweet) {
          parseTweets(parentTweet);
        }
      }
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Wait for language to load before performing initial scan
i18nInit.then(() => {
  parseTweets();
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
