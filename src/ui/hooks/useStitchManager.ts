import { useState, useCallback, useEffect, useRef } from "preact/hooks";
import { ImageNode, LayoutType } from "../../core/types";
import { stitchImages } from "../../core/stitcher";

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

  // Helper to trigger generation with immediate feedback
  const triggerGeneration = useCallback(() => {
    setIsGenerating(true);
    isGeneratingRef.current = true;
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
        return next;
      });
      triggerGeneration();
    },
    [triggerGeneration],
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
        else if (next.length >= 4) setLayout("GRID_2x2");
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
        if (previewUrl && previewUrl.startsWith("blob:"))
          URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
        setIsGenerating(false);
        isGeneratingRef.current = false;
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
        if (!active) return;

        setCanvasSize({ width: canvas.width, height: canvas.height });

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png"),
        );
        if (!active || !blob) return;

        const newUrl = URL.createObjectURL(blob);
        setPreviewUrl((old) => {
          if (old && old.startsWith("blob:")) URL.revokeObjectURL(old);
          return newUrl;
        });
      } catch (e) {
        console.error("Preview generation failed:", e);
      } finally {
        setIsGenerating(false);
        isGeneratingRef.current = false;
      }
    };

    const timer = setTimeout(generate, 400); // 400ms debounce
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [images, layout, globalGap, backgroundColor, previewUrl]);

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
