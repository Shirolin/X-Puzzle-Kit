import { RefObject } from "preact";
import { useState, useRef } from "preact/hooks";
import { Plus, Minus, RotateCcw, Upload, Trash2 } from "lucide-preact";
import { t } from "../../core/i18n";
import { StitchTask, SplitConfig, ImageNode } from "../../core/types";
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
  handleTouchStart: (e: TouchEvent) => void;
  handleTouchMove: (e: TouchEvent) => void;
  handleTouchEnd: (e: TouchEvent) => void;
  handleDoubleClick: () => void;
  task: StitchTask;
  images: ImageNode[];
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
  onSplitFileSelect: (file: File) => void;
  onStitchFilesSelect: (files: FileList | File[]) => void;
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
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleDoubleClick,
  task,
  images,
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
  onSplitFileSelect,
  onStitchFilesSelect,
  onClearSplit,
}: ViewerAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only disable if we are strictly leaving the container, not entering a child
    // If relatedTarget is null, it means we left the window/document, so we should disable.
    if (
      !e.relatedTarget ||
      (e.currentTarget &&
        !(e.currentTarget as Node).contains(e.relatedTarget as Node))
    ) {
      setIsDragging(false);
    }
  };

  return (
    <div className="viewer-area">
      {(mode === "split" && !splitSourceBitmap) ||
      (mode === "stitch" && images.length === 0) ? (
        <div
          className="viewer-empty-state"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            if (!e.dataTransfer?.files?.length) return;
            if (mode === "split") {
              const file = e.dataTransfer.files[0];
              if (file && file.type.startsWith("image/")) {
                onSplitFileSelect(file);
              }
            } else {
              const files = Array.from(e.dataTransfer.files).filter((f) =>
                f.type.startsWith("image/"),
              );
              if (files.length) onStitchFilesSelect(files);
            }
          }}
        >
          <label
            className={`viewer-upload-box ${isDragging ? "dragging" : ""}`}
            style={
              isDragging
                ? {
                    borderColor: "var(--color-primary)",
                    backgroundColor: "rgba(var(--color-primary-rgb), 0.1)",
                    transform: "scale(1.02)",
                  }
                : {}
            }
          >
            <div className="upload-icon-container">
              <Upload size={32} strokeWidth={2.5} />
            </div>
            <div className="upload-tip">
              {mode === "split"
                ? t("selectImageTip")
                : t("selectImagesTip") || "Select images to stitch"}
            </div>
            <div className="upload-sub-tip">
              {t("dragAndDropTip") || "Or drag and drop images here"}
            </div>
            <input
              type="file"
              accept="image/*"
              multiple={mode === "stitch"}
              onChange={(e) => {
                const files = e.currentTarget.files;
                if (!files || files.length === 0) return;
                if (mode === "split") {
                  onSplitFileSelect(files[0]);
                } else {
                  onStitchFilesSelect(files);
                }
              }}
              style={{ display: "none" }}
            />
          </label>
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
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDblClick={handleDoubleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true); // Small hack: show feedback
            setTimeout(() => setIsDragging(false), 500);

            // Only process if it's external files
            if (!e.dataTransfer?.types.includes("Files")) return;
            if (!e.dataTransfer?.files?.length) return;
            onStitchFilesSelect(e.dataTransfer.files);
          }}
          onClick={(e) => {
            // If clicking the empty background area (not an image/badge)
            if (
              mode === "stitch" &&
              !previewUrl &&
              e.target === e.currentTarget
            ) {
              fileInputRef.current?.click();
            }
          }}
        >
          {/* Hidden Input for Canvas Click */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = e.currentTarget.files;
              if (files && files.length > 0) onStitchFilesSelect(files);
            }}
          />
          {/* Metadata Floating Badges */}
          <div className="floating-badge-container">
            {mode === "stitch" &&
              task.tweetId !== "external" &&
              task.tweetId !== "none" && (
                <a
                  href={`https://x.com/i/status/${task.tweetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="floating-badge badge-primary source-link"
                  title={t("openSourcePage") || "Open Source Page"}
                >
                  @{task.artistHandle} / x.com/{task.tweetId}
                </a>
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
            {(mode === "split" && splitSourceBitmap) ||
            (mode === "stitch" && canvasSize.width > 0) ? (
              <div className="floating-badge">
                {mode === "split"
                  ? `${splitSourceBitmap!.width} × ${splitSourceBitmap!.height} px`
                  : `${canvasSize.width} × ${canvasSize.height} px`}
              </div>
            ) : null}
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
          <div className="viewer-toolbar-v2 apple-blur">
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

              {/* Add Image Button (Stitch Mode) */}
              {mode === "stitch" && (
                <>
                  <div className="toolbar-divider-v" />
                  <IconButton
                    className="toolbar-btn"
                    onClick={() => fileInputRef.current?.click()}
                    icon={<Upload size={16} />}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--color-primary)",
                    }}
                    title={t("uploadImages")}
                  />
                </>
              )}

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
                draggable={false}
                style={{
                  width: `${canvasSize.width}px`,
                  height: `${canvasSize.height}px`,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                }}
              />
            ) : mode === "stitch" ? (
              <div
                className="flex-column-center"
                style={{
                  padding: "2rem",
                  borderRadius: "1rem",
                  background: "rgba(var(--color-surface-rgb), 0.5)",
                  backdropFilter: "blur(10px)",
                  border: "1px dashed var(--color-border)",
                  cursor: isGenerating ? "wait" : "pointer",
                }}
                onClick={() => !isGenerating && fileInputRef.current?.click()}
              >
                <Plus
                  size={32}
                  style={{
                    color: "var(--color-primary)",
                    marginBottom: "1rem",
                    opacity: isGenerating ? 0.5 : 1,
                  }}
                />
                <div style={{ color: "var(--color-text)", fontWeight: 600 }}>
                  {isGenerating
                    ? t("stitching") || "Stitching..."
                    : t("addMoreImages") || "Add more images"}
                </div>
                {!isGenerating && (
                  <div
                    style={{
                      color: "var(--color-text-muted)",
                      fontSize: "0.8rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    {t("dragAndDropTip") || "Or drag and drop here"}
                  </div>
                )}
              </div>
            ) : null}

            {/* Global Processing Spinner */}
            {isGenerating && previewUrl && (
              <div
                className="flex-column-center apple-blur"
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 10,
                  background: "rgba(var(--color-surface-rgb), 0.4)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <div className="flex-column-center gap-sm">
                  <div className="spinner-sm" />
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "var(--color-primary)",
                    }}
                  >
                    {t("stitching") || "Stitching..."}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
