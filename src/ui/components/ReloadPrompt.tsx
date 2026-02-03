import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";
import { useEffect } from "preact/hooks";

export function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered: " + r);
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast("发现新版本可用", {
        description: "更新以获得最新功能与修复",
        action: {
          label: "刷新",
          onClick: () => {
            updateServiceWorker(true);
          },
        },
        cancel: {
          label: "忽略",
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
