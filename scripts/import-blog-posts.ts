/**
 * One-off importer: copies the bundled articles in content/blog into the CMS
 * so they can be edited from /admin.
 *
 *   npm run import:blogs
 *
 * Safe to re-run — slugs that already exist in the CMS are skipped, so edits
 * made in the admin are never overwritten.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { getPayload } from "payload";
import { convertHTMLToLexical, editorConfigFactory } from "@payloadcms/richtext-lexical";
import { JSDOM } from "jsdom";
import config from "@payload-config";

type IndexEntry = {
  slug: string;
  title: string;
  h1: string;
  metaDescription: string;
};

const contentDir = path.join(process.cwd(), "content", "blog");

// Old-site image paths no longer exist; drop them instead of importing holes.
function stripDeadImages(html: string): string {
  return html
    .replace(/<img\b[^>]*?\bsrc=["']\/assets\/[^"']+["'][^>]*\/?>/gi, "")
    .replace(/<img\b[^>]*?\bsrc=["']https?:\/\/(?:www\.)?gomoringa\.in\/[^"']+["'][^>]*\/?>/gi, "")
    .replace(/<p>\s*<\/p>/gi, "");
}

const payload = await getPayload({ config });
const editorConfig = await editorConfigFactory.default({ config: payload.config });
const entries = JSON.parse(readFileSync(path.join(contentDir, "index.json"), "utf-8")) as IndexEntry[];

// Publish dates are spaced a minute apart in index order so the CMS keeps the
// same article sequence the site has always used.
const firstPublished = Date.UTC(2026, 0, 1);
let imported = 0;
let skipped = 0;

for (const [position, entry] of entries.entries()) {
  const existing = await payload.find({
    collection: "posts",
    where: { slug: { equals: entry.slug } },
    limit: 1,
    draft: true,
  });
  if (existing.totalDocs > 0) {
    skipped += 1;
    continue;
  }

  const html = stripDeadImages(readFileSync(path.join(contentDir, `${entry.slug}.html`), "utf-8"));

  await payload.create({
    collection: "posts",
    context: { skipRevalidate: true },
    data: {
      title: entry.h1 || entry.title.replace(/\s*\|\s*Go Moringa\s*$/i, ""),
      slug: entry.slug,
      publishedAt: new Date(firstPublished + position * 60_000).toISOString(),
      content: convertHTMLToLexical({ editorConfig, html, JSDOM }),
      meta: {
        title: entry.title,
        description: entry.metaDescription || undefined,
      },
      _status: "published",
    },
  });
  imported += 1;
}

payload.logger.info(`Imported ${imported} article(s); skipped ${skipped} already in the CMS.`);
process.exit(0);
