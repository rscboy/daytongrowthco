import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { hasSecretProjectsSession, secretProjectsCookie } from "@/lib/secret-projects-auth";
import {
  getSecretProjectSetting,
  hasProjectAccessSession,
  projectAccessCookie,
} from "@/lib/secret-projects";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const projectId = "review_call_command_center";
const blobPath = "secret-projects/review-call-command-center/records.json";
const localPath = path.join(process.cwd(), "data", "review-call-command-center-records.json");
const maximumProspectId = 2000;

const outcomes = new Set([
  "Not called",
  "Voicemail left",
  "No answer",
  "Callback",
  "Landline / no-go",
  "Wrong number",
  "Skip",
]);

type StoredRecord = { outcome: string; notes: string; updatedAt: number };
type RecordStore = { records: Record<string, StoredRecord>; updatedAt: number };

function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN));
}

function normalizeRecords(value: unknown) {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const normalized: Record<string, StoredRecord> = {};

  for (const [key, value] of Object.entries(source)) {
    const id = Number(key);
    if (!Number.isInteger(id) || id < 1 || id > maximumProspectId || !value || typeof value !== "object") continue;
    const raw = value as Partial<StoredRecord>;
    if (typeof raw.outcome !== "string" || !outcomes.has(raw.outcome)) continue;
    normalized[String(id)] = {
      outcome: raw.outcome,
      notes: typeof raw.notes === "string" ? raw.notes.slice(0, 5000) : "",
      updatedAt: typeof raw.updatedAt === "number" && Number.isFinite(raw.updatedAt) ? raw.updatedAt : 1,
    };
  }

  return normalized;
}

function normalizeStore(value: unknown): RecordStore {
  const raw = value && typeof value === "object" ? value as Partial<RecordStore> : {};
  return {
    records: normalizeRecords(raw.records),
    updatedAt: typeof raw.updatedAt === "number" && Number.isFinite(raw.updatedAt) ? raw.updatedAt : 0,
  };
}

async function canAccess() {
  const cookieStore = await cookies();
  if (hasSecretProjectsSession(cookieStore.get(secretProjectsCookie)?.value)) return true;
  const setting = await getSecretProjectSetting(projectId);
  const sharedAccess = hasProjectAccessSession(projectId, cookieStore.get(projectAccessCookie(projectId))?.value);
  return setting.active && (!setting.passwordEnabled || sharedAccess);
}

async function readStore(): Promise<RecordStore> {
  try {
    if (blobConfigured()) {
      const result = await get(blobPath, { access: "private", useCache: false });
      if (!result?.stream) return normalizeStore({});
      return normalizeStore(await new Response(result.stream).json());
    }
    return normalizeStore(JSON.parse(await readFile(localPath, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("[review-call-records] Unable to read records.", error);
    }
    return normalizeStore({});
  }
}

async function writeStore(store: RecordStore) {
  const body = JSON.stringify(store, null, 2);
  if (blobConfigured()) {
    await put(blobPath, body, {
      access: "private",
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    return;
  }
  await mkdir(path.dirname(localPath), { recursive: true });
  await writeFile(localPath, `${body}\n`, "utf8");
}

function noStoreJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  if (!(await canAccess())) return noStoreJson({ error: "Unauthorized" }, 401);
  return noStoreJson(await readStore());
}

export async function PUT(request: Request) {
  if (!(await canAccess())) return noStoreJson({ error: "Unauthorized" }, 401);

  let incoming: Record<string, StoredRecord>;
  try {
    const body = await request.json() as { records?: unknown };
    incoming = normalizeRecords(body.records);
  } catch {
    return noStoreJson({ error: "Invalid request" }, 400);
  }

  const current = await readStore();
  const merged = { ...current.records };
  for (const [id, record] of Object.entries(incoming)) {
    if (!merged[id] || record.updatedAt >= merged[id].updatedAt) merged[id] = record;
  }

  const store = { records: merged, updatedAt: Date.now() };
  await writeStore(store);
  return noStoreJson(store);
}
