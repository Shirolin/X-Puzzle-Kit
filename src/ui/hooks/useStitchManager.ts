import { useState, useCallback, useEffect, useRef } from "preact/hooks";
import { ImageNode, LayoutType } from "../../core/types";
import { isCompleteGrid } from "../../core/layout";
import { stitchImages } from "../../core/stitcher";
import { platformCanvas } from "../../core/platform";

export interface StitchOptions {
  initialImages?: ImageNode[];
  initialLayout?: LayoutType;
  initialGap?: number;
  initialBackgroundColor?: string;
}

export function useStitchManager(options: StitchOptions = {}) {
  const [images, setImages] = useState<ImageNode[]>(
    options.initialImages || [],
  );
  const [layout, setLayout] = useState<LayoutType>(
    options.initialLayout || "VERTICAL_1xN",
  );
  const [globalGap, setGlobalGap] = useState(options.initialGap || 0);
  const [backgroundColor, setBackgroundColor] = useState(
    options.initialBackgroundColor || "transparent",
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const isGeneratingRef = useRef(false);
  const immediateRef = useRef(false);
  const previewUrlRef = useRef("");

  // Helper to trigger generation with immediate feedback
  const triggerGeneration = useCallback((immediate = false) => {
    setIsGenerating(true);
    isGeneratingRef.current = true;
    if (immediate) immediateRef.current = true;
  }, []);

  // Standardized setters with auto-generating trigger
  const updateLayout = useCallback(
    (l: LayoutType) => {
      setLayout(l);
      triggerGeneration();
    },
    [triggerGeneration],
  );

  const updateGlobalGap = useCallback(
    (g: number) => {
      setGlobalGap(g);
      triggerGeneration();
    },
    [triggerGeneration],
  );

  const updateBackgroundColor = useCallback(
    (c: string) => {
      setBackgroundColor(c);
      triggerGeneration();
    },
    [triggerGeneration],
  );

  const toggleVisibility = useCallback(
    (index: number) => {
      setImages((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], visible: !next[index].visible };
        const visibleCount = next.filter((img) => img.visible !== false).length;
        if (visibleCount > 3 && layout === "T_SHAPE_3") {
          setLayout(isCompleteGrid(visibleCount) ? "GRID_2x2" : "VERTICAL_1xN");
        }
        return next;
      });
      triggerGeneration();
    },
    [triggerGeneration, layout],
  );

  const updateLocalGap = useCallback(
    (index: number, gap: number) => {
      setImages((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], localGap: gap };
        return next;
      });
      triggerGeneration();
    },
    [triggerGeneration],
  );

  const removeImage = useCallback(
    (id: string) => {
      setImages((prev) => {
        const next = prev.filter((img) => img.id !== id);
        // Auto-recommendation logic moved here
        if (next.length === 1) setLayout("VERTICAL_1xN");
        else if (next.length === 2) setLayout("HORIZONTAL_Nx1");
        else if (next.length === 3) setLayout("T_SHAPE_3");
        return next;
      });
      triggerGeneration();
    },
    [triggerGeneration],
  );

  const clearAllImages = useCallback(() => {
    setImages([]);
    if (previewUrlRef.current && previewUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }
    setPreviewUrl("");
    setCanvasSize({ width: 0, height: 0 });
  }, []);

  const addImages = useCallback(
    (newNodes: ImageNode[]) => {
      setImages((prev) => {
        const next = [...prev, ...newNodes];
        // Auto-recommendation logic
        if (next.length === 1) setLayout("VERTICAL_1xN");
        else if (next.length === 2) setLayout("HORIZONTAL_Nx1");
        else if (next.length === 3) setLayout("T_SHAPE_3");
        else if (next.length >= 4) {
          setLayout(isCompleteGrid(next.length) ? "GRID_2x2" : "VERTICAL_1xN");
        }
        return next;
      });
      triggerGeneration();
    },
    [triggerGeneration],
  );

  // Unified Preview Engine with lifecycle management
  useEffect(() => {
    let active = true;
    const generate = async () => {
      if (!isGeneratingRef.current) return;

      const visibleImages = images.filter((img) => img.visible !== false);
      if (visibleImages.length === 0) {
        if (
          previewUrlRef.current &&
          previewUrlRef.current.startsWith("blob:")
        ) {
          URL.revokeObjectURL(previewUrlRef.current);
          previewUrlRef.current = "";
        }
        setPreviewUrl("");
        setIsGenerating(false);
        isGeneratingRef.current = false;
        immediateRef.current = false;
        return;
      }

      // 若仍有初始图片正在异步解码，暂不绘制，待加载完成后由 triggerGeneration(true) 触发
      if (visibleImages.some((img) => !img.bitmap)) {
        return;
      }

      // Yield for UI rendering
      await new Promise((r) => setTimeout(r, 16));
      if (!active) return;

      try {
        const canvas = await stitchImages(
          visibleImages,
          layout,
          globalGap,
          backgroundColor,
        );
        if (!active) {
          platformCanvas.dispose(canvas);
          return;
        }

        setCanvasSize({ width: canvas.width, height: canvas.height });

        // 预览优先使用 WebP（支持透明背景且编码比无损 PNG 快数倍），正式下载仍按所选格式全分辨率编码
        const blob =
          (await platformCanvas.toBlob(canvas, "image/webp", 0.85)) ??
          (await platformCanvas.toBlob(canvas, "image/png"));
        platformCanvas.dispose(canvas);
        if (!active || !blob) return;

        const newUrl = URL.createObjectURL(blob);
        if (
          previewUrlRef.current &&
          previewUrlRef.current.startsWith("blob:")
        ) {
          URL.revokeObjectURL(previewUrlRef.current);
        }
        previewUrlRef.current = newUrl;
        setPreviewUrl(newUrl);
      } catch (e) {
        console.error("Preview generation failed:", e);
      } finally {
        setIsGenerating(false);
        isGeneratingRef.current = false;
        immediateRef.current = false;
      }
    };

    const delay = immediateRef.current ? 0 : 400;
    const timer = setTimeout(generate, delay);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [images, layout, globalGap, backgroundColor]);

  return {
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
  };
}
