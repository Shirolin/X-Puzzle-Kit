# 解决方案记录：修复 iOS PWA 底部留白问题

## 1. 问题描述

在 iOS 设备上将本项目作为 PWA (Standalone 模式) 安装后，页面底部会出现约 40-50 像素的系统底色（白色或黑边）缝隙。即使设置了全屏 meta 标签和 `100dvh` CSS 属性，该缝隙依然存在。

## 2. 核心背景与原因分析

通过真机调试发现：

- **物理屏幕高度** (以 iPhone 12 为例) 为 **844px**。
- **浏览器汇报高度** (`html.clientHeight`) 仅为 **797px**。
- **系统行为**：iOS PWA 模式下会将 `<html>` 和 `<body>` 元素的高度限制在“安全区域”内，强行扣除了顶部的状态栏高度（约 47px）。即便设置了 `black-translucent`，视口百分比单位（%, vh, dvh）依然无法冲破这个限制，导致容器底部够不到屏幕物理边缘。

## 3. 解决思路：物理绕过 + 视觉冗余

由于常规 CSS 视口单位已被系统逻辑截断，必须采用更底层的“暴力”方案：

1. **物理像素注入**：直接读取窗口物理高度 (`outerHeight`) 并通过 JS 强行写入 `html` 和 `body` 的 `style.height`，强行撑破系统限制。
2. **底层色彩同步**：在 App 渲染前，先行将顶级背景色染成与主题一致的颜色，确保即使存在极小的高度差，用户感知的也是 App 的背景色而非系统白边。

## 4. 具体实施方案

### A. JS 强制拉伸 (`src/ui/hooks/useIOSViewportFix.ts`)

在 PWA 模式下，直接操作 DOM 根元素高度：

```typescript
if (isStandalone) {
  // 获取物理视口高度（忽略系统截断）
  const h = window.outerHeight > 0 ? window.outerHeight : window.innerHeight;
  const heightStr = `${h}px`;

  // 强行改写 CSS 变量和 DOM 属性
  document.documentElement.style.setProperty("--app-height", heightStr);
  document.documentElement.style.height = heightStr;
  document.body.style.height = heightStr;
}
```

### B. 首屏背景抢跑 (`index.html`)

在 `<head>` 中注入阻塞式脚本，确保在首屏呈现前，背景色已同步：

```javascript
(function () {
  const isDark = checkThemeIsDark(); // 逻辑简略
  const bgColor = isDark ? "#000000" : "#f5f5f7";
  document.documentElement.style.backgroundColor = bgColor;
  if (document.body) document.body.style.backgroundColor = bgColor;
})();
```

### C. 越狱定位容器 (`index.html`)

将挂载点容器提升为 `fixed` 定位，使其直接参考窗口坐标而非被截断的 `html`：

```css
#x-puzzle-kit-root {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
}
```

## 5. 预期结果

- `DocClient` 成功恢复至物理屏幕高度（如 844px）。
- 底部白边彻底消失，应用界面完美填充整个屏幕。

## 6. 关于 Shadow DOM 的特殊性

在 Web 开发界，有一种观点认为 **“Shadow DOM 架构下的 iOS PWA 全屏布局是不可修复的”**。这种误解主要源于 Shadow DOM 带来的两层物理障碍：

1.  **样式屏障 (Style Encapsulation)**：外部 `index.html` 的全局修复样式无法渗透进 Shadow DOM 内部。
2.  **根节点隔离 (`:host`)**：即便外部容器长高了，内部的 `:host` 往往依然维持原样，形成“外长内短”的视觉断层。

**为什么本方案能成功？**
本修复方案的核心在于使用了 **`position: fixed`**。在 CSS 的层叠上下文中，`fixed` 定位能够“无视”绝大多数布局层级和 Shadow DOM 的隔离栅栏，直接参考窗口坐标。

通过将 App 根容器“越狱”出 `html/body` 的限制，并配合 JS 强行写入 `outerHeight` 值，我们向业界证明了：**Shadow DOM 并非全屏布局的终点**，只要手段足够底层，即便是在最苛刻的 iOS PWA 环境下，也依然能实现完美的物理全屏。
