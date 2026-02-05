import {
  Download,
  LayoutGrid,
  Rows,
  Columns,
  Layout,
  Eye,
  EyeOff,
  GripVertical,
  Minus,
  Plus,
  Trash2,
  Zap,
  Link,
  RotateCcw,
  Scissors,
  ChevronUp,
  ChevronDown,
  Coffee,
} from "lucide-preact";
import { ComponentChildren, JSX } from "preact";
import { useRef, useEffect, useLayoutEffect, useState } from "preact/hooks";
import Sortable from "sortablejs";
import JSZip from "jszip";
import { t } from "../../core/i18n";
import { toast } from "sonner";
import {
  ImageNode,
  LayoutType,
  BackgroundColor,
  SplitConfig,
} from "../../core/types";
import { LayoutButton, IconButton, CustomSelect } from "./Common";
import { SplitterControl } from "./SplitterControl";

// 分隔线组件
export const Divider = () => (
  <div
    style={{
      height: "1px",
      background: "var(--color-border)",
      opacity: 0.5,
    }}
  />
);

// 侧边栏卡片包裹组件
export interface SidebarSectionProps {
  title: string;
  headerRight?: ComponentChildren;
  children?: ComponentChildren;
  className?: string;
  style?: JSX.CSSProperties;
}

export const SidebarSection = ({
  title,
  headerRight,
  children,
  className,
  style,
}: SidebarSectionProps) => (
  <section className={`section-block ${className || ""}`} style={style}>
    <div className="section-header-row">
      <h3 className="section-header" style={{ margin: 0 }}>
        {title}
      </h3>
      {headerRight}
    </div>
    {children}
  </section>
);

// 检测当前主题是否为暗色
const detectIsDarkTheme = (element: HTMLElement): boolean => {
  let ancestor: HTMLElement | null = element;
  while (ancestor) {
    const theme = ancestor.getAttribute?.("data-theme");
    if (theme) return theme === "dark";
    ancestor = ancestor.parentElement;
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
};

// 下载文件工具函数
const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// 无限拨轮组件
export interface JogWheelProps {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}

export const JogWheel = ({ value, onChange, min, max }: JogWheelProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startValue = useRef(0);
  const lastX = useRef(0);
  const [offset, setOffset] = useState(0); // 用于背景循环滚动

  const handlePointerDown = (e: PointerEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    lastX.current = e.clientX;
    startValue.current = value;
    containerRef.current?.setPointerCapture(e.pointerId);
    containerRef.current?.classList.add("is-dragging");
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging.current) return;

    const deltaX = e.clientX - lastX.current;
    const totalDeltaX = e.clientX - startX.current;

    // 智能步长：根据位移速度调整敏感度
    // 基础权重 0.5px -> 1单。如果 deltaX 很大，增加权重。
    const speed = Math.abs(deltaX);
    const sensitivity = speed > 5 ? (speed > 15 ? 1.5 : 0.8) : 0.4;

    // 我们基于 totalDeltaX 结合灵敏度来计算新值
    // 但为了平滑，最好使用累计位移
    const newValue = Math.round(startValue.current + totalDeltaX * sensitivity);
    const clamped = Math.max(min, Math.min(max, newValue));

    if (clamped !== value) {
      onChange(clamped);
      // 触觉反馈：数值变化时微震
      if (window.navigator?.vibrate) window.navigator.vibrate(1);
    }

    setOffset((prev) => prev + deltaX);
    lastX.current = e.clientX;
  };

  const handlePointerUp = (e: PointerEvent) => {
    isDragging.current = false;
    containerRef.current?.releasePointerCapture(e.pointerId);
    containerRef.current?.classList.remove("is-dragging");
  };

  return (
    <div
      ref={containerRef}
      className="jog-wheel-track"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: "none" }}
    >
      <div
        className="jog-wheel-scales"
        style={{ transform: `translateX(${offset % 40}px)` }}
      />
      <div className="jog-wheel-center-mark" />
      <div className="jog-wheel-hint">{t("slideRefine")}</div>
    </div>
  );
};

interface SidebarProps {
  mode: "stitch" | "split";
  layout: LayoutType;
  setLayout: (l: LayoutType) => void;
  images: ImageNode[];
  onSortEnd: (oldIdx: number, newIdx: number) => void;
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
  removeImage: (id: string) => void;
  clearAllImages: () => void;

  onStitchFilesSelect: (files: FileList | File[]) => void;
  onImportFromUrl?: () => void;
}

export function Sidebar({
  mode,
  layout,
  setLayout,
  images,
  onSortEnd,
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
  removeImage,
  clearAllImages,
  onStitchFilesSelect,
  onImportFromUrl,
}: SidebarProps) {
  const [isGapOpen, setIsGapOpen] = useState(
    globalGap !== 0 || images.some((img) => img.localGap && img.localGap !== 0),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom FLIP Animation for Shadow DOM compatibility
  const listRef = useRef<HTMLDivElement>(null);
  const prevRects = useRef<Map<string, { top: number; left: number }>>(
    new Map(),
  );

  const onSortEndRef = useRef(onSortEnd);
  useEffect(() => {
    onSortEndRef.current = onSortEnd;
  }, [onSortEnd]);

  useEffect(() => {
    if (!listRef.current) return;

    const sortable = new Sortable(listRef.current, {
      forceFallback: true,
      fallbackClass: "sortable-fallback", // 使用专门的类名
      fallbackOnBody: true, // 放到 body 以避免被容器裁切
      swapThreshold: 0.65,
      animation: 250,
      delay: 100,
      touchStartThreshold: 5,
      delayOnTouchOnly: true,
      handle: ".drag-handle",
      draggable: ".sortable-item",
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      dragClass: "sortable-drag",

      onStart: (evt) => {
        document.body.style.userSelect = "none";
        document.body.style.webkitUserSelect = "none";

        // 触感反馈：排序开始
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(10);
        }

        // fallbackOnBody: true 会把克隆体放到 body，脱离 Shadow DOM 后样式丢失
        // 需要手动为它设置内联样式
        const ghost = document.querySelector(
          ".sortable-fallback",
        ) as HTMLElement;
        const original = evt.item;

        if (ghost && original) {
          const rect = original.getBoundingClientRect();

          // 检测当前主题
          const isDark = detectIsDarkTheme(original);

          // 从原元素获取计算样式
          const computedStyle = window.getComputedStyle(original);

          // 强制锁定尺寸
          ghost.style.width = `${rect.width}px`;
          ghost.style.height = `${rect.height}px`;

          // 根据主题应用不同的颜色方案
          ghost.style.backgroundColor = isDark ? "#1e1e2e" : "#f8fafc";
          ghost.style.borderRadius = computedStyle.borderRadius || "12px";
          ghost.style.border = `2px solid ${isDark ? "#6366f1" : "#3b82f6"}`;
          ghost.style.boxShadow = isDark
            ? "0 15px 50px rgba(99, 102, 241, 0.3), 0 5px 20px rgba(0, 0, 0, 0.5)"
            : "0 15px 50px rgba(59, 130, 246, 0.25), 0 5px 20px rgba(0, 0, 0, 0.15)";
          ghost.style.opacity = "0.95";
          ghost.style.overflow = "hidden";

          // 定位和层级
          ghost.style.position = "fixed";
          ghost.style.zIndex = "100000";
          ghost.style.pointerEvents = "none";
          ghost.style.boxSizing = "border-box";
          ghost.style.margin = "0";
          ghost.style.transformOrigin = "0 0";

          // 隐藏内部无样式内容，只保留干净的占位框
          ghost.innerHTML = "";
        }
      },

      onEnd: (evt) => {
        document.body.style.userSelect = "";
        document.body.style.webkitUserSelect = "";

        const { oldIndex, newIndex } = evt;
        if (
          oldIndex === undefined ||
          newIndex === undefined ||
          oldIndex === newIndex
        )
          return;
        onSortEndRef.current(oldIndex, newIndex);
      },
    });

    // 阻止移动端浏览器的原生长按/拖拽行为
    const container = listRef.current;

    const preventNativeDrag = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".drag-handle")) {
        e.preventDefault();
      }
    };

    container.addEventListener("touchstart", preventNativeDrag, {
      passive: false,
    });
    container.addEventListener("touchmove", preventNativeDrag, {
      passive: false,
    });

    return () => {
      sortable.destroy();
      container.removeEventListener("touchstart", preventNativeDrag);
      container.removeEventListener("touchmove", preventNativeDrag);
    };
  }, []);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    // 2. Measure NEW positions (relative to container)
    const newRects = new Map<string, { top: number; left: number }>();
    const children = Array.from(list.children) as HTMLElement[];

    children.forEach((child) => {
      const id = child.getAttribute("data-id");
      // Use offsetTop/offsetLeft which are stable relative to container (unaffected by scroll)
      if (id)
        newRects.set(id, { top: child.offsetTop, left: child.offsetLeft });
    });

    // 3. FLIP
    children.forEach((child) => {
      const id = child.getAttribute("data-id");
      if (!id) return;

      const prev = prevRects.current.get(id);
      const output = newRects.get(id);

      if (prev && output) {
        const dy = prev.top - output.top;
        const dx = prev.left - output.left;

        // Only animate if position actually changed
        if (dy !== 0 || dx !== 0) {
          // Verify reasonable delta to avoid "initial load" jumps
          // If delta is huge (e.g. > 2000px), it might be an artifact, but let's trust offset for now.

          // Invert
          child.style.transition = "none";
          child.style.transform = `translate(${dx}px, ${dy}px)`;

          // Play
          requestAnimationFrame(() => {
            // Force reflow
            void child.offsetHeight;
            child.style.transition =
              "transform 300ms cubic-bezier(0.2, 0, 0, 1)";
            child.style.transform = "";
          });
        }
      }
    });

    // 4. Update refs for next time
    prevRects.current = newRects;
  }, [images]); // Dependency on images ensures this runs on reorder

  // Mobile Collapse & Touch Logic
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ y: number; time: number } | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    if (window.innerWidth > 768) return;
    dragStartRef.current = { y: e.touches[0].clientY, time: Date.now() };
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !dragStartRef.current || window.innerWidth > 768) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - dragStartRef.current.y;

    // Logic:
    // If expanded (isCollapsed=false): Dragging down (+) collapses.
    // If collapsed (isCollapsed=true): Dragging up (-) expands.

    // Apply resistance if dragging in wrong direction
    if ((!isCollapsed && deltaY < 0) || (isCollapsed && deltaY > 0)) {
      setDragOffset(deltaY * 0.3); // High resistance
    } else {
      setDragOffset(deltaY); // 1:1 following
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || !dragStartRef.current || window.innerWidth > 768) {
      setIsDragging(false);
      return;
    }

    const deltaY = dragOffset;
    const timeDelta = Date.now() - dragStartRef.current.time;
    const velocity = Math.abs(deltaY) / timeDelta;
    const threshold = 80; // px

    let shouldToggle = false;

    // Flick detection (Fast swipe) or Distance threshold
    if (!isCollapsed) {
      // Expanded -> Collapsing (Positive Delta)
      if (deltaY > threshold || (deltaY > 20 && velocity > 0.5)) {
        shouldToggle = true;
      }
    } else {
      // Collapsed -> Expanding (Negative Delta)
      if (deltaY < -threshold || (deltaY < -20 && velocity > 0.5)) {
        shouldToggle = true;
      }
    }

    if (shouldToggle) {
      toggleCollapse();
    }

    // Reset
    setDragOffset(0);
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const toggleCollapse = () => {
    // Only allow toggle on mobile
    if (window.innerWidth <= 768) {
      setIsCollapsed((prev) => !prev);
      // Vibrate for feedback
      if (window.navigator?.vibrate) window.navigator.vibrate(10);
    }
  };

  return (
    <div
      className={`sidebar-panel ${isCollapsed ? "collapsed" : ""}`}
      style={{
        // Apply transform during drag, otherwise let CSS handle it (y=0)
        // Note: For collapsed state, the CSS uses 'height', but here we might want to hint visual slide
        // Ideally we drive everything via CSS classes, but the 'drag' needs inline transform.
        transform: isDragging ? `translateY(${dragOffset}px)` : undefined,
        transition: isDragging ? "none" : undefined, // Disable CSS transition while dragging
      }}
    >
      <div
        className="sidebar-header-mobile"
        onClick={toggleCollapse}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          pointerEvents: "auto",
          cursor: "pointer",
          touchAction: "none",
        }}
      >
        <div className="sidebar-grab-indicator" />
        {isCollapsed && (
          <ChevronUp
            className="sidebar-expand-hint"
            size={20}
            color="#666666" /* Hardcoded Grey to ensure visibility */
            style={{ position: "absolute" }}
          />
        )}
      </div>
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
            <SidebarSection title={t("layoutScheme")}>
              <div className="layout-grid-container">
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
                  active={
                    layout === "HORIZONTAL_Nx1" || layout === "HORIZONTAL_2x1"
                  }
                  onClick={() => setLayout("HORIZONTAL_Nx1")}
                  icon={<Columns size={13} />}
                  label={t("layoutHorizontal")}
                />
                <LayoutButton
                  active={
                    layout === "VERTICAL_1xN" || layout === "VERTICAL_1x2"
                  }
                  onClick={() => setLayout("VERTICAL_1xN")}
                  icon={<Rows size={13} />}
                  label={t("layoutVertical")}
                />
              </div>
            </SidebarSection>

            {/* Elastic Sorting Area */}
            <SidebarSection
              title={t("imageSorting")}
              className="sorting-area"
              headerRight={
                <div className="flex-row-center gap-xs sorting-toolbar">
                  <IconButton
                    icon={<Plus size={14} />}
                    onClick={() => fileInputRef.current?.click()}
                    title={t("uploadImages")}
                    className="sorting-toolbar-btn primary"
                  />
                  {onImportFromUrl && (
                    <IconButton
                      icon={<Link size={14} />}
                      onClick={onImportFromUrl}
                      title={t("importFromUrl")}
                      className="sorting-toolbar-btn secondary"
                    />
                  )}
                  <IconButton
                    icon={<Trash2 size={14} />}
                    onClick={clearAllImages}
                    title={t("clearAll")}
                    className="sorting-toolbar-btn destructive"
                  />
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
                </div>
              }
            >
              <div className="sorting-area-list" ref={listRef}>
                {images.length === 0 ? (
                  <div
                    className="empty-state-message"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t("emptyImageText")}
                  </div>
                ) : (
                  images.map((img, idx) => (
                    <div
                      key={img.id}
                      data-id={img.id}
                      className="sortable-item"
                      style={{
                        opacity: img.visible === false ? 0.6 : 1,
                      }}
                    >
                      <div className="item-header">
                        <GripVertical
                          size={13}
                          className="drag-handle"
                          onDragStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          style={{
                            color: "var(--color-handle)",
                            opacity: 0.6,
                            cursor: "grab",
                            touchAction: "none",
                          }}
                        />
                        <div className="item-thumb-container">
                          {/* 使用 div + background-image 替代 img，彻底杜绝浏览器原生图片拖拽 */}
                          <div
                            className="item-thumb"
                            style={{
                              backgroundImage: `url(${img.thumbnailUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              WebkitTouchCallout: "none",
                              userSelect: "none",
                              cursor: "pointer",
                            }}
                            onClick={(e) => {
                              // Show resolution
                              e.stopPropagation();
                              toast(
                                `${t("imageResolution")}: ${img.width} x ${img.height}`,
                                {
                                  duration: 2000,
                                },
                              );
                            }}
                            title={`${t("clickToShowResolution")}: ${img.width}×${img.height}`}
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
                                      title={t("finalGap")}
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

                        {/* Actions Group (Auto-hidden) - Sandwich Layout */}
                        <div className="item-actions-group">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveItem(idx, "up");
                            }}
                            disabled={idx === 0}
                            className="sort-arrow-bar-btn"
                            title={t("moveUp")}
                          >
                            <ChevronUp size={10} strokeWidth={3} />
                          </button>

                          <div className="flex-row-center gap-sm px-1 py-0.5">
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
                            <IconButton
                              className="btn-icon"
                              onClick={() => removeImage(img.id)}
                              icon={<Trash2 size={13} />}
                              style={{
                                border: "none",
                                background: "none",
                                padding: "2px",
                                color: "#ff453a",
                              }}
                              title={t("removeImage")}
                            />
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveItem(idx, "down");
                            }}
                            disabled={idx === images.length - 1}
                            className="sort-arrow-bar-btn"
                            title={t("moveDown")}
                          >
                            <ChevronDown size={10} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SidebarSection>

            <SidebarSection
              title={t("globalGap")}
              className="gap-control-enhanced"
              headerRight={
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={isGapOpen}
                    onChange={(e) => {
                      const checked = e.currentTarget.checked;
                      setIsGapOpen(checked);
                      if (!checked) {
                        setGlobalGap(0);
                        images.forEach((_, idx) => updateLocalGap(idx, 0));
                      }
                    }}
                  />
                  <span className="slider"></span>
                </label>
              }
            >
              {isGapOpen && (
                <div className="gap-control-content animate-slide-up">
                  <div className="gap-value-pill-container">
                    <div className="control-group-pill gap-value-pill">
                      <div
                        className="pill-reset-trigger"
                        onClick={() => {
                          setGlobalGap(0);
                          images.forEach((_, idx) => updateLocalGap(idx, 0));
                        }}
                      >
                        <RotateCcw size={16} strokeWidth={2.5} />
                      </div>
                      <div className="pill-divider" />
                      <div className="pill-input-group">
                        <input
                          type="number"
                          value={globalGap}
                          onInput={(e) =>
                            setGlobalGap(
                              Math.max(
                                -500,
                                Math.min(
                                  1000,
                                  parseInt(e.currentTarget.value) || 0,
                                ),
                              ),
                            )
                          }
                          className="hide-arrows pill-input"
                        />
                        <span className="pill-unit-text">PX</span>
                      </div>
                    </div>
                  </div>

                  <div className="jog-dial-container">
                    <JogWheel
                      value={globalGap}
                      onChange={setGlobalGap}
                      min={-500}
                      max={1000}
                    />
                  </div>
                </div>
              )}
            </SidebarSection>

            <SidebarSection title={t("settings")} style={{ flexShrink: 0 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {/* Format Selector */}
                <div className="section-row-standard">
                  <h3 className="section-sub-header">{t("formatLabel")}</h3>
                  <div className="format-selector">
                    {(["png", "jpg", "webp"] as const).map((fmt) => (
                      <button
                        key={fmt}
                        className={`format-btn ${outputFormat === fmt ? "active" : ""}`}
                        onClick={() => {
                          setOutputFormat(fmt);
                          if (
                            fmt === "jpg" &&
                            backgroundColor === "transparent"
                          ) {
                            setBackgroundColor("white");
                          }
                        }}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <Divider />

                <div className="section-row-standard">
                  <h3 className="section-sub-header">{t("backgroundColor")}</h3>
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

                <Divider />

                <div className="section-row-standard">
                  <h3 className="section-sub-header">{t("language")}</h3>
                  <CustomSelect
                    value={lang}
                    onChange={setLang}
                    options={[
                      { value: "auto", label: t("auto") },
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

                <Divider />

                <div className="section-row-standard">
                  <h3 className="section-sub-header">{t("support")}</h3>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <a
                      href="https://ifdian.net/a/shirolin"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-icon"
                      title="爱发电 (Afdian)"
                      style={{
                        textDecoration: "none",
                        color: "var(--color-text)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "28px",
                        height: "28px",
                        borderRadius: "6px",
                        backgroundColor: "var(--color-surface-soft)",
                        transition: "all 0.2s",
                      }}
                    >
                      <Zap size={15} />
                    </a>
                    <a
                      href="https://ko-fi.com/shirolin"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-icon"
                      title="Ko-fi"
                      style={{
                        textDecoration: "none",
                        color: "var(--color-text)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "28px",
                        height: "28px",
                        borderRadius: "6px",
                        backgroundColor: "var(--color-surface-soft)",
                        transition: "all 0.2s",
                      }}
                    >
                      <Coffee size={15} />
                    </a>
                  </div>
                </div>
              </div>
            </SidebarSection>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        {mode === "split" ? (
          <div className="footer-button-group">
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
                const format = splitConfig.format || "png";
                if (isZip) {
                  const zip = new JSZip();
                  splitBlobs.forEach((b, i) =>
                    zip.file(
                      `split_${i + 1}.${b.type.split("/")[1] || format}`,
                      b,
                    ),
                  );
                  const content = await zip.generateAsync({ type: "blob" });
                  downloadBlob(content, `split_${Date.now()}.zip`);
                } else {
                  splitBlobs.forEach((b, i) => {
                    downloadBlob(
                      b,
                      `split_${i + 1}.${b.type.split("/")[1] || format}`,
                    );
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
