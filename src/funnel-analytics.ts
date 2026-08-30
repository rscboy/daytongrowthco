export type FunnelName = "marketing-site" | "website-migration" | "ai-call-system" | "better-quote" | "foundation-inspections" | "appointrelay" | "google-review-program";
export type FunnelEventParams = Record<string, string | number | boolean | undefined>;
export type Attribution = Partial<Record<"utm_source" | "utm_medium" | "utm_campaign" | "utm_content" | "utm_term" | "fbclid" | "gclid" | "msclkid" | "funnel_variant", string>>;

const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid", "msclkid"] as const;
const metaStandardEvents: Record<string, "ViewContent" | "Lead" | "Schedule" | "Contact"> = {
  marketing_contact_submitted: "Lead",
  migration_landing_viewed: "ViewContent",
  migration_lead_captured: "Lead",
  migration_appointment_booked: "Schedule",
  hvac_landing_viewed: "ViewContent",
  hvac_lead_captured: "Lead",
  hvac_calendar_viewed: "Contact",
  hvac_appointment_booked: "Schedule",
  better_quote_case_submitted: "Lead",
  foundation_calendar_viewed: "Contact",
  foundation_assessment_submitted: "Lead",
  foundation_appointment_booked: "Schedule",
  appointrelay_landing_viewed: "ViewContent",
  appointrelay_vsl_lead_captured: "Lead",
  appointrelay_assessment_submitted: "Lead",
  appointrelay_calendar_viewed: "Contact",
  appointrelay_appointment_booked: "Schedule",
  google_review_landing_viewed: "ViewContent",
  google_review_assessment_submitted: "Lead",
  google_review_vsl_lead_captured: "Lead",
  google_review_calendar_viewed: "Contact",
  google_review_appointment_booked: "Schedule",
};

function getAttributionNamespace(funnel: FunnelName) {
  if (funnel === "website-migration") return "migration";
  if (funnel === "ai-call-system") return "hvac";
  if (funnel === "better-quote") return "better_quote";
  if (funnel === "foundation-inspections") return "foundation_inspections";
  if (funnel === "appointrelay") return "appointrelay";
  if (funnel === "google-review-program") return "google_review_program";
  return "site";
}

export function getFunnelSessionId(funnel: FunnelName) {
  if (typeof window === "undefined") return "";
  const sessionStorageKey = `dgc_${funnel.replace(/-/g, "_")}_funnel_session`;
  try {
    const existing = window.sessionStorage.getItem(sessionStorageKey);
    if (existing) return existing;
    const created = window.crypto.randomUUID();
    window.sessionStorage.setItem(sessionStorageKey, created);
    return created;
  } catch {
    return "";
  }
}

export function captureAttribution(storageNamespace = "site"): Attribution {
  if (typeof window === "undefined") return {};
  const storageKey = `dgc_${storageNamespace}_attribution`;
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(storageKey) || "{}") as Attribution;
    const incoming = Object.fromEntries(attributionKeys.flatMap((key) => {
      const value = new URLSearchParams(window.location.search).get(key);
      return value ? [[key, value]] : [];
    })) as Attribution;
    const attribution = { ...stored, ...incoming };
    window.sessionStorage.setItem(storageKey, JSON.stringify(attribution));
    return attribution;
  } catch {
    return {};
  }
}

/** Keeps a visitor on the same A/B variant across the inline qualification flow. */
export function setFunnelVariant(funnel: FunnelName, variant: string) {
  if (typeof window === "undefined") return;
  const attributionNamespace = getAttributionNamespace(funnel);
  try {
    const key = `dgc_${attributionNamespace}_attribution`;
    const current = JSON.parse(window.sessionStorage.getItem(key) || "{}") as Attribution;
    window.sessionStorage.setItem(key, JSON.stringify({ ...current, funnel_variant: variant }));
  } catch { /* Attribution is optional when browser storage is unavailable. */ }
}

export function trackFunnelEvent(funnel: FunnelName, name: string, params: FunnelEventParams = {}) {
  if (typeof window === "undefined") return;
  const eventKey = [name, params.step_number, params.step_name].filter((value) => value !== undefined && value !== "").join(":");
  if (funnel === "website-migration" || funnel === "better-quote") {
    try {
      const dedupeKey = `dgc_${funnel.replace(/-/g, "_")}_event_${eventKey}`;
      if (window.sessionStorage.getItem(dedupeKey)) return;
      window.sessionStorage.setItem(dedupeKey, "1");
    } catch { /* Analytics still works when browser storage is unavailable. */ }
  }
  const analyticsWindow = window as Window & {
    dataLayer?: unknown[];
    gtag?: (command: "event", eventName: string, eventParams?: FunnelEventParams) => void;
    fbq?: (command: "track" | "trackCustom", eventName: string, eventParams?: FunnelEventParams) => void;
  };
  const gtag = analyticsWindow.gtag || ((command: "event", eventName: string, eventParams?: FunnelEventParams) => {
    (analyticsWindow.dataLayer ||= []).push([command, eventName, eventParams]);
  });
  const attributionNamespace = getAttributionNamespace(funnel);
  const attribution = captureAttribution(attributionNamespace);
  const { fbclid: _fbclid, gclid: _gclid, msclkid: _msclkid, ...analyticsAttribution } = attribution;
  void _fbclid; void _gclid; void _msclkid;
  const analyticsParams = { funnel: funnel.replace(/-/g, "_"), ...analyticsAttribution, ...params };
  gtag("event", name, analyticsParams);
  analyticsWindow.fbq?.("trackCustom", name, analyticsParams);
  const metaStandardEvent = metaStandardEvents[name];
  if (metaStandardEvent) analyticsWindow.fbq?.("track", metaStandardEvent, analyticsParams);

  const id = getFunnelSessionId(funnel);
  if (!id) return;
  const properties = Object.fromEntries(Object.entries({ ...attribution, ...params }).filter(([, value]) => (
    typeof value === "string" || typeof value === "number" || typeof value === "boolean"
  )));
  const body = JSON.stringify({ funnel, sessionId: id, eventName: name, eventKey, properties });
  if (navigator.sendBeacon) navigator.sendBeacon("/api/funnel-event", new Blob([body], { type: "application/json" }));
  else void fetch("/api/funnel-event", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true });
}

/** Stores identifiable form progress in the CRM only; it is intentionally not sent to GA4 or Meta. */
export function trackFunnelLeadProgress(funnel: Extract<FunnelName, "website-migration" | "better-quote">, details: {
  name: string; email: string; stepNumber: number; stepName: string; totalSteps: number;
  /** Stored in the CRM only, never sent to analytics vendors. */
  formData?: Record<string, string>;
}) {
  if (typeof window === "undefined" || !details.email) return;
  const sessionId = getFunnelSessionId(funnel);
  if (!sessionId) return;
  void fetch("/api/funnel-progress", { method: "POST", headers: { "content-type": "application/json" }, keepalive: true, body: JSON.stringify({ funnel, sessionId, ...details, attribution: captureAttribution(funnel === "website-migration" ? "migration" : "better_quote") }) });
}
