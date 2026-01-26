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
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* 布局方案区块 */}
      <section className="section-block">
        <h3 className="section-header">{t("layoutScheme")}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.4rem" }}>
          <LayoutButton active={layout === "GRID_2x2"} onClick={() => setLayout("GRID_2x2")} icon={<LayoutGrid size={15} />} label={t("layoutGrid")} />
          <LayoutButton active={layout === "T_SHAPE_3"} onClick={() => setLayout("T_SHAPE_3")} icon={<Layout size={15} />} label={t("layoutTShape")} />
          <LayoutButton active={layout === "HORIZONTAL_Nx1"} onClick={() => setLayout("HORIZONTAL_Nx1")} icon={<Columns size={15} />} label={t("layoutHorizontal")} />
          <LayoutButton active={layout === "VERTICAL_1xN"} onClick={() => setLayout("VERTICAL_1xN")} icon={<Rows size={15} />} label={t("layoutVertical")} />
        </div>
      </section>

      {/* 自定义行列区块 */}
      {(layout === "VERTICAL_1xN" || layout === "HORIZONTAL_Nx1") && (
         <section className="section-block">
            <h3 className="section-header">{layout === "VERTICAL_1xN" ? t("rowCount") : t("colCount")}</h3>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(255, 255, 255, 0.05)", borderRadius: "var(--radius-sm)", padding: "2px", width: "min-content" }}>
               <IconButton onClick={() => {
                     const val = layout === "VERTICAL_1xN" ? rows : cols;
                     const newVal = Math.max(2, val - 1);
                     if(layout === "VERTICAL_1xN") setRows(newVal); else setCols(newVal);
                 }} icon={<Minus size={11} />} style={{ border: "none", background: "rgba(255, 255, 255, 0.05)", width: "22px", height: "22px" }} />
               <span style={{ width: "30px", textAlign: "center", fontSize: "11px", fontWeight: 700, color: "white", fontFamily: "'Fira Code', monospace" }}>
                   {layout === "VERTICAL_1xN" ? rows : cols}
               </span>
               <IconButton onClick={() => {
                     const val = layout === "VERTICAL_1xN" ? rows : cols;
                     const newVal = Math.min(10, val + 1);
                     if(layout === "VERTICAL_1xN") setRows(newVal); else setCols(newVal);
                 }} icon={<Plus size={11} />} style={{ border: "none", background: "rgba(255, 255, 255, 0.05)", width: "22px", height: "22px" }} />
            </div>
         </section>
      )}

      {/* 消除间距区块 */}
      <section className="section-block">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
            <h3 className="section-header" style={{ margin: 0 }}>{t("gapRemoval")}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                 <div style={{ display: "flex", alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.08)", borderRadius: "var(--radius-sm)", padding: "1px 4px" }}>
                    <input type="number" value={gap} onInput={(e) => {
                          const val = parseInt(e.currentTarget.value) || 0;
                          setGap(Math.max(0, Math.min(100, val)));
                      }} className="hide-arrows" style={{ width: "24px", height: "16px", fontSize: "11px", border: "none", outline: "none", textAlign: "center", backgroundColor: "transparent", fontWeight: 700, color: "white", fontFamily: "'Fira Code', monospace" }} />
                    <span style={{ fontSize: "9px", color: "var(--color-text-muted)", fontWeight: 700 }}>PX</span>
                  </div>
                   <IconButton onClick={() => setGap(0)} title={t("resetToZero")} icon={<RotateCcw size={11} color="var(--color-text-muted)" />} style={{ border: "none", background: "rgba(255, 255, 255, 0.05)", padding: "2px" }} />
              </div>
        </div>
        <input type="range" min="0" max="100" value={gap} onInput={(e) => setGap(parseInt(e.currentTarget.value) || 0)} className="vibrant-range" />
       </section>

       {/* 针对推特选项区块 */}
       <section className="section-block">
         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "white", fontWeight: 600 }}>{t("twitterOptimize")}</span>
                  <span style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", lineHeight: 1.2 }}>{t("twitterOptimizeTip")}</span>
              </div>
              <label className="switch" style={{ position: "relative", minWidth: "32px", height: "18px" }}>
                  <input type="checkbox" checked={isTwitterOptimized} onChange={(e) => onIsTwitterOptimizedChange((e.target as HTMLInputElement).checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span className="slider round" style={{ position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isTwitterOptimized ? "var(--color-primary)" : "rgba(255, 255, 255, 0.1)", transition: ".3s", borderRadius: "20px" }}></span>
                  <span style={{ position: "absolute", content: '""', height: "12px", width: "12px", left: "3px", bottom: "3px", backgroundColor: "white", transition: ".3s", borderRadius: "50%", transform: isTwitterOptimized ? "translateX(14px)" : "translateX(0)" }}></span>
              </label>
         </div>
       </section>

       {/* 导出设置区块 */}
       <section className="section-block">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.75rem", color: "white", fontWeight: 600 }}>{t("formatLabel")}</span>
                  <div style={{ display: "flex", background: "rgba(255, 255, 255, 0.08)", borderRadius: "var(--radius-sm)", padding: "2px" }}>
                      {(["png", "jpg", "webp"] as const).map(fmt => (
                          <button key={fmt} onClick={() => onExportFormatChange(fmt)} style={{ border: "none", background: exportFormat === fmt ? "rgba(255, 255, 255, 0.15)" : "transparent", color: exportFormat === fmt ? "white" : "var(--color-text-muted)", fontSize: "0.65rem", padding: "3px 6px", borderRadius: "0.3rem", cursor: "pointer", fontWeight: 600, transition: "all var(--transition-fast)" }}>{fmt.toUpperCase()}</button>
                      ))}
                  </div>
               </div>
               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "white", fontWeight: 600 }}>{t("zipLabel")}</span>
                        <span style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", lineHeight: 1.2 }}>{t("zipTip")}</span>
                    </div>
                    <label className="switch" style={{ position: "relative", minWidth: "32px", height: "18px" }}>
                        <input type="checkbox" checked={isZip} onChange={(e) => onIsZipChange((e.target as HTMLInputElement).checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span className="slider round" style={{ position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isZip ? "var(--color-primary)" : "rgba(255, 255, 255, 0.1)", transition: ".3s", borderRadius: "20px" }}></span>
                        <span style={{ position: "absolute", content: '""', height: "12px", width: "12px", left: "3px", bottom: "3px", backgroundColor: "white", transition: ".3s", borderRadius: "50%", transform: isZip ? "translateX(14px)" : "translateX(0)" }}></span>
                    </label>
               </div>
          </div>
       </section>
    </div>
  );
}
