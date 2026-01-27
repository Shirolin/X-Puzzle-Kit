# UI 实现审计报告 (UI Implementation Audit Report)

**日期:** 2026-01-26
**范围:** `src/ui/App.tsx`, `src/ui/components/*.tsx`, `src/ui/index.css`
**标准:** `DESIGN_STANDARDS.md`

## 执行摘要

当前的视觉输出质量很高，很大程度上符合审美目标（Bento Grid + Glassmorphism）。然而，**代码实现**严重依赖硬编码的内联样式，而不是使用 `index.css` 中定义的集中式 CSS 变量。这导致维护困难，并在多个区域破坏了浅色模式（Light Mode）的适配性。

---

## 🛑 严重违规 (必须修复)

### 1. 硬编码颜色与透明度 (Hardcoded Colors & Transparency)

**违规:** 许多组件使用硬编码的 `rgba()` 值，而不是语义化的 CSS Token。
**影响:** 破坏浅色模式（深色半透明遮罩在浅色背景上看起来很脏），且样式调整不一致。

- **`App.tsx`**:
  - 主模态框背景: `backgroundColor: isThemeDark ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.85)"` -> 应改为 `var(--color-glass-bg)`。
  - 阴影: `boxShadow: "0 24px 80px rgba(0,0,0,0.4)"` -> 应改为 `var(--shadow-glass)`。
  - 主可视化区域: `backgroundColor: "#000"` -> 应改为 `var(--color-background)` 或特定的黑色 Token。
- **`SplitterControl.tsx`**:
  - 输入框背景: `background: "rgba(0, 0, 0, 0.3)"` -> 应改为 `var(--color-item-bg)`。
  - 开关未激活状态: `rgba(255, 255, 255, 0.1)` -> 应改为 `var(--color-surface)`。
- **`SplitPreview.tsx`**:
  - 网格项背景: `backgroundColor: "rgba(255,255,255,0.02)"` -> 应改为 `var(--color-card-bg)`。

### 2. 内联样式滥用 (Inline Styles Overuse)

**违规:** `App.tsx` 包含约 300 行内联样式 (`style={{ ... }}`)。
**影响:** 代码难以阅读；无法复用设计 Token；无法轻易使用媒体查询（响应式设计被硬编码）。

- **示例:**
  - 侧边栏容器: `style={{ width: "262px", borderLeft: ... }}`
  - 头部: `style={{ padding: "0.5rem 1rem", borderBottom: ... }}`

### 3. 排版不一致 (Typography Inconsistency)

**违规:** 字体大小和字重是随意定义的。

- `fontSize: "0.95rem"` (Header)
- `fontSize: "11px"` (Buttons)
- `fontSize: "0.65rem"` (Labels)
  **建议:** 在 CSS 中严格定义（例如 `.text-xs`, `.text-sm`）或使用一致的变量来确保层级感。

---

## ⚠️ 结构/布局问题

### 1. 组件颗粒度 (Component Granularity)

- **问题:** `App.tsx` 包含了整个“查看器”和“侧边栏”布局。
- **建议:**
  - 提取 `<ViewerArea />` (第 370-424 行)。
  - 提取 `<Sidebar />` (第 426-604 行)。
  - 让 `App.tsx` 专注于状态管理，而不是布局细节。

### 2. 间距 (Spacing / Grid Gap)

- **问题:** 间距单位混用 `rem` 和 `px`。
- `gap: "0.75rem"` (Sidebar items) vs `gap: "6px"` (Toolbar).
- **标准:** 坚持使用 4px 网格系统 (4, 8, 12, 16px)。

---

## ✅ 合规区域 (保留)

- **`index.css`**: 变量定义非常出色，与 `DESIGN_STANDARDS.md` 完美契合。
- **`Common.tsx`**: 在 `LayoutButton` 中正确使用了 `var(--color-primary)` 和 `var(--color-surface-soft)`，是一个很好的示例。
- **视觉结果**: “方圆形”(Squircle) 圆角和“玻璃”模糊效果在视觉上应用正确，尽管实现方式（内联 vs 类）有误。

## 下一步计划

1.  **重构 `App.tsx`**: 将内联样式移动到 `index.css` 类中（例如 `.app-modal`, `.viewer-container`）。
2.  **替换颜色**: 搜索并替换所有 `rgba(...)` 为 `var(--color-...)`。
3.  **组件化**: 提取 Sidebar 和 Viewer，清理主文件。
