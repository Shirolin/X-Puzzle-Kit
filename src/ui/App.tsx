import { useState, useEffect, useRef } from "preact/hooks";
import {
  BackgroundColor,
  ImageNode,
  LayoutType,
  StitchTask,
  SplitConfig,
} from "../core/types";
import { stitchImages } from "../core/stitcher";
import { t, setLanguage } from "../core/i18n";
import { X, Images, Sun, Moon, Monitor, Scissors } from "lucide-preact";
import { splitImage } from "../core/splitter";
import { IconButton } from "./components/Common";
import { Sidebar } from "./components/Sidebar";
import { ViewerArea } from "./components/ViewerArea";

interface AppProps {
  task: StitchTask;
  onClose: () => void;
  initialMode?: "stitch" | "split";
  initialSplitImageUrl?: string;
  isPopup?: boolean;
}

const STORAGE_KEYS = {
  LANG: "x-puzzle-kit-lang",
  FORMAT: "x-puzzle-kit-format",
  BG: "x-puzzle-kit-bg",
  THEME: "x-puzzle-kit-theme",
  SPLIT_OPTIONS: "x-puzzle-kit-split-options",
};

export function App({
  task,
  onClose,
  initialMode = "stitch",
  initialSplitImageUrl,
  isPopup = false,
}: AppProps) {
  const logoUrl = chrome.runtime.getURL("assets/icon-48.png");

  const [layout, setLayout] = useState<LayoutType>(task.layout);
  const [images, setImages] = useState<ImageNode[]>(() =>
    task.userImages.map((img, i) => ({
      ...img,
      originalIndex: img.originalIndex ?? i + 1,
    })),
  );
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Split Mode State
  const [mode, setMode] = useState<"stitch" | "split">(initialMode);
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
    format: "png",
  });
  const [isZip, setIsZip] = useState(false);
  const [isTwitterOptimized, setIsTwitterOptimized] = useState(false);

  // Persistence and Language
  const [lang, setLang] = useState("auto");
  const [isLangLoaded, setIsLangLoaded] = useState(false);
  const [outputFormat, setOutputFormat] = useState<"png" | "jpg" | "webp">(
    "png",
  );
  const [backgroundColor, setBackgroundColor] =
    useState<BackgroundColor>("transparent");
  const [globalGap, setGlobalGap] = useState<number>(task.globalGap || 0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Theme State
  const [theme, setTheme] = useState<"auto" | "light" | "dark">("auto");
  const [isThemeDark, setIsThemeDark] = useState(true);

  // Load Settings
  useEffect(() => {
    chrome.storage.local
      .get({
        [STORAGE_KEYS.LANG]: "auto",
        [STORAGE_KEYS.FORMAT]: "png",
        [STORAGE_KEYS.BG]: "transparent",
        [STORAGE_KEYS.THEME]: "auto",
        [STORAGE_KEYS.SPLIT_OPTIONS]: null,
      })
      .then((res) => {
        setLang(res[STORAGE_KEYS.LANG] as string);
        setOutputFormat(res[STORAGE_KEYS.FORMAT] as "png" | "jpg" | "webp");
        setBackgroundColor(res[STORAGE_KEYS.BG] as BackgroundColor);
        setTheme(res[STORAGE_KEYS.THEME] as "auto" | "light" | "dark");

        const splitOpts = res[STORAGE_KEYS.SPLIT_OPTIONS] as {
          format?: "png" | "jpg" | "webp";
          isZip?: boolean;
          isTwitterOptimized?: boolean;
        } | null;
        if (splitOpts) {
          if (splitOpts.format) {
            setSplitConfig((prev) => ({ ...prev, format: splitOpts.format }));
          }
          if (typeof splitOpts.isZip === "boolean") setIsZip(splitOpts.isZip);
          if (typeof splitOpts.isTwitterOptimized === "boolean")
            setIsTwitterOptimized(splitOpts.isTwitterOptimized);
        }

        setLanguage(res[STORAGE_KEYS.LANG] as string)
          .then(() => {
            setIsLangLoaded(true);
            setLoading(false);
          })
          .catch((err) => {
            console.error("Failed to load language:", err);
            // Fallback to ensure we still save future settings even if lang load fails partially
            setIsLangLoaded(true);
            setLoading(false);
          });
      })
      .catch((err) => {
        console.error("Failed to load settings from storage:", err);
        // Even if storage load fails, we should enable UI
        setLanguage("auto").finally(() => {
          setIsLangLoaded(true);
          setLoading(false);
        });
      });
  }, []);

  // Save Settings
  useEffect(() => {
    if (!isLangLoaded) return;

    const settingsToSave = {
      [STORAGE_KEYS.LANG]: lang,
      [STORAGE_KEYS.FORMAT]: outputFormat,
      [STORAGE_KEYS.BG]: backgroundColor,
      [STORAGE_KEYS.THEME]: theme,
      [STORAGE_KEYS.SPLIT_OPTIONS]: {
        format: splitConfig.format,
        isZip,
        isTwitterOptimized,
      },
    };

    chrome.storage.local.set(settingsToSave).catch((err) => {
      console.error("Failed to save settings:", err);
    });
  }, [
    lang,
    outputFormat,
    backgroundColor,
    splitConfig.format,
    isZip,
    isTwitterOptimized,
    isLangLoaded,
    theme,
  ]);

  // Sync isThemeDark with theme and system preference
  useEffect(() => {
    const checkDark = () => {
      if (theme === "auto") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      return theme === "dark";
    };

    setIsThemeDark(checkDark());

    if (theme === "auto") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = (e: MediaQueryListEvent) => setIsThemeDark(e.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, [theme]);

  const lastLoadedUrlRef = useRef<string | null>(null);

  // Load split source image
  useEffect(() => {
    let active = true;
    if (splitSource) {
      setLoading(true);
      createImageBitmap(splitSource)
        .then((bitmap) => {
          if (!active) return;
          setSplitSourceBitmap(bitmap);
          if (mode === "split") {
            // Small timeout to ensure state update before fitToScreen
            setTimeout(fitToScreen, 0);
          }
          setLoading(false);
        })
        .catch((err) => {
          if (!active) return;
          console.error("Failed to load image bitmap:", err);
          // alert("Failed to load image. Please try another file.");
          setSplitSource(null);
          setLoading(false);
        });
    } else if (
      initialSplitImageUrl &&
      !splitSourceBitmap &&
      lastLoadedUrlRef.current !== initialSplitImageUrl
    ) {
      // Handle initial image from context menu
      // Only load if we haven't loaded this specific URL yet (prevents reloading after clear)
      lastLoadedUrlRef.current = initialSplitImageUrl;
      setLoading(true);
      chrome.runtime.sendMessage(
        { type: "FETCH_IMAGE", url: initialSplitImageUrl },
        async (response) => {
          if (response && response.dataUrl) {
            try {
              const res = await fetch(response.dataUrl);
              const blob = await res.blob();
              const file = new File([blob], "split_image.png", {
                type: blob.type,
              });
              setSplitSource(file); // This will trigger the effect above
            } catch (e) {
              console.error(e);
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
        },
      );
    } else {
      setSplitSourceBitmap(null);
    }
    return () => {
      active = false;
    };
  }, [splitSource, initialSplitImageUrl]);

  // Preview Generation for Stitch
  useEffect(() => {
    const timer = setTimeout(() => generatePreview(), 400);
    return () => clearTimeout(timer);
  }, [layout, images, globalGap, backgroundColor]);

  // Viewer State
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [viewerScale, setViewerScale] = useState(1);
  const [viewerOffset, setViewerOffset] = useState({ x: 0, y: 0 });
  const [viewerRotation, setViewerRotation] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const fitToScreen = () => {
    if (
      !containerRef.current ||
      (mode === "stitch" && canvasSize.width === 0) ||
      (mode === "split" && !splitSourceBitmap)
    )
      return;

    const cw = mode === "split" ? splitSourceBitmap!.width : canvasSize.width;
    const ch = mode === "split" ? splitSourceBitmap!.height : canvasSize.height;

    const padding = 48; // Standard padding from high-quality version
    const availableWidth = containerRef.current.clientWidth - padding;
    const availableHeight = containerRef.current.clientHeight - padding;
    const scale = Math.min(availableWidth / cw, availableHeight / ch, 1);

    setViewerScale(scale);
    setViewerOffset({ x: 0, y: 0 });
    setViewerRotation(0);
  };

  useEffect(() => {
    const runRefit = () => {
      fitToScreen();
    };
    runRefit();
    window.addEventListener("resize", runRefit);
    return () => window.removeEventListener("resize", runRefit);
  }, [canvasSize, mode, splitSourceBitmap]);

  const resetViewer = () => fitToScreen();

  // Handlers
  const handleSplit = async (config: SplitConfig) => {
    if (!splitSourceBitmap) return;
    setIsSplitting(true);
    try {
      await new Promise((r) => setTimeout(r, 50));
      const blobs = await splitImage(splitSourceBitmap, config);
      setSplitBlobs(blobs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSplitting(false);
    }
  };

  const handleSplitFileSelect = (file: File) => {
    if (file) {
      setSplitSource(file);
      setSplitBlobs([]);
    }
  };

  const generatePreview = async () => {
    setIsGenerating(true);
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
      setPreviewUrl(canvas.toDataURL("image/png"));
      // Human-perception delay as requested
      await new Promise((r) => setTimeout(r, 50));
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStitch = async () => {
    setIsGenerating(true);
    try {
      const visibleImages = images.filter((img) => img.visible !== false);
      const canvas = await stitchImages(
        visibleImages,
        layout,
        globalGap,
        backgroundColor,
      );
      const mime =
        outputFormat === "jpg"
          ? "image/jpeg"
          : outputFormat === "webp"
            ? "image/webp"
            : "image/png";
      const url = canvas.toDataURL(mime, 0.9);
      const a = document.createElement("a");
      a.download = `${task.pageTitle.replace(/[\\/:*?"<>|]/g, "_")}_${new Date().getTime()}.${outputFormat}`;
      a.href = url;
      a.click();
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleVisibility = (idx: number) => {
    const newImages = [...images];
    newImages[idx] = { ...newImages[idx], visible: !newImages[idx].visible };
    setImages(newImages);
  };

  const updateLocalGap = (idx: number, gap: number) => {
    const newImages = [...images];
    newImages[idx] = { ...newImages[idx], localGap: gap };
    setImages(newImages);
  };

  const onDragStart = (idx: number) => setDraggedIndex(idx);
  const onDragOver = (e: DragEvent, _idx: number) => e.preventDefault();
  const onDrop = (idx: number) => {
    if (draggedIndex === null || draggedIndex === idx) return;
    const newImages = [...images];
    const [item] = newImages.splice(draggedIndex, 1);
    newImages.splice(idx, 0, item);
    setImages(newImages);
    setDraggedIndex(null);
  };
  const onDragEnd = () => setDraggedIndex(null);

  const moveItem = (idx: number, dir: "up" | "down") => {
    const newIdx = dir === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= images.length) return;
    const newImages = [...images];
    const [item] = newImages.splice(idx, 1);
    newImages.splice(newIdx, 0, item);
    setImages(newImages);
  };

  // Viewer Handlers
  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setViewerScale((s) =>
        Math.min(10, Math.max(0.1, s * (e.deltaY > 0 ? 0.9 : 1.1))),
      );
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - viewerOffset.x,
        y: e.clientY - viewerOffset.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isPanning)
      setViewerOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };

  const handleMouseUp = () => setIsPanning(false);
  const handleDoubleClick = () =>
    viewerScale < 1 ? setViewerScale(1) : fitToScreen();

  // If running in popup mode, we use different container classes
  const containerClass = isPopup ? "app-popup-container" : "app-container";
  const wrapperClass = isPopup ? "app-popup-wrapper" : "app-overlay";

  return (
    <div className={wrapperClass} data-theme={isThemeDark ? "dark" : "light"}>
      <div className={containerClass}>
        {/* Header */}
        <div className="app-header">
          <div className="header-group">
            <img
              src={logoUrl}
              className="app-logo"
              alt="Logo"
              title={t("appDesc")}
            />
            <h2 className="app-title">
              <span className="appName-text">{t("appName")}</span>
              <span className="app-badge">
                {mode === "stitch" ? t("previewTitle") : t("splitterTitle")}
              </span>
            </h2>
          </div>

          {/* Mode Switcher & Theme */}
          <div className="header-group" style={{ gap: "1rem" }}>
            <div className="mode-switcher">
              <button
                onClick={() => setMode("stitch")}
                className={`mode-btn ${mode === "stitch" ? "active" : ""}`}
              >
                <Images
                  size={13}
                  style={{
                    color:
                      mode === "stitch"
                        ? "var(--color-primary)"
                        : "currentColor",
                  }}
                />
                <span>{t("modeStitch")}</span>
              </button>
              <button
                onClick={() => setMode("split")}
                className={`mode-btn ${mode === "split" ? "active" : ""}`}
              >
                <Scissors
                  size={13}
                  style={{
                    color:
                      mode === "split"
                        ? "var(--color-primary)"
                        : "currentColor",
                  }}
                />
                <span>{t("modeSplit")}</span>
              </button>
            </div>

            <div className="header-group" style={{ gap: "0.4rem" }}>
              <IconButton
                onClick={() => {
                  const sequence: ("auto" | "light" | "dark")[] = [
                    "auto",
                    "light",
                    "dark",
                  ];
                  const next = sequence[(sequence.indexOf(theme) + 1) % 3];
                  setTheme(next);
                }}
                icon={
                  theme === "auto" ? (
                    <Monitor size={15} />
                  ) : theme === "light" ? (
                    <Sun size={15} />
                  ) : (
                    <Moon size={15} />
                  )
                }
                title={`Theme: ${theme.toUpperCase()}`}
                style={{
                  width: "28px",
                  height: "28px",
                  color: "var(--color-text-muted)",
                }}
              />
              <button
                onClick={onClose}
                className="btn-ghost"
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="app-content">
          <ViewerArea
            mode={mode}
            splitSourceBitmap={splitSourceBitmap}
            canvasSize={canvasSize}
            containerRef={containerRef}
            isPanning={isPanning}
            handleWheel={handleWheel}
            handleMouseDown={handleMouseDown}
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
            handleDoubleClick={handleDoubleClick}
            task={task}
            isGenerating={isGenerating}
            isSplitting={isSplitting}
            viewerScale={viewerScale}
            setViewerScale={setViewerScale}
            resetViewer={resetViewer}
            viewerRotation={viewerRotation}
            setViewerRotation={setViewerRotation}
            viewerOffset={viewerOffset}
            previewUrl={previewUrl}
            splitBlobs={splitBlobs}
            splitConfig={splitConfig}
            onSplitFileSelect={handleSplitFileSelect}
            onClearSplit={() => {
              setSplitSource(null);
              setSplitBlobs([]);
              setSplitSourceBitmap(null);
            }}
          />

          <Sidebar
            mode={mode}
            layout={layout}
            setLayout={setLayout}
            images={images}
            draggedIndex={draggedIndex}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            moveItem={moveItem}
            toggleVisibility={toggleVisibility}
            updateLocalGap={updateLocalGap}
            globalGap={globalGap}
            setGlobalGap={setGlobalGap}
            splitConfig={splitConfig}
            setSplitConfig={setSplitConfig}
            isSplitting={isSplitting}
            handleSplit={handleSplit}
            splitBlobs={splitBlobs}
            setSplitBlobs={setSplitBlobs}
            isZip={isZip}
            setIsZip={setIsZip}
            isTwitterOptimized={isTwitterOptimized}
            setIsTwitterOptimized={setIsTwitterOptimized}
            outputFormat={outputFormat}
            setOutputFormat={setOutputFormat}
            backgroundColor={backgroundColor}
            setBackgroundColor={setBackgroundColor}
            lang={lang}
            setLang={(l) => {
              setLanguage(l);
              setLang(l);
            }}
            hasSplitSource={!!splitSourceBitmap}
            handleStitch={handleStitch}
            loading={loading}
            isGenerating={isGenerating}
          />
        </div>
      </div>

      <style>{`
        .spinner { width: 24px; height: 24px; border: 2px solid rgba(255,255,255,0.15); border-top: 2px solid white; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .hide-arrows::-webkit-inner-spin-button, .hide-arrows::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .hide-arrows { -moz-appearance: textfield; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .apple-select:hover { border-color: rgba(255,255,255,0.3) !important; background-color: rgba(255,255,255,0.15) !important; }
      `}</style>
    </div>
  );
}
