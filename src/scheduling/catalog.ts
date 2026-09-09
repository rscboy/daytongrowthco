export const services = ["website", "reviews", "appointments", "custom"] as const;
export type ServiceId = typeof services[number];
export type Answers = Record<string, string>;
export type Qualification = "qualified" | "manual-review" | "disqualified";
export type FitQuestion = { key: string; label: string; options: string[] };
export const serviceContent: Record<ServiceId, {
  problem: string; service: string; title: string; purpose: string; agenda: string[];
  preparation: string; fallback: string; slug: string; questions: FitQuestion[];
}> = {
  website: {
    problem: "My website needs a better home", service: "Website migration & rebuilds",
    title: "A better home for your website.",
    purpose: "We’ll look at your current platform, what needs to move, and the simplest sensible path forward.",
    agenda: ["What works today—and what doesn’t", "The pages, forms, and connections to keep", "A sensible scope and next step"],
    preparation: "Bring your website address and the name of your current platform.",
    fallback: "/website/#assessment", slug: "website-migration-program",
    questions: [
      { key: "intent", label: "What are you planning?", options: ["Planning a migration to a new platform", "Looking to upgrade or improve my current website", "I’m not sure yet — I’d like to learn more", "Already have a website and happy with it", "Do not need a website right now"] },
      { key: "budget", label: "What budget have you set aside?", options: ["Under $1,000", "$1,000–$2,500", "$2,500–$5,000", "$5,000+", "Still deciding"] },
    ],
  },
  reviews: {
    problem: "More jobs should become reviews", service: "HVAC Google Review Growth",
    title: "Turn good work into visible trust.",
    purpose: "We’ll walk through how completed jobs become review requests and what your team needs to manage.",
    agenda: ["Your completed-job and review workflow", "The source system and permissions", "What a managed program would change"],
    preparation: "Bring your CRM name and a quick description of your current review process.",
    fallback: "/google-reviews/book-call/", slug: "google-review-program-fit",
    questions: [
      { key: "industry", label: "What kind of work does your business do?", options: ["Residential HVAC service and repair", "Residential and commercial HVAC service", "Commercial HVAC service", "HVAC installation or new construction only", "Another local-service category"] },
      { key: "monthlyCompletions", label: "Eligible residential jobs per month", options: ["Under 100", "100–199", "200–399", "400–599", "600+", "Not sure"] },
      { key: "googleProfile", label: "Do you have a verified Google Business Profile?", options: ["Yes", "No", "Not sure"] },
      { key: "nativeReviewAutomation", label: "Does your system already send review requests?", options: ["No, it still depends on staff", "Yes, but it is inactive or unreliable", "Yes, but we want it fully managed", "Yes, and we are satisfied with it", "Not sure"] },
      { key: "completionSource", label: "How is a paid service call recorded as finished?", options: ["Completed or closed status with API or integration", "Paid invoice with API or integration", "Completion status with scheduled export", "Structured spreadsheet or report", "No reliable completion record", "Not sure"] },
      { key: "messagingPermission", label: "Can you document customer messaging permission?", options: ["Yes", "No", "Not sure"] },
      { key: "decisionAuthority", label: "Can you approve access, DNS, and templates?", options: ["Yes", "No"] },
      { key: "timeline", label: "When would you like to start?", options: ["Within 30 days", "Within 60 days", "Within 90 days", "Researching for later"] },
    ],
  },
  appointments: {
    problem: "Our appointment queue is piling up", service: "AppointRelay",
    title: "Put your appointment queue to work.",
    purpose: "We’ll review queue volume, dispatcher handoffs, and the exceptions that still need a person.",
    agenda: ["The approved queue and monthly volume", "Who handles scheduling and exceptions", "The smallest useful dispatcher handoff"],
    preparation: "Bring one real appointment queue and approximate monthly volume. Keep customer records private until we agree on a secure way to share them.",
    fallback: "/appointrelay/", slug: "appointrelay-workflow-fit",
    questions: [
      { key: "industry", label: "What kind of operation is this?", options: ["Commercial HVAC service", "Furniture delivery", "Equipment service or rental", "Home or field services", "Other appointment-based operation", "Not sure"] },
      { key: "monthlyOpportunities", label: "How many appointments could be handled each month?", options: ["Under 100", "100–299", "300–599", "600–999", "1,000+", "Not sure"] },
      { key: "schedulingOwner", label: "Who owns exceptions and final scheduling?", options: ["Named dispatcher or manager", "Shared responsibility", "No owner yet", "Not sure"] },
      { key: "access", label: "Are approved data and system access ready?", options: ["Yes", "No", "Not sure"] },
      { key: "timeline", label: "When would you like to start?", options: ["Within 30 days", "Within 60 days", "Within 90 days", "Researching for later"] },
    ],
  },
  custom: {
    problem: "Something else is slowing us down", service: "Custom systems & help choosing",
    title: "Let’s untangle one repeated task.",
    purpose: "We’ll identify where work slows down, the tools you already have, and the smallest useful improvement.",
    agenda: ["One task that repeats or gets stuck", "The tools and people already involved", "A practical improvement to explore"],
    preparation: "Bring one example of work that repeats or gets stuck. A simple description is enough.",
    fallback: "/#cta", slug: "",
    questions: [],
  },
};

// Shared with the existing program funnels so their qualification rules stay identical.
export function classifyAppointments(a: Answers): Qualification {
  if (a.access === "No" || a.schedulingOwner === "No owner yet" || a.monthlyOpportunities === "Under 100" || a.timeline === "Researching for later") return "disqualified";
  if ([a.industry, a.monthlyOpportunities, a.access, a.schedulingOwner].some(value => value === "Not sure") || a.schedulingOwner === "Shared responsibility" || a.industry === "Other appointment-based operation") return "manual-review";
  return "qualified";
}
export function classifyReviews(a: Answers): Qualification {
  if (a.googleProfile === "No" || a.messagingPermission === "No" || a.decisionAuthority === "No" || a.completionSource === "No reliable completion record" || a.industry === "HVAC installation or new construction only" || a.nativeReviewAutomation === "Yes, and we are satisfied with it") return "disqualified";
  if (a.timeline === "Researching for later" || a.monthlyCompletions === "Under 100" || [a.googleProfile, a.monthlyCompletions, a.completionSource, a.messagingPermission, a.nativeReviewAutomation].includes("Not sure")) return "manual-review";
  if (a.industry !== "Residential HVAC service and repair") return "manual-review";
  return "qualified";
}
export function qualify(service: ServiceId, answers: Answers): Qualification | "incomplete" {
  if (serviceContent[service].questions.some(q => !q.options.includes(answers[q.key]))) return "incomplete";
  if (service === "appointments") return classifyAppointments(answers);
  if (service === "reviews") return classifyReviews(answers);
  if (service === "website" && (["Already have a website and happy with it", "Do not need a website right now"].includes(answers.intent) || answers.budget === "Under $1,000")) return "disqualified";
  return "qualified";
}
export function isService(value: unknown): value is ServiceId { return typeof value === "string" && services.includes(value as ServiceId); }

export type BookingField = { key: string; label: string; type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox" | "number"; required: boolean; options?: { value: string; label: string }[] };
export type Meeting = { service: ServiceId; eventId: number; title: string; duration: number; format: string; priceLabel: string; fields: BookingField[]; version: string; mode: "live" | "preview"; canBook: boolean; reason?: string; location?: Record<string, unknown>; canCancel: boolean; canReschedule: boolean };
export type Receipt = { uid: string; service: ServiceId; title: string; start: string; end: string; duration: number; timezone: string; format: string; email: string; status: "confirmed" | "requested"; mode: "live" | "preview"; meetingUrl?: string; location?: string; rescheduleUrl?: string; cancelUrl?: string; invitationSent: boolean };
export type BookingResult = { state: "confirmed" | "requested" | "pending" | "unknown" | "rejected"; receipt?: Receipt; message?: string; code?: string };
export type Scenario = "ready" | "empty" | "error" | "stale" | "uncertain" | "requested";

export function validTimezone(zone: unknown): zone is string {
  if (typeof zone !== "string" || zone.length > 80) return false;
  try { new Intl.DateTimeFormat("en", { timeZone: zone }).format(); return true; } catch { return false; }
}
export function dayKey(iso: string, timezone: string) { return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso)); }
export function timeLabel(iso: string, timezone: string) { return new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(iso)); }
export function dateLabel(iso: string, timezone: string) { return new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "long", month: "short", day: "numeric", year: "numeric" }).format(new Date(iso)); }

export function calendarFile(receipt: Receipt) {
  const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
  const stamp = (s: string) => new Date(s).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const fold = (line: string) => {
    const encoder = new TextEncoder(); let out = "", bytes = 0;
    for (const character of line) {
      const size = encoder.encode(character).length;
      if (bytes + size > 75) { out += "\r\n "; bytes = 1; }
      out += character; bytes += size;
    }
    return out;
  };
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//DaytonGrowthCo//Scheduling//EN", "BEGIN:VEVENT", `UID:${escape(receipt.uid)}@daytongrowth.co`, `DTSTAMP:${stamp(new Date().toISOString())}`, `DTSTART:${stamp(receipt.start)}`, `DTEND:${stamp(receipt.end)}`, `SUMMARY:${escape(receipt.title)}`, `DESCRIPTION:${escape(serviceContent[receipt.service].preparation)}`, `LOCATION:${escape(receipt.meetingUrl || receipt.location || receipt.format)}`, "END:VEVENT", "END:VCALENDAR", ""].map(fold).join("\r\n");
}
