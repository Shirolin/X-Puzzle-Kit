import { render } from "preact";
import { App } from "./App";
import { Toaster } from "sonner";
import { StitchTask } from "../core/types";
import { isExtension, platformStorage } from "../core/platform";
import { fillXComposer } from "../content/xComposer";
import cssText from "./index.css?inline";
import sonnerCssText from "sonner/dist/styles.css?inline";

// 确保 Shadow DOM 容器存在，并返回各挂载点
function ensureContainer() {
  let container = document.getElementById("x-puzzle-kit-root");
  if (!container) {
    container = document.createElement("div");
    container.id = "x-puzzle-kit-root";
    document.body.appendChild(container);
  }

  let shadowRoot = container.shadowRoot;
  if (!shadowRoot) {
    shadowRoot = container.attachShadow({ mode: "open" });
  }

  // 注入样式
  let style = shadowRoot.querySelector("#x-puzzle-kit-styles");
  if (!style) {
    style = document.createElement("style");
    style.id = "x-puzzle-kit-styles";
    shadowRoot.appendChild(style);
  }
  // 合并应用样式和 Sonner 样式
  if (!style.textContent?.includes("sonner")) {
    style.textContent = sonnerCssText + "\n" + cssText;
  }

  // App 挂载点
  let appRoot = shadowRoot.querySelector("#x-puzzle-app-root");
  if (!appRoot) {
    appRoot = document.createElement("div");
    appRoot.id = "x-puzzle-app-root";
    appRoot.setAttribute(
      "style",
      "width: 100%; height: 100%; display: contents;",
    );
    shadowRoot.appendChild(appRoot);
  }

  // Toast 挂载点 (确保在 App 之上)
  let toastRoot = shadowRoot.querySelector("#x-puzzle-toast-root");
  if (!toastRoot) {
    toastRoot = document.createElement("div");
    toastRoot.id = "x-puzzle-toast-root";
    toastRoot.setAttribute(
      "style",
      "position: absolute; top: 0; left: 0; width: 0; height: 0; z-index: 10000;",
    );
    shadowRoot.appendChild(toastRoot);
  }

  return { appRoot, toastRoot, shadowRoot };
}

// 初始化全局 Toaster
let isToasterMounted = false;

// 允许外部更新 Theme
export function updateToasterTheme(theme: "light" | "dark" | "system") {
  const { toastRoot } = ensureContainer();
  // 重新渲染以更新 Theme Prop
  render(
    <Toaster
      richColors
      closeButton
      position="top-center"
      theme={theme}
      visibleToasts={5}
      offset="20px"
      gap={12}
      toastOptions={{
        className: "x-custom-toast",
        style: {
          margin: "0",
          maxWidth: "360px",
        },
      }}
    />,
    toastRoot,
  );
  isToasterMounted = true;
}

export async function initToaster() {
  ensureContainer();

  if (!isToasterMounted) {
    // 读取保存的主题设置
    const storage = await platformStorage.get({
      "x-puzzle-kit-theme": "system",
    });
    const theme = storage["x-puzzle-kit-theme"] as "light" | "dark" | "system";
    updateToasterTheme(theme);
  }
}

export async function mountUI(task: StitchTask, splitImageUrl?: string) {
  const { appRoot } = ensureContainer();

  // 非阻塞初始化 Toaster，避免拖慢弹窗首帧挂载
  void initToaster();

  render(
    <App
      task={task}
      initialMode={splitImageUrl ? "split" : "stitch"}
      initialSplitImageUrl={splitImageUrl}
      onClose={() => render(null, appRoot)}
      onPostToX={
        isExtension
          ? async (files, signal) => {
              const error = await fillXComposer(files, signal);
              if (!error && !signal.aborted) render(null, appRoot);
              return error;
            }
          : undefined
      }
      mountNode={appRoot as HTMLElement}
    />,
    appRoot,
  );
}
