import { useState, useEffect } from "preact/hooks";
import { LayoutType, SplitConfig } from "../../core/types";
import { LayoutButton, IconButton } from "./Common";
import { LayoutGrid, Layout, Rows, Columns, Plus, Minus, RotateCcw, Scissors } from "lucide-preact";
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
}

export function SplitterControl({
  onConfigChange,
  isProcessing,
  exportFormat,
  onExportFormatChange,
  isZip,
  onIsZipChange,
  isTwitterOptimized,
  onIsTwitterOptimizedChange,
  config,
}: SplitterControlProps) {
  const { layout, rows, cols, gap } = config;

  const setLayout = (l: LayoutType) => onConfigChange({ ...config, layout: l });
  const setRows = (r: number) => onConfigChange({ ...config, rows: r });
  const setCols = (c: number) => onConfigChange({ ...config, cols: c });
  const setGap = (g: number) => onConfigChange({ ...config, gap: g });

  useEffect(() => {
    // Determine the ideal ratio for Twitter if optimized
    let autoCropRatio = undefined;
    if (isTwitterOptimized) {
      if (layout === "GRID_2x2") autoCropRatio = 1.0;
      else if (layout === "T_SHAPE_3") autoCropRatio = 1.75;
      else if (layout === "HORIZONTAL_Nx1" && cols === 2) autoCropRatio = 1.75;
    }

    if (config.autoCropRatio !== autoCropRatio) {
      onConfigChange({ ...config, autoCropRatio });
    }
  }, [layout, rows, cols, isTwitterOptimized, config.autoCropRatio]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {/* 布局方案区块 */}
      {/* 布局方案区块 */}
      <section className="section-block">
        <h3 className="section-header">{t("layoutScheme")}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.25rem" }}>
          <LayoutButton active={layout === "GRID_2x2"} onClick={() => setLayout("GRID_2x2")} icon={<LayoutGrid size={13} />} label={t("layoutGrid")} />
          <LayoutButton active={layout === "T_SHAPE_3"} onClick={() => setLayout("T_SHAPE_3")} icon={<Layout size={13} />} label={t("layoutTShape")} />
          <LayoutButton active={layout === "HORIZONTAL_Nx1"} onClick={() => setLayout("HORIZONTAL_Nx1")} icon={<Columns size={13} />} label={t("layoutHorizontal")} />
          <LayoutButton active={layout === "VERTICAL_1xN"} onClick={() => setLayout("VERTICAL_1xN")} icon={<Rows size={13} />} label={t("layoutVertical")} />
        </div>
      </section>

      {/* 自定义行列区块 */}
      {(layout === "VERTICAL_1xN" || layout === "HORIZONTAL_Nx1") && (
         <section className="section-block">
            <h3 className="section-header">{layout === "VERTICAL_1xN" ? t("rowCount") : t("colCount")}</h3>
            <div style={{ display: "flex", alignItems: "center", background: "var(--color-item-bg)", borderRadius: "4px", padding: "1px 4px", width: "min-content" }}>
               <IconButton onClick={() => {
                     const val = layout === "VERTICAL_1xN" ? rows : cols;
                     const newVal = Math.max(2, val - 1);
                     if(layout === "VERTICAL_1xN") setRows(newVal); else setCols(newVal);
                 }} icon={<Minus size={10} />} style={{ border: "none", background: "none", padding: "1px" }} />
               <span style={{ width: "24px", textAlign: "center", fontSize: "11px", fontWeight: 700, color: "var(--color-primary)", fontFamily: "'Fira Code', monospace" }}>
                   {layout === "VERTICAL_1xN" ? rows : cols}
               </span>
               <IconButton onClick={() => {
                     const val = layout === "VERTICAL_1xN" ? rows : cols;
                     const newVal = Math.min(10, val + 1);
                     if(layout === "VERTICAL_1xN") setRows(newVal); else setCols(newVal);
                 }} icon={<Plus size={10} />} style={{ border: "none", background: "none", padding: "1px" }} />
            </div>
         </section>
      )}

      {/* 消除间距区块 */}
      <section className="section-block">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="section-header">{t("gapRemoval")}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "2px", backgroundColor: "var(--color-item-bg)", padding: "1px 4px", borderRadius: "4px" }}>
                <IconButton onClick={() => setGap(Math.max(0, gap - 1))} icon={<Minus size={10} />} style={{ border: "none", background: "none", padding: "1px" }} />
                <div style={{ display: "flex", alignItems: "center" }}>
                    <input type="number" value={gap} onInput={(e) => {
                          const val = parseInt(e.currentTarget.value) || 0;
                          setGap(Math.max(0, Math.min(100, val)));
                      }} className="hide-arrows" style={{ width: "22px", height: "14px", fontSize: "11px", border: "none", outline: "none", textAlign: "center", backgroundColor: "transparent", fontWeight: 700, color: "var(--color-primary)", fontFamily: "'Fira Code', monospace" }} />
                    <span style={{ fontSize: "9px", color: "var(--color-text-muted)", fontWeight: 700, marginLeft: "1px" }}>PX</span>
                </div>
                <IconButton onClick={() => setGap(Math.min(100, gap + 1))} icon={<Plus size={10} />} style={{ border: "none", background: "none", padding: "1px" }} />
            </div>
        </div>
        <input type="range" min="0" max="100" value={gap} onInput={(e) => setGap(parseInt(e.currentTarget.value) || 0)} className="vibrant-range" style={{ height: "3px", marginTop: "2px" }} />
       </section>

       {/* 针对推特选项区块 */}
       <section className="section-block">
         <h3 className="section-header">{t("twitterOptimize")}</h3>
         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
              <span style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", lineHeight: 1.3, flex: 1 }}>{t("twitterOptimizeTip")}</span>
              <label className="switch">
                  <input type="checkbox" checked={isTwitterOptimized} onChange={(e) => onIsTwitterOptimizedChange((e.target as HTMLInputElement).checked)} />
                  <span className="slider"></span>
              </label>
         </div>
       </section>

       {/* 导出设置区块 */}
       <section className="section-block">
          <h3 className="section-header">{t("exportSettings")}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontWeight: 600 }}>{t("formatLabel")}</span>
                  <div style={{ display: "flex", background: "var(--color-surface-soft)", borderRadius: "var(--radius-sm)", padding: "2px" }}>
                      {(["png", "jpg", "webp"] as const).map(fmt => (
                          <button key={fmt} onClick={() => onExportFormatChange(fmt)} style={{ border: "none", background: exportFormat === fmt ? "var(--color-background)" : "transparent", color: exportFormat === fmt ? "var(--color-text)" : "var(--color-text-muted)", boxShadow: exportFormat === fmt ? "0 1px 3px rgba(0,0,0,0.1)" : "none", fontSize: "10px", padding: "2px 8px", borderRadius: "6px", cursor: "pointer", fontWeight: 700, transition: "all var(--transition-fast)" }}>{fmt.toUpperCase()}</button>
                      ))}
                  </div>
               </div>
               
               <div style={{ height: "1px", background: "var(--color-border)", opacity: 0.5 }}></div>

               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text)", fontWeight: 600 }}>{t("zipLabel")}</span>
                        <span style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", lineHeight: 1.2 }}>{t("zipTip")}</span>
                    </div>
                    <label className="switch">
                        <input type="checkbox" checked={isZip} onChange={(e) => onIsZipChange((e.target as HTMLInputElement).checked)} />
                        <span className="slider"></span>
                    </label>
               </div>
          </div>
       </section>
    </div>
  );
}
