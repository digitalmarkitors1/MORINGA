import type { CollectionConfig, FieldHook } from "payload";
import { revalidateAfterChange, revalidateAfterDelete } from "../hooks/revalidatePosts";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Fill the slug from the title on first save; after that it only changes when
// an editor types a new one, so published URLs never move by accident.
const slugFromTitle: FieldHook = ({ value, data }) => {
  if (typeof value === "string" && value.trim()) return slugify(value);
  if (typeof data?.title === "string") return slugify(data.title);
  return value;
};

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Blog post", plural: "Blog posts" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status", "publishedAt"],
    group: "Content",
  },
  access: {
    // Visitors only ever see published posts; signed-in editors see drafts too.
    read: ({ req }) => {
      if (req.user) return true;
      return { _status: { equals: "published" } };
    },
  },
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "The headline shown at the top of the article.",
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      hooks: { beforeValidate: [slugFromTitle] },
      admin: {
        position: "sidebar",
        description: "The article lives at /blog/<slug>.php. Avoid changing this after publishing.",
      },
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
      },
      hooks: {
        beforeChange: [
          ({ value, siblingData }) =>
            !value && siblingData._status === "published" ? new Date() : value,
        ],
      },
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Optional. Without one, the article uses a photo matched to its topic.",
      },
    },
    {
      name: "content",
      type: "richText",
      required: true,
    },
  ],
};
