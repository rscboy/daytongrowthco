"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, PhoneCall, Play, ShieldCheck, X } from "lucide-react";
import { BrandWordmark } from "@/src/brand-wordmark";
import { captureAttribution, getFunnelSessionId, trackFunnelEvent } from "@/src/funnel-analytics";
import "./foundation-inspection-funnel.css";

type Assessment = {
  name: string; email: string; phone: string; business: string; website: string;
  service: string; revenueBand: string; inspectorCount: string; inspectionCapacity: string;
  currentMonthlyInspections: string; monthlyAdBudget: string; territory: string;
  timeline: string; access: string; goal: string;
};

const emptyAssessment: Assessment = {
  name: "", email: "", phone: "", business: "", website: "", service: "", revenueBand: "",
  inspectorCount: "", inspectionCapacity: "", currentMonthlyInspections: "", monthlyAdBudget: "",
  territory: "", timeline: "", access: "", goal: "",
};

function Header() {
  return <header className="foundation-header"><Link href="/foundation-inspections/" aria-label="Dayton Growth Co Foundation Inspections home"><BrandWordmark /></Link><a href="tel:+19373690829"><PhoneCall aria-hidden="true" /> (937) 369-0829</a></header>;
}

function Footer() {
  return <footer className="foundation-footer"><BrandWordmark onDark /><p>Practical growth systems for service businesses.</p><nav><Link href="/foundation-inspections/contact/">Contact</Link><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></nav></footer>;
}

function GuaranteeBadge() {
  return <div className="foundation-guarantee"><ShieldCheck aria-hidden="true" /><span><strong>25 qualifying inspections in 30 live campaign days</strong> or the next management fee is waived while we make up the shortfall.</span></div>;
}

function classify(a: Assessment): "qualified" | "manual-review" | "disqualified" {
  const unknown = [a.service, a.revenueBand, a.inspectorCount, a.inspectionCapacity, a.monthlyAdBudget, a.access].some((value) => value === "Not sure");
  if (unknown) return "manual-review";
  const hardFailure = a.service === "Other" || a.revenueBand === "Under $2M" || a.inspectorCount === "0–1" || a.inspectionCapacity === "Under 30" || a.monthlyAdBudget === "Under $6,000" || a.access === "No";
  return hardFailure ? "disqualified" : "qualified";
}

const steps = [
  { key: "contact", title: "First, who am I speaking with?" },
  { key: "service", title: "What work drives the business?" },
  { key: "revenue", title: "What is your approximate annual revenue?" },
  { key: "capacity", title: "Can your team absorb 25 more inspections?" },
  { key: "economics", title: "Can the campaign be funded correctly?" },
  { key: "territory", title: "Where and when do you want to grow?" },
  { key: "access", title: "Can we connect the operating systems?" },
] as const;

function AssessmentModal({ onClose }: { onClose: () => void }) {
  const [assessment, setAssessment] = useState(emptyAssessment);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const update = <K extends keyof Assessment>(key: K, value: Assessment[K]) => setAssessment((current) => ({ ...current, [key]: value }));
  const result = useMemo(() => classify(assessment), [assessment]);

  useEffect(() => {
    trackFunnelEvent("foundation-inspections", "foundation_assessment_started");
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function advance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    trackFunnelEvent("foundation-inspections", "foundation_assessment_step_completed", { step_number: step + 1, step_name: steps[step].key });
    if (step < steps.length - 1) { setStep((value) => value + 1); return; }
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/funnel-lead", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          funnel: "foundation-inspections", sessionId: getFunnelSessionId("foundation-inspections"), qualification: result,
          ...assessment, attribution: captureAttribution("foundation_inspections"),
        }),
      });
      if (!response.ok) throw new Error("Lead handoff failed");
      trackFunnelEvent("foundation-inspections", "foundation_assessment_submitted", { qualification: result });
      window.location.assign(result === "qualified" ? "/foundation-inspections/book-call/" : result === "manual-review" ? "/foundation-inspections/review/" : "/foundation-inspections/not-a-fit/");
    } catch {
      setError("We couldn’t save the assessment yet. Please try again."); setSaving(false);
    }
  }

  return <div className="foundation-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="foundation-modal" role="dialog" aria-modal="true" aria-labelledby="foundation-assessment-title">
      <button className="foundation-modal-close" type="button" onClick={onClose} aria-label="Close assessment"><X aria-hidden="true" /></button>
      <div className="foundation-modal-progress"><span>Step {step + 1} of {steps.length}</span><span>{Math.round(((step + 1) / steps.length) * 100)}%</span></div>
      <div className="foundation-modal-track"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <form onSubmit={advance}>
        <p className="foundation-eyebrow">Fit assessment</p><h2 id="foundation-assessment-title">{steps[step].title}</h2>
        {step === 0 && <div className="foundation-field-grid"><label>Your name<input required autoComplete="name" value={assessment.name} onChange={(e) => update("name", e.target.value)} /></label><label>Work email<input required type="email" autoComplete="email" value={assessment.email} onChange={(e) => update("email", e.target.value)} /></label><label>Mobile phone<input required type="tel" autoComplete="tel" value={assessment.phone} onChange={(e) => update("phone", e.target.value)} /></label><label>Company<input required value={assessment.business} onChange={(e) => update("business", e.target.value)} /></label><label className="wide">Website<input required type="url" placeholder="https://" value={assessment.website} onChange={(e) => update("website", e.target.value)} /></label></div>}
        {step === 1 && <label>Primary service<select required value={assessment.service} onChange={(e) => update("service", e.target.value)}><option value="">Select one</option><option>Foundation repair</option><option>Basement waterproofing</option><option>Crawl-space and structural work</option><option>Mixed foundation and waterproofing</option><option>Other</option><option>Not sure</option></select></label>}
        {step === 2 && <label>Annual revenue<select required value={assessment.revenueBand} onChange={(e) => update("revenueBand", e.target.value)}><option value="">Select one</option><option>Under $2M</option><option>$2M–$5M</option><option>$5M–$10M</option><option>$10M+</option><option>Not sure</option></select></label>}
        {step === 3 && <div className="foundation-field-grid"><label>Inspectors<select required value={assessment.inspectorCount} onChange={(e) => update("inspectorCount", e.target.value)}><option value="">Select one</option><option>0–1</option><option>2–3</option><option>4–6</option><option>7+</option><option>Not sure</option></select></label><label>Open inspection slots per month<select required value={assessment.inspectionCapacity} onChange={(e) => update("inspectionCapacity", e.target.value)}><option value="">Select one</option><option>Under 30</option><option>30–49</option><option>50–79</option><option>80+</option><option>Not sure</option></select></label><label className="wide">Current inspections per month<input required inputMode="numeric" value={assessment.currentMonthlyInspections} onChange={(e) => update("currentMonthlyInspections", e.target.value)} placeholder="Approximate number" /></label></div>}
        {step === 4 && <label>Separate monthly homeowner-acquisition budget<select required value={assessment.monthlyAdBudget} onChange={(e) => update("monthlyAdBudget", e.target.value)}><option value="">Select one</option><option>Under $6,000</option><option>$6,000–$8,000</option><option>$8,000–$12,000</option><option>$12,000+</option><option>Not sure</option></select></label>}
        {step === 5 && <div className="foundation-field-grid"><label className="wide">Primary service territory<input required value={assessment.territory} onChange={(e) => update("territory", e.target.value)} placeholder="Cities, counties, or metro" /></label><label>Desired start timing<select required value={assessment.timeline} onChange={(e) => update("timeline", e.target.value)}><option value="">Select one</option><option>Within 30 days</option><option>Within 60 days</option><option>Within 90 days</option><option>Researching for later</option></select></label><label>Primary growth goal<input required value={assessment.goal} onChange={(e) => update("goal", e.target.value)} placeholder="What needs to change?" /></label></div>}
        {step === 6 && <><label>Can you provide the CRM, calendar, ad-account, call-tracking, and territory access needed for delivery?<select required value={assessment.access} onChange={(e) => update("access", e.target.value)}><option value="">Select one</option><option>Yes</option><option>No</option><option>Not sure</option></select></label><p className="foundation-consent">By submitting, you agree to be contacted about this assessment. Message frequency varies; message and data rates may apply. Reply STOP to opt out. <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy</Link>.</p></>}
        {error && <p className="foundation-error" role="alert">{error}</p>}
        <div className="foundation-modal-actions">{step > 0 && <button type="button" className="foundation-back" onClick={() => setStep((value) => value - 1)}>Back</button>}<button className="foundation-button" type="submit" disabled={saving}>{saving ? "Saving…" : step === steps.length - 1 ? "See my next step" : "Continue"}<ArrowRight aria-hidden="true" /></button></div>
      </form>
    </section>
  </div>;
}

export function FoundationInspectionLandingPage() {
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  useEffect(() => { trackFunnelEvent("foundation-inspections", "foundation_landing_viewed"); }, []);
  const open = () => { trackFunnelEvent("foundation-inspections", "foundation_assessment_cta_clicked"); setAssessmentOpen(true); };
  return <main className="foundation-shell">
    <Header />
    <section className="foundation-hero"><p className="foundation-eyebrow">For foundation repair &amp; waterproofing contractors</p><h1>I’ll put 25 qualified, twice-confirmed inspections on your calendar every 30 live campaign days.</h1><p className="foundation-lede">I built the 25 Inspection System to turn territory demand into inspections your team can actually run—not another spreadsheet of shared “leads.”</p><GuaranteeBadge /><button className="foundation-button" type="button" onClick={open}>See if your market qualifies <ArrowRight aria-hidden="true" /></button><span className="foundation-button-note">Two-minute assessment. Price is discussed only after fit is confirmed.</span></section>
    <section className="foundation-video-section"><div className="foundation-stepbar">Step 1 · Watch the strategy</div><div className="foundation-video-placeholder"><span><Play fill="currentColor" aria-hidden="true" /></span><p className="foundation-eyebrow">Founder presentation</p><h2>Why inspection volume breaks—and how the system is designed to stabilize it.</h2><p>The recorded walkthrough will be placed here before paid traffic begins.</p></div><button className="foundation-text-cta" type="button" onClick={open}>Then check whether your company fits the operating requirements <ArrowRight aria-hidden="true" /></button></section>
    <section className="foundation-mechanism"><div><p className="foundation-eyebrow">The 25 Inspection System</p><h2>One accountable path from homeowner demand to a confirmed inspection.</h2><p>I connect the acquisition, qualification, routing, calendar, and confirmation layers so your team can see what was booked, why the homeowner called, and whether the appointment truly counts.</p></div><ol><li><span>01</span><strong>Territory demand</strong><p>Campaigns are built around the services and locations your team can actually fulfill.</p></li><li><span>02</span><strong>Qualification and routing</strong><p>Property, problem, contact, and service-area details are captured before handoff.</p></li><li><span>03</span><strong>Twice-confirmed scheduling</strong><p>The appointment is confirmed the day before and the morning of the inspection.</p></li></ol><GuaranteeBadge /></section>
    <section className="foundation-definition"><p className="foundation-eyebrow">What counts</p><h2>I measure inspections, not lead-form fills.</h2><div className="foundation-definition-grid"><article><Check aria-hidden="true" /><h3>Right homeowner</h3><p>The person owns or controls a property inside your approved territory and reports a relevant problem.</p></article><article><Check aria-hidden="true" /><h3>Complete appointment</h3><p>Name, property address, phone, appointment time, and problem notes reach your calendar or CRM.</p></article><article><Check aria-hidden="true" /><h3>Confirmed twice</h3><p>A cancellation before the scheduled visit does not count. A no-show after morning confirmation does.</p></article></div><GuaranteeBadge /></section>
    <section className="foundation-value"><div><p className="foundation-eyebrow">Built around the whole handoff</p><h2>The pieces that usually get sold separately work as one system.</h2></div><ul><li>Territory and demand setup</li><li>Paid-media campaign build</li><li>Conversion landing funnel</li><li>Qualification and routing</li><li>CRM and calendar integration</li><li>Two-step confirmation</li><li>Call tracking and attribution</li><li>Ongoing optimization</li></ul><button className="foundation-button" type="button" onClick={open}>Check company fit <ArrowRight aria-hidden="true" /></button><span className="foundation-button-note">No public price theatre. First we verify capacity, territory, and economics.</span></section>
    <section className="foundation-final"><p className="foundation-eyebrow">Start with fit</p><h2>If your team has the territory, capacity, and budget to fulfill the promise, I’ll show you the operating plan.</h2><GuaranteeBadge /><button className="foundation-button foundation-button-light" type="button" onClick={open}>Start the assessment <ArrowRight aria-hidden="true" /></button></section>
    <Footer />
    {assessmentOpen && <AssessmentModal onClose={() => setAssessmentOpen(false)} />}
  </main>;
}

function ResultLayout({ review = false }: { review?: boolean }) {
  useEffect(() => { trackFunnelEvent("foundation-inspections", review ? "foundation_review_viewed" : "foundation_disqualified_viewed"); }, [review]);
  return <main className="foundation-shell"><Header /><section className="foundation-result"><div className="foundation-result-mark">{review ? "?" : "—"}</div><p className="foundation-eyebrow">{review ? "Manual review" : "Not a fit right now"}</p><h1>{review ? "I need to check one part of the operating fit." : "The 25 Inspection System would be the wrong promise today."}</h1><p>{review ? "Your assessment is in the CRM. I’ll review the territory, capacity, and budget details before suggesting a next step." : "The guarantee depends on enough inspection capacity, a defined territory, system access, and a properly funded campaign. Starting without those conditions would set both sides up to miss."}</p><div className="foundation-result-actions"><Link href="/foundation-inspections/">Review the system</Link><a href="mailto:help@daytongrowth.co">Ask a specific question</a></div></section><Footer /></main>;
}

export function FoundationNotFitPage() { return <ResultLayout />; }
export function FoundationReviewPage() { return <ResultLayout review />; }

export function FoundationContactPage() {
  useEffect(() => { trackFunnelEvent("foundation-inspections", "foundation_contact_viewed"); }, []);
  return <main className="foundation-shell"><Header /><section className="foundation-result"><p className="foundation-eyebrow">Contact DaytonGrowthCo</p><h1>Have a specific question about the 25 Inspection System?</h1><p>Email is best for account, territory, and assessment questions. If the issue is time-sensitive, call during normal Eastern business hours.</p><div className="foundation-result-actions"><a href="mailto:help@daytongrowth.co">help@daytongrowth.co</a><a href="tel:+19373690829">(937) 369-0829</a></div></section><Footer /></main>;
}
