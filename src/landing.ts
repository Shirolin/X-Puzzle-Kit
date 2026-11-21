import { calculateCellRegions, MAX_SPLIT_COUNT } from "./core/splitLayout";
import type { CellRegion } from "./core/types";

type Mode = "original" | "horizontal" | "vertical" | "grid";
type Lang = "zh" | "en";

type CopyKey =
  | "skipLink"
  | "navLabel"
  | "navStitch"
  | "navSplit"
  | "navWorkflow"
  | "navPrivacy"
  | "stitchEyebrow"
  | "stitchTitle"
  | "stitchDesc"
  | "beforeLabel"
  | "beforeCount"
  | "piecesAria"
  | "afterLabel"
  | "afterCount"
  | "resultAlt"
  | "stitchSpec1"
  | "stitchSpec2"
  | "stitchSpec3"
  | "stitchSpec4"
  | "ctaWeb"
  | "ctaExt"
  | "splitEyebrow"
  | "splitTitleLine1"
  | "splitTitlePrefix"
  | "splitTitleSuffix"
  | "splitDesc"
  | "splitHl1Title"
  | "splitHl1Body"
  | "splitHl2Title"
  | "splitHl2Body"
  | "splitHl3Title"
  | "splitHl3Body"
  | "demoAria"
  | "demoPrompt"
  | "modesAria"
  | "modeOriginal"
  | "modeHorizontal"
  | "modeVertical"
  | "modeGrid"
  | "sampleAlt"
  | "sliceCountLabel"
  | "workflowEyebrow"
  | "workflowTitle"
  | "workflowDesc"
  | "wfExtTag"
  | "wfExtTitle"
  | "wfExtDesc"
  | "wfExtLink"
  | "wfPwaTag"
  | "wfPwaTitle"
  | "wfPwaDesc"
  | "wfPwaLink"
  | "wfPrivTag"
  | "wfPrivTitle"
  | "wfPrivDesc"
  | "wfPrivLink"
  | "footerNote"
  | "footerWeb"
  | "footerExt"
  | "footerSource";

interface MetaCopy {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
}

interface TranslationBundle {
  meta: MetaCopy;
  ui: Record<CopyKey, string>;
  toggle: {
    text: string;
    ariaLabel: string;
  };
  output: {
    original: string;
    slices: (count: number) => string;
  };
  canvasAria: {
    original: string;
    grid: string;
    horizontal: (count: number) => string;
    vertical: (count: number) => string;
  };
}

const LANG_STORAGE_KEY = "x-puzzle-kit-lang";
const VALID_MODES: ReadonlySet<string> = new Set<Mode>([
  "original",
  "horizontal",
  "vertical",
  "grid",
]);

const TRANSLATIONS: Record<Lang, TranslationBundle> = {
  zh: {
    meta: {
      title:
        "X-Puzzle-Kit · 拼图与切图工具 | Image Stitcher & Grid Splitter for X",
      description:
        "把多张图按横向、纵向、自适应网格或 T 型拼成一幅，也能把一张图横向、纵向或按田字格切成最多 20 张。支持原图无损导出、推特「一图流」布局优化、直接发布到 X，提供网页工作台、PWA 与 Chrome 扩展。",
      ogTitle: "X-Puzzle-Kit · 拼图与切图工具",
      ogDescription:
        "把多张图按横向、纵向、自适应网格或 T 型拼成一幅，也能把一张图横向、纵向或按田字格切成最多 20 张。纯本地处理，提供网页工作台与 Chrome 扩展。",
      twitterTitle: "X-Puzzle-Kit · 拼图与切图工具",
      twitterDescription:
        "把多张图按横向、纵向、自适应网格或 T 型拼成一幅，也能把一张图横向、纵向或按田字格切成最多 20 张。纯本地处理，提供网页工作台与 Chrome 扩展。",
    },
    ui: {
      skipLink: "跳到主要内容",
      navLabel: "页面导航",
      navStitch: "拼图",
      navSplit: "切图演示",
      navWorkflow: "双端工作流",
      navPrivacy: "隐私政策",
      stitchEyebrow: "X (Twitter) 拼图与长图还原",
      stitchTitle: "把多张图拼成一幅",
      stitchDesc:
        "支持横向、纵向、自适应网格与 T 型布局。自由排序并微调间距，原画质无损导出完整大图。",
      beforeLabel: "拼接前",
      beforeCount: "4 张分图",
      piecesAria: "河湾两岸和河道分在四张独立图片里",
      afterLabel: "拼接后",
      afterCount: "1 张完整图",
      resultAlt: "四张分图接合成同一幅峡谷图，河流连续穿过整张图片",
      stitchSpec1: "2–20 图自适应网格",
      stitchSpec2: "智能消除原图间隙",
      stitchSpec3: "单格/全局间距与底色",
      stitchSpec4: "PNG / JPG / WebP 无损导出",
      ctaWeb: "打开网页工作台",
      ctaExt: "安装 Chrome 扩展",
      splitEyebrow: "创意拆图 · 智能裁切",
      splitTitleLine1: "一张图，",
      splitTitlePrefix: "最多切 ",
      splitTitleSuffix: " 张",
      splitDesc:
        "横向、纵向与田字格切分都支持。逐格微调、单独下载，或打包为 ZIP 并直接发布到 X。",
      splitHl1Title: "推特「一图流」布局优化",
      splitHl1Body: "自动匹配时间线预览比例，多张切图在信息流中无缝衔接。",
      splitHl2Title: "整体 / 分别精细微调",
      splitHl2Body:
        "支持单格拖拽缩放、替换单格图片、消除原图间隙与填充露出底色。",
      splitHl3Title: "直接发布到 X 与灵活导出",
      splitHl3Body:
        "支持扩展端一键填入发帖编辑器、移动端系统分享，或导出单图与 ZIP。",
      demoAria: "切图演示",
      demoPrompt: "试切这张图",
      modesAria: "预览模式",
      modeOriginal: "原图",
      modeHorizontal: "横向",
      modeVertical: "纵向",
      modeGrid: "田字格",
      sampleAlt: "海岸公路、红色汽车和浪花",
      sliceCountLabel: "切片数量",
      workflowEyebrow: "双端工作流与隐私承诺",
      workflowTitle: "从桌面时间线到移动端，一套顺手工作流",
      workflowDesc:
        "浏览器扩展深度嵌入 X 页面，网页与 PWA 覆盖手机和平板；无论哪一端，图片拼接与切分都在本地完成。",
      wfExtTag: "桌面端扩展",
      wfExtTitle: "Chrome 扩展",
      wfExtDesc:
        "在多图推文操作栏一键抓取原图拼接，网页任意图片右键即可拆切；切好后直接填入 X 发帖编辑器，省去保存与二次上传。",
      wfExtLink: "前往 Chrome 商店",
      wfPwaTag: "跨平台 · PWA",
      wfPwaTitle: "Web / PWA 工作台",
      wfPwaDesc:
        "打开网页即用，支持添加到主屏幕离线运行。结合 iOS 官方快捷指令与 Android 系统分享菜单，在 X App 内一键直传拼切。",
      wfPwaLink: "打开网页工作台",
      wfPrivTag: "100% 本地 · 开源",
      wfPrivTitle: "本地隐私与 14 语言支持",
      wfPrivDesc:
        "所有图片处理都在本地 Canvas 完成，不上传图片也不记录个人数据；Web 端仅通过无状态代理按需解析推文。基于 GPL-3.0 开源，内置 14 种语言。",
      wfPrivLink: "阅读隐私政策",
      footerNote: "本地 Canvas 处理 · GPL-3.0 开源 · 支持 14 种语言",
      footerWeb: "打开网页工作台",
      footerExt: "Chrome 扩展",
      footerSource: "查看源码",
    },
    toggle: {
      text: "EN",
      ariaLabel: "Switch to English",
    },
    output: {
      original: "原图",
      slices: (count) => `${count} 张`,
    },
    canvasAria: {
      original: "海岸示例原图",
      grid: "海岸示例图按田字格切分为 4 张",
      horizontal: (count) => `海岸示例图横向切分为 ${count} 张`,
      vertical: (count) => `海岸示例图纵向切分为 ${count} 张`,
    },
  },
  en: {
    meta: {
      title: "X-Puzzle-Kit · Image Stitcher & Grid Splitter for X",
      description:
        "Stitch multiple images horizontally, vertically, into an adaptive grid, or T-shape, or split one image horizontally, vertically, or into a 2×2 grid of up to 20 slices. Lossless export, X Seamless Flow layout optimization, and direct Post to X via Web App, PWA, and Chrome extension.",
      ogTitle: "X-Puzzle-Kit · Image Stitcher & Grid Splitter for X",
      ogDescription:
        "Seamlessly stitch multiple images into one or split any photo into a 2×2 grid or up to 20 slices. Local browser processing via Web Studio and Chrome extension.",
      twitterTitle: "X-Puzzle-Kit · Image Stitcher & Grid Splitter for X",
      twitterDescription:
        "Lossless image stitching and 2–20 slice grid splitting for X (Twitter), available as a Chrome extension and Web/PWA studio.",
    },
    ui: {
      skipLink: "Skip to main content",
      navLabel: "Page navigation",
      navStitch: "Stitch",
      navSplit: "Split Demo",
      navWorkflow: "Workflow",
      navPrivacy: "Privacy",
      stitchEyebrow: "Stitch & Restore for X",
      stitchTitle: "Stitch multiple images into one",
      stitchDesc:
        "Arrange images in horizontal, vertical, adaptive grid, or T-shape layouts. Reorder panels, fine-tune gaps, and export lossless full-resolution images.",
      beforeLabel: "Before",
      beforeCount: "4 separate panels",
      piecesAria:
        "Four separate image panels showing parts of a canyon and river",
      afterLabel: "After",
      afterCount: "1 seamless image",
      resultAlt:
        "Four panels stitched seamlessly into a single canyon landscape with a continuous river",
      stitchSpec1: "2–20 image adaptive grids",
      stitchSpec2: "Trim original source gaps",
      stitchSpec3: "Per-panel & global gaps + fills",
      stitchSpec4: "Lossless PNG, JPG & WebP",
      ctaWeb: "Open Web Studio",
      ctaExt: "Install Chrome Extension",
      splitEyebrow: "Smart Image Splitter",
      splitTitleLine1: "One image,",
      splitTitlePrefix: "Up to ",
      splitTitleSuffix: " slices",
      splitDesc:
        "Split any image horizontally, vertically, or into a 2×2 grid. Fine-tune each slice, download individually or as a ZIP, and post directly to X.",
      splitHl1Title: "X Seamless Flow Optimization",
      splitHl1Body:
        "Auto-matches timeline preview ratios so split images align seamlessly in the X feed.",
      splitHl2Title: "Unified & Individual Fine-Tuning",
      splitHl2Body:
        "Pan and zoom per cell, swap individual panels, trim built-in gaps, and fill exposed edges.",
      splitHl3Title: "Direct Post to X & Flexible Export",
      splitHl3Body:
        "Attach slices straight to the X composer in the extension, share on mobile, or export images and ZIPs.",
      demoAria: "Image splitting demo",
      demoPrompt: "Try splitting this photo",
      modesAria: "Preview mode",
      modeOriginal: "Original",
      modeHorizontal: "Horizontal",
      modeVertical: "Vertical",
      modeGrid: "2×2 Grid",
      sampleAlt: "Coastal road, red car, and ocean waves",
      sliceCountLabel: "Slice count",
      workflowEyebrow: "Cross-Platform Workflow & Privacy",
      workflowTitle: "One smooth workflow from desktop timeline to mobile",
      workflowDesc:
        "The browser extension embeds right into X, while Web and PWA cover phones and tablets—with all image processing staying local.",
      wfExtTag: "Desktop Extension",
      wfExtTitle: "Chrome Extension",
      wfExtDesc:
        "Grab all images from multi-photo posts in one click, right-click any web image to split, and attach slices straight into the X post composer.",
      wfExtLink: "Chrome Web Store",
      wfPwaTag: "Cross-Platform · PWA",
      wfPwaTitle: "Web / PWA Studio",
      wfPwaDesc:
        "Runs right in your browser and installs offline. Use the official iOS Shortcut or Android share sheet to send posts straight from the X app.",
      wfPwaLink: "Open Web Studio",
      wfPrivTag: "100% Local · Open Source",
      wfPrivTitle: "Local Privacy & 14 Languages",
      wfPrivDesc:
        "All stitching and splitting runs locally on Canvas with zero image uploads or tracking; Web uses a stateless proxy only when parsing post URLs. GPL-3.0 open source in 14 languages.",
      wfPrivLink: "Privacy Policy",
      footerNote:
        "Local Canvas processing · GPL-3.0 Open Source · 14 Languages",
      footerWeb: "Open Web Studio",
      footerExt: "Chrome Extension",
      footerSource: "View Source",
    },
    toggle: {
      text: "中文",
      ariaLabel: "切换到简体中文",
    },
    output: {
      original: "Original",
      slices: (count) => (count === 1 ? "1 slice" : `${count} slices`),
    },
    canvasAria: {
      original: "Original coastal sample photo",
      grid: "Coastal sample photo split into a 2×2 grid of 4 slices",
      horizontal: (count) =>
        `Coastal sample photo split horizontally into ${count} slices`,
      vertical: (count) =>
        `Coastal sample photo split vertically into ${count} slices`,
    },
  },
};

const photo = document.querySelector<HTMLImageElement>("#sample");
const canvas =
  document.querySelector<HTMLCanvasElement>(".demo canvas") ??
  document.querySelector("canvas");
const controls = document.querySelector<HTMLFieldSetElement>(".modes");
const buttons = controls ? Array.from(controls.querySelectorAll("button")) : [];
const count = document.querySelector<HTMLInputElement>("#slice-count");
const countLabel =
  document.querySelector<HTMLOutputElement>(
    '.demo output[for="slice-count"]',
  ) ?? document.querySelector<HTMLOutputElement>("output");
const ruler = document.querySelector<HTMLElement>(".ruler");
const langToggle = document.querySelector<HTMLButtonElement>("#lang-toggle");

const metaDescription = document.querySelector<HTMLMetaElement>(
  'meta[name="description"]',
);
const metaOgTitle = document.querySelector<HTMLMetaElement>(
  'meta[property="og:title"]',
);
const metaOgDescription = document.querySelector<HTMLMetaElement>(
  'meta[property="og:description"]',
);
const metaTwitterTitle = document.querySelector<HTMLMetaElement>(
  'meta[name="twitter:title"]',
);
const metaTwitterDescription = document.querySelector<HTMLMetaElement>(
  'meta[name="twitter:description"]',
);

const context = canvas?.getContext("2d") ?? null;

let mode: Mode = "horizontal";
let lang: Lang = detectLanguage();
let previewReady = false;

if (count) {
  count.max = String(MAX_SPLIT_COUNT);
  count.value = count.max;
}

function detectLanguage(): Lang {
  const params = new URLSearchParams(window.location.search);
  const queryLang = params.get("lang")?.trim().toLowerCase();
  if (queryLang) {
    if (queryLang.startsWith("en")) return "en";
    if (queryLang.startsWith("zh")) return "zh";
  }

  try {
    const savedLang = localStorage
      .getItem(LANG_STORAGE_KEY)
      ?.trim()
      .toLowerCase();
    if (savedLang) {
      if (savedLang === "en" || savedLang.startsWith("en")) return "en";
      if (
        savedLang === "zh_cn" ||
        savedLang === "zh_tw" ||
        savedLang.startsWith("zh")
      ) {
        return "zh";
      }
    }
  } catch {
    // Ignore storage access errors in restricted contexts
  }

  const browserLang = (navigator.language || "").trim().toLowerCase();
  return browserLang.startsWith("zh") ? "zh" : "en";
}

function saveLanguage(nextLang: Lang): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, nextLang === "en" ? "en" : "zh_CN");
  } catch {
    // Ignore storage write errors in restricted contexts
  }
}

function getCopy(
  bundle: TranslationBundle,
  key: string | undefined,
): string | undefined {
  if (!key || !Object.prototype.hasOwnProperty.call(bundle.ui, key)) {
    return undefined;
  }
  return bundle.ui[key as CopyKey];
}

function applyLanguage(nextLang: Lang): void {
  const bundle = TRANSLATIONS[nextLang];

  document.documentElement.lang = nextLang === "en" ? "en" : "zh-CN";
  document.documentElement.dataset.lang = nextLang;

  const { meta } = bundle;
  document.title = meta.title;
  metaDescription?.setAttribute("content", meta.description);
  metaOgTitle?.setAttribute("content", meta.ogTitle);
  metaOgDescription?.setAttribute("content", meta.ogDescription);
  metaTwitterTitle?.setAttribute("content", meta.twitterTitle);
  metaTwitterDescription?.setAttribute("content", meta.twitterDescription);

  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
    const text = getCopy(bundle, element.dataset.i18n);
    if (text !== undefined) {
      element.textContent = text;
    }
  });

  const attributeTargets: ReadonlyArray<
    readonly [selector: string, dataKey: "i18nAria" | "i18nAlt", attr: string]
  > = [
    ["[data-i18n-aria]", "i18nAria", "aria-label"],
    ["[data-i18n-alt]", "i18nAlt", "alt"],
  ];

  attributeTargets.forEach(([selector, dataKey, attr]) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      const value = getCopy(bundle, element.dataset[dataKey]);
      if (value !== undefined) {
        element.setAttribute(attr, value);
      }
    });
  });

  if (langToggle) {
    langToggle.textContent = bundle.toggle.text;
    langToggle.setAttribute("aria-label", bundle.toggle.ariaLabel);
  }

  drawPreview();
}

function getPieceCount(): number {
  if (mode === "original") return 1;
  if (mode === "grid") return 4;
  const raw = count?.valueAsNumber;
  if (raw === undefined || !Number.isFinite(raw)) {
    return MAX_SPLIT_COUNT;
  }
  return Math.min(MAX_SPLIT_COUNT, Math.max(2, Math.round(raw)));
}

function updateDemoControls(pieces: number): void {
  const bundle = TRANSLATIONS[lang];
  const isOriginal = mode === "original";
  const isGrid = mode === "grid";

  if (count) {
    count.disabled = !previewReady || isOriginal || isGrid;
  }

  if (countLabel) {
    countLabel.value = isOriginal
      ? bundle.output.original
      : bundle.output.slices(pieces);
  }

  if (canvas) {
    const description = isOriginal
      ? bundle.canvasAria.original
      : isGrid
        ? bundle.canvasAria.grid
        : mode === "vertical"
          ? bundle.canvasAria.vertical(pieces)
          : bundle.canvasAria.horizontal(pieces);
    canvas.setAttribute("aria-label", description);
  }

  buttons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.mode === mode));
  });

  if (ruler) {
    const tickCount = isOriginal ? 0 : pieces;
    ruler.style.gridTemplateColumns = `repeat(${Math.max(tickCount, 1)}, 1fr)`;
    const ticks = Array.from({ length: tickCount }, (_, index) => {
      const tick = document.createElement("span");
      tick.textContent = String(index + 1).padStart(2, "0");
      return tick;
    });
    ruler.replaceChildren(...ticks);
  }
}

interface CanvasLayoutPlan {
  regions: CellRegion[];
  paddingX: number;
  paddingY: number;
  getOffset: (index: number) => { x: number; y: number };
}

function buildCanvasLayoutPlan(
  pieces: number,
  imageWidth: number,
  imageHeight: number,
): CanvasLayoutPlan {
  if (mode === "original") {
    return {
      regions: calculateCellRegions(
        { layout: "HORIZONTAL_Nx1", rows: 1, cols: 1, gap: 0 },
        imageWidth,
        imageHeight,
      ),
      paddingX: 0,
      paddingY: 0,
      getOffset: () => ({ x: 0, y: 0 }),
    };
  }

  if (mode === "grid") {
    const gridGap = 22;
    const gridStagger = 24;
    return {
      regions: calculateCellRegions(
        { layout: "GRID_2x2", rows: 2, cols: 2, gap: 0 },
        imageWidth,
        imageHeight,
      ),
      paddingX: gridGap + gridStagger,
      paddingY: gridGap + gridStagger,
      getOffset: (index: number) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        return {
          x: col * gridGap + row * gridStagger,
          y: row * gridGap + (1 - col) * gridStagger,
        };
      },
    };
  }

  const isVertical = mode === "vertical";
  const gap = Math.round(Math.max(10, Math.min(22, 160 / pieces)));
  const offset = 72;
  const totalGap = (pieces - 1) * gap;

  return {
    regions: calculateCellRegions(
      {
        layout: isVertical ? "VERTICAL_1xN" : "HORIZONTAL_Nx1",
        rows: pieces,
        cols: pieces,
        gap: 0,
      },
      imageWidth,
      imageHeight,
    ),
    paddingX: isVertical ? offset : totalGap,
    paddingY: isVertical ? totalGap : offset,
    getOffset: (index: number) => {
      const stagger = (index * offset) / Math.max(pieces - 1, 1);
      return isVertical
        ? { x: stagger, y: index * gap }
        : { x: index * gap, y: offset - stagger };
    },
  };
}

function drawPreview(): void {
  const pieces = getPieceCount();
  updateDemoControls(pieces);

  if (!previewReady || !photo || !canvas || !context) return;

  const imageWidth = photo.naturalWidth;
  const imageHeight = photo.naturalHeight;
  if (!imageWidth || !imageHeight) return;

  const { regions, paddingX, paddingY, getOffset } = buildCanvasLayoutPlan(
    pieces,
    imageWidth,
    imageHeight,
  );
  const scale = Math.min(
    (canvas.width - paddingX) / imageWidth,
    (canvas.height - paddingY) / imageHeight,
  );
  const left = (canvas.width - imageWidth * scale - paddingX) / 2;
  const top = (canvas.height - imageHeight * scale - paddingY) / 2;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  regions.forEach(({ x, y, width, height }, index) => {
    const delta = getOffset(index);
    context.drawImage(
      photo,
      x,
      y,
      width,
      height,
      left + x * scale + delta.x,
      top + y * scale + delta.y,
      width * scale,
      height * scale,
    );
  });
}

function initPreview(): void {
  if (!photo || !canvas || !context || previewReady) return;
  previewReady = true;
  drawPreview();
  photo.hidden = true;
  canvas.hidden = false;
  if (controls) controls.disabled = false;
  count?.addEventListener("input", drawPreview);
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextMode = button.dataset.mode;
      if (!nextMode || !VALID_MODES.has(nextMode)) return;
      mode = nextMode as Mode;
      drawPreview();
    });
  });
}

applyLanguage(lang);

langToggle?.addEventListener("click", () => {
  lang = lang === "zh" ? "en" : "zh";
  saveLanguage(lang);
  applyLanguage(lang);
});

if (photo && canvas && context) {
  photo.decode().then(initPreview, () => {
    if (photo.complete && photo.naturalWidth > 0) {
      initPreview();
    }
  });
}
