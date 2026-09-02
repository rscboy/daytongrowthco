#!/usr/bin/env node

import { chmod, mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";

const terminal = createInterface({ input: process.stdin, output: process.stdout });
const defaultApiUrl = "https://www.daytongrowth.co/api/caruso-recipe-book";

try {
  const addToken = (await terminal.question("Paste the add-only Recipe Book access code: ")).trim();
  if (addToken.length < 20) throw new Error("That access code is too short.");
  const configDirectory = resolve(homedir(), ".config/caruso-recipe-book");
  const configPath = resolve(configDirectory, "credentials.json");
  await mkdir(configDirectory, { recursive: true });
  await writeFile(configPath, `${JSON.stringify({ apiUrl: defaultApiUrl, addToken }, null, 2)}\n`, { mode: 0o600 });
  await chmod(configPath, 0o600);
  console.log("Caruso Recipe Book is ready. The access code was saved only on this computer.");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  terminal.close();
}
