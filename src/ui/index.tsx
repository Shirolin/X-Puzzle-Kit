import { render } from "preact";
import { App } from "./App";
// @ts-expect-error: Vite inline import
import cssText from "./index.css?inline";
import { StitchTask, ImageNode } from "../core/types";

export async function mountUI(task: StitchTask) {
  // 1. 创建或获取外部容器
  let container = document.getElementById("x-puzzle-stitcher-root");
  if (!container) {
    container = document.createElement("div");
    container.id = "x-puzzle-stitcher-root";
    document.body.appendChild(container);
  }

  // 2. 创建 Shadow Root 用于样式隔离
  let shadowRoot = container.shadowRoot;
  if (!shadowRoot) {
    shadowRoot = container.attachShadow({ mode: "open" });
  }

  // 3. 注入样式到 Shadow DOM
  // 使用 ?inline 导入的 CSS 字符串直接注入，确保完全隔离
  // 3. 注入样式到 Shadow DOM
  // 使用 ?inline 导入的 CSS 字符串直接注入，确保完全隔离
  let style = shadowRoot.querySelector("#x-puzzle-stitcher-styles");
  if (!style) {
    style = document.createElement("style");
    style.id = "x-puzzle-stitcher-styles";
    shadowRoot.appendChild(style);
  }
  // 总是更新样式内容以支持 HMR 或重新挂载
  style.textContent = cssText;

  // 创建一个内部挂载点，避免直接渲染到 shadowRoot 根部导致潜在冲突
  let mountPoint = shadowRoot.querySelector(".x-puzzle-stitcher-mount-point");
  if (!mountPoint) {
    mountPoint = document.createElement("div");
    mountPoint.className = "x-puzzle-stitcher-mount-point";
    // 确保挂载点填满容器
    mountPoint.setAttribute(
      "style",
      "width: 100%; height: 100%; display: contents;",
    );
    shadowRoot.appendChild(mountPoint);
  }

  // 2. 预加载图片
  // 使用 Background Script 代理抓取，避免跨域问题
  const updatedImages = await Promise.all(
    task.userImages.map(async (img) => {
      return new Promise<ImageNode>((resolve) => {
        chrome.runtime.sendMessage(
          { type: "FETCH_IMAGE", url: img.originalUrl },
          async (response) => {
            if (response && response.dataUrl) {
              const res = await fetch(response.dataUrl);
              const blob = await res.blob();
              const bitmap = await createImageBitmap(blob);
              resolve({
                ...img,
                bitmap,
                width: bitmap.width,
                height: bitmap.height,
              });
            } else {
              console.error("Fetch image failed", response?.error);
              resolve(img);
            }
          },
        );
      });
    }),
  );

  task.userImages = updatedImages;

  // 4. 渲染
  render(
    <App
      task={task}
      onClose={() => {
        render(null, mountPoint!);
      }}
    />,
    mountPoint!,
  );
}
