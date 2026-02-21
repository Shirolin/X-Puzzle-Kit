import { JSX } from "preact";
import { Image as ImageIcon, Trash2 } from "lucide-preact";
import { t } from "../../../core/i18n";

interface CellActionToolbarProps {
  hasReplacement: boolean;
  viewerScale: number;
  onReplaceClick: (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => void;
  onRestoreClick: (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => void;
}

export function CellActionToolbar({
  hasReplacement,
  viewerScale,
  onReplaceClick,
  onRestoreClick,
}: CellActionToolbarProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "8px",
          transform: `scale(${1 / viewerScale})`,
          transformOrigin: "center",
        }}
      >
        <button
          onClick={onReplaceClick}
          style={{
            background: "white",
            color: "black",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
          title={t("splitReplaceImage")}
        >
          <ImageIcon size={16} />
        </button>

        {hasReplacement && (
          <button
            onClick={onRestoreClick}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
            title={t("splitRestoreImage")}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
