import { useEffect, useState } from "preact/hooks";
import { LayoutType, SplitConfig, SplitEditState } from "../../core/types";
import { LayoutButton, IconButton } from "./Common";
import {
  LayoutGrid,
  Layout,
  Rows,
  Columns,
  Plus,
  Minus,
  RotateCcw,
  BookOpen,
  Move,
  Hand,
} from "lucide-preact";
import { t } from "../../core/i18n";
import { SidebarSection, Divider, JogWheel } from "./Sidebar";

import { APP_CONFIG } from "../../core/config";
import { platformStorage } from "@/core/platform";
import {
  calculateCellRegions,
  calculateEffectiveArea,
} from "../../core/splitLayout";

interface SplitterControlProps {
  onConfigChange: (config: SplitConfig) => void;
  isProcessing: boolean;
  exportFormat: "png" | "jpg" | "webp";
  onExportFormatChange: (fmt: "png" | "jpg" | "webp") => void;
  isZip: boolean;
  onIsZipChange: (val: boolean) => void;
  isTwitterOptimized: boolean;
  onIsTwitterOptimizedChange: (val: boolean) => void;
  config: SplitConfig;
  disabled?: boolean;
  onShowGuide?: () => void;
  isIOS: boolean;
  webpWarningDismissed: boolean;
  setWebpWarningDismissed: (v: boolean) => void;
  onShowWebpWarning?: (onConfirm: () => void) => void;
  splitEditState: SplitEditState;
  onSplitEditStateChange: (
    state: SplitEditState | ((prev: SplitEditState) => SplitEditState),
  ) => void;
  hasSplitSource: boolean;
  splitSourceBitmap: ImageBitmap | null;
  backgroundColor: import("../../core/types").BackgroundColor;
  onBackgroundColorChange: (
    color: import("../../core/types").BackgroundColor,
  ) => void;
}

export function SplitterControl({
  onConfigChange,
  isProcessing: _isProcessing,
  exportFormat,
  onExportFormatChange,
  isZip,
  onIsZipChange,
  isTwitterOptimized,
  onIsTwitterOptimizedChange,
  config,
  disabled = false,
  onShowGuide,
  isIOS,
  webpWarningDismissed,
  setWebpWarningDismissed,
  onShowWebpWarning,
  splitEditState,
  onSplitEditStateChange,
  hasSplitSource,
  splitSourceBitmap,
  backgroundColor,
  onBackgroundColorChange,
}: SplitterControlProps) {
  const { layout, rows, cols, gap } = config;
  const [isGapOpen, setIsGapOpen] = useState(gap > 0);

  const setLayout = (l: LayoutType) =>
    !disabled && onConfigChange({ ...config, layout: l });
  const setRows = (r: number) =>
    !disabled && onConfigChange({ ...config, rows: r });
  const setCols = (c: number) =>
    !disabled && onConfigChange({ ...config, cols: c });
  const setGap = (g: number) =>
    !disabled && onConfigChange({ ...config, gap: Math.max(0, g) });

  useEffect(() => {
    // Determine the ideal ratio for Twitter if optimized
    let autoCropRatio = undefined;
    if (isTwitterOptimized) {
      if (layout === "GRID_2x2") autoCropRatio = 16 / 9;
      else if (layout === "T_SHAPE_3") autoCropRatio = 1.75;
      else if (layout === "HORIZONTAL_Nx1" && cols === 2) autoCropRatio = 1.75;
    }

    if (config.autoCropRatio !== autoCropRatio) {
      onConfigChange({ ...config, autoCropRatio });
    }
  }, [layout, rows, cols, isTwitterOptimized, config.autoCropRatio]);

  const containerStyle = disabled
    ? {
        opacity: 0.5,
        pointerEvents: "none" as const,
        filter: "grayscale(100%)",
      }
    : {};

  return (
    <>
      {/* Layout Scheme Section */}
      <SidebarSection
        title={t("layoutScheme")}
        helpText={t("layoutSchemeHelp")}
        style={containerStyle}
        headerRight={
          onShowGuide && (
            <IconButton
              icon={<BookOpen size={14} strokeWidth={2.5} />}
              onClick={onShowGuide}
              title={t("userGuideTitle")}
              style={{
                padding: "4px",
                background: "var(--color-surface-soft)",
                color: "var(--color-text)",
              }}
            />
          )
        }
      >
        <div className="layout-grid-container">
          <LayoutButton
            active={layout === "GRID_2x2"}
            onClick={() => setLayout("GRID_2x2")}
            icon={<LayoutGrid size={13} />}
            label={t("layoutGrid")}
          />
          <LayoutButton
            active={layout === "T_SHAPE_3"}
            onClick={() => setLayout("T_SHAPE_3")}
            icon={<Layout size={13} />}
            label={t("layoutTShape")}
          />
          <LayoutButton
            active={layout === "HORIZONTAL_Nx1"}
            onClick={() => setLayout("HORIZONTAL_Nx1")}
            icon={<Columns size={13} />}
            label={t("layoutHorizontal")}
          />
          <LayoutButton
            active={layout === "VERTICAL_1xN"}
            onClick={() => setLayout("VERTICAL_1xN")}
            icon={<Rows size={13} />}
            label={t("layoutVertical")}
          />
        </div>
      </SidebarSection>

      {/* 拖动模式切换 */}
      {hasSplitSource && (
        <SidebarSection
          title={t("dragMode") || "拖动模式"}
          style={containerStyle}
        >
          <div className="mode-switcher" style={{ width: "100%" }}>
            <button
              className={`mode-btn ${splitEditState.dragMode === "unified" ? "active" : ""}`}
              onClick={() =>
                onSplitEditStateChange({
                  ...splitEditState,
                  dragMode: "unified",
                })
              }
              style={{ flex: 1 }}
            >
              <Move size={12} />
              <span>{t("dragModeUnified") || "整体"}</span>
            </button>
            <button
              className={`mode-btn ${splitEditState.dragMode === "individual" ? "active" : ""}`}
              onClick={() => {
                // 将当前全局状态分发到各个 cell，确保切换时不跳变
                const { drawW, drawH } = calculateEffectiveArea(
                  splitSourceBitmap?.width || 0,
                  splitSourceBitmap?.height || 0,
                  config.autoCropRatio,
                );
                const regions = calculateCellRegions(config, drawW, drawH);
                const newCells = regions.map((_, i) => {
                  const cell = splitEditState.cells[i];
                  if (cell?.replacementSource) {
                    // 已有独立状态的保留其自身状态
                    return cell;
                  }
                  return {
                    ...(cell || {
                      replacementSource: null,
                      replacementFile: null,
                    }),
                    offsetX: splitEditState.globalOffsetX,
                    offsetY: splitEditState.globalOffsetY,
                    scale: splitEditState.globalScale,
                  };
                });

                onSplitEditStateChange({
                  ...splitEditState,
                  dragMode: "individual",
                  cells: newCells,
                });
              }}
              style={{ flex: 1 }}
            >
              <Hand size={12} />
              <span>{t("dragModeIndividual") || "分别"}</span>
            </button>
          </div>

          {/* 内容缩放控件 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {/* 第一行：标签与数值左右分布 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 2px",
              }}
            >
              <h3 className="section-sub-header" style={{ margin: 0 }}>
                {t("contentScale") || "内容缩放"}
              </h3>
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "'Fira Code', monospace",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  textAlign: "right",
                }}
              >
                {Math.round(
                  (splitEditState.dragMode === "unified"
                    ? splitEditState.globalScale
                    : (splitEditState.cells[splitEditState.activeCellIndex ?? 0]
                        ?.scale ?? 1)) * 100,
                )}
                %
              </span>
            </div>

            {/* 第二行：滑块独占全行 */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="range"
                min="50"
                max="300"
                step="5"
                value={Math.round(
                  (splitEditState.dragMode === "unified"
                    ? splitEditState.globalScale
                    : (splitEditState.cells[splitEditState.activeCellIndex ?? 0]
                        ?.scale ?? 1)) * 100,
                )}
                onInput={(e) => {
                  const newScale = parseInt(e.currentTarget.value) / 100;
                  const { dragMode, globalScale, activeCellIndex, cells } =
                    splitEditState;

                  if (dragMode === "unified") {
                    // 整体模式：以网格中心为锚点缩放
                    const { drawW, drawH } = calculateEffectiveArea(
                      splitSourceBitmap?.width || 0,
                      splitSourceBitmap?.height || 0,
                      config.autoCropRatio,
                    );
                    const regions = calculateCellRegions(config, drawW, drawH);
                    const totalWidth = regions.reduce(
                      (max, r) => Math.max(max, r.x + r.width),
                      0,
                    );
                    const totalHeight = regions.reduce(
                      (max, r) => Math.max(max, r.y + r.height),
                      0,
                    );

                    const anchorX = totalWidth / 2;
                    const anchorY = totalHeight / 2;

                    // newOffset = A - (A - oldOffset) * (newS / oldS)
                    const newOffsetX =
                      anchorX -
                      (anchorX - splitEditState.globalOffsetX) *
                        (newScale / globalScale);
                    const newOffsetY =
                      anchorY -
                      (anchorY - splitEditState.globalOffsetY) *
                        (newScale / globalScale);

                    onSplitEditStateChange({
                      ...splitEditState,
                      globalScale: newScale,
                      globalOffsetX: newOffsetX,
                      globalOffsetY: newOffsetY,
                    });
                  } else {
                    // 分别模式：以选中格子的中心为锚点缩放
                    const idx = activeCellIndex ?? 0;
                    const { drawW, drawH } = calculateEffectiveArea(
                      splitSourceBitmap?.width || 0,
                      splitSourceBitmap?.height || 0,
                      config.autoCropRatio,
                    );
                    const regions = calculateCellRegions(config, drawW, drawH);
                    const region = regions[idx];

                    const anchorX = region.x + region.width / 2;
                    const anchorY = region.y + region.height / 2;

                    const newCells = [...cells];
                    while (newCells.length <= idx) {
                      newCells.push({
                        offsetX: 0,
                        offsetY: 0,
                        scale: 1,
                        replacementSource: null,
                        replacementFile: null,
                      });
                    }

                    const oldCellScale = newCells[idx].scale;

                    let newOffsetX, newOffsetY;
                    if (newCells[idx].replacementSource) {
                      // 替换图锚点固定在自己格子中心（boxCX, boxCY 被置为了原点0）
                      // 所以 offsetX/Y 就是偏离 boxCX/boxCY 的量
                      // 这里假设以格子中心为缩放锚点，因此 anchor 相对自身偏移系的坐标就是 0
                      // pX = (0 - offsetX) / oldScale
                      // newOffsetX = 0 - pX * newScale
                      const pX = (0 - newCells[idx].offsetX) / oldCellScale;
                      const pY = (0 - newCells[idx].offsetY) / oldCellScale;

                      newOffsetX = -pX * newScale;
                      newOffsetY = -pY * newScale;
                    } else {
                      // 原图锚点
                      newOffsetX =
                        anchorX -
                        (anchorX - newCells[idx].offsetX) *
                          (newScale / oldCellScale);
                      newOffsetY =
                        anchorY -
                        (anchorY - newCells[idx].offsetY) *
                          (newScale / oldCellScale);
                    }

                    newCells[idx] = {
                      ...newCells[idx],
                      scale: newScale,
                      offsetX: newOffsetX,
                      offsetY: newOffsetY,
                    };
                    onSplitEditStateChange({
                      ...splitEditState,
                      cells: newCells,
                    });
                  }
                }}
                style={{
                  flex: 1,
                  accentColor: "var(--color-primary)",
                  margin: 0,
                }}
              />
            </div>
          </div>

          {/* 重置按钮 */}
          <div
            style={{
              marginTop: "6px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              className="format-btn"
              onClick={() => {
                onSplitEditStateChange({
                  ...splitEditState,
                  globalOffsetX: 0,
                  globalOffsetY: 0,
                  globalScale: 1,
                  cells: splitEditState.cells.map((c) => ({
                    ...c,
                    offsetX: 0,
                    offsetY: 0,
                    scale: 1,
                  })),
                  activeCellIndex: null,
                });
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
              }}
            >
              <RotateCcw size={11} />
              <span>{t("resetPosition") || "重置位置"}</span>
            </button>
          </div>
        </SidebarSection>
      )}

      {/* Custom Rows/Cols Section */}
      {(layout === "VERTICAL_1xN" || layout === "HORIZONTAL_Nx1") && (
        <SidebarSection
          title={layout === "VERTICAL_1xN" ? t("rowCount") : t("colCount")}
          style={containerStyle}
          headerRight={
            <div className="control-group-pill">
              <IconButton
                onClick={() => {
                  const val = layout === "VERTICAL_1xN" ? rows : cols;
                  const newVal = Math.max(2, val - 1);
                  if (layout === "VERTICAL_1xN") setRows(newVal);
                  else setCols(newVal);
                }}
                icon={<Minus size={10} />}
                className="global-gap-btn"
                style={{
                  border: "none",
                  background: "none",
                  padding: "1px",
                  color: "var(--color-text)",
                }}
              />
              <span
                style={{
                  width: "24px",
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  fontFamily: "'Fira Code', monospace",
                  lineHeight: 1,
                }}
              >
                {layout === "VERTICAL_1xN" ? rows : cols}
              </span>
              <IconButton
                onClick={() => {
                  const val = layout === "VERTICAL_1xN" ? rows : cols;
                  const newVal = Math.min(10, val + 1);
                  if (layout === "VERTICAL_1xN") setRows(newVal);
                  else setCols(newVal);
                }}
                icon={<Plus size={10} />}
                className="global-gap-btn"
                style={{
                  border: "none",
                  background: "none",
                  padding: "1px",
                  color: "var(--color-text)",
                }}
              />
            </div>
          }
        ></SidebarSection>
      )}

      {/* Gap Removal Section (Enhanced) */}
      <SidebarSection
        title={t("gapRemoval")}
        helpText={t("gapRemovalTip")}
        className="gap-control-enhanced"
        style={containerStyle}
        headerRight={
          <label className="switch">
            <input
              type="checkbox"
              checked={isGapOpen}
              onChange={(e) => {
                const checked = e.currentTarget.checked;
                setIsGapOpen(checked);
                if (!checked) setGap(0);
              }}
            />
            <span className="slider"></span>
          </label>
        }
      >
        {isGapOpen && (
          <div className="gap-control-content animate-slide-up">
            <div className="gap-value-pill-container">
              <div className="control-group-pill gap-value-pill">
                <div className="pill-reset-trigger" onClick={() => setGap(0)}>
                  <RotateCcw size={16} strokeWidth={2.5} />
                </div>
                <div className="pill-divider" />
                <div className="pill-input-group">
                  <input
                    type="number"
                    value={gap}
                    onInput={(e) => {
                      const val = parseInt(e.currentTarget.value) || 0;
                      setGap(Math.max(0, Math.min(1000, val)));
                    }}
                    className="hide-arrows pill-input"
                  />
                  <span className="pill-unit-text">PX</span>
                </div>
              </div>
            </div>

            <div className="jog-dial-container">
              <JogWheel value={gap} onChange={setGap} min={0} max={1000} />
            </div>
          </div>
        )}
      </SidebarSection>

      {/* Twitter Options Section */}
      <SidebarSection
        title={t("twitterOptimize")}
        helpText={t("twitterOptimizeHelp")}
        style={containerStyle}
        headerRight={
          <label className="switch" style={{ flexShrink: 0 }}>
            <input
              type="checkbox"
              checked={isTwitterOptimized}
              onChange={(e) =>
                onIsTwitterOptimizedChange(
                  (e.target as HTMLInputElement).checked,
                )
              }
              disabled={disabled}
            />
            <span className="slider"></span>
          </label>
        }
      >
        <span
          style={{
            fontSize: "0.6rem",
            color: "var(--color-text-muted)",
            lineHeight: 1.3,
            display: "block",
            paddingRight: "2.5rem",
          }}
        >
          {t("twitterOptimizeTip")}
        </span>
      </SidebarSection>

      {/* Export Settings Section */}
      <SidebarSection title={t("exportSettings")} helpText={t("formatHelp")}>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <div className="section-row-standard">
            <h3 className="section-sub-header">{t("formatLabel")}</h3>
            <div className="format-selector">
              {(["png", "jpg", "webp"] as const).map((fmt) => (
                <button
                  key={fmt}
                  className={`format-btn ${exportFormat === fmt ? "active" : ""}`}
                  onClick={() => {
                    if (
                      fmt === "webp" &&
                      isIOS &&
                      !webpWarningDismissed &&
                      onShowWebpWarning
                    ) {
                      onShowWebpWarning(() => {
                        onExportFormatChange("webp");
                        setWebpWarningDismissed(true);
                        platformStorage.set({
                          [APP_CONFIG.STORAGE.WEBP_WARNING_DISMISSED]: true,
                        });
                      });
                    } else {
                      onExportFormatChange(fmt);
                    }
                  }}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="section-row-standard">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.1rem",
              }}
            >
              <h3 className="section-sub-header" style={{ margin: 0 }}>
                {t("backgroundColor") || "背景填充"}
              </h3>
              <span
                style={{
                  fontSize: "0.6rem",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.2,
                }}
              >
                {t("splitBackgroundTip") || "开启后将为移动露出的边缘填充背景"}
              </span>
            </div>
            <label className="switch" style={{ flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={!!config.fillBackground}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    fillBackground: (e.target as HTMLInputElement).checked,
                  })
                }
              />
              <span className="slider"></span>
            </label>
          </div>

          {config.fillBackground && (
            <div
              className="flex-row-center animate-slide-up"
              style={{
                gap: "8px",
                padding: "4px 4px 8px",
                justifyContent: "flex-end",
              }}
            >
              <div
                className={`color-circle bg-checkerboard-sm ${backgroundColor === "transparent" ? "active" : ""}`}
                onClick={() =>
                  exportFormat !== "jpg" &&
                  onBackgroundColorChange("transparent")
                }
                style={{
                  opacity: exportFormat === "jpg" ? 0.3 : 1,
                  cursor: exportFormat === "jpg" ? "not-allowed" : "pointer",
                }}
                title={t("transparent")}
              />
              <div
                className={`color-circle ${backgroundColor === "white" ? "active" : ""}`}
                style={{ backgroundColor: "white" }}
                onClick={() => onBackgroundColorChange("white")}
                title={t("white")}
              />
              <div
                className={`color-circle ${backgroundColor === "black" ? "active" : ""}`}
                style={{
                  backgroundColor: "black",
                  borderColor: "rgba(255,255,255,0.2)",
                }}
                onClick={() => onBackgroundColorChange("black")}
                title={t("black")}
              />
            </div>
          )}

          <Divider />

          <div className="section-row-standard">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.1rem",
              }}
            >
              <h3 className="section-sub-header" style={{ margin: 0 }}>
                {t("zipLabel")}
              </h3>
              <span
                style={{
                  fontSize: "0.6rem",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.2,
                }}
              >
                {t("zipTip")}
              </span>
            </div>
            <label className="switch" style={{ flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={isZip}
                onChange={(e) =>
                  onIsZipChange((e.target as HTMLInputElement).checked)
                }
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </SidebarSection>
    </>
  );
}
