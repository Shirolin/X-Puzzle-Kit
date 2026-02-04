import { useEffect, useState } from "preact/hooks";
import { LayoutType, SplitConfig } from "../../core/types";
import { LayoutButton, IconButton } from "./Common";
import {
  LayoutGrid,
  Layout,
  Rows,
  Columns,
  Plus,
  Minus,
  RotateCcw,
} from "lucide-preact";
import { t } from "../../core/i18n";
import { SidebarSection, Divider, JogWheel } from "./Sidebar";

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
      <SidebarSection title={t("layoutScheme")} style={containerStyle}>
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
      <SidebarSection title={t("exportSettings")}>
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
                  onClick={() => onExportFormatChange(fmt)}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

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
