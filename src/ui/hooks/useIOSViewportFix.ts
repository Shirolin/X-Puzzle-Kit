import { useEffect } from "preact/hooks";
import { isExtension, getPlatformEnv } from "../../core/platform";

/**
 * iOS PWA Viewport Fix
 *
 * This hook dynamically sets a CSS variable `--app-height` to the innerHeight of the window.
 * This is necessary because on iOS, `100vh` includes the address bar and bottom toolbar area,
 * causing content to be cut off or scroll unexpectedly in PWA/fullscreen modes.
 *
 * For Standalone (PWA) mode, we use "100%" to utilize the full screen (including status bar area),
 * relying on the fixed container to size correctly.
 */
export function useIOSViewportFix() {
  useEffect(() => {
    // Only run on client and NOT in extension (content script / popup doesn't need this hack)
    if (typeof window === "undefined" || isExtension) return;

    const setAppHeight = () => {
      const doc = document.documentElement;
      const body = document.body;
      const env = getPlatformEnv();

      // 额外标记来自快捷指令的环境，用于精准样式修复
      if (env.isShortcut) {
        doc.setAttribute("data-is-shortcut", "true");
      }

      if (env.isStandalone) {
        // 关键越狱修复：在 PWA 模式下直接强制设置物理高度，绕过系统 797px 的封锁线
        const h =
          window.outerHeight > 0 ? window.outerHeight : window.innerHeight;
        const heightStr = `${h}px`;

        doc.style.setProperty("--app-height", heightStr);
        // 强制同步宿主层级
        doc.style.height = heightStr;
        if (body) body.style.height = heightStr;
      } else {
        // In browser mode, window.innerHeight is safer to avoid the dynamic URL bar
        doc.style.setProperty("--app-height", `${window.innerHeight}px`);
      }
    };

    // Set initially
    setAppHeight();

    // Reset on resize
    window.addEventListener("resize", setAppHeight);
    window.addEventListener("orientationchange", setAppHeight);

    return () => {
      window.removeEventListener("resize", setAppHeight);
      window.removeEventListener("orientationchange", setAppHeight);
    };
  }, []);
}
