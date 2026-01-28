import { mountUI } from "../ui";
import { recommendLayout } from "../core/layout";
import { ImageNode, StitchTask } from "../core/types";
import { t } from "../core/i18n";

/**
 * Parse tweets on the page and inject stitch buttons
 */
export function parseTweets() {
  const tweets = document.querySelectorAll('article[data-testid="tweet"]');

  tweets.forEach((tweet) => {
    // Check if button is already injected
    if (tweet.querySelector(".x-puzzle-stitcher-btn")) return;

    // Find images in the tweet
    const photoContainers = tweet.querySelectorAll(
      'div[data-testid="tweetPhoto"]',
    );
    if (photoContainers.length >= 2 && photoContainers.length <= 4) {
      injectStitchButton(tweet as HTMLElement, photoContainers);
    }
  });
}

/**
 * Inject "Stitch" button (SVG Icon version) into the tweet
 */
function injectStitchButton(tweet: HTMLElement, photos: NodeListOf<Element>) {
  // Find tweet action bar (where Retweet/Like buttons are)
  const actionBar = tweet.querySelector('div[role="group"][aria-label]');
  if (!actionBar) return;

  // Dynamically inject styles
  injectStyles();

  const container = createButtonContainer();
  const innerBtn = createInnerButton();
  const iconWrapper = createIconWrapper();
  const svg = createStitchIcon();

  iconWrapper.append(svg);
  innerBtn.append(iconWrapper);
  container.append(innerBtn);

  // Simulate Twitter blue glow Hover effect
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

    // Enter loading state
    innerBtn.style.cursor = "not-allowed";
    innerBtn.style.color = "rgb(29, 155, 240)";

    // Clear icon and show spinner
    iconWrapper.innerHTML = "";
    const spinner = document.createElement("div");
    spinner.className = "x-stitch-loading-spinner";
    iconWrapper.append(spinner);

    try {
      await handleStitchClick(tweet, photos);
    } catch (err) {
      console.error("Stitch error:", err);
    } finally {
      // Restore state
      innerBtn.style.cursor = "pointer";
      innerBtn.style.color = "#71767b";
      innerBtn.style.backgroundColor = "transparent";
      iconWrapper.innerHTML = "";
      iconWrapper.append(svg);
    }
  };

  actionBar.appendChild(container);
}

function injectStyles() {
  if (document.getElementById("x-puzzle-stitcher-styles")) return;
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

function createButtonContainer() {
  const container = document.createElement("div");
  container.className = "x-puzzle-stitcher-btn";
  Object.assign(container.style, {
    display: "flex",
    alignItems: "center",
    flex: "1",
  });
  return container;
}

function createInnerButton() {
  const innerBtn = document.createElement("div");
  innerBtn.role = "button";
  innerBtn.tabIndex = 0;
  innerBtn.title = t("stitchBtnTitle");
  innerBtn.className = "x-stitch-btn-inner";
  Object.assign(innerBtn.style, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "34.75px",
    height: "34.75px",
    borderRadius: "9999px",
    cursor: "pointer",
    color: "#71767b",
    transition: "background-color 0.2s, color 0.2s",
    outline: "none",
  });
  return innerBtn;
}

function createIconWrapper() {
  const iconWrapper = document.createElement("div");
  iconWrapper.className = "x-stitch-icon-wrapper";
  Object.assign(iconWrapper.style, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });
  return iconWrapper;
}

function createStitchIcon() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 512 512");
  Object.assign(svg.style, {
    width: "18.75px",
    height: "18.75px",
    fill: "none",
  });

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("stroke", "currentColor");
  g.setAttribute("stroke-width", "32");
  g.setAttribute("stroke-linecap", "round");
  g.setAttribute("stroke-linejoin", "round");

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", "32");
  rect.setAttribute("y", "32");
  rect.setAttribute("width", "448");
  rect.setAttribute("height", "448");
  rect.setAttribute("rx", "80");

  const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line1.setAttribute("x1", "256");
  line1.setAttribute("y1", "32");
  line1.setAttribute("x2", "256");
  line1.setAttribute("y2", "480");

  const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line2.setAttribute("x1", "32");
  line2.setAttribute("y1", "256");
  line2.setAttribute("x2", "480");
  line2.setAttribute("y2", "256");

  const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path1.setAttribute("d", "M166 166 L110 110 M166 166 V110 M166 166 H110");

  const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path2.setAttribute("d", "M346 166 L402 110 M346 166 V110 M346 166 H402");

  const path3 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path3.setAttribute("d", "M166 346 L110 402 M166 346 V402 M166 346 H110");

  const path4 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path4.setAttribute("d", "M346 346 L402 402 M346 346 V402 M346 346 H402");

  g.append(rect, line1, line2, path1, path2, path3, path4);
  svg.append(g);
  return svg;
}

/**
 * Logic handling stitch button click
 */
async function handleStitchClick(
  tweet: HTMLElement,
  photos: NodeListOf<Element>,
) {
  // Extract artist handle and tweet ID
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
    backgroundColor: "transparent",
    globalGap: 0,
  };

  await mountUI(task);
}
