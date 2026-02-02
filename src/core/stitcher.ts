import { ImageNode, LayoutType } from "./types";

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
): Promise<HTMLCanvasElement> {
  // 1. Data validation and preparation
  const visibleImages = images.filter((img) => img.visible !== false);
  if (visibleImages.length === 0) return document.createElement("canvas");

  for (const img of visibleImages) {
    if (!img.bitmap) throw new Error(`Image data not loaded: ${img.id}`);
  }

  // 2. Select layout strategy to calculate positions (Pure Logic)
  const scene = calculateLayout(visibleImages, layout, globalGap);

  // 3. Execute unified rendering stream (Render Side-effect)
  return drawScene(scene, backgroundColor);
}

/**
 * Layout strategy router
 */
function calculateLayout(
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
      // Smart fallback: use T-Shape if less than 4 images, use horizontal if less than 3
      if (images.length === 3) return layoutTShape3(images, gap);
      if (images.length < 3) return layoutHorizontal(images, gap);
      return layoutGrid2x2(images, gap);
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
 * Layout: Grid (2x2)
 * Based on top-row alignment principle; eliminate 1px gaps via difference calculation.
 */
function layoutGrid2x2(images: ImageNode[], globalGap: number): Scene {
  const h1 = Math.round(images[0].height);
  const gapRow1 = Math.round(globalGap + (images[0].localGap || 0));
  const s1 = h1 / images[1].height;
  const w1_0 = Math.round(images[0].width);
  const w1_1 = Math.round(images[1].width * s1);
  const rowWidth = w1_0 + gapRow1 + w1_1;

  const gapRow2 = Math.round(globalGap + (images[2].localGap || 0));
  const ratioSum2 =
    images[2].width / images[2].height + images[3].width / images[3].height;
  const h2 = Math.round((rowWidth - gapRow2) / ratioSum2);
  const w2_2 = Math.round((images[2].width / images[2].height) * h2);
  const w2_3 = rowWidth - gapRow2 - w2_2; // Eliminate 1px gap

  const vGap = Math.round(globalGap + (images[1].localGap || 0));

  return {
    width: rowWidth,
    height: h1 + vGap + h2,
    placements: [
      { img: images[0], x: 0, y: 0, width: w1_0, height: h1 },
      { img: images[1], x: w1_0 + gapRow1, y: 0, width: w1_1, height: h1 },
      { img: images[2], x: 0, y: h1 + vGap, width: w2_2, height: h2 },
      {
        img: images[3],
        x: w2_2 + gapRow2,
        y: h1 + vGap,
        width: w2_3,
        height: h2,
      },
    ],
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
function drawScene(scene: Scene, backgroundColor: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = scene.width;
  canvas.height = scene.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Key: Disable image smoothing to ensure physical pixel alignment and prevent semi-transparent seams.
  ctx.imageSmoothingEnabled = false;

  // Fill background
  if (backgroundColor !== "transparent") {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Iterate and draw images
  for (const p of scene.placements) {
    if (p.img.bitmap) {
      ctx.drawImage(p.img.bitmap, p.x, p.y, p.width, p.height);
    }
  }

  return canvas;
}
