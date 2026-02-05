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
} from "lucide-preact";
import { t } from "../../core/i18n";

interface UserGuideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  container?: HTMLElement | null;
}

export function UserGuideDialog({
  isOpen,
  onClose,
  container,
}: UserGuideDialogProps) {
  const [activeTab, setActiveTab] = useState<"pwa" | "extension" | "flow">(
    "pwa",
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
                <p className="guide-card-text">{t("guideiOSInstall")}</p>
              </div>
              <div className="guide-card">
                <div className="guide-card-header">
                  <Smartphone size={18} />
                  <span>Android</span>
                </div>
                <p className="guide-card-text">{t("guideAndroidInstall")}</p>
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
                <p className="guide-card-text">{t("guideExtensionStitch")}</p>
              </div>
              <div className="guide-card">
                <div className="guide-card-header">
                  <Scissors size={18} />
                  <span>{t("guideSplitTitle")}</span>
                </div>
                <p className="guide-card-text">{t("guideExtensionSplit")}</p>
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
                <p className="guide-card-text">{t("guideFlowOptimization")}</p>
              </div>
              <div className="guide-card">
                <div className="guide-card-header">
                  <BookOpen size={18} />
                  <span>{t("guideLocalGapTitle")}</span>
                </div>
                <p className="guide-card-text">{t("localGapHelp")}</p>
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
