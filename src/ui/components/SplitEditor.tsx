import { useEffect, useRef, useState, useCallback } from "preact/hooks";
import { JSX } from "preact";
import { Image as ImageIcon, Trash2 } from "lucide-preact";

import { SplitConfig, SplitEditState, CellRegion } from "../../core/types";
import {
  calculateCellRegions,
  calculateEffectiveArea,
} from "../../core/splitLayout";
import { t } from "../../core/i18n";
import { SplitCellState } from "../../core/types";

interface SplitEditorProps {
  source: ImageBitmap | null;
  config: SplitConfig;
  editState: SplitEditState;
  onEditStateChange: (state: SplitEditState) => void;
  viewerScale: number;
  backgroundColor: import("../../core/types").BackgroundColor;
}

export function SplitEditor({
  source,
  config,
  editState,
  onEditStateChange,
  viewerScale,
  backgroundColor,
}: SplitEditorProps) {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 计算有效区域
  const effective = source
    ? calculateEffectiveArea(source.width, source.height, config.autoCropRatio)
    : { drawX: 0, drawY: 0, drawW: 0, drawH: 0 };
  const { drawW, drawH } = effective;

  // 将 ImageBitmap 的有效裁切区域转换为可用的图片 URL
  useEffect(() => {
    if (!source) {
      setSourceUrl(null);
      return;
    }

    let active = true;
    let url: string | null = null;

    // 为编辑器生成完整图片的预览 URL，不再进行物理裁切
    const canvas = document.createElement("canvas");
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(source, 0, 0);
    }

    canvas.toBlob((b) => {
      if (active && b) {
        url = URL.createObjectURL(b);
        setSourceUrl(url);
      }
    });

    return () => {
      active = false;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [source]); // 移除冗余的 config.autoCropRatio 依赖，减少由于参数调整导致的 URL 频繁销毁

  const handleUpdateCellState = (
    index: number,
    newState: Partial<SplitCellState>,
  ) => {
    const newCells = [...editState.cells];
    while (newCells.length <= index) {
      newCells.push({
        offsetX: 0,
        offsetY: 0,
        scale: 1,
        replacementSource: null,
        replacementFile: null,
      });
    }
    const oldCell = newCells[index];
    newCells[index] = { ...oldCell, ...newState };

    // 如果处于统一模式且要进行替换，自动转为分别模式并继承现有状态
    if (editState.dragMode === "unified" && newState.replacementSource) {
      const inheritedCells = regions.map((_, i) => ({
        offsetX:
          i === index ? (newState.offsetX ?? 0) : editState.globalOffsetX,
        offsetY:
          i === index ? (newState.offsetY ?? 0) : editState.globalOffsetY,
        scale: i === index ? (newState.scale ?? 1) : editState.globalScale,
        replacementSource:
          i === index ? (newState.replacementSource ?? null) : null,
        replacementFile:
          i === index ? (newState.replacementFile ?? null) : null,
      }));

      onEditStateChange({
        ...editState,
        dragMode: "individual",
        cells: inheritedCells,
        activeCellIndex: index,
      });
    } else {
      onEditStateChange({
        ...editState,
        cells: newCells,
        activeCellIndex: index,
      });
    }
  };
  if (!source || !sourceUrl || drawW === 0 || drawH === 0) return null;

  const regions = calculateCellRegions(config, drawW, drawH);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: `${drawW}px`,
        height: `${drawH}px`,
        borderRadius: `${12 / viewerScale}px`,
        overflow: "hidden",
        boxShadow: `0 ${4 / viewerScale}px ${20 / viewerScale}px rgba(0, 0, 0, 0.1)`,
        backgroundColor:
          config.fillBackground && backgroundColor !== "transparent"
            ? backgroundColor === "white"
              ? "#ffffff"
              : "#000000"
            : "transparent",
      }}
      className=""
    >
      {regions.map((region, idx) => (
        <SplitEditorCell
          key={idx}
          index={idx}
          region={region}
          sourceUrl={sourceUrl}
          sourceWidth={source?.width || 0}
          sourceHeight={source?.height || 0}
          autoCropRatio={config.autoCropRatio}
          editState={editState}
          onEditStateChange={onEditStateChange}
          onUpdateCellState={handleUpdateCellState}
          viewerScale={viewerScale}
          fillBackground={config.fillBackground}
          backgroundColor={backgroundColor}
          gap={config.gap}
          rows={config.rows}
          cols={config.cols}
          drawW={drawW}
          drawH={drawH}
        />
      ))}
    </div>
  );
}

const createDefaultCellState = (): SplitCellState => ({
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  replacementSource: null,
  replacementFile: null,
});

// ===== Cell 组件 =====

interface SplitEditorCellProps {
  index: number;
  region: CellRegion;
  sourceUrl: string;
  sourceWidth: number;
  sourceHeight: number;
  autoCropRatio?: number;
  editState: SplitEditState;
  onEditStateChange: (state: SplitEditState) => void;
  onUpdateCellState: (
    index: number,
    state: Partial<import("../../core/types").SplitCellState>,
  ) => void;
  viewerScale: number;
  fillBackground?: boolean;
  backgroundColor: import("../../core/types").BackgroundColor;
  gap: number;
  rows: number;
  cols: number;
  drawW: number;
  drawH: number;
}

function SplitEditorCell({
  index,
  region,
  sourceUrl,
  sourceWidth,
  sourceHeight,
  autoCropRatio,
  editState,
  onEditStateChange,
  onUpdateCellState,
  viewerScale,
  fillBackground,
  backgroundColor,
  gap,
  rows,
  cols,
  drawW,
  drawH,
}: SplitEditorCellProps) {
  const cellRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: 0, y: 0 });

  // 触摸缩放状态
  const touchStartDist = useRef<number | null>(null);
  const touchStartScale = useRef(1);

  const { dragMode, activeCellIndex } = editState;
  const isActive = activeCellIndex === index;
  const cellState = editState.cells[index];

  // 获取当前 cell 的有效 offset/scale
  const getCellTransform = useCallback(() => {
    const cell = editState.cells[index];
    if (cell?.replacementSource) {
      return {
        offsetX: cell.offsetX,
        offsetY: cell.offsetY,
        scale: cell.scale,
      };
    }

    if (dragMode === "unified") {
      return {
        offsetX: editState.globalOffsetX,
        offsetY: editState.globalOffsetY,
        scale: editState.globalScale,
      };
    }

    return {
      offsetX: cell?.offsetX ?? editState.globalOffsetX,
      offsetY: cell?.offsetY ?? editState.globalOffsetY,
      scale: cell?.scale ?? editState.globalScale,
    };
  }, [editState, index, dragMode]);

  const { offsetX, offsetY, scale } = getCellTransform();

  // 图片源 URL（支持替换图）
  const [replacementUrl, setReplacementUrl] = useState<string | null>(null);
  const [isLoadingReplacement, setIsLoadingReplacement] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const replacementSource = cellState?.replacementSource;
    if (!replacementSource) {
      setReplacementUrl(null);
      setIsLoadingReplacement(false);
      return;
    }

    let active = true;
    let url: string | null = null;
    setIsLoadingReplacement(true);

    const canvas = document.createElement("canvas");
    canvas.width = replacementSource.width;
    canvas.height = replacementSource.height;
    canvas.getContext("2d")?.drawImage(replacementSource, 0, 0);

    canvas.toBlob((b) => {
      if (active && b) {
        url = URL.createObjectURL(b);
        setReplacementUrl(url);
        setIsLoadingReplacement(false);
      }
    });

    return () => {
      active = false;
      if (url) {
        URL.revokeObjectURL(url);
      }
      setIsLoadingReplacement(false);
    };
  }, [cellState?.replacementSource]);

  const handleFileSelect = async (e: JSX.TargetedEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    try {
      const bitmap = await createImageBitmap(file);
      onUpdateCellState(index, {
        replacementSource: bitmap,
        replacementFile: file,
        offsetX: 0,
        offsetY: 0,
        scale: 1,
      });
    } catch (err) {
      console.error("Failed to load replacement image:", err);
    }
  };

  // 拖拽文件处理器
  const handleDragOver = (e: JSX.TargetedDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: JSX.TargetedDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: JSX.TargetedDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith("image/")) {
      try {
        const bitmap = await createImageBitmap(file);
        onUpdateCellState(index, {
          replacementSource: bitmap,
          replacementFile: file,
          offsetX: 0,
          offsetY: 0,
          scale: 1,
        });
      } catch (err) {
        console.error("Failed to drop image:", err);
      }
    }
  };

  // 修复闪烁: 如果当前 cell 有替换源，但 URL 还没生成，强制返回空以阻止它闪烁显示原图
  const imgUrlToUse = cellState?.replacementSource ? replacementUrl : sourceUrl;

  // 计算图片在格子内的 CSS 定位
  // 核心逻辑：在 Unified 模式下，整张图是一个整体。
  // offsetX/offsetY 表示图片左上角在 Split 网格坐标系下的位置。
  const getImageStyle = (): JSX.CSSProperties => {
    const replacementSource = cellState?.replacementSource;
    if (replacementUrl && replacementSource) {
      // 替换图：居中 cover 填满格子
      const imgW = replacementSource.width;
      const imgH = replacementSource.height;
      const coverScale = Math.max(region.width / imgW, region.height / imgH);
      const displayW = imgW * coverScale * scale;
      const displayH = imgH * coverScale * scale;
      // 替换图锚点通常在格子中心
      const left = (region.width - displayW) / 2 + offsetX;
      const top = (region.height - displayH) / 2 + offsetY;

      return {
        position: "absolute",
        left: 0,
        top: 0,
        width: `${displayW}px`,
        height: `${displayH}px`,
        transform: `translate3d(${left}px, ${top}px, 0)`,
        willChange: "transform",
        pointerEvents: "none",
      };
    } else {
      // 原图模式：
      // 图片在格子内的偏移 = 图片全局位置 (offsetX) - 格位位置 (region.x)
      const displayW = sourceWidth * scale;
      const displayH = sourceHeight * scale;
      const left = offsetX - region.x;
      const top = offsetY - region.y;

      return {
        position: "absolute",
        left: 0,
        top: 0,
        width: `${displayW}px`,
        height: `${displayH}px`,
        transform: `translate3d(${left}px, ${top}px, 0)`,
        willChange: "transform",
        pointerEvents: "none",
      };
    }
  };

  // ===== 拖拽处理 =====

  const clampOffset = useCallback(
    (x: number, y: number, currentScale: number) => {
      const minVisible = 40;
      const replacementSource = cellState?.replacementSource;
      if (replacementSource) {
        const imgW = replacementSource.width;
        const imgH = replacementSource.height;
        const coverScale = Math.max(region.width / imgW, region.height / imgH);
        const displayW = imgW * coverScale * currentScale;
        const displayH = imgH * coverScale * currentScale;
        const baseLeft = (region.width - displayW) / 2;
        const baseTop = (region.height - displayH) / 2;

        const minX = -displayW + minVisible - baseLeft;
        const maxX = region.width - minVisible - baseLeft;
        const minY = -displayH + minVisible - baseTop;
        const maxY = region.height - minVisible - baseTop;
        return {
          x: Math.max(minX, Math.min(maxX, x)),
          y: Math.max(minY, Math.min(maxY, y)),
        };
      } else {
        const displayW = sourceWidth * currentScale;
        const displayH = sourceHeight * currentScale;
        const minX = -displayW + minVisible;
        const maxX = drawW - minVisible;
        const minY = -displayH + minVisible;
        const maxY = drawH - minVisible;
        return {
          x: Math.max(minX, Math.min(maxX, x)),
          y: Math.max(minY, Math.min(maxY, y)),
        };
      }
    },
    [
      cellState?.replacementSource,
      region,
      sourceWidth,
      sourceHeight,
      drawW,
      drawH,
    ],
  );

  const updateOffset = useCallback(
    (newOffsetX: number, newOffsetY: number) => {
      const { x: clampedX, y: clampedY } = clampOffset(
        newOffsetX,
        newOffsetY,
        scale,
      );

      if (dragMode === "unified" && !cellState?.replacementSource) {
        onEditStateChange({
          ...editState,
          globalOffsetX: clampedX,
          globalOffsetY: clampedY,
        });
      } else {
        const newCells = [...editState.cells];
        // 确保 cells 数组够长
        while (newCells.length <= index) {
          newCells.push({
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            replacementSource: null,
            replacementFile: null,
          });
        }
        newCells[index] = {
          ...newCells[index],
          offsetX: newOffsetX,
          offsetY: newOffsetY,
        };
        onEditStateChange({ ...editState, cells: newCells });
      }
    },
    [
      editState,
      onEditStateChange,
      index,
      dragMode,
      cellState,
      clampOffset,
      scale,
    ],
  );

  const updateScale = useCallback(
    (newScale: number) => {
      const clampedScale = Math.max(0.2, Math.min(5.0, newScale));
      const { x: clampedX, y: clampedY } = clampOffset(
        offsetX,
        offsetY,
        clampedScale,
      );

      if (dragMode === "unified" && !cellState?.replacementSource) {
        onEditStateChange({
          ...editState,
          globalScale: clampedScale,
          globalOffsetX: clampedX,
          globalOffsetY: clampedY,
        });
      } else {
        const newCells = [...editState.cells];
        while (newCells.length <= index) {
          newCells.push({
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            replacementSource: null,
            replacementFile: null,
          });
        }
        newCells[index] = {
          ...newCells[index],
          scale: clampedScale,
          offsetX: clampedX,
          offsetY: clampedY,
        };
        onEditStateChange({ ...editState, cells: newCells });
      }
    },
    [
      editState,
      onEditStateChange,
      index,
      dragMode,
      cellState,
      clampOffset,
      offsetX,
      offsetY,
    ],
  );

  // 鼠标事件
  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    startOffset.current = { x: offsetX, y: offsetY };

    // 分别模式下设置选中格子
    if (dragMode === "individual") {
      onEditStateChange({ ...editState, activeCellIndex: index });
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      e.stopPropagation();
      const dx = (e.clientX - dragStart.current.x) / viewerScale;
      const dy = (e.clientY - dragStart.current.y) / viewerScale;
      updateOffset(startOffset.current.x + dx, startOffset.current.y + dy);
    },
    [updateOffset, viewerScale],
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();

      const containerRect = cellRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      // 鼠标相对于 Split 网格的坐标
      const mouseGridX =
        (e.clientX - containerRect.left) / viewerScale + region.x;
      const mouseGridY =
        (e.clientY - containerRect.top) / viewerScale + region.y;

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.2, Math.min(5.0, scale * zoomFactor));

      if (dragMode === "unified" && !cellState?.replacementSource) {
        // 以鼠标为锚点计算新的 globalOffsetX/Y
        const pX =
          (mouseGridX - editState.globalOffsetX) / editState.globalScale;
        const pY =
          (mouseGridY - editState.globalOffsetY) / editState.globalScale;

        const rawOffsetX = mouseGridX - pX * newScale;
        const rawOffsetY = mouseGridY - pY * newScale;
        const { x: clampedX, y: clampedY } = clampOffset(
          rawOffsetX,
          rawOffsetY,
          newScale,
        );

        onEditStateChange({
          ...editState,
          globalScale: newScale,
          globalOffsetX: clampedX,
          globalOffsetY: clampedY,
        });
      } else {
        // 分别模式
        const cell = editState.cells[index];
        if (cell?.replacementSource) {
          // 替换图：使用的是居中裁剪放大，原点在网格的自身中心
          const boxCX = region.x + region.width / 2;
          const boxCY = region.y + region.height / 2;
          // 以鼠标为锚点计算该格子替换图特有的 offsetX/Y
          const pX = (mouseGridX - boxCX - offsetX) / scale;
          const pY = (mouseGridY - boxCY - offsetY) / scale;

          const rawOffsetX = mouseGridX - boxCX - pX * newScale;
          const rawOffsetY = mouseGridY - boxCY - pY * newScale;
          const { x: clampedX, y: clampedY } = clampOffset(
            rawOffsetX,
            rawOffsetY,
            newScale,
          );

          const newCells = [...editState.cells];
          while (newCells.length <= index) {
            newCells.push(createDefaultCellState());
          }
          newCells[index] = {
            ...newCells[index],
            scale: newScale,
            offsetX: clampedX,
            offsetY: clampedY,
          };
          onEditStateChange({ ...editState, cells: newCells });
        } else {
          // 原图视角：使用的是全局原图裁剪放大，原点在全局 (0,0)
          // 以鼠标为锚点计算该格子特有的 offsetX/Y
          const pX = (mouseGridX - offsetX) / scale;
          const pY = (mouseGridY - offsetY) / scale;

          const rawOffsetX = mouseGridX - pX * newScale;
          const rawOffsetY = mouseGridY - pY * newScale;
          const { x: clampedX, y: clampedY } = clampOffset(
            rawOffsetX,
            rawOffsetY,
            newScale,
          );

          const newCells = [...editState.cells];
          while (newCells.length <= index) {
            newCells.push(createDefaultCellState());
          }
          newCells[index] = {
            ...newCells[index],
            scale: newScale,
            offsetX: clampedX,
            offsetY: clampedY,
          };
          onEditStateChange({ ...editState, cells: newCells });
        }
      }
    }
  };

  // 触摸事件
  const handleTouchStart = (e: TouchEvent) => {
    e.stopPropagation();

    if (dragMode === "individual") {
      onEditStateChange({ ...editState, activeCellIndex: index });
    }

    if (e.touches.length === 1) {
      isDragging.current = true;
      dragStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      startOffset.current = { x: offsetX, y: offsetY };
      touchStartDist.current = null;
    } else if (e.touches.length === 2) {
      isDragging.current = false;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      touchStartDist.current = dist;
      touchStartScale.current = scale;
    }
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.stopPropagation();
      if (e.touches.length === 1 && isDragging.current) {
        const dx = (e.touches[0].clientX - dragStart.current.x) / viewerScale;
        const dy = (e.touches[0].clientY - dragStart.current.y) / viewerScale;
        updateOffset(startOffset.current.x + dx, startOffset.current.y + dy);
      } else if (e.touches.length === 2 && touchStartDist.current !== null) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        const newScale =
          (dist / touchStartDist.current) * touchStartScale.current;
        updateScale(newScale);
      }
    },
    [updateOffset, updateScale, viewerScale],
  );

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.stopPropagation();
    isDragging.current = false;
    touchStartDist.current = null;
  }, []);

  // 双击重置
  const handleDoubleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { drawX, drawY } = calculateEffectiveArea(
      sourceWidth,
      sourceHeight,
      autoCropRatio,
    );

    if (dragMode === "unified") {
      onEditStateChange({
        ...editState,
        globalOffsetX: -drawX,
        globalOffsetY: -drawY,
        globalScale: 1,
      });
    } else {
      const newCells = [...editState.cells];
      while (newCells.length <= index) {
        newCells.push({
          offsetX: 0,
          offsetY: 0,
          scale: 1,
          replacementSource: null,
          replacementFile: null,
        });
      }
      newCells[index] = {
        ...newCells[index],
        offsetX: -drawX,
        offsetY: -drawY,
        scale: 1,
      };
      onEditStateChange({
        ...editState,
        cells: newCells,
        activeCellIndex: index,
      });
    }
  };

  // 全局鼠标监听（拖拽可能超出 cell 边界）
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // 背景样式
  const getContainerBackground = () => {
    if (!fillBackground) return "transparent";
    if (backgroundColor === "transparent") return "transparent"; // 确保有效的透明值以透射底层
    return backgroundColor === "white" ? "#ffffff" : "#000000";
  };

  // 产品级 UI 逻辑：裁切工具外围保留极小圆角(统一风格)，内部在无间距时保持直角，有间距时给极小圆角以免锋利
  const getAdaptiveBorderRadius = () => {
    const isTopRow = index < cols;
    const isBottomRow = index >= (rows - 1) * cols;
    const isLeftCol = index % cols === 0;
    const isRightCol = index % cols === cols - 1;

    const innerRadius =
      gap === 0 ? "0px" : `${Math.min(4 / viewerScale, gap / 2)}px`;
    const outerRadius = `${12 / viewerScale}px`; // 与外部容器的圆角算法完全保持一致，才能完美闭合

    const tl = isTopRow && isLeftCol ? outerRadius : innerRadius;
    const tr = isTopRow && isRightCol ? outerRadius : innerRadius;
    const br = isBottomRow && isRightCol ? outerRadius : innerRadius;
    const bl = isBottomRow && isLeftCol ? outerRadius : innerRadius;

    return `${tl} ${tr} ${br} ${bl}`;
  };

  // 专家级 UI 逻辑：绝对网格线与无损高亮
  // 1. 对于间距为 0 的情况，我们避免使用 border 而使用纯粹的 right/bottom 绘制，防止相邻格子线条相加变粗。
  // 2. 对于活跃状态，我们直接绘制内框/外框混合的高亮线。
  const getSmartBorder = (): JSX.CSSProperties => {
    const activeColor = "var(--color-primary)";
    const inactiveColor = "rgba(255, 255, 255, 0.4)";
    const uiScale = 1 / viewerScale;
    const strokeWidth = Math.max(1, uiScale);
    const activeStroke = Math.max(2, uiScale * 2);

    if (isActive) {
      return {
        // 直接使用最基础的 border，并配合外层 overlay div 和它的 border-radius
        border: `${activeStroke}px solid ${activeColor}`,
        boxShadow: `0 0 0 ${4 * strokeWidth}px rgba(0, 122, 255, 0.25)`,
        zIndex: 20,
      };
    }

    if (gap > 0) {
      return { border: `${strokeWidth}px solid rgba(255,255,255,0.2)` };
    }

    return {
      borderRight: `${strokeWidth}px solid ${inactiveColor}`,
      borderBottom: `${strokeWidth}px solid ${inactiveColor}`,
      borderLeft: "none",
      borderTop: "none",
    };
  };

  return (
    <div
      ref={cellRef}
      className={`split-editor-cell ${isActive ? "split-editor-cell--active" : ""}`}
      style={{
        position: "absolute",
        left: `${region.x}px`,
        top: `${region.y}px`,
        width: `${region.width}px`,
        height: `${region.height}px`,
        overflow: "hidden",
        backgroundColor: getContainerBackground(),
        borderRadius: getAdaptiveBorderRadius(),
        boxSizing: "border-box",
        zIndex: isActive ? 10 : 1, // 确保激活格位在顶层，但内部边框逻辑另算
        transition:
          "background-color 0.2s, border-radius 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDblClick={handleDoubleClick}
    >
      <img
        src={imgUrlToUse || undefined}
        alt={`Cell ${index + 1}`}
        draggable={false}
        style={getImageStyle()}
      />

      {isLoadingReplacement && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.2)",
            zIndex: 5,
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              border: "3px solid rgba(255,255,255,0.3)",
              borderTopColor: "#fff",
              borderRadius: "50%",
              animation: "spin-loader 1s linear infinite",
            }}
          />
          <style>
            {"@keyframes spin-loader { to { transform: rotate(360deg); } }"}
          </style>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          ...getSmartBorder(),
          borderRadius: getAdaptiveBorderRadius(),
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxSizing: "border-box", // 确保 border 向里生长
        }}
      />

      {/* 悬浮操作层 */}
      {isHovered && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "8px",
              transform: `scale(${1 / viewerScale})`,
              transformOrigin: "center",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              style={{
                background: "white",
                color: "black",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
              title={t("splitReplaceImage")}
            >
              <ImageIcon size={16} />
            </button>

            {cellState?.replacementSource && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateCellState(index, {
                    replacementSource: null,
                    replacementFile: null,
                    offsetX: 0,
                    offsetY: 0,
                    scale: 1,
                  });
                }}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
                title={t("splitRestoreImage")}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleFileSelect}
          />
        </div>
      )}

      {/* 序号角标：不透明度下降，更安静地待在角落 */}
      <div
        className="split-editor-cell__badge"
        style={{
          position: "absolute",
          top: `${6 / viewerScale}px`,
          left: `${6 / viewerScale}px`,
          background: isActive ? "var(--color-primary)" : "rgba(0,0,0,0.6)",
          color: "white",
          fontSize: `${10 / viewerScale}px`,
          fontWeight: 700,
          width: `${18 / viewerScale}px`,
          height: `${18 / viewerScale}px`,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          transition: "background 0.2s",
          zIndex: 11,
          backdropFilter: "blur(4px)",
        }}
      >
        {index + 1}
      </div>

      {/* 分辨率信息 */}
      <div
        style={{
          position: "absolute",
          bottom: `${4 / viewerScale}px`,
          left: "50%",
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "white",
          fontSize: `${10 / viewerScale}px`,
          padding: `${2 / viewerScale}px ${6 / viewerScale}px`,
          borderRadius: `${10 / viewerScale}px`,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 11,
          backdropFilter: "blur(4px)",
          transform: `translateX(-50%)`,
        }}
      >
        {region.width} × {region.height}
      </div>
    </div>
  );
}
