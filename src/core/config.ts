/**
 * Global Application Configuration & Constants
 * 全局应用配置与常量
 */

export const APP_CONFIG = {
  // Network & API Configuration
  WORKER: {
    // Production Cloudflare Pages Function path
    PRODUCTION_URL: "/api",
    // Local Development URL (When using wrangler pages dev)
    LOCAL_URL: "http://localhost:8888/api",
    // Current Active URL
    DEFAULT_URL: "/api",
  },

  // LocalStorage Keys
  STORAGE: {
    LANG: "x-puzzle-kit-lang",
    FORMAT: "x-puzzle-kit-format",
    BG: "x-puzzle-kit-bg",
    THEME: "x-puzzle-kit-theme",
    SPLIT_OPTIONS: "x-puzzle-kit-split-options",
    IOS_PROMPT_DISMISSED: "xpuzzle_ios_prompt_dismissed",
    WEBP_WARNING_DISMISSED: "xpuzzle_webp_warning_dismissed",
  },

  // Twitter Logic Constants
  TWITTER: {
    // Regex to match Twitter/X URLs
    URL_REGEX:
      /https?:\/\/(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/[0-9]+/,
    // Query parameters to remove for better caching
    TRACKING_PARAMS: ["s", "t", "ref_src"],
  },

  // UI Constants
  UI: {
    IOS_PROMPT_COOLDOWN_DAYS: 7,
    IOS_PROMPT_DELAY_MS: 3000,
    PWA_URL: "https://x-puzzle-kit.pages.dev/",
    EXTENSION_STORE_URL:
      "https://chromewebstore.google.com/detail/x-puzzle-kit-stitch-split/nadlbdmcfmjinifkoedegmiejfibdikk",
  },
};
