import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ORIGIN = "https://www.daytongrowth.co";

// Per-route metadata so each dedicated page ships a unique title, description,
// canonical URL, and social card instead of inheriting the homepage's tags.
const routes = {
  "what-we-build": {
    title: "What We Build | DaytonGrowthCo.",
    description:
      "From websites and local discovery to phone agents, quote tools, dashboards, and custom apps — see the full range of systems DaytonGrowthCo builds for small and midsized businesses nationwide.",
  },
  examples: {
    title: "Examples | DaytonGrowthCo.",
    description:
      "Interactive demonstrations of DaytonGrowthCo systems: website before/after, AI search visibility, phone-agent scheduling, spreadsheet-to-dashboard, and quote builders.",
  },
  "how-it-works": {
    title: "How It Works | DaytonGrowthCo.",
    description:
      "How DaytonGrowthCo diagnoses a process, measures what the current way costs, and builds the smallest useful fix — principles, engagement steps, and a labor-cost calculator.",
  },
};

const source = join("dist", "index.html");
const baseHtml = await readFile(source, "utf8");

const escapeAttr = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

function applyMeta(html, { title, description, canonical }) {
  const titleAttr = escapeAttr(title);
  const descAttr = escapeAttr(description);
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${descAttr}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${titleAttr}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${descAttr}$2`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, `$1${titleAttr}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, `$1${descAttr}$2`);
}

const entries = Object.entries(routes);

await Promise.all(
  entries.map(async ([route, meta]) => {
    const canonical = `${ORIGIN}/${route}/`;
    const html = applyMeta(baseHtml, { ...meta, canonical });
    const directory = join("dist", route);
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, "index.html"), html, "utf8");
  }),
);

console.log(`[create-spa-routes] wrote ${entries.length} route file(s) with per-route metadata.`);
