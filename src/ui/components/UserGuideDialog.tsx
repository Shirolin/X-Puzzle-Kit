import { useState, useEffect } from "preact/hooks";
import { createPortal } from "preact/compat";
import {
  X,
  Apple,
  Smartphone,
  Puzzle,
  Scissors,
  LayoutGrid,
  BookOpen,
  Download,
} from "lucide-preact";
import { t } from "../../core/i18n";
import { APP_CONFIG } from "../../core/config";

interface UserGuideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  container?: HTMLElement | null;
}

const StitchIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 512 512"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-icon"
    style={{
      verticalAlign: "text-bottom",
      margin: "0 4px",
      border: "1px solid var(--color-border)",
      borderRadius: "4px",
      background: "var(--color-surface-hover)",
      padding: "1px",
    }}
  >
    <g
      stroke="currentColor"
      stroke-width="32"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect x="32" y="32" width="448" height="448" rx="80" />
      <line x1="256" y1="32" x2="256" y2="480" />
      <line x1="32" y1="256" x2="480" y2="256" />
      <path d="M166 166 L110 110 M166 166 V110 M166 166 H110" />
      <path d="M346 166 L402 110 M346 166 V110 M346 166 H402" />
      <path d="M166 346 L110 402 M166 346 V402 M166 346 H110" />
      <path d="M346 346 L402 402 M346 346 V402 M346 346 H402" />
    </g>
  </svg>
);

const renderTextWithIcons = (text: string) => {
  if (!text.includes("[icon]")) return text;
  const parts = text.split("[icon]");
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && <StitchIcon />}
        </span>
      ))}
    </>
  );
};

export function UserGuideDialog({
  isOpen,
  onClose,
  container,
}: UserGuideDialogProps) {
  const [activeTab, setActiveTab] = useState<"pwa" | "extension" | "flow">(
    __IS_EXTENSION__ ? "extension" : "pwa",
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = (
    <div className="app-overlay" style={{ zIndex: 10000 }} onClick={onClose}>
      <div
        className="glass-panel user-guide-dialog no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="guide-dialog-header">
          <div className="flex-row-center gap-sm">
            <div className="guide-icon-box">
              <BookOpen size={20} />
            </div>
            <h3 className="app-title" style={{ margin: 0 }}>
              {t("userGuideTitle")}
            </h3>
          </div>
          <button className="guide-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="guide-tabs">
          <button
            className={`guide-tab ${activeTab === "pwa" ? "active" : ""}`}
            onClick={() => setActiveTab("pwa")}
          >
            <Smartphone size={16} />
            <span>{t("tabPWA")}</span>
          </button>
          <button
            className={`guide-tab ${activeTab === "extension" ? "active" : ""}`}
            onClick={() => setActiveTab("extension")}
          >
            <Puzzle size={16} />
            <span>{t("tabExtension")}</span>
          </button>
          <button
            className={`guide-tab ${activeTab === "flow" ? "active" : ""}`}
            onClick={() => setActiveTab("flow")}
          >
            <LayoutGrid size={16} />
            <span>{t("tabFeatures")}</span>
          </button>
        </div>

        <div className="guide-scroll-content">
          {activeTab === "pwa" && (
            <div className="guide-step-list animate-fade-in">
              <div className="guide-card">
                <div className="guide-card-header">
                  <Apple size={18} />
                  <span>iOS (iPhone / iPad)</span>
                </div>
                <div className="guide-card-content">
                  {t("guideiOSInstall")
                    .split("\n")
                    .map((line, i) => (
                      <p key={i} className="guide-card-step">
                        {line}
                      </p>
                    ))}
                </div>
                <div style={{ marginTop: "12px" }}>
                  <a
                    href={APP_CONFIG.UI.IOS_SHORTCUT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary flex-row-center gap-xs"
                    title={t("installShortcutTip")}
                    style={{ width: "fit-content", padding: "8px 16px" }}
                  >
                    <Download size={16} />
                    <span>{t("installShortcutBtn")}</span>
                  </a>
                </div>
              </div>
              <div className="guide-card">
                <div className="guide-card-header">
                  <Smartphone size={18} />
                  <span>Android</span>
                </div>
                <div className="guide-card-content">
                  {t("guideAndroidInstall")
                    .split("\n")
                    .map((line, i) => (
                      <p key={i} className="guide-card-step">
                        {line}
                      </p>
                    ))}
                </div>
                <div style={{ marginTop: "12px" }}>
                  <a
                    href="https://github.com/shirolin/x-puzzle-stitcher/wiki/Android-PWA-Guide"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost flex-row-center gap-xs"
                    style={{
                      width: "fit-content",
                      padding: "6px 14px",
                      fontSize: "13px",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <BookOpen size={14} />
                    <span>{t("viewAndroidTutorial") || "📖 查看安卓图文教程"}</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === "extension" && (
            <div className="guide-step-list animate-fade-in">
              <div className="guide-card">
                <div className="guide-card-header">
                  <BookOpen size={18} />
                  <span>{t("guideExtensionTitle")}</span>
                </div>
                <p className="guide-card-text">
                  {t("guideExtensionStitch")
                    .split("\n")
                    .map((line, i) => (
                      <span key={i} style={{ display: "block" }}>
                        {renderTextWithIcons(line)}
                      </span>
                    ))}
                </p>
              </div>
              <div className="guide-card">
                <div className="guide-card-header">
                  <Scissors size={18} />
                  <span>{t("guideSplitTitle")}</span>
                </div>
                <p className="guide-card-text">
                  {t("guideExtensionSplit")
                    .split("\n")
                    .map((line, i) => (
                      <span key={i} style={{ display: "block" }}>
                        {line}
                      </span>
                    ))}
                </p>
              </div>
            </div>
          )}

          {activeTab === "flow" && (
            <div className="guide-step-list animate-fade-in">
              <div className="guide-card">
                <div className="guide-card-header">
                  <LayoutGrid size={18} />
                  <span>{t("twitterOptimize")}</span>
                </div>
                <p className="guide-card-text">
                  {t("guideFlowOptimization")
                    .split("\n")
                    .map((line, i) => (
                      <span key={i} style={{ display: "block" }}>
                        {line}
                      </span>
                    ))}
                </p>
              </div>
              <div className="guide-card">
                <div className="guide-card-header">
                  <BookOpen size={18} />
                  <span>{t("guideLocalGapTitle")}</span>
                </div>
                <p className="guide-card-text">
                  {t("localGapHelp")
                    .split("\n")
                    .map((line, i) => (
                      <span key={i} style={{ display: "block" }}>
                        {line}
                      </span>
                    ))}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="guide-dialog-footer">
          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            onClick={onClose}
          >
            {t("finishTutorial")}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, container || document.body);
}
