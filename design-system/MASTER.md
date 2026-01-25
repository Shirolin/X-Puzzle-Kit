# X Puzzle Stitcher 设计系统 (MASTER)

## 视觉风格 (Style)

**Micro-interactions (微交互风格)**
小而美的动画、基于手势的反馈、触感反馈、上下文相关的交互。适用于交互性强的生产力工具。

## 配色方案 (Colors)

| 角色       | 十六进制 (Hex) | 用途                           |
| ---------- | -------------- | ------------------------------ |
| Primary    | `#3B82F6`      | 主色调，用于主要按钮、激活状态 |
| Secondary  | `#60A5FA`      | 次要色，用于辅助元素、边框     |
| CTA        | `#F97316`      | 强调色，用于下载按钮等关键行动 |
| Background | `#F8FAFC`      | 全局背景色，偏冷色调的灰色     |
| Text       | `#1E293B`      | 正文文本颜色，深靛蓝色         |

## 字体排版 (Typography)

- **字体名称:** Plus Jakarta Sans
- **Google Fonts:** [Plus Jakarta Sans](https://fonts.google.com/share?selection.family=Plus+Jakarta+Sans:wght@300;400;500;600;700)
- **CSS 导入:**
  ```css
  @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap");
  ```
- **风格:** 友好、现代、简洁、专业。

## 布局模式 (Pattern)

**Hero + Features + CTA**

- 预览区域占据核心位置。
- 功能控制面板清晰分区。
- 关键行动按钮（CTA）具有高对比度。

## 交互与效果 (Key Effects)

- **Hover:** 150-300ms 渐变过渡，避免布局抖动。
- **Loading:** 现代化的加载状态动画。
- **Cursor:** 所有可交互元素必须使用 `cursor: pointer`。
- **Transitions:** 平滑的颜色、阴影与圆角变换。

## 检查清单 (Checklist)

- [ ] 严禁使用 Emoji 作为图标，统一使用 Lucide 图标。
- [ ] 所有预览图应有圆角和阴影增强质感。
- [ ] 文字对比度在浅色模式下至少达到 4.5:1。
- [ ] 确保响应式布局，支持不同尺寸的浏览器窗口。
