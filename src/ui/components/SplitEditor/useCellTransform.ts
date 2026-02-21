import { useCallback } from "preact/hooks";
import { JSX } from "preact";
import { SplitEditState, CellRegion } from "../../../core/types";

interface UseCellTransformProps {
  index: number;
  region: CellRegion;
  editState: SplitEditState;
  sourceWidth: number;
  sourceHeight: number;
  drawW: number;
  drawH: number;
}

export function useCellTransform({
  index,
  region,
  editState,
  sourceWidth,
  sourceHeight,
  drawW,
  drawH,
}: UseCellTransformProps) {
  const { dragMode } = editState;
  const cellState = editState.cells[index];

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

  const getImageStyle = (replacementUrl: string | null): JSX.CSSProperties => {
    const replacementSource = cellState?.replacementSource;
    if (replacementUrl && replacementSource) {
      const imgW = replacementSource.width;
      const imgH = replacementSource.height;
      const coverScale = Math.max(region.width / imgW, region.height / imgH);
      const displayW = imgW * coverScale * scale;
      const displayH = imgH * coverScale * scale;

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

  return {
    offsetX,
    offsetY,
    scale,
    clampOffset,
    getImageStyle,
  };
}
