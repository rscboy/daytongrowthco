import { execFileSync } from "node:child_process";

const productionPaths = [
  "app",
  "components",
  "data",
  "lib",
  "public",
  "scripts/check-production-deploy.mjs",
  "scripts/generate-markdown.mjs",
  "scripts/verify-modern-release.mjs",
  "src",
  ".vercelignore",
  "next.config.mjs",
  "package.json",
  "package-lock.json",
  "vercel.json",
];

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
}

try {
  run(process.execPath, ["scripts/verify-modern-release.mjs"]);

  const status = run(
    "git",
    ["status", "--porcelain", "--untracked-files=all", "--", ...productionPaths],
    { capture: true },
  ).trim();

  if (status) {
    console.error("\nProduction deploy blocked: website files have not been saved to Git.\n");
    console.error(status);
    console.error("\nCommit the verified website version before publishing it.\n");
    process.exit(1);
  }

  console.log("[production-deploy] Verified release markers and a clean, saved website source.");
} catch (error) {
  if (typeof error?.status === "number") process.exit(error.status || 1);
  throw error;
}
