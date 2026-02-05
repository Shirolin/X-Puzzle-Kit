import { mountUI, initToaster } from "../ui";
import { recommendLayout } from "../core/layout";
import { ImageNode, StitchTask } from "../core/types";
import { t } from "../core/i18n";
import { toast } from "sonner";

/**
 * Parse tweets on the page and inject stitch buttons
 */
export function parseTweets(root: ParentNode = document) {
  // 1. Check if the root element itself is a tweet
  if (root instanceof Element && root.matches('article[data-testid="tweet"]')) {
    processTweet(root as HTMLElement);
  }

  // 2. Find descendant tweets
  const tweets = root.querySelectorAll('article[data-testid="tweet"]');
  tweets.forEach((tweet) => processTweet(tweet as HTMLElement));
}

function processTweet(tweet: HTMLElement) {
  // Check if button is already injected
  if (tweet.querySelector(".x-puzzle-kit-btn")) return;

  // Find images in the tweet
  const photoContainers = tweet.querySelectorAll(
    'div[data-testid="tweetPhoto"]',
  );
  if (photoContainers.length >= 2 && photoContainers.length <= 4) {
    injectStitchButton(tweet, photoContainers);
  }
}

/**
 * Inject "Stitch" button (SVG Icon version) into the tweet
 */
function injectStitchButton(tweet: HTMLElement, photos: NodeListOf<Element>) {
  // Find tweet action bar (where Retweet/Like buttons are)
  const actionBar = tweet.querySelector('div[role="group"][aria-label]');
  if (!actionBar) return;

  const container = createButtonContainer();
  const innerBtn = createInnerButton();
  const iconWrapper = createIconWrapper();
  const svg = createStitchIcon();

  iconWrapper.append(svg);
  innerBtn.append(iconWrapper);
  container.append(innerBtn);

  innerBtn.onclick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (innerBtn.classList.contains("x-loading")) return;

    // Enter loading state
    innerBtn.classList.add("x-loading");

    // Clear icon and show spinner
    iconWrapper.innerHTML = "";
    const spinner = document.createElement("div");
    spinner.className = "x-stitch-loading-spinner";
    iconWrapper.append(spinner);

    try {
      await handleStitchClick(tweet, photos);
    } catch (err) {
      console.error("Stitch error:", err);
      // Handle extension context invalidated (common during dev)
      if (
        err instanceof Error &&
        err.message.includes("Extension context invalidated")
      ) {
        await initToaster();
        toast.error(
          t("extensionUpdatedRefresh") ||
            "Extension updated. Please refresh the page.",
        );
      } else {
        await initToaster();
        const errorMessage = err instanceof Error ? err.message : String(err);
        toast.error("Error: " + errorMessage);
      }
    } finally {
      // Restore state
      innerBtn.classList.remove("x-loading");
      iconWrapper.innerHTML = "";
      iconWrapper.append(svg);
    }
  };

  actionBar.appendChild(container);
}

function createButtonContainer() {
  const container = document.createElement("div");
  container.className = "x-puzzle-kit-btn";
  return container;
}

function createInnerButton() {
  const innerBtn = document.createElement("div");
  innerBtn.role = "button";
  innerBtn.tabIndex = 0;
  innerBtn.title = t("stitchBtnTitle");
  innerBtn.className = "x-stitch-btn-inner";
  return innerBtn;
}

function createIconWrapper() {
  const iconWrapper = document.createElement("div");
  iconWrapper.className = "x-stitch-icon-wrapper";
  return iconWrapper;
}

function createStitchIcon() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.classList.add("x-stitch-svg");

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("stroke", "currentColor");
  g.setAttribute("stroke-width", "1.9"); // 微调笔触
  g.setAttribute("stroke-linecap", "round");
  g.setAttribute("stroke-linejoin", "round");

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", "1.5");
  rect.setAttribute("y", "1.5");
  rect.setAttribute("width", "21");
  rect.setAttribute("height", "21");
  rect.setAttribute("rx", "3");

  const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line1.setAttribute("x1", "12");
  line1.setAttribute("y1", "1.5");
  line1.setAttribute("x2", "12");
  line1.setAttribute("y2", "22.5");

  const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line2.setAttribute("x1", "1.5");
  line2.setAttribute("y1", "12");
  line2.setAttribute("x2", "22.5");
  line2.setAttribute("y2", "12");

  const p1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p1.setAttribute("d", "M7.5 7.5 L4.5 4.5 M7.5 7.5 V4.5 M7.5 7.5 H4.5");

  const p2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p2.setAttribute("d", "M16.5 7.5 L19.5 4.5 M16.5 7.5 V4.5 M16.5 7.5 H19.5");

  const p3 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p3.setAttribute("d", "M7.5 16.5 L4.5 19.5 M7.5 16.5 V19.5 M7.5 16.5 H4.5");

  const p4 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p4.setAttribute(
    "d",
    "M16.5 16.5 L19.5 19.5 M16.5 16.5 V19.5 M16.5 16.5 H19.5",
  );

  g.append(rect, line1, line2, p1, p2, p3, p4);
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
    try {
      const url = new URL(tweetLink.href);
      const parts = url.pathname.split("/").filter(Boolean);
      // Expected: ["username", "status", "id"]
      if (parts.length >= 3 && parts[1] === "status") {
        artistHandle = parts[0];
        tweetId = parts[2];
      }
    } catch (e) {
      console.warn("Failed to parse tweet link:", e);
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
        source: {
          tweetId,
          artistHandle,
        },
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
