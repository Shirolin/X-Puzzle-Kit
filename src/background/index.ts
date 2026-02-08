chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_IMAGE") {
    // SECURITY: Validate URL against allowed domains to prevent SSRF
    try {
      const urlObj = new URL(message.url);
      const allowedDomains = ["twitter.com", "x.com", "pbs.twimg.com"];
      if (!allowedDomains.some((d) => urlObj.hostname.endsWith(d))) {
        sendResponse({ error: "Domain not allowed" });
        return true;
      }
    } catch {
      sendResponse({ error: "Invalid URL" });
      return true;
    }

    // Use AbortController for timeout management
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    fetch(message.url, {
      signal: controller.signal,
      headers: {
        Accept:
          "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    })
      .then((response) => {
        clearTimeout(timeoutId);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.blob();
      })
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          sendResponse({ dataUrl: reader.result });
          // Cleanup reader reference
          reader.onloadend = null;
        };
        reader.onerror = () => sendResponse({ error: "Failed to read blob" });
        reader.readAsDataURL(blob);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        sendResponse({
          error: error.name === "AbortError" ? "Fetch timeout" : error.message,
        });
      });
    return true;
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "split-image",
    title: chrome.i18n.getMessage("contextMenuTitle"),
    contexts: ["image"],
    documentUrlPatterns: ["https://twitter.com/*", "https://x.com/*"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "split-image" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: "OPEN_SPLITTER",
      url: info.srcUrl,
    });
  }
});
