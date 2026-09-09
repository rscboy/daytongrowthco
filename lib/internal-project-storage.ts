const storageBaseUrl = process.env.CRM_PROJECT_STORAGE_ENDPOINT
  || "https://daytongrowthco-crm.vercel.app/api/internal/project-storage";

function storageSecret() {
  return process.env.FUNNEL_CRM_API_SECRET || process.env.CRM_API_SECRET || "";
}

export function internalProjectStorageConfigured() {
  return Boolean(storageSecret());
}

export async function readInternalProjectStorage<T>(key: string): Promise<T | null> {
  const secret = storageSecret();
  if (!secret) return null;
  const response = await fetch(`${storageBaseUrl}/${encodeURIComponent(key)}`, {
    headers: { authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Internal project storage read failed with ${response.status}.`);
  const body = await response.json() as { value?: T };
  return body.value ?? null;
}

export async function writeInternalProjectStorage(key: string, value: object) {
  const secret = storageSecret();
  if (!secret) throw new Error("Internal project storage is not configured.");
  const response = await fetch(`${storageBaseUrl}/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${secret}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(value),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Internal project storage write failed with ${response.status}.`);
}
