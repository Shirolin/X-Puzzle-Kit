# Privacy Policy for X-Puzzle-Kit

**Effective Date:** 2026-02-10

## Introduction

**X-Puzzle-Kit** ("we", "our", or "the toolkit") provides a Chrome extension and a Web/PWA application to help users stitch and split images for X (Twitter). We are committed to transparency: **we do not collect, store, or share any of your personal data**.

## Data Processing & Flow

Depending on which version of the toolkit you use, data is handled as follows:

### 1. Chrome Extension (Desktop)

- **100% Local Processing:** The extension operates entirely within your browser.
- **No Uploads to X-Puzzle-Kit:** The extension does not send image content, image URLs, or settings to our servers.
- **Direct DOM Access:** It reads image URLs directly from the X (Twitter) page you are viewing to load images for stitching or splitting.

### 2. Web App / PWA

- **Tweet Parsing:** To bypass browser cross-origin restrictions (CORS), the Web version sends the post URL you provide to a backend proxy (Cloudflare Workers / Pages Functions) and fetches public post media on demand.
- **Metadata Extraction:** The proxy extracts public image URLs from the post and returns them to your browser.
- **No Tracking or Personal Storage:** We do not log, store personal records of, or track the URLs you submit.
- **Local Processing:** All image processing (stitching and splitting) is performed **locally on your device** using HTML Canvas. Your images are never uploaded to our servers.

### User-Initiated Sharing

When you choose **Post to X**, you can attach split images directly to the X post composer (in the Chrome extension), pass them to your device's share menu, copy an image to your clipboard, or download the files and open X. If you choose X as a share destination or attach images to a post, X may receive and process them under its own privacy policy. X-Puzzle-Kit does not collect or receive the shared files.

## Data Collection and Usage

**We do not collect any personal information.**

- **No User Accounts:** The application operates without any user account system.
- **No Analytics:** We do not track your usage behavior, browsing history, or location.
- **No Cookies:** We do not use tracking cookies. Local preferences are stored in your browser's local storage.

## Permissions Usage (Extension Only)

The extension requests the following permissions to function:

1. **Host Permissions (`https://twitter.com/*`, `https://x.com/*`, `https://pbs.twimg.com/*`)**: To detect and fetch images from X (Twitter) posts, and to attach split images to the X post composer when you choose **Post to X**.
2. **Context Menus**: To add a right-click menu option on images on X (Twitter) so you can open them directly in the image splitter.
3. **Storage**: To save your local preferences (such as language, theme, and preferred export format).

## Third-Party Services

- **Hosting:** The Web version is hosted on Cloudflare Pages.
- **Proxy:** Post parsing and media proxying for the Web version run on Cloudflare Workers / Pages Functions.
- **Images:** Public post images are fetched from X (Twitter) media servers (e.g., `pbs.twimg.com`).

## Changes to This Policy

We may update this Privacy Policy to reflect changes to the toolkit or for legal reasons. We recommend reviewing this page periodically.

## Contact Us

If you have any questions about this Privacy Policy, please contact us via our [GitHub Repository](https://github.com/Shirolin/X-Puzzle-Kit).
