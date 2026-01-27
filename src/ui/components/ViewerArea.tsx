import { RefObject } from "preact";
import { Plus, Minus, RotateCcw, Upload, Trash2 } from "lucide-preact";
import { t } from "../../core/i18n";
import { StitchTask, SplitConfig } from "../../core/types";
import { IconButton } from "./Common";
import { SplitPreview } from "./SplitPreview";

interface ViewerAreaProps {
  mode: "stitch" | "split";
  splitSourceBitmap: ImageBitmap | null;
  canvasSize: { width: number; height: number };
  containerRef: RefObject<HTMLDivElement>;
  isPanning: boolean;
  handleWheel: (e: WheelEvent) => void;
  handleMouseDown: (e: MouseEvent) => void;
  handleMouseMove: (e: MouseEvent) => void;
  handleMouseUp: () => void;
  handleDoubleClick: () => void;
  task: StitchTask;
  isGenerating: boolean;
  isSplitting: boolean;
  viewerScale: number;
  setViewerScale: (s: number | ((s: number) => number)) => void;
  resetViewer: () => void;
  viewerRotation: number;
  setViewerRotation: (r: number | ((r: number) => number)) => void;
  viewerOffset: { x: number; y: number };
  previewUrl: string;
  splitBlobs: Blob[];
  splitConfig: SplitConfig;
  // ... existing props
  handleSplitFileSelect: (e: Event) => void;
  onClearSplit?: () => void;
}

export function ViewerArea({
  mode,
  splitSourceBitmap,
  canvasSize,
  containerRef,
  isPanning,
  handleWheel,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleDoubleClick,
  task,
  isGenerating,
  isSplitting,
  viewerScale,
  setViewerScale,
  resetViewer,
  viewerRotation,
  setViewerRotation,
  viewerOffset,
  previewUrl,
  splitBlobs,
  splitConfig,
  handleSplitFileSelect,
  onClearSplit,
}: ViewerAreaProps) {
  return (
    <div className="viewer-area">
      {mode === "split" && !splitSourceBitmap ? (
        <div className="viewer-empty-state">
          <div className="viewer-upload-box">
            <div
              style={{
                marginBottom: "1rem",
                color: "var(--color-text-muted)",
                fontSize: "0.85rem",
                maxWidth: "100%",
                margin: "0 auto 1rem",
                lineHeight: "1.4",
              }}
            >
              {t("selectImageTip")}
            </div>
            <label
              className="btn btn-primary"
              style={{
                display: "inline-flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "8px",
                padding: "0.6rem 1.25rem",
                cursor: "pointer",
                width: "auto",
                maxWidth: "100%",
                whiteSpace: "nowrap",
              }}
            >
              <Upload size={18} style={{ flexShrink: 0 }} />
              <span className="upload-btn-text">{t("uploadImage")}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleSplitFileSelect}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="viewer-canvas checkerboard-bg"
          style={{ cursor: isPanning ? "grabbing" : "grab" }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDblClick={handleDoubleClick}
        >
          {/* Metadata Floating Badges */}
          <div className="floating-badge-container">
            {mode === "stitch" && (
              <div className="floating-badge badge-primary">
                @{task.artistHandle} / x.com/{task.tweetId}
              </div>
            )}
            {/* Split Result Badge - Moved here to prevent overlap on narrow screens */}
            {mode === "split" && splitBlobs.length > 0 && (
              <div
                className="floating-badge"
                style={{
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  background: "rgba(0, 122, 255, 0.1)",
                  borderColor: "rgba(0, 122, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                {t("splitResult")}
              </div>
            )}
            <div className="floating-badge">
              {mode === "split"
                ? splitSourceBitmap
                  ? `${splitSourceBitmap.width} × ${splitSourceBitmap.height} px`
                  : ""
                : canvasSize.width > 0
                  ? `${canvasSize.width} × ${canvasSize.height} px`
                  : ""}
            </div>
          </div>

          {/* Remove Image Floating Button (Split Mode Only) */}

          {isGenerating || isSplitting ? (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <div className="loading-text">
                {mode === "stitch" && isGenerating
                  ? t("stitching")
                  : t("processing")}
              </div>
            </div>
          ) : null}

          {/* Viewer Toolbar - Precision Match for Image 2 */}
          <div
            className="viewer-toolbar-v2 apple-blur"
            style={{
              position: "absolute",
              bottom: "1.5rem",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 30,
            }}
          >
            <div className="toolbar-row">
              <IconButton
                className="toolbar-btn"
                onClick={() => setViewerScale((s) => Math.max(0.1, s - 0.1))}
                icon={<Minus size={16} />}
                style={{ background: "none", border: "none" }}
              />
              <div className="zoom-percentage">
                {Math.round(viewerScale * 100)}%
              </div>
              <IconButton
                className="toolbar-btn"
                onClick={() => setViewerScale((s) => Math.min(10, s + 0.1))}
                icon={<Plus size={16} />}
                style={{ background: "none", border: "none" }}
              />
            </div>
            <div className="toolbar-divider-h" />
            <div className="toolbar-row secondary">
              <button
                className="toolbar-text-btn"
                onClick={() => setViewerScale(1)}
              >
                1:1
              </button>
              <button className="toolbar-text-btn" onClick={resetViewer}>
                {t("reset")}
              </button>
              <div className="toolbar-divider-v" />
              <IconButton
                className="toolbar-btn"
                onClick={() => setViewerRotation((r) => (r + 90) % 360)}
                icon={<RotateCcw size={16} />}
                style={{ background: "none", border: "none" }}
              />

              {/* Remove Image Button (Split Mode Only) */}
              {mode === "split" && splitSourceBitmap && onClearSplit && (
                <>
                  <div className="toolbar-divider-v" />
                  <IconButton
                    className="toolbar-btn"
                    onClick={onClearSplit}
                    icon={<Trash2 size={16} />}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ff453a",
                    }}
                    title={t("removeImage")}
                  />
                </>
              )}
            </div>
          </div>

          <div
            style={{
              transform: `translate(${viewerOffset.x}px, ${viewerOffset.y}px) scale(${viewerScale}) rotate(${viewerRotation}deg)`,
              transition: isPanning
                ? "none"
                : "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
              transformOrigin: "center center",
            }}
          >
            {mode === "split" ? (
              <SplitPreview
                source={splitSourceBitmap}
                blobs={splitBlobs}
                config={splitConfig}
                aspectRatio={
                  splitConfig.autoCropRatio ||
                  (splitSourceBitmap
                    ? splitSourceBitmap.width / splitSourceBitmap.height
                    : undefined)
                }
              />
            ) : previewUrl ? (
              <img
                src={previewUrl}
                className="viewer-image"
                style={{
                  width: `${canvasSize.width}px`,
                  height: `${canvasSize.height}px`,
                }}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
