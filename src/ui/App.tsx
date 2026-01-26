import { VNode, JSX } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import {
  BackgroundColor,
  ImageNode,
  LayoutType,
  StitchTask,
} from "../core/types";
import { stitchImages } from "../core/stitcher";
import { t, setLanguage } from "../core/i18n";
import {
  ChevronUp,
  ChevronDown,
  X,
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
  Images,
} from "lucide-preact";
import { SplitConfig } from "../core/types";
import { splitImage } from "../core/splitter";
import { SplitterControl } from "./components/SplitterControl";
import { SplitPreview } from "./components/SplitPreview";

interface AppProps {
  task: StitchTask;
  onClose: () => void;
}

export function App({ task, onClose }: AppProps) {
  const logoUrl = chrome.runtime.getURL("assets/icon-48.png");

  const [layout, setLayout] = useState<LayoutType>(task.layout);
  const [images, setImages] = useState<ImageNode[]>(task.userImages);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);

  // Split Mode State
  const [mode, setMode] = useState<"stitch" | "split">("stitch");
  const [splitSource, setSplitSource] = useState<File | null>(null);
  const [splitSourceBitmap, setSplitSourceBitmap] =
    useState<ImageBitmap | null>(null);
  const [splitBlobs, setSplitBlobs] = useState<Blob[]>([]);
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitConfig, setSplitConfig] = useState<SplitConfig>({
    layout: "GRID_2x2",
    rows: 2,
    cols: 2,
    gap: 0,
  });

  // Load split source image
  useEffect(() => {
    if (splitSource) {
      createImageBitmap(splitSource).then(setSplitSourceBitmap);
    }
  }, [splitSource]);

  const handleSplit = async (config: SplitConfig) => {
    if (!splitSourceBitmap) return;
    setIsSplitting(true);
    try {
      // 延迟一下让 UI 渲染 loading
      await new Promise((r) => setTimeout(r, 50));
      const blobs = await splitImage(splitSourceBitmap, config);
      setSplitBlobs(blobs);
    } catch (error) {
      console.error("Splitting failed:", error);
    } finally {
      setIsSplitting(false);
    }
  };

  const handleSplitFileSelect = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      setSplitSource(file);
      setSplitBlobs([]); // Clear previous results
    }
  };

  const [lang, setLang] = useState("auto");
  const [isLangLoaded, setIsLangLoaded] = useState(false);

  // 初始化加载设置
  useEffect(() => {
    chrome.storage.local
      .get({
        "x-puzzle-stitcher-lang": "auto",
        "x-puzzle-stitcher-format": task.outputFormat || "png",
        "x-puzzle-stitcher-bg": "transparent",
      })
      .then((res) => {
        setLang(res["x-puzzle-stitcher-lang"] as string);
        setOutputFormat(
          res["x-puzzle-stitcher-format"] as "png" | "jpg" | "webp",
        );
        setBackgroundColor(res["x-puzzle-stitcher-bg"] as BackgroundColor);

        setLanguage(res["x-puzzle-stitcher-lang"] as string).then(() => {
          setIsLangLoaded(true);
          setLoading(false);
        });
      });
  }, []);

  useEffect(() => {
    if (!isLangLoaded) return;
    setLoading(true);
    setLanguage(lang).then(() => {
      setLoading(false);
    });
    chrome.storage.local.set({ "x-puzzle-stitcher-lang": lang });
  }, [lang]);

  useEffect(() => {
    // 初始挂载后立即将准备状态设为完成（资源由 mountUI 预取）
    if (isLangLoaded) {
      setLoading(false);
    }
  }, [isLangLoaded]);
  const [outputFormat, setOutputFormat] = useState<"png" | "jpg" | "webp">(
    task.outputFormat || "png",
  );

  useEffect(() => {
    if (isLangLoaded) {
      chrome.storage.local.set({ "x-puzzle-stitcher-format": outputFormat });
    }
  }, [outputFormat, isLangLoaded]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [globalGap, setGlobalGap] = useState<number>(task.globalGap || 0);
  const [backgroundColor, setBackgroundColor] =
    useState<BackgroundColor>("transparent");

  useEffect(() => {
    if (isLangLoaded) {
      chrome.storage.local.set({ "x-puzzle-stitcher-bg": backgroundColor });
    }
  }, [backgroundColor, isLangLoaded]);
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  // Viewer State
  const [viewerScale, setViewerScale] = useState(1);
  const [viewerOffset, setViewerOffset] = useState({ x: 0, y: 0 });
  const [viewerRotation, setViewerRotation] = useState(0); // 0, 90, 180, 270
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const fitToScreen = () => {
    if (!containerRef.current || canvasSize.width === 0) return;

    const container = containerRef.current;
    const padding = 48; // 1.5rem * 16 * 2 (approx)
    const availableWidth = container.clientWidth - padding;
    const availableHeight = container.clientHeight - padding;

    const scaleX = availableWidth / canvasSize.width;
    const scaleY = availableHeight / canvasSize.height;
    const newScale = Math.min(scaleX, scaleY, 1); // 默认不放大超过 100%

    setViewerScale(newScale);
    setViewerOffset({ x: 0, y: 0 });
    setViewerRotation(0);
  };

  const resetViewer = (fit: boolean = true) => {
    if (fit) {
      fitToScreen();
    } else {
      setViewerScale(1);
      setViewerOffset({ x: 0, y: 0 });
      setViewerRotation(0);
    }
  };

  // 当画布尺寸变化（布局/图片变动）时，自动执行一次适配
  useEffect(() => {
    fitToScreen();
  }, [canvasSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      generatePreview();
    }, 400);
    return () => clearTimeout(timer);
  }, [layout, images, globalGap, backgroundColor]);

  const toggleVisibility = (index: number) => {
    const newImages = [...images];
    newImages[index] = {
      ...newImages[index],
      visible: !newImages[index].visible,
    };
    setImages(newImages);
  };

  const updateLocalGap = (index: number, gap: number) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], localGap: gap };
    setImages(newImages);
  };

  const generatePreview = async () => {
    setIsGenerating(true);
    // 给浏览器一帧的时间来渲染 Loading 遮罩
    await new Promise((resolve) => setTimeout(resolve, 50));
    try {
      const visibleImages = images.filter((img) => img.visible !== false);
      if (visibleImages.length === 0) {
        setPreviewUrl("");
        return;
      }
      const canvas = await stitchImages(
        visibleImages,
        layout,
        globalGap,
        backgroundColor,
      );
      setCanvasSize({ width: canvas.width, height: canvas.height });

      // 预览始终使用 png，以保证切换设置时的流畅度
      setPreviewUrl(canvas.toDataURL("image/png"));
    } catch (e) {
      console.error("Preview failed", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    [newImages[index], newImages[targetIndex]] = [
      newImages[targetIndex],
      newImages[index],
    ];
    setImages(newImages);
  };

  const onDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const onDragOver = (e: DragEvent, _index: number) => {
    e.preventDefault();
  };

  const onDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const newImages = [...images];
    const item = newImages.splice(draggedIndex, 1)[0];
    newImages.splice(index, 0, item);
    setImages(newImages);
    setDraggedIndex(null);
  };
  const onDragEnd = () => {
    setDraggedIndex(null);
  };

  // Viewer Handlers
  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setViewerScale((s) => Math.min(10, Math.max(0.1, s * delta)));
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      // Left click to pan
      setIsPanning(true);
      setPanStart({
        x: e.clientX - viewerOffset.x,
        y: e.clientY - viewerOffset.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isPanning) {
      setViewerOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleDoubleClick = () => {
    if (viewerScale < 1)
      resetViewer(false); // 从缩放模式跳到 1:1
    else resetViewer(true); // 从 1:1 或更大跳回到自适应
  };

  const download = async () => {
    setIsGenerating(true);
    // 给 UI 时间显示“处理中...”
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const visibleImages = images.filter((img) => img.visible !== false);
      const canvas = await stitchImages(
        visibleImages,
        layout,
        globalGap,
        backgroundColor,
      );

      let mime = "image/png";
      if (outputFormat === "jpg") mime = "image/jpeg";
      else if (outputFormat === "webp") mime = "image/webp";

      // 最终生成下载文件流
      const finalUrl = canvas.toDataURL(mime, 0.9);

      const now = new Date();
      const dateStr =
        now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, "0") +
        now.getDate().toString().padStart(2, "0");
      const timeStr =
        now.getHours().toString().padStart(2, "0") +
        now.getMinutes().toString().padStart(2, "0") +
        now.getSeconds().toString().padStart(2, "0");

      const safeTitle = task.pageTitle
        .replace(/[\\/:*?"<>|]/g, "_")
        .substring(0, 50);
      const fileName = `${safeTitle}_${dateStr}_${timeStr}.${outputFormat}`;

      const link = document.createElement("a");
      link.download = fileName;
      link.href = finalUrl;
      link.click();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "var(--color-overlay)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99999,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="card"
        style={{
          width: "860px",
          height: "85vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text)",
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "0.75rem 1rem",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <img
              src={logoUrl}
              style={{ width: "28px", height: "28px", flexShrink: 0 }}
              alt="Logo"
              title={t("appDesc")}
            />
            <div>
              <h2
                title={t("appDesc")}
                style={{
                  margin: 0,
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "var(--color-text)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  cursor: "help",
                }}
              >
                <span className="appName-text">{t("appName")}</span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 500,
                    color: "var(--color-primary)",
                    marginLeft: "0.25rem",
                    padding: "1px 6px",
                    backgroundColor: "rgba(29, 155, 240, 0.1)",
                    borderRadius: "4px",
                    letterSpacing: "0.02em",
                  }}
                >
                  {mode === "stitch" ? t("previewTitle") : "Splitter"}
                </span>
              </h2>
            </div>
          </div>

          {/* Mode Switcher */}
          <div
            style={{
              display: "flex",
              backgroundColor: "#F1F5F9",
              padding: "2px",
              borderRadius: "6px",
            }}
          >
            <button
              onClick={() => setMode("stitch")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                fontSize: "12px",
                fontWeight: 600,
                border: "none",
                borderRadius: "4px",
                backgroundColor: mode === "stitch" ? "white" : "transparent",
                color: mode === "stitch" ? "var(--color-primary)" : "#64748B",
                boxShadow:
                  mode === "stitch" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                cursor: "pointer",
              }}
            >
              <Images size={14} />
              <span>Stitch</span>
            </button>
            <button
              onClick={() => setMode("split")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                fontSize: "12px",
                fontWeight: 600,
                border: "none",
                borderRadius: "4px",
                backgroundColor: mode === "split" ? "white" : "transparent",
                color: mode === "split" ? "var(--color-primary)" : "#64748B",
                boxShadow:
                  mode === "split" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                cursor: "pointer",
              }}
            >
              <Scissors size={14} />
              <span>Split</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="btn-ghost"
            style={{
              width: "32px",
              height: "32px",
              padding: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              transition: "all var(--transition-fast)",
              outline: "none",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "rgba(239, 68, 68, 0.1)";
              (e.currentTarget as HTMLButtonElement).style.color = "#EF4444";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--color-text-muted)";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Split Preview Area */}
          {mode === "split" && (
            <div
              style={{
                flex: 1,
                backgroundColor: "#0F172A",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "1.5rem",
                overflow: "hidden",
                flexDirection: "column",
              }}
            >
              {!splitSourceBitmap ? (
                <div
                  style={{
                    color: "#94A3B8",
                    textAlign: "center",
                    border: "2px dashed #334155",
                    borderRadius: "12px",
                    padding: "3rem",
                  }}
                >
                  <div style={{ marginBottom: "1rem", fontWeight: 500 }}>
                    Select an image to split
                  </div>
                  <label
                    style={{
                      display: "inline-block",
                      padding: "8px 16px",
                      backgroundColor: "var(--color-primary)",
                      color: "white",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSplitFileSelect}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Result Blobs */}
                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      paddingBottom: "1rem",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <SplitPreview blobs={splitBlobs} />
                  </div>
                  {/* Source Info Small */}
                  <div
                    style={{
                      padding: "8px",
                      backgroundColor: "rgba(30, 41, 59, 0.5)",
                      borderRadius: "8px",
                      marginTop: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "12px",
                      color: "#94A3B8",
                    }}
                  >
                    <span>Source: {splitSource?.name}</span>
                    <button
                      onClick={() => {
                        setSplitSource(null);
                        setSplitBlobs([]);
                        setSplitSourceBitmap(null);
                      }}
                      style={{
                        marginLeft: "auto",
                        background: "none",
                        border: "none",
                        color: "#EF4444",
                        cursor: "pointer",
                      }}
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Left: Preview Area */}
          <div
            ref={containerRef}
            style={{
              flex: 1,
              backgroundColor: "#0F172A",
              display: mode === "stitch" ? "flex" : "none",
              justifyContent: "center",
              alignItems: "center",
              padding: "1.5rem",
              overflow: "hidden",
              position: "relative",
              cursor: isPanning ? "grabbing" : "grab",
            }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDblClick={handleDoubleClick}
          >
            {isGenerating && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 100,
                  backgroundColor: "rgba(15, 23, 42, 0.6)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                  color: "white",
                  transition: "all 0.3s",
                  pointerEvents: "none",
                }}
              >
                <div className="spinner"></div>
                <div style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                  {t("stitching")}
                </div>
              </div>
            )}

            {/* Viewer Toolbar */}
            <div
              style={{
                position: "absolute",
                bottom: "1.25rem",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 30,
                display: "flex",
                alignItems: "center",
                gap: "4px",
                backgroundColor: "rgba(30, 41, 59, 0.82)",
                padding: "6px 12px",
                borderRadius: "30px",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                width: "max-content",
                maxWidth: "calc(100% - 2rem)",
                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
              className="viewer-toolbar no-scrollbar"
            >
              {/* Group 1: Zoom Controls */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "2px" }}
              >
                <IconButton
                  onClick={() => setViewerScale((s) => Math.max(0.1, s - 0.1))}
                  icon={<Minus size={14} color="white" />}
                  style={{
                    padding: "6px",
                    backgroundColor: "transparent",
                    border: "none",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    color: "white",
                    minWidth: "40px",
                    textAlign: "center",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  {Math.round(viewerScale * 100)}%
                </span>
                <IconButton
                  onClick={() => setViewerScale((s) => Math.min(10, s + 0.1))}
                  icon={<Plus size={14} color="white" />}
                  style={{
                    padding: "6px",
                    backgroundColor: "transparent",
                    border: "none",
                    flexShrink: 0,
                  }}
                />
              </div>

              <div
                className="toolbar-sep"
                style={{
                  width: "1px",
                  height: "14px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  margin: "0 4px",
                }}
              ></div>

              {/* Group 2: Action Controls */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <button
                  onClick={() => setViewerScale(1)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "white",
                    fontSize: "10px",
                    cursor: "pointer",
                    opacity: viewerScale === 1 ? 0.5 : 1,
                    padding: "4px 6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  1:1
                </button>
                <button
                  onClick={() => resetViewer()}
                  style={{
                    background: "none",
                    border: "none",
                    color: "white",
                    fontSize: "10px",
                    cursor: "pointer",
                    padding: "4px 6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("reset")}
                </button>
                <div
                  style={{
                    width: "1px",
                    height: "14px",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    margin: "0 4px",
                  }}
                ></div>
                <IconButton
                  onClick={() => setViewerRotation((r) => (r + 90) % 360)}
                  icon={
                    <RotateCcw
                      size={14}
                      color="white"
                      style={{ transform: "scaleX(-1)" }}
                    />
                  }
                  style={{
                    padding: "6px",
                    backgroundColor: "transparent",
                    border: "none",
                    flexShrink: 0,
                  }}
                />
              </div>
            </div>

            {previewUrl && (
              <div
                className="preview-badges"
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  zIndex: 10,
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                <div
                  style={{
                    backgroundColor: "rgba(30, 41, 59, 0.7)",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.7rem",
                    fontWeight: 500,
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{ color: "var(--color-primary)", fontWeight: 700 }}
                  >
                    @{task.artistHandle}
                  </span>
                  <span
                    className="badge-sep"
                    style={{
                      opacity: 0.3,
                      width: "1px",
                      height: "10px",
                      backgroundColor: "white",
                    }}
                  ></span>
                  <span
                    className="badge-id"
                    style={{ opacity: 0.5, fontSize: "0.65rem" }}
                  >
                    {task.tweetId}
                  </span>
                </div>
                <div
                  style={{
                    backgroundColor: "rgba(0,0,0,0.6)",
                    color: "white",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                    backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {canvasSize.width} × {canvasSize.height} PX
                </div>
              </div>
            )}

            {loading ? (
              <div
                style={{
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div className="spinner"></div>
                <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                  {t("preparingHighRes")}
                </span>
              </div>
            ) : (
              <div
                style={{
                  position: "relative",
                  // 取消 CSS 自动缩放限制，完全交给 viewerScale 处理
                  transform: `translate(${viewerOffset.x}px, ${viewerOffset.y}px) scale(${viewerScale}) rotate(${viewerRotation}deg)`,
                  transition: isPanning
                    ? "none"
                    : "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
                  transformOrigin: "center center",
                }}
              >
                <img
                  src={previewUrl}
                  draggable={false}
                  style={{
                    // 显式指定原始尺寸作为基准
                    width: `${canvasSize.width}px`,
                    height: `${canvasSize.height}px`,
                    display: "block",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    opacity: isGenerating ? 0.3 : 1,
                    transition: "opacity 0.2s",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                />
              </div>
            )}
          </div>

          {/* Split Sidebar */}
          {mode === "split" && (
            <div
              style={{
                width: "260px",
                borderLeft: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "var(--color-background)",
                padding: "1rem",
              }}
            >
              <SplitterControl
                onConfigChange={(cfg) => setSplitConfig(cfg)}
                onSplit={() => handleSplit(splitConfig)}
                isProcessing={isSplitting}
              />
            </div>
          )}

          {/* Right: Sidebar Controls */}
          <div
            style={{
              width: "260px",
              borderLeft: "1px solid var(--color-border)",
              display: mode === "stitch" ? "flex" : "none",
              flexDirection: "column",
              backgroundColor: "var(--color-background)",
            }}
          >
            <div style={{ padding: "1rem", flex: 1, overflowY: "auto" }}>
              <section style={{ marginBottom: "1rem" }}>
                <h3
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "var(--color-text)",
                  }}
                >
                  {t("layoutScheme")}
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "0.35rem",
                  }}
                >
                  <LayoutButton
                    active={layout === "GRID_2x2"}
                    onClick={() => setLayout("GRID_2x2")}
                    icon={<LayoutGrid size={16} />}
                    label={t("layoutGrid")}
                  />
                  <LayoutButton
                    active={layout === "T_SHAPE_3"}
                    onClick={() => setLayout("T_SHAPE_3")}
                    icon={<Layout size={16} />}
                    label={t("layoutTShape")}
                  />
                  <LayoutButton
                    active={layout === "HORIZONTAL_Nx1"}
                    onClick={() => setLayout("HORIZONTAL_Nx1")}
                    icon={<Columns size={16} />}
                    label={t("layoutHorizontal")}
                  />
                  <LayoutButton
                    active={layout === "VERTICAL_1xN"}
                    onClick={() => setLayout("VERTICAL_1xN")}
                    icon={<Rows size={16} />}
                    label={t("layoutVertical")}
                  />
                </div>
              </section>

              <section style={{ marginBottom: "1.25rem" }}>
                <h3
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    marginBottom: "0.75rem",
                    color: "var(--color-text)",
                  }}
                >
                  {t("exportSettings")}
                </h3>
                <div style={{ marginBottom: "0.5rem" }}>
                  <div
                    style={{
                      display: "flex",
                      backgroundColor: "white",
                      borderRadius: "var(--radius-md)",
                      padding: "3px",
                      border: "1px solid var(--color-border)",
                      gap: "2px",
                    }}
                  >
                    {["PNG", "JPG", "WEBP"].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => {
                          const newFmt = fmt.toLowerCase() as
                            | "png"
                            | "jpg"
                            | "webp";
                          setOutputFormat(newFmt);
                          if (
                            newFmt === "jpg" &&
                            backgroundColor === "transparent"
                          ) {
                            setBackgroundColor("white");
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: "6px",
                          border: "none",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor:
                            outputFormat === fmt.toLowerCase()
                              ? "var(--color-primary)"
                              : "transparent",
                          color:
                            outputFormat === fmt.toLowerCase()
                              ? "white"
                              : "var(--color-text)",
                          fontSize: "10px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--color-text-muted)",
                      fontWeight: 500,
                    }}
                  >
                    {t("backgroundColor")}:
                  </span>
                  <div
                    style={{
                      display: "flex",
                      backgroundColor: "white",
                      borderRadius: "var(--radius-md)",
                      padding: "3px",
                      border: "1px solid var(--color-border)",
                      gap: "2px",
                      flex: 1,
                    }}
                  >
                    {(["transparent", "white", "black"] as const).map((bg) => (
                      <button
                        key={bg}
                        disabled={
                          outputFormat === "jpg" && bg === "transparent"
                        }
                        onClick={() => setBackgroundColor(bg)}
                        style={{
                          flex: 1,
                          padding: "4px",
                          border: "none",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor:
                            backgroundColor === bg
                              ? "var(--color-secondary)"
                              : "transparent",
                          color:
                            backgroundColor === bg
                              ? "white"
                              : "var(--color-text)",
                          fontSize: "9px",
                          fontWeight: "600",
                          cursor:
                            outputFormat === "jpg" && bg === "transparent"
                              ? "not-allowed"
                              : "pointer",
                          transition: "all 0.2s",
                          opacity:
                            outputFormat === "jpg" && bg === "transparent"
                              ? 0.3
                              : 1,
                        }}
                      >
                        {bg === "transparent"
                          ? t("transparent")
                          : bg === "white"
                            ? t("white")
                            : t("black")}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginTop: "0.75rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--color-text-muted)",
                      fontWeight: 500,
                    }}
                  >
                    {t("language")}:
                  </span>
                  <select
                    value={lang}
                    onChange={(e) =>
                      setLang((e.target as HTMLSelectElement).value)
                    }
                    style={{
                      flex: 1,
                      padding: "4px 6px",
                      fontSize: "9px",
                      fontWeight: "600",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "white",
                      color: "var(--color-text)",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="auto">Auto (Browser)</option>
                    <option value="zh_CN">简体中文</option>
                    <option value="zh_TW">繁體中文</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
              </section>

              <section style={{ marginBottom: "1.25rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      margin: 0,
                      color: "var(--color-text)",
                    }}
                  >
                    {t("globalGap")}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "white",
                        border: "1px solid var(--color-border)",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <button
                        onClick={() =>
                          setGlobalGap(Math.max(-20, globalGap - 1))
                        }
                        style={{
                          padding: "2px 4px",
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          display: "flex",
                          borderRight: "1px solid var(--color-border)",
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        value={globalGap}
                        onChange={(e) => {
                          let val = parseInt(
                            (e.target as HTMLInputElement).value,
                          );
                          if (isNaN(val)) return;
                          if (val < -20) val = -20;
                          if (val > 100) val = 100;
                          setGlobalGap(val);
                        }}
                        className="hide-arrows"
                        style={{
                          width: "32px",
                          height: "22px",
                          fontSize: "11px",
                          border: "none",
                          outline: "none",
                          textAlign: "center",
                          backgroundColor: "transparent",
                          fontWeight: "bold",
                          color: "var(--color-primary)",
                          display: "block",
                        }}
                      />
                      <button
                        onClick={() =>
                          setGlobalGap(Math.min(100, globalGap + 1))
                        }
                        style={{
                          padding: "2px 4px",
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          display: "flex",
                          borderLeft: "1px solid var(--color-border)",
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => setGlobalGap(0)}
                      title={t("resetToZero")}
                      style={{
                        padding: "4px",
                        border: "none",
                        background: "rgba(0,0,0,0.05)",
                        borderRadius: "4px",
                        cursor: "pointer",
                        display: "flex",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "rgba(0,0,0,0.1)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "rgba(0,0,0,0.05)")
                      }
                    >
                      <RotateCcw size={12} color="var(--color-text-muted)" />
                    </button>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-text-muted)",
                        marginLeft: "2px",
                      }}
                    >
                      px
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="100"
                  value={globalGap}
                  onChange={(e) =>
                    setGlobalGap(parseInt((e.target as HTMLInputElement).value))
                  }
                  className="gap-slider"
                />
              </section>

              <section>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      margin: 0,
                      color: "var(--color-text)",
                    }}
                  >
                    {t("imageSorting")}
                  </h3>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--color-text-muted)",
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
                      className="image-item"
                      draggable
                      onDragStart={() => onDragStart(idx)}
                      onDragOver={(e) => onDragOver(e, idx)}
                      onDrop={() => onDrop(idx)}
                      onDragEnd={onDragEnd}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.4rem",
                        padding: "0.625rem",
                        backgroundColor: "white",
                        border: "1px solid #F1F5F9", // 使用极浅边框
                        borderRadius: "var(--radius-md)",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        opacity: draggedIndex === idx ? 0.3 : 1,
                        position: "relative",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6rem",
                        }}
                      >
                        {/* Drag Handle */}
                        <div
                          title="按住拖拽排序"
                          style={{
                            cursor: "grab",
                            color: "#94A3B8",
                            display: "flex",
                            alignItems: "center",
                            opacity: 0.6,
                          }}
                        >
                          <GripVertical size={14} />
                        </div>

                        {/* Thumbnail */}
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <img
                            src={img.thumbnailUrl}
                            style={{
                              width: "42px",
                              height: "42px",
                              objectFit: "cover",
                              borderRadius: "var(--radius-sm)",
                              border: "1px solid #F1F5F9",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: "-6px",
                              left: "-6px",
                              minWidth: "18px",
                              height: "18px",
                              padding: "0 4px",
                              backgroundColor: "var(--color-primary)", // 恢复蓝色 Badge
                              color: "white",
                              fontSize: "10px",
                              fontWeight: "bold",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              borderRadius: "50%",
                              border: "2px solid white",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                              pointerEvents: "none",
                            }}
                          >
                            {idx + 1}
                          </div>
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              color:
                                img.visible !== false ? "#1E293B" : "#94A3B8",
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              textDecoration:
                                img.visible !== false ? "none" : "line-through",
                            }}
                          >
                            {img.name ||
                              `${t("imageLabel")} ${parseInt(img.id) + 1}`}
                          </div>
                        </div>

                        {/* Actions */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0px",
                            }}
                          >
                            <button
                              title={t("moveUp")}
                              onClick={() => moveImage(idx, "up")}
                              disabled={idx === 0}
                              style={{
                                border: "none",
                                background: "none",
                                padding: "2px",
                                cursor: idx === 0 ? "not-allowed" : "pointer",
                                color: "#94A3B8",
                                opacity: idx === 0 ? 0.2 : 0.6,
                              }}
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              title={t("moveDown")}
                              onClick={() => moveImage(idx, "down")}
                              disabled={idx === images.length - 1}
                              style={{
                                border: "none",
                                background: "none",
                                padding: "2px",
                                cursor:
                                  idx === images.length - 1
                                    ? "not-allowed"
                                    : "pointer",
                                color: "#94A3B8",
                                opacity: idx === images.length - 1 ? 0.2 : 0.6,
                              }}
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>
                          <button
                            title={
                              img.visible !== false
                                ? t("hideImage")
                                : t("showImage")
                            }
                            onClick={() => toggleVisibility(idx)}
                            style={{
                              border: "none",
                              background: "none",
                              padding: "6px",
                              cursor: "pointer",
                              color:
                                img.visible === false ? "#EF4444" : "#64748B",
                              opacity: img.visible === false ? 0.8 : 0.6,
                            }}
                          >
                            {img.visible !== false ? (
                              <Eye size={16} />
                            ) : (
                              <EyeOff size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      {img.visible !== false && idx < images.length - 1 && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingTop: "0.4rem",
                            borderTop: "1px solid #F8FAFC",
                            marginTop: "0.2rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.65rem",
                                color: "#94A3B8",
                                fontWeight: "500",
                              }}
                            >
                              {t("afterGap")}
                            </span>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: "#F8FAFC",
                                border: "1px solid #E2E8F0",
                                borderRadius: "6px",
                                overflow: "hidden",
                              }}
                            >
                              <button
                                title={t("decreaseGap")}
                                onClick={() =>
                                  updateLocalGap(
                                    idx,
                                    Math.max(-20, (img.localGap || 0) - 1),
                                  )
                                }
                                style={{
                                  border: "none",
                                  background: "none",
                                  cursor: "pointer",
                                  padding: "2px 6px",
                                  color: "#64748B",
                                  display: "flex",
                                }}
                              >
                                <Minus size={10} />
                              </button>
                              <input
                                type="number"
                                value={img.localGap || 0}
                                onChange={(e) => {
                                  let val = parseInt(
                                    (e.target as HTMLInputElement).value || "0",
                                  );
                                  if (val < -20) val = -20;
                                  if (val > 100) val = 100;
                                  updateLocalGap(idx, val);
                                }}
                                className="hide-arrows"
                                style={{
                                  width: "32px",
                                  height: "18px",
                                  fontSize: "11px",
                                  border: "none",
                                  outline: "none",
                                  textAlign: "center",
                                  backgroundColor: "transparent",
                                  fontWeight: "700",
                                  color: "var(--color-primary)",
                                }}
                              />
                              <button
                                title={t("increaseGap")}
                                onClick={() =>
                                  updateLocalGap(
                                    idx,
                                    Math.min(100, (img.localGap || 0) + 1),
                                  )
                                }
                                style={{
                                  border: "none",
                                  background: "none",
                                  cursor: "pointer",
                                  padding: "2px 6px",
                                  color: "#64748B",
                                  display: "flex",
                                }}
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.625rem",
                                color: "#94A3B8",
                                fontWeight: "500",
                              }}
                            >
                              {t("gapLabel")}{" "}
                              <span
                                style={{
                                  color: "var(--color-primary)",
                                  fontWeight: "700",
                                }}
                              >
                                {globalGap + (img.localGap || 0)}px
                              </span>
                            </span>
                            {(img.localGap || 0) !== 0 && (
                              <button
                                title={t("resetLocalGap")}
                                onClick={() => updateLocalGap(idx, 0)}
                                style={{
                                  border: "none",
                                  background: "none",
                                  cursor: "pointer",
                                  padding: "2px",
                                  color: "#94A3B8",
                                  display: "flex",
                                }}
                              >
                                <RotateCcw size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Footer Actions */}
            <div
              style={{
                padding: "1rem",
                borderTop: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
              }}
            >
              <button
                onClick={download}
                disabled={isGenerating || loading || !previewUrl}
                className="btn btn-cta"
                style={{
                  width: "100%",
                  height: "3rem",
                  fontSize: "0.875rem",
                  boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
                }}
              >
                {isGenerating ? (
                  <>
                    <div
                      className="spinner"
                      style={{
                        width: "18px",
                        height: "18px",
                        borderTopColor: "white",
                      }}
                    ></div>
                    <span>{t("processing")}</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>{t("stitchAndDownload")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .number-input::-webkit-inner-spin-button,
        .number-input::-webkit-outer-spin-button,
        .hide-arrows::-webkit-inner-spin-button,
        .hide-arrows::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .hide-arrows {
          -moz-appearance: textfield;
        }
        .image-item:hover {
          border-color: var(--color-primary);
          transform: translateX(4px);
          background-color: #f0f9ff !important;
        }
        .image-item:active {
          cursor: grabbing;
        }
        .gap-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 18px; /* 增加高度以便容纳 thumb 而不溢出 */
          background: transparent;
          outline: none;
          cursor: pointer;
          margin: 0;
          padding: 0;
          border: none;
        }
        /* Track */
        .gap-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 6px;
          cursor: pointer;
          background: #E2E8F0;
          border-radius: 3px;
          border: none;
        }
        .gap-slider::-moz-range-track {
          width: 100%;
          height: 6px;
          cursor: pointer;
          background: #E2E8F0;
          border-radius: 3px;
          border: none;
        }
        /* Thumb */
        .gap-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: var(--color-primary);
          cursor: pointer;
          margin-top: -6px; /* (TrackHeight/2) - (ThumbHeight/2) = 3 - 9 = -6 */
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
          transition: all 0.2s;
        }
        .gap-slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: var(--color-primary);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
          transition: all 0.2s;
        }
        .gap-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.5);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
          user-select: none;
        }

        /* Responsive Fixes */
        @media (max-width: 640px) {
          .badge-id, .badge-sep {
            display: none;
          }
          .preview-badges {
            top: 0.5rem !important;
            right: 0.5rem !important;
          }
          .appName-text {
            display: none;
          }
          .viewer-toolbar {
            flex-direction: column !important;
            border-radius: 18px !important;
            padding: 10px 6px !important;
            left: unset !important;
            right: 0.75rem !important;
            transform: none !important;
            bottom: 0.75rem !important;
            gap: 12px !important;
            background-color: rgba(30, 41, 59, 0.92) !important;
            border: 1px solid rgba(255,255,255,0.08) !important;
          }
          .toolbar-sep {
            height: 1px !important;
            width: 16px !important;
            margin: 0 !important;
            opacity: 0.4 !important;
          }
        }
      `}</style>
    </div>
  );
}

interface LayoutButtonProps {
  active: boolean;
  onClick: () => void;
  icon: VNode;
  label: string;
}

function LayoutButton({ active, onClick, icon, label }: LayoutButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.6rem 0.4rem",
        borderRadius: "var(--radius-lg)",
        border: active
          ? "2px solid var(--color-primary)"
          : "1px solid var(--color-border)",
        backgroundColor: active
          ? "rgba(59, 130, 246, 0.05)"
          : "var(--color-surface)",
        cursor: "pointer",
        color: active ? "var(--color-primary)" : "var(--color-text)",
        transition: "all var(--transition-fast)",
        fontWeight: active ? "700" : "400",
        boxShadow: active ? "0 4px 12px rgba(59, 130, 246, 0.15)" : "none",
      }}
    >
      <div style={{ opacity: active ? 1 : 0.6 }}>{icon}</div>
      <span style={{ fontSize: "0.7rem" }}>{label}</span>
    </button>
  );
}

interface IconButtonProps {
  onClick: () => void;
  disabled?: boolean;
  icon: VNode;
  style?: JSX.CSSProperties;
  title?: string;
}

function IconButton({
  onClick,
  disabled,
  icon,
  style = {},
  title,
}: IconButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      title={title}
      style={{
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-surface)",
        borderRadius: "var(--radius-sm)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.3 : 1,
        padding: "0.375rem",
        display: "flex",
        color: "var(--color-text)",
        transition: "all var(--transition-fast)",
        ...style,
      }}
      className="icon-btn-hover"
    >
      {icon}
    </button>
  );
}
