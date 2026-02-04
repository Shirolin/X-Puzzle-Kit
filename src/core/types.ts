export interface ImageNode {
  id: string;
  originalUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  blob?: Blob;
  bitmap?: ImageBitmap | HTMLImageElement;
  visible?: boolean;
  localGap?: number; // Gap after a single image
  name?: string; // Image name (optional)
  originalIndex?: number; // Initial index identifier
  source?: {
    tweetId: string;
    artistHandle: string;
  };
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
  globalGap: number; // Global base gap
}

export interface SplitConfig {
  layout: LayoutType;
  rows: number; // For Custom Grid
  cols: number; // For Custom Grid
  gap: number;
  format?: "png" | "jpg" | "webp";
  autoCropRatio?: number; // Ideal composite ratio (W/H) for the whole grid
}
