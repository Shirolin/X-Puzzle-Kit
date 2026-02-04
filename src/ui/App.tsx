import { useState, useEffect, useRef, useCallback } from "preact/hooks";
import {
  BackgroundColor,
  ImageNode,
  StitchTask,
  SplitConfig,
} from "../core/types";
import { stitchImages } from "../core/stitcher";
import { t, setLanguage, getResolvedLanguage } from "../core/i18n";
import { X, Images, Sun, Moon, Monitor, Scissors } from "lucide-preact";
import { splitImage } from "../core/splitter";
import { IconButton } from "./components/Common";
import { Sidebar } from "./components/Sidebar";
import { updateToasterTheme } from "./index";
import { ViewerArea } from "./components/ViewerArea";
import {
  platformStorage,
  getAssetUrl,
  fetchImageData,
  isExtension,
} from "../core/platform";
import { useStitchManager } from "./hooks/useStitchManager";
import { IOSInstallPrompt } from "./components/IOSInstallPrompt";
import {
  extractTwitterUrl,
  parseTwitterMetadata,
  fetchTwitterImageBlob,
} from "../core/twitter";
import { APP_CONFIG } from "../core/config";
import { toast } from "sonner";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { InputDialog } from "./components/InputDialog";
import { ReloadPrompt } from "./components/ReloadPrompt";

interface AppProps {
  task: StitchTask;
  onClose: () => void;
  initialMode?: "stitch" | "split";
  initialSplitImageUrl?: string;
  isPopup?: boolean;
  mountNode?: HTMLElement;
}

const STORAGE_KEYS = APP_CONFIG.STORAGE;

export function App({
  task,
  onClose,
  initialMode = "stitch",
  initialSplitImageUrl,
  isPopup = false,
  mountNode,
}: AppProps) {
  const logoUrl = getAssetUrl("assets/icon-48.png");

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    isDestructive = false,
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
      isDestructive,
    });
  };

  const {
    images,
    setImages,
    layout,
    updateLayout,
    globalGap,
    updateGlobalGap,
    backgroundColor,
    updateBackgroundColor,
    isGenerating,
    setIsGenerating,
    previewUrl,
    canvasSize,
    addImages,
    removeImage,
    clearAllImages,
    toggleVisibility,
    updateLocalGap,
    triggerGeneration,
  } = useStitchManager({
    initialImages: task.userImages.map((img, i) => ({
      ...img,
      originalIndex: img.originalIndex ?? i + 1,
    })),
    initialLayout: task.layout,
    initialGap: task.globalGap || 0,
    initialBackgroundColor: "transparent",
  });

  const [loading, setLoading] = useState(() => {
    // If we have share target params, start in loading state
    const params = new URLSearchParams(window.location.search);
    return !!(params.get("title") || params.get("text") || params.get("url"));
  });
  const [loadingMessage, setLoadingMessage] = useState("");

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
  const [persistedBG, setPersistedBG] =
    useState<BackgroundColor>("transparent");

  // Theme State
  const [theme, setTheme] = useState<"auto" | "light" | "dark">("auto");
  const [isThemeDark, setIsThemeDark] = useState(true);

  // Load Settings
  useEffect(() => {
    platformStorage
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
        setPersistedBG(res[STORAGE_KEYS.BG] as BackgroundColor);
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
            // Only turn off loading if we are NOT potentially processing a share target
            const params = new URLSearchParams(window.location.search);
            if (
              !params.get("title") &&
              !params.get("text") &&
              !params.get("url")
            ) {
              setLoading(false);
            }
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
      [STORAGE_KEYS.BG]: persistedBG,
      [STORAGE_KEYS.THEME]: theme,
      [STORAGE_KEYS.SPLIT_OPTIONS]: {
        format: splitConfig.format,
        isZip,
        isTwitterOptimized,
      },
    };

    platformStorage.set(settingsToSave).catch((err) => {
      console.error("Failed to save settings:", err);
    });
  }, [
    lang,
    outputFormat,
    persistedBG,
    splitConfig.format,
    isZip,
    isTwitterOptimized,
    isLangLoaded,
    theme,
  ]);

  // Sync background color from setting
  useEffect(() => {
    if (persistedBG) updateBackgroundColor(persistedBG);
  }, [persistedBG, updateBackgroundColor]);

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

  // Sync DOM attributes for CSS styling
  useEffect(() => {
    const effectiveTheme = isThemeDark ? "dark" : "light";
    const effectiveLang = getResolvedLanguage(lang);

    document.documentElement.setAttribute("data-theme", effectiveTheme);
    document.documentElement.setAttribute("data-lang", effectiveLang);

    if (mountNode && mountNode instanceof Element) {
      mountNode.setAttribute("data-theme", effectiveTheme);
      mountNode.setAttribute("data-lang", effectiveLang);
    }
  }, [isThemeDark, lang, mountNode]);

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
      fetchImageData(initialSplitImageUrl).then(async (response) => {
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
      });
    } else {
      setSplitSourceBitmap(null);
    }
    return () => {
      active = false;
    };
  }, [splitSource, initialSplitImageUrl]);

  // Shared Viewport State
  const [viewerScale, setViewerScale] = useState(1);
  const [viewerOffset, setViewerOffset] = useState({ x: 0, y: 0 });
  const [viewerRotation, setViewerRotation] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [touchStartDist, setTouchStartDist] = useState<number | null>(null);
  const [touchStartScale, setTouchStartScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const fitToScreen = useCallback(() => {
    if (
      !containerRef.current ||
      (mode === "stitch" && canvasSize.width === 0) ||
      (mode === "split" && !splitSourceBitmap)
    )
      return;

    const cw = mode === "split" ? splitSourceBitmap!.width : canvasSize.width;
    const ch = mode === "split" ? splitSourceBitmap!.height : canvasSize.height;

    const padding = 48;
    const availableWidth = containerRef.current.clientWidth - padding;
    // 移动端需要额外减去 sidebar 覆盖区域的高度（margin-bottom 向下延伸 + 工具栏提升的距离）
    const isMobile = window.innerWidth <= 768;
    const mobileBottomOffset = isMobile ? 96 : 0; // 约 3rem + radius-2xl
    const availableHeight =
      containerRef.current.clientHeight - padding - mobileBottomOffset;
    const scale = Math.min(availableWidth / cw, availableHeight / ch, 1);

    setViewerScale(scale);
    // 移动端需要向上偏移，让图片在有效可视区域内居中
    setViewerOffset({ x: 0, y: isMobile ? -mobileBottomOffset / 2 : 0 });
    setViewerRotation(0);
  }, [mode, canvasSize, splitSourceBitmap]);

  useEffect(() => {
    const runRefit = () => {
      fitToScreen();
    };
    runRefit();

    // Window Resize
    window.addEventListener("resize", runRefit);

    // Container Resize Observer (handles sidebar collapse/expand animations)
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        // Debounce or just run? Run immediately for responsiveness, fitToScreen is cheap enough?
        // Actually for animations we might want to run it on every frame or just let CSS handle flow?
        // But viewerScale/Offset definitely relies on exact dimensions.
        // Let's run it.
        requestAnimationFrame(() => fitToScreen());
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", runRefit);
      resizeObserver?.disconnect();
    };
  }, [canvasSize, mode, splitSourceBitmap, fitToScreen]);

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

  const handleSplitFileSelect = useCallback((file: File) => {
    if (file) {
      setSplitSource(file);
      setSplitBlobs([]);
    }
  }, []);

  const handleStitchFilesSelect = useCallback(
    async (files: FileList | File[]) => {
      setLoading(true);
      try {
        const currentLength = images.length;
        const newNodes: ImageNode[] = await Promise.all(
          Array.from(files).map(async (file, i) => {
            return new Promise<ImageNode>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const img = new Image();
                img.onload = async () => {
                  const bitmap = await createImageBitmap(img);
                  resolve({
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    originalUrl: e.target?.result as string,
                    thumbnailUrl: e.target?.result as string,
                    width: img.width,
                    height: img.height,
                    visible: true,
                    originalIndex: currentLength + i + 1,
                    bitmap,
                  });
                };
                img.src = e.target?.result as string;
              };
              reader.readAsDataURL(file);
            });
          }),
        );
        addImages(newNodes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [images.length, addImages],
  );

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

  // 适配 SortableJS 的排序逻辑
  const handleSortEnd = useCallback(
    (oldIndex: number, newIndex: number) => {
      if (oldIndex === newIndex) return;
      setImages((prev) => {
        const newImages = [...prev];
        const [item] = newImages.splice(oldIndex, 1);
        newImages.splice(newIndex, 0, item);
        return newImages;
      });
      // Defer generation to prevent blocking the animation
      setTimeout(() => triggerGeneration(), 400);
    },
    [images.length, triggerGeneration, setImages],
  ); // 仅在长度变化或函数变化时更新

  const moveItem = (idx: number, dir: "up" | "down") => {
    const newIdx = dir === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= images.length) return;
    const newImages = [...images];
    const [item] = newImages.splice(idx, 1);
    newImages.splice(newIdx, 0, item);
    setImages(newImages);
    setTimeout(() => triggerGeneration(), 400);
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

  // Touch Handlers
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setPanStart({
        x: e.touches[0].clientX - viewerOffset.x,
        y: e.touches[0].clientY - viewerOffset.y,
      });
      setTouchStartDist(null);
    } else if (e.touches.length === 2) {
      setIsPanning(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      setTouchStartDist(dist);
      setTouchStartScale(viewerScale);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1 && isPanning) {
      setViewerOffset({
        x: e.touches[0].clientX - panStart.x,
        y: e.touches[0].clientY - panStart.y,
      });
    } else if (e.touches.length === 2 && touchStartDist !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const scale = (dist / touchStartDist) * touchStartScale;
      setViewerScale(Math.min(10, Math.max(0.1, scale)));
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setTouchStartDist(null);
  };

  // Initial Theme Sync & PWA Status Bar Optimization
  useEffect(() => {
    if (theme) {
      updateToasterTheme(theme as "light" | "dark" | "system");

      // Dynamic Meta Theme Color & Notch Adaptation
      const themeColor = theme === "dark" ? "#111111" : "#ffffff";
      let metaTheme = document.querySelector('meta[name="theme-color"]');
      if (!metaTheme) {
        metaTheme = document.createElement("meta");
        metaTheme.setAttribute("name", "theme-color");
        document.head.appendChild(metaTheme);
      }
      metaTheme.setAttribute("content", themeColor);

      // iOS Status Bar Style Adaptation
      const metaStatus = document.querySelector(
        'meta[name="apple-mobile-web-app-status-bar-style"]',
      );
      if (metaStatus) {
        // black-translucent allows content to flow behind status bar, required for notch
        metaStatus.setAttribute("content", "black-translucent");
      }
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      platformStorage.set({ [STORAGE_KEYS.THEME]: next });
      updateToasterTheme(next);
      return next;
    });
  }, [setTheme]);

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) files.push(blob);
        }
      }

      if (files.length > 0) {
        if (mode === "split") {
          handleSplitFileSelect(files[0]);
        } else {
          handleStitchFilesSelect(files);
        }
      }
    },
    [mode, handleStitchFilesSelect, handleSplitFileSelect],
  );

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  // If running in popup mode, we use different container classes
  const isWebFullscreen = !isExtension && !isPopup;
  const containerClass = isPopup
    ? "app-popup-container"
    : isWebFullscreen
      ? "app-container app-fullscreen"
      : "app-container";
  const wrapperClass = isPopup ? "app-popup-wrapper" : "app-overlay";

  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleImportUrl = useCallback(
    async (urlToProcess: string) => {
      // Logic guard
      if (__IS_EXTENSION__) return;

      const twitterUrl = extractTwitterUrl(urlToProcess);
      if (!twitterUrl) {
        toast.error(t("invalidUrl"));
        return;
      }

      console.log("Processing Twitter URL:", twitterUrl);
      setLoading(true);
      setLoadingMessage(t("analyzingLink"));

      try {
        // 1. Parse Metadata
        // Updated: Extract handle and ID for Source Badge
        const urlObj = new URL(twitterUrl);
        const pathParts = urlObj.pathname.split("/").filter(Boolean);
        // /username/status/123456...
        const artistHandle = pathParts[0];
        const tweetId = pathParts[2]; // handle / status / id

        let images = await parseTwitterMetadata(twitterUrl);

        if (images.length === 0) {
          toast.error(t("noImagesFound"));
          setLoading(false);
          setLoadingMessage("");
          return;
        }

        // Deduplicate images
        images = [...new Set(images)];

        // 2. Download Images
        const blobs: Blob[] = [];
        for (let i = 0; i < images.length; i++) {
          setLoadingMessage(
            `${t("downloadingImages")} (${i + 1}/${images.length})...`,
          );
          try {
            const blob = await fetchTwitterImageBlob(images[i]);
            blobs.push(blob);
          } catch (err) {
            console.error(`Failed to load image ${i}`, err);
            // Continue loading others
          }
        }

        if (blobs.length === 0) {
          throw new Error("Failed to download any images");
        }

        setLoadingMessage(t("processingImages"));

        // 3. Create ImageNodes directly (to attach source metadata)
        // We generate unique IDs and defer index handling to useStitchManager

        const newNodes: ImageNode[] = await Promise.all(
          blobs.map(async (blob, i) => {
            return new Promise<ImageNode>((resolve) => {
              const img = new Image();
              const url = URL.createObjectURL(blob);
              img.onload = async () => {
                const bitmap = await createImageBitmap(img);
                resolve({
                  id: Math.random().toString(36).substr(2, 9),
                  name: `twitter_image_${i}.jpg`,
                  originalUrl: url,
                  thumbnailUrl: url,
                  width: img.width,
                  height: img.height,
                  visible: true,
                  // We don't have access to current `images.length` fresh state here easily without ref,
                  // but `addImages` appends, so `originalIndex` handles itself or isn't critical for initial append order.
                  // Let's just use a large number or 0, useStitchManager might re-index or it's just for display.
                  originalIndex: 0,
                  bitmap,
                  source: {
                    tweetId,
                    artistHandle,
                  },
                });
              };
              img.src = url;
            });
          }),
        );

        // 4. Add to Stitcher
        addImages(newNodes);
      } catch (e: unknown) {
        console.error("Twitter share handling failed:", e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        toast.error(t("parseFailed") + ": " + errorMessage);
      } finally {
        setLoading(false);
        setLoadingMessage("");
      }
    },
    [addImages],
  );

  // Handle Share Target (Twitter)
  const processedShareRef = useRef<string | null>(null);

  useEffect(() => {
    if (__IS_EXTENSION__) return; // Disable Share Target in Extension

    const handleShareTarget = async () => {
      const params = new URLSearchParams(window.location.search);
      const title = params.get("title");
      const text = params.get("text");
      const url = params.get("url");

      const shareContent = [title, text, url].filter(Boolean).join(" ");
      const twitterUrl = extractTwitterUrl(shareContent);

      // Only trigger if there is actual content and we haven't processed it yet
      if (twitterUrl && processedShareRef.current !== twitterUrl) {
        processedShareRef.current = twitterUrl;
        await handleImportUrl(shareContent);
        // Clean URL after successful processing
        if (window.history.replaceState) {
          const newUrl =
            window.location.protocol +
            "//" +
            window.location.host +
            window.location.pathname;
          window.history.replaceState({ path: newUrl }, "", newUrl);
        }
      } else if (!twitterUrl && loading) {
        // If there is no share content but we are stuck in loading (e.g. malformed share),
        // we should turn off loading.
        // Wait for language to load first though (handled in simple useEffect above)
      }
    };

    handleShareTarget();
  }, [handleImportUrl]);

  return (
    <div
      className={wrapperClass}
      data-theme={isThemeDark ? "dark" : "light"}
      data-lang={getResolvedLanguage(lang)}
    >
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
            <div className="app-brand-stack">
              <span className="appName-text">X-Puzzle-Kit</span>
              {(() => {
                const appName = t("appName");
                const separator = appName.includes(":")
                  ? ":"
                  : appName.includes(" - ")
                    ? " - "
                    : null;
                if (!separator) return null;
                const parts = appName.split(separator);
                if (parts.length < 2) return null;
                return (
                  <>
                    <span className="app-slogan-divider"> {separator} </span>
                    <span className="app-slogan-text">
                      {parts.slice(1).join(separator).trim()}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Mode Switcher & Theme */}
          <div className="header-group" style={{ gap: "1rem" }}>
            <div className="mode-switcher">
              <button
                onClick={() => {
                  if (mode !== "stitch") {
                    setMode("stitch");
                    window.navigator?.vibrate?.(10);
                  }
                }}
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
                onClick={() => {
                  if (mode !== "split") {
                    setMode("split");
                    window.navigator?.vibrate?.(10);
                  }
                }}
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
                onClick={toggleTheme}
                icon={
                  theme === "auto" ? (
                    <Monitor size={15} />
                  ) : theme === "light" ? (
                    <Sun size={15} />
                  ) : (
                    <Moon size={15} />
                  )
                }
                title={`${t("themeLabel")}: ${theme.toUpperCase()}`}
                style={{
                  width: "28px",
                  height: "28px",
                  color: "var(--color-text-muted)",
                }}
              />
              {isExtension && (
                <IconButton
                  icon={<X size={16} />}
                  onClick={onClose}
                  title={t("close")}
                  style={{
                    width: "28px",
                    height: "28px",
                    color: "var(--color-text-muted)",
                  }}
                />
              )}
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
            handleTouchStart={handleTouchStart}
            handleTouchMove={handleTouchMove}
            handleTouchEnd={handleTouchEnd}
            handleDoubleClick={handleDoubleClick}
            task={task}
            images={images}
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
            onStitchFilesSelect={handleStitchFilesSelect}
            onClearSplit={() => {
              setSplitSource(null);
              setSplitBlobs([]);
              setSplitSourceBitmap(null);
            }}
          />

          <Sidebar
            mode={mode}
            layout={layout}
            setLayout={updateLayout}
            images={images}
            onSortEnd={handleSortEnd}
            moveItem={moveItem}
            toggleVisibility={toggleVisibility}
            updateLocalGap={updateLocalGap}
            globalGap={globalGap}
            setGlobalGap={updateGlobalGap}
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
            backgroundColor={persistedBG as BackgroundColor}
            setBackgroundColor={(c) => {
              setPersistedBG(c);
              updateBackgroundColor(c);
            }}
            lang={lang}
            setLang={(l) => {
              setLanguage(l);
              setLang(l);
            }}
            hasSplitSource={!!splitSourceBitmap}
            handleStitch={handleStitch}
            loading={loading}
            isGenerating={isGenerating}
            removeImage={(id) => {
              showConfirm(
                t("removeImage"),
                t("confirmRemoveImage"),
                () => removeImage(id),
                true,
              );
            }}
            clearAllImages={() => {
              showConfirm(
                t("clearAll"),
                t("confirmClearAll"),
                clearAllImages,
                true,
              );
            }}
            onStitchFilesSelect={handleStitchFilesSelect}
            onImportFromUrl={
              __IS_EXTENSION__ ? undefined : () => setShowUrlInput(true)
            }
          />
        </div>
      </div>

      <style>{`
        .hide-arrows::-webkit-inner-spin-button, .hide-arrows::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .hide-arrows { -moz-appearance: textfield; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .apple-select:hover { border-color: rgba(255,255,255,0.3) !important; background-color: rgba(255,255,255,0.15) !important; }
      `}</style>

      <>
        {loading && loadingMessage && (
          <div className="app-overlay">
            <div className="app-spinner" />
            <div className="loading-text">{loadingMessage}</div>
          </div>
        )}

        {/* Simple URL Input Modal replaced by InputDialog */}
      </>

      <IOSInstallPrompt />
      {isPopup && <div className="app-popup-spacer" />}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() =>
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        }
        container={mountNode}
      />

      {!__IS_EXTENSION__ && (
        <InputDialog
          isOpen={showUrlInput}
          title={t("importFromUrl")}
          placeholder="https://x.com/..."
          validator={(val) =>
            !extractTwitterUrl(val) ? t("invalidUrl") : undefined
          }
          onConfirm={(val) => {
            handleImportUrl(val);
            setShowUrlInput(false);
          }}
          onCancel={() => setShowUrlInput(false)}
          container={mountNode}
        />
      )}

      <ReloadPrompt />
    </div>
  );
}
