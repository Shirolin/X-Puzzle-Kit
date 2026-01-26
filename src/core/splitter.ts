import { SplitConfig } from "./types";

/**
 * Split a single image into multiple blobs based on the configuration.
 */
export async function splitImage(
  source: ImageBitmap | HTMLImageElement | HTMLCanvasElement,
  config: SplitConfig,
): Promise<Blob[]> {
  const { layout, rows, cols, gap } = config;
  // Handle SVGAnimatedLength for SVGImageElement, though we expect ImageBitmap or HTMLImageElement
  const getDimension = (
    val: number | SVGAnimatedLength | { baseVal: { value: number } },
  ): number => {
    if (typeof val === "number") return val;
    if (
      typeof val === "object" &&
      val !== null &&
      "baseVal" in val &&
      typeof val.baseVal === "object" &&
      "value" in val.baseVal
    ) {
      return val.baseVal.value;
    }
    return 0;
  };

  // We Cast to unknown first then to a type that covers all possibilities to satisfy TS without any
  const src = source as unknown as {
    width: number | SVGAnimatedLength;
    height: number | SVGAnimatedLength;
  };

  const width = getDimension(src.width);
  const height = getDimension(src.height);

  // Use an offscreen canvas (or a regular canvas element) for cropping
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  // Helper to extract a region as a blob
  const extractRegion = async (
    x: number,
    y: number,
    w: number,
    h: number,
  ): Promise<Blob> => {
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(source, x, y, w, h, 0, 0, w, h);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      }, "image/png"); // Default to PNG for high quality
    });
  };

  const blobs: Blob[] = [];

  switch (layout) {
    case "HORIZONTAL_Nx1": {
      // Split horizontally into N columns
      // Logic: Total Width = N * SegmentWidth + (N-1) * Gap
      // SegmentWidth = (TotalWidth - (N-1) * Gap) / N
      const n = cols || 2; // Default to 2 if not provided
      const totalGap = (n - 1) * gap;
      const segmentWidth = Math.floor((width - totalGap) / n);

      for (let i = 0; i < n; i++) {
        const x = i * (segmentWidth + gap);
        // For the last segment, use the remaining width to avoid rounding errors,
        // but considering the gap logic, we should probably stick to calculated width
        // or just take the rest.
        // To be safe with gaps, let's use fixed segment width.
        await blobs.push(await extractRegion(x, 0, segmentWidth, height));
      }
      break;
    }

    case "VERTICAL_1xN": {
      // Split vertically into N rows
      const n = rows || 2;
      const totalGap = (n - 1) * gap;
      const segmentHeight = Math.floor((height - totalGap) / n);

      for (let i = 0; i < n; i++) {
        const y = i * (segmentHeight + gap);
        await blobs.push(await extractRegion(0, y, width, segmentHeight));
      }
      break;
    }

    case "GRID_2x2": {
      // 2 Rows, 2 Cols
      const nCols = 2;
      const nRows = 2;
      const wGap = (nCols - 1) * gap;
      const hGap = (nRows - 1) * gap;

      const segmentWidth = Math.floor((width - wGap) / nCols);
      const segmentHeight = Math.floor((height - hGap) / nRows);

      // Top-Left
      blobs.push(await extractRegion(0, 0, segmentWidth, segmentHeight));
      // Top-Right
      blobs.push(
        await extractRegion(segmentWidth + gap, 0, segmentWidth, segmentHeight),
      );
      // Bottom-Left
      blobs.push(
        await extractRegion(
          0,
          segmentHeight + gap,
          segmentWidth,
          segmentHeight,
        ),
      );
      // Bottom-Right
      blobs.push(
        await extractRegion(
          segmentWidth + gap,
          segmentHeight + gap,
          segmentWidth,
          segmentHeight,
        ),
      );
      break;
    }

    case "T_SHAPE_3": {
      // Left: 50% width, full height (minus gaps?)
      // Right Top: 50% width, 50% height
      // Right Bottom: 50% width, 50% height
      // Gap logic is tricky here.
      // Left Width = (TotalWidth - Gap) / 2
      // Right X = Left Width + Gap

      const halfWidth = Math.floor((width - gap) / 2);
      const halfHeight = Math.floor((height - gap) / 2);

      // Left Image (Full Height)
      blobs.push(await extractRegion(0, 0, halfWidth, height));

      // Right Top
      blobs.push(
        await extractRegion(halfWidth + gap, 0, halfWidth, halfHeight),
      );

      // Right Bottom
      blobs.push(
        await extractRegion(
          halfWidth + gap,
          halfHeight + gap,
          halfWidth,
          halfHeight,
        ),
      );
      break;
    }

    // Fallback for others or map them to basic splits
    case "HORIZONTAL_2x1":
      return splitImage(source, {
        ...config,
        layout: "HORIZONTAL_Nx1",
        cols: 2,
      });
    case "VERTICAL_1x2":
      return splitImage(source, { ...config, layout: "VERTICAL_1xN", rows: 2 });

    default:
      // console.warn("Unsupported layout for splitting, returning original", layout);
      blobs.push(await extractRegion(0, 0, width, height));
  }

  return blobs;
}
