import {
  Download,
  LayoutGrid,
  Rows,
  Columns,
  Layout,
  Eye,
  EyeOff,
  Plus,
  Minus,
  RotateCcw,
  GripVertical,
  Scissors,
  ChevronUp,
  ChevronDown,
} from "lucide-preact";
import JSZip from "jszip";
import { t } from "../../core/i18n";
import {
  ImageNode,
  LayoutType,
  BackgroundColor,
  SplitConfig,
} from "../../core/types";
import { LayoutButton, IconButton, CustomSelect } from "./Common";
import { SplitterControl } from "./SplitterControl";

interface SidebarProps {
  mode: "stitch" | "split";
  layout: LayoutType;
  setLayout: (l: LayoutType) => void;
  images: ImageNode[];
  draggedIndex: number | null;
  onDragStart: (idx: number) => void;
  onDragOver: (e: DragEvent, idx: number) => void;
  onDrop: (idx: number) => void;
  onDragEnd: () => void;
  moveItem: (idx: number, dir: "up" | "down") => void;
  toggleVisibility: (idx: number) => void;
  updateLocalGap: (idx: number, gap: number) => void;
  globalGap: number;
  setGlobalGap: (gap: number) => void;

  // Split Props
  splitConfig: SplitConfig;
  setSplitConfig: (c: SplitConfig | ((c: SplitConfig) => SplitConfig)) => void;
  isSplitting: boolean;
  handleSplit: (config: SplitConfig) => void;
  splitBlobs: Blob[];
  setSplitBlobs: (blobs: Blob[]) => void;
  isZip: boolean;
  setIsZip: (v: boolean) => void;
  isTwitterOptimized: boolean;
  setIsTwitterOptimized: (v: boolean) => void;

  // Export Props
  outputFormat: "png" | "jpg" | "webp";
  setOutputFormat: (f: "png" | "jpg" | "webp") => void;
  backgroundColor: BackgroundColor;
  setBackgroundColor: (c: BackgroundColor) => void;
  lang: string;
  setLang: (l: string) => void;

  hasSplitSource: boolean;
  handleStitch: () => void;
  loading: boolean;
  isGenerating: boolean;
}

export function Sidebar({
  mode,
  layout,
  setLayout,
  images,
  draggedIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  moveItem,
  toggleVisibility,
  updateLocalGap,
  globalGap,
  setGlobalGap,
  splitConfig,
  setSplitConfig,
  isSplitting,
  handleSplit,
  splitBlobs,
  setSplitBlobs,
  isZip,
  setIsZip,
  isTwitterOptimized,
  setIsTwitterOptimized,
  outputFormat,
  setOutputFormat,
  backgroundColor,
  setBackgroundColor,
  lang,
  setLang,
  hasSplitSource,
  handleStitch,
  loading,
  isGenerating,
}: SidebarProps) {
  return (
    <div className="sidebar-panel">
      <div className="sidebar-content-root no-scrollbar sidebar-scroll-area">
        {mode === "split" ? (
          <SplitterControl
            config={splitConfig}
            onConfigChange={setSplitConfig}
            isProcessing={isSplitting}
            exportFormat={splitConfig.format || "png"}
            onExportFormatChange={(fmt) =>
              setSplitConfig((prev) => ({ ...prev, format: fmt }))
            }
            isZip={isZip}
            onIsZipChange={setIsZip}
            isTwitterOptimized={isTwitterOptimized}
            onIsTwitterOptimizedChange={setIsTwitterOptimized}
            disabled={splitBlobs && splitBlobs.length > 0}
          />
        ) : (
          <>
            {/* Fixed Sections */}
            <div
              style={{
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <section className="section-block">
                <h3 className="section-header">{t("layoutScheme")}</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "0.25rem",
                  }}
                >
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

              {/* Global Gap */}
              <section className="section-block">
                <div className="flex-between">
                  <h3 className="section-header">{t("globalGap")}</h3>
                  <div className="control-group-pill">
                    <IconButton
                      onClick={() =>
                        setGlobalGap(Math.max(-500, globalGap - 1))
                      }
                      icon={<Minus size={10} />}
                      style={{
                        border: "none",
                        background: "none",
                        padding: "1px",
                        color: "var(--color-text)",
                      }}
                    />
                    <div className="flex-row-center">
                      <input
                        type="number"
                        value={globalGap}
                        onInput={(e) =>
                          setGlobalGap(
                            Math.max(
                              -500,
                              Math.min(
                                500,
                                parseInt(e.currentTarget.value) || 0,
                              ),
                            ),
                          )
                        }
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
                      onClick={() => setGlobalGap(Math.min(500, globalGap + 1))}
                      icon={<Plus size={10} />}
                      style={{
                        border: "none",
                        background: "none",
                        padding: "1px",
                        color: "var(--color-text)",
                      }}
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="100"
                  value={globalGap}
                  onInput={(e) =>
                    setGlobalGap(parseInt(e.currentTarget.value) || 0)
                  }
                  className="vibrant-range"
                  style={{ height: "3px", marginTop: "2px" }}
                />
              </section>
            </div>

            {/* Elastic Sorting Area */}
            <section className="section-block sorting-area">
              <div className="flex-between">
                <h3 className="section-header">{t("imageSorting")}</h3>
                <span
                  style={{
                    fontSize: "0.6rem",
                    color: "var(--color-text-muted)",
                    fontWeight: 500,
                  }}
                >
                  {t("localGap")}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => onDragStart(idx)}
                    onDragOver={(e) => onDragOver(e, idx)}
                    onDrop={() => onDrop(idx)}
                    onDragEnd={onDragEnd}
                    className={`sortable-item ${draggedIndex === idx ? "dragging" : ""}`}
                    style={{ opacity: img.visible === false ? 0.6 : 1 }}
                  >
                    <div className="item-header">
                      <GripVertical
                        size={13}
                        style={{
                          color: "var(--color-handle)",
                          opacity: 0.6,
                          cursor: "grab",
                        }}
                      />
                      <div className="item-thumb-container">
                        <img
                          src={img.thumbnailUrl}
                          className="item-thumb"
                          title={`${img.width}×${img.height}`}
                        />
                        <div className="item-index-badge">{idx + 1}</div>
                      </div>
                      <div className="item-info">
                        <div className="item-name">
                          {img.name ||
                            `${t("imageLabel")} ${img.originalIndex ?? idx + 1}`}
                        </div>
                        <div
                          className="flex-row-center gap-sm"
                          style={{ marginTop: "2px" }}
                        >
                          {/* <span className="item-meta">{img.width}×{img.height}</span>  Hidden to save space */}
                          {/* Inline Gap Control (Only show if relevant or hovered) */}
                          {idx < images.length - 1 && (
                            <div
                              className="item-gap-compact"
                              title={t("localGap")}
                            >
                              <button
                                onClick={() =>
                                  updateLocalGap(idx, (img.localGap || 0) - 1)
                                }
                                style={{
                                  border: "none",
                                  background: "none",
                                  color: "var(--color-text)",
                                  padding: "0",
                                  cursor: "pointer",
                                  display: "flex",
                                }}
                              >
                                <Minus size={8} />
                              </button>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "baseline",
                                  justifyContent: "center",
                                  gap: "2px",
                                  minWidth: "14px",
                                }}
                              >
                                <input
                                  type="number"
                                  value={img.localGap || 0}
                                  onInput={(e) =>
                                    updateLocalGap(
                                      idx,
                                      parseInt(e.currentTarget.value) || 0,
                                    )
                                  }
                                  className="hide-arrows"
                                  style={{
                                    width: "20px",
                                    fontSize: "10px",
                                    border: "none",
                                    outline: "none",
                                    textAlign: "center",
                                    backgroundColor: "transparent",
                                    fontWeight: 600,
                                    color: "var(--color-text)",
                                    fontFamily: "'Fira Code', monospace",
                                    padding: 0,
                                  }}
                                />
                                {globalGap !== 0 && (
                                  <span
                                    style={{
                                      fontSize: "8px",
                                      color: "var(--color-text-muted)",
                                      fontFamily: "'Fira Code', monospace",
                                      opacity: 0.6,
                                      letterSpacing: "-0.5px",
                                    }}
                                    title={t("finalGap") || "Final Gap"}
                                  >
                                    ({globalGap + (img.localGap || 0)})
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() =>
                                  updateLocalGap(idx, (img.localGap || 0) + 1)
                                }
                                style={{
                                  border: "none",
                                  background: "none",
                                  color: "var(--color-text)",
                                  padding: "0",
                                  cursor: "pointer",
                                  display: "flex",
                                }}
                              >
                                <Plus size={8} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions Group (Auto-hidden) */}
                      <div className="item-actions-group flex-row-center gap-sm">
                        {/* Split Vertical Arrows Container */}
                        <div className="sort-arrows-col">
                          <button
                            onClick={() => moveItem(idx, "up")}
                            disabled={idx === 0}
                            className="sort-arrow-btn"
                          >
                            <ChevronUp size={10} strokeWidth={3} />
                          </button>
                          <div
                            style={{
                              height: "1px",
                              background: "var(--color-border)",
                              opacity: 0.5,
                            }}
                          ></div>
                          <button
                            onClick={() => moveItem(idx, "down")}
                            disabled={idx === images.length - 1}
                            className="sort-arrow-btn"
                          >
                            <ChevronDown size={10} strokeWidth={3} />
                          </button>
                        </div>
                        <IconButton
                          className="btn-icon"
                          onClick={() => toggleVisibility(idx)}
                          icon={
                            img.visible !== false ? (
                              <Eye size={13} />
                            ) : (
                              <EyeOff size={13} />
                            )
                          }
                          style={{
                            border: "none",
                            background: "none",
                            padding: "2px",
                            color:
                              img.visible !== false
                                ? "var(--color-icon)"
                                : "var(--color-icon-dim)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div style={{ flexShrink: 0 }}>
              <section className="section-block">
                <h3 className="section-header">{t("settings")}</h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {/* Format Selector */}
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
                    <div
                      style={{
                        display: "flex",
                        background: "var(--color-surface-soft)",
                        borderRadius: "var(--radius-sm)",
                        padding: "2px",
                      }}
                    >
                      {(["png", "jpg", "webp"] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => {
                            setOutputFormat(fmt);
                            if (
                              fmt === "jpg" &&
                              backgroundColor === "transparent"
                            ) {
                              setBackgroundColor("white");
                            }
                          }}
                          style={{
                            border: "none",
                            background:
                              outputFormat === fmt
                                ? "var(--color-background)"
                                : "transparent",
                            color:
                              outputFormat === fmt
                                ? "var(--color-text)"
                                : "var(--color-text-muted)",
                            boxShadow:
                              outputFormat === fmt
                                ? "0 1px 3px rgba(0,0,0,0.1)"
                                : "none",
                            fontSize: "10px",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: 700,
                            transition: "all var(--transition-fast)",
                          }}
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

                  <div className="flex-between">
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--color-text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      {t("backgroundColor")}
                    </span>
                    <div
                      className="flex-row-center"
                      style={{ gap: "8px", paddingRight: "4px" }}
                    >
                      <div
                        className={`color-circle bg-checkerboard-sm ${backgroundColor === "transparent" ? "active" : ""}`}
                        onClick={() =>
                          outputFormat !== "jpg" &&
                          setBackgroundColor("transparent")
                        }
                        style={{
                          opacity: outputFormat === "jpg" ? 0.3 : 1,
                          cursor:
                            outputFormat === "jpg" ? "not-allowed" : "pointer",
                        }}
                        title={t("transparent")}
                      />
                      <div
                        className={`color-circle ${backgroundColor === "white" ? "active" : ""}`}
                        style={{ backgroundColor: "white" }}
                        onClick={() => setBackgroundColor("white")}
                        title={t("white")}
                      />
                      <div
                        className={`color-circle ${backgroundColor === "black" ? "active" : ""}`}
                        style={{
                          backgroundColor: "black",
                          borderColor: "rgba(255,255,255,0.2)",
                        }}
                        onClick={() => setBackgroundColor("black")}
                        title={t("black")}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      height: "1px",
                      background: "var(--color-border)",
                      opacity: 0.5,
                    }}
                  ></div>

                  <div className="flex-between">
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--color-text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      {t("language")}
                    </span>
                    <CustomSelect
                      value={lang}
                      onChange={setLang}
                      options={[
                        { value: "auto", label: "Auto" },
                        { value: "zh_CN", label: "简体中文" },
                        { value: "zh_TW", label: "繁體中文" },
                        { value: "en", label: "English" },
                        { value: "ja", label: "日本語" },
                        { value: "ko", label: "한국어" },
                        { value: "es", label: "Español" },
                        { value: "fr", label: "Français" },
                      ]}
                      style={{ width: "90px" }}
                      direction="top"
                    />
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        {mode === "split" ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.625rem",
            }}
          >
            <button
              onClick={() =>
                splitBlobs.length > 0
                  ? setSplitBlobs([])
                  : handleSplit(splitConfig)
              }
              disabled={
                (!hasSplitSource && splitBlobs.length === 0) || isSplitting
              }
              className={`btn ${splitBlobs.length > 0 ? "btn-secondary" : "btn-primary"}`}
              style={{ height: "3rem", fontSize: "0.95rem" }}
            >
              {isSplitting ? (
                <div
                  className="spinner"
                  style={{ width: "20px", height: "20px" }}
                />
              ) : splitBlobs.length > 0 ? (
                <>
                  <RotateCcw size={18} />
                  <span>{t("restore")}</span>
                </>
              ) : (
                <>
                  <Scissors size={18} />
                  <span>{t("splitImage")}</span>
                </>
              )}
            </button>
            <button
              disabled={splitBlobs.length === 0}
              onClick={async () => {
                if (splitBlobs.length === 0) return;
                if (isZip) {
                  const zip = new JSZip();
                  splitBlobs.forEach((b, i) =>
                    zip.file(
                      `split_${i + 1}.${b.type.split("/")[1] || splitConfig.format}`,
                      b,
                    ),
                  );
                  const content = await zip.generateAsync({ type: "blob" });
                  const url = URL.createObjectURL(content);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `split_${new Date().getTime()}.zip`;
                  a.click();
                  URL.revokeObjectURL(url);
                } else {
                  splitBlobs.forEach((b, i) => {
                    const url = URL.createObjectURL(b);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `split_${i + 1}.${b.type.split("/")[1] || splitConfig.format}`;
                    a.click();
                    URL.revokeObjectURL(url);
                  });
                }
              }}
              className="btn btn-primary"
              style={{
                height: "3rem",
                fontSize: "0.95rem",
                opacity: splitBlobs.length > 0 ? 1 : 0.4,
                boxShadow:
                  splitBlobs.length > 0
                    ? "0 8px 20px rgba(0, 122, 255, 0.3)"
                    : "none",
              }}
            >
              <Download size={18} />
              <span>{t("downloadAll")}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleStitch}
            disabled={images.length === 0 || loading || isGenerating}
            className="btn btn-primary"
            style={{
              width: "100%",
              height: "3rem",
              fontSize: "1rem",
              boxShadow: "0 10px 24px rgba(0, 122, 255, 0.35)",
            }}
          >
            <Download size={20} />
            <span>{t("stitchAndDownload")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
