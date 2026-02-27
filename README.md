<div align="center">
  <img src="public/assets/icon-128.png" width="120" height="120" alt="Icon" />

  <h1>X-Puzzle-Kit</h1>
  <p>
    <b>Creative Puzzle & Stitching Toolkit for X (Twitter)</b>
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

  <a href="https://x-puzzle-kit.pages.dev">
    <img src="marketing/screenshots/拼图-截图.png" width="100%" alt="Hero Image" />
  </a>

  <br/>

  <p>
    <a href="https://x-puzzle-kit.pages.dev">
      <img src="https://img.shields.io/badge/Try_Web_App_(PWA)-Try_Web_App-blue?style=for-the-badge&logo=pwa&logoColor=white" alt="Try Web App" />
    </a>
    <a href="https://github.com/Shirolin/X-Puzzle-Kit/releases/latest">
      <img src="https://img.shields.io/badge/Download_Extension-Download-2ea44f?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Download" />
    </a>
  </p>
</div>

<br/>

## ✨ Highlights

<div align="center">
  <table>
    <tr>
      <td align="center" width="33%"><b>Chrome Extension (PC)</b></td>
      <td align="center" width="33%"><b>Android (PWA)</b></td>
      <td align="center" width="33%"><b>iOS (Shortcut)</b></td>
    </tr>
    <tr>
      <td><img src="public/assets/chrome-ext.gif" width="100%" /></td>
      <td><img src="public/assets/android.gif" width="100%" /></td>
      <td><img src="public/assets/ios.gif" width="100%" /></td>
    </tr>
    <tr>
      <td align="center" valign="top">✨ <b>Timeline Injection</b><br/>Right-click to split</td>
      <td align="center" valign="top">🚀 <b>System Share Target</b><br/>Add to Home Screen</td>
      <td align="center" valign="top">📲 <b>Shortcut Integration</b><br/>One-click from App</td>
    </tr>
  </table>
  <p><i>Seamless experience from Desktop Extension to Mobile PWA</i></p>
</div>

### 🖼️ Stitch & Collect (Stitcher)

- **Creative Assembly**: Love the clever 4-panel splits or manga spreads designed by your favorite artists? One-click to grab these brilliant ideas and **assemble them into a high-res masterpiece** for your personal collection.
- **Smart Prediction**: Auto-detects the best layout (T-shape, Grid) based on image count.
- **Native Integration (Ext only)**: Injects a "🧩 Stitch" button directly into the timeline. From "Admiring" to "Cherishing" in one click.

### ✂️ Smart Splitter

- **Multi-Mode Splitting**: Offers versatile layouts including **2x2 Grid**, **T-Shape (1 big, 2 small)**, and **Custom Rows/Cols (Nx1, 1xN)**, perfectly tailored for Twitter's 4-image grid or vertical strip comics.
- **Precision Editing**: Features **Unified** and **Individual** drag modes. You can scale and move the image globally or adjust each cell independently, including **replacing images** for specific cells.
- **Twitter Optimization**: Built-in one-click **"Twitter Aspect Ratio"** optimization ensures your images are cropped perfectly for the timeline view.
- **Customizable Export**: Adjust **gap sizes**, **fill exposed backgrounds** with colors, and choose to export as a **ZIP archive** or individual images.

### 📱 Platform

- **PWA & Mobile**: Full PWA support with a premium touch UI for iOS/Android.
- **Silent Updates**: Frontend logic updates instantly (especially when launched via iOS Shortcuts), bypassing extension store review delays.
- **Mobile Integration**: Import tweets directly via the system "Share" menu from the **Mobile App or Mobile Web**. Supported via **Web Share Target** (Android) and **Shortcuts** (iOS).

### 🔒 Core

- **Privacy Policy**:
  - **Extension**: **100% Local processing**, zero communication with external servers.
  - **Web/PWA**: Uses a secure proxy (Cloudflare Worker) for tweet URL parsing (no data stored). Final image processing always stays local in your browser.

## 📦 Installation

### Method 1: Web App / PWA (Easiest)

No installation required! Simply visit the web version and add it to your Home Screen for a native-like experience.

- **URL**: [https://x-puzzle-kit.pages.dev](https://x-puzzle-kit.pages.dev)
- **Features**: Supports sharing directly from the **Mobile App or Web version** (via System Share menu).

### Method 2: Chrome Extension (Best for Desktop)

The most efficient way for desktop users.

1. **Web Store (Recommended)**: [Chrome Web Store ↗](https://chromewebstore.google.com/detail/x-puzzle-kit-stitch-split/nadlbdmcfmjinifkoedegmiejfibdikk) Click "Add to Chrome".
2. **Manual Install (Alternative)**:
   - Download the latest `.zip` from the [Releases Page](https://github.com/Shirolin/X-Puzzle-Kit/releases/latest) and unzip it.
   - Go to `chrome://extensions/` in Chrome and enable "Developer mode".
   - Click "Load unpacked" and select the unzipped folder.

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
- **Components**: [Lucide](https://lucide.dev/), [Sonner](https://sonner.stevenly.me/), [SortableJS](https://sortablejs.com/)
- **Styling**: Vanilla CSS (Apple Design Style) / Scss-like Utilities

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
