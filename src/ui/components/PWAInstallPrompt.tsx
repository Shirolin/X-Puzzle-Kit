import { useState, useEffect } from "preact/hooks";
import { X } from "lucide-preact";
import { t } from "../../core/i18n";
import { getAssetUrl, getPlatformEnv } from "../../core/platform";
import { APP_CONFIG } from "../../core/config";

export function PWAInstallPrompt() {
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

    // Check dismissal history
    const dismissed = localStorage.getItem(
      APP_CONFIG.STORAGE.IOS_PROMPT_DISMISSED,
    );
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const now = Date.now();
      const daysSince = (now - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSince < APP_CONFIG.UI.IOS_PROMPT_COOLDOWN_DAYS) return;
    }

    // Delay show
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, APP_CONFIG.UI.IOS_PROMPT_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(
      APP_CONFIG.STORAGE.IOS_PROMPT_DISMISSED,
      Date.now().toString(),
    );
  };

  if (!isVisible) return null;

  const getDesc = () => {
    if (platform === "android") return t("installDescAndroid");
    return t(isChrome ? "installDescChrome" : "installDesc");
  };

  return (
    <div
      className={`ios-prompt-container pwa-prompt-${platform} ${isChrome ? "is-chrome" : ""}`}
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
        {/* 指向箭头: iOS Chrome 指向上方，Safari 指向下方; Android 通常指向菜单(上方或下方) */}
        {platform === "ios" && (
          <div
            className={`ios-prompt-arrow ${isChrome ? "is-chrome" : ""}`}
          ></div>
        )}
      </div>
    </div>
  );
}
