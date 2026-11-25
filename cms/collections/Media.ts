import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    group: "Content",
  },
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ["image/*"],
    imageSizes: [
      { name: "card", width: 800, height: 600, position: "centre" },
      { name: "hero", width: 1600, height: 900, position: "centre" },
    ],
    adminThumbnail: "card",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: {
        description: "Describe the image for screen readers and search engines.",
      },
    },
  ],
};
