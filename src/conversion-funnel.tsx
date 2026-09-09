"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Phone, Play, X } from "lucide-react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { BrandWordmark } from "@/src/brand-wordmark";
import { LockedVsl } from "@/src/locked-vsl";
import { DeckSalesLetter } from "@/src/deck-sales-letter";
import { MigrationPresentation } from "./workflow-studio";
import { emptyMigrationAssessment, migrationDraftKey, readMigrationDraft, type MigrationAssessment } from "./migration-assessment";
import { getFunnelSessionId, trackFunnelEvent, trackFunnelLeadProgress } from "@/src/funnel-analytics";
import "./conversion-funnel.css";
import "./migration-funnel.css";
import "./legal-modal.css";
import "./calcom-booking.css";
import "./booking-title.css";
import "./calcom-shell-override.css";
import "./migration-minimal.css";
import "./funnel-type-polish.css";
import "./migration-direct-response.css";

const funnel = {
  product: "website migration planning",
  audience: "marketing leaders, owners, and web teams",
  email: "help@daytongrowth.co",
  phone: "(937) 369-0829",
  legalName: "DaytonGrowthCo. LLC",
};

// A web-optimised, fast-start encode of the approved VSL. Keeping it on the
// funnel origin removes the Google Drive relay from the visitor experience.
const migrationVslVideoUrl = process.env.NEXT_PUBLIC_WEBSITE_VSL_VIDEO_URL || "/vsl/website-migration-program.mp4?v=20260803";
const migrationVslPosterUrl = "/vsl/website-migration-program-poster.jpg";

type MigrationAttribution = Partial<Record<"utm_source" | "utm_medium" | "utm_campaign" | "utm_content" | "utm_term" | "fbclid" | "gclid" | "msclkid", string>>;
const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid", "msclkid"] as const;

function migrationAttribution(): MigrationAttribution {
  if (typeof window === "undefined") return {};
  const storageKey = "dgc_migration_attribution";
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(storageKey) || "{}") as MigrationAttribution;
    const incoming = Object.fromEntries(attributionKeys.flatMap((key) => {
      const value = new URLSearchParams(window.location.search).get(key);
      return value ? [[key, value]] : [];
    })) as MigrationAttribution;
    const attribution = { ...stored, ...incoming };
    window.sessionStorage.setItem(storageKey, JSON.stringify(attribution));
    return attribution;
  } catch {
    return {};
  }
}

function Header() {
  return (
    <header className="conversion-header">
      <a href="https://daytongrowth.co" aria-label="DaytonGrowthCo home" className="conversion-brand"><BrandWordmark /></a>
      <a className="conversion-contact" href={`tel:${funnel.phone}`}>
        <Phone aria-hidden="true" /> <span>{funnel.phone}</span>
      </a>
    </header>
  );
}

function Footer() {
  return (
    <footer className="conversion-footer">
      <div className="conversion-footer-brand"><BrandWordmark /></div>
      <p>Copyright 2026, DaytonGrowthCo., All rights reserved. This site is not a part of the Facebook™ website or Facebook™ Inc. Additionally, this site is NOT endorsed by Facebook™ in any way. FACEBOOK™ is a trademark of FACEBOOK™, Inc.</p>
      <nav aria-label="Funnel legal and contact links">
        <Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link>
      </nav>
    </footer>
  );
}

const migrationFields: Array<{ key: keyof MigrationAssessment; label: string; hint: string; type?: string; autocomplete?: string; options?: string[] }> = [
  { key: "name", label: "What should we call you?", hint: "Let’s start with your name.", autocomplete: "name" },
  { key: "email", label: "Where can we reach you?", hint: "Use the email you would like us to reply to.", type: "email", autocomplete: "email" },
  { key: "business", label: "What’s your company called?", hint: "The business this website belongs to.", autocomplete: "organization" },
  { key: "phone", label: "What’s the best phone number?", hint: "A number we can use to discuss your migration.", type: "tel", autocomplete: "tel" },
  { key: "website", label: "What’s your current website?", hint: "Include https:// so we can find the right site.", type: "url", autocomplete: "url" },
  { key: "platform", label: "What platform are you using?", hint: "It is fine if you are not sure.", options: ["WordPress", "Webflow", "Shopify", "Wix or Squarespace", "Other / not sure"] },
  { key: "annualCost", label: "What do you spend each year?", hint: "Your current website costs. An estimate is useful.", options: ["Under $250", "$250–$999", "$1,000–$2,499", "$2,500–$4,999", "$5,000+", "Not sure"] },
  { key: "timeline", label: "When would you like to launch?", hint: "We will confirm a realistic timeline with your scope.", options: ["Within 30 days", "30–90 days", "More than 90 days", "Not scheduled"] },
  { key: "intent", label: "What are you planning?", hint: "Choose the option closest to your situation.", options: ["Planning a migration to a new platform", "Looking to upgrade or improve my current website", "I’m not sure yet — I’d like to learn more", "Already have a website and happy with it", "Do not need a website right now"] },
  { key: "budget", label: "What budget have you set aside?", hint: "This helps us recommend a useful next step.", options: ["Under $1,000", "$1,000–$2,500", "$2,500–$5,000", "$5,000+", "Still deciding"] },
];

function MigrationForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [legalOpen, setLegalOpen] = useState<"terms" | "privacy" | null>(null);
  const [step, setStep] = useState(0);
  const [assessment, setAssessment] = useState<MigrationAssessment>(emptyMigrationAssessment);
  const [consent, setConsent] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [draftReady, setDraftReady] = useState(false);
  const [restored, setRestored] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const assessmentStarted = useRef(false);
  const userAdvanced = useRef(false);
  const buttonPointer = useRef(false);
  const totalSteps = 11;
  const stepNames = ["name", "email", "company", "phone", "website", "platform", "annual_cost", "timeline", "migration_goal", "budget", "consent"] as const;
  const field = migrationFields[step];

  useEffect(() => {
    try {
      const draft = readMigrationDraft(window.sessionStorage.getItem(migrationDraftKey));
      if (draft && Object.values(draft.assessment).some((value) => value.trim())) { setAssessment(draft.assessment); setStep(draft.step); setRestored(true); }
    } catch { /* The form remains usable when browser storage is unavailable. */ }
    setDraftReady(true);
  }, []);
  useEffect(() => {
    if (!draftReady || submitted) return;
    try {
      if (!Object.values(assessment).some((value) => value.trim())) { window.sessionStorage.removeItem(migrationDraftKey); return; }
      window.sessionStorage.setItem(migrationDraftKey, JSON.stringify({ assessment, step, savedAt: Date.now() }));
    } catch { /* Optional recovery only. */ }
  }, [assessment, step, draftReady, submitted]);
  useEffect(() => {
    if (!userAdvanced.current) return;
    const control = fieldRef.current?.querySelector<HTMLElement>("input, select");
    control?.focus({ preventScroll: true });
    control?.scrollIntoView({ block: "nearest", behavior: "instant" });
    if (buttonPointer.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const animation = fieldRef.current?.animate([{ opacity: .65, transform: "translateY(5px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 200, easing: "cubic-bezier(.23,1,.32,1)" });
      return () => animation?.cancel();
    }
  }, [step]);

  function startAssessment() {
    if (assessmentStarted.current) return;
    assessmentStarted.current = true;
    trackFunnelEvent("website-migration", "migration_assessment_started");
  }
  function moveTo(nextStep: number) {
    userAdvanced.current = true;
    setFieldError(""); setSubmissionError(""); setStep(nextStep);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const control = fieldRef.current?.querySelector<HTMLInputElement | HTMLSelectElement>("input, select");
    if (control && !control.checkValidity()) {
      const message = control.validity.valueMissing ? (step === 10 ? "Please review and agree to the terms before continuing." : "Please complete this answer to continue.") : field?.type === "email" ? "Enter a valid email address, such as name@company.com." : field?.type === "url" ? "Enter a full website address, starting with https://." : "Please check this answer.";
      setFieldError(message); control.focus(); return;
    }
    setFieldError("");
    if (step < totalSteps - 1) {
      if (step === 0) trackFunnelEvent("website-migration", "migration_cta_clicked", { cta: "assessment_next" });
      trackFunnelEvent("website-migration", "migration_assessment_step_completed", { step_number: step + 1, step_name: stepNames[step] });
      if (step >= 1 && assessment.name && assessment.email) trackFunnelLeadProgress("website-migration", { name: assessment.name, email: assessment.email, stepNumber: step + 1, stepName: stepNames[step], totalSteps });
      moveTo(step + 1); return;
    }
    if (!consent) { setFieldError("Please review and agree to the terms before continuing."); return; }
    const invalidStep = migrationFields.findIndex((item) => !assessment[item.key].trim() || (item.options && !item.options.includes(assessment[item.key])));
    if (invalidStep >= 0) { moveTo(invalidStep); setFieldError("Please complete this answer before submitting."); return; }
    setSubmitting(true); setSubmissionError("");
    const disqualified = ["Already have a website and happy with it", "Do not need a website right now"].includes(assessment.intent) || assessment.budget === "Under $1,000";
    try {
      const response = await fetch("/api/funnel-lead", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ funnel: "website-migration", sessionId: getFunnelSessionId("website-migration"), qualification: disqualified ? "disqualified" : "qualified", ...assessment, goal: assessment.intent, attribution: { ...migrationAttribution(), funnel_variant: "standard" } }) });
      if (!response.ok) throw new Error("Lead handoff failed");
      trackFunnelEvent("website-migration", "migration_assessment_submitted", { qualification: disqualified ? "disqualified" : "qualified" });
      trackFunnelEvent("website-migration", disqualified ? "migration_disqualified" : "migration_qualified", { budget_band: assessment.budget });
      trackFunnelEvent("website-migration", "migration_lead_captured", { qualification: disqualified ? "disqualified" : "qualified" });
      setSubmitted(true);
      try { window.sessionStorage.removeItem(migrationDraftKey); } catch { /* No draft to clear. */ }
      router.push(disqualified ? "/websites/not-a-fit/" : "/websites/book-call/");
    } catch {
      setSubmissionError("We couldn’t save your assessment. Your answers are still here. Please try again.");
      setSubmitting(false);
    }
  }
  function startOver() {
    setAssessment(emptyMigrationAssessment); setConsent(false); setRestored(false); moveTo(0);
  }
  const update = (key: keyof MigrationAssessment, value: string) => { setAssessment((current) => ({ ...current, [key]: value })); setFieldError(""); };
  return <section className="migration-form-section" id="assessment" aria-labelledby="migration-assessment-heading">
    <header className="migration-assessment-intro"><span>Plan the next step</span><h2 id="migration-assessment-heading">Let’s make the move specific.</h2><p>A few details about your current site, your plans, and what matters to your team.</p></header>
    {submitted ? <div className="migration-saved" role="status"><Check size={28} /><h3>Your assessment is saved.</h3><p>Opening your next step…</p></div> : <form ref={formRef} noValidate onFocusCapture={startAssessment} onSubmit={submit} className="migration-form migration-wizard" aria-busy={submitting}>
      <div className="migration-wizard-topline"><span aria-live="polite">Question {step + 1} of {totalSteps}</span><span>{Math.round((step / totalSteps) * 100)}% complete</span></div>
      <div className="migration-wizard-track" role="progressbar" aria-label="Assessment progress" aria-valuemin={0} aria-valuemax={totalSteps} aria-valuenow={step}><span style={{ transform: `scaleX(${step / totalSteps})` }} /></div>
      {restored && <div className="migration-draft-notice"><span>Your answers from this tab are restored.</span><button type="button" onClick={startOver}>Start over</button></div>}
      <div className="migration-field-stage" ref={fieldRef} key={step}>
        {field ? <><label htmlFor={`migration-${field.key}`}>{field.label}</label><p id="migration-field-hint">{field.hint}</p>{field.options ? <select id={`migration-${field.key}`} name={field.key} required value={assessment[field.key]} aria-invalid={Boolean(fieldError)} aria-describedby={`migration-field-hint${fieldError ? " migration-field-error" : ""}`} onChange={(event) => update(field.key, event.target.value)}><option value="" disabled>Select one</option>{field.options.map((option) => <option key={option}>{option}</option>)}</select> : <input id={`migration-${field.key}`} name={field.key} type={field.type ?? "text"} autoComplete={field.autocomplete} inputMode={field.type === "tel" ? "tel" : field.type === "url" ? "url" : field.type === "email" ? "email" : "text"} required maxLength={2000} value={assessment[field.key]} aria-invalid={Boolean(fieldError)} aria-describedby={`migration-field-hint${fieldError ? " migration-field-error" : ""}`} onChange={(event) => update(field.key, event.target.value)} />}</> : <><h3>Ready for the next step.</h3><p>Review your details and give us permission to follow up about your website.</p><div className="migration-answer-summary"><strong>{assessment.business}</strong><span>{assessment.email}</span><span>{assessment.website}</span></div><label className="migration-consent"><input type="checkbox" required checked={consent} onChange={(event) => { setConsent(event.target.checked); setFieldError(""); }} aria-invalid={Boolean(fieldError)} aria-describedby={fieldError ? "migration-field-error" : undefined} /><span>I agree to the <button type="button" onClick={() => setLegalOpen("terms")}>terms</button> and <button type="button" onClick={() => setLegalOpen("privacy")}>privacy policy</button>.</span></label></>}
        {fieldError && <p className="migration-form-error" id="migration-field-error" role="alert">{fieldError}</p>}
      </div>
      {submissionError && <p className="migration-form-error" role="alert">{submissionError}</p>}
      <div className="migration-wizard-actions">{step > 0 && <button className="migration-wizard-back" type="button" disabled={submitting} onClick={(event) => { buttonPointer.current = event.detail > 0; moveTo(step - 1); }}>Back</button>}<button className="conversion-button" type="submit" disabled={submitting || !draftReady} onClick={(event) => { buttonPointer.current = event.detail > 0; }}>{submitting ? "Saving your assessment…" : step === totalSteps - 1 ? "Save and continue" : "Next"}<ArrowRight aria-hidden="true" /></button></div>
      <p className="migration-draft-help">You can go back and change an answer. Answers stay in this tab for up to 24 hours.</p>
    </form>}
    {legalOpen && <LegalModal type={legalOpen} onClose={() => setLegalOpen(null)} />}
  </section>;
}

function LegalModal({ type, onClose }: { type: "terms" | "privacy"; onClose: () => void }) {
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    const controls = () => Array.from(dialog?.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex="0"]') ?? []);
    controls()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key !== "Tab") return;
      const items = controls(); const first = items[0]; const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = oldOverflow; window.removeEventListener("keydown", onKeyDown); opener?.focus({ preventScroll: true }); };
  }, [onClose]);
  return <div className="legal-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section ref={dialogRef} className="legal-modal" role="dialog" aria-modal="true" aria-labelledby="legal-modal-title"><button className="legal-modal-close" type="button" onClick={onClose}><X aria-hidden="true" /><span>Close</span></button><h2 id="legal-modal-title">{type === "terms" ? "Terms & communication consent" : "Privacy policy"}</h2>{type === "terms" ? <TermsContent /> : <PrivacyContent />}</section></div>;
}

function VslPlaceholder() {
  if (migrationVslVideoUrl) {
    const isScreenKite = migrationVslVideoUrl.includes("screenkite.com/");
    return <section className="vsl-section" aria-label="Website migration video">{isScreenKite ? <div className="vsl-embed"><iframe src={migrationVslVideoUrl} title="Website migration planning presentation" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /></div> : <LockedVsl src={migrationVslVideoUrl} poster={migrationVslPosterUrl} title="Website migration planning presentation" onStart={() => trackFunnelEvent("website-migration", "migration_vsl_started")} onProgress={(percent) => trackFunnelEvent("website-migration", `migration_vsl_${percent}_percent`)} onComplete={() => trackFunnelEvent("website-migration", "migration_vsl_completed")} />}</section>;
  }
  return <section className="vsl-section" aria-label="VSL video placeholder"><div className="vsl-placeholder"><Play aria-hidden="true" /><div><strong>VSL video goes here</strong><span>Replace this placeholder with the approved migration video.</span></div></div></section>;
}

export function ConversionLandingPage() {
  useEffect(() => { trackFunnelEvent("website-migration", "migration_landing_viewed"); }, []);
  return <DeckSalesLetter className="migration-landing-shell" title="The Website Migration Program™" deckId="1vvqb58Ujse1QVEkPpGQPLV9BLOkLs4lTWm4uAGiv4r0" media={<MigrationPresentation />} mediaLabel="Website migration program presentation"><a className="migration-full-presentation" href="https://docs.google.com/presentation/d/1vvqb58Ujse1QVEkPpGQPLV9BLOkLs4lTWm4uAGiv4r0/preview" target="_blank" rel="noopener noreferrer">Read the full program presentation <ArrowRight size={14} /></a><MigrationForm /></DeckSalesLetter>;
}

export function ConversionBookingPage() {
  const calConfig: Record<string, string> = { layout: "month_view", useSlotsViewOnSmallScreen: "true", theme: "dark" };
  useEffect(() => {
    trackFunnelEvent("website-migration", "migration_calendar_viewed");
    (async function () {
      const cal = await getCalApi({ namespace: "website-migration-program" });
      cal("ui", { theme: "dark", hideEventTypeDetails: true, layout: "month_view" });
      cal("on", { action: "bookingSuccessfulV2", callback: () => { trackFunnelEvent("website-migration", "migration_appointment_booked"); window.location.assign("/call-confirmed/"); } });
    })();
  }, []);
  return <main className="conversion-shell migration-booking-page">
    <Header />
    <section className="booking-intro booking-title"><p className="conversion-kicker">Step two · Migration review</p><h1>Book a focused review of your website move.</h1><p>We’ll look at the current site, target platform, and launch risks that deserve a plan.</p></section>
    <section className="conversion-calendly calcom-booking-shell migration-calcom-shell" aria-label="Schedule a consultation"><Cal namespace="website-migration-program" calLink="daytongrowthco/website-migration-program" style={{ width: "100%", height: "100%", overflow: "scroll" }} config={calConfig} /></section>
    <Footer />
  </main>;
}

export function ConversionConfirmedPage() {
  useEffect(() => { trackFunnelEvent("website-migration", "migration_confirmation_viewed"); }, []);
  return <main className="conversion-shell">
    <Header />
    <section className="confirmation-intro"><div className="confirmed-mark"><Check aria-hidden="true" /></div><p className="conversion-kicker">Your migration review is booked</p><h1>Bring the current site. Leave with a clearer next step.</h1><p>We’ll use the call to make the move specific to your pages, platform, forms, and launch timeline.</p></section>
    <section className="prepare-grid"><article><span>01</span><h2>Current URL</h2><p>Bring the site you are moving from.</p></article><article><span>02</span><h2>Target platform</h2><p>Tell us where the new site will live.</p></article><article><span>03</span><h2>Launch date</h2><p>Share the timeline you are working toward.</p></article></section>
    <section className="reschedule"><p>Need to make a change?</p><a href={`mailto:${funnel.email}`}>Email {funnel.email}</a><span>or</span><a href={`tel:${funnel.phone}`}>call {funnel.phone}</a></section>
    <Footer />
  </main>;
}

export function ConversionNotFitPage() {
  useEffect(() => { trackFunnelEvent("website-migration", "migration_not_fit_viewed"); }, []);
  return <main className="conversion-shell"><Header /><section className="confirmation-intro not-fit-intro"><div className="confirmed-mark"><Check aria-hidden="true" /></div><p className="conversion-kicker">Thanks for the context</p><h1>This conversation is not the right next step yet.</h1><p>This assessment is for teams planning a website migration or upgrade with a working budget of at least $1,000. If that changes, you are welcome to come back and reassess.</p><Link className="conversion-button" href="https://daytongrowth.co">Return to DaytonGrowthCo. <ArrowRight aria-hidden="true" /></Link></section><Footer /></main>;
}

export function ConversionLegalPage({ type }: { type: "terms" | "privacy" }) {
  const terms = type === "terms";
  return <main className="conversion-shell">
    <Header />
    <article className="conversion-legal"><p className="conversion-kicker">{funnel.legalName}</p><h1>{terms ? "Terms & communication consent" : "Privacy policy"}</h1><p className="legal-updated">Last updated: August 7, 2026</p>{terms ? <TermsContent /> : <PrivacyContent />}</article>
    <Footer />
  </main>;
}

export function TermsContent() { return <div className="legal-content">
  <p>These Terms apply when you use DaytonGrowthCo. LLC’s websites, request a Website Migration Review, submit a Better Quote Program™ case, or otherwise request our services. A project-specific written agreement controls if it conflicts with these Terms.</p>
  <h2>1. Website Migration Program™ pricing and Annual Cost Guarantee</h2><p>The Website Migration Program™ is a one-time migration or rebuild project. Before work begins, we provide a written scope that states the one-time project fee, included work, and any approved integration fees. The project fee pays for the migration or rebuild itself; it is not an annual CMS, hosting, or platform charge.</p><p>Our <strong>Annual Cost Guarantee</strong> compares your documented current annual recurring website cost with the projected annual recurring cost after the approved migration. The current annual cost may include your domain, CMS or platform subscription, and hosting. The projected ownership cost typically includes a domain renewal of about $15 per year, with static hosting at no recurring charge from DaytonGrowthCo. If the documented projected annual recurring ownership cost is not lower than the documented current annual recurring website cost, the Website Migration Program™ fee is not due.</p><p>This guarantee does not compare the one-time project fee with a single year of your current CMS subscription, and it does not guarantee that the one-time fee will be recovered in a particular time. The written comparison must identify the included recurring costs and assumptions before work begins. Optional third-party services, integrations, transaction fees, email services, advertising, domain-price changes, taxes, and costs outside the approved scope are excluded unless the written scope expressly includes them. Once you approve the written scope and work begins, the one-time project fee is not refundable solely because you later prefer a different platform, stop using the site, or decide not to continue with optional services; nothing here limits any non-waivable rights under applicable law.</p>
  <h2>2. The Better Quote Program™</h2><p>The Better Quote Program™ is an information-sharing and quote-comparison service. You may submit an existing quote, estimate, project description, or related information. Our team may review that information and have real people contact independent local providers to seek alternative pricing, availability, or quote information. We may use software, communications tools, or AI-assisted document processing for administrative work; provider outreach and quote shopping are human-led.</p><p>We do not perform, supervise, employ, partner with, broker for, or guarantee the underlying HVAC, roofing, plumbing, electrical, remodeling, automotive, repair, installation, or other third-party work. Providers are independent third parties, and you decide whether to hire one. You contract directly with any provider you choose.</p>
  <h2>3. Your authorization and responsibilities</h2><p>By submitting a case, you confirm that you are at least 18, have authority to request quotes for the property, vehicle, equipment, or project, and provide accurate, current, and complete information. This includes relevant quote documents, scope, photos, equipment or property details, existing damage, timing, deposits, work already performed, and relevant communications. Missing or inaccurate information can prevent a meaningful comparison or cause a provider to change its price.</p><p>You authorize DaytonGrowthCo. and its representatives to contact potential providers about your submitted project to request pricing, availability, scope information, or quotes. We aim to minimize disclosure and generally do not need to share your original quoted price, full identity, phone number, email, or exact address unless reasonably necessary or you authorize it. A provider may require more information before it will quote; we will request it from you when practical.</p>
  <h2>4. Qualifying Quote and Gross Savings</h2><p>A <strong>Qualifying Quote</strong> is an alternative quote from a legitimate provider that we reasonably determine is available for a similar or reasonably comparable project, taking into account scope, materials, equipment, included and excluded services, warranties, taxes, fees, financing, geography, validity, provider availability, required inspections, and other material differences. A preliminary or conditional quote may change after an onsite inspection or new information. Whether a conditional quote qualifies for a fee is determined in the written result presented to you.</p><p><strong>Gross Savings</strong> means the difference between your submitted existing quote and a Qualifying Quote, adjusted as reasonably necessary for material differences between the two. A lower number alone is not automatically comparable savings. We use reasonable judgment, not a guarantee of mathematical or professional certainty.</p>
  <h2>5. Fees, payment, and information release</h2><p>There is no upfront search fee. If we do not identify qualifying savings under these Terms, your Better Quote Program™ fee is $0. The current success-fee schedule is: gross savings below $199: $0; $199 to $494.99: $99; $495 through $2,500: 20% of gross savings; above $2,500: $500 for the first $2,500 plus 10% of the amount above $2,500. Pricing can change prospectively, but the pricing agreed for your submitted case will not be changed retroactively without your affirmative agreement. We retain the applicable pricing version with the case where technically practical.</p><p>If qualifying savings are found, we will show you the savings calculation and success fee before requesting payment. You purchase access to the successful Better Quote Program™ result, not the underlying provider’s service. After payment is successfully authorized, we may release the provider identity, contact details, quote, and booking information. Before payment, we may provide a truthful limited or anonymized summary while withholding provider details and the complete quote. We do not fabricate, alter, or falsify provider quotes.</p>
  <h2>6. No guarantee; provider changes</h2><p>“If we don’t save you money, you don’t pay” does not guarantee that we will find savings, a particular dollar amount or percentage, a particular number of provider contacts, or the absolute lowest price in the market. Not every provider will respond or quote remotely, and you may independently find a different price. Our target of approximately 48 business hours begins after we receive the information needed to work a case; it is an estimate, not a deadline guarantee, and provider responsiveness may affect it.</p><p>Providers control their own price, availability, quote expiration, scheduling, scope, warranties, financing, permits, licensing, insurance, safety, qualifications, workmanship, and performance. The information we provide is not a promise that a provider will perform work as described, at a particular price, or at all. Review all quote terms, expiration dates, licensing, insurance, safety, qualifications, warranties, and final scope directly with a provider before authorizing work. We do not represent providers as vetted unless we specifically state a documented verification we performed.</p>
  <h2 id="better-quote-program-refund-policy">7. Better Quote Program™ refund policy</h2><p>We will refund the Better Quote Program™ savings fee if you paid the fee and no cheaper comparable quote is available to you because the quoted provider cancels or withdraws the Qualifying Quote before you can reasonably act on it. We will also refund the savings fee if the provider changes the base comparable price by 20% or more within 24 hours after we deliver the Better Quote result to you.</p><p>To request a refund, email <a href="mailto:quotes@daytongrowth.co">quotes@daytongrowth.co</a> within 7 calendar days of the cancellation, withdrawal, or price change and include the provider’s written notice or revised quote. This limited refund policy covers the Better Quote Program™ savings fee only. It does not cover amounts paid to a provider, deposits, financing costs, taxes, permits, or other third-party charges.</p><p>This refund policy does not apply where the price change is caused by a customer-requested scope change, a material condition, missing or inaccurate information supplied to us or the provider, new site or property findings, permit or tax requirements, financing terms, or another material difference from the quote we compared. It also does not make DaytonGrowthCo. responsible for the provider’s conduct, work, or final contract terms. Nothing in this section limits any non-waivable rights under applicable law.</p>
  <h2>8. Billing questions</h2><p>Please contact us promptly at <a href="mailto:quotes@daytongrowth.co">quotes@daytongrowth.co</a> if you believe a charge is incorrect. We will review duplicate charges, technical payment errors, a charge made when no qualifying savings existed, or a material calculation error. Subject to applicable law and the refund policy above, a fee is not automatically refundable because you decide not to proceed, choose another provider, change scope, wait until a quote expires, or omit information that changes the provider’s price. Payment processors, including Stripe when used, process payment information under their own terms and privacy policies; we do not store full payment-card numbers.</p>
  <h2>9. Safety, advice, and communications</h2><p>The program is not an emergency-response service. Do not delay urgent work involving health, safety, utilities, structural integrity, fire, gas, electrical hazards, flooding, vehicle safety, or similar risks solely to wait for quote comparison. Quote comparisons are informational and consumer-assistance services, not legal, engineering, architectural, financial, insurance, diagnostic, or licensed trade advice.</p><p>By submitting a request, you agree we may send transactional emails, calls, or texts needed to confirm submission, request missing information, provide case updates, notify you of a quote, process payment, deliver results, or provide support. Promotional messages, if any, require separate consent where required; marketing-text consent is not a condition of purchasing the program. Message frequency varies; message and data rates may apply; reply STOP to opt out of eligible text messages or HELP for help.</p>
  <h2>10. Limits, disputes, and changes</h2><p>To the extent permitted by applicable law, DaytonGrowthCo. is not responsible for an independent provider’s acts, omissions, changed quotes, workmanship, injury, property damage, delay, permit, tax, financing, or other service outcome. We do not limit liability where law does not permit it. Please contact us first so we can try to resolve a concern in good faith. These Terms do not impose mandatory arbitration, a class-action waiver, governing-law choice, or a consumer indemnity obligation; any such provisions require separate attorney-approved terms before use.</p><p>We may update these Terms prospectively by posting a new date. Questions can be sent to <a href="mailto:quotes@daytongrowth.co">quotes@daytongrowth.co</a> or {funnel.phone}.</p>
</div>; }

export function PrivacyContent() { return <div className="legal-content">
  <p>This Privacy Policy explains how DaytonGrowthCo. LLC handles information collected through our websites, Website Migration funnel, and The Better Quote Program™. It applies to our services, not the independent providers or other third-party sites you may choose to use.</p>
  <h2>1. Information we collect</h2><p>We may collect contact information, ZIP code, project location when needed, quote amounts, uploaded quote documents, photos, project descriptions, vehicle, equipment, or property information, provider communications, payment transaction information, appointment details, and support communications. For a Website Migration Review or Annual Cost Guarantee comparison, we may also collect the current website platform, domain, hosting, recurring CMS or platform charges, optional-service charges, and scope details needed to prepare the written comparison. We also collect limited website, device, browser, referral, cookie, and analytics information. Uploaded documents may contain personal information; please do not submit passwords, payment-card numbers, or information not needed for your request.</p>
  <h2>2. How we use it</h2><p>We use information to provide and evaluate a request, prepare website migration scopes and annual-cost comparisons, review quotes, contact providers on your authorization, calculate savings, process payments, deliver results, communicate with you, prevent fraud, maintain business records, support customers, improve our services, comply with law, and send marketing only where permitted or consented to. Administrative technology, including AI-assisted document processing, may help extract, summarize, or organize submitted material; it does not replace the human-led provider outreach described for the Better Quote Program™.</p>
  <h2>3. How we share it</h2><p>We share information with service providers that help operate hosting, file storage, CRM, payment processing, email, SMS, analytics, security, scheduling, support, and document-processing systems. For a Better Quote case, we may share the minimum relevant project information with potential providers to request or compare quotes. We do not provide project information to providers for their independent marketing. We do not sell personal information or share mobile opt-in consent with third parties or affiliates for their marketing or promotional purposes.</p>
  <h2>4. Files, security, and retention</h2><p>We use reasonable administrative, technical, and organizational safeguards designed to protect the information we maintain. Uploaded quote files are transmitted to our service providers and stored with access controls; they are not intentionally published through public or guessable links. No system is completely secure. We keep information for as long as reasonably necessary for an active or completed case, accounting, taxes, fraud prevention, dispute resolution, legal obligations, and service improvement. Specific retention periods are operational policy decisions and may vary by record type.</p>
  <h2>5. Cookies, analytics, and marketing</h2><p>We use cookies, browser storage, and similar tools for security, form functionality, analytics, performance, and site improvement. You can control cookies through your browser, although some features may not work. Transactional communications are distinct from promotional messages. Promotional email includes an unsubscribe option where required. We do not claim that all tracking is disabled when you use third-party services, which have their own policies.</p>
  <h2>6. Your choices and rights</h2><p>Depending on where you live, you may request access to, correction of, or deletion of personal information, or opt out of certain marketing. We may need to verify your request and may retain information where needed for accounting, tax, fraud prevention, legal claims, contract enforcement, or legal compliance. Contact <a href={`mailto:${funnel.email}`}>{funnel.email}</a> with “Privacy Request” in the subject line.</p>
  <h2>7. Children, changes, and contact</h2><p>Our services are intended for adults and are not directed to children under 13. We may update this policy as our practices change and will post the updated date. Questions can be sent to <a href={`mailto:${funnel.email}`}>{funnel.email}</a> or {funnel.phone}.</p>
</div>; }
