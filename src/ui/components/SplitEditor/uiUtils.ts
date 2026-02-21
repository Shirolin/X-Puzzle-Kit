export function getAdaptiveBorderRadius(
  index: number,
  cols: number,
  rows: number,
  gap: number,
  viewerScale: number,
) {
  const isTopRow = index < cols;
  const isBottomRow = index >= (rows - 1) * cols;
  const isLeftCol = index % cols === 0;
  const isRightCol = index % cols === cols - 1;

  const innerRadius =
    gap === 0 ? "0px" : `${Math.min(4 / viewerScale, gap / 2)}px`;
  const outerRadius = `${12 / viewerScale}px`; // 与外部容器一致

  const tl = isTopRow && isLeftCol ? outerRadius : innerRadius;
  const tr = isTopRow && isRightCol ? outerRadius : innerRadius;
  const br = isBottomRow && isRightCol ? outerRadius : innerRadius;
  const bl = isBottomRow && isLeftCol ? outerRadius : innerRadius;

  return `${tl} ${tr} ${br} ${bl}`;
}

export function getSmartBorder(
  isActive: boolean,
  gap: number,
  viewerScale: number,
) {
  const activeColor = "var(--color-primary)";
  const inactiveColor = "rgba(255, 255, 255, 0.4)";
  const uiScale = 1 / viewerScale;
  const strokeWidth = Math.max(1, uiScale);
  const activeStroke = Math.max(2, uiScale * 2);

  if (isActive) {
    return {
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
}

export function getContainerBackground(
  fillBackground: boolean | undefined,
  backgroundColor: string,
) {
  if (!fillBackground) return "transparent";
  if (backgroundColor === "transparent") return "transparent";
  return backgroundColor === "white" ? "#ffffff" : "#000000";
}
