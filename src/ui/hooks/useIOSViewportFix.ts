import { useEffect } from "preact/hooks";

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
      doc.style.setProperty("--app-height", `${window.innerHeight}px`);
    };

    // Set initially
    setAppHeight();

    // Reset on resize
    window.addEventListener("resize", setAppHeight);
    // Orientation change might also need handling, but resize usually covers it
    window.addEventListener("orientationchange", setAppHeight);

    return () => {
      window.removeEventListener("resize", setAppHeight);
      window.removeEventListener("orientationchange", setAppHeight);
    };
  }, []);
}
