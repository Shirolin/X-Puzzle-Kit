// 模拟 Chrome Extension API
console.log("[TestEnv] Initializing Chrome API Mock...");

// 简单的内存缓存，避免重复请求
const imageCache = new Map<string, string>();

window.chrome = {
  ...window.chrome,
  runtime: {
    ...window.chrome?.runtime,
    // @ts-ignore
    onMessage: { addListener: () => {} },
    // @ts-ignore
    sendMessage: async (message: any, callback: (response: any) => void) => {
      console.log("[TestEnv] Mock sendMessage:", message);

      if (message.type === "FETCH_IMAGE") {
        const url = message.url;

        // 1. 尝试从缓存读取
        if (imageCache.has(url)) {
          callback({ dataUrl: imageCache.get(url) });
          return;
        }

        try {
          // 2. 尝试直接 fetch (注意：真实 Twitter 图片可能有 CORS 限制)
          // 如果是测试用的本地图片或允许跨域的图片，这里会成功
          const response = await fetch(url);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            imageCache.set(url, dataUrl);
            callback({ dataUrl });
          };
          reader.readAsDataURL(blob);
        } catch (e) {
          console.warn("[TestEnv] Fetch failed (likely CORS). Generating placeholder.", e);
          
          // 3. CORS 失败时的回退方案：生成一个带颜色的占位图
          // 这样你仍然可以测试拼图布局逻辑，只是看不到真实图片内容
          const placeholder = createPlaceholder(url);
          callback({ dataUrl: placeholder });
        }
      }
    },
  },
};

function createPlaceholder(text: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 500;
  canvas.height = 500; // 默认正方形
  const ctx = canvas.getContext("2d")!;
  
  // 生成随机背景色
  const hue = Math.floor(Math.random() * 360);
  ctx.fillStyle = `hsl(${hue}, 70%, 80%)`;
  ctx.fillRect(0, 0, 500, 500);
  
  ctx.fillStyle = "#333";
  ctx.font = "20px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("CORS Blocked", 250, 230);
  ctx.font = "12px sans-serif";
  ctx.fillText("Check Console", 250, 260);
  
  return canvas.toDataURL("image/jpeg");
}
