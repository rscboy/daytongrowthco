/**
 * Build-time Markdown generator.
 *
 * Reads the source HTML for each major public page and writes a clean Markdown
 * representation to public/md/<slug>.md. These files back the
 * `Accept: text/markdown` content negotiation handled by middleware.js and the
 * `</md/index.md>; rel="alternate"` discovery hint in Next headers.
 *
 * Design goals (solopreneur marketing site): no manual duplication of copy,
 * derive Markdown straight from the page's semantic <main> content, and skip
 * (rather than emit garbage) any page that does not convert cleanly.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeHtmlMarkdown } from 'node-html-markdown';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outDir = resolve(root, 'public', 'md');

// slug -> source HTML file inside the project root.
const PAGES = {
  'website-design': 'legacy-html/website-design/index.html',
  'local-seo': 'legacy-html/local-seo/index.html',
  'website-maintenance': 'legacy-html/website-maintenance/index.html',
  about: 'legacy-html/aboutus.html',
  'privacy-policy': 'legacy-html/privacy-policy/index.html',
  'terms-of-service': 'legacy-html/terms-of-service/index.html',
  accessibility: 'legacy-html/accessibility/index.html',
  disclaimer: 'legacy-html/disclaimer/index.html',
};

const SITE = 'https://www.daytongrowth.co';

function pick(re, html) {
  const m = html.match(re);
  return m ? m[1].trim() : '';
}

/** Pull the first <main>…</main>; fall back to the #root contents. */
function extractMain(html) {
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (main) return main[1];
  const root = html.match(/<div[^>]*id=["']root["'][^>]*>([\s\S]*?)<\/div>\s*<script/i);
  if (root) return root[1];
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return body ? body[1] : '';
}

/** Remove layout-only / non-content markup before converting. */
function cleanFragment(fragment) {
  return fragment
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    // numbered section badges like <span ...>1</span>
    .replace(/<span[^>]*>\s*\d+\s*<\/span>/gi, '')
    // elements explicitly hidden from assistive tech / visuals
    .replace(/<[^>]*aria-hidden=["']true["'][\s\S]*?<\/[a-z0-9]+>/gi, '');
}

function tidyMarkdown(md) {
  return md
    .replace(/\n{3,}/g, '\n\n') // collapse runs of blank lines
    .replace(/[ \t]+\n/g, '\n') // trailing whitespace
    .trim();
}

const nhm = new NodeHtmlMarkdown({
  bulletMarker: '-',
  codeBlockStyle: 'fenced',
});

async function run() {
  await mkdir(outDir, { recursive: true });

  let written = 0;
  let skipped = 0;

  for (const [slug, file] of Object.entries(PAGES)) {
    const srcPath = resolve(root, file);
    if (!existsSync(srcPath)) {
      console.warn(`[generate-markdown] skip ${slug}: ${file} missing`);
      skipped++;
      continue;
    }

    const html = await readFile(srcPath, 'utf8');
    const rawTitle = pick(/<title[^>]*>([\s\S]*?)<\/title>/i, html);
    const title = rawTitle.replace(/\s*\|\s*DaytonGrowthCo\.?\s*$/i, '').trim() || 'DaytonGrowthCo.';
    const description = pick(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i, html);
    const canonical =
      pick(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i, html) ||
      `${SITE}/`;

    const mainHtml = cleanFragment(extractMain(html));
    let body = tidyMarkdown(nhm.translate(mainHtml));
    // Keep a single top-level heading: demote in-body H1s and drop any that
    // simply repeats the page title we prepend below.
    body = body
      .replace(/^# (.+)$/gm, '## $1')
      .replace(new RegExp(`^## ${title.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s*$`, 'm'), '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Fall back to HTML (skip emitting) if there is no meaningful content.
    if (body.replace(/\s+/g, ' ').length < 60) {
      console.warn(`[generate-markdown] skip ${slug}: not enough content to convert safely`);
      skipped++;
      continue;
    }

    const parts = [`# ${title}`];
    if (description) parts.push(`> ${description}`);
    parts.push(body);
    parts.push(`---\n\n_Source: ${canonical} · Markdown rendering of the HTML page._`);

    await writeFile(resolve(outDir, `${slug}.md`), parts.join('\n\n') + '\n', 'utf8');
    written++;
  }

  console.log(`[generate-markdown] wrote ${written} file(s), skipped ${skipped}.`);
}

run().catch((err) => {
  console.error('[generate-markdown] failed:', err);
  process.exit(1);
});
