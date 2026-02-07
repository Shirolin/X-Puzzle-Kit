import { useEffect } from "preact/hooks";
import { toast } from "sonner";

/**
 * iOS PWA Viewport Fix
 *
 * This hook dynamically sets a CSS variable `--app-height` to the innerHeight of the window.
 * This is necessary because on iOS, `100vh` includes the address bar and bottom toolbar area,
 * causing content to be cut off or scroll unexpectedly in PWA/fullscreen modes.
 */
export function useIOSViewportFix() {
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    const setAppHeight = () => {
      const doc = document.documentElement;
      const vh = window.innerHeight;
      doc.style.setProperty("--app-height", `${vh}px`);

      // Debug: Show generic viewport info
      // Check if we are in standalone mode
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)",
      ).matches;

      toast.info(`iOS Debug: ${vh}px`, {
        description: `Outer: ${window.outerHeight}\nStandalone: ${isStandalone}\nUA: ${navigator.userAgent.slice(0, 30)}...`,
        duration: 4000,
        position: "top-center", // Ensure visibility
      });
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
