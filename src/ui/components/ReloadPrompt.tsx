import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";
import { useEffect } from "preact/hooks";
import { t } from "../../core/i18n";

export function ReloadPrompt() {
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
    if (needRefresh) {
      toast(t("pwaUpdateAvailable"), {
        description: t("pwaUpdateReady"),
        action: {
          label: t("pwaRefresh"),
          onClick: () => {
            updateServiceWorker(true);
          },
        },
        cancel: {
          label: t("pwaIgnore"),
          onClick: () => {
            setNeedRefresh(false);
          },
        },
        duration: Infinity, // 保持显示直到用户操作
      });
    }
  }, [needRefresh, updateServiceWorker, setNeedRefresh]);

  return null;
}
