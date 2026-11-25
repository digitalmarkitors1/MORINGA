// Runs pending CMS migrations before `next build` when a database is
// configured. Builds without DATABASE_URI (e.g. a quick local check) skip it
// and the site falls back to the bundled articles.

import { spawnSync } from "node:child_process";

if (!process.env.DATABASE_URI) {
  console.log("DATABASE_URI not set — skipping CMS migrations.");
  process.exit(0);
}

const result = spawnSync("npx", ["payload", "migrate"], { stdio: "inherit" });
process.exit(result.status ?? 1);
