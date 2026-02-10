# Privacy Policy for X-Puzzle-Kit

**Effective Date:** 2026-02-10

## Introduction

**X-Puzzle-Kit** ("we", "our", or "the toolkit") provides a Chrome Extension and a Web/PWA application to help users stitch and split images for X (Twitter). We are committed to transparency and represent that **we do not collect, store, or share any of your personal data**.

## Data Processing & Flow

Depending on which version of the toolkit you use, the data flow varies:

### 1. Chrome Extension (PC)

- **100% Local Processing:** The extension operates entirely within your browser environment.
- **No External Communication:** It does not send any data (image URLs, settings, or content) to any external servers.
- **Direct DOM Access:** It reads image URLs directly from the X (Twitter) page you are viewing to perform stitching.

### 2. Web App / PWA

- **Tweet Parsing:** To bypass browser security restrictions (CORS), the Web version sends the tweet URL you provide to a secure backend proxy (Cloudflare Worker).
- **Metadata Extraction:** The backend parses the tweet to find image URLs and returns them to your browser.
- **No Storage:** We do not log, store, or track the URLs you send. The proxy is transient and stateless.
- **Local Manipulation:** Once the image URLs are returned, all actual image processing (stitching/splitting) is performed **locally on your device** using HTML Canvas. Images are never uploaded to our servers.

## Data Collection and Usage

**We do not collect any personal information.**

- **No User Accounts:** The application operates without any user account system.
- **No Analytics:** We do not track your usage behavior, navigation history, or geographical location.
- **No Cookies:** We do not use tracking cookies. Local preferences are stored in your browser's local storage.

## Permissions Usage (Extension Only)

The extension requests specific permissions to function correctly:

1.  **Host Permissions (`https://twitter.com/*`, `https://x.com/*`)**: To detect and extract image sources directly from the timeline.
2.  **Downloads**: To save the finished images to your device.
3.  **Storage**: To save your local preferences (e.g., preferred file format).

## Third-Party Services

- **Hosting:** The Web version is hosted on Cloudflare Pages.
- **Proxy:** The parsing logic runs on Cloudflare Workers.
- **Images:** Image assets are fetched directly from X (Twitter) servers (e.g., `pbs.twimg.com`).

## Changes to This Policy

We may update our Privacy Policy to reflect changes in our tool or for legal reasons. We recommend reviewing this page periodically.

## Contact Us

If you have any questions about this Privacy Policy, please contact us via our [GitHub Repository](https://github.com/Shirolin/X-Puzzle-Kit).
