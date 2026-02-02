<div align="center">
  <img src="public/assets/icon-128.png" width="120" height="120" alt="Icon" />

  <h1>X-Puzzle-Kit</h1>
  <p>
    <b>Twitter (X) 创意拼图/拆分工具箱</b>
  </p>
  <p>
    <a href="./README.md">English</a> | <b>简体中文</b>
  </p>

  <p>
    <a href="https://github.com/Shirolin/X-Puzzle-Kit/actions">
      <img src="https://img.shields.io/github/actions/workflow/status/Shirolin/X-Puzzle-Kit/release.yml?style=flat-square" alt="Build Status" />
    </a>
    <a href="https://github.com/Shirolin/X-Puzzle-Kit/releases/latest">
      <img src="https://img.shields.io/github/v/release/Shirolin/X-Puzzle-Kit?label=version&style=flat-square&color=blue" alt="Version" />
    </a>
    <img src="https://img.shields.io/badge/license-GPLv3-blue?style=flat-square" alt="License" />
    <img src="https://img.shields.io/badge/platform-Chrome-important?style=flat-square" alt="Platform" />
  </p>

  <br/>
  
  <p>
    <a href="https://github.com/Shirolin/X-Puzzle-Kit/releases/latest">
      <img src="https://img.shields.io/badge/下载最新离线包-Download-2ea44f?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Download" />
    </a>
  </p>
</div>

<br/>

> **X-Puzzle-Kit** 是一款专为 Twitter (X) 设计的现代浏览器扩展。它不仅支持将多张图片无缝拼接为高清长图，还能将大图创意拆分为九宫格，让您的推文展示更具吸引力。

## ✨ 核心亮点

<div align="center">
    <!-- 这里可以放置演示 GIF 或截图 -->
    <!-- <img src="docs/demo.gif" width="100%" alt="Demo" /> -->
</div>

| 功能            | 描述                                                                             |
| :-------------- | :------------------------------------------------------------------------------- |
| 🖼️ **智能拼接** | 根据图片数量（1-4+）**自动预测最佳布局**（如 T型、田字格），无需手动频繁切换。   |
| 🧩 **渲染优化** | 即使图片数不足 4 张，也能在田字格模式下**智能降级**为美观的 T 型布局，拒绝空位。 |
| 💎 **原图画质** | 告别压缩！始终基于原图 (Original) 进行处理，并实现**物理像素级缝隙对齐**。       |
| 📏 **消除间隙** | 智能检测并移除 Twitter 网格布局中的视觉间隙，还原图片本真。                      |
| 🔒 **隐私优先** | 所有处理逻辑完全在本地浏览器运行，无需上传图片至任何服务器。                     |

## 📦 安装指南

### 方法一：下载安装包 (推荐)

1. 前往 **[Releases 页面](https://github.com/Shirolin/X-Puzzle-Kit/releases/latest)** 下载最新的 `.zip` 文件。
2. 解压下载的文件。
3. 打开 Chrome 浏览器，访问 `chrome://extensions/`。
4. 开启右上角的 **"开发者模式" (Developer mode)**。
5. 点击 **"加载已解压的扩展程序" (Load unpacked)**，选择解压后的文件夹。

### 方法二：源码编译安装

如果您是开发者，可以从源码构建：

```bash
git clone https://github.com/Shirolin/X-Puzzle-Kit.git
cd x-puzzle-kit
npm install
npm run build
# 然后在 Chrome 加载 dist 目录
```

## 🛠️ 技术栈

本项目基于现代 Web 技术构建，旨在提供极致的性能和开发体验：

- **Framework**: [React](https://react.dev/) + [Preact](https://preactjs.com/) (Lite weight)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Extension**: Chrome Extension Manifest V3
- **Styling**: TailwindCSS-like Utility Classes / SCSS

## 🔖 版本发布与构建

本项目采用自动化流程管理发布。

### 自动发布

只需推送版本标签，GitHub Actions 会自动打包并发布 Release：

```bash
npm version patch  # 或 minor / major
git push --follow-tags
```

### 手动打包

构建 `.zip` 和 `.crx` 文件：

```bash
npm run package
```

产物将生成在 `release/` 目录下。

## 🤝 贡献与支持

欢迎提交 [Issue](https://github.com/Shirolin/X-Puzzle-Kit/issues) 或 Pull Request！

如果这个项目对您有帮助，请给项目点个 Star ⭐️，或请作者喝杯咖啡：

- [爱发电 (Afdian)](https://ifdian.net/a/shirolin)
- [Ko-fi](https://ko-fi.com/shirolin)

## 📄 许可证

[GPL-3.0](./LICENSE) License © 2026 shirolin
