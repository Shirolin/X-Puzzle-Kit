import { useEffect, useState } from "preact/hooks";
import { JSX } from "preact";
import { t } from "../../core/i18n";

import { SplitConfig } from "../../core/types";

interface SplitPreviewProps {
  blobs: Blob[];
  config: SplitConfig;
  aspectRatio?: number;
}

export function SplitPreview({ blobs, config, aspectRatio }: SplitPreviewProps) {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    // Create Object URLs
    const newUrls = blobs.map((blob) => URL.createObjectURL(blob));
    setUrls(newUrls);

    // Cleanup
    return () => {
      newUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [blobs]);

  if (blobs.length === 0) return null;


  return (
    <div style={{ marginTop: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: 500,
            lineHeight: "1.5rem",
            color: "#111827",
            margin: 0,
          }}
        >
          {t("splitResult")}
        </h3>
      </div>

      <div
        style={{
          display: "grid",
          gap: "4px", // Reduced gap for a tighter look
          width: "100%",
          maxWidth: aspectRatio && aspectRatio < 1 ? `${aspectRatio * 100}%` : "100%", // Handle tall images
          aspectRatio: aspectRatio ? `${aspectRatio}` : "auto",
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
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              overflow: "hidden",
              backgroundColor: "#1e293b", // Darker background for contrast
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              // T-Shape specific positioning
              ...(config.layout === "T_SHAPE_3" ? getTShapeItemStyle(idx) : {})
            }}
          >
            <img
              src={url}
              alt={`Split ${idx + 1}`}
              onLoad={(e) => {
                  const img = e.currentTarget;
                  const resText = `${img.naturalWidth} x ${img.naturalHeight}`;
                  const badge = img.parentNode?.querySelector('.res-badge');
                  if(badge) badge.textContent = resText;
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain", // Ensure full image is visible
                display: "block"
              }}
            />
            <div
              className="overlay"
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                transition: "opacity 0.2s",
                pointerEvents: "none"
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
                textOverflow: "ellipsis"
              }}
            >
              <span className="res-badge">...</span> • {blobs[idx].type.split("/")[1]?.toUpperCase() || "IMG"}
            </div>
            
            <style>{`
               .group:hover .overlay {
                   opacity: 1 !important;
               }
            `}</style>
          </div>
        ))}
      </div>
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
