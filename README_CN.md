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
    <a href="https://github.com/shirolin/x-puzzle-stitcher/actions">
      <img src="https://img.shields.io/github/actions/workflow/status/shirolin/x-puzzle-stitcher/release.yml?style=flat-square" alt="Build Status" />
    </a>
    <a href="https://github.com/shirolin/x-puzzle-stitcher/releases/latest">
        <img src="https://img.shields.io/github/v/release/shirolin/x-puzzle-stitcher?label=version&style=flat-square&color=blue" alt="Version" />
    </a>
    <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" />
    <img src="https://img.shields.io/badge/platform-Chrome-important?style=flat-square" alt="Platform" />
  </p>

  <br/>
  
  <p>
    <a href="https://github.com/shirolin/x-puzzle-stitcher/releases/latest">
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

| 功能            | 描述                                                              |
| :-------------- | :---------------------------------------------------------------- |
| 🖼️ **智能拼接** | 将推文中的多张图片一键拼接为无缝长图，支持自定义边距和布局。      |
| 🧩 **创意拆分** | 强大的图片分割器，支持九宫格 (3x3)、四宫格 (2x2) 等多种切分模式。 |
| 💎 **原图画质** | 告别压缩！始终基于原图 (Original) 进行处理，确保最高清晰度导出。  |
| 📏 **消除间隙** | 智能检测并移除 Twitter 网格布局中的视觉间隙，还原图片本真。       |
| 🔒 **隐私优先** | 所有处理逻辑完全在本地浏览器运行，无需上传图片至任何服务器。      |

## 📦 安装指南

### 方法一：下载安装包 (推荐)

1. 前往 **[Releases 页面](https://github.com/shirolin/x-puzzle-stitcher/releases/latest)** 下载最新的 `.zip` 文件。
2. 解压下载的文件。
3. 打开 Chrome 浏览器，访问 `chrome://extensions/`。
4. 开启右上角的 **"开发者模式" (Developer mode)**。
5. 点击 **"加载已解压的扩展程序" (Load unpacked)**，选择解压后的文件夹。

### 方法二：源码编译安装

如果您是开发者，可以从源码构建：

```bash
git clone https://github.com/shirolin/x-puzzle-stitcher.git
cd x-puzzle-stitcher
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

欢迎提交 [Issue](https://github.com/shirolin/x-puzzle-stitcher/issues) 或 Pull Request！

如果这个项目对您有帮助，请给项目点个 Star ⭐️，或请作者喝杯咖啡：

- [爱发电 (Afdian)](https://ifdian.net/a/shirolin)
- [Ko-fi](https://ko-fi.com/shirolin)

## 📄 许可证

[MIT](./LICENSE) License © 2024 shirolin
