import { useEffect } from "preact/hooks";
import { LayoutType, SplitConfig } from "../../core/types";
import { LayoutButton, IconButton } from "./Common";
import { LayoutGrid, Layout, Rows, Columns, Plus, Minus } from "lucide-preact";
import { t } from "../../core/i18n";

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
}: SplitterControlProps) {
  const { layout, rows, cols, gap } = config;

  const setLayout = (l: LayoutType) =>
    !disabled && onConfigChange({ ...config, layout: l });
  const setRows = (r: number) =>
    !disabled && onConfigChange({ ...config, rows: r });
  const setCols = (c: number) =>
    !disabled && onConfigChange({ ...config, cols: c });
  const setGap = (g: number) =>
    !disabled && onConfigChange({ ...config, gap: g });

  useEffect(() => {
    // Determine the ideal ratio for Twitter if optimized
    let autoCropRatio = undefined;
    if (isTwitterOptimized) {
      // Updated based on user feedback: Twitter now renders 2x2 grids as 16:9 rectangles, not squares.
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
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {/* Layout Scheme Section */}
      <section className="section-block" style={containerStyle}>
        <h3 className="section-header">{t("layoutScheme")}</h3>
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
      </section>

      {/* 自定义行列区块 */}
      {/* Custom Rows/Cols Section */}
      {(layout === "VERTICAL_1xN" || layout === "HORIZONTAL_Nx1") && (
        <section className="section-block" style={containerStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 className="section-header">
              {layout === "VERTICAL_1xN" ? t("rowCount") : t("colCount")}
            </h3>
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
                style={{ border: "none", background: "none", padding: "1px", color: "var(--color-text)" }}
              />
              <span
                style={{
                  width: "24px",
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  fontFamily: "'Fira Code', monospace",
                  lineHeight: 1
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
                style={{ border: "none", background: "none", padding: "1px", color: "var(--color-text)" }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Gap Removal Section */}
      <section className="section-block" style={containerStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 className="section-header">{t("gapRemoval")}</h3>
          <div className="control-group-pill">
            <IconButton
              onClick={() => setGap(Math.max(0, gap - 1))}
              icon={<Minus size={10} />}
              className="global-gap-btn"
              style={{ border: "none", background: "none", padding: "1px", color: "var(--color-text)" }}
            />
            <div className="flex-row-center">
              <input
                type="number"
                value={gap}
                onInput={(e) => {
                  const val = parseInt(e.currentTarget.value) || 0;
                  setGap(Math.max(0, Math.min(100, val)));
                }}
                className="hide-arrows"
                style={{
                  width: "22px",
                  height: "14px",
                  fontSize: "11px",
                  border: "none",
                  outline: "none",
                  textAlign: "center",
                  backgroundColor: "transparent",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  fontFamily: "'Fira Code', monospace",
                }}
              />
              <span
                style={{
                  fontSize: "9px",
                  color: "var(--color-text-muted)",
                  fontWeight: 700,
                  marginLeft: "1px",
                }}
              >
                PX
              </span>
            </div>
            <IconButton
              onClick={() => setGap(Math.min(100, gap + 1))}
              icon={<Plus size={10} />}
              className="global-gap-btn"
              style={{ border: "none", background: "none", padding: "1px", color: "var(--color-text)" }}
            />
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={gap}
          onInput={(e) => setGap(parseInt(e.currentTarget.value) || 0)}
          className="vibrant-range"
          style={{ height: "3px", marginTop: "2px" }}
        />
      </section>

      {/* Twitter Options Section */}
      <section className="section-block" style={containerStyle}>
        <h3 className="section-header">{t("twitterOptimize")}</h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          <span
            style={{
              fontSize: "0.6rem",
              color: "var(--color-text-muted)",
              lineHeight: 1.3,
              flex: 1,
            }}
          >
            {t("twitterOptimizeTip")}
          </span>
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
        </div>
      </section>

      {/* Export Settings Section */}
      <section className="section-block">
        <h3 className="section-header">{t("exportSettings")}</h3>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--color-text-muted)",
                fontWeight: 600,
              }}
            >
              {t("formatLabel")}
            </span>
            <div className="format-selector">
              {(["png", "jpg", "webp"] as const).map((fmt) => (
                <button
                  key={fmt}
                  className={`format-btn ${exportFormat === fmt ? "active" : ""}`}
                  onClick={() => onExportFormatChange(fmt)}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              height: "1px",
              background: "var(--color-border)",
              opacity: 0.5,
            }}
          ></div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.1rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "var(--color-text-muted)",
                  fontWeight: 600,
                }}
              >
                {t("zipLabel")}
              </span>
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
      </section>
    </div>
  );
}
