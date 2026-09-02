#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { resolve } from "node:path";

function fail(message) {
  console.error(message);
  process.exit(1);
}

let savedCredentials = {};
try {
  savedCredentials = JSON.parse(await readFile(resolve(homedir(), ".config/caruso-recipe-book/credentials.json"), "utf8"));
} catch {
  // Environment variables can provide credentials when no saved setup exists.
}

const endpoint = process.env.CARUSO_RECIPE_API_URL || savedCredentials.apiUrl;
const token = process.env.CARUSO_RECIPE_ADD_TOKEN || savedCredentials.addToken;
if (!endpoint) fail("CARUSO_RECIPE_API_URL is not configured.");
if (!token) fail("CARUSO_RECIPE_ADD_TOKEN is not configured.");
if (!/^https:\/\//i.test(endpoint)) fail("CARUSO_RECIPE_API_URL must use HTTPS.");

if (process.argv.includes("--list-owners")) {
  const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
  const result = await response.json().catch(() => ({ error: `Unexpected response (${response.status}).` }));
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

const response = await fetch(endpoint, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
const result = await response.json().catch(() => ({ error: `Unexpected response (${response.status}).` }));
if (!response.ok || !result.ok) fail(result.error ?? `Publishing failed (${response.status}).`);
console.log(JSON.stringify(result, null, 2));
