# X-Puzzle-Kit

[中文](./README_CN.md) | English

**X-Puzzle-Kit** is a Chrome Extension designed for Twitter (X) users to seamlessly stitch or split images with original quality. It's the essential grid toolkit for creators and collectors.

## Features

- **Stitch Images**: Combine multi-image tweets into a single seamless image.
- **Split Images**: Split large images into grids (2x2, 3x3, etc.) for creative posting.
- **High Resolution**: Always processes original quality images.
- **Gap Removal**: Automatically remove gaps between image slices.
- **Smart Layout**: Optimized for Twitter's grid layout.
- **Privacy First**: All processing happens locally in your browser.

## Installation

### From Source (Developer Mode)

1. Clone or download this repository.
2. Run `npm install` to install dependencies.
3. Run `npm run build` to generate the `dist` folder.
4. Open Chrome and navigate to `chrome://extensions`.
5. Enable **Developer mode** (top right).
6. Click **Load unpacked** and select the `dist` folder.

## Project Structure

This project is built with React + TypeScript + Vite. Here is the main directory structure:

- **`src/core`**: Core business logic, including image stitching (`stitcher.ts`) and splitting (`splitter.ts`) algorithms.
- **`src/ui`**: User interface code, including React components (`components/`) and page entries.
- **`src/content`**: Chrome Extension content script, responsible for interacting with Twitter pages.
- **`src/background`**: Chrome Extension background service worker.
- **`public/_locales`**: Multi-language internationalization resources.

## Usage

1. **Stitch**: Navigate to any Tweet with multiple images. Click the "Stitch" button in the toolbar.
2. **Split**: Click the extension icon to open the popup/sidebar mode, upload an image, and choose your split settings.

## License

ISC
