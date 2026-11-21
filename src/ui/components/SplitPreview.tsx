import { useEffect, useState } from "preact/hooks";
import { Download } from "lucide-preact";
import type { BackgroundColor, SplitConfig } from "../../core/types";
import {
  calculateCellRegions,
  calculateEffectiveArea,
  getSplitFilename,
} from "../../core/splitLayout";
import {
  getAdaptiveBorderRadius,
  getContainerBackground,
  getSmartBorder,
} from "./SplitEditor/uiUtils";

interface SplitPreviewProps {
  source: ImageBitmap | null;
  blobs: Blob[];
  config: SplitConfig;
  backgroundColor: BackgroundColor;
  viewerScale: number;
}

export function SplitPreview({
  source,
  blobs,
  config,
  backgroundColor,
  viewerScale,
}: SplitPreviewProps) {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    const newUrls = blobs.map((blob) => URL.createObjectURL(blob));
    setUrls(newUrls);
    return () => newUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [blobs]);

  if (!source) return null;

  const { drawW, drawH } = calculateEffectiveArea(
    source.width,
    source.height,
    config.autoCropRatio,
  );
  const regions = calculateCellRegions(config, drawW, drawH);
  const background = getContainerBackground(
    config.fillBackground,
    backgroundColor,
  );

  return (
    <div
      style={{
        position: "relative",
        width: `${drawW}px`,
        height: `${drawH}px`,
        borderRadius: `${12 / viewerScale}px`,
        overflow: "hidden",
        boxShadow: `0 ${4 / viewerScale}px ${20 / viewerScale}px rgba(0, 0, 0, 0.1)`,
        margin: "0 auto",
        backgroundColor: background,
      }}
    >
      {regions.map((region, index) => {
        const blob = blobs[index];
        const url = urls[index];
        if (!url || !blob) return null;
        const filename = getSplitFilename(blob, index, blobs.length);
        const compact =
          Math.min(region.width, region.height) * viewerScale < 32;
        const buttonSize = (compact ? 16 : 26) / viewerScale;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${region.x}px`,
              top: `${region.y}px`,
              width: `${region.width}px`,
              height: `${region.height}px`,
              borderRadius: getAdaptiveBorderRadius(
                region,
                drawW,
                drawH,
                config.gap,
                viewerScale,
              ),
              overflow: "hidden",
            }}
          >
            <img
              src={url}
              alt={`Split ${index + 1}`}
              draggable={false}
              style={{ width: "100%", height: "100%", display: "block" }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                ...getSmartBorder(false, config.gap, viewerScale),
              }}
            />
            <a
              href={url}
              download={filename}
              aria-label={filename}
              title={filename}
              onMouseDown={(event) => event.stopPropagation()}
              onTouchStart={(event) => event.stopPropagation()}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: `${Math.min(region.width, buttonSize)}px`,
                height: `${Math.min(region.height, buttonSize)}px`,
                borderBottomLeftRadius: `${4 / viewerScale}px`,
                backgroundColor: "rgba(0,0,0,0.6)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Download
                aria-hidden="true"
                size={(compact ? 10 : 16) / viewerScale}
              />
            </a>
            {!compact && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  color: "white",
                  fontSize: `${12 / viewerScale}px`,
                  padding: `${4 / viewerScale}px ${8 / viewerScale}px`,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  backdropFilter: "blur(4px)",
                }}
              >
                {region.width} x {region.height} •{" "}
                {blob.type.split("/")[1]?.toUpperCase() || "IMG"}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
