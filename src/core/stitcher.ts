import { ImageNode, LayoutType } from "./types";

/**
 * 将多张图片按照指定布局拼接并返回 Canvas
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

  // 深度对齐：禁用图像平滑以防止次像素插值产生透明缝隙
  ctx.imageSmoothingEnabled = false;

  // 确保所有图片都已加载 bitmap
  for (const img of images) {
    if (!img.bitmap) throw new Error(`Image ${img.id} not loaded`);
  }

  // 过滤不可见图片（已经在 App.tsx 处理，但核心函数保持稳健）
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
 * 填充背景
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

    // 间距计算：全局间距 + 该图特有的局部间距（最后一张图不加间距）
    const gap =
      idx === images.length - 1
        ? 0
        : Math.round(globalGap + (img.localGap || 0));

    // 强制使用取整后的分量进行累加，确保 x 始终为整数且无间隙
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

    // 物理像素累加
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
  // 为了确保 Row 2 总宽度严格等于 row1Width，最后一张图片宽度采用差值计算，杜绝 1px 缝隙
  const w2_3Prime = row1Width - gap2 - w2_2Prime;

  // Row 之间的垂直间距
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

  // 右侧垂直间距
  const vGap = Math.round(globalGap + (imgRight1.localGap || 0));
  // 左右水平间距
  const hGap = Math.round(globalGap + (imgLeft.localGap || 0));

  // 计算右侧列的宽度 W_right
  const sumRatio =
    imgRight1.height / imgRight1.width + imgRight2.height / imgRight2.width;
  const rightWidth = Math.round((targetHeight - vGap) / sumRatio);

  const hRight1 = Math.round((imgRight1.height / imgRight1.width) * rightWidth);
  // 为了确保右侧列总高度严格等于 targetHeight，最后一个图片高度采用差值计算
  const hRight2 = targetHeight - vGap - hRight1;

  canvas.width = Math.round(imgLeft.width + hGap + rightWidth);
  canvas.height = targetHeight;

  fillBackground(ctx, canvas.width, canvas.height, backgroundColor);

  // 绘制左侧大图 - 物理像素对齐
  ctx.drawImage(imgLeft.bitmap!, 0, 0, Math.round(imgLeft.width), targetHeight);

  // 绘制右侧上图
  ctx.drawImage(
    imgRight1.bitmap!,
    Math.round(imgLeft.width + hGap),
    0,
    rightWidth,
    hRight1,
  );

  // 绘制右侧下图
  ctx.drawImage(
    imgRight2.bitmap!,
    Math.round(imgLeft.width + hGap),
    hRight1 + vGap,
    rightWidth,
    hRight2,
  );

  return canvas;
}
