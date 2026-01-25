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
 * 在推文中注入“拼接”按钮
 */
function injectStitchButton(tweet: HTMLElement, photos: NodeListOf<Element>) {
  // 查找推文的工具栏 (转发、点赞所在的那一行)
  const actionBar = tweet.querySelector('div[role="group"][aria-label]');
  if (!actionBar) return;

  const button = document.createElement("div");
  button.className = "x-puzzle-stitcher-btn";
  button.style.display = "inline-flex";
  button.style.alignItems = "center";
  button.innerHTML = `
    <button style="
      background: #1d9bf0;
      color: white;
      border: none;
      border-radius: 9999px;
      padding: 4px 12px;
      margin-left: 10px;
      cursor: pointer;
      font-size: 13px;
      font-weight: bold;
    ">拼接</button>
  `;

  button.onclick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const innerBtn = button.querySelector("button");
    if (!innerBtn || innerBtn.disabled) return;

    // 进入加载状态
    const originalText = innerBtn.innerText;
    innerBtn.innerText = "处理中...";
    innerBtn.disabled = true;
    innerBtn.style.opacity = "0.7";
    innerBtn.style.cursor = "not-allowed";

    try {
      await handleStitchClick(tweet, photos);
    } catch (err) {
      console.error("Stitch error:", err);
    } finally {
      // 恢复状态
      innerBtn.innerText = originalText;
      innerBtn.disabled = false;
      innerBtn.style.opacity = "1";
      innerBtn.style.cursor = "pointer";
    }
  };

  actionBar.appendChild(button);
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
