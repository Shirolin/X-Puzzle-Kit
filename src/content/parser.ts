import { mountUI } from "../ui";
import { recommendLayout } from "../core/layout";
import { ImageNode, StitchTask } from "../core/types";

/**
 * 解析页面上的推文并注入拼接按钮
 */
export function parseTweets() {
  const tweets = document.querySelectorAll('article[data-testid="tweet"]');

  tweets.forEach((tweet) => {
    // 检查是否已经注入过按钮
    if (tweet.querySelector(".x-puzzle-stitcher-btn")) return;

    // 查找推文中的图片
    const photoContainers = tweet.querySelectorAll(
      'div[data-testid="tweetPhoto"]',
    );
    if (photoContainers.length >= 2 && photoContainers.length <= 4) {
      injectStitchButton(tweet as HTMLElement, photoContainers);
    }
  });
}

/**
 * 在推文中注入“拼接”按钮（SVG 图标版）
 */
function injectStitchButton(tweet: HTMLElement, photos: NodeListOf<Element>) {
  // 查找推文的工具栏 (转发、点赞所在的那一行)
  const actionBar = tweet.querySelector('div[role="group"][aria-label]');
  if (!actionBar) return;

  // 动态注入样式（如果尚未存在）
  if (!document.getElementById("x-puzzle-stitcher-styles")) {
    const style = document.createElement("style");
    style.id = "x-puzzle-stitcher-styles";
    style.textContent = `
      @keyframes x-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .x-stitch-loading-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(113, 118, 123, 0.2);
        border-top: 2px solid rgb(29, 155, 240);
        border-radius: 50%;
        animation: x-spin 0.8s linear infinite;
      }
    `;
    document.head.appendChild(style);
  }

  const container = document.createElement("div");
  container.className = "x-puzzle-stitcher-btn";
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.flex = "1";

  // 模拟 Twitter 图标按钮的 HTML 结构
  // 颜色默认使用用户要求的 #71767b (即 rgb(113, 118, 123))
  container.innerHTML = `
    <div role="button" tabindex="0" title="拼接图片" class="x-stitch-btn-inner" style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34.75px;
      height: 34.75px;
      border-radius: 9999px;
      cursor: pointer;
      color: #71767b;
      transition: background-color 0.2s, color 0.2s;
      outline: none;
    ">
      <div class="x-stitch-icon-wrapper" style="display: flex; align-items: center; justify-content: center;">
        <svg viewBox="0 0 512 512" style="width: 18.75px; height: 18.75px; fill: none;">
          <g stroke="currentColor" stroke-width="32" stroke-linecap="round" stroke-linejoin="round">
            <rect x="32" y="32" width="448" height="448" rx="80" />
            <line x1="256" y1="32" x2="256" y2="480" />
            <line x1="32" y1="256" x2="480" y2="256" />
            <path d="M166 166 L110 110 M166 166 V110 M166 166 H110" />
            <path d="M346 166 L402 110 M346 166 V110 M346 166 H402" />
            <path d="M166 346 L110 402 M166 346 V402 M166 346 H110" />
            <path d="M346 346 L402 402 M346 346 V402 M346 346 H402" />
          </g>
        </svg>
      </div>
    </div>
  `;

  const innerBtn = container.querySelector(
    ".x-stitch-btn-inner",
  ) as HTMLElement;
  const iconWrapper = container.querySelector(
    ".x-stitch-icon-wrapper",
  ) as HTMLElement;
  const originalIconHtml = iconWrapper.innerHTML;

  // 模拟 Twitter 的蓝光 Hover 效果
  innerBtn.onmouseenter = () => {
    if (innerBtn.style.cursor === "not-allowed") return;
    innerBtn.style.backgroundColor = "rgba(29, 155, 240, 0.1)";
    innerBtn.style.color = "rgb(29, 155, 240)";
  };
  innerBtn.onmouseleave = () => {
    if (innerBtn.style.cursor === "not-allowed") return;
    innerBtn.style.backgroundColor = "transparent";
    innerBtn.style.color = "#71767b";
  };

  innerBtn.onclick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (innerBtn.style.cursor === "not-allowed") return;

    // 进入加载状态
    innerBtn.style.cursor = "not-allowed";
    innerBtn.style.color = "rgb(29, 155, 240)";
    iconWrapper.innerHTML = '<div class="x-stitch-loading-spinner"></div>';

    try {
      await handleStitchClick(tweet, photos);
    } catch (err) {
      console.error("Stitch error:", err);
    } finally {
      // 恢复状态
      innerBtn.style.cursor = "pointer";
      innerBtn.style.color = "#71767b";
      innerBtn.style.backgroundColor = "transparent";
      iconWrapper.innerHTML = originalIconHtml;
    }
  };

  actionBar.appendChild(container);
}

/**
 * 点击拼接按钮后的处理逻辑
 */
async function handleStitchClick(
  tweet: HTMLElement,
  photos: NodeListOf<Element>,
) {
  // 提取画师和推文 ID
  let artistHandle = "unknown";
  let tweetId = "unknown";

  const timeElement = tweet.querySelector("time");
  const tweetLink = timeElement?.parentElement as HTMLAnchorElement;
  if (tweetLink?.href) {
    const match = tweetLink.href.match(/\/(.+)\/status\/(\d+)/);
    if (match) {
      artistHandle = match[1];
      tweetId = match[2];
    }
  }

  const imageNodes: ImageNode[] = Array.from(photos)
    .map((photo, index) => {
      const img = photo.querySelector("img");
      if (!img) return null;

      let originalUrl = img.src;
      try {
        const url = new URL(img.src);
        if (url.hostname === "pbs.twimg.com") {
          url.searchParams.set("name", "orig");
          originalUrl = url.toString();
        }
      } catch (e) {
        console.warn("Parse image URL error:", e);
      }

      return {
        id: index.toString(),
        originalUrl: originalUrl,
        thumbnailUrl: img.src,
        width: img.naturalWidth || 1000,
        height: img.naturalHeight || 1000,
        visible: true,
      };
    })
    .filter((n) => n !== null) as ImageNode[];

  if (imageNodes.length === 0) return;

  const layout = recommendLayout(imageNodes);

  const task: StitchTask = {
    taskId: Date.now().toString(),
    tweetId: tweetId,
    artistHandle: artistHandle,
    pageTitle: document.title,
    userImages: imageNodes,
    layout: layout,
    outputFormat: "png",
    globalGap: 0,
  };

  await mountUI(task);
}
