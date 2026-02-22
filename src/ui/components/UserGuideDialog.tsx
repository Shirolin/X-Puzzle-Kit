import { useState, useEffect, useRef } from "preact/hooks";
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
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Play,
} from "lucide-preact";
import { t } from "../../core/i18n";
import { toast } from "sonner";
import { APP_CONFIG } from "../../core/config";
import { getAssetUrl, getPlatformEnv } from "../../core/platform";

interface UserGuideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  container?: HTMLElement | null;
  canNativeInstall?: boolean;
  onNativeInstall?: () => void;
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
      verticalAlign: "middle",
      position: "relative",
      top: "-1px" /* 光学中心补偿 */,
      margin: "0 6px",
      border: "1px solid var(--color-border)",
      borderRadius: "4px",
      background: "var(--color-surface-hover)",
      padding: "2px",
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
  canNativeInstall = false,
  onNativeInstall,
}: UserGuideDialogProps) {
  const [activeTab, setActiveTab] = useState<"pwa" | "extension" | "flow">(
    __IS_EXTENSION__ ? "extension" : "pwa",
  );
  const [previewMedia, setPreviewMedia] = useState<{
    src: string;
    type: "image" | "video";
  } | null>(null);
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  const mediaRef = useRef<HTMLImageElement>(null);
  const { isAndroid, isIOS } = getPlatformEnv();

  useEffect(() => {
    if (previewMedia) {
      setIsMediaLoading(true);
      // 关键修复：如果图片已经在缓存中加载完成，手动关闭加载动画
      if (mediaRef.current?.complete) {
        setIsMediaLoading(false);
      }
    }
  }, [previewMedia]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const iOSCard = (
    <div className="guide-card">
      <div className="guide-card-header">
        <Apple size={18} />
        <span>iOS (iPhone / iPad)</span>
      </div>
      <div className="guide-card-content">
        <p className="guide-card-text">{t("guideiOSInstall")}</p>
        <div className="guide-card-actions">
          <a
            href={APP_CONFIG.UI.IOS_SHORTCUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary flex-row-center gap-xs"
            title={t("installShortcutTip")}
          >
            <Download size={16} />
            <span>{t("installShortcutBtn")}</span>
          </a>
          <button
            onClick={() =>
              setPreviewMedia({
                src: getAssetUrl("assets/ios.gif"),
                type: "video",
              })
            }
            className="btn btn-ghost flex-row-center gap-xs tutorial-btn"
          >
            <Play size={14} />
            <span>{t("viewDemoVideo")}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const androidCard = (
    <div className="guide-card">
      <div className="guide-card-header">
        <Smartphone size={18} />
        <span>Android</span>
      </div>
      <div className="guide-card-content">
        <div className="guide-card-text-group">
          <p className="guide-card-text">
            {t("guideAndroidInstall")
              .split("PWA")
              .map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <>
                      <span className="pwa-highlight">PWA</span>
                      <span
                        className="help-info-icon-wrapper"
                        onClick={() =>
                          toast(t("pwaWhatIs"), {
                            duration: 6000,
                            icon: (
                              <HelpCircle
                                size={16}
                                style={{ color: "var(--color-primary)" }}
                              />
                            ),
                          })
                        }
                      >
                        <HelpCircle size={12} className="help-info-icon" />
                      </span>
                    </>
                  )}
                </span>
              ))}
          </p>
        </div>

        {canNativeInstall && (
          <p className="guide-card-text native-recommendation">
            {t("guideNativeInstall")}
          </p>
        )}

        <div className="guide-card-actions">
          {canNativeInstall && (
            <button
              onClick={onNativeInstall}
              className="btn btn-primary flex-row-center gap-xs"
            >
              <Download size={16} />
              <span>{t("pwaInstallBtn")}</span>
            </button>
          )}
          <button
            onClick={() =>
              setPreviewMedia({
                src: getAssetUrl("assets/xpk-pwa-install.webp"),
                type: "image",
              })
            }
            className="btn btn-ghost flex-row-center gap-xs tutorial-btn"
          >
            <BookOpen size={14} />
            <span>{t("viewAndroidTutorial") || "查看安装示意图"}</span>
          </button>
          <button
            onClick={() =>
              setPreviewMedia({
                src: getAssetUrl("assets/android.gif"),
                type: "video",
              })
            }
            className="btn btn-ghost flex-row-center gap-xs tutorial-btn"
          >
            <Play size={14} />
            <span>{t("viewDemoVideo")}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderPWAHighlight = (text: string, isTitle: boolean = false) => {
    if (!text.includes("PWA")) return text;
    const parts = text.split("PWA");
    return (
      <>
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <>
                <span className={isTitle ? "" : "pwa-highlight"}>PWA</span>
                <span
                  className="help-info-icon-wrapper"
                  style={isTitle ? { opacity: 0.6 } : {}}
                  onClick={(e) => {
                    e.stopPropagation();
                    toast(t("pwaWhatIs"), {
                      duration: 6000,
                      icon: (
                        <HelpCircle
                          size={16}
                          style={{ color: "var(--color-primary)" }}
                        />
                      ),
                    });
                  }}
                >
                  <HelpCircle
                    size={isTitle ? 12 : 14}
                    className="help-info-icon"
                  />
                </span>
              </>
            )}
          </span>
        ))}
      </>
    );
  };

  const pwaBenefits = [];
  if (isAndroid || (!isAndroid && !isIOS))
    pwaBenefits.push(t("pwaBenefitIntegrated"));
  pwaBenefits.push(t("pwaBenefitFullscreen"));
  if (isIOS || (!isAndroid && !isIOS)) pwaBenefits.push(t("pwaBenefitIOSFix"));

  const pwaBenefitCard = (
    <div className="guide-card benefit-card">
      <div className="guide-card-header">
        <Sparkles size={18} />
        <span>{renderPWAHighlight(t("pwaBenefitTitle"), true)}</span>
      </div>
      <div className="guide-card-content">
        <div className="guide-card-text benefit-list">
          {pwaBenefits.map((benefit, idx) => (
            <div
              key={idx}
              style={{ marginBottom: idx < pwaBenefits.length - 1 ? "4px" : 0 }}
            >
              {renderPWAHighlight(benefit)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const content = (
    <div
      className="user-guide-portal-root"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none", // Let clicks pass to overlay background
      }}
    >
      {/* 独立的高斯模糊背景层，切断与子级滑动动画的 GPU 合成 */}
      <div
        className="app-overlay"
        style={{ position: "absolute", zIndex: -1, pointerEvents: "auto" }}
        onClick={onClose}
      />

      {/* 本体，恢复可点击 */}
      <div
        className="glass-panel user-guide-dialog no-scrollbar"
        style={{ pointerEvents: "auto" }}
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
          {__IS_EXTENSION__ ? (
            <button
              className={`guide-tab ${activeTab === "extension" ? "active" : ""}`}
              onClick={() => setActiveTab("extension")}
            >
              <Puzzle size={16} />
              <span>{t("tabExtension")}</span>
            </button>
          ) : (
            <button
              className={`guide-tab ${activeTab === "pwa" ? "active" : ""}`}
              onClick={() => setActiveTab("pwa")}
            >
              <Smartphone size={16} />
              <span>{t("tabPWA")}</span>
            </button>
          )}
          <button
            className={`guide-tab ${activeTab === "flow" ? "active" : ""}`}
            onClick={() => setActiveTab("flow")}
          >
            <LayoutGrid size={14} />
            <span style={{ letterSpacing: "-0.01em" }}>{t("tabFeatures")}</span>
          </button>
        </div>

        <div className="guide-scroll-content">
          {activeTab === "pwa" && (
            <div className="guide-step-list animate-fade-in">
              {isAndroid ? (
                androidCard
              ) : isIOS ? (
                iOSCard
              ) : (
                <>
                  {iOSCard}
                  {androidCard}
                </>
              )}
              {pwaBenefitCard}
              <div className="guide-card troubleshooting-card">
                <div className="guide-card-header">
                  <AlertTriangle size={16} />
                  <span>{t("troubleshootingTitle")}</span>
                </div>
                <div className="guide-card-content">
                  <p className="guide-card-text secondary-text">
                    {t("troubleshootingIncognito")}
                  </p>
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
                <div className="guide-card-content">
                  <p className="guide-card-text">
                    {renderTextWithIcons(t("guideExtensionStitch"))}
                  </p>
                  <div className="guide-card-actions">
                    <button
                      onClick={() =>
                        setPreviewMedia({
                          src: getAssetUrl("assets/chrome-ext.gif"),
                          type: "video",
                        })
                      }
                      className="btn btn-ghost flex-row-center gap-xs tutorial-btn"
                      style={{ marginTop: "12px" }}
                    >
                      <Play size={14} />
                      <span>{t("viewDemoVideo")}</span>
                    </button>
                  </div>
                </div>
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
              <div className="guide-card">
                <div className="guide-card-header">
                  <Scissors size={18} />
                  <span>{t("guideTechnicalTitle")}</span>
                </div>
                <p className="guide-card-text">{t("guideTechnicalDesc")}</p>
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

      {previewMedia && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 11000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          {/* 同样的隔离原则应用于二级遮罩 */}
          <div
            className="screenshot-preview-overlay animate-fade-in"
            style={{ position: "absolute", zIndex: -1, pointerEvents: "auto" }}
            onClick={(e) => {
              e.stopPropagation();
              setPreviewMedia(null);
            }}
          />
          <div
            className="screenshot-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth:
                previewMedia.type === "video" ? "800px" : "min(90%, 400px)",
              position: "relative",
              minHeight: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "auto",
            }}
          >
            {isMediaLoading && (
              <div className="media-loading-indicator">
                <div
                  className="spinner"
                  style={{ width: "32px", height: "32px" }}
                />
              </div>
            )}
            <img
              key={previewMedia.src}
              ref={mediaRef}
              src={previewMedia.src}
              alt="Preview"
              className={`screenshot-preview-img ${isMediaLoading ? "loading" : "loaded"}`}
              loading="lazy"
              onLoad={() => setIsMediaLoading(false)}
              onError={() => setIsMediaLoading(false)}
              style={{
                maxHeight: "80vh",
                objectFit: "contain",
                transform: "translateZ(0)",
                opacity: isMediaLoading ? 0 : 1,
                transition: "opacity 0.3s ease",
              }}
            />
            <button
              className="screenshot-close-btn"
              onClick={() => setPreviewMedia(null)}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(content, container || document.body);
}
