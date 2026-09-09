import { isService, qualify, serviceContent, validTimezone, type Answers, type BookingResult, type Meeting } from "../../src/scheduling/catalog";
import { digest, object, SchedulingError, type BookingInput, type CalendarProvider } from "./provider";
import { type Attempt, type AttemptStore } from "./store";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function requestId(value: unknown) { if (typeof value !== "string" || !uuid.test(value)) throw new SchedulingError("invalid-request", "Please reload the scheduling section."); return value; }
export function cleanAttribution(raw: unknown) {
  const source = object(raw); const result: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "msclkid", "fbclid"]) {
    const value = source[key];
    // Campaign labels only. Never carry contact details, URLs, or free-text answers.
    if (typeof value === "string" && /^[A-Za-z0-9_.~-]{1,160}$/.test(value)) result[key] = value;
  }
  return result;
}
export function validateFit(service: unknown, raw: unknown): Answers {
  if (!isService(service)) throw new SchedulingError("invalid-service", "Choose one of the listed services.");
  const source = object(raw);
  const answers = Object.fromEntries(serviceContent[service].questions.map(q => [q.key, typeof source[q.key] === "string" ? source[q.key] as string : ""]));
  const result = qualify(service, answers);
  if (result !== "qualified") throw new SchedulingError(`fit-${result}`, result === "incomplete" ? "Complete the service-fit questions first." : "This service needs a different next step. Review your fit result before booking.", 422);
  return answers;
}
export function validateInput(raw: unknown, meeting: Meeting): BookingInput {
  const body = object(raw);
  const id = requestId(body.requestId);
  if (!isService(body.service) || meeting.service !== body.service) throw new SchedulingError("invalid-service", "Please choose a service.");
  const qualification = validateFit(body.service, body.qualification);
  if (!validTimezone(body.timezone)) throw new SchedulingError("invalid-timezone", "Please choose a valid timezone.");
  const start = typeof body.start === "string" ? body.start : "";
  if (!/^\d{4}-\d{2}-\d{2}T.*Z$/.test(start) || !Number.isFinite(Date.parse(start)) || Date.parse(start) < Date.now() || Date.parse(start) > Date.now() + 366 * 86400000) throw new SchedulingError("invalid-time", "Please choose an available future time.");
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (name.length < 2 || name.length > 120 || /[\r\n]/.test(name)) throw new SchedulingError("invalid-name", "Enter your full name.");
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new SchedulingError("invalid-email", "Enter a valid email address.");
  if (body.version !== meeting.version) throw new SchedulingError("event-changed", "The meeting settings have changed. Please choose a time again; your details are saved.", 409);
  const fields: BookingInput["fields"] = {}; const submitted = object(body.fields);
  for (const field of meeting.fields) {
    const value = submitted[field.key];
    if (field.type === "checkbox") {
      if (field.required && value !== true) throw new SchedulingError("invalid-field", `Please complete: ${field.label}`);
      fields[field.key] = value === true; continue;
    }
    if (typeof value !== "string" || value.length > 2000 || (field.required && !value.trim()) || (field.options && !field.options.some(option => option.value === value)) || (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) || (field.type === "tel" && !/^\+[1-9]\d{7,14}$/.test(value)) || (field.type === "number" && !Number.isFinite(Number(value)))) throw new SchedulingError("invalid-field", field.type === "tel" ? "Use an international phone number, such as +19375550123." : `Please check: ${field.label}`);
    fields[field.key] = value.trim();
  }
  return { requestId: id, service: body.service, start: new Date(start).toISOString(), timezone: body.timezone, name, email, fields, qualification, attribution: cleanAttribution(body.attribution), version: meeting.version };
}

export class SchedulingEngine {
  constructor(private provider: CalendarProvider, private store: AttemptStore) {}
  async book(raw: unknown): Promise<BookingResult> {
    const body = object(raw); requestId(body.requestId);
    if (!isService(body.service)) throw new SchedulingError("invalid-service", "Choose a service.");
    // Recover an earlier attempt before checking settings or availability again.
    const existing = await this.store.get(body.requestId as string);
    if (existing) {
      if (existing.input.service !== body.service || Date.parse(existing.input.start) !== Date.parse(String(body.start)) || existing.input.email !== String(body.email).trim().toLowerCase()) throw new SchedulingError("request-mismatch", "Check the earlier booking request before making another.", 409);
      return this.status(body.requestId as string);
    }
    const meeting = await this.provider.meeting(body.service);
    if (!meeting.canBook) throw new SchedulingError("unsupported-event", meeting.reason || "Please use the existing booking page.", 422);
    const input = validateInput(raw, meeting);
    const attempt: Attempt = { input, meeting, createdAt: Date.now(), result: { state: "pending" } };
    const fingerprint = digest([meeting.eventId, input.start, input.email]);
    const claim = await this.store.claim(input.requestId, fingerprint, attempt);
    if (!claim.created) return claim.attempt.result;
    let sentToProvider = false;
    try {
      const end = new Date(Date.parse(input.start) + meeting.duration * 60000).toISOString();
      const available = await this.provider.slots(meeting, input.start, end, input.timezone);
      if (!available.includes(input.start)) throw new SchedulingError("slot-unavailable", "That time is no longer available. Your details are saved; choose another time.", 409);
      sentToProvider = true;
      const receipt = await this.provider.book(meeting, input);
      attempt.result = { state: receipt.status, receipt };
    } catch (error) {
      const known = error instanceof SchedulingError ? error : undefined;
      const uncertain = sentToProvider && (!known || known.code === "uncertain");
      attempt.result = { state: uncertain ? "unknown" : "rejected", code: known?.code || "provider-unavailable", message: uncertain ? "We haven’t received a final answer from the calendar. Check the booking status; submitting again could create a second appointment." : known?.message || "We couldn’t check availability. Your details are still here." };
    }
    // A storage failure leaves the original durable pending record for reconciliation.
    try { await this.store.save(input.requestId, attempt); } catch { return { state: "unknown", message: "We’re checking the calendar response. Please check the status before taking another action." }; }
    return attempt.result;
  }
  async status(id: string): Promise<BookingResult> {
    requestId(id);
    const attempt = await this.store.get(id);
    if (!attempt) return { state: "unknown", code: "missing-attempt", message: "We couldn’t find a saved result. Please contact us before making another appointment." };
    if (attempt.result.state !== "pending" && attempt.result.state !== "unknown") return attempt.result;
    // GET only: reconciliation never creates or retries an appointment.
    try {
      const receipt = await this.provider.reconcile(attempt.meeting, attempt.input);
      if (receipt) { attempt.result = { state: receipt.status, receipt }; await this.store.save(id, attempt); return attempt.result; }
    } catch { /* Unknown remains unknown; an empty result is not proof of failure. */ }
    return { state: "unknown", message: "The calendar hasn’t confirmed the result yet. Check again shortly, or email us so we can verify it. Your details are preserved." };
  }
}
