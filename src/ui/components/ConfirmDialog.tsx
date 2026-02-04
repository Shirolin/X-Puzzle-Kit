import { useRef, useEffect } from "preact/hooks";
import { createPortal } from "preact/compat";
import { AlertCircle } from "lucide-preact";
import { t } from "../../core/i18n";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  container?: HTMLElement | null;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isDestructive = false,
  onConfirm,
  onCancel,
  container,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const content = (
    <div className="app-overlay" style={{ zIndex: 10000 }}>
      <div
        ref={dialogRef}
        className="glass-panel"
        style={{
          width: "90%",
          maxWidth: "400px",
          padding: "1.5rem",
          borderRadius: "var(--radius-2xl)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          boxShadow: "var(--shadow-glass)",
          animation: "fadeIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {isDestructive && (
            <AlertCircle
              className="w-6 h-6 text-red-500"
              style={{ color: "var(--color-danger)" }}
            />
          )}
          <h3 className="app-title">{title}</h3>
        </div>

        <p
          style={{
            fontSize: "0.95rem",
            lineHeight: "1.5",
            color: "var(--color-text-muted)",
            margin: "0.25rem 0 1rem",
          }}
        >
          {message}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
          }}
        >
          <button className="btn btn-ghost" onClick={onCancel}>
            {cancelLabel || t("cancel")}
          </button>
          <button
            className={`btn ${isDestructive ? "" : "btn-primary"}`}
            style={
              isDestructive
                ? { backgroundColor: "var(--color-danger)", color: "white" }
                : {}
            }
            onClick={onConfirm}
          >
            {confirmLabel || t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, container || document.body);
}
