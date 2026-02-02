import { useEffect, useState } from "preact/hooks";
import { JSX } from "preact";

import { SplitConfig } from "../../core/types";

interface SplitPreviewProps {
  source: ImageBitmap | null;
  blobs: Blob[];
  config: SplitConfig;
  aspectRatio?: number;
}

export function SplitPreview({
  source,
  blobs,
  config,
  aspectRatio: _aspectRatio,
}: SplitPreviewProps) {
  const [urls, setUrls] = useState<string[]>([]);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  useEffect(() => {
    if (source) {
      const blob = new Promise<Blob>((resolve) => {
        const canvas = document.createElement("canvas");
        canvas.width = source.width;
        canvas.height = source.height;
        canvas.getContext("2d")?.drawImage(source, 0, 0);
        canvas.toBlob((b) => resolve(b!));
      });
      blob.then((b) => {
        const url = URL.createObjectURL(b);
        setSourceUrl(url);
      });
    }
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
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
          boxShadow: "0 32px 80px rgba(0,0,0,0.9)",
          background: "var(--color-card-bg)",
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
        gap: "8px",
        width: source ? source.width : "100%",
        // aspectRatio: aspectRatio ? `${aspectRatio}` : "auto", // Remove aspect ratio constraint, let content drive it or fixed width drive it
        margin: "0 auto",
        ...getGridStyle(config),
      }}
    >
      {urls.map((url, idx) => (
        <div
          key={idx}
          className="group"
          style={{
            position: "relative",
            border: "1px solid var(--color-item-border)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            backgroundColor: "var(--color-card-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
                fontSize: "1.125rem",
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
              fontSize: "0.75rem",
              padding: "2px 4px",
              textAlign: "center",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span className="res-badge">...</span> •{" "}
            {blobs[idx].type.split("/")[1]?.toUpperCase() || "IMG"}
          </div>

          <style>{`
               .group:hover .overlay {
                   opacity: 1 !important;
               }
            `}</style>
        </div>
      ))}
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
