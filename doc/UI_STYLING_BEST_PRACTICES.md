# X-Puzzle-Kit 多语言排版与 UI 样式最佳实践指南

> [!NOTE]
> 本文档总结了本项目在打造“Apple 级”交互体验及“全球化排版”过程中的技术方案，旨在为后续项目提供可直接复用的 CSS 设计模式与工程逻辑。

---

## 一、 CJK 高级排写对齐方案 (Core Logic)

在多语言 Web 开发中，简单的 `font-family` 声明往往无法在中文（简/繁）、日文、韩文之间达到视觉高度。本项目采用 **“DOM 语种感知 + 属性路由”** 方案。

### 1. 技术链路

1. **i18n 层**：在切换语言时，通过逻辑导出真实的语言代码（如 `zh_CN`, `ja`）。
2. **DOM 层**：将代码注入渲染根节点的 `data-lang` 属性。
3. **CSS 层**：利用属性选择器进行全子节点强制覆盖。

### 2. 精选字体堆栈 (Font Stacks)

这是在不同系统（macOS/Windows/Linux）下保持视觉高级感的黄金组合：

| 语种         | 推荐字体堆栈 (优先级由高到低)                                                             | 核心视觉目标                                |
| :----------- | :---------------------------------------------------------------------------------------- | :------------------------------------------ |
| **简体中文** | `PingFang SC`, `Hiragino Sans GB`, `Heiti SC`, `Microsoft YaHei UI`, `Source Han Sans CN` | 规整、等宽感、适中的字间距                  |
| **繁体中文** | `PingFang TC`, `Lantinghei TC`, `Microsoft JhengHei UI`, `Source Han Sans TC`             | 书法风骨与数字化清晰度                      |
| **日本語**   | `Hiragino Kaku Gothic ProN`, `Hiragino Sans`, `BIZ UDPGothic`, `Meiryo UI`, `Yu Gothic`   | 极高的易读性，平衡汉字与假名高度            |
| **한국어**   | `Apple SD Gothic Neo`, `Malgun Gothic`, `Nanum Gothic`, `Dotum`                           | 简洁、现代、重心平稳的无衬线视觉            |
| **English**  | `SF Pro Text`, `Inter`, `Segoe UI`, `Helvetica Neue`, `Arial`                             | 典型的 Apple 现代主义，极简且专业           |
| **Français** | `SF Pro Display`, `Inter`, `System-ui`                                                    | 适配法语多变重音符号的行高表现              |
| **Español**  | `SF Pro Text`, `Inter`, `Roboto`                                                          | 确保特殊字符（如 ñ, ¿）在紧凑布局下的完整性 |

### 3. CSS 实施模式

针对不同语种，我们不仅设置 `font-family`，还需针对性调整渲染特性：

```css
/* CJK 语种：强制使用无衬线堆栈，开启抗锯齿 */
[data-lang="zh_CN"],
[data-lang="zh_CN"] * {
  font-family:
    "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei UI",
    sans-serif !important;
  -webkit-font-smoothing: antialiased;
}

/* 日文：针对假名特征优化 */
[data-lang="ja"],
[data-lang="ja"] * {
  font-family:
    "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Meiryo", sans-serif !important;
  text-rendering: optimizeLegibility;
}

/* 西欧语系：优先使用 SF Pro 或 Inter，优化变体字符渲染 */
[data-lang="en"],
[data-lang="fr"],
[data-lang="es"],
[data-lang="en"] *,
[data-lang="fr"] *,
[data-lang="es"] * {
  font-family:
    "SF Pro Text", "Inter", "Segoe UI", system-ui, sans-serif !important;
  letter-spacing: -0.01em; /* 提升西文字符的精致感 */
}
```

---

## 二、 Apple 级材质系统 (Materials)

本项目的“高级感”来源于对**玻璃态 (Glassmorphism)** 的精细打磨。

### 1. 深度公式

不要单纯使用 `rgba` 透明度，必须结合模糊与饱和度提升：

- **容器背景**：`rgba(255, 255, 255, 0.7)` (或深色版 `0.1`)
- **核心滤镜**：`backdrop-filter: blur(40px) saturate(180%)`
- **边缘定义**：必须增加 **1px 内部描边** (`border: 1px solid rgba(255,255,255,0.1)`) 来模拟光影切面，这是平庸与高级的分水岭。

### 2. Bento 布局圆角关系

为了实现视觉平滑（Squircle 感）：

- **内圆角公式**：`内圆角 = 外圆角 - 间距 (Padding)`。
- **示例**：外层容器 `border-radius: 20px`，内边距 `12px`，则内部内容物建议用 `8px`。

---

## 三、 交互微动效心得 (Interaction)

好的 UI 应该是“有生命感”的：

1. **点击反馈 (Active State)**：
   不要变色，要**缩放**。`transform: scale(0.96)` 配合 `transition: 0.2s cubic-bezier(0.2, 0, 0, 1)`。这比颜色变化更接近物理按压感。
2. **悬停增强 (Hover)**：
   不要改变背景色，建议使用 `filter: brightness(1.1)` 或 `saturate(1.2)`，这样可以保持品牌色相一致，同时传达活跃信号。

---

## 四、 避坑指南

- **采样陷阱**：在多语言项目中，严禁只测试中英文。日文的假名高度、韩文的字宽都可能撑破布局。
- **变量对齐**：务必使用 RGB 通道定义 CSS 变量（如 `--color-primary-rgb: 0, 122, 255`），以便在 CSS 中灵活使用 `rgba(var(--color-primary-rgb), 0.1)` 制作半透明背景。
