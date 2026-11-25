import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import sharp from "sharp";

import { Media } from "./cms/collections/Media";
import { Posts } from "./cms/collections/Posts";
import { Users } from "./cms/collections/Users";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || "",
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || "",
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " · Go Moringa",
    },
    importMap: {
      baseDir: dirname,
    },
  },
  collections: [Posts, Media, Users],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
    // Keeps the CMS tables apart from anything else in the same database.
    schemaName: "payload",
    migrationDir: path.resolve(dirname, "cms/migrations"),
    // Schema changes only ever happen through migrations (npm run payload
    // migrate:create), never by auto-sync, so every environment stays identical.
    push: false,
  }),
  plugins: [
    seoPlugin({
      collections: ["posts"],
      uploadsCollection: "media",
      generateTitle: ({ doc }) => `${doc?.title ?? ""} | Go Moringa`,
      generateURL: ({ doc }) => `https://www.gomoringa.in/blog/${doc?.slug ?? ""}.php`,
    }),
    // Uploads go to Vercel Blob in production; on a laptop they stay on disk.
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "cms/payload-types.ts"),
  },
});
