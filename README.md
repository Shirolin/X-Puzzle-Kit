<div align="center">
  <img src="public/assets/icon-128.png" width="120" height="120" alt="Icon" />

  <h1>X-Puzzle-Kit</h1>
  <p>
    <b>Creative Puzzle & Stitching Toolkit for Twitter (X)</b>
  </p>
  <p>
    <b>English</b> | <a href="./README_CN.md">简体中文</a>
  </p>

  <p>
    <a href="https://github.com/Shirolin/X-Puzzle-Kit/actions">
      <img src="https://img.shields.io/github/actions/workflow/status/Shirolin/X-Puzzle-Kit/release.yml?style=flat-square" alt="Build Status" />
    </a>
    <a href="https://github.com/Shirolin/X-Puzzle-Kit/releases/latest">
      <img src="https://img.shields.io/github/v/release/Shirolin/X-Puzzle-Kit?label=version&style=flat-square&color=blue" alt="Version" />
    </a>
    <img src="https://img.shields.io/badge/license-GPLv3-blue?style=flat-square" alt="License" />
    <img src="https://img.shields.io/badge/platform-Chrome%20%7C%20Web%20%7C%20PWA-important?style=flat-square" alt="Platform" />
  </p>

  <p>
    <a href="https://Shirolin.github.io/X-Puzzle-Kit/"><b>Try Web App (PWA) ↗</b></a>
  </p>

  <br/>
  
  <p>
    <a href="https://github.com/Shirolin/X-Puzzle-Kit/releases/latest">
      <img src="https://img.shields.io/badge/Download_Latest_Release-2ea44f?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Download" />
    </a>
  </p>
</div>

<br/>

> **X-Puzzle-Kit** is a modern browser extension designed specifically for Twitter (X). It allows you to seamlessly stitch multiple images into a high-quality long image or split a large image into a creative 9-grid layout, making your tweets stand out.

## ✨ Highlights

<div align="center">
    <!-- Demo GIF or Screenshot placeholder -->
    <!-- <img src="docs/demo.gif" width="100%" alt="Demo" /> -->
</div>

| Feature                 | Description                                                                                    |
| :---------------------- | :--------------------------------------------------------------------------------------------- |
| 🖼️ **Smart Stitching**  | Seamlessly combine multiple images from a tweet into one long image with customizable margins. |
| 🧩 **Creative Split**   | Powerful image splitter supporting 3x3 (9-grid), 2x2, and other creative layout modes.         |
| 💎 **Original Quality** | No compression! Always processes and exports images in original quality for maximum clarity.   |
| 📏 **Gap Removal**      | Intelligently detects and removes visual gaps from Twitter's grid layout.                      |
| 📱 **Mobile Optimized** | Full PWA support with a responsive touch-friendly UI for iOS and Android.                      |
| 📤 **Share Target**     | Share tweets directly from the Twitter/X app to the PWA (on Android/Chrome).                   |
| 🔒 **Privacy First**    | All processing happens locally in your browser. No images are uploaded to any server.          |

## 📦 Installation

### Method 1: Web App / PWA (Easiest)

No installation required! Simply visit the web version and add it to your Home Screen for a native-like experience.

- **URL**: [https://Shirolin.github.io/X-Puzzle-Kit/](https://Shirolin.github.io/X-Puzzle-Kit/)
- **Features**: Supports sharing directly from the Twitter/X app (via System Share menu).

### Method 2: Chrome Extension (Best for Desktop)

1. Go to the **[Releases Page](https://github.com/Shirolin/X-Puzzle-Kit/releases/latest)** and download the latest `.zip` file.
2. Unzip the downloaded file.
3. Open Chrome and navigate to `chrome://extensions/`.
4. Enable **"Developer mode"** in the top right corner.
5. Click **"Load unpacked"** and select the unzipped folder.

### Method 3: Build from Source

For developers who want to contribute or build from source:

```bash
git clone https://github.com/Shirolin/X-Puzzle-Kit.git
cd X-Puzzle-Kit
npm install
npm run build      # Build Chrome Extension (dist)
npm run build:web  # Build Web/PWA Version (dist-web)
# For extension, load the 'dist' directory in Chrome
```

## 🛠️ Tech Stack

Built with modern web technologies for performance and experience:

- **Framework**: [React](https://react.dev/) + [Preact](https://preactjs.com/) (Lite weight)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Extension**: Chrome Extension Manifest V3
- **Styling**: TailwindCSS-like Utility Classes / SCSS

## 🔖 Release & Build

This project uses an automated release workflow.

### Automated Release

Simply push a version tag, and GitHub Actions will automatically package and release it:

```bash
npm version patch  # or minor / major
git push --follow-tags
```

### Manual Packaging

To build `.zip` and `.crx` files locally:

```bash
npm run package
```

Artifacts will be generated in the `release/` directory.

## 🤝 Contribution & Support

Issues and Pull Requests are welcome!

If you find this project helpful, please give it a Star ⭐️ or buy me a coffee:

- [Afdian](https://ifdian.net/a/shirolin)
- [Ko-fi](https://ko-fi.com/shirolin)

## 📄 License

[GPL-3.0](./LICENSE) License © 2026 shirolin
