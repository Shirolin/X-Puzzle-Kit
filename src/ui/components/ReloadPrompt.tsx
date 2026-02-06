import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";
import { useEffect } from "preact/hooks";
import { t } from "../../core/i18n";

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
    }
  }, [needRefresh, updateServiceWorker, setNeedRefresh, isBusy]);

  return null;
}
