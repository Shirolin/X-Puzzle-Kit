import { useState, useEffect } from "preact/hooks";
import { X } from "lucide-preact";
import { t } from "../../core/i18n";
import { getAssetUrl, getPlatformEnv } from "../../core/platform";
import { APP_CONFIG } from "../../core/config";

import { BeforeInstallPromptEvent } from "../../core/types";

export function PWAInstallPrompt({
  deferredPrompt,
  onInstall,
}: {
  deferredPrompt?: BeforeInstallPromptEvent;
  onInstall?: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android">("ios");

  useEffect(() => {
    const env = getPlatformEnv();
    const userAgent = navigator.userAgent;
    setIsChrome(/CriOS|Chrome/.test(userAgent) && !/Edge|OPR/.test(userAgent));

    // 允许 iOS 和 Android 弹出提醒
    if (!(env.isIOS || env.isAndroid) || env.isStandalone || env.isShortcut)
      return;

    setPlatform(env.isIOS ? "ios" : "android");

    const checkDismissal = () => {
      const dismissed = localStorage.getItem(
        APP_CONFIG.STORAGE.IOS_PROMPT_DISMISSED,
      );
      if (dismissed) {
        const dismissedTime = parseInt(dismissed, 10);
        const now = Date.now();
        const daysSince = (now - dismissedTime) / (1000 * 60 * 60 * 24);
        return daysSince < APP_CONFIG.UI.IOS_PROMPT_COOLDOWN_DAYS;
      }
      return false;
    };

    // Initial check is not needed anymore if we rely solely on triggers,
    // but good to keep if we ever add back auto-show.
    if (checkDismissal()) return;

    // Smart Trigger: Listen for user actions
    const handleSmartTrigger = () => {
      // 核心修复：即使收到触发事件，也要检查冷却时间，防止频繁弹出
      if (checkDismissal()) {
        console.log("PWA install prompt suppressed by cooldown");
        return;
      }
      setIsVisible(true);
    };
    window.addEventListener("pwa-smart-trigger", handleSmartTrigger);

    return () => {
      window.removeEventListener("pwa-smart-trigger", handleSmartTrigger);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(
      APP_CONFIG.STORAGE.IOS_PROMPT_DISMISSED,
      Date.now().toString(),
    );
  };

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      onInstall?.();
      handleClose();
    }
  };

  if (!isVisible) return null;

  const isNativeSupport = platform === "android" && !!deferredPrompt;

  const getDesc = () => {
    if (isNativeSupport) return t("pwaInstallDescNative");
    if (platform === "android") return t("installDescAndroid");
    return t(isChrome ? "installDescChrome" : "installDesc");
  };

  return (
    <div
      className={`ios-prompt-container pwa-prompt-${platform} ${isChrome ? "is-chrome" : ""} ${isNativeSupport ? "is-native" : ""}`}
    >
      <div className="ios-prompt-card apple-blur">
        <button className="ios-prompt-close" onClick={handleClose}>
          <X size={16} />
        </button>
        <div className="ios-prompt-content">
          <img
            src={getAssetUrl("assets/icon-48.png")}
            className="ios-prompt-icon"
            alt="App Icon"
          />
          <div className="ios-prompt-text">
            <div className="ios-prompt-title">{t("installTitle")}</div>
            <div className="ios-prompt-desc">{getDesc()}</div>
          </div>
        </div>

        {isNativeSupport ? (
          <button
            className="pwa-install-button-native"
            onClick={handleNativeInstall}
          >
            {t("pwaInstallBtn")}
          </button>
        ) : (
          /* 指向箭头: iOS Chrome 指向上方，Safari 指向下方; Android 指向右上角菜单 */
          <div
            className={`ios-prompt-arrow ${platform === "ios" && isChrome ? "is-chrome" : ""}`}
          ></div>
        )}
      </div>
    </div>
  );
}
