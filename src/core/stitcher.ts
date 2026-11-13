import { ImageNode, LayoutType } from "./types";
import { getGridColumns } from "./layout";
import { platformCanvas, safeCloseImageBitmap } from "./platform";

/**
 * Indicates where an image should be placed on the final canvas.
 */
interface Placement {
  img: ImageNode;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Scene {
  width: number;
  height: number;
  placements: Placement[];
}

/**
 * Main entrance: Stitch multiple images based on the specified layout and return a Canvas.
 * Refactoring logic: Decouple "coordinate calculation" from "canvas rendering".
 */
export async function stitchImages(
  images: ImageNode[],
  layout: LayoutType,
  globalGap: number = 0,
  backgroundColor: string = "transparent",
  shouldDisposeBitmaps: boolean = false,
): Promise<HTMLCanvasElement | OffscreenCanvas> {
  // 1. Data validation and preparation
  const visibleImages = images.filter((img) => img.visible !== false);
  if (visibleImages.length === 0) return platformCanvas.create(1, 1);

  for (const img of visibleImages) {
    if (!img.bitmap) throw new Error(`Image data not loaded: ${img.id}`);
  }

  // 2. Select layout strategy to calculate positions (Pure Logic)
  const scene = calculateLayout(visibleImages, layout, globalGap);

  // 3. Execute unified rendering stream (Render Side-effect)
  const resultCanvas = drawScene(scene, backgroundColor);

  // 4. Critical: Explicitly release GPU memory (ImageBitmaps) to prevent leaks, especially in PWA/Extension
  if (shouldDisposeBitmaps) {
    for (const img of visibleImages) {
      if (img.bitmap) {
        safeCloseImageBitmap(img.bitmap);
        img.bitmap = undefined; // Clear reference
      }
    }
  }

  return resultCanvas;
}

/**
 * Layout strategy router (pure coordinate calculation, exported for testing)
 */
export function calculateLayout(
  images: ImageNode[],
  layout: LayoutType,
  gap: number,
): Scene {
  switch (layout) {
    case "HORIZONTAL_2x1":
    case "HORIZONTAL_Nx1":
      return layoutHorizontal(images, gap);
    case "VERTICAL_1x2":
    case "VERTICAL_1xN":
      return layoutVertical(images, gap);
    case "GRID_2x2":
      // Smart fallback: use T-Shape if 3 images, horizontal if less than 3, adaptive grid for >= 4
      if (images.length === 3) return layoutTShape3(images, gap);
      if (images.length < 3) return layoutHorizontal(images, gap);
      return layoutGrid(images, gap);
    case "T_SHAPE_3":
      // Smart fallback: use horizontal if less than 3 images
      if (images.length < 3) return layoutHorizontal(images, gap);
      return layoutTShape3(images, gap);
    default:
      return layoutHorizontal(images, gap);
  }
}

/**
 * Layout: Horizontal stitching
 */
function layoutHorizontal(images: ImageNode[], globalGap: number): Scene {
  const baseImg = images[0];
  const targetHeight = Math.round(baseImg.height);
  let currentX = 0;

  const placements: Placement[] = images.map((img, idx) => {
    const scale = targetHeight / img.height;
    const width = Math.round(img.width * scale);
    const x = currentX;

    const gap =
      idx === images.length - 1
        ? 0
        : Math.round(globalGap + (img.localGap || 0));
    currentX += width + gap;

    return { img, x, y: 0, width, height: targetHeight };
  });

  return { width: currentX, height: targetHeight, placements };
}

/**
 * Layout: Vertical stitching
 */
function layoutVertical(images: ImageNode[], globalGap: number): Scene {
  const baseImg = images[0];
  const targetWidth = Math.round(baseImg.width);
  let currentY = 0;

  const placements: Placement[] = images.map((img, idx) => {
    const scale = targetWidth / img.width;
    const height = Math.round(img.height * scale);
    const y = currentY;

    const gap =
      idx === images.length - 1
        ? 0
        : Math.round(globalGap + (img.localGap || 0));
    currentY += height + gap;

    return { img, x: 0, y, width: targetWidth, height };
  });

  return { width: targetWidth, height: currentY, placements };
}

/**
 * Layout: Adaptive Grid (2x2 for 4 images, ceil(sqrt(N)) columns for N > 4)
 * Based on top-row alignment principle; full rows eliminate 1px gaps via difference calculation,
 * while an incomplete last row preserves the previous row's height instead of stretching.
 */
function layoutGrid(images: ImageNode[], globalGap: number): Scene {
  const cols = getGridColumns(images.length);
  const rows: ImageNode[][] = [];
  for (let i = 0; i < images.length; i += cols) {
    rows.push(images.slice(i, i + cols));
  }

  const placements: Placement[] = [];

  // Row 0 establishes the target rowWidth using the first image's height
  const firstRow = rows[0];
  const h0 = Math.max(1, Math.round(firstRow[0].height));
  let rowWidth = 0;
  for (let j = 0; j < firstRow.length; j++) {
    const img = firstRow[j];
    const w =
      j === 0
        ? Math.max(1, Math.round(img.width))
        : Math.max(1, Math.round(img.width * (h0 / img.height)));
    placements.push({ img, x: rowWidth, y: 0, width: w, height: h0 });
    rowWidth += w;
    if (j < firstRow.length - 1) {
      rowWidth += Math.round(globalGap + (img.localGap || 0));
    }
  }

  let currentY = h0;
  let prevRowHeight = h0;
  let maxWidth = rowWidth;

  for (let r = 1; r < rows.length; r++) {
    const prevRow = rows[r - 1];
    const prevRowLastImg = prevRow[prevRow.length - 1];
    const vGap = Math.round(globalGap + (prevRowLastImg.localGap || 0));
    currentY += vGap;

    const row = rows[r];
    const hGaps: number[] = [];
    let rowGapSum = 0;
    for (let j = 0; j < row.length - 1; j++) {
      const gap = Math.round(globalGap + (row[j].localGap || 0));
      hGaps.push(gap);
      rowGapSum += gap;
    }

    const isFullRow = row.length === cols;
    let rowHeight = prevRowHeight;
    if (isFullRow) {
      const ratioSum = row.reduce(
        (sum, img) => sum + img.width / img.height,
        0,
      );
      rowHeight = Math.max(1, Math.round((rowWidth - rowGapSum) / ratioSum));
    }

    let x = 0;
    for (let j = 0; j < row.length; j++) {
      const img = row[j];
      const isLastInFullRow = isFullRow && j === row.length - 1;
      const w = isLastInFullRow
        ? Math.max(1, rowWidth - x) // Eliminate 1px gap
        : Math.max(1, Math.round((img.width / img.height) * rowHeight));
      placements.push({ img, x, y: currentY, width: w, height: rowHeight });
      x += w;
      if (j < row.length - 1) {
        x += hGaps[j];
      }
    }

    maxWidth = Math.max(maxWidth, x);
    prevRowHeight = rowHeight;
    currentY += rowHeight;
  }

  return {
    width: Math.max(1, maxWidth),
    height: Math.max(1, currentY),
    placements,
  };
}

/**
 * Layout: T-Shape (Large image on the left, two small images on the right)
 */
function layoutTShape3(images: ImageNode[], globalGap: number): Scene {
  const imgL = images[0];
  const imgR1 = images[1];
  const imgR2 = images[2];

  const targetHeight = Math.round(imgL.height);
  const vGap = Math.round(globalGap + (imgR1.localGap || 0));
  const hGap = Math.round(globalGap + (imgL.localGap || 0));

  const sumRatio = imgR1.height / imgR1.width + imgR2.height / imgR2.width;
  const rightWidth = Math.round((targetHeight - vGap) / sumRatio);
  const hR1 = Math.round((imgR1.height / imgR1.width) * rightWidth);
  const hR2 = targetHeight - vGap - hR1; // Eliminate 1px gap

  const wL = Math.round(imgL.width);
  const totalWidth = wL + hGap + rightWidth;

  return {
    width: totalWidth,
    height: targetHeight,
    placements: [
      { img: imgL, x: 0, y: 0, width: wL, height: targetHeight },
      { img: imgR1, x: wL + hGap, y: 0, width: rightWidth, height: hR1 },
      {
        img: imgR2,
        x: wL + hGap,
        y: hR1 + vGap,
        width: rightWidth,
        height: hR2,
      },
    ],
  };
}

/**
 * Rendering Engine: Draw the calculated position information onto the Canvas.
 */
function drawScene(
  scene: Scene,
  backgroundColor: string,
): HTMLCanvasElement | OffscreenCanvas {
  // 多图（如 20 张原图拼接）可能超过浏览器单边 32767px 或总面积上限，超限时等比缩放防崩溃
  const MAX_CANVAS_DIM = 32767;
  const MAX_CANVAS_AREA = 268435456; // 16384 * 16384
  const rawW = Math.max(1, scene.width);
  const rawH = Math.max(1, scene.height);
  let scale = 1;
  if (rawW > MAX_CANVAS_DIM || rawH > MAX_CANVAS_DIM) {
    scale = Math.min(scale, MAX_CANVAS_DIM / rawW, MAX_CANVAS_DIM / rawH);
  }
  if (rawW * rawH * scale * scale > MAX_CANVAS_AREA) {
    scale = Math.min(scale, Math.sqrt(MAX_CANVAS_AREA / (rawW * rawH)));
  }

  const canvasW = Math.max(1, Math.floor(rawW * scale));
  const canvasH = Math.max(1, Math.floor(rawH * scale));
  const canvas = platformCanvas.create(canvasW, canvasH);

  const ctx = canvas.getContext("2d") as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;
  if (!ctx) return canvas;

  // 1:1 时关闭插值保证物理像素对齐；仅在超限降采样时开启高质量平滑
  ctx.imageSmoothingEnabled = scale < 1;
  if (scale < 1 && "imageSmoothingQuality" in ctx) {
    ctx.imageSmoothingQuality = "high";
  }

  // Fill background
  if (backgroundColor !== "transparent") {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Iterate and draw images
  for (const p of scene.placements) {
    if (p.img.bitmap) {
      ctx.drawImage(
        p.img.bitmap,
        p.x * scale,
        p.y * scale,
        p.width * scale,
        p.height * scale,
      );
    }
  }

  return canvas;
}
