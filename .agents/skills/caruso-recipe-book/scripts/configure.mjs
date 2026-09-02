#!/usr/bin/env node

import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { createInterface } from "node:readline/promises";

const defaultApiUrls = [
  "https://www.daytongrowth.co/api/caruso-recipe-book",
  "https://daytongrowthco.vercel.app/api/caruso-recipe-book",
];

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function accessCode() {
  if (process.env.CARUSO_RECIPE_ADD_TOKEN) return process.env.CARUSO_RECIPE_ADD_TOKEN.trim();
  if (process.argv.includes("--code-stdin")) {
    let value = "";
    process.stdin.setEncoding("utf8");
    for await (const chunk of process.stdin) value += chunk;
    return value.trim();
  }
  const codeFile = argumentValue("--code-file");
  if (codeFile) return (await readFile(resolve(codeFile), "utf8")).trim();
  if (!process.stdin.isTTY) throw new Error("Setup needs a terminal, CARUSO_RECIPE_ADD_TOKEN, --code-stdin, or --code-file /absolute/path/to/code.txt.");
  const terminal = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await terminal.question("Paste the add-only Recipe Book access code: ")).trim();
  } finally {
    terminal.close();
  }
}

try {
  const addToken = await accessCode();
  if (addToken.length < 20) throw new Error("That access code is too short.");
  const configPath = resolve(process.env.CARUSO_RECIPE_CONFIG_PATH || resolve(homedir(), ".config/caruso-recipe-book/credentials.json"));
  await mkdir(dirname(configPath), { recursive: true });
  await writeFile(configPath, `${JSON.stringify({ apiUrl: defaultApiUrls[0], apiUrls: defaultApiUrls, addToken }, null, 2)}\n`, { mode: 0o600 });
  await chmod(configPath, 0o600);
  console.log("Caruso Recipe Book is ready. The access code was saved only on this computer.");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
