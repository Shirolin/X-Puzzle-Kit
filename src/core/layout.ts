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
 * Recommend layout based on image quantity and dimensions
 */
export function recommendLayout(images: ImageSize[]): LayoutType {
  const n = images.length;

  if (n === 4) return "GRID_2x2";

  if (n === 3) {
    const r1 = images[0].width / images[0].height;
    // If the first image is significantly tall, recommend T-Shape layout (Left 1 Right 2)
    if (r1 < 0.9) return "T_SHAPE_3";
    return "HORIZONTAL_Nx1";
  }

  if (n === 2) {
    const r1 = images[0].width / images[0].height;
    const r2 = images[1].width / images[1].height;
    const avgRatio = (r1 + r2) / 2;

    if (avgRatio < 0.8) return "HORIZONTAL_2x1"; // Two narrow images stitched horizontally to form a wide image
    if (avgRatio > 1.2) return "VERTICAL_1x2"; // Two wide images stitched vertically to form a tall image
    return "HORIZONTAL_2x1";
  }

  return "HORIZONTAL_Nx1";
}
