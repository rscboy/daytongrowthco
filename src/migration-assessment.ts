export type MigrationAssessment = {
  name: string; email: string; business: string; phone: string; website: string;
  platform: string; annualCost: string; timeline: string; intent: string; budget: string;
};

export const emptyMigrationAssessment: MigrationAssessment = {
  name: "", email: "", business: "", phone: "", website: "", platform: "",
  annualCost: "", timeline: "", intent: "", budget: "",
};

export const migrationDraftKey = "dgc:migration-assessment:v1";

/** Accept only this form's short-lived fields; consent must always be given again. */
export function readMigrationDraft(raw: string | null, now = Date.now()): { assessment: MigrationAssessment; step: number } | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data.savedAt !== "number" || data.savedAt > now || now - data.savedAt > 86400000 || !data.assessment || typeof data.assessment !== "object") return null;
    const assessment = { ...emptyMigrationAssessment };
    for (const key of Object.keys(assessment) as (keyof MigrationAssessment)[]) {
      if (typeof data.assessment[key] === "string") assessment[key] = data.assessment[key].slice(0, 2000);
    }
    return { assessment, step: Number.isInteger(data.step) ? Math.max(0, Math.min(10, data.step)) : 0 };
  } catch { return null; }
}
