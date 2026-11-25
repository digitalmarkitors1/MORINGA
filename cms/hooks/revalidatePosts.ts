import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import { revalidatePath } from "next/cache";

// The public blog is statically rendered. Whenever a post changes in the
// admin, drop the cached blog pages so the next visitor gets fresh HTML.
// Scripts (e.g. the importer) pass `context.skipRevalidate` because there is
// no Next.js request to revalidate from.
function revalidateBlog() {
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/sitemap.xml");
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, req }) => {
  if (!req.context.skipRevalidate) revalidateBlog();
  return doc;
};

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  if (!req.context.skipRevalidate) revalidateBlog();
  return doc;
};
