export interface ReloadPromptUIProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  desc?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ReloadPromptUI({
  isOpen,
  onConfirm,
  onCancel,
  title,
  desc,
  confirmLabel,
  cancelLabel,
}: ReloadPromptUIProps) {
  if (!isOpen) return null;

  return (
    <div className="pwa-reload-prompt-container">
      <style>{`
        @media (max-width: 768px) {
          .pwa-reload-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 16px !important;
            width: 100% !important;
            justify-content: stretch !important;
          }
          .pwa-btn-ignore, .pwa-btn-refresh {
            width: 100% !important;
            justify-content: center !important;
            display: flex !important;
            padding: 10px 0 !important;
          }
        }
      `}</style>
      <div className="pwa-reload-content">
        <div className="pwa-reload-title">{title}</div>
        <div className="pwa-reload-desc">{desc}</div>
      </div>
      <div className="pwa-reload-actions">
        <button className="pwa-btn-ignore" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button className="pwa-btn-refresh" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
