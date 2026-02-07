import { useEffect } from "preact/hooks";

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
    // Only run on client
    if (typeof window === "undefined") return;

    const setAppHeight = () => {
      const doc = document.documentElement;
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)",
      ).matches;

      if (isStandalone) {
        // In standalone mode, use 100% to fill the fixed container (which covers the full screen)
        // detailed layout (status bar, safe area) is handled by CSS env() support.
        doc.style.setProperty("--app-height", "100%");
      } else {
        // In browser mode, avoid the dynamic address bar area
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
