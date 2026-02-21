import { useEffect, useRef, useState } from "preact/hooks";
import { JSX } from "preact";
import { memo } from "preact/compat";

import { SplitConfig, SplitEditState, CellRegion } from "../../core/types";
import {
  calculateCellRegions,
  calculateEffectiveArea,
} from "../../core/splitLayout";
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

import { useCellTransform } from "./SplitEditor/useCellTransform";
import { useCellInteraction } from "./SplitEditor/useCellInteraction";
import { CellActionToolbar } from "./SplitEditor/CellActionToolbar";
import {
  getAdaptiveBorderRadius,
  getSmartBorder,
  getContainerBackground,
} from "./SplitEditor/uiUtils";

const SplitEditorCell = memo(
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
    const cellState = editState.cells[index];
    const { activeCellIndex } = editState;
    const isActive = activeCellIndex === index;

    const [replacementUrl, setReplacementUrl] = useState<string | null>(null);
    const [isLoadingReplacement, setIsLoadingReplacement] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. 变换相关 Hook
    const { offsetX, offsetY, scale, clampOffset, getImageStyle } =
      useCellTransform({
        index,
        region,
        editState,
        sourceWidth,
        sourceHeight,
        drawW,
        drawH,
      });

    // 2. 交互相关 Hook
    const {
      handleMouseDown,
      handleWheel,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    } = useCellInteraction({
      index,
      region,
      editState,
      onEditStateChange,
      viewerScale,
      drawW,
      drawH,
      clampOffset,
      offsetX,
      offsetY,
      scale,
    });

    // --- 优化后的替换图片 URL 生成逻辑 ---
    useEffect(() => {
      const file = cellState?.replacementFile;
      if (!file) {
        setReplacementUrl(null);
        setIsLoadingReplacement(false);
        return;
      }

      setIsLoadingReplacement(true);
      const url = URL.createObjectURL(file);
      setReplacementUrl(url);
      setIsLoadingReplacement(false);

      return () => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      };
    }, [cellState?.replacementFile]);

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

    // 双击重置
    const handleDoubleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const { drawX, drawY } = calculateEffectiveArea(
        sourceWidth,
        sourceHeight,
        autoCropRatio,
      );

      if (editState.dragMode === "unified") {
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

    const imgUrlToUse = cellState?.replacementSource
      ? replacementUrl
      : sourceUrl;
    const adaptiveRadius = getAdaptiveBorderRadius(
      index,
      cols,
      rows,
      gap,
      viewerScale,
    );

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
          backgroundColor: getContainerBackground(
            fillBackground,
            backgroundColor,
          ),
          borderRadius: adaptiveRadius,
          boxSizing: "border-box",
          zIndex: isActive ? 10 : 1,
          transition:
            "background-color 0.2s, border-radius 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseDown={handleMouseDown}
        onWheel={(e) =>
          handleWheel(e, cellRef.current?.getBoundingClientRect())
        }
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDblClick={handleDoubleClick}
      >
        <img
          src={imgUrlToUse || undefined}
          alt={`Cell ${index + 1}`}
          draggable={false}
          style={getImageStyle(replacementUrl)}
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
          </div>
        )}

        {/* 智能边框 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            ...getSmartBorder(isActive, gap, viewerScale),
            borderRadius: adaptiveRadius,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxSizing: "border-box",
          }}
        />

        {/* 悬浮操作层 */}
        {isHovered && (
          <CellActionToolbar
            hasReplacement={!!cellState?.replacementSource}
            viewerScale={viewerScale}
            onReplaceClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            onRestoreClick={(e) => {
              e.stopPropagation();
              onUpdateCellState(index, {
                replacementSource: null,
                replacementFile: null,
                offsetX: 0,
                offsetY: 0,
                scale: 1,
              });
            }}
          />
        )}

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleFileSelect}
        />

        {/* 序号标角 */}
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
  },
  (prev, next) => {
    // 仅当涉及自身状态、全局影响参数以及其所在 index 变化时渲染，掐断对同一片 editState 的全集响应
    if (prev.index !== next.index) return false;
    if (prev.viewerScale !== next.viewerScale) return false;
    if (
      prev.drawW !== next.drawW ||
      prev.drawH !== next.drawH ||
      prev.sourceWidth !== next.sourceWidth ||
      prev.sourceHeight !== next.sourceHeight
    )
      return false;
    if (prev.backgroundColor !== next.backgroundColor) return false;
    if (prev.gap !== next.gap) return false;

    // 判断影响它的 EditState 部分
    const prevCell = prev.editState.cells[prev.index];
    const nextCell = next.editState.cells[next.index];

    if (prevCell !== nextCell) return false;
    if (prev.editState.dragMode !== next.editState.dragMode) return false;
    if (
      prev.editState.dragMode === "unified" &&
      (prev.editState.globalOffsetX !== next.editState.globalOffsetX ||
        prev.editState.globalOffsetY !== next.editState.globalOffsetY ||
        prev.editState.globalScale !== next.editState.globalScale)
    )
      return false;

    if (
      (prev.editState.activeCellIndex === prev.index) !==
      (next.editState.activeCellIndex === next.index)
    ) {
      return false;
    }

    return true;
  },
);

export default SplitEditor;
