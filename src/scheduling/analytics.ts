import type { ServiceId } from "./catalog";

type SchedulerEvent = "scheduler_viewed" | "scheduler_service_selected" | "scheduler_time_selected" | "scheduler_booking_submitted" | "scheduler_booking_confirmed" | "scheduler_booking_failed";
const seenConfirmations = new Set<string>();
/** Deliberately excludes general attribution, contact details, dates, and answers. */
export function schedulerAnalytics(event: SchedulerEvent, service?: ServiceId, receiptId?: string, preview = false) {
  if (preview) return;
  if (event === "scheduler_booking_confirmed" && receiptId) {
    const key = `dgc:scheduler:confirmed:${receiptId}`;
    if (seenConfirmations.has(key)) return;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch { /* Memory dedupe still works. */ }
    seenConfirmations.add(key);
  }
  const target = window as Window & { dataLayer?: unknown[]; gtag?: (command: string, event: string, params: Record<string, string>) => void };
  const params = { surface: "homepage_scheduler", ...(service ? { service } : {}) };
  if (target.gtag) target.gtag("event", event, params);
  else (target.dataLayer ||= []).push(["event", event, params]);
}
