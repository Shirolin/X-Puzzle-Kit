import { render } from "preact";
import { App } from "./App";
// @ts-expect-error: Vite inline import
import cssText from "./index.css?inline";
import { StitchTask } from "../core/types";
import { fetchImageData } from "../core/platform";

export async function mountUI(task: StitchTask, splitImageUrl?: string) {
  // 1. 创建或获取外部容器
  let container = document.getElementById("x-puzzle-kit-root");
  if (!container) {
    container = document.createElement("div");
    container.id = "x-puzzle-kit-root";
    document.body.appendChild(container);
  }

  // 2. 创建 Shadow Root 用于样式隔离
  let shadowRoot = container.shadowRoot;
  if (!shadowRoot) {
    shadowRoot = container.attachShadow({ mode: "open" });
  }

  // 3. 注入样式到 Shadow DOM
  let style = shadowRoot.querySelector("#x-puzzle-kit-styles");
  if (!style) {
    style = document.createElement("style");
    style.id = "x-puzzle-kit-styles";
    shadowRoot.appendChild(style);
  }
  style.textContent = cssText;

  // 创建一个内部挂载点
  let mountPoint = shadowRoot.querySelector(".x-puzzle-kit-mount-point");
  if (!mountPoint) {
    mountPoint = document.createElement("div");
    mountPoint.className = "x-puzzle-kit-mount-point";
    mountPoint.setAttribute(
      "style",
      "width: 100%; height: 100%; display: contents;",
    );
    shadowRoot.appendChild(mountPoint);
  }

  // 2. 预加载图片
  const updatedImages = await Promise.all(
    task.userImages.map(async (img) => {
      const response = await fetchImageData(img.originalUrl);
      if (response && response.dataUrl) {
        const res = await fetch(response.dataUrl);
        const blob = await res.blob();
        const bitmap = await createImageBitmap(blob);
        return {
          ...img,
          bitmap,
          width: bitmap.width,
          height: bitmap.height,
        };
      } else {
        console.error("Fetch image failed", response?.error);
        return img;
      }
    }),
  );

  task.userImages = updatedImages;

  // 4. 渲染
  render(
    <App
      task={task}
      initialMode={splitImageUrl ? "split" : "stitch"}
      initialSplitImageUrl={splitImageUrl}
      onClose={() => {
        render(null, mountPoint!);
      }}
    />,
    mountPoint!,
  );
}
