import { isService, type ServiceId } from "./catalog";

export const schedulerEvent = "dgc:open-scheduler";
export function openScheduler(service?: ServiceId, animate = false) {
  window.dispatchEvent(new CustomEvent(schedulerEvent, { detail: { service } }));
  const section = document.getElementById("schedule");
  section?.scrollIntoView({ behavior: animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "auto", block: "start" });
  section?.querySelector<HTMLElement>("#scheduler-heading")?.focus({ preventScroll: true });
}
export function serviceFromHash(hash: string): ServiceId | undefined {
  const service = hash.replace("#schedule-", "");
  return isService(service) ? service : undefined;
}
