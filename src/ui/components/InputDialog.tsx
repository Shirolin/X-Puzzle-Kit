import { useRef, useEffect, useState } from "preact/hooks";
import { createPortal } from "preact/compat";
import { X } from "lucide-preact";
import { t } from "../../core/i18n";

interface InputDialogProps {
  isOpen: boolean;
  title: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  container?: HTMLElement | null;
  validator?: (value: string) => string | boolean | undefined;
  errorMessage?: string;
}

export function InputDialog({
  isOpen,
  title,
  placeholder,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  container,
  validator,
}: InputDialogProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue("");
      // Focus input after animation
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleConfirm = () => {
      if (!value.trim()) return;

      if (validator) {
        const validationResult = validator(value);
        if (typeof validationResult === "string") {
          setError(validationResult);
          // Shake animation or focus
          inputRef.current?.focus();
          return;
        } else if (validationResult === false) {
          setError(t("invalidFormat"));
          return;
        }
      }
      onConfirm(value);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter" && value.trim()) handleConfirm();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel, onConfirm, value, validator]);

  const handleManualConfirm = () => {
    if (!value.trim()) return;
    if (validator) {
      const validationResult = validator(value);
      if (typeof validationResult === "string") {
        setError(validationResult);
        return;
      } else if (validationResult === false) {
        setError(t("invalidFormat"));
        return;
      }
    }
    onConfirm(value);
  };

  if (!isOpen) return null;

  const content = (
    <div className="app-overlay" style={{ zIndex: 10000 }}>
      {/* Background click to dismiss */}
      <div style={{ position: "absolute", inset: 0 }} onClick={onCancel} />

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
          gap: "1.25rem",
          boxShadow: "var(--shadow-glass)",
          animation: "fadeIn 0.2s ease-out",
          position: "relative",
          zIndex: 1,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="app-title">{title}</h3>

        <div style={{ position: "relative" }}>
          <input
            ref={inputRef}
            type="text"
            value={value}
            placeholder={placeholder}
            onInput={(e) => {
              setValue(e.currentTarget.value);
              if (error) setError(null);
            }}
            className={`app-input ${error ? "input-error" : ""}`}
            style={{
              paddingRight: "32px",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
          {value && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setValue("");
                setError(null);
                // Ensure focus remains or is restored
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                zIndex: 10,
                outline: "none",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
        {error && (
          <div
            style={{
              color: "var(--color-danger)",
              fontSize: "0.8rem",
              marginTop: "-0.5rem",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn btn-ghost"
            onClick={onCancel}
            style={{ flex: "0 1 auto" }}
          >
            {cancelLabel || t("cancel")}
          </button>
          <button
            className="btn btn-primary"
            disabled={!value.trim()}
            onClick={handleManualConfirm}
            style={{ flex: "1 1 auto" }}
          >
            {confirmLabel || t("import")}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, container || document.body);
}
