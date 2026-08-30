import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";

export type SecretProjectDefinition = {
  id: string;
  title: string;
  description: string;
  href: string;
  type: "Calculator" | "Reference" | "Prototype" | "Website";
  accent: string;
};

export type SecretProjectSetting = {
  active: boolean;
  passwordEnabled: boolean;
  passwordHash: string | null;
  updatedAt: string | null;
};

export type SecretProjectPublicSetting = Omit<SecretProjectSetting, "passwordHash"> & {
  hasPassword: boolean;
};

export const secretProjects: readonly SecretProjectDefinition[] = [
  {
    id: "recipes_for_benny",
    title: "Sammy's Recipe Book",
    description: "Family recipes, baking notes, ingredients, and step-by-step cooking instructions.",
    href: "/projects/secret/recipes_for_benny/",
    type: "Reference",
    accent: "#d96f4d",
  },
  {
    id: "taa_roi_calculator",
    title: "TAA ROI Calculator",
    description: "Lead economics, payback, and target return on investment for Travel Agent Academy.",
    href: "/projects/secret/taa_roi_calculator/",
    type: "Calculator",
    accent: "#287a78",
  },
  {
    id: "taa_roi_calculator_v2",
    title: "TAA Annual Profit Planner",
    description: "Annual ad spend, commission, operating cost, and projected profit planning.",
    href: "/projects/secret/taa_roi_calculator/v2/",
    type: "Calculator",
    accent: "#5269a8",
  },
  {
    id: "taa_roi_calculator_v3",
    title: "TAA Planning-Fee Planner",
    description: "Planning-fee income and advertising scenarios for travel advisors.",
    href: "/projects/secret/taa_roi_calculator/v3/",
    type: "Calculator",
    accent: "#9b6649",
  },
  {
    id: "profit_calculator",
    title: "HVAC Profit & Outreach Calculator",
    description: "Reverse-funnel planning and forward forecasting for the Google Review Growth Program.",
    href: "/projects/secret/profit-calculator/",
    type: "Calculator",
    accent: "#6e5aa8",
  },
] as const;

const SETTINGS_BLOB_PATH = "secret-projects/settings.json";
const SETTINGS_FILE_PATH = path.join(process.cwd(), "data", "secret-projects-settings.json");
const SHARE_SESSION_SECONDS = 60 * 60 * 24 * 14;

type SettingsStore = Record<string, SecretProjectSetting>;

function defaultSetting(): SecretProjectSetting {
  return { active: false, passwordEnabled: false, passwordHash: null, updatedAt: null };
}

function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN));
}

function normalizeSettings(value: unknown): SettingsStore {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return Object.fromEntries(secretProjects.map((project) => {
    const raw = source[project.id] && typeof source[project.id] === "object"
      ? source[project.id] as Partial<SecretProjectSetting>
      : {};
    return [project.id, {
      active: raw.active === true,
      passwordEnabled: raw.passwordEnabled === true,
      passwordHash: typeof raw.passwordHash === "string" ? raw.passwordHash : null,
      updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
    }];
  }));
}

async function readLocalSettings(): Promise<SettingsStore> {
  try {
    return normalizeSettings(JSON.parse(await readFile(SETTINGS_FILE_PATH, "utf8")));
  } catch {
    return normalizeSettings({});
  }
}

export async function getSecretProjectSettings(): Promise<SettingsStore> {
  if (!blobConfigured()) return readLocalSettings();
  try {
    const result = await get(SETTINGS_BLOB_PATH, { access: "private", useCache: false });
    if (!result?.stream) return normalizeSettings({});
    return normalizeSettings(await new Response(result.stream).json());
  } catch (error) {
    console.error("[secret-projects-storage] Unable to read project settings.", error);
    return normalizeSettings({});
  }
}

export async function saveSecretProjectSettings(settings: SettingsStore) {
  const normalized = normalizeSettings(settings);
  const body = JSON.stringify(normalized, null, 2);
  if (blobConfigured()) {
    await put(SETTINGS_BLOB_PATH, body, {
      access: "private",
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    return;
  }
  await mkdir(path.dirname(SETTINGS_FILE_PATH), { recursive: true });
  await writeFile(SETTINGS_FILE_PATH, `${body}\n`, "utf8");
}

export async function getSecretProjectSetting(id: string) {
  return (await getSecretProjectSettings())[id] ?? defaultSetting();
}

export function getSecretProject(id: string) {
  return secretProjects.find((project) => project.id === id);
}

export function publicSetting(setting: SecretProjectSetting): SecretProjectPublicSetting {
  return {
    active: setting.active,
    passwordEnabled: setting.passwordEnabled,
    hasPassword: Boolean(setting.passwordHash),
    updatedAt: setting.updatedAt,
  };
}

export function hashProjectPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const digest = scryptSync(password, salt, 64).toString("base64url");
  return `scrypt$${salt}$${digest}`;
}

export function projectPasswordMatches(password: string, stored: string | null) {
  if (!stored) return false;
  const [method, salt, expected] = stored.split("$");
  if (method !== "scrypt" || !salt || !expected) return false;
  const supplied = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, "base64url");
  return supplied.length === expectedBuffer.length && timingSafeEqual(supplied, expectedBuffer);
}

function projectSessionSecret() {
  return process.env.SECRET_PROJECTS_SESSION_SECRET?.trim() || "";
}

export function projectAccessCookie(id: string) {
  return `dgc_secret_${id}`;
}

function shareSignature(id: string, expiresAt: string, secret: string) {
  return createHmac("sha256", secret).update(`secret-project.${id}.${expiresAt}`).digest("base64url");
}

export function createProjectAccessSession(id: string) {
  const secret = projectSessionSecret();
  if (!secret) return null;
  const expiresAt = String(Math.floor(Date.now() / 1000) + SHARE_SESSION_SECONDS);
  return `${expiresAt}.${shareSignature(id, expiresAt, secret)}`;
}

export function hasProjectAccessSession(id: string, value: string | undefined) {
  const secret = projectSessionSecret();
  if (!secret || !value) return false;
  const [expiresAt, suppliedSignature] = value.split(".");
  if (!expiresAt || !suppliedSignature || Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;
  const expected = Buffer.from(shareSignature(id, expiresAt, secret));
  const supplied = Buffer.from(suppliedSignature);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export const projectShareSessionSeconds = SHARE_SESSION_SECONDS;
