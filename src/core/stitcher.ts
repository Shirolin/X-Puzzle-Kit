import { ImageNode, LayoutType } from "./types";

/**
 * Stitch multiple images according to the specified layout and return a Canvas
 */
export async function stitchImages(
  images: ImageNode[],
  layout: LayoutType,
  globalGap: number = 0,
  backgroundColor: string = "transparent",
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  // Deep alignment: disable image smoothing to prevent transparent seams from sub-pixel interpolation
  ctx.imageSmoothingEnabled = false;

  // Ensure all images have loaded bitmaps
  for (const img of images) {
    if (!img.bitmap) throw new Error(`Image ${img.id} not loaded`);
  }

  // Filter invisible images (already handled in App.tsx, but kept here for robustness)
  const visibleImages = images.filter((img) => img.visible !== false);
  if (visibleImages.length === 0) return canvas;

  switch (layout) {
    case "HORIZONTAL_2x1":
    case "HORIZONTAL_Nx1":
      return stitchHorizontal(
        visibleImages,
        ctx,
        canvas,
        globalGap,
        backgroundColor,
      );
    case "VERTICAL_1x2":
    case "VERTICAL_1xN":
      return stitchVertical(
        visibleImages,
        ctx,
        canvas,
        globalGap,
        backgroundColor,
      );
    case "GRID_2x2":
      return stitchGrid2x2(
        visibleImages,
        ctx,
        canvas,
        globalGap,
        backgroundColor,
      );
    case "T_SHAPE_3":
      return stitchTShape3(
        visibleImages,
        ctx,
        canvas,
        globalGap,
        backgroundColor,
      );
    default:
      return canvas;
  }
}

/**
 * Fill background
 */
function fillBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
) {
  if (color === "transparent") return;
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function stitchHorizontal(
  images: ImageNode[],
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  globalGap: number,
  backgroundColor: string,
) {
  const baseImg = images[0];
  const targetHeight = Math.round(baseImg.height);

  let currentX = 0;
  const scaledImages = images.map((img, idx) => {
    const scale = targetHeight / img.height;
    const scaledWidth = Math.round(img.width * scale);
    const x = currentX;

    // Gap calculation: global gap + local gap specific to this image (no gap for the last image)
    const gap =
      idx === images.length - 1
        ? 0
        : Math.round(globalGap + (img.localGap || 0));

    // Enforce accumulation using rounded components to ensure x is always an integer with no gaps
    currentX += scaledWidth + gap;

    return { img, x, scaledWidth };
  });

  canvas.width = currentX;
  canvas.height = targetHeight;

  fillBackground(ctx, canvas.width, canvas.height, backgroundColor);

  scaledImages.forEach(({ img, x, scaledWidth }) => {
    ctx.drawImage(img.bitmap!, x, 0, scaledWidth, targetHeight);
  });

  return canvas;
}

function stitchVertical(
  images: ImageNode[],
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  globalGap: number,
  backgroundColor: string,
) {
  const baseImg = images[0];
  const targetWidth = Math.round(baseImg.width);

  let currentY = 0;
  const scaledImages = images.map((img, idx) => {
    const scale = targetWidth / img.width;
    const scaledHeight = Math.round(img.height * scale);
    const y = currentY;

    const gap =
      idx === images.length - 1
        ? 0
        : Math.round(globalGap + (img.localGap || 0));

    // Accumulate in physical pixels
    currentY += scaledHeight + gap;

    return { img, y, scaledHeight };
  });

  canvas.width = targetWidth;
  canvas.height = currentY;

  fillBackground(ctx, canvas.width, canvas.height, backgroundColor);

  scaledImages.forEach(({ img, y, scaledHeight }) => {
    ctx.drawImage(img.bitmap!, 0, y, targetWidth, scaledHeight);
  });

  return canvas;
}

function stitchGrid2x2(
  images: ImageNode[],
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  globalGap: number,
  backgroundColor: string,
) {
  if (images.length < 4)
    return stitchHorizontal(images, ctx, canvas, globalGap, backgroundColor);

  // Row 1: img0, img1
  const h1 = Math.round(images[0].height);
  const gap1 = Math.round(globalGap + (images[0].localGap || 0));
  const s1 = h1 / images[1].height;
  const w1_0 = Math.round(images[0].width);
  const w1_1 = Math.round(images[1].width * s1);
  const row1Width = w1_0 + gap1 + w1_1;

  // Row 2: img2, img3
  const gap2 = Math.round(globalGap + (images[2].localGap || 0));
  const ratioSum2 =
    images[2].width / images[2].height + images[3].width / images[3].height;
  const h2Prime = Math.round((row1Width - gap2) / ratioSum2);

  const w2_2Prime = Math.round((images[2].width / images[2].height) * h2Prime);
  // To ensure the total width of Row 2 strictly equals row1Width, calculate the width of the last image by difference to eliminate 1px gaps
  const w2_3Prime = row1Width - gap2 - w2_2Prime;

  // Vertical gap between rows
  const verticalGap = Math.round(globalGap + (images[1].localGap || 0));

  canvas.width = row1Width;
  canvas.height = h1 + verticalGap + h2Prime;

  fillBackground(ctx, canvas.width, canvas.height, backgroundColor);

  // Draw Row 1
  ctx.drawImage(images[0].bitmap!, 0, 0, w1_0, h1);
  ctx.drawImage(images[1].bitmap!, w1_0 + gap1, 0, w1_1, h1);

  // Draw Row 2
  ctx.drawImage(images[2].bitmap!, 0, h1 + verticalGap, w2_2Prime, h2Prime);
  ctx.drawImage(
    images[3].bitmap!,
    w2_2Prime + gap2,
    h1 + verticalGap,
    w2_3Prime,
    h2Prime,
  );

  return canvas;
}

function stitchTShape3(
  images: ImageNode[],
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  globalGap: number,
  backgroundColor: string,
) {
  if (images.length < 3)
    return stitchHorizontal(images, ctx, canvas, globalGap, backgroundColor);

  const imgLeft = images[0];
  const imgRight1 = images[1];
  const imgRight2 = images[2];

  const targetHeight = Math.round(imgLeft.height);

  // Right vertical gap
  const vGap = Math.round(globalGap + (imgRight1.localGap || 0));
  // Horizontal gap between left and right
  const hGap = Math.round(globalGap + (imgLeft.localGap || 0));

  // Calculate width of the right column W_right
  const sumRatio =
    imgRight1.height / imgRight1.width + imgRight2.height / imgRight2.width;
  const rightWidth = Math.round((targetHeight - vGap) / sumRatio);

  const hRight1 = Math.round((imgRight1.height / imgRight1.width) * rightWidth);
  // To ensure the total height of the right column strictly equals targetHeight, calculate the height of the last image by difference
  const hRight2 = targetHeight - vGap - hRight1;

  canvas.width = Math.round(imgLeft.width + hGap + rightWidth);
  canvas.height = targetHeight;

  fillBackground(ctx, canvas.width, canvas.height, backgroundColor);

  // Draw left large image - physical pixel alignment
  ctx.drawImage(imgLeft.bitmap!, 0, 0, Math.round(imgLeft.width), targetHeight);

  // Draw right top image
  ctx.drawImage(
    imgRight1.bitmap!,
    Math.round(imgLeft.width + hGap),
    0,
    rightWidth,
    hRight1,
  );

  // Draw right bottom image
  ctx.drawImage(
    imgRight2.bitmap!,
    Math.round(imgLeft.width + hGap),
    hRight1 + vGap,
    rightWidth,
    hRight2,
  );

  return canvas;
}
