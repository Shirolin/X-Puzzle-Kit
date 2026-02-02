import { useState, useEffect } from "preact/hooks";
import { Share, X } from "lucide-preact";
import { t } from "../../core/i18n";
import { getAssetUrl } from "../../core/platform";

export function IOSInstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isChrome, setIsChrome] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    // 1. Detect iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    
    // 2. Detect Chrome on iOS
    const isChromeIOS = /CriOS/.test(userAgent);
    setIsChrome(isChromeIOS);

    // 3. Detect Standalone (PWA mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone;

    if (!isIOS || isStandalone) return;

    // 4. Check dismissal history
    const dismissed = localStorage.getItem("xpuzzle_ios_prompt_dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const now = Date.now();
      const daysSince = (now - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return; // 7 days cooldown
    }

    // 5. Delay show
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("xpuzzle_ios_prompt_dismissed", Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div
      className={`ios-prompt-container ${isChrome ? "is-chrome" : ""}`}
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
            <div className="ios-prompt-desc">
              {t(isChrome ? "installDescChrome" : "installDesc")}
            </div>
          </div>
        </div>
        {/* 指向箭头: Chrome 指向上方，Safari 指向下方 */}
        <div className={`ios-prompt-arrow ${isChrome ? "is-chrome" : ""}`}></div>
      </div>
    </div>
  );
}
