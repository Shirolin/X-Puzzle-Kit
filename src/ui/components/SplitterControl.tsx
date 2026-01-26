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
        <h3
          style={{
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontWeight: 700,
            marginBottom: "0.75rem",
            color: "var(--color-text-muted)",
          }}
        >
          {t("layoutScheme")}
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "0.5rem",
          }}
        >
          <LayoutButton
            active={layout === "GRID_2x2"}
            onClick={() => setLayout("GRID_2x2")}
            icon={<LayoutGrid size={18} />}
            label={t("layoutGrid")}
          />
          <LayoutButton
            active={layout === "T_SHAPE_3"}
            onClick={() => setLayout("T_SHAPE_3")}
            icon={<Layout size={18} />}
            label={t("layoutTShape")}
          />
          <LayoutButton
            active={layout === "HORIZONTAL_Nx1"}
            onClick={() => setLayout("HORIZONTAL_Nx1")}
            icon={<Columns size={18} />}
            label={t("layoutHorizontal")}
          />
          <LayoutButton
            active={layout === "VERTICAL_1xN"}
            onClick={() => setLayout("VERTICAL_1xN")}
            icon={<Rows size={18} />}
            label={t("layoutVertical")}
          />
        </div>
      </section>

      {/* 自定义行列区块 */}
      {(layout === "VERTICAL_1xN" || layout === "HORIZONTAL_Nx1") && (
         <section className="section-block">
             <h3
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: 700,
                marginBottom: "0.75rem",
                color: "var(--color-text-muted)",
              }}
            >
              {layout === "VERTICAL_1xN" ? t("rowCount") : t("colCount")}
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(0,0,0,0.2)",
                borderRadius: "var(--radius-md)",
                padding: "4px",
                width: "min-content"
              }}
            >
               <IconButton 
                 onClick={() => {
                     const val = layout === "VERTICAL_1xN" ? rows : cols;
                     const newVal = Math.max(2, val - 1);
                     if(layout === "VERTICAL_1xN") setRows(newVal); else setCols(newVal);
                 }}
                 icon={<Minus size={14} />}
                 style={{ 
                    border: "none", 
                    background: "rgba(255,255,255,0.05)",
                    width: "28px",
                    height: "28px"
                 }}
               />
               <span style={{ 
                   width: "40px", 
                   textAlign: "center", 
                   fontSize: "14px", 
                   fontWeight: 700,
                   color: "var(--color-primary)" 
               }}>
                   {layout === "VERTICAL_1xN" ? rows : cols}
               </span>
               <IconButton 
                 onClick={() => {
                     const val = layout === "VERTICAL_1xN" ? rows : cols;
                     const newVal = Math.min(10, val + 1);
                     if(layout === "VERTICAL_1xN") setRows(newVal); else setCols(newVal);
                 }}
                 icon={<Plus size={14} />}
                 style={{ 
                    border: "none", 
                    background: "rgba(255,255,255,0.05)",
                    width: "28px",
                    height: "28px"
                 }}
               />
            </div>
         </section>
      )}

      {/* 消除间距区块 */}
      <section className="section-block" style={{ flex: 1 }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "0.75rem"}}>
             <h3
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: 700,
                margin: 0,
                color: "var(--color-text-muted)",
              }}
            >
              {t("gapRemoval")}
            </h3>
            <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                 <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "rgba(0,0,0,0.2)",
                      borderRadius: "var(--radius-sm)",
                      padding: "2px",
                    }}
                  >
                    <input
                      type="number"
                      value={gap}
                      onInput={(e) => {
                          const val = parseInt(e.currentTarget.value) || 0;
                          setGap(Math.max(0, Math.min(100, val)));
                      }}
                      className="hide-arrows"
                      style={{
                        width: "36px",
                        height: "24px",
                        fontSize: "12px",
                        border: "none",
                        outline: "none",
                        textAlign: "center",
                        backgroundColor: "transparent",
                        fontWeight: 700,
                        color: "var(--color-primary)",
                      }}
                    />
                    <span style={{ fontSize: "10px", color: "var(--color-text-muted)", marginRight: "6px", fontWeight: 700 }}>PX</span>
                  </div>
                   <IconButton
                      onClick={() => setGap(0)}
                      title={t("resetToZero")}
                      icon={<RotateCcw size={14} color="var(--color-text-muted)" />}
                      style={{ border: "none", background: "rgba(255,255,255,0.05)" }}
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
        />
        <div style={{ marginTop: "0.65rem", fontSize: "0.7rem", color: "var(--color-text-muted)", lineHeight: 1.4 }}>
           {t("gapRemovalTip")}
        </div>
       </section>

       {/* 针对推特选项区块 */}
       <section className="section-block">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
             {/* Twitter Optimization Toggle */}
             <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <span style={{ fontSize: "0.8125rem", color: "var(--color-primary)", fontWeight: 700 }}>{t("twitterOptimize")}</span>
                      <span style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", lineHeight: 1.4 }}>{t("twitterOptimizeTip")}</span>
                  </div>
                  <label className="switch" style={{ position: "relative", minWidth: "38px", height: "22px", marginTop: "2px" }}>
                      <input 
                        type="checkbox" 
                        checked={isTwitterOptimized} 
                        onChange={(e) => onIsTwitterOptimizedChange((e.target as HTMLInputElement).checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span className="slider round" style={{ 
                          position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, 
                          backgroundColor: isTwitterOptimized ? "var(--color-primary)" : "rgba(255,255,255,0.1)", 
                          transition: ".4s", borderRadius: "20px" 
                      }}></span>
                      <span style={{
                          position: "absolute", content: '""', height: "16px", width: "16px", left: "3px", bottom: "3px",
                          backgroundColor: "white", transition: ".4s", borderRadius: "50%",
                          transform: isTwitterOptimized ? "translateX(16px)" : "translateX(0)",
                          boxShadow: isTwitterOptimized ? "0 0 10px rgba(37,99,235,0.6)" : "none"
                      }}></span>
                  </label>
             </div>
        </div>
       </section>

       {/* 导出设置区块 */}
       <section className="section-block">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
             {/* Format Selector */}
             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.8125rem", color: "var(--color-text)", fontWeight: 600 }}>{t("formatLabel")}</span>
                <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-md)", padding: "3px" }}>
                    {(["png", "jpg", "webp"] as const).map(fmt => (
                        <button
                           key={fmt}
                           onClick={() => onExportFormatChange(fmt)}
                           style={{
                                border: "none",
                                background: exportFormat === fmt ? "var(--color-primary)" : "transparent",
                                color: exportFormat === fmt ? "white" : "var(--color-text-muted)",
                                fontSize: "0.75rem",
                                padding: "4px 10px",
                                borderRadius: "var(--radius-sm)",
                                cursor: "pointer",
                                fontWeight: 700,
                                transition: "all var(--transition-fast)"
                           }}
                        >
                            {fmt.toUpperCase()}
                        </button>
                    ))}
                </div>
             </div>

             {/* Zip Toggle */}
             <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <span style={{ fontSize: "0.8125rem", color: "var(--color-text)", fontWeight: 600 }}>{t("zipLabel")}</span>
                      <span style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", lineHeight: 1.4 }}>{t("zipTip")}</span>
                  </div>
                  <label className="switch" style={{ position: "relative", minWidth: "38px", height: "22px", marginTop: "2px" }}>
                      <input 
                        type="checkbox" 
                        checked={isZip} 
                        onChange={(e) => onIsZipChange((e.target as HTMLInputElement).checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span className="slider round" style={{ 
                          position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, 
                          backgroundColor: isZip ? "var(--color-primary)" : "rgba(255,255,255,0.1)", 
                          transition: ".4s", borderRadius: "20px" 
                      }}></span>
                      <span style={{
                          position: "absolute", content: '""', height: "16px", width: "16px", left: "3px", bottom: "3px",
                          backgroundColor: "white", transition: ".4s", borderRadius: "50%",
                          transform: isZip ? "translateX(16px)" : "translateX(0)",
                          boxShadow: isZip ? "0 0 10px rgba(37,99,235,0.6)" : "none"
                      }}></span>
                  </label>
             </div>
        </div>
       </section>


    </div>
  );
}
