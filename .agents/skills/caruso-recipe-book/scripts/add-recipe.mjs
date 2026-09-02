#!/usr/bin/env node

import { access, copyFile, mkdir, readFile, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const RECIPE_SOURCE_PATH = "app/projects/secret/recipes_for_benny/recipe-book.tsx";
const INITIAL_LIVE_CHECKS = 6;
const FALLBACK_LIVE_CHECKS = 12;
const LIVE_CHECK_DELAY_MS = 10_000;
const DEFAULT_ENDPOINTS = [
  "https://www.daytongrowth.co/api/caruso-recipe-book",
  "https://daytongrowthco.vercel.app/api/caruso-recipe-book",
];
const MANUAL_PUBLISH_URL = "https://www.daytongrowth.co/projects/secret/recipes_for_benny";

function fail(message) {
  console.error(message);
  process.exit(1);
}

const wait = (milliseconds) => new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));

function commitShaFrom(url) {
  try {
    const sha = basename(new URL(url).pathname);
    return /^[a-f0-9]{7,64}$/i.test(sha) ? sha : "";
  } catch {
    return "";
  }
}

async function recipeIsLive(recipeUrl, recipeId, recipeTitle, attempts) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(recipeUrl, { signal: AbortSignal.timeout(12_000), cache: "no-store" });
      const page = await response.text();
      if (response.ok && (page.includes(recipeId) || page.includes(recipeTitle))) return { live: true, attempts: attempt };
    } catch {
      // A transient deployment response is treated as pending until the bounded check ends.
    }
    if (attempt < attempts) await wait(LIVE_CHECK_DELAY_MS);
  }
  return { live: false, attempts };
}

async function command(command, args, cwd) {
  return run(command, args, { cwd, encoding: "utf8", maxBuffer: 1_000_000 });
}

async function linkedRepository() {
  try {
    const { stdout } = await command("git", ["rev-parse", "--show-toplevel"], process.cwd());
    const root = stdout.trim();
    const projectLink = join(root, ".vercel", "project.json");
    await access(projectLink);
    return { root, projectLink };
  } catch {
    return null;
  }
}

async function acceptedCommitContainsRecipe(repository, commitSha, recipeId) {
  try {
    await command("git", ["cat-file", "-e", `${commitSha}^{commit}`], repository.root);
  } catch {
    try {
      await command("git", ["fetch", "--no-tags", "origin", commitSha], repository.root);
      await command("git", ["cat-file", "-e", `${commitSha}^{commit}`], repository.root);
    } catch {
      return { ok: false, reason: "The accepted commit is not available from this local checkout." };
    }
  }

  try {
    const { stdout: changedFiles } = await command("git", ["show", "--format=", "--name-only", commitSha], repository.root);
    if (!changedFiles.split("\n").includes(RECIPE_SOURCE_PATH)) return { ok: false, reason: "The accepted commit does not contain the recipe source change." };
    const { stdout: source } = await command("git", ["show", `${commitSha}:${RECIPE_SOURCE_PATH}`], repository.root);
    if (!source.includes(JSON.stringify(recipeId))) return { ok: false, reason: "The accepted commit does not contain the new recipe ID." };
    return { ok: true };
  } catch {
    return { ok: false, reason: "The accepted commit could not be inspected safely." };
  }
}

async function redeployAcceptedCommit(repository, commitSha) {
  const tempRoot = join(tmpdir(), `caruso-recipe-redeploy-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  let worktreeCreated = false;
  try {
    await command("git", ["worktree", "add", "--detach", tempRoot, commitSha], repository.root);
    worktreeCreated = true;
    await mkdir(join(tempRoot, ".vercel"), { recursive: true });
    await copyFile(repository.projectLink, join(tempRoot, ".vercel", "project.json"));
    await command("npx", ["--no-install", "vercel", "deploy", "--prod", "--force", "--yes"], tempRoot);
    return { ok: true };
  } catch {
    return { ok: false, reason: "The exact-commit Vercel deployment command could not complete from the local project linkage." };
  } finally {
    if (worktreeCreated) await command("git", ["worktree", "remove", "--force", tempRoot], repository.root).catch(() => {});
    await rm(tempRoot, { recursive: true, force: true }).catch(() => {});
  }
}

function report(outcome) {
  console.log(JSON.stringify(outcome, null, 2));
}

function uniqueHttpsEndpoints(values) {
  return [...new Set(values.flatMap((value) => typeof value === "string" ? value.split(",") : []).map((value) => value.trim()).filter(Boolean))]
    .filter((value) => /^https:\/\//i.test(value));
}

async function recipeRequest(endpoints, options = {}) {
  let lastReason = "The Recipe Book service could not be reached from this environment.";
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { ...options, signal: AbortSignal.timeout(12_000) });
      const result = await response.json().catch(() => ({ error: `Unexpected response (${response.status}).` }));
      if (response.ok || (response.status !== 403 && response.status < 500)) return { response, result };
      lastReason = result.error ?? `The service returned ${response.status}.`;
    } catch {
      lastReason = "The Recipe Book service could not be reached from this environment.";
    }
  }
  return { blocked: true, reason: lastReason };
}

let savedCredentials = {};
try {
  const configPath = resolve(process.env.CARUSO_RECIPE_CONFIG_PATH || resolve(homedir(), ".config/caruso-recipe-book/credentials.json"));
  savedCredentials = JSON.parse(await readFile(configPath, "utf8"));
} catch {
  // Environment variables can provide credentials when no saved setup exists.
}

const explicitEndpoints = process.env.CARUSO_RECIPE_API_URLS || process.env.CARUSO_RECIPE_API_URL;
const endpoints = explicitEndpoints
  ? uniqueHttpsEndpoints([explicitEndpoints])
  : uniqueHttpsEndpoints([savedCredentials.apiUrl, ...(Array.isArray(savedCredentials.apiUrls) ? savedCredentials.apiUrls : []), ...DEFAULT_ENDPOINTS]);
const token = process.env.CARUSO_RECIPE_ADD_TOKEN || savedCredentials.addToken;
if (!endpoints.length) fail("No HTTPS Recipe Book service address is configured.");
if (!token) fail("CARUSO_RECIPE_ADD_TOKEN is not configured.");

if (process.argv.includes("--list-owners")) {
  const request = await recipeRequest(endpoints, { headers: { Authorization: `Bearer ${token}` } });
  if (request.blocked) fail("Owner lookup is blocked in this environment. Use Sammy, Autumn, Addison, and Sam G, or add somebody else.");
  const { response, result } = request;
  if (!response.ok || !result.ok) fail(result.error ?? `Owner lookup failed (${response.status}).`);
  console.log(JSON.stringify(result.owners, null, 2));
  process.exit(0);
}

const payloadIndex = process.argv.indexOf("--payload");
const payloadArg = payloadIndex >= 0 ? process.argv[payloadIndex + 1] : undefined;
if (!payloadArg) fail("Usage: node scripts/add-recipe.mjs --list-owners | --payload /absolute/path/to/recipe.json");

let payload;
try {
  payload = JSON.parse(await readFile(resolve(payloadArg), "utf8"));
} catch (error) {
  fail(`Could not read the recipe payload: ${error instanceof Error ? error.message : String(error)}`);
}

const request = await recipeRequest(endpoints, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
if (request.blocked) {
  report({
    outcome: "browser_handoff_required",
    recipeId: typeof payload?.recipe?.id === "string" ? payload.recipe.id : "",
    recipeTitle: typeof payload?.recipe?.title === "string" ? payload.recipe.title : "",
    payloadPath: resolve(payloadArg),
    manualPublishUrl: MANUAL_PUBLISH_URL,
    reason: "This environment cannot reach the Recipe Book service. Open the Recipe Book Add panel in a browser and upload this prepared JSON file.",
  });
  process.exit(0);
}
const { response, result } = request;
if (!response.ok || !result.ok) fail(result.error ?? `Publishing failed (${response.status}).`);

const recipeId = typeof result.recipeId === "string" ? result.recipeId : "";
const recipeUrl = typeof result.recipeUrl === "string" ? result.recipeUrl : "";
const commit = typeof result.commit === "string" ? result.commit : "";
const commitSha = commitShaFrom(commit);
const recipeTitle = typeof payload?.recipe?.title === "string" ? payload.recipe.title : recipeId;
if (!recipeId || !recipeUrl || !commit || !commitSha) fail("The recipe was accepted, but the publish response was missing its recipe or commit details.");

const published = { recipeId, recipeUrl, commit, commitSha };
const initialCheck = await recipeIsLive(recipeUrl, recipeId, recipeTitle, INITIAL_LIVE_CHECKS);
if (initialCheck.live) {
  report({ outcome: "recipe_is_live", ...published, checks: initialCheck.attempts });
  process.exit(0);
}

const repository = await linkedRepository();
if (!repository) {
  report({ outcome: "fallback_could_not_run", ...published, checks: initialCheck.attempts, reason: "Production is still pending and no locally linked Vercel project checkout is available for a safe exact-commit redeploy." });
  process.exit(0);
}

const commitCheck = await acceptedCommitContainsRecipe(repository, commitSha, recipeId);
if (!commitCheck.ok) {
  report({ outcome: "fallback_could_not_run", ...published, checks: initialCheck.attempts, reason: commitCheck.reason });
  process.exit(0);
}

const redeployment = await redeployAcceptedCommit(repository, commitSha);
if (!redeployment.ok) {
  report({ outcome: "fallback_could_not_run", ...published, checks: initialCheck.attempts, reason: redeployment.reason });
  process.exit(0);
}

const fallbackCheck = await recipeIsLive(recipeUrl, recipeId, recipeTitle, FALLBACK_LIVE_CHECKS);
if (fallbackCheck.live) {
  report({ outcome: "fallback_redeployment_succeeded", ...published, checks: initialCheck.attempts + fallbackCheck.attempts });
} else {
  report({ outcome: "deployment_still_pending", ...published, checks: initialCheck.attempts + fallbackCheck.attempts, reason: "The exact-commit deployment completed, but the recipe has not reached the public page within the bounded check." });
}
