import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";
import { useEffect } from "preact/hooks";
import { t } from "../../core/i18n";
import { ReloadPromptUI } from "./ReloadPromptUI";

// PWA Update Signal: 2026-02-11-09-50

export function ReloadPrompt({ isBusy = false }: { isBusy?: boolean }) {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onOfflineReady() {
      toast.success(t("pwaOfflineReady"), {
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

    if (needRefresh && isFromShortcut && !isBusy) {
      console.log("Silent updating SW for shortcut user...");
      updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker, isBusy]);

  // Don't show prompts for Shortcut users (silent update handled above)
  const isFromShortcut =
    new URLSearchParams(window.location.search).get("source") === "shortcut";
  if (isFromShortcut) return null;

  return (
    <ReloadPromptUI
      isOpen={needRefresh}
      onConfirm={() => updateServiceWorker(true)}
      onCancel={() => setNeedRefresh(false)}
      title={t("pwaUpdateAvailable")}
      desc={t("pwaUpdateReady")}
      confirmLabel={t("pwaRefresh")}
      cancelLabel={t("pwaIgnore")}
    />
  );
}
