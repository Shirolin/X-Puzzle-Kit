import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";
import { useEffect } from "preact/hooks";
import { t } from "../../core/i18n";

// PWA Update Signal: 2026-02-10-20-35

export function ReloadPrompt({ isBusy = false }: { isBusy?: boolean }) {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onOfflineReady() {
      toast(t("pwaOfflineReady"), {
        duration: 3000,
      });
    },
    onRegistered(r) {
      console.log("SW Registered: " + r);
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
  });

  useEffect(() => {
    const isFromShortcut =
      new URLSearchParams(window.location.search).get("source") === "shortcut";

    if (needRefresh) {
      if (isFromShortcut) {
        // 如果是从快捷指令打开且应用处于空闲状态（无图片数据），自动触发刷新升级
        if (!isBusy) {
          console.log("Silent updating SW for shortcut user...");
          updateServiceWorker(true);
        }
      } else {
        toast.custom(
          (tId) => (
            <div className="pwa-toast-container">
              <div className="pwa-toast-content">
                <div className="pwa-toast-title">{t("pwaUpdateAvailable")}</div>
                <div className="pwa-toast-desc">{t("pwaUpdateReady")}</div>
              </div>
              <div className="pwa-toast-actions">
                <button
                  className="pwa-btn-ignore"
                  onClick={() => {
                    toast.dismiss(tId);
                    setNeedRefresh(false);
                  }}
                >
                  {t("pwaIgnore")}
                </button>
                <button
                  className="pwa-btn-refresh"
                  onClick={() => updateServiceWorker(true)}
                >
                  {t("pwaRefresh")}
                </button>
              </div>
            </div>
          ),
          {
            duration: Infinity,
            id: "pwa-update-toast", // Ensure only one exists
            className: "pwa-toast-wrapper-hack", // Sonner might wrap it, but we want our own style
          },
        );
      }
    }
  }, [needRefresh, updateServiceWorker, setNeedRefresh, isBusy]);

  return null;
}
