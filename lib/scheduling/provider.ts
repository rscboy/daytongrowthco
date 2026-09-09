import { createHash } from "node:crypto";
import { serviceContent, type BookingField, type Meeting, type Receipt, type ServiceId } from "../../src/scheduling/catalog";

export class SchedulingError extends Error {
  constructor(public code: string, message: string, public status = 400) { super(message); }
}
export const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const text = (value: unknown) => typeof value === "string" ? value : "";
export const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export function safeUrl(value: unknown) {
  try { const url = new URL(text(value)); return url.protocol === "https:" ? url.toString() : undefined; } catch { return undefined; }
}

export type BookingInput = { requestId: string; service: ServiceId; start: string; timezone: string; name: string; email: string; fields: Record<string, string | boolean>; qualification: Record<string, string>; attribution: Record<string, string>; version: string };
export interface CalendarProvider {
  meeting(service: ServiceId): Promise<Meeting>;
  slots(meeting: Meeting, start: string, end: string, timezone: string): Promise<string[]>;
  book(meeting: Meeting, input: BookingInput): Promise<Receipt>;
  reconcile(meeting: Meeting, input: BookingInput): Promise<Receipt | undefined>;
}

// Pin each endpoint independently: Cal.com versions its endpoints separately.
export class CalProvider implements CalendarProvider {
  constructor(private env: NodeJS.ProcessEnv = process.env, private transport: typeof fetch = fetch) {}
  async request(path: string, version: string, body?: unknown): Promise<unknown> {
    let response: Response;
    try {
      response = await this.transport(`https://api.cal.com/v2/${path}`, {
        method: body ? "POST" : "GET", cache: "no-store", signal: AbortSignal.timeout(14000),
        headers: { Authorization: `Bearer ${this.env.CAL_API_KEY}`, "cal-api-version": version, "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch { throw new SchedulingError(body ? "uncertain" : "provider-unavailable", body ? "The calendar hasn’t confirmed the outcome yet." : "We couldn’t reach the calendar. Please try again.", 503); }
    const result = object(await response.json().catch(() => null));
    if (!response.ok || result.status !== "success") {
      // A server failure may occur after a booking is written. Never retry the POST.
      if (body && (response.status >= 500 || response.ok)) throw new SchedulingError("uncertain", "The calendar hasn’t confirmed the outcome yet.", 503);
      if (body && response.status === 409) throw new SchedulingError("slot-unavailable", "That time is no longer available. Your details are still here.", 409);
      throw new SchedulingError(body ? "provider-rejected" : "provider-unavailable", body ? "The calendar couldn’t accept these details. Please review them or use the existing booking page." : "We couldn’t load the calendar. Please try again.", response.status === 429 ? 429 : 503);
    }
    return result.data;
  }
  async meeting(service: ServiceId): Promise<Meeting> {
    const id = Number(this.env[`CAL_EVENT_${service.toUpperCase()}_ID`]);
    if (!this.env.CAL_API_KEY || !Number.isSafeInteger(id) || id <= 0) throw new SchedulingError("not-configured", "This calendar is being connected. You can still use the existing booking option below.", 503);
    const data = object(await this.request(`event-types/${id}`, "2024-06-14"));
    const slug = this.env[`CAL_EVENT_${service.toUpperCase()}_SLUG`] || serviceContent[service].slug;
    if (!slug || data.slug !== slug || Number(data.id) !== id) throw new SchedulingError("mapping-mismatch", "This calendar needs a configuration check. Please use the existing booking option.", 503);
    const locations = list(data.locations).map(object);
    const location = locations[0];
    const integration = text(location?.integration);
    const formats: Record<string, string> = { "google-meet": "Google Meet", "cal-video": "Cal Video", zoom: "Zoom", "office365-video": "Microsoft Teams" };
    const format = formats[integration] || (location?.type === "phone" || location?.type === "attendeePhone" ? "Phone call" : location?.type === "address" ? "In person" : location?.type === "link" ? "Video call" : "");
    const fields: BookingField[] = [];
    let unsupported = !format || locations.length !== 1;
    for (const raw of list(data.bookingFields)) {
      const field = object(raw); const key = text(field.slug); const type = text(field.field || field.type);
      if (["name", "email", "guests", "rescheduleReason", "location"].includes(key)) {
        if (key === "name" && field.variant && field.variant !== "fullName") unsupported = true;
        continue;
      }
      if (!key || field.hidden === true) { if (field.required) unsupported = true; continue; }
      // Optional provider questions are left out to keep the contact step short.
      if (!field.required) continue;
      const types: Record<string, BookingField["type"]> = { text: "text", textarea: "textarea", number: "number", phone: "tel", attendeePhoneNumber: "tel", email: "email", select: "select", radio: "select", checkbox: "checkbox", boolean: "checkbox" };
      if (!types[type]) { unsupported = true; continue; }
      const options = list(field.options).map(option => typeof option === "string" ? { value: option, label: option } : { value: text(object(option).value), label: text(object(option).label) }).filter(option => option.value);
      if (types[type] === "select" && !options.length) unsupported = true;
      fields.push({ key, label: text(field.label) || key, type: types[type], required: true, ...(options.length ? { options } : {}) });
    }
    if (location?.type === "attendeePhone" && !fields.some(field => field.type === "tel")) fields.push({ key: "attendeePhoneNumber", label: "Phone number for this call", type: "tel", required: true });
    const duration = Number(data.lengthInMinutes);
    if (!Number.isFinite(duration) || duration < 1 || duration > 480) unsupported = true;
    const price = Number(data.price);
    const paid = Number.isFinite(price) && price > 0;
    if (paid || !Number.isFinite(price) || data.requiresBookerEmailVerification || data.bookingRequiresAuthentication || data.isInstantEvent || Number(data.seatsPerTimeSlot) > 0 || (data.recurrence && object(data.recurrence).disabled !== true) || (data.seats && object(data.seats).disabled !== true)) unsupported = true;
    let priceLabel = "No charge for this call";
    if (paid) {
      try { priceLabel = new Intl.NumberFormat("en-US", { style: "currency", currency: text(data.currency) }).format(price / 100); } catch { priceLabel = "See the booking page for the meeting fee"; }
    }
    const meeting: Meeting = { service, eventId: id, title: text(data.title), duration, format: format || "See booking page", priceLabel, fields, version: "", mode: "live", canBook: !unsupported, location, canCancel: object(data.disableCancelling).disabled !== true, canReschedule: object(data.disableRescheduling).disabled !== true };
    meeting.version = digest({ id, slug, duration, locations, fields, price, confirmationPolicy: data.confirmationPolicy, emails: data.emailSettings });
    if (unsupported) meeting.reason = "This event has settings that need the existing booking page, such as payment, verification, or a different meeting format.";
    return meeting;
  }
  async slots(meeting: Meeting, start: string, end: string, timezone: string) {
    const query = new URLSearchParams({ eventTypeId: String(meeting.eventId), start, end, timeZone: timezone });
    const data = object(await this.request(`slots?${query}`, "2024-09-04"));
    return [...new Set(Object.values(data).flatMap(day => list(day).map(slot => text(object(slot).start))).filter(start => Number.isFinite(Date.parse(start)) && Date.parse(start) > Date.now()).map(start => new Date(start).toISOString()))].sort();
  }
  receipt(raw: unknown, meeting: Meeting, input: BookingInput): Receipt {
    const data = object(raw); const status = text(data.status).toLowerCase();
    const attendee = list(data.attendees).map(object).find(attendee => text(attendee.email).toLowerCase() === input.email);
    if (!text(data.uid) || !["accepted", "pending"].includes(status) || !attendee || Date.parse(text(data.start)) !== Date.parse(input.start) || !Number.isFinite(Date.parse(text(data.end))) || Number(data.eventTypeId || object(data.eventType).id) !== meeting.eventId) throw new SchedulingError("uncertain", "We’re still checking the calendar’s response.", 503);
    const uid = text(data.uid);
    return { uid, service: input.service, title: text(data.title) || meeting.title, start: new Date(text(data.start)).toISOString(), end: new Date(text(data.end)).toISOString(), duration: Number(data.duration) || meeting.duration, timezone: input.timezone, format: meeting.format, email: text(attendee.email), status: status === "accepted" ? "confirmed" : "requested", mode: "live", meetingUrl: safeUrl(data.meetingUrl) || safeUrl(data.location), location: text(data.location), ...(meeting.canReschedule ? { rescheduleUrl: `https://cal.com/reschedule/${encodeURIComponent(uid)}` } : {}), ...(meeting.canCancel ? { cancelUrl: `https://cal.com/booking/${encodeURIComponent(uid)}?cancel=true` } : {}), invitationSent: false };
  }
  async book(meeting: Meeting, input: BookingInput) {
    const phone = meeting.fields.find(field => field.type === "tel");
    const raw = await this.request("bookings", "2026-02-25", {
      eventTypeId: meeting.eventId, start: input.start,
      attendee: { name: input.name, email: input.email, timeZone: input.timezone, language: "en", ...(phone ? { phoneNumber: input.fields[phone.key] } : {}) },
      bookingFieldsResponses: input.fields, location: meeting.location,
      metadata: { dgc_request: input.requestId, dgc_service: input.service, ...input.attribution, ...Object.fromEntries(Object.entries(input.qualification).map(([key, value]) => [`fit_${key}`, value])) },
    });
    return this.receipt(raw, meeting, input);
  }
  async reconcile(meeting: Meeting, input: BookingInput) {
    const query = new URLSearchParams({ attendeeEmail: input.email, eventTypeId: String(meeting.eventId), afterStart: new Date(Date.parse(input.start) - 1).toISOString(), beforeEnd: new Date(Date.parse(input.start) + meeting.duration * 60000 + 1).toISOString(), limit: "100" });
    const data = await this.request(`bookings?${query}`, "2026-05-01");
    const candidates = Array.isArray(data) ? data : list(object(data).bookings);
    const booking = candidates.find(raw => { const row = object(raw); return object(row.metadata).dgc_request === input.requestId && Date.parse(text(row.start)) === Date.parse(input.start); });
    return booking ? this.receipt(booking, meeting, input) : undefined;
  }
}
