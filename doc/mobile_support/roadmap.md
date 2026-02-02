# 移动端适配执行计划 (Roadmap)

## 阶段一：逻辑解耦与环境支持（预计 2-3 天）

- [x] **API 隔离层实现**：创建 `src/core/platform` 目录并实现存储与 i18n 的环境自适应。
- [x] **构建流程配置**：在 `package.json` 增加 `build:web` 命令，配置 Vite 输出静态网页版。
- [x] **仓库资产初始化**：创建 `res/shortcuts/` 目录，管理 iOS 快捷指令逻辑。

## 阶段二：UI 响应式重构（预计 3-4 天）

- [x] **容器层适配**：修改 `index.css`，实现移动端下的上下垂直布局。
- [x] **交互优化**：针对 mobile 优化滑块、色块选择器和按钮的尺寸。
- [x] **图片导入增强**：在 UI 层增加“点击粘贴图片”和“拖拽上传”的视觉反馈。

## 阶段三：PWA 与自动化发布（预计 1-2 天）

- [x] **PWA 配置**：编写 Manifest 和 Service Worker，实现离线使用和“添加到桌面”功能。
- [x] **iOS 快捷指令发布**：编写正式的 `.shortcut` 逻辑并生成引导安装页。
- [x] **CI/CD 并行部署支持**：更新 Action 脚本，整合 GitHub Pages (保留隐私页) 与 Cloudflare Pages 部署流。
