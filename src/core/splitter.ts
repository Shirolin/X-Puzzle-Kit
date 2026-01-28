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
      val.baseVal !== null &&
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

  let drawX = 0;
  let drawY = 0;
  let drawW = width;
  let drawH = height;

  // Handle Auto-Crop for Twitter/Composite Ratios
  if (config.autoCropRatio && config.autoCropRatio > 0) {
    const currentRatio = width / height;
    if (currentRatio > config.autoCropRatio) {
      // Current is wider than target -> Crop sides
      drawW = height * config.autoCropRatio;
      drawX = (width - drawW) / 2;
    } else if (currentRatio < config.autoCropRatio) {
      // Current is taller than target -> Crop top/bottom
      drawH = width / config.autoCropRatio;
      drawY = (height - drawH) / 2;
    }
  }

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

    // Calculate sx/sy based on the auto-cropped area
    // x and y are now relative to the cropped area (drawX, drawY)
    const sx = drawX + x;
    const sy = drawY + y;

    // We strictly do NOT scale. source w/h matches dest w/h
    // This prevents the stretching issue.
    const sw = w;
    const sh = h;

    ctx.drawImage(source, sx, sy, sw, sh, 0, 0, w, h);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        },
        `image/${config.format || "png"}`,
      );
    });
  };

  const blobs: Blob[] = [];

  // Use drawW / drawH for all logic instead of width / height
  // This ensures we are splitting the *effective* (cropped) area
  const effectiveWidth = drawW;
  const effectiveHeight = drawH;

  switch (layout) {
    case "HORIZONTAL_Nx1": {
      // Split horizontally into N columns
      const n = cols || 2; // Default to 2 if not provided
      const totalGap = (n - 1) * gap;
      // Use effectiveWidth
      const segmentWidth = Math.floor((effectiveWidth - totalGap) / n);

      for (let i = 0; i < n; i++) {
        const x = i * (segmentWidth + gap);
        // Use effectiveHeight
        await blobs.push(
          await extractRegion(x, 0, segmentWidth, effectiveHeight),
        );
      }
      break;
    }

    case "VERTICAL_1xN": {
      // Split vertically into N rows
      const n = rows || 2;
      const totalGap = (n - 1) * gap;
      // Use effectiveHeight
      const segmentHeight = Math.floor((effectiveHeight - totalGap) / n);

      for (let i = 0; i < n; i++) {
        const y = i * (segmentHeight + gap);
        // Use effectiveWidth
        await blobs.push(
          await extractRegion(0, y, effectiveWidth, segmentHeight),
        );
      }
      break;
    }

    case "GRID_2x2": {
      // 2 Rows, 2 Cols
      const nCols = 2;
      const nRows = 2;
      const wGap = (nCols - 1) * gap;
      const hGap = (nRows - 1) * gap;

      const segmentWidth = Math.floor((effectiveWidth - wGap) / nCols);
      const segmentHeight = Math.floor((effectiveHeight - hGap) / nRows);

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
      const halfWidth = Math.floor((effectiveWidth - gap) / 2);
      const halfHeight = Math.floor((effectiveHeight - gap) / 2);

      // Left Image (Full Height)
      blobs.push(await extractRegion(0, 0, halfWidth, effectiveHeight));

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
      // Just extract the cropped area in full if no layout matches
      blobs.push(await extractRegion(0, 0, effectiveWidth, effectiveHeight));
  }

  return blobs;
}
