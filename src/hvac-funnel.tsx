"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Check, PhoneCall, Play, X } from "lucide-react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { BrandWordmark } from "@/src/brand-wordmark";
import { LockedVsl } from "@/src/locked-vsl";
import { captureAttribution, trackFunnelEvent } from "@/src/funnel-analytics";
import "./hvac-funnel.css";
import "./hvac-vsl.css";
import "./funnel-type-polish.css";
import "./calcom-booking.css";
import "./calcom-shell-override.css";
import "./legal-modal.css";

const vslVideoUrl = process.env.NEXT_PUBLIC_HVAC_VSL_VIDEO_URL;

function FunnelHeader() {
  return (
    <header className="funnel-header">
      <a href="https://www.daytongrowth.co" aria-label="Dayton Growth Co home" className="funnel-brand">
        <BrandWordmark />
      </a>
      <a className="funnel-header-call" href="tel:+19373690829"><PhoneCall aria-hidden="true" /> (937) 369-0829</a>
    </header>
  );
}

function FunnelFooter() {
  return (
    <footer className="funnel-footer">
      <BrandWordmark onDark />
      <p>Practical systems for service businesses.</p>
      <nav aria-label="Funnel legal and contact links">
        <Link href="/hvac/legal#terms">Terms</Link>
        <Link href="/hvac/legal#privacy">Privacy</Link>
        <a href="mailto:help@daytongrowth.co">help@daytongrowth.co</a>
      </nav>
    </footer>
  );
}

function VslFrame() {
  if (vslVideoUrl) return <LockedVsl src={vslVideoUrl} title="HVAC AI call coverage presentation" onStart={() => trackFunnelEvent("ai-call-system", "hvac_vsl_started")} onComplete={() => trackFunnelEvent("ai-call-system", "hvac_vsl_completed")} />;
  return <div className="vsl-frame vsl-empty"><div className="vsl-play"><Play aria-hidden="true" fill="currentColor" /></div><p className="funnel-kicker">Video presentation</p><strong>Your HVAC call coverage walkthrough</strong><span>See how a call-handling system can answer, qualify, and route opportunities using the rules your team already follows.</span></div>;
}

function CalInlineEmbed({ name, email }: { name?: string; email?: string }) {
  const calConfig: Record<string, string> = { layout: "month_view", useSlotsViewOnSmallScreen: "true", theme: "dark" };
  if (name) calConfig.name = name;
  if (email) calConfig.email = email;

  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "ai-call-system-program" });
      cal("ui", { theme: "dark", hideEventTypeDetails: true, layout: "month_view" });
      cal("on", { action: "bookingSuccessfulV2", callback: () => {
        trackFunnelEvent("ai-call-system", "hvac_appointment_booked");
        window.location.assign("/hvac/call-confirmed/");
      } });
    })();
  }, []);

  return <Cal namespace="ai-call-system-program" calLink="daytongrowthco/ai-call-system-program" style={{ width: "100%", height: "100%", overflow: "scroll" }} config={calConfig} />;
}

export function HVACVslPage() {
  useEffect(() => { trackFunnelEvent("ai-call-system", "hvac_landing_viewed"); }, []);
  return <main className="funnel-shell"><FunnelHeader />
    <section className="funnel-intro offer-intro">
      <h1>Stop letting the calls you pay to generate end in voicemail.</h1>
    </section>
    <section className="vsl-section" aria-label="Video sales letter"><VslFrame /></section>
    <AssessmentForm />
    <FunnelFooter />
  </main>;
}

type SurveyState = { name: string; email: string; phone: string; callVolume: string; coverage: string; goal: string };
const emptySurvey: SurveyState = { name: "", email: "", phone: "", callVolume: "", coverage: "", goal: "" };

export function SurveyPage() {
  return <main className="funnel-shell"><FunnelHeader />
    <AssessmentForm /><FunnelFooter />
  </main>;
}

function AssessmentForm() {
  const [survey, setSurvey] = useState<SurveyState>(emptySurvey);
  const [step, setStep] = useState(-1);
  const [legalOpen, setLegalOpen] = useState<"terms" | "privacy" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const totalSteps = 7;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmissionError("");
    trackFunnelEvent("ai-call-system", "hvac_assessment_submitted");
    try {
      const response = await fetch("/api/funnel-lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          funnel: "ai-call-system",
          name: survey.name,
          email: survey.email,
          phone: survey.phone,
          callVolume: survey.callVolume,
          coverage: survey.coverage,
          goal: survey.goal,
          attribution: captureAttribution("hvac"),
        }),
      });
      if (!response.ok) throw new Error("Lead handoff failed");
      sessionStorage.setItem("hvac-assessment", JSON.stringify(survey));
      trackFunnelEvent("ai-call-system", "hvac_lead_captured");
      window.location.assign("/hvac/book-call/");
    } catch {
      setSubmissionError("We couldn’t save your assessment. Please try again before continuing.");
      setSubmitting(false);
    }
  }
  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (event.currentTarget.reportValidity()) {
      trackFunnelEvent("ai-call-system", "hvac_assessment_step_completed", {
        step_number: step + 1,
        step_name: ["name", "email", "phone", "call_volume", "coverage_gap", "goal", "consent"][step],
      });
      setStep((current) => Math.min(current + 1, totalSteps - 1));
    }
  }
  const update = <K extends keyof SurveyState>(key: K, value: SurveyState[K]) => setSurvey((current) => ({ ...current, [key]: value }));
  if (step === -1) return <section className="assessment-launch" aria-labelledby="hvac-assessment-title"><div className="assessment-launch-copy"><h2 id="hvac-assessment-title">See where your call coverage can tighten up.</h2><p>Answer a few practical questions. You will choose a time after the assessment.</p></div><button className="funnel-button" type="button" onClick={() => { trackFunnelEvent("ai-call-system", "hvac_assessment_started"); setStep(0); }}>Start the 2-minute assessment <ArrowRight aria-hidden="true" /></button></section>;
  return <><form className="assessment-form assessment-wizard" onSubmit={step === totalSteps - 1 ? submit : next}>
    <div className="wizard-topline"><span>Question {step + 1} of {totalSteps}</span><span>{Math.round(((step + 1) / totalSteps) * 100)}%</span></div>
    <div className="wizard-track"><span style={{ width: `${((step + 1) / totalSteps) * 100}%` }} /></div>
    {step === 0 && <label>Name<input required value={survey.name} onChange={(e) => update("name", e.target.value)} autoComplete="name" /></label>}
    {step === 1 && <label>Work email<input required type="email" value={survey.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" /></label>}
    {step === 2 && <label>Mobile number<input required type="tel" value={survey.phone} onChange={(e) => update("phone", e.target.value)} autoComplete="tel" /></label>}
    {step === 3 && <label>How many inbound calls do you handle in a typical week?<select required value={survey.callVolume} onChange={(e) => update("callVolume", e.target.value)}><option value="">Select one</option><option>Fewer than 25</option><option>25–75</option><option>76–150</option><option>More than 150</option></select></label>}
    {step === 4 && <label>Where do calls get lost most often?<select required value={survey.coverage} onChange={(e) => update("coverage", e.target.value)}><option value="">Select one</option><option>After hours</option><option>When the office is busy</option><option>Weekends or holidays</option><option>Follow-up and scheduling</option><option>Not sure yet</option></select></label>}
    {step === 5 && <label>What would make this assessment valuable?<textarea required rows={4} value={survey.goal} onChange={(e) => update("goal", e.target.value)} placeholder="For example: fewer voicemails, better emergency routing, or faster appointment booking." /></label>}
    {step === 6 && <label className="consent"><input type="checkbox" required /> <span>I agree to be contacted about this assessment. Message frequency varies; message and data rates may apply. Reply STOP to opt out. <button type="button" className="inline-legal-link" onClick={() => setLegalOpen("terms")}>Terms</button> &amp; <button type="button" className="inline-legal-link" onClick={() => setLegalOpen("privacy")}>Privacy</button>.</span></label>}
    {submissionError && <p className="migration-form-error" role="alert">{submissionError}</p>}
    <div className="wizard-actions">{step > 0 && <button className="wizard-back" type="button" onClick={() => setStep((current) => current - 1)}>Back</button>}<button className="funnel-button" type="submit" disabled={submitting}>{submitting ? "Saving…" : step === totalSteps - 1 ? "Continue to scheduling" : "Next"} <ArrowRight aria-hidden="true" /></button></div>
  </form>{legalOpen && <FunnelLegalModal type={legalOpen} onClose={() => setLegalOpen(null)} />}</>;
}

function FunnelLegalModal({ type, onClose }: { type: "terms" | "privacy"; onClose: () => void }) {
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, [onClose]);
  return <div className="legal-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="legal-modal" role="dialog" aria-modal="true" aria-labelledby="hvac-legal-title"><button className="legal-modal-close" type="button" onClick={onClose} autoFocus><X aria-hidden="true" /><span>Close</span></button><h2 id="hvac-legal-title">{type === "terms" ? "Terms & communication consent" : "Privacy policy"}</h2>{type === "terms" ? <TermsCopy /> : <PrivacyCopy />}</section></div>;
}

export function BookingPage() {
  const [prefill, setPrefill] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    trackFunnelEvent("ai-call-system", "hvac_calendar_viewed");
    try {
      const saved = JSON.parse(window.sessionStorage.getItem("hvac-assessment") || "{}") as Partial<SurveyState>;
      setPrefill({ name: saved.name || undefined, email: saved.email || undefined });
    } catch {
      // Booking remains available even if a visitor arrived here directly.
    }
  }, []);

  return <main className="funnel-shell booking-shell"><FunnelHeader />
    <section className="funnel-intro booking-intro hvac-booking-title"><h1>Let’s map the calls your team is missing.</h1></section>
    <section className="calcom-booking-shell" aria-label="Schedule a consultation"><CalInlineEmbed {...prefill} /></section><FunnelFooter />
  </main>;
}

export function ConfirmedPage() {
  useEffect(() => { trackFunnelEvent("ai-call-system", "hvac_confirmation_viewed"); }, []);
  return <main className="funnel-shell"><FunnelHeader />
    <section className="funnel-intro confirmed-intro"><div className="confirmation-mark"><Check aria-hidden="true" /></div><p className="funnel-kicker">You’re on the calendar</p><h1>Bring the messy version of your call process.</h1><p>That’s the useful part. Before we talk, make a quick note of what happens when a caller needs service, an estimate, an after-hours response, or a human immediately.</p></section>
    <section className="prep-grid" aria-label="How to prepare"><article><span>01</span><h2>Notice the gaps</h2><p>Where do callers wait, leave a voicemail, or reach someone who cannot help?</p></article><article><span>02</span><h2>Bring one real example</h2><p>A recent missed call, rushed handoff, or call your office had to clean up is enough.</p></article><article><span>03</span><h2>Keep notifications on</h2><p>Your appointment details and any changes will arrive by email and, if you opted in, text message.</p></article></section>
    <section className="simple-contact"><p>Need to reschedule?</p><a href="mailto:help@daytongrowth.co">Email help@daytongrowth.co</a><span>or</span><a href="tel:+19373690829">call (937) 369-0829</a></section><FunnelFooter />
  </main>;
}

export function FunnelLegalPage() {
  return <main className="legal-shell"><FunnelHeader /><article className="legal-document"><p className="funnel-kicker">Dayton Growth Co</p><h1>Terms, consent & privacy</h1><p className="legal-date">Last updated: July 20, 2026</p><section id="terms"><TermsCopy /></section><section id="privacy"><PrivacyCopy /></section></article><FunnelFooter /></main>;
}

function TermsCopy() { return <div className="legal-copy"><h2>Terms & communication consent</h2><p>By providing your contact information and requesting a consultation from Dayton Growth Co, you agree to receive appointment-related and service-related communications.</p><h3>Consent to communications</h3><p>When you provide your phone number or email address, you consent to communications about your requested consultation, scheduling, service updates, and follow-up related to your inquiry.</p><h3>SMS disclosure</h3><p>Message frequency varies. Message and data rates may apply. Reply <strong>STOP</strong> to opt out at any time or <strong>HELP</strong> for assistance. Carriers are not liable for delayed or undelivered messages.</p></div>; }
function PrivacyCopy() { return <div className="legal-copy"><h2>Privacy policy</h2><p>Dayton Growth Co respects your privacy and protects personal information collected when you engage with our services.</p><h3>Information we collect and use</h3><p>We may collect your name, email address, phone number, business details, inquiry details, and communication history to manage appointments, provide requested services, respond to inquiries, and improve our service.</p><h3>Information sharing</h3><p>We do not sell, rent, or share personal information with third parties or affiliates for marketing or promotional purposes. Mobile opt-in data and consent are not shared with third parties. Contact <a href="mailto:help@daytongrowth.co">help@daytongrowth.co</a> with privacy requests.</p></div>; }
