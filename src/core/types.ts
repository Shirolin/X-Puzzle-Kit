export interface ImageNode {
  id: string;
  originalUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  blob?: Blob;
  bitmap?: ImageBitmap | HTMLImageElement;
  visible?: boolean;
  localGap?: number; // 单图后方的间距
  name?: string; // 图片名称（可选）
}

export type BackgroundColor = "transparent" | "white" | "black";

export type LayoutType =
  | "GRID_2x2"
  | "VERTICAL_1xN"
  | "HORIZONTAL_Nx1"
  | "VERTICAL_1x2"
  | "HORIZONTAL_2x1"
  | "T_SHAPE_3";

export interface StitchLayout {
  type: LayoutType;
  rows: number;
  cols: number;
}

export interface StitchTask {
  taskId: string;
  tweetId: string;
  artistHandle: string;
  pageTitle: string;
  userImages: ImageNode[];
  layout: LayoutType;
  outputFormat: "png" | "jpg" | "webp";
  backgroundColor: BackgroundColor;
  globalGap: number; // 全局基础间距
}
