# 移动端适配详细设计 (Architecture Design)

## 1. 架构方案：平台抽象层 (Environment-Aware Adapter)

为了在同一套代码中兼容插件模式和 Web 模式，引入 `src/core/platform/`。

### 1.1 存储抽象 (Storage)

- **接口**：`IStorage` (get, set, getObject, setObject)
- **实现**：
  - `ChromeStorage` (使用 `chrome.storage.local`)
  - `LocalStorage` (使用原声 `localStorage`)

### 1.2 国际化抽象 (i18n)

- 废弃对 `chrome.i18n` 的直接调用。
- 采用内置 JSON 解析器，根据 `navigator.language` 自动匹配。

## 2. UI 响应式策略 (Responsive Layout)

采用 **CSS Container Queries** 或 **Media Queries** 实现自适应布局。

- **Desktop (>768px)**: 维持 `App-content` 的 `flex-direction: row` (左预览，右工具栏)。
- **Mobile (<768px)**: 切换为 `flex-direction: column`。
  - **预览区**：置顶，高度设为 `40vh` 或自动占比。
  - **控制栏**：通过滚动或抽屉模式显示在下方，增大点击热区。

## 3. PWA 与 分享集成

- **Manifest**: 配置 `share_target`，接收 `POST` 方式提交的图片数据。
- **iOS 桥接**: 页面检测到 `clipboardData` 变化时，提示用户“一键粘贴”。

## 4. 构建与 CI/CD 流程

使用 Vite 的多入口构建功能：

- **Target: Extension**: 逻辑入口为 `manifest.json`。
- **Target: Web**: 逻辑入口为 `index.html`，额外引入 PWA 插件（`vite-plugin-pwa`）。
- **CI/CD**: 发布时自动将 `dist/web` 推送至 `gh-pages` 分支。
