import { type Meeting, type Receipt, type Scenario, type ServiceId } from "../../src/scheduling/catalog";
import { SchedulingError, type BookingInput, type CalendarProvider } from "./provider";

/** Explicit fixtures, never live availability. Only instantiated in development. */
export class PreviewProvider implements CalendarProvider {
  constructor(private scenario: Scenario = "ready") {}
  async meeting(service: ServiceId): Promise<Meeting> {
    return { service, eventId: { website: 1, reviews: 2, appointments: 3, custom: 4 }[service], title: { website: "Website Migration Program", reviews: "Google Review Program Fit Call", appointments: "AppointRelay Workflow Fit Call", custom: "Custom Systems Conversation" }[service], duration: service === "website" ? 45 : 30, format: "Google Meet", priceLabel: "Preview: no charge", fields: [], version: `preview-${service}-1`, mode: "preview", canBook: true, canCancel: false, canReschedule: false };
  }
  async slots(_meeting: Meeting, start: string, end: string): Promise<string[]> {
    if (this.scenario === "error") throw new SchedulingError("provider-unavailable", "We couldn’t load the calendar. Your selections are still here. Please try again.", 503);
    if (this.scenario === "empty") return [];
    const slots: string[] = [];
    const date = new Date(start); date.setUTCHours(0, 0, 0, 0);
    while (date.getTime() < Date.parse(end)) {
      if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) {
        for (const hour of [14, 17, 20]) {
          const slot = new Date(date); slot.setUTCHours(hour, 0, 0, 0);
          if (slot.getTime() >= Date.parse(start) && slot.getTime() > Date.now() + 86400000 && slot.getTime() <= Date.parse(end)) slots.push(slot.toISOString());
        }
      }
      date.setUTCDate(date.getUTCDate() + 1);
    }
    return slots;
  }
  private receipt(meeting: Meeting, input: BookingInput): Receipt {
    return { uid: `preview-${input.requestId}`, service: input.service, title: meeting.title, start: input.start, end: new Date(Date.parse(input.start) + meeting.duration * 60000).toISOString(), duration: meeting.duration, timezone: input.timezone, format: meeting.format, email: input.email, status: this.scenario === "requested" ? "requested" : "confirmed", mode: "preview", invitationSent: false };
  }
  async book(meeting: Meeting, input: BookingInput) {
    if (this.scenario === "stale") throw new SchedulingError("slot-unavailable", "That time was just taken. Choose one of the nearby alternatives; your details are saved.", 409);
    if (this.scenario === "uncertain") throw new SchedulingError("uncertain", "We haven’t received the final calendar response. Check the status before trying anything else.", 503);
    return this.receipt(meeting, input);
  }
  async reconcile(meeting: Meeting, input: BookingInput) { return this.receipt(meeting, input); }
}
