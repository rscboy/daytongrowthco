"use client";

import { FocusEvent, FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Upload } from "lucide-react";
import { captureAttribution, getFunnelSessionId, trackFunnelEvent, trackFunnelLeadProgress } from "./funnel-analytics";
import { betterQuotePricing } from "./better-quote-pricing";
import type { BetterQuoteQualification } from "./better-quote-qualification";

type BetterQuoteFormProps = {
  compact?: boolean;
  variant?: "dsl" | "video";
  qualification?: {
    serviceTier?: string;
    budget?: string;
    hasQuote?: string;
    timeline?: string;
    zip?: string;
    intent?: string;
  };
};

export function BetterQuoteForm({ compact = false, variant = "dsl", qualification }: BetterQuoteFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("quote") as File | null;
    const hasFile = Boolean(file && file.size > 0);
    if (!hasFile) { setStatus("error"); setMessage("Attach the written quote or estimate you want us to review."); return; }
    if (new FormData(form).get("programAcknowledgment") !== "accepted") { setStatus("error"); setMessage("Please confirm the Better Quote Program terms before sending your request."); return; }
    setStatus("sending"); setMessage("");
    try {
      const payload = new FormData(form);
      const response = await fetch("/api/better-quote", { method: "POST", body: payload });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "We couldn’t send your request. Please try again.");
      form.reset();
      const qualificationStatus = String(result?.qualification || "qualified") as BetterQuoteQualification;
      trackFunnelEvent("better-quote", "better_quote_case_submitted", { variant, qualification: qualificationStatus });
      setStatus("sent");
      setMessage(qualificationStatus === "manual-review"
        ? "Your quote is saved for a manual eligibility review. We’ll confirm whether the search can proceed before contacting providers."
        : result?.notification?.customerConfirmation === "sent"
          ? "Your quote is in, and your confirmation email is on its way. We’ll review everything and follow up once we have what we need."
          : "Your quote is saved. We’ll review it and follow up directly, but we could not verify that your confirmation email was accepted.");
    } catch (error) { setStatus("error"); setMessage(error instanceof Error ? error.message : "We couldn’t send your request. Please try again."); }
  }

  function saveProgress(event: FocusEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    if (name && email) trackFunnelLeadProgress("better-quote", {
      name, email, stepNumber: 7, stepName: "Quote upload and contact details", totalSteps: 7,
      formData: {
        phone: String(data.get("phone") || "").trim(), service: String(data.get("service") || "").trim(),
        budget: String(data.get("budget") || "").trim(), has_quote: String(data.get("hasQuote") || "").trim(),
        timeline: String(data.get("timeline") || "").trim(), zip: String(data.get("zip") || "").trim(),
        intent: String(data.get("intent") || "").trim(), notes: String(data.get("notes") || "").trim(),
        quote_file_name: data.get("quote") instanceof File && (data.get("quote") as File).size > 0 ? (data.get("quote") as File).name : "",
      },
    });
  }

  return <section id="quote-upload" className={`better-quote-upload ${compact ? "is-compact" : ""}`} aria-labelledby="quote-upload-title">
    <div className="better-quote-upload-copy">
      <h2 id="quote-upload-title">Send your quote when you’re ready.</h2>
      <p>Upload the written estimate you want reviewed, then add any helpful context. Every request is reviewed by a real person.</p>
    </div>
    <form className="better-quote-form" onSubmit={submit} onBlur={saveProgress} encType="multipart/form-data">
      <label>Name<input name="name" autoComplete="name" required /></label>
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Phone<input name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="(937) 555-0123" required /></label>
      <label>What is the quote for?<input name="service" placeholder="Example: HVAC replacement" required /></label>
      <label className="quote-file-field"><span>Written quote or estimate <em>Required</em></span><input name="quote" type="file" accept=".pdf,.doc,.docx,.txt,.rtf,.jpg,.jpeg,.png,.webp,.heic,image/*" required /><span className="quote-file-help"><Upload size={16} aria-hidden="true" /> PDF, Word document, or image · up to 15 MB</span></label>
      <label className="quote-notes">Anything we should know? <span>Optional</span><textarea name="notes" rows={4} placeholder="Add important context about scope, timing, equipment, warranties, or exclusions." /></label>
      <input type="hidden" name="pricingVersion" value={betterQuotePricing.version} />
      <input type="hidden" name="serviceTier" value={qualification?.serviceTier || ""} />
      <input type="hidden" name="budget" value={qualification?.budget || ""} />
      <input type="hidden" name="hasQuote" value={qualification?.hasQuote || ""} />
      <input type="hidden" name="timeline" value={qualification?.timeline || ""} />
      <input type="hidden" name="zip" value={qualification?.zip || ""} />
      <input type="hidden" name="intent" value={qualification?.intent || ""} />
      <input type="hidden" name="funnel_variant" value={variant} />
      <input type="hidden" name="sessionId" value={getFunnelSessionId("better-quote")} />
      {Object.entries(captureAttribution("better_quote")).map(([key, value]) => <input key={key} type="hidden" name={key} value={value || ""} />)}
      <label className="better-quote-consent"><input name="programAcknowledgment" type="checkbox" value="accepted" required /><span>I am requesting The Better Quote Program™ and authorize DaytonGrowthCo. to seek alternative quotes for this project. I understand there is no upfront search fee and that a success fee may become due if qualifying savings are found under the displayed pricing rules. I agree to the <a href="/terms/" target="_blank" rel="noreferrer">Terms of Service</a> and acknowledge the <a href="/privacy/" target="_blank" rel="noreferrer">Privacy Policy</a>.</span></label>
      <button className="button button-primary large" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending your quote…" : "Send My Quote"}<ArrowRight size={16} aria-hidden="true" /></button>
      {status !== "idle" && <p className={`better-quote-status is-${status}`} role="status">{status === "sent" && <CheckCircle2 size={18} aria-hidden="true" />}{message}</p>}
    </form>
  </section>;
}
