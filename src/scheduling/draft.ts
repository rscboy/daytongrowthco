import { isService, type Answers, type ServiceId } from "./catalog";
export const schedulerDraftKey = "dgc:scheduler:draft:v1";
export const schedulerAttemptKey = "dgc:scheduler:attempt:v1";
export type ContactDraft = { name: string; email: string; fields: Partial<Record<ServiceId, Record<string, string | boolean>>>; answers: Partial<Record<ServiceId, Answers>> };
export const emptyContact: ContactDraft = { name: "", email: "", fields: {}, answers: {} };
export function readSchedulerDraft(raw: string | null, now = Date.now()): ContactDraft | null {
  try {
    const data = JSON.parse(raw || "null");
    if (!data || typeof data.savedAt !== "number" || data.savedAt > now || now - data.savedAt > 86400000) return null;
    const clean: ContactDraft = { ...emptyContact, fields: {}, answers: {} };
    for (const key of ["name", "email"] as const) if (typeof data[key] === "string") clean[key] = data[key].slice(0,254);
    for (const category of ["fields", "answers"] as const) {
      if (!data[category] || typeof data[category] !== "object") continue;
      for (const [service, values] of Object.entries(data[category])) {
        if (!isService(service) || !values || typeof values !== "object" || Array.isArray(values)) continue;
        const entries = Object.entries(values).filter(([key, value]) => /^[a-zA-Z][a-zA-Z0-9_-]{0,79}$/.test(key) && typeof value === "string" && value.length <= 2000);
        // Consent/check boxes must be answered again after a reload.
        clean[category][service] = Object.fromEntries(entries);
      }
    }
    return clean;
  } catch { return null; }
}
