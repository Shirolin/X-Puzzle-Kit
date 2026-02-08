import "./mock-chrome"; // Init Mock
import { parseTweets } from "../src/content/parser";
import "../src/content/style.css";

// Elements
const feed = document.getElementById("twitter-feed") as HTMLDivElement;
const inputUrl = document.getElementById("input-url") as HTMLInputElement;
const inputImages = document.getElementById(
  "input-images",
) as HTMLTextAreaElement;
const inputCount = document.getElementById("input-count") as HTMLSelectElement;
const inputRatio = document.getElementById("input-ratio") as HTMLSelectElement;
const btnBuild = document.getElementById("btn-build") as HTMLButtonElement;
const presetBtns = document.querySelectorAll(".btn-preset");

const sidebar = document.getElementById("sidebar") as HTMLDivElement;
const btnToggle = document.getElementById(
  "btn-toggle-sidebar",
) as HTMLButtonElement;
const btnFloatingBuild = document.getElementById(
  "btn-floating-build",
) as HTMLButtonElement;
const btnThemeToggle = document.getElementById(
  "btn-theme-toggle",
) as HTMLButtonElement;
const checkShortcutMode = document.getElementById(
  "check-shortcut-mode",
) as HTMLInputElement;

// Theme Toggle Logic
function updateTheme(isDark: boolean) {
  if (isDark) {
    document.body.classList.add("dark");
    btnThemeToggle.textContent = "🌙";
  } else {
    document.body.classList.remove("dark");
    btnThemeToggle.textContent = "🌞";
  }
}

// Init Theme
const savedTheme = localStorage.getItem("theme");
const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
let isDark = savedTheme ? savedTheme === "dark" : systemDark;
updateTheme(isDark);

btnThemeToggle.addEventListener("click", () => {
  isDark = !isDark;
  updateTheme(isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Sidebar Toggle
btnToggle.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
});

// Floating Build Button
btnFloatingBuild.addEventListener("click", () => {
  btnBuild.click();
});

// Auto-collapse on small screens
if (window.innerWidth <= 800) {
  sidebar.classList.add("collapsed");
}

presetBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const ratio = btn.getAttribute("data-ratio");
    if (ratio) {
      inputImages.value += (inputImages.value ? "\n" : "") + ratio;
    }
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

  // Process inputs: URLs or Dimensions
  const imageUrls: string[] = [];

  if (rawImages.length > 0) {
    rawImages.forEach((line) => {
      const dimMatch = line.match(/^(\d+)[xX×](\d+)$/);
      if (dimMatch) {
        // It's a dimension: 800x600
        const [, w, h] = dimMatch;
        imageUrls.push(
          `https://picsum.photos/${w}/${h}?random=${Math.random()}`,
        );
      } else if (line.startsWith("http")) {
        // It's a (valid-ish) URL
        imageUrls.push(line);
      }
    });
  }

  // Fallback if empty: use global presets
  if (imageUrls.length === 0) {
    const count = parseInt(inputCount.value) || 4;
    const ratioStr = inputRatio.value || "500/500";

    for (let i = 0; i < count; i++) {
      imageUrls.push(
        `https://picsum.photos/${ratioStr}?random=${Date.now() + i}`,
      );
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

  // 如果开启了快捷指令模式，模拟带参数启动
  if (checkShortcutMode.checked) {
    console.log("[TestEnv] Simulating Shortcut Launch...");
    const params = new URLSearchParams();
    params.set("url", tweetUrl);
    params.set("title", "Mock Tweet from Shortcut");
    params.set("text", "Check out this tweet!");

    // 使用 history.pushState 模拟 URL 变化，而不触发页面刷新
    const newPath = window.location.pathname + "?" + params.toString();
    window.history.pushState({ path: newPath }, "", newPath);
  } else {
    // 清理可能存在的参数
    window.history.pushState({}, "", window.location.pathname);
  }

  renderAndRun(html);
});

// --- Core Functions ---

function renderAndRun(html: string) {
  feed.innerHTML = html;

  // Remove existing plugins if any (simple reset)
  const existingBtns = document.querySelectorAll(".x-puzzle-kit-btn");
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
