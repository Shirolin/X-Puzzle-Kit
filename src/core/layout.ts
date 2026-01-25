export type LayoutType =
  | "GRID_2x2"
  | "VERTICAL_1xN"
  | "HORIZONTAL_Nx1"
  | "VERTICAL_1x2"
  | "HORIZONTAL_2x1"
  | "T_SHAPE_3";

export interface ImageSize {
  width: number;
  height: number;
}

/**
 * 根据图片数量和尺寸推荐布局
 */
export function recommendLayout(images: ImageSize[]): LayoutType {
  const n = images.length;

  if (n === 4) return "GRID_2x2";

  if (n === 3) {
    const r1 = images[0].width / images[0].height;
    // 如果第一张图是显著的竖图，推荐 T 型布局 (左一右二)
    if (r1 < 0.9) return "T_SHAPE_3";
    return "HORIZONTAL_Nx1";
  }

  if (n === 2) {
    const r1 = images[0].width / images[0].height;
    const r2 = images[1].width / images[1].height;
    const avgRatio = (r1 + r2) / 2;

    if (avgRatio < 0.8) return "HORIZONTAL_2x1"; // 两个窄图横着拼成一个宽图
    if (avgRatio > 1.2) return "VERTICAL_1x2"; // 两个宽图竖着拼成一个长图
    return "HORIZONTAL_2x1";
  }

  return "HORIZONTAL_Nx1";
}
