import { useEffect, useState } from "preact/hooks";
import { JSX } from "preact";

import { SplitConfig } from "../../core/types";
import { calculateEffectiveArea } from "../../core/splitLayout";

interface SplitPreviewProps {
  source: ImageBitmap | null;
  blobs: Blob[];
  config: SplitConfig;
  aspectRatio?: number;
  backgroundColor: import("../../core/types").BackgroundColor;
  viewerScale: number;
}

export function SplitPreview({
  source,
  blobs,
  config,
  aspectRatio: _aspectRatio,
  backgroundColor,
  viewerScale,
}: SplitPreviewProps) {
  const { drawW, drawH } = source
    ? calculateEffectiveArea(source.width, source.height, config.autoCropRatio)
    : { drawW: 0, drawH: 0 };

  const [urls, setUrls] = useState<string[]>([]);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!source) {
      setSourceUrl(null);
      return;
    }

    let active = true;
    let url: string | null = null;

    const canvas = document.createElement("canvas");
    canvas.width = source.width;
    canvas.height = source.height;
    canvas.getContext("2d")?.drawImage(source, 0, 0);

    canvas.toBlob((b) => {
      if (active && b) {
        url = URL.createObjectURL(b);
        setSourceUrl(url);
      }
    });

    return () => {
      active = false;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [source]);

  useEffect(() => {
    // Create Object URLs
    const newUrls = blobs.map((blob) => URL.createObjectURL(blob));
    setUrls(newUrls);

    // Cleanup
    return () => {
      newUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [blobs]);

  if (blobs.length === 0) {
    if (!sourceUrl || !source) return null;
    return (
      <div
        style={{
          width: source.width,
          height: source.height,
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          boxShadow: "var(--shadow-image)",
        }}
      >
        <img
          src={sourceUrl}
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: `${config.gap}px`,
        position: "relative",
        width: `${drawW}px`,
        height: `${drawH}px`,
        borderRadius: `${12 / viewerScale}px`,
        overflow: "hidden",
        boxShadow: `0 ${4 / viewerScale}px ${20 / viewerScale}px rgba(0, 0, 0, 0.1)`,
        margin: "0 auto",
        backgroundColor:
          config.fillBackground && backgroundColor !== "transparent"
            ? backgroundColor === "white"
              ? "#ffffff"
              : "#000000"
            : "transparent",
        ...getGridStyle(config),
      }}
      className=""
    >
      {urls.map((url, idx) => {
        const uiScale = 1 / viewerScale;
        const strokeWidth = Math.max(1, uiScale);
        const inactiveColor = "rgba(255, 255, 255, 0.4)";

        // 计算与外围容器适配的贴合圆角
        const isTopRow = idx < config.cols;
        const isBottomRow = idx >= (config.rows - 1) * config.cols;
        const isLeftCol = idx % config.cols === 0;
        const isRightCol = idx % config.cols === config.cols - 1;

        const innerRadius =
          config.gap === 0
            ? "0px"
            : `${Math.min(4 * uiScale, config.gap / 2)}px`;
        const outerRadius = `${12 * uiScale}px`; // 与外部容器的圆角算法完全保持一致

        const tl = isTopRow && isLeftCol ? outerRadius : innerRadius;
        const tr = isTopRow && isRightCol ? outerRadius : innerRadius;
        const br = isBottomRow && isRightCol ? outerRadius : innerRadius;
        const bl = isBottomRow && isLeftCol ? outerRadius : innerRadius;
        const adaptiveRadius = `${tl} ${tr} ${br} ${bl}`;

        // 智能边框 UI 逻辑
        const smartBorderStyle: JSX.CSSProperties =
          config.gap > 0
            ? { border: `${strokeWidth}px solid rgba(255,255,255,0.2)` }
            : {
                borderRight: `${strokeWidth}px solid ${inactiveColor}`,
                borderBottom: `${strokeWidth}px solid ${inactiveColor}`,
                borderLeft: "none",
                borderTop: "none",
              };

        return (
          <div
            key={idx}
            className="group"
            style={{
              position: "relative",
              ...smartBorderStyle,
              borderRadius: adaptiveRadius,
              overflow: "hidden",
              backgroundColor:
                config.fillBackground && backgroundColor !== "transparent"
                  ? backgroundColor === "white"
                    ? "#ffffff"
                    : "#000000"
                  : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              // T-Shape specific positioning
              ...(config.layout === "T_SHAPE_3" ? getTShapeItemStyle(idx) : {}),
            }}
          >
            <img
              src={url}
              alt={`Split ${idx + 1}`}
              draggable={false}
              onLoad={(e) => {
                const img = e.currentTarget;
                const resText = `${img.naturalWidth} x ${img.naturalHeight}`;
                const badge = img.parentNode?.querySelector(".res-badge");
                if (badge) badge.textContent = resText;
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
            <div
              className="overlay"
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "var(--color-overlay)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                transition: "opacity 0.2s",
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: `${24 / viewerScale}px`,
                }}
              >
                #{idx + 1}
              </span>
            </div>
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
              <span className="res-badge">...</span> •{" "}
              {blobs[idx]?.type?.split("/")[1]?.toUpperCase() || "IMG"}
            </div>

            <style>{`
               .group:hover .overlay {
                   opacity: 1 !important;
               }
            `}</style>
          </div>
        );
      })}
    </div>
  );
}

function getGridStyle(config: SplitConfig): JSX.CSSProperties {
  switch (config.layout) {
    case "GRID_2x2":
      return {
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
      };
    case "VERTICAL_1xN":
      return {
        gridTemplateColumns: "1fr",
        gridTemplateRows: `repeat(${config.rows || 2}, 1fr)`,
      };
    case "HORIZONTAL_Nx1":
      return {
        gridTemplateColumns: `repeat(${config.cols || 2}, 1fr)`,
        gridTemplateRows: "1fr",
      };
    case "T_SHAPE_3":
      return {
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
      };
    default:
      return {
        gridTemplateColumns: "repeat(2, 1fr)",
      };
  }
}

function getTShapeItemStyle(index: number): JSX.CSSProperties {
  // 0: Left -> Column 1, Row 1-2
  // 1: Top Right -> Col 2, Row 1
  // 2: Bottom Right -> Col 2, Row 2
  if (index === 0) {
    return {
      gridColumn: "1",
      gridRow: "1 / span 2",
    };
  }
  return {}; // Normal flow for 1 and 2 (will fill col 2 naturally)
}
