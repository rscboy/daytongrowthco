import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const [baselineInput, candidateInput] = process.argv.slice(2);

if (!baselineInput || !candidateInput) {
  console.error("Usage: node scripts/verify-homepage-parity.mjs <baseline-url> <candidate-url>");
  process.exit(2);
}

function homepageUrl(input) {
  const url = new URL(input);
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url;
}

function decodeEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function normalizeText(value) {
  return decodeEntities(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function decodeCloudflareEmail(encoded) {
  const key = Number.parseInt(encoded.slice(0, 2), 16);
  let email = "";
  for (let index = 2; index < encoded.length; index += 2) {
    email += String.fromCharCode(Number.parseInt(encoded.slice(index, index + 2), 16) ^ key);
  }
  return email;
}

function normalizeCloudflareEmails(html) {
  return html.replace(
    /<span\b[^>]*class=["'][^"']*__cf_email__[^"']*["'][^>]*data-cfemail=["']([0-9a-f]+)["'][^>]*>[\s\S]*?<\/span>/gi,
    (_, encoded) => decodeCloudflareEmail(encoded),
  );
}

function tagText(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi"))]
    .map((match) => normalizeText(match[1]))
    .filter(Boolean);
}

function internalLinks(html) {
  return [...html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => decodeEntities(match[1]).trim())
    .filter((href) => href.startsWith("/") && !href.startsWith("//"))
    .filter((href) => !href.startsWith("/cdn-cgi/l/email-protection"))
    .map((href) => href.replace(/\/$/, "") || "/")
    .sort();
}

function signature(html) {
  const visibleHtml = normalizeCloudflareEmails(html)
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--([\s\S]*?)-->/g, " ");
  const visibleText = normalizeText(visibleHtml);
  return {
    title: tagText(html, "title"),
    headings: ["h1", "h2", "h3"].flatMap((tag) => tagText(visibleHtml, tag)),
    buttons: tagText(visibleHtml, "button"),
    internalLinks: internalLinks(visibleHtml),
    visibleTextLength: visibleText.length,
    visibleTextSha256: createHash("sha256").update(visibleText).digest("hex"),
  };
}

async function load(label, input) {
  if (input.startsWith("/") || input.startsWith("file:")) {
    const path = input.startsWith("file:") ? fileURLToPath(input) : input;
    return { url: path, signature: signature(await readFile(path, "utf8")) };
  }
  const url = homepageUrl(input);
  const response = await fetch(url, { redirect: "follow", headers: { "user-agent": "DaytonGrowthCo-Release-Parity/1.0" } });
  if (!response.ok) throw new Error(`${label} homepage returned HTTP ${response.status}: ${url}`);
  return { url: response.url, signature: signature(await response.text()) };
}

const [baseline, candidate] = await Promise.all([
  load("Baseline", baselineInput),
  load("Candidate", candidateInput),
]);

const checks = ["title", "headings", "buttons", "internalLinks", "visibleTextLength", "visibleTextSha256"];
const failures = checks.filter((key) => JSON.stringify(baseline.signature[key]) !== JSON.stringify(candidate.signature[key]));

if (failures.length) {
  console.error(`[homepage-parity] FAIL: ${failures.join(", ")} differ.`);
  for (const key of failures) {
    console.error(`\n${key}\nBASELINE ${JSON.stringify(baseline.signature[key], null, 2)}\nCANDIDATE ${JSON.stringify(candidate.signature[key], null, 2)}`);
  }
  process.exit(1);
}

console.log(`[homepage-parity] PASS: ${candidate.url} matches ${baseline.url}`);
console.log(`[homepage-parity] ${baseline.signature.headings.length} headings, ${baseline.signature.buttons.length} buttons, ${baseline.signature.internalLinks.length} internal links, visible-text sha256 ${baseline.signature.visibleTextSha256}`);
