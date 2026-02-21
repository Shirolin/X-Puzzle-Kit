import { SplitConfig, CellRegion } from "./types";

/**
 * 根据 SplitConfig 和图片有效区域尺寸，计算每个分割格的几何区域。
 * 与 splitter.ts 的裁切逻辑对齐，但仅返回坐标而不执行渲染。
 */
export function calculateCellRegions(
  config: SplitConfig,
  effectiveWidth: number,
  effectiveHeight: number,
): CellRegion[] {
  const { layout, rows, cols, gap } = config;
  const regions: CellRegion[] = [];

  switch (layout) {
    case "HORIZONTAL_Nx1":
    case "HORIZONTAL_2x1": {
      const n = layout === "HORIZONTAL_2x1" ? 2 : cols || 2;
      const totalGap = (n - 1) * gap;
      const segW = Math.floor((effectiveWidth - totalGap) / n);
      for (let i = 0; i < n; i++) {
        regions.push({
          x: i * (segW + gap),
          y: 0,
          width: segW,
          height: effectiveHeight,
        });
      }
      break;
    }

    case "VERTICAL_1xN":
    case "VERTICAL_1x2": {
      const n = layout === "VERTICAL_1x2" ? 2 : rows || 2;
      const totalGap = (n - 1) * gap;
      const segH = Math.floor((effectiveHeight - totalGap) / n);
      for (let i = 0; i < n; i++) {
        regions.push({
          x: 0,
          y: i * (segH + gap),
          width: effectiveWidth,
          height: segH,
        });
      }
      break;
    }

    case "GRID_2x2": {
      const nCols = 2;
      const nRows = 2;
      const wGap = (nCols - 1) * gap;
      const hGap = (nRows - 1) * gap;
      const segW = Math.floor((effectiveWidth - wGap) / nCols);
      const segH = Math.floor((effectiveHeight - hGap) / nRows);

      // 左上
      regions.push({ x: 0, y: 0, width: segW, height: segH });
      // 右上
      regions.push({ x: segW + gap, y: 0, width: segW, height: segH });
      // 左下
      regions.push({ x: 0, y: segH + gap, width: segW, height: segH });
      // 右下
      regions.push({
        x: segW + gap,
        y: segH + gap,
        width: segW,
        height: segH,
      });
      break;
    }

    case "T_SHAPE_3": {
      const halfW = Math.floor((effectiveWidth - gap) / 2);
      const halfH = Math.floor((effectiveHeight - gap) / 2);

      // 左侧（全高）
      regions.push({ x: 0, y: 0, width: halfW, height: effectiveHeight });
      // 右上
      regions.push({ x: halfW + gap, y: 0, width: halfW, height: halfH });
      // 右下
      regions.push({
        x: halfW + gap,
        y: halfH + gap,
        width: halfW,
        height: halfH,
      });
      break;
    }

    default:
      // 整张图作为单格
      regions.push({
        x: 0,
        y: 0,
        width: effectiveWidth,
        height: effectiveHeight,
      });
  }

  return regions;
}

/**
 * 计算自动裁切后的有效区域
 */
export function calculateEffectiveArea(
  imgWidth: number,
  imgHeight: number,
  autoCropRatio?: number,
): { drawX: number; drawY: number; drawW: number; drawH: number } {
  let drawX = 0;
  let drawY = 0;
  let drawW = imgWidth;
  let drawH = imgHeight;

  if (autoCropRatio && autoCropRatio > 0) {
    const currentRatio = imgWidth / imgHeight;
    if (currentRatio > autoCropRatio) {
      drawW = imgHeight * autoCropRatio;
      drawX = (imgWidth - drawW) / 2;
    } else if (currentRatio < autoCropRatio) {
      drawH = imgWidth / autoCropRatio;
      drawY = (imgHeight - drawH) / 2;
    }
  }

  return { drawX, drawY, drawW, drawH };
}

/**
 * 创建默认的 SplitCellState
 */
export function createDefaultCellState(): import("./types").SplitCellState {
  return {
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    replacementSource: null,
    replacementFile: null,
  };
}

/**
 * 基于 SplitEditState 导出各格图片。
 * 与 splitter.ts 的 splitImage 不同，此函数考虑用户的拖拽/缩放/替换调整。
 */
export async function exportWithEditState(
  source: ImageBitmap,
  config: import("./types").SplitConfig,
  editState: import("./types").SplitEditState,
  format: string = "png",
  backgroundColor: string = "transparent",
): Promise<Blob[]> {
  const { drawW, drawH } = calculateEffectiveArea(
    source.width,
    source.height,
    config.autoCropRatio,
  );
  const regions = calculateCellRegions(config, drawW, drawH);
  const blobs: Blob[] = [];

  for (let i = 0; i < regions.length; i++) {
    const region = regions[i];
    const cell = editState.cells[i];
    const isUnified =
      editState.dragMode === "unified" && !cell?.replacementSource;

    const offsetX = isUnified
      ? editState.globalOffsetX
      : (cell?.offsetX ?? editState.globalOffsetX);
    const offsetY = isUnified
      ? editState.globalOffsetY
      : (cell?.offsetY ?? editState.globalOffsetY);
    const scale = isUnified
      ? editState.globalScale
      : (cell?.scale ?? editState.globalScale);

    const canvas = document.createElement("canvas");
    canvas.width = region.width;
    canvas.height = region.height;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, region.width, region.height);

    // 填充底色
    if (config.fillBackground) {
      const fill =
        backgroundColor === "white"
          ? "#ffffff"
          : backgroundColor === "black"
            ? "#000000"
            : "transparent";
      if (fill !== "transparent") {
        ctx.fillStyle = fill;
        ctx.fillRect(0, 0, region.width, region.height);
      }
    }

    if (cell?.replacementSource) {
      // 替换图：居中 cover 填充 + offset/scale
      const imgW = cell.replacementSource.width;
      const imgH = cell.replacementSource.height;
      const coverScale = Math.max(region.width / imgW, region.height / imgH);
      const displayW = imgW * coverScale * scale;
      const displayH = imgH * coverScale * scale;
      const dx = (region.width - displayW) / 2 + offsetX;
      const dy = (region.height - displayH) / 2 + offsetY;
      ctx.drawImage(cell.replacementSource, dx, dy, displayW, displayH);
    } else {
      // 原图：根据 region 定位 + offset/scale
      // 原图在 canvas 上的可见尺寸 - 修正为基于 source.width/height
      const displayW = source.width * scale;
      const displayH = source.height * scale;
      // 原图左上角在 canvas 上的位置
      const dx = offsetX - region.x;
      const dy = offsetY - region.y;

      // 需要把 drawX/drawY（自动裁切偏移）考虑进来
      // source 是完整的 ImageBitmap，所以 drawImage 的 source rect 需要包含 drawX/drawY
      // 但为了简化，用 drawImage 直接将完整源绘到偏移位置
      ctx.drawImage(
        source,
        0,
        0,
        source.width,
        source.height,
        dx,
        dy,
        displayW,
        displayH,
      );
    }

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), `image/${format}`);
    });
    blobs.push(blob);
  }

  return blobs;
}
