/**
 * Blog data.
 *
 * Posts are written and published in the CMS (/admin). Articles that predate
 * the CMS still ship as static HTML in content/blog; until one of those is
 * imported it is served from the file, so no indexed URL ever disappears.
 * Once a slug exists in the CMS, the CMS copy wins.
 */

import { cache } from "react";
import indexData from "@/content/blog/index.json";

export type BlogMeta = {
  slug: string;
  phpPath: string;
  title: string;
  h1: string;
  metaDescription: string;
  ogImage: string;
  wordCount: number;
  /** Rendered article body. Only set for posts that live in the CMS. */
  html?: string;
  /** Hero photo uploaded in the CMS, when the editor chose one. */
  heroImage?: string;
};

/** Articles bundled with the codebase (content/blog). */
export const BLOGS: BlogMeta[] = indexData as BlogMeta[];

function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").trim();
  return text ? text.split(/\s+/).length : 0;
}

function mediaUrl(value: unknown): string | undefined {
  if (value && typeof value === "object" && "url" in value) {
    const url = (value as { url?: string | null }).url;
    return url || undefined;
  }
  return undefined;
}

async function loadCmsBlogs(): Promise<BlogMeta[]> {
  if (!process.env.DATABASE_URI) return [];

  try {
    const [{ getPayload }, { default: config }, { convertLexicalToHTML }] = await Promise.all([
      import("payload"),
      import("@payload-config"),
      import("@payloadcms/richtext-lexical/html"),
    ]);
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "posts",
      where: { _status: { equals: "published" } },
      sort: "publishedAt",
      depth: 1,
      limit: 1000,
      pagination: false,
    });

    return docs.map((post) => {
      const html = convertLexicalToHTML({ data: post.content });
      const hero = mediaUrl(post.heroImage);
      return {
        slug: post.slug,
        phpPath: `/blog/${post.slug}.php`,
        title: post.meta?.title || post.title,
        h1: post.title,
        metaDescription: post.meta?.description || "",
        ogImage: mediaUrl(post.meta?.image) || hero || "",
        wordCount: countWords(html),
        html,
        heroImage: hero,
      };
    });
  } catch (error) {
    console.error("Could not load blog posts from the CMS; serving bundled articles only.", error);
    return [];
  }
}

/**
 * Every published article. Bundled articles keep their original order (it
 * drives the "Entry No." numbering); posts created in the CMS follow, oldest
 * first, so existing entry numbers never shift.
 */
export const getAllBlogs = cache(async (): Promise<BlogMeta[]> => {
  const cmsBlogs = await loadCmsBlogs();
  const bySlug = new Map(cmsBlogs.map((b) => [b.slug, b]));
  const bundledSlugs = new Set(BLOGS.map((b) => b.slug));

  return [
    ...BLOGS.map((b) => bySlug.get(b.slug) ?? b),
    ...cmsBlogs.filter((b) => !bundledSlugs.has(b.slug)),
  ];
});

export async function getBlog(slug: string): Promise<BlogMeta | undefined> {
  return (await getAllBlogs()).find((b) => b.slug === slug);
}

export async function getRelatedBlogs(slug: string, limit = 3): Promise<BlogMeta[]> {
  return (await getAllBlogs()).filter((b) => b.slug !== slug).slice(0, limit);
}
