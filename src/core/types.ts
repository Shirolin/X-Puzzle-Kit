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
  fillBackground?: boolean;
  autoCropRatio?: number; // Ideal composite ratio (W/H) for the whole grid
}

/** 每个分割格的独立编辑状态 */
export interface SplitCellState {
  /** 图片在分割格内的偏移量（相对于默认位置，单位：像素） */
  offsetX: number;
  offsetY: number;
  /** 图片在分割格内的缩放比例（1.0 = 默认填满） */
  scale: number;
  /** 替换图片源（null = 使用原图） */
  replacementSource: ImageBitmap | null;
  /** 替换图片的原始 File 引用 */
  replacementFile: File | null;
}

/** 拖动模式 */
export type SplitDragMode = "unified" | "individual";

/** 整体拆图编辑状态 */
export interface SplitEditState {
  dragMode: SplitDragMode;
  /** unified 模式的全局偏移/缩放 */
  globalOffsetX: number;
  globalOffsetY: number;
  globalScale: number;
  /** individual 模式下每个 cell 的独立状态 */
  cells: SplitCellState[];
  /** 当前选中的格子索引（Individual 模式） */
  activeCellIndex: number | null;
}

/** 分割格的几何区域（相对于有效裁切区域） */
export interface CellRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}
