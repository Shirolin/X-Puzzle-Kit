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
import { LayoutButton, IconButton } from "./components/Common";
import JSZip from "jszip";

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
  const [splitSourceBitmap, setSplitSourceBitmap] = useState<ImageBitmap | null>(null);
  const [splitBlobs, setSplitBlobs] = useState<Blob[]>([]);
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitConfig, setSplitConfig] = useState<SplitConfig>({
    layout: "GRID_2x2",
    rows: 2,
    cols: 2,
    gap: 0,
    format: "png",
  });
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);
  const [isZip, setIsZip] = useState(false);
  const [isTwitterOptimized, setIsTwitterOptimized] = useState(false);

  // Persistence and Language
  const [lang, setLang] = useState("auto");
  const [isLangLoaded, setIsLangLoaded] = useState(false);
  const [outputFormat, setOutputFormat] = useState<"png" | "jpg" | "webp">("png");
  const [backgroundColor, setBackgroundColor] = useState<BackgroundColor>("transparent");
  const [globalGap, setGlobalGap] = useState<number>(task.globalGap || 0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Load Settings
  useEffect(() => {
    chrome.storage.local.get({
      "x-puzzle-stitcher-lang": "auto",
      "x-puzzle-stitcher-format": "png",
      "x-puzzle-stitcher-bg": "transparent",
      "splitSettings": null
    }).then((res) => {
      setLang(res["x-puzzle-stitcher-lang"] as string);
      setOutputFormat(res["x-puzzle-stitcher-format"] as any);
      setBackgroundColor(res["x-puzzle-stitcher-bg"] as any);
      
      const splitSettings = res.splitSettings as any;
      if (splitSettings) {
        setSplitConfig(prev => ({...prev, ...splitSettings}));
        if (typeof splitSettings.isZip === 'boolean') setIsZip(splitSettings.isZip);
        if (typeof splitSettings.isTwitterOptimized === 'boolean') setIsTwitterOptimized(splitSettings.isTwitterOptimized);
      }

      setLanguage(res["x-puzzle-stitcher-lang"] as string).then(() => {
        setIsLangLoaded(true);
        setLoading(false);
      });
    });
  }, []);

  // Save Settings
  useEffect(() => {
    if (!isLangLoaded) return;
    chrome.storage.local.set({
      "x-puzzle-stitcher-lang": lang,
      "x-puzzle-stitcher-format": outputFormat,
      "x-puzzle-stitcher-bg": backgroundColor,
      "splitSettings": {
        ...splitConfig,
        isZip,
        isTwitterOptimized
      }
    });
  }, [lang, outputFormat, backgroundColor, splitConfig, isZip, isTwitterOptimized, isLangLoaded]);

  // Load split source image
  useEffect(() => {
    if (splitSource) {
      const url = URL.createObjectURL(splitSource);
      setSourcePreviewUrl(url);
      setLoading(true);
      createImageBitmap(splitSource)
        .then((bitmap) => {
           setSplitSourceBitmap(bitmap);
           if (mode === 'split') {
              setCanvasSize({ width: bitmap.width, height: bitmap.height });
              // Small timeout to ensure state update before fitToScreen
              setTimeout(fitToScreen, 0);
           }
           setLoading(false);
        })
        .catch((err) => {
            console.error("Failed to load image bitmap:", err);
            alert("Failed to load image. Please try another file.");
            setSplitSource(null);
            setLoading(false);
        });
      return () => URL.revokeObjectURL(url);
    } else {
        setSourcePreviewUrl(null);
        setSplitSourceBitmap(null);
    }
  }, [splitSource]);

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
    if (!containerRef.current || (mode === 'stitch' && canvasSize.width === 0) || (mode === 'split' && !splitSourceBitmap)) return;
    
    const cw = mode === 'split' ? splitSourceBitmap!.width : canvasSize.width;
    const ch = mode === 'split' ? splitSourceBitmap!.height : canvasSize.height;

    const padding = 48; // Standard padding from high-quality version
    const availableWidth = containerRef.current.clientWidth - padding;
    const availableHeight = containerRef.current.clientHeight - padding;
    const scale = Math.min(availableWidth / cw, availableHeight / ch, 1);
    
    setViewerScale(scale); 
    setViewerOffset({ x: 0, y: 0 });
    setViewerRotation(0);
  };

  useEffect(() => {
    console.log('[LayoutDebug] App Mounted at:', new Date().toLocaleTimeString());
    const runRefit = () => {
      fitToScreen();
      const sidebar = document.querySelector('.sidebar-content-root');
      if (sidebar) {
        const sections = Array.from(sidebar.children).map(c => ({
          tag: (c as HTMLElement).tagName,
          height: (c as HTMLElement).offsetHeight
        }));
        console.log('[LayoutDebug] Sidebar Total:', sidebar.clientHeight, 'Sections:', sections);
      }
    };
    runRefit();
    window.addEventListener('resize', runRefit);
    return () => window.removeEventListener('resize', runRefit);
  }, []); // Run only once on mount to avoid spam, resize listener handles the rest

  const resetViewer = () => fitToScreen();

  // Handlers
  const handleSplit = async (config: SplitConfig) => {
    if (!splitSourceBitmap) return;
    setIsSplitting(true);
    try {
      await new Promise((r) => setTimeout(r, 50));
      const blobs = await splitImage(splitSourceBitmap, config);
      setSplitBlobs(blobs);
    } catch (e) { console.error(e); } finally { setIsSplitting(false); }
  };

  const handleSplitFileSelect = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) { setSplitSource(file); setSplitBlobs([]); }
  };

  const generatePreview = async () => {
    setIsGenerating(true);
    try {
      const visibleImages = images.filter(img => img.visible !== false);
      if (visibleImages.length === 0) { setPreviewUrl(""); return; }
      const canvas = await stitchImages(visibleImages, layout, globalGap, backgroundColor);
      setCanvasSize({ width: canvas.width, height: canvas.height });
      setPreviewUrl(canvas.toDataURL("image/png"));
      // Human-perception delay as requested
      await new Promise(r => setTimeout(r, 50));
    } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };

  const handleStitch = async () => {
    setIsGenerating(true);
    try {
      const visibleImages = images.filter(img => img.visible !== false);
      const canvas = await stitchImages(visibleImages, layout, globalGap, backgroundColor);
      const mime = outputFormat === "jpg" ? "image/jpeg" : outputFormat === "webp" ? "image/webp" : "image/png";
      const url = canvas.toDataURL(mime, 0.9);
      const a = document.createElement("a");
      a.download = `${task.pageTitle.replace(/[\\/:*?"<>|]/g, "_")}_${new Date().getTime()}.${outputFormat}`;
      a.href = url; a.click();
    } finally { setIsGenerating(false); }
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

  const moveItem = (idx: number, dir: 'up' | 'down') => {
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
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
      setViewerScale(s => Math.min(10, Math.max(0.1, s * (e.deltaY > 0 ? 0.9 : 1.1))));
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewerOffset.x, y: e.clientY - viewerOffset.y });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isPanning) setViewerOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };

  const handleMouseUp = () => setIsPanning(false);
  const handleDoubleClick = () => viewerScale < 1 ? setViewerScale(1) : fitToScreen();

  return (
    <div className="modal-overlay" style={{ position: "fixed", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--color-overlay)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999, backdropFilter: "blur(8px)" }}>
      <div className="card apple-blur" style={{ width: "95%", maxWidth: "940px", height: "85vh", display: "flex", flexDirection: "column", backgroundColor: "rgba(0,0,0,0.85)", color: "white", borderRadius: "1.25rem", overflow: "hidden", border: "1px solid var(--color-glass-border)", boxShadow: "0 24px 80px rgba(0,0,0,0.7)" }}>
        
        {/* Header */}
        <div style={{ padding: "0.5rem 1rem", borderBottom: "1px solid var(--color-glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <img src={logoUrl} style={{ width: "28px", height: "28px" }} alt="Logo" title={t("appDesc")} />
            <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span className="appName-text">{t("appName")}</span>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--color-primary)", backgroundColor: "rgba(0,122,255,0.12)", padding: "1px 6px", borderRadius: "10px" }}>
                {mode === "stitch" ? t("previewTitle") : "Splitter"}
              </span>
            </h2>
          </div>

          {/* Mode Switcher */}
          <div className="apple-blur" style={{ display: "flex", backgroundColor: "rgba(255, 255, 255, 0.08)", padding: "2px", borderRadius: "0.6rem", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <button onClick={() => setMode("stitch")} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 12px", fontSize: "11px", fontWeight: 600, border: "none", borderRadius: "0.5rem", backgroundColor: mode === "stitch" ? "rgba(255, 255, 255, 0.15)" : "transparent", color: "white", cursor: "pointer", transition: "all 0.15s" }}>
              <Images size={13} color={mode === "stitch" ? "var(--color-primary)" : "white"} />
              <span>Stitch</span>
            </button>
            <button onClick={() => setMode("split")} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 12px", fontSize: "11px", fontWeight: 600, border: "none", borderRadius: "0.5rem", backgroundColor: mode === "split" ? "rgba(255, 255, 255, 0.15)" : "transparent", color: "white", cursor: "pointer", transition: "all 0.15s" }}>
              <Scissors size={13} color={mode === "split" ? "var(--color-primary)" : "white"} />
              <span>Split</span>
            </button>
          </div>

          <button onClick={onClose} className="btn-ghost" style={{ width: "28px", height: "28px", borderRadius: "50%", border: "none", cursor: "pointer", color: "var(--color-text-muted)", display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
        </div>

        {/* Content Area */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          
          {/* Main Visualizer (Left) */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", backgroundColor: "#000", overflow: "hidden" }}>
             {mode === "split" && !splitSourceBitmap ? (
                <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "2rem" }}>
                   <div style={{ textAlign: "center", border: "2px dashed rgba(255,255,255,0.1)", borderRadius: "1.5rem", padding: "4rem", maxWidth: "420px" }}>
                      <div style={{ marginBottom: "1.5rem", color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>{t("selectImageTip")}</div>
                      <label className="btn btn-primary" style={{ padding: "0.75rem 2rem", cursor: "pointer" }}>
                         {t("uploadImage")}
                         <input type="file" accept="image/*" onChange={handleSplitFileSelect} style={{ display: "none" }} />
                      </label>
                   </div>
                </div>
             ) : (
                <div ref={containerRef} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", position: "relative", cursor: isPanning ? "grabbing" : "grab", overflow: "hidden" }}
                     onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onDblClick={handleDoubleClick}>
                  
                  {/* Metadata Floating Badges - Absolute Top Right */}
                  <div className="floating-badge-container">
                     <div className="floating-badge badge-primary">@{task.artistHandle} / x.com/{task.tweetId}</div>
                     <div className="floating-badge">{mode === 'split' ? (splitSourceBitmap ? `${splitSourceBitmap.width} x ${splitSourceBitmap.height} PX` : "") : (canvasSize.width > 0 ? `${canvasSize.width} x ${canvasSize.height} PX` : "")}</div>
                  </div>
                  
                  {isGenerating || isSplitting ? (
                    <div style={{ position: "absolute", inset: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                       <div className="spinner"></div>
                       <div style={{ fontWeight: 600, fontSize: "0.95rem", letterSpacing: "0.05em" }}>{mode === "stitch" && isGenerating ? t("stitching") : t("processing")}</div>
                    </div>
                  ) : null}

                  {/* Viewer Toolbar - Precision Match for Image 2 */}
                  <div className="viewer-toolbar-v2 apple-blur" style={{ position: "absolute", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", zIndex: 30 }}>
                      <div className="toolbar-row">
                          <IconButton className="toolbar-btn" onClick={() => setViewerScale(s => Math.max(0.1, s - 0.1))} icon={<Minus size={16} />} style={{ background: "none", border: "none" }} />
                          <div className="zoom-percentage">{Math.round(viewerScale * 100)}%</div>
                          <IconButton className="toolbar-btn" onClick={() => setViewerScale(s => Math.min(10, s + 0.1))} icon={<Plus size={16} />} style={{ background: "none", border: "none" }} />
                      </div>
                      <div className="toolbar-divider-h" />
                      <div className="toolbar-row secondary">
                          <button className="toolbar-text-btn" onClick={() => setViewerScale(1)}>1:1</button>
                          <button className="toolbar-text-btn" onClick={resetViewer}>{t("reset")}</button>
                          <div className="toolbar-divider-v" />
                          <IconButton className="toolbar-btn" onClick={() => setViewerRotation(r => (r + 90) % 360)} icon={<RotateCcw size={16} />} style={{ background: "none", border: "none" }} />
                      </div>
                  </div>

                  <div style={{ transform: `translate(${viewerOffset.x}px, ${viewerOffset.y}px) scale(${viewerScale}) rotate(${viewerRotation}deg)`, transition: isPanning ? "none" : "transform 0.2s cubic-bezier(0.2, 0, 0, 1)", transformOrigin: "center center" }}>
                      {mode === "split" ? (
                         <SplitPreview source={splitSourceBitmap} blobs={splitBlobs} config={splitConfig} aspectRatio={splitConfig.autoCropRatio || (splitSourceBitmap ? splitSourceBitmap.width / splitSourceBitmap.height : undefined)} />
                      ) : (
                         previewUrl ? <img src={previewUrl} style={{ width: `${canvasSize.width}px`, height: `${canvasSize.height}px`, borderRadius: "var(--radius-md)", boxShadow: "0 32px 80px rgba(0,0,0,0.9)" }} /> : null
                      )}
                  </div>
                </div>
             )}
          </div>

          {/* Sidebar (Right) */}
          <div className="glass-panel" style={{ width: "260px", borderLeft: "1px solid var(--color-glass-border)", display: "flex", flexDirection: "column", zIndex: 20 }}>
            <div className="sidebar-content-root" style={{ padding: "0.5rem 0.75rem", flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: "10px", color: "#ef4444", fontWeight: 800, textAlign: "center", marginBottom: "4px", backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: "2px" }}>DEBUG: UI ACTIVATED</div>
              {mode === "split" ? (
                <SplitterControl 
                    config={splitConfig} onConfigChange={setSplitConfig} isProcessing={isSplitting}
                    exportFormat={splitConfig.format || "png"} onExportFormatChange={(fmt) => setSplitConfig(prev => ({...prev, format: fmt}))}
                    isZip={isZip} onIsZipChange={setIsZip} isTwitterOptimized={isTwitterOptimized} onIsTwitterOptimizedChange={setIsTwitterOptimized} 
                />
              ) : (
                <>
                  {/* Fixed Sections */}
                  <div style={{ flexShrink: 0 }}>
                    <section className="section-block" style={{ marginBottom: "0.75rem" }}>
                      <h3 className="section-header" style={{ marginBottom: "0.4rem" }}>{t("layoutScheme")}</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.25rem" }}>
                        <LayoutButton active={layout === "GRID_2x2"} onClick={() => setLayout("GRID_2x2")} icon={<LayoutGrid size={14} />} label={t("layoutGrid")} />
                        <LayoutButton active={layout === "T_SHAPE_3"} onClick={() => setLayout("T_SHAPE_3")} icon={<Layout size={14} />} label={t("layoutTShape")} />
                        <LayoutButton active={layout === "HORIZONTAL_Nx1"} onClick={() => setLayout("HORIZONTAL_Nx1")} icon={<Columns size={14} />} label={t("layoutHorizontal")} />
                        <LayoutButton active={layout === "VERTICAL_1xN"} onClick={() => setLayout("VERTICAL_1xN")} icon={<Rows size={14} />} label={t("layoutVertical")} />
                      </div>
                    </section>

                    <section className="section-block" style={{ marginBottom: "0.75rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                        <h3 className="section-header" style={{ margin: 0 }}>{t("globalGap")}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "2px", backgroundColor: "rgba(0,0,0,0.2)", padding: "2px 4px", borderRadius: "4px" }}>
                          <IconButton onClick={() => setGlobalGap(Math.max(-20, globalGap - 1))} icon={<Minus size={11} />} style={{ border: "none", background: "none", padding: "2px" }} />
                          <input type="number" value={globalGap} onInput={(e) => setGlobalGap(Math.max(-20, Math.min(100, parseInt(e.currentTarget.value) || 0)))} className="hide-arrows" style={{ width: "24px", height: "16px", fontSize: "11px", border: "none", outline: "none", textAlign: "center", backgroundColor: "transparent", fontWeight: 700, color: "white", fontFamily: "'Fira Code', monospace" }} />
                          <IconButton onClick={() => setGlobalGap(Math.min(100, globalGap + 1))} icon={<Plus size={11} />} style={{ border: "none", background: "none", padding: "2px" }} />
                        </div>
                      </div>
                      <input type="range" min="-20" max="100" value={globalGap} onInput={(e) => setGlobalGap(parseInt(e.currentTarget.value) || 0)} className="vibrant-range" style={{ height: "4px", marginTop: "4px" }} />
                    </section>
                  </div>

                  {/* Elastic Sorting Area */}
                  <section className="section-block sorting-area" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem", flexShrink: 0 }}>
                      <h3 className="section-header" style={{ margin: 0 }}>{t("imageSorting")}</h3>
                      <span style={{ fontSize: "0.6rem", color: "var(--color-text-muted)" }}>{t("localGap")}</span>
                    </div>
                    <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem", paddingRight: "4px" }}>
                        {images.map((img, idx) => (
                           <div key={img.id} draggable onDragStart={() => onDragStart(idx)} onDragOver={(e) => onDragOver(e, idx)} onDrop={() => onDrop(idx)} onDragEnd={onDragEnd} style={{ padding: "0.625rem", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.06)", opacity: draggedIndex === idx ? 0.3 : 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                 <GripVertical size={13} style={{ color: "var(--color-text-muted)", opacity: 0.4, cursor: "grab" }} />
                                 <div style={{ position: "relative", flexShrink: 0 }}>
                                    <img src={img.thumbnailUrl} style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid rgba(255,255,255,0.1)" }} />
                                    <div style={{ position: "absolute", top: "-6px", left: "-6px", minWidth: "16px", height: "16px", background: "var(--color-primary)", color: "white", fontSize: "9px", fontWeight: "bold", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #111" }}>{idx + 1}</div>
                                 </div>
                                 <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: img.visible !== false ? "white" : "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.name || `${t("imageLabel")} ${idx + 1}`}</div>
                                    <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", marginTop: "2px" }}>{img.width} × {img.height}</div>
                                 </div>
                                 <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                       <IconButton onClick={() => moveItem(idx, 'up')} disabled={idx === 0} icon={<ChevronUp size={11} />} style={{ padding: "0", background: "none", border: "none", opacity: idx === 0 ? 0 : 0.6 }} />
                                       <IconButton onClick={() => moveItem(idx, 'down')} disabled={idx === images.length - 1} icon={<ChevronDown size={11} />} style={{ padding: "0", background: "none", border: "none", opacity: idx === images.length - 1 ? 0 : 0.6 }} />
                                    </div>
                                    <IconButton onClick={() => toggleVisibility(idx)} icon={img.visible !== false ? <Eye size={13} /> : <EyeOff size={13} />} style={{ border: "none", background: "none", padding: "2px" }} />
                                 </div>
                              </div>
                              {img.visible !== false && idx < images.length - 1 && (
                                 <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                       <span style={{ fontSize: "0.6rem", color: "var(--color-text-muted)" }}>{t("afterGap")}</span>
                                       <div style={{ display: "flex", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "4px" }}>
                                          <button onClick={() => updateLocalGap(idx, (img.localGap || 0) - 1)} style={{ border: "none", background: "none", color: "white", padding: "1px 4px", cursor: "pointer" }}><Minus size={9} /></button>
                                          <span style={{ fontSize: "10px", width: "20px", textAlign: "center", fontWeight: 700, color: "var(--color-primary)", fontFamily: "'Fira Code', monospace" }}>{img.localGap || 0}</span>
                                          <button onClick={() => updateLocalGap(idx, (img.localGap || 0) + 1)} style={{ border: "none", background: "none", color: "white", padding: "1px 4px", cursor: "pointer" }}><Plus size={9} /></button>
                                       </div>
                                    </div>
                                    <span style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", fontWeight: 700 }}>{t("gapLabel")} <span style={{ color: "var(--color-primary)", fontFamily: "'Fira Code', monospace" }}>{globalGap + (img.localGap || 0)}px</span></span>
                                 </div>
                              )}
                           </div>
                        ))}
                    </div>
                  </section>

                  {/* Fixed Export Section */}
                  <div style={{ flexShrink: 0, marginTop: "0.75rem" }}>
                    <section className="section-block">
                      <h3 className="section-header" style={{ marginBottom: "0.5rem" }}>{t("exportSettings")}</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                         <div style={{ display: "flex", backgroundColor: "rgba(255, 255, 255, 0.08)", borderRadius: "var(--radius-sm)", padding: "2px" }}>
                            {["PNG", "JPG", "WEBP"].map(fmt => (
                               <button key={fmt} onClick={() => setOutputFormat(fmt.toLowerCase() as any)} style={{ flex: 1, padding: "3px", border: "none", borderRadius: "4px", backgroundColor: outputFormat === fmt.toLowerCase() ? "rgba(255, 255, 255, 0.15)" : "transparent", color: "white", fontSize: "10px", fontWeight: 700, cursor: "pointer" }}>{fmt}</button>
                            ))}
                         </div>
                         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", fontWeight: 600 }}>{t("backgroundColor")}</span>
                            <div style={{ display: "flex", gap: "5px" }}>
                               {(["transparent", "white", "black"] as const).map(bg => (
                                  <button key={bg} onClick={() => setBackgroundColor(bg)} disabled={outputFormat === "jpg" && bg === "transparent"} style={{ width: "12px", height: "12px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", backgroundColor: bg === "transparent" ? "#333" : bg, outline: backgroundColor === bg ? "2px solid var(--color-primary)" : "none", outlineOffset: "2px", cursor: "pointer", opacity: (outputFormat === "jpg" && bg === "transparent") ? 0.2 : 1 }} />
                               ))}
                            </div>
                         </div>
                         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", fontWeight: 600 }}>{t("language")}</span>
                            <select value={lang} onChange={(e) => setLang(e.currentTarget.value)} className="apple-select" style={{ padding: "1px 16px 1px 6px", fontSize: "10px", width: "90px" }}>
                               <option value="auto">Auto</option>
                               <option value="zh_CN">简体中文</option>
                               <option value="zh_TW">繁體中文</option>
                               <option value="en">English</option>
                               <option value="ja">日本語</option>
                            </select>
                         </div>
                      </div>
                    </section>
                  </div>
                </>
              )}
            </div>

            {/* Sidebar Footer */}
            <div style={{ padding: "0.875rem", borderTop: "1px solid var(--color-glass-border)", background: "rgba(255, 255, 255, 0.03)" }}>
               {mode === "split" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                     <button onClick={() => splitBlobs.length > 0 ? setSplitBlobs([]) : handleSplit(splitConfig)} disabled={(!splitSourceBitmap && splitBlobs.length === 0) || isSplitting} className="btn btn-primary" style={{ height: "2.75rem", fontSize: "0.875rem", backgroundColor: splitBlobs.length > 0 ? "rgba(255, 255, 255, 0.1)" : "var(--color-primary)" }}>
                        {isSplitting ? <div className="spinner" style={{ width: "18px", height: "18px" }} /> : splitBlobs.length > 0 ? <><RotateCcw size={16} /><span>{t("restore")}</span></> : <><Scissors size={16} /><span>{t("splitImage")}</span></>}
                     </button>
                     <button disabled={splitBlobs.length === 0} onClick={async () => {
                        if (splitBlobs.length === 0) return;
                        if (isZip) {
                           const zip = new JSZip();
                           splitBlobs.forEach((b, i) => zip.file(`split_${i+1}.${b.type.split('/')[1] || splitConfig.format}`, b));
                           const content = await zip.generateAsync({type:"blob"});
                           const url = URL.createObjectURL(content);
                           const a = document.createElement("a"); a.href = url; a.download = `split_${new Date().getTime()}.zip`; a.click(); URL.revokeObjectURL(url);
                        } else {
                           splitBlobs.forEach((b, i) => {
                              const url = URL.createObjectURL(b);
                              const a = document.createElement("a"); a.href = url; a.download = `split_${i+1}.${b.type.split('/')[1] || splitConfig.format}`; a.click(); URL.revokeObjectURL(url);
                           });
                        }
                     }} className="btn" style={{ height: "2.75rem", fontSize: "0.875rem", backgroundColor: splitBlobs.length > 0 ? "var(--color-primary)" : "rgba(255, 255, 255, 0.05)", color: "white", boxShadow: splitBlobs.length > 0 ? "0 8px 20px rgba(0, 122, 255, 0.3)" : "none" }}>
                        <Download size={16} /><span>{t("downloadAll")}</span>
                     </button>
                  </div>
               ) : (
                  <button onClick={handleStitch} disabled={images.length === 0 || loading || isGenerating} className="btn btn-primary" style={{ width: "100%", height: "2.875rem", fontSize: "0.9375rem", boxShadow: "0 10px 24px rgba(0, 122, 255, 0.35)" }}>
                     <Download size={20} /><span>{t("stitchAndDownload")}</span>
                  </button>
               )}
            </div>
          </div>
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
