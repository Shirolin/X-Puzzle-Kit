/**
 * Global Application Configuration & Constants
 * 全局应用配置与常量
 */

export const APP_CONFIG = {
  // Network & API Configuration
  WORKER: {
    // Production Cloudflare Worker URL
    PRODUCTION_URL: "https://cloudflare-twitter-proxy.shirolin.workers.dev",
    // Local Development URL
    LOCAL_URL: "http://localhost:8787",
    // Current Active URL (Change this for local debugging)
    // process.env.NODE_ENV is handled by Vite, but here we can manually toggle if needed
    DEFAULT_URL: "http://localhost:8787",
  },

  // LocalStorage Keys
  STORAGE: {
    LANG: "x-puzzle-kit-lang",
    FORMAT: "x-puzzle-kit-format",
    BG: "x-puzzle-kit-bg",
    THEME: "x-puzzle-kit-theme",
    SPLIT_OPTIONS: "x-puzzle-kit-split-options",
    IOS_PROMPT_DISMISSED: "xpuzzle_ios_prompt_dismissed",
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
  },
};
