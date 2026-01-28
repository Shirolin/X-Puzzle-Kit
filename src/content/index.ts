import { parseTweets } from "./parser";
import { i18nInit } from "../core/i18n";

// Simple observer pattern to listen for DOM changes
const observer = new MutationObserver(() => {
  parseTweets();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Wait for language to load before performing initial scan
i18nInit.then(() => {
  parseTweets();
});
