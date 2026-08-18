"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, FileText, Phone, Upload, X } from "lucide-react";
import { BrandWordmark } from "@/src/brand-wordmark";
import { captureAttribution, setFunnelVariant, trackFunnelEvent } from "@/src/funnel-analytics";
import { DeckSalesLetter } from "@/src/deck-sales-letter";
import { BetterQuoteForm } from "@/src/better-quote-form";
import { LockedVsl } from "@/src/locked-vsl";
import { ProgramPricingSection } from "@/src/program-pricing-section";
import { classifyBetterQuoteRequest, type BetterQuoteQualification } from "@/src/better-quote-qualification";
import { PrivacyContent, TermsContent } from "@/src/conversion-funnel";
import Cal, { getCalApi } from "@calcom/embed-react";
import "./better-quote-funnel.css";
import "./quote-field-stack.css";
import "./conversion-funnel.css";
import "./migration-direct-response.css";

type Qualification = {
  category: string;
  categoryOther: string;
  amount: string;
  hasQuote: string;
  timeline: string;
  zip: string;
  status: string;
};

type QuoteDetails = {
  currentPrice: string;
  provider: string;
  scope: string;
  equipment: string;
  warranty: string;
  notes: string;
  fileName: string;
  fileType: string;
};

type Contact = { firstName: string; lastName: string; email: string; phone: string; preferred: string };

const emptyQualification: Qualification = { category: "", categoryOther: "", amount: "", hasQuote: "", timeline: "", zip: "", status: "" };
const emptyQuote: QuoteDetails = { currentPrice: "", provider: "", scope: "", equipment: "", warranty: "", notes: "", fileName: "", fileType: "" };
const emptyContact: Contact = { firstName: "", lastName: "", email: "", phone: "", preferred: "Email" };

export function Header() {
  return <header className="conversion-header"><a href="https://daytongrowth.co" aria-label="DaytonGrowthCo home" className="conversion-brand"><BrandWordmark /></a><a className="conversion-contact" href="tel:+19373690829"><Phone size={16} aria-hidden="true" /> <span>(937) 369-0829</span></a></header>;
}

export function Footer() {
  return <footer className="conversion-footer"><div className="conversion-footer-brand"><BrandWordmark /></div><p>Copyright 2026, DaytonGrowthCo., All rights reserved. This site is not a part of the Facebook™ website or Facebook™ Inc. Additionally, this site is NOT endorsed by Facebook™ in any way. FACEBOOK™ is a trademark of FACEBOOK™, Inc.</p><nav><Link href="/quote/legal#terms">Terms</Link><Link href="/quote/legal#privacy">Privacy</Link></nav></footer>;
}

function LegalModal({ type, onClose }: { type: "terms" | "privacy"; onClose: () => void }) {
  useEffect(() => { const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose(); window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onClose]);
  return <div className="quote-legal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="quote-legal-modal" role="dialog" aria-modal="true" aria-label={type === "terms" ? "Terms of Service" : "Privacy Policy"}><button type="button" onClick={onClose} aria-label="Close"><X size={21} /><span>Close</span></button><h2>{type === "terms" ? "Terms of Service" : "Privacy Policy"}</h2>{type === "terms" ? <TermsContent /> : <PrivacyContent />}</section></div>;
}

function PrimaryButton({ children, type = "button", onClick, disabled }: { children: React.ReactNode; type?: "button" | "submit"; onClick?: () => void; disabled?: boolean }) {
  return <button className="quote-button" type={type} onClick={onClick} disabled={disabled}>{children}<ArrowRight size={17} aria-hidden="true" /></button>;
}

function BetterQuoteSurveyEmbed({ variant = "dsl" }: { variant?: "dsl" | "video" }) {
  const [qualification, setQualification] = useState<Qualification>(emptyQualification);
  const [step, setStep] = useState(0);
  const assessmentStarted = useRef(false);
  const total = 6;
  useEffect(() => { setFunnelVariant("better-quote", variant); }, [variant]);
  useEffect(() => { trackFunnelEvent("better-quote", "better_quote_assessment_step_viewed", { step_number: step + 1, step_name: `assessment_${step + 1}`, variant }); }, [step, variant]);
  function startAssessment() {
    if (assessmentStarted.current) return;
    assessmentStarted.current = true;
    trackFunnelEvent("better-quote", "better_quote_assessment_started", { variant });
  }
  const fields = [
    <div key="category" className="quote-field-stack"><label>What type of quote did you receive?<select required value={qualification.category} onChange={(e) => setQualification({ ...qualification, category: e.target.value })}><option value="">Select one</option><option>HVAC</option><option>Roofing</option><option>Plumbing</option><option>Electrical</option><option>Remodeling</option><option>Automotive repair</option><option>Tree service</option><option>Other</option></select></label>{qualification.category === "Other" && <label>What type of service?<input required autoFocus value={qualification.categoryOther} onChange={(e) => setQualification({ ...qualification, categoryOther: e.target.value })} placeholder="e.g. Pool installation" /></label>}</div>,
    <label key="amount">How much were you quoted?<input required type="number" min="0" step="1" value={qualification.amount} onChange={(e) => setQualification({ ...qualification, amount: e.target.value })} placeholder="$10,000" /></label>,
    <label key="hasQuote">Do you have a written quote or estimate?<select required value={qualification.hasQuote} onChange={(e) => setQualification({ ...qualification, hasQuote: e.target.value })}><option value="">Select one</option><option>Yes</option><option>No, but I know the price and details</option></select></label>,
    <label key="timeline">How soon do you need the work completed?<select required value={qualification.timeline} onChange={(e) => setQualification({ ...qualification, timeline: e.target.value })}><option value="">Select one</option><option>Immediately / emergency</option><option>Within a few days</option><option>Within 1–2 weeks</option><option>Within a month</option><option>{"I'm flexible"}</option></select></label>,
    <label key="zip">Where is the work located?<input required inputMode="numeric" pattern="[0-9]{5}" maxLength={5} value={qualification.zip} onChange={(e) => setQualification({ ...qualification, zip: e.target.value })} placeholder="ZIP code" /></label>,
    <label key="status">Have you already approved or paid for the work?<select required value={qualification.status} onChange={(e) => setQualification({ ...qualification, status: e.target.value })}><option value="">Select one</option><option>No</option><option>{"I approved it but haven't paid"}</option><option>I paid a deposit</option><option>The work has already started</option><option>The work is complete</option></select></label>,
  ];
  function next(event: FormEvent) { event.preventDefault(); const form = event.currentTarget as HTMLFormElement; if (!form.reportValidity()) return; if (step < total - 1) { trackFunnelEvent("better-quote", "better_quote_assessment_step_completed", { step_number: step + 1, step_name: `assessment_${step + 1}`, variant }); setStep(step + 1); } else { const result = classifyBetterQuoteRequest({ amount: qualification.amount, hasQuote: qualification.hasQuote, timeline: qualification.timeline, status: qualification.status }); sessionStorage.setItem("better-quote-qualification", JSON.stringify(qualification)); trackFunnelEvent("better-quote", "better_quote_qualification_completed", { variant, qualification: result }); trackFunnelEvent("better-quote", `better_quote_${result.replace("-", "_")}`, { variant }); setStep(total); } }
  const qualificationStatus = classifyBetterQuoteRequest({ amount: qualification.amount, hasQuote: qualification.hasQuote, timeline: qualification.timeline, status: qualification.status });
  if (step === total) return qualificationStatus === "disqualified" ? <InlineEligibilityResult /> : <section className="quote-final-step"><BetterQuoteForm compact variant={variant} qualification={{ serviceTier: qualification.category === "Other" ? qualification.categoryOther : qualification.category, budget: qualification.amount, hasQuote: qualification.hasQuote, timeline: qualification.timeline, zip: qualification.zip, intent: qualification.status }} /></section>;
  return <form className="quote-wizard quote-wizard-embedded" onFocusCapture={startAssessment} onSubmit={next}><div className="quote-wizard-top"><span>Step {step + 1} of {total}</span><span>{Math.round(((step + 1) / total) * 100)}%</span></div><div className="quote-progress"><span style={{ width: `${((step + 1) / total) * 100}%` }} /></div>{fields[step]}<div className={`quote-wizard-actions${step === 0 ? " quote-wizard-actions-first" : ""}`}>{step > 0 && <button type="button" className="quote-back" onClick={() => setStep(step - 1)}>Back</button>}<PrimaryButton type="submit">{step === total - 1 ? "Continue to quote" : "Next"}</PrimaryButton></div></form>;
}

function InlineEligibilityResult() {
  return <section className="quote-result"><div className="quote-result-icon"><FileText size={28} /></div><p className="quote-eyebrow">Not currently eligible</p><h2>This quote is not a fit right now.</h2><p>The program requires a written quote of at least $1,000 and enough time to complete a responsible comparison. It is not an emergency service and cannot review completed work.</p><Link className="quote-outline-button" href="/quote/">Review the program details <ArrowRight size={16} /></Link></section>;
}

export function BetterQuoteDslPage() {
  useEffect(() => { setFunnelVariant("better-quote", "dsl"); trackFunnelEvent("better-quote", "better_quote_landing_viewed", { variant: "dsl" }); }, []);
  return <DeckSalesLetter className="better-quote-dsl" legalBase="/quote/legal" title="The Better Quote Program™" deckId="1_eUYeISISWAZrAqO2VGtCD7BYgR7MC1VXKMw2cY50Vg"><BetterQuoteSurveyEmbed variant="dsl" /></DeckSalesLetter>;
}

export function BetterQuoteVideoPage() {
  useEffect(() => { setFunnelVariant("better-quote", "video"); trackFunnelEvent("better-quote", "better_quote_landing_viewed", { variant: "video" }); }, []);
  const video = <LockedVsl src="/api/better-quote-vsl" title="The Better Quote Program presentation" onStart={() => trackFunnelEvent("better-quote", "better_quote_vsl_started", { variant: "video" })} onProgress={(percent) => trackFunnelEvent("better-quote", `better_quote_vsl_${percent}_percent`, { variant: "video" })} onComplete={() => trackFunnelEvent("better-quote", "better_quote_vsl_completed", { variant: "video" })} />;
  return <DeckSalesLetter className="better-quote-dsl better-quote-video" legalBase="/quote/legal" title="The Better Quote Program™" deckId="1_eUYeISISWAZrAqO2VGtCD7BYgR7MC1VXKMw2cY50Vg" media={video} mediaLabel="The Better Quote Program video">
    <BetterQuoteSurveyEmbed variant="video" />
  </DeckSalesLetter>;
}

export function BetterQuotePricingPage() { return <main className="quote-shell"><Header /><ProgramPricingSection initialProgram="quote" /><Footer /></main>; }

export function BetterQuoteSurveyPage() {
  const [qualification, setQualification] = useState<Qualification>(emptyQualification);
  const [step, setStep] = useState(0);
  const assessmentStarted = useRef(false);
  const total = 6;
  function startAssessment() { if (assessmentStarted.current) return; assessmentStarted.current = true; trackFunnelEvent("better-quote", "better_quote_assessment_started"); }
  const fields = [
    <div key="category" className="quote-field-stack"><label>What type of quote did you receive?<select required value={qualification.category} onChange={(e) => setQualification({ ...qualification, category: e.target.value })}><option value="">Select one</option><option>HVAC</option><option>Roofing</option><option>Plumbing</option><option>Electrical</option><option>Remodeling</option><option>Automotive repair</option><option>Tree service</option><option>Other</option></select></label>{qualification.category === "Other" && <label>What type of service?<input required autoFocus value={qualification.categoryOther} onChange={(e) => setQualification({ ...qualification, categoryOther: e.target.value })} placeholder="e.g. Pool installation" /></label>}</div>,
    <label key="amount">How much were you quoted?<input required type="number" min="0" step="1" value={qualification.amount} onChange={(e) => setQualification({ ...qualification, amount: e.target.value })} placeholder="$10,000" /></label>,
    <label key="hasQuote">Do you have a written quote or estimate?<select required value={qualification.hasQuote} onChange={(e) => setQualification({ ...qualification, hasQuote: e.target.value })}><option value="">Select one</option><option>Yes</option><option>No, but I know the price and details</option></select></label>,
    <label key="timeline">How soon do you need the work completed?<select required value={qualification.timeline} onChange={(e) => setQualification({ ...qualification, timeline: e.target.value })}><option value="">Select one</option><option>Immediately / emergency</option><option>Within a few days</option><option>Within 1–2 weeks</option><option>Within a month</option><option>{"I'm flexible"}</option></select></label>,
    <label key="zip">Where is the work located?<input required inputMode="numeric" pattern="[0-9]{5}" maxLength={5} value={qualification.zip} onChange={(e) => setQualification({ ...qualification, zip: e.target.value })} placeholder="ZIP code" /></label>,
    <label key="status">Have you already approved or paid for the work?<select required value={qualification.status} onChange={(e) => setQualification({ ...qualification, status: e.target.value })}><option value="">Select one</option><option>No</option><option>{"I approved it but haven't paid"}</option><option>I paid a deposit</option><option>The work has already started</option><option>The work is complete</option></select></label>,
  ];
  function next(event: FormEvent) { event.preventDefault(); const form = event.currentTarget as HTMLFormElement; if (!form.reportValidity()) return; if (step < total - 1) { trackFunnelEvent("better-quote", "better_quote_assessment_step_completed", { step_number: step + 1 }); setStep(step + 1); } else { const result = classifyBetterQuoteRequest({ amount: qualification.amount, hasQuote: qualification.hasQuote, timeline: qualification.timeline, status: qualification.status }); sessionStorage.setItem("better-quote-qualification", JSON.stringify(qualification)); trackFunnelEvent("better-quote", "better_quote_qualification_completed", { qualification: result }); trackFunnelEvent("better-quote", `better_quote_${result.replace("-", "_")}`); window.location.assign(result === "disqualified" ? "/quote/not-a-fit/" : "/quote/quote/"); } }
  return <main className="quote-shell quote-survey-shell"><Header /><section className="quote-survey-heading"><p className="quote-eyebrow">The Better Quote Program™</p><h1>Let’s see if your quote qualifies.</h1><p>Six quick questions. No payment and no call required.</p></section><form className="quote-wizard" onFocusCapture={startAssessment} onSubmit={next}><div className="quote-wizard-top"><span>Step {step + 1} of {total}</span><span>{Math.round(((step + 1) / total) * 100)}%</span></div><div className="quote-progress"><span style={{ width: `${((step + 1) / total) * 100}%` }} /></div>{fields[step]}<div className={`quote-wizard-actions${step === 0 ? " quote-wizard-actions-first" : ""}`}>{step > 0 && <button type="button" className="quote-back" onClick={() => setStep(step - 1)}>Back</button>}<PrimaryButton type="submit">{step === total - 1 ? "Continue to quote" : "Next"}</PrimaryButton></div></form><Footer /></main>;
}

function determineQualification(q: Qualification): BetterQuoteQualification { return classifyBetterQuoteRequest({ amount: q.amount, hasQuote: q.hasQuote, timeline: q.timeline, status: q.status }, Number(process.env.NEXT_PUBLIC_BETTER_QUOTE_MIN_AMOUNT || 1000)); }

export function BetterQuoteSubmissionPage() {
  const [q, setQ] = useState<Qualification>(emptyQualification); const [quote, setQuote] = useState<QuoteDetails>(emptyQuote); const [contact, setContact] = useState<Contact>(emptyContact); const [uploadedQuote, setUploadedQuote] = useState<File | null>(null); const [legal, setLegal] = useState<"terms" | "privacy" | null>(null); const [consent, setConsent] = useState(false); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => { try { setQ(JSON.parse(sessionStorage.getItem("better-quote-qualification") || "{}")); } catch { /* direct access remains usable */ } }, []);
  const qualification = useMemo(() => determineQualification(q), [q]);
  async function submit(event: FormEvent) { event.preventDefault(); setError(""); if (!consent) { setError("Please agree to the communication terms before continuing."); return; } const notes = [quote.scope, quote.provider && `Existing provider: ${quote.provider}`, quote.equipment && `Equipment or materials: ${quote.equipment}`, quote.warranty && `Warranty: ${quote.warranty}`, quote.notes].filter(Boolean).join("\n"); if (!uploadedQuote) { setError("Attach the written quote or estimate you want us to review."); return; } setSaving(true); const name = `${contact.firstName} ${contact.lastName}`.trim(); try { const payload = new FormData(); payload.set("name", name); payload.set("email", contact.email); payload.set("phone", contact.phone); payload.set("service", q.category === "Other" ? q.categoryOther : q.category); payload.set("serviceTier", q.category === "Other" ? q.categoryOther : q.category); payload.set("budget", q.amount); payload.set("hasQuote", q.hasQuote); payload.set("timeline", q.timeline); payload.set("zip", q.zip); payload.set("intent", q.status); payload.set("notes", notes); payload.set("programAcknowledgment", "accepted"); payload.set("funnel_variant", captureAttribution("better-quote").funnel_variant || "standard"); for (const [key, value] of Object.entries(captureAttribution("better-quote"))) if (value) payload.set(key, value); payload.set("quote", uploadedQuote); const response = await fetch("/api/better-quote", { method: "POST", body: payload }); const result = await response.json().catch(() => ({})); if (!response.ok) throw new Error(result.message || "We couldn’t save your quote yet. Please try again."); const acceptedQualification = String(result.qualification || qualification) as BetterQuoteQualification; sessionStorage.setItem("better-quote-contact", JSON.stringify(contact)); trackFunnelEvent("better-quote", "better_quote_case_submitted", { qualification: acceptedQualification }); window.location.assign(acceptedQualification === "disqualified" ? "/quote/not-a-fit/" : "/quote/qualified/"); } catch (submissionError) { setError(submissionError instanceof Error ? submissionError.message : "We couldn’t save your quote yet. Please try again."); setSaving(false); } }
  return <main className="quote-shell quote-submission-shell"><Header /><section className="quote-survey-heading"><p className="quote-eyebrow">Step two · Quote submission</p><h1>Give us the estimate you already received.</h1><p>Upload the written quote you want us to review, then add any helpful context.</p></section><form className="quote-submission-form" onSubmit={submit}><section className="quote-form-card"><h2>Upload your quote</h2><p>Required. PDF, JPG, PNG, phone photo, or screenshot.</p><label className="quote-upload"><Upload size={21} /><span>{uploadedQuote?.name || "Choose a file"}</span><input required type="file" accept=".pdf,.doc,.docx,.txt,.rtf,.jpg,.jpeg,.png,.webp,.heic,image/*,application/pdf" onChange={(e) => { const file = e.target.files?.[0] || null; setUploadedQuote(file); setQuote({ ...quote, fileName: file?.name || "", fileType: file?.type || "" }); }} /></label><p className="quote-muted">Your document stays private and is only used to evaluate this request.</p><div className="quote-form-grid"><label>Current quoted price<input required value={quote.currentPrice || q.amount} onChange={(e) => setQuote({ ...quote, currentPrice: e.target.value })} /></label><label>Company that provided the quote<input value={quote.provider} onChange={(e) => setQuote({ ...quote, provider: e.target.value })} /></label><label className="quote-form-wide">Description of the work<textarea required rows={3} value={quote.scope} onChange={(e) => setQuote({ ...quote, scope: e.target.value })} placeholder="What is included in the estimate?" /></label><label>Equipment or materials<input value={quote.equipment} onChange={(e) => setQuote({ ...quote, equipment: e.target.value })} /></label><label>Warranty information<input value={quote.warranty} onChange={(e) => setQuote({ ...quote, warranty: e.target.value })} /></label><label className="quote-form-wide">Notes or exclusions<textarea rows={3} value={quote.notes} onChange={(e) => setQuote({ ...quote, notes: e.target.value })} /></label></div></section><section className="quote-form-card"><h2>Your contact details</h2><div className="quote-form-grid"><label>First name<input required autoComplete="given-name" value={contact.firstName} onChange={(e) => setContact({ ...contact, firstName: e.target.value })} /></label><label>Last name<input required autoComplete="family-name" value={contact.lastName} onChange={(e) => setContact({ ...contact, lastName: e.target.value })} /></label><label>Email<input required type="email" autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></label><label>Phone<input required type="tel" autoComplete="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></label><label>Preferred contact method<select value={contact.preferred} onChange={(e) => setContact({ ...contact, preferred: e.target.value })}><option>Email</option><option>Phone</option><option>Text</option></select></label></div><label className="quote-consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> <span>I agree to be contacted about this quote. Message frequency varies; message and data rates may apply. <button type="button" onClick={() => setLegal("terms")}>Terms</button> and <button type="button" onClick={() => setLegal("privacy")}>Privacy</button>.</span></label>{error && <p className="quote-error" role="alert">{error}</p>}<PrimaryButton type="submit" disabled={saving}>{saving ? "Saving…" : "Submit my quote"}</PrimaryButton><p className="quote-secondary-link">Questions? <Link href="/quote/book-call/">Talk to a real person</Link></p></section></form>{legal && <LegalModal type={legal} onClose={() => setLegal(null)} />}<Footer /></main>;
}

export function BetterQuoteQualifiedPage() { useEffect(() => { trackFunnelEvent("better-quote", "better_quote_qualified_viewed"); }, []); return <ResultPage qualified />; }
export function BetterQuoteNotFitPage() { useEffect(() => { trackFunnelEvent("better-quote", "better_quote_disqualified_viewed"); }, []); return <ResultPage qualified={false} />; }
function ResultPage({ qualified }: { qualified: boolean }) { return <main className="quote-shell"><Header /><section className="quote-result"><div className={`quote-result-icon ${qualified ? "is-qualified" : ""}`}>{qualified ? <Check size={28} /> : <FileText size={28} />}</div><p className="quote-eyebrow">{qualified ? "Case submitted" : "Not currently eligible"}</p><h1>{qualified ? "Your quote looks like a fit." : "This quote is not a fit right now."}</h1><p>{qualified ? "We’ve received your information. A real person will review the quote and aims to send an update within approximately 48 business hours once everything required is available. No meeting is required." : "The quote may be below our current minimum, too urgent for a meaningful search, already complete, or outside a category we currently support."}</p>{qualified ? <div className="quote-next-card"><h2>What happens next</h2><p>01 · We review your quote.</p><p>02 · A real person contacts local providers.</p><p>03 · We compare qualifying offers.</p><p>04 · You receive the result and any payment link by email.</p><strong>No qualifying savings? No fee under the written offer terms.</strong></div> : <div className="quote-next-card"><p>You can submit another quote or contact us if your situation is unusual.</p><Link className="quote-outline-button" href="/quote/survey/">Submit another quote <ArrowRight size={16} /></Link></div>}<Link className="quote-small-link" href="/quote/book-call/">Have questions? Talk to a real person — optional</Link></section><Footer /></main>; }

export function BetterQuoteBookingPage() { useEffect(() => { (async () => { const cal = await getCalApi({ namespace: "better-quote-program" }); cal("ui", { theme: "dark", hideEventTypeDetails: true, layout: "month_view" }); cal("on", { action: "bookingSuccessfulV2", callback: () => { trackFunnelEvent("better-quote", "better_quote_appointment_booked"); window.location.assign("/quote/call-confirmed/"); } }); })(); trackFunnelEvent("better-quote", "better_quote_calendar_viewed"); }, []); return <main className="quote-shell quote-booking-shell"><Header /><section className="quote-survey-heading"><p className="quote-eyebrow">Optional conversation</p><h1>Talk to a real person.</h1><p>The Better Quote Program™ is designed to run asynchronously, but you can book a conversation if you have questions.</p></section><section className="quote-cal"><Cal namespace="better-quote-program" calLink="daytongrowthco/better-quote-program" style={{ width: "100%", height: "100%", overflow: "scroll" }} config={{ layout: "month_view", useSlotsViewOnSmallScreen: "true", theme: "dark" }} /></section><Footer /></main>; }

export function BetterQuoteConfirmedPage() { useEffect(() => { trackFunnelEvent("better-quote", "better_quote_confirmation_viewed"); }, []); return <main className="quote-shell"><Header /><section className="quote-result"><div className="quote-result-icon is-qualified"><Check size={28} /></div><p className="quote-eyebrow">You’re on the calendar</p><h1>Bring the quote and the questions.</h1><p>We’ll use the conversation to understand the scope, explain the process, and make sure the program is a fit.</p><Link className="quote-small-link" href="/quote/">Back to The Better Quote Program™</Link></section><Footer /></main>; }

export function BetterQuoteLegalPage() { return <main className="quote-shell"><Header /><article className="quote-result quote-legal-page"><h1>Better Quote Program™ terms and privacy</h1><p className="legal-updated">Last updated: August 7, 2026</p><section id="terms"><TermsContent /></section><section id="privacy"><PrivacyContent /></section></article><Footer /></main>; }
