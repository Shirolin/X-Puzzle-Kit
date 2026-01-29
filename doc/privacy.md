# Privacy Policy for X-Puzzle-Kit

**Effective Date:** 2026-01-29

## Introduction

**X-Puzzle-Kit** ("we", "our", or "the extension") is a Chrome Extension designed to help users stitch and split images on Twitter (X.com). We respect your privacy and represent that **we do not collect, store, or share any of your personal data**.

## Data Collection and Usage

**We do not collect any personal information.**

- **No User Accounts:** The extension operates without any user account system.
- **No Analytics:** We do not track your usage behavior or navigation history.
- **No External Servers:** All image processing (stitching and splitting) is performed entirely **locally** within your browser using HTML Canvas and standard Web APIs. No images or data are uploaded to any remote server.

## Permissions Usage

The extension requests specific permissions to function correctly. Here is how we use them:

1.  **Host Permissions (`https://twitter.com/*`, `https://x.com/*`)**:
    - **Purpose:** To access the image elements on the web page you are viewing. This allows the extension to find image sources for stitching.
    - **Privacy:** The extension only reads the DOM needed to extract image URLs. It does not read your DMs, tweets, or profile information.

2.  **Downloads**:
    - **Purpose:** To save the processed (stitched or split) images to your local computer.

3.  **Storage**:
    - **Purpose:** To save your _local preferences_ (e.g., preferred file format as PNG/JPG, file naming patterns).
    - **Privacy:** These settings are stored locally in your browser's sync storage and are not sent to us.

4.  **Context Menus**:
    - **Purpose:** To provide a "Split Image" option when you right-click an image.

## Third-Party Services

This extension operates as a standalone tool. It does not integrate with any third-party analytics or advertising services.

## Changes to This Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.

## Contact Us

If you have any questions about this Privacy Policy, please contact us via the Chrome Web Store support page or at our project repository.
