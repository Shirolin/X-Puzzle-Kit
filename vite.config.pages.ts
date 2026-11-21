import { readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

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
          .replaceAll('href="../"', 'href="https://x-puzzle-kit.pages.dev/"')
          .replace(
            'href="https://github.com/Shirolin/X-Puzzle-Kit/blob/main/doc/privacy.md"',
            'href="#privacy"',
          )
          .replace(
            "</main>",
            () => `  <section class="privacy wrap" id="privacy" lang="en" aria-labelledby="privacy-policy-for-x-puzzle-kit">
        <article>
${policy}
        </article>
      </section>
    </main>`,
          );
      },
    },
  ],
  build: {
    outDir: path.resolve(__dirname, "dist-pages"),
    emptyOutDir: true,
  },
});
