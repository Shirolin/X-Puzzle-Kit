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

    fetch(message.url)
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => sendResponse({ dataUrl: reader.result });
        reader.readAsDataURL(blob);
      })
      .catch((error) => sendResponse({ error: error.message }));
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
