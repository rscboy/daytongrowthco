import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { betterQuotePricing } from "@/src/better-quote-pricing";
import { classifyBetterQuoteRequest } from "@/src/better-quote-qualification";

export const runtime = "nodejs";

const crmEndpoint = process.env.FUNNEL_CRM_ENDPOINT || "https://daytongrowthco-crm.vercel.app/api/internal/funnel-leads";
const maxFileSize = 15 * 1024 * 1024;
const allowedExtensions = new Set(["pdf", "doc", "docx", "txt", "rtf", "jpg", "jpeg", "png", "webp", "heic"]);
const allowedMimeTypes = new Set([
  "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain", "application/rtf", "text/rtf", "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif",
  "application/octet-stream",
]);

function clean(value: FormDataEntryValue | null) { return typeof value === "string" ? value.trim() : ""; }

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  const name = clean(form.get("name"));
  const email = clean(form.get("email"));
  const phone = clean(form.get("phone"));
  const service = clean(form.get("service"));
  const notes = clean(form.get("notes"));
  const serviceTier = clean(form.get("serviceTier"));
  const budget = clean(form.get("budget"));
  const hasQuote = clean(form.get("hasQuote"));
  const timeline = clean(form.get("timeline"));
  const zip = clean(form.get("zip"));
  const intent = clean(form.get("intent"));
  const sessionId = clean(form.get("sessionId"));
  const attribution = Object.fromEntries(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid", "msclkid", "funnel_variant"].flatMap((key) => {
    const value = clean(form.get(key));
    return value ? [[key, value]] : [];
  }));
  const programAcknowledged = clean(form.get("programAcknowledgment")) === "accepted";
  const possibleFile = form.get("quote");
  const file = possibleFile instanceof File && possibleFile.size > 0 ? possibleFile : null;
  const qualification = classifyBetterQuoteRequest({ amount: budget, hasQuote, timeline, status: intent }, Number(process.env.BETTER_QUOTE_MIN_AMOUNT || 1000));
  if (!name || !email || !phone || !service || !programAcknowledged) return NextResponse.json({ message: "Please complete every required field and confirm the program terms." }, { status: 400 });
  if (qualification === "disqualified") return NextResponse.json({ message: "This request is not currently eligible. The program requires a written quote of at least $1,000 and enough time for a responsible comparison.", qualification }, { status: 400 });
  if (!file) return NextResponse.json({ message: "Attach the written quote or estimate you want us to review." }, { status: 400 });
  if (file && file.size > maxFileSize) return NextResponse.json({ message: "Use a file smaller than 15 MB." }, { status: 400 });
  const extension = file?.name.split(".").pop()?.toLowerCase() || "";
  if (file && !allowedExtensions.has(extension)) return NextResponse.json({ message: "Please attach a PDF, Word document, text file, or image." }, { status: 400 });
  if (file?.type && !allowedMimeTypes.has(file.type.toLowerCase())) return NextResponse.json({ message: "The uploaded file type does not match an accepted quote document." }, { status: 400 });
  try {
    const safeName = file?.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const upload = file && safeName ? await put(`better-quote-requests/${crypto.randomUUID()}-${safeName}`, file, { access: "private", addRandomSuffix: false }) : null;
    const secret = process.env.FUNNEL_CRM_API_SECRET || process.env.CRM_API_SECRET;
    if (!secret) throw new Error("Lead capture is not configured.");
    const relay = await fetch(crmEndpoint, { method: "POST", headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" }, body: JSON.stringify({ funnel: "better-quote", ...(sessionId ? { sessionId } : {}), qualification, name, email, phone, service, serviceTier, goal: notes, budget, timeline, zip, intent, attribution, quote: { currentPrice: budget, notes, hasQuote }, ...(upload && file ? { quoteFile: { pathname: upload.pathname, url: upload.url, filename: file.name, contentType: file.type, size: file.size } } : {}), legalAcknowledgment: { programAcknowledged: true, pricingVersion: betterQuotePricing.version, termsVersion: "2026-08-07", privacyVersion: "2026-08-07", acknowledgedAt: new Date().toISOString() } }), cache: "no-store" });
    const relayResult = await relay.json().catch(() => ({})) as { prospectId?: string; notification?: { customerConfirmation?: string; teamNotification?: string }; message?: string };
    if (!relay.ok) throw new Error(relayResult.message || "Lead capture was not accepted.");
    return NextResponse.json({ ok: true, prospectId: relayResult.prospectId, qualification, notification: relayResult.notification }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "We couldn’t save your request." }, { status: 502 });
  }
}
