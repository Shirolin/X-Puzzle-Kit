import { useRef, useCallback, useEffect } from "preact/hooks";
import { SplitEditState, CellRegion } from "../../../core/types";

interface UseCellInteractionProps {
  index: number;
  region: CellRegion;
  editState: SplitEditState;
  onEditStateChange: (
    state: SplitEditState | ((prev: SplitEditState) => SplitEditState),
  ) => void;
  viewerScale: number;
  drawW: number;
  drawH: number;
  clampOffset: (
    x: number,
    y: number,
    currentScale: number,
  ) => { x: number; y: number };
  offsetX: number;
  offsetY: number;
  scale: number;
}

export function useCellInteraction({
  index,
  region,
  editState,
  onEditStateChange,
  viewerScale,
  clampOffset,
  offsetX,
  offsetY,
  scale,
}: UseCellInteractionProps) {
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: 0, y: 0 });

  const touchStartDist = useRef<number | null>(null);
  const touchStartScale = useRef(1);

  const { dragMode } = editState;
  const cellState = editState.cells[index];

  const updateOffset = useCallback(
    (newOffsetX: number, newOffsetY: number) => {
      const { x: clampedX, y: clampedY } = clampOffset(
        newOffsetX,
        newOffsetY,
        scale,
      );

      if (dragMode === "unified" && !cellState?.replacementSource) {
        onEditStateChange((prev) => ({
          ...prev,
          globalOffsetX: clampedX,
          globalOffsetY: clampedY,
        }));
      } else {
        onEditStateChange((prev) => {
          const newCells = [...prev.cells];
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
          return { ...prev, cells: newCells };
        });
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
        onEditStateChange((prev) => ({
          ...prev,
          globalScale: clampedScale,
          globalOffsetX: clampedX,
          globalOffsetY: clampedY,
        }));
      } else {
        onEditStateChange((prev) => {
          const newCells = [...prev.cells];
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
          return { ...prev, cells: newCells };
        });
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

  // 保持事件引用稳定，避免提升错误和闭包陷阱
  const handleMouseMoveRef = useRef<(e: MouseEvent) => void>();
  const handleMouseUpRef = useRef<() => void>();

  handleMouseMoveRef.current = (e: MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    e.stopPropagation();
    const dx = (e.clientX - dragStart.current.x) / viewerScale;
    const dy = (e.clientY - dragStart.current.y) / viewerScale;
    updateOffset(startOffset.current.x + dx, startOffset.current.y + dy);
  };

  handleMouseUpRef.current = () => {
    isDragging.current = false;
    if (handleMouseMoveRef.current && handleMouseUpRef.current) {
      window.removeEventListener("mousemove", handleMouseMoveRef.current);
      window.removeEventListener("mouseup", handleMouseUpRef.current);
    }
  };

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      startOffset.current = { x: offsetX, y: offsetY };

      if (dragMode === "individual") {
        onEditStateChange((prev) => ({ ...prev, activeCellIndex: index }));
      }

      if (handleMouseMoveRef.current && handleMouseUpRef.current) {
        window.addEventListener("mousemove", handleMouseMoveRef.current);
        window.addEventListener("mouseup", handleMouseUpRef.current);
      }
    },
    [dragMode, editState, index, offsetX, offsetY, onEditStateChange],
  );

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMouseMoveRef.current?.(e);
  }, []);

  const handleMouseUp = useCallback(() => {
    handleMouseUpRef.current?.();
  }, []);

  // 兜底清理副作用
  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleWheel = useCallback(
    (e: WheelEvent, containerRect: DOMRect | undefined) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();

        if (!containerRect) return;

        const mouseGridX =
          (e.clientX - containerRect.left) / viewerScale + region.x;
        const mouseGridY =
          (e.clientY - containerRect.top) / viewerScale + region.y;

        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.2, Math.min(5.0, scale * zoomFactor));

        if (dragMode === "unified" && !cellState?.replacementSource) {
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

          onEditStateChange((prev) => ({
            ...prev,
            globalScale: newScale,
            globalOffsetX: clampedX,
            globalOffsetY: clampedY,
          }));
        } else {
          const cell = editState.cells[index];
          if (cell?.replacementSource) {
            const boxCX = region.x + region.width / 2;
            const boxCY = region.y + region.height / 2;
            const pX = (mouseGridX - boxCX - offsetX) / scale;
            const pY = (mouseGridY - boxCY - offsetY) / scale;

            const rawOffsetX = mouseGridX - boxCX - pX * newScale;
            const rawOffsetY = mouseGridY - boxCY - pY * newScale;
            const { x: clampedX, y: clampedY } = clampOffset(
              rawOffsetX,
              rawOffsetY,
              newScale,
            );

            onEditStateChange((prev) => {
              const newCells = [...prev.cells];
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
                scale: newScale,
                offsetX: clampedX,
                offsetY: clampedY,
              };
              return { ...prev, cells: newCells };
            });
          } else {
            const pX = (mouseGridX - offsetX) / scale;
            const pY = (mouseGridY - offsetY) / scale;

            const rawOffsetX = mouseGridX - pX * newScale;
            const rawOffsetY = mouseGridY - pY * newScale;
            const { x: clampedX, y: clampedY } = clampOffset(
              rawOffsetX,
              rawOffsetY,
              newScale,
            );

            onEditStateChange((prev) => {
              const newCells = [...prev.cells];
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
                scale: newScale,
                offsetX: clampedX,
                offsetY: clampedY,
              };
              return { ...prev, cells: newCells };
            });
          }
        }
      }
    },
    [
      clampOffset,
      dragMode,
      editState,
      index,
      offsetX,
      offsetY,
      onEditStateChange,
      region.height,
      region.width,
      region.x,
      region.y,
      scale,
      viewerScale,
      cellState?.replacementSource,
    ],
  );

  const handleTouchMoveRef = useRef<(e: TouchEvent) => void>();
  const handleTouchEndRef = useRef<(e: TouchEvent) => void>();

  handleTouchMoveRef.current = (e: TouchEvent) => {
    if (e.touches.length === 1 && isDragging.current) {
      e.preventDefault();
      e.stopPropagation();
      const dx = (e.touches[0].clientX - dragStart.current.x) / viewerScale;
      const dy = (e.touches[0].clientY - dragStart.current.y) / viewerScale;
      updateOffset(startOffset.current.x + dx, startOffset.current.y + dy);
    } else if (e.touches.length === 2 && touchStartDist.current !== null) {
      e.preventDefault();
      e.stopPropagation();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const newScale =
        (dist / touchStartDist.current) * touchStartScale.current;
      updateScale(newScale);
    }
  };

  handleTouchEndRef.current = (e: TouchEvent) => {
    e.stopPropagation();
    isDragging.current = false;
    touchStartDist.current = null;
    if (handleTouchMoveRef.current && handleTouchEndRef.current) {
      window.removeEventListener("touchmove", handleTouchMoveRef.current);
      window.removeEventListener("touchend", handleTouchEndRef.current);
    }
  };

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      e.stopPropagation();

      if (dragMode === "individual") {
        onEditStateChange((prev) => ({ ...prev, activeCellIndex: index }));
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

      if (handleTouchMoveRef.current && handleTouchEndRef.current) {
        window.addEventListener("touchmove", handleTouchMoveRef.current, {
          passive: false,
        });
        window.addEventListener("touchend", handleTouchEndRef.current);
      }
    },
    [dragMode, editState, index, offsetX, offsetY, onEditStateChange, scale],
  );

  const handleTouchMove = useCallback((e: TouchEvent) => {
    handleTouchMoveRef.current?.(e);
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    handleTouchEndRef.current?.(e);
  }, []);

  // 清理
  useEffect(() => {
    return () => {
      if (handleTouchMoveRef.current && handleTouchEndRef.current) {
        window.removeEventListener("touchmove", handleTouchMoveRef.current);
        window.removeEventListener("touchend", handleTouchEndRef.current);
      }
    };
  }, []);

  return {
    handleMouseDown,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
