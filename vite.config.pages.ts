import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

const PAGES_OUT_DIR = path.resolve(__dirname, "dist-pages");
const SITE_URL = "https://shirolin.github.io/X-Puzzle-Kit/";
const WEB_APP_URL = "https://x-puzzle-kit.pages.dev/";

const ROBOTS_TXT = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}sitemap.xml
`;

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
  <url>
    <loc>${SITE_URL}</loc>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="${SITE_URL}?lang=zh" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}" />
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}?lang=zh</loc>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="${SITE_URL}?lang=zh" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}" />
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}?lang=en</loc>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="${SITE_URL}?lang=zh" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}" />
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${WEB_APP_URL}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
`;

export default defineConfig({
  root: path.resolve(__dirname, "landing"),
  publicDir: path.resolve(__dirname, "public"),
  base: "./",
  plugins: [
    {
      name: "github-pages-content",
      apply: "build",
      transformIndexHtml(html) {
        const policy = readFileSync(
          path.resolve(__dirname, ".tmp/github-pages/privacy.html"),
          "utf8",
        );

        return html
          .replaceAll('href="../"', `href="${WEB_APP_URL}"`)
          .replaceAll(
            'href="https://github.com/Shirolin/X-Puzzle-Kit/blob/main/doc/privacy.md"',
            'href="#privacy"',
          )
          .replace(
            "</main>",
            () => `      <details class="privacy wrap" id="privacy">
        <summary>
          <span class="privacy-kicker">Privacy</span>
          <span class="privacy-title" data-i18n="privacyTitle">隐私政策</span>
          <span class="privacy-hint" data-i18n="privacyHint">本地处理 · 无账号 · 无追踪</span>
          <span class="privacy-toggle" aria-hidden="true"></span>
        </summary>
        <article lang="en">
${policy}
        </article>
      </details>
    </main>`,
          );
      },
      closeBundle() {
        mkdirSync(PAGES_OUT_DIR, { recursive: true });
        writeFileSync(path.join(PAGES_OUT_DIR, "robots.txt"), ROBOTS_TXT);
        writeFileSync(path.join(PAGES_OUT_DIR, "sitemap.xml"), SITEMAP_XML);
      },
    },
  ],
  build: {
    outDir: PAGES_OUT_DIR,
    emptyOutDir: true,
  },
});
