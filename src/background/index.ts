chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_IMAGE") {
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

console.log("[X-Puzzle-Stitcher] Background worker initialized");
