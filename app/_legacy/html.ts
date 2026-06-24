import { readFile } from "node:fs/promises";
import { join } from "node:path";

const legacyFiles = [
  "404.html",
  "aboutus.html",
  "accessibility/index.html",
  "amp.html",
  "buisness_card.html",
  "cinematic.html",
  "disclaimer/index.html",
  "emailsignature.html",
  "local-seo/index.html",
  "privacy-policy/index.html",
  "set-password.html",
  "terms-of-service/index.html",
  "watson-roofing.html",
  "website-design/index.html",
  "website-maintenance/index.html",
] as const;

type LegacyFile = (typeof legacyFiles)[number];

export async function legacyHtmlResponse(file: LegacyFile) {
  if (!legacyFiles.includes(file)) {
    return new Response("Not found", { status: 404 });
  }
  const html = await readFile(join(process.cwd(), "legacy-html", file), "utf8");
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
