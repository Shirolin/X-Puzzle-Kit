import "./mock-chrome"; // Init Mock
import { parseTweets } from "../src/content/parser";

// Elements
const feed = document.getElementById("twitter-feed") as HTMLDivElement;
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

// Panel 1: URL Builder
const inputUrl = document.getElementById("input-url") as HTMLInputElement;
const inputImages = document.getElementById(
  "input-images",
) as HTMLTextAreaElement;
const inputCount = document.getElementById("input-count") as HTMLSelectElement;
const btnBuild = document.getElementById("btn-build") as HTMLButtonElement;

// Panel 2: HTML Paste
const inputHtml = document.getElementById("input-html") as HTMLTextAreaElement;
const btnInject = document.getElementById("btn-inject") as HTMLButtonElement;

// --- Tab Logic ---
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    panels.forEach((p) => p.classList.remove("active"));

    tab.classList.add("active");
    const target = tab.getAttribute("data-target");
    if (target) document.getElementById(target)?.classList.add("active");
  });
});

// --- Mock Builder Logic ---
btnBuild.addEventListener("click", () => {
  const tweetUrl =
    inputUrl.value.trim() || "https://x.com/mock_user/status/123456789";
  const rawImages = inputImages.value
    .trim()
    .split("\n")
    .filter((s) => s.trim());

  const imageUrls = rawImages;

  // 如果没填图片，使用占位图
  if (imageUrls.length === 0) {
    const count = parseInt(inputCount.value);
    for (let i = 0; i < count; i++) {
      imageUrls.push(`https://picsum.photos/500/500?random=${Date.now() + i}`);
    }
  }

  // 解析元数据
  let username = "mock_user";
  let tweetId = "123456789";
  const tweetLink = new URL(tweetUrl); // Assuming tweetUrl is a valid URL
  const match = tweetLink.href.match(/\/(.+)\/status\/(\d+)/);
  if (match) {
    username = match[1];
    tweetId = match[2];
  }

  const html = generateMockHtml(username, tweetId, tweetUrl, imageUrls);
  renderAndRun(html);
});

// --- HTML Paste Logic ---
btnInject.addEventListener("click", () => {
  const rawHtml = inputHtml.value;
  if (!rawHtml.trim()) return;
  const cleanHtml = cleanTwitterHTML(rawHtml);
  renderAndRun(cleanHtml);
});

// --- Core Functions ---

function renderAndRun(html: string) {
  feed.innerHTML = html;

  // Remove existing plugins if any (simple reset)
  const existingBtns = document.querySelectorAll(".x-puzzle-stitcher-btn");
  existingBtns.forEach((b) => b.remove());

  setTimeout(() => {
    console.log("[TestEnv] Parsing tweets...");
    parseTweets();
  }, 100);
}

function generateMockHtml(
  username: string,
  tweetId: string,
  url: string,
  images: string[],
): string {
  // 根据图片数量决定 Grid 布局样式 (仅视觉模拟)
  let gridStyle =
    "display: grid; gap: 2px; height: 300px; border-radius: 16px; overflow: hidden;";
  if (images.length === 1) gridStyle += "grid-template-columns: 1fr;";
  else if (images.length === 2) gridStyle += "grid-template-columns: 1fr 1fr;";
  else if (images.length === 3)
    gridStyle += "grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;"; // Simplified
  else
    gridStyle += "grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;";

  const imagesHtml = images
    .map(
      (src, _i) => `
    <div data-testid="tweetPhoto" style="position: relative; overflow: hidden; background: #eee;">
      <img src="${src}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
    </div>
  `,
    )
    .join("");

  return `
    <article data-testid="tweet" role="article">
      <div style="display: flex; gap: 12px;">
        <div class="mock-avatar"></div>
        <div style="flex: 1; min-width: 0;">
          <div style="margin-bottom: 4px;">
            <strong>Mock User</strong> 
            <span style="color: #536471;">@${username} · 1h</span>
          </div>
          <div style="margin-bottom: 12px; white-space: pre-wrap;">Mock tweet content for testing. <a href="${url}">${url}</a></div>
          
          <!-- Image Grid -->
          <div style="${gridStyle}">
            ${imagesHtml}
          </div>

          <!-- Action Bar for Plugin Injection -->
          <div role="group" aria-label="Reply, Retweet, Like" style="margin-top: 12px; display: flex; justify-content: space-between; max-width: 425px; color: #536471; height: 32px; align-items: center;">
            <span>💬</span>
            <span>Retweet</span>
            <span>❤️</span>
            <!-- Plugin injects here -->
          </div>
        </div>
      </div>
    </article>
  `;
}

/**
 * 清洗 Twitter 的 HTML，移除导致错位的绝对定位和 transform
 */
function cleanTwitterHTML(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const cellInnerDivs = doc.querySelectorAll('div[data-testid="cellInnerDiv"]');
  cellInnerDivs.forEach((div) => {
    (div as HTMLElement).style.transform = "none";
    (div as HTMLElement).style.position = "static";
  });

  const articles = doc.querySelectorAll("article");
  articles.forEach((article) => {
    (article as HTMLElement).style.transform = "none";
  });

  return doc.body.innerHTML;
}
