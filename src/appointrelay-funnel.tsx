"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, PhoneCall, ShieldCheck, X } from "lucide-react";
import { BrandWordmark } from "@/src/brand-wordmark";
import { AppointRelayVslPlayer, readAppointRelayVslLead } from "@/src/appointrelay-vsl-player";
import { captureAttribution, getFunnelSessionId, trackFunnelEvent } from "@/src/funnel-analytics";
import styles from "./appointrelay-funnel.module.css";

type Assessment = {
  name: string; email: string; phone: string; business: string; website: string;
  industry: string; appointmentType: string; monthlyOpportunities: string; backlog: string;
  averageValue: string; currentSystem: string; access: string; timeline: string; goal: string;
  schedulingOwner: string;
};

const emptyAssessment: Assessment = {
  name: "", email: "", phone: "", business: "", website: "", industry: "",
  appointmentType: "", monthlyOpportunities: "", backlog: "", averageValue: "",
  currentSystem: "", access: "", timeline: "", goal: "",
  schedulingOwner: "",
};

const steps = [
  { key: "contact", title: "Who should I build the workflow around?" },
  { key: "operation", title: "Where are appointments being lost?" },
  { key: "volume", title: "Is there enough opportunity to justify the system?" },
  { key: "stack", title: "What does AppointRelay™ need to work with?" },
  { key: "timing", title: "What needs to change first?" },
] as const;

function classify(a: Assessment): "qualified" | "manual-review" | "disqualified" {
  if (a.access === "No" || a.schedulingOwner === "No owner yet" || a.monthlyOpportunities === "Under 100" || a.timeline === "Researching for later") return "disqualified";
  if ([a.industry, a.monthlyOpportunities, a.access, a.schedulingOwner].some((value) => value === "Not sure") || a.schedulingOwner === "Shared responsibility" || a.industry === "Other appointment-based operation") return "manual-review";
  return "qualified";
}

function Header() {
  return <header className={styles.header}>
    <Link href="/appointrelay/" aria-label="AppointRelay home"><BrandWordmark /></Link>
    <div className={styles.productMark}><span>AppointRelay</span><sup>™</sup></div>
    <a href="tel:+19373690829"><PhoneCall aria-hidden="true" /> <span>(937) 369-0829</span></a>
  </header>;
}

function Footer() {
  return <footer className={styles.footer}>
    <div><BrandWordmark onDark /><p>Human-controlled appointment automation for operational teams.</p></div>
    <nav aria-label="AppointRelay legal and contact links"><Link href="/appointrelay/contact/">Contact</Link><Link href="/appointrelay/terms/">Terms</Link><Link href="/appointrelay/privacy/">Privacy</Link></nav>
  </footer>;
}

function VslSection({ onStart }: { onStart: () => void }) {
  const videoSource = process.env.NEXT_PUBLIC_APPOINTRELAY_VSL_URL;
  const captionSource = process.env.NEXT_PUBLIC_APPOINTRELAY_VSL_CAPTIONS_URL;
  const configuredGate = Number(process.env.NEXT_PUBLIC_APPOINTRELAY_VSL_GATE_SECONDS || "60");
  const gateAt = Number.isFinite(configuredGate) && configuredGate > 0 ? configuredGate : 60;
  return <section className={styles.vsl} aria-labelledby="appointrelay-vsl-title">
    <p className={styles.watchBar}>STEP 1 · {videoSource ? "WATCH" : "REVIEW"} THE WORKFLOW</p>
    <div className={styles.vslFrame}>
      {videoSource ? <AppointRelayVslPlayer src={videoSource} captions={captionSource} gateAt={gateAt} /> : <div className={styles.vslPlaceholder} role="img" aria-label="The Controlled Relay Method workflow"><span>THE CONTROLLED RELAY METHOD™</span><strong>Approved queue → customer preference → dispatcher handoff</strong><p>Human control stays at the final scheduling step.</p></div>}
    </div>
    <p className={styles.vslLine} id="appointrelay-vsl-title">See how an approved record becomes a clean dispatcher handoff.</p>
    <button type="button" className={styles.primaryButton} onClick={onStart}><span>Check Your Workflow Fit<small>Five short steps · no live customer data</small></span><ArrowRight aria-hidden="true" /></button>
  </section>;
}

function AssessmentForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [assessment, setAssessment] = useState(() => ({ ...emptyAssessment, ...readAppointRelayVslLead() }));
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const result = useMemo(() => classify(assessment), [assessment]);
  const update = <K extends keyof Assessment>(key: K, value: Assessment[K]) => setAssessment((current) => ({ ...current, [key]: value }));

  useEffect(() => { if (step === 0) return; trackFunnelEvent("appointrelay", "appointrelay_assessment_step_viewed", { step_number: step + 1, step_name: steps[step].key }); }, [step]);

  async function advance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    trackFunnelEvent("appointrelay", "appointrelay_assessment_step_completed", { step_number: step + 1, step_name: steps[step].key });
    if (step < steps.length - 1) { setStep((value) => value + 1); return; }
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/funnel-lead", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          funnel: "appointrelay", sessionId: getFunnelSessionId("appointrelay"), qualification: result,
          ...assessment, service: assessment.appointmentType, callVolume: assessment.monthlyOpportunities,
          coverage: assessment.backlog, attribution: captureAttribution("appointrelay"),
        }),
      });
      if (!response.ok) throw new Error("Lead handoff failed");
      trackFunnelEvent("appointrelay", "appointrelay_assessment_submitted", { qualification: result, industry: assessment.industry });
      router.push(result === "qualified" ? "/appointrelay/book-call/" : result === "manual-review" ? "/appointrelay/review/" : "/appointrelay/not-a-fit/");
    } catch { setError("We couldn’t save the assessment yet. Please try again."); setSaving(false); }
  }

  return <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className={styles.assessment} id="fit-assessment" role="dialog" aria-modal="true" aria-labelledby="assessment-title">
    <button className={styles.modalClose} type="button" onClick={onClose} aria-label="Close workflow-fit assessment"><X aria-hidden="true" /></button>
    <div className={styles.assessmentIntro}><p className={styles.eyebrow}>WORKFLOW-FIT ASSESSMENT · ABOUT 2 MINUTES</p><h2 id="assessment-title">Let’s see if this queue is ready.</h2><p>I’ll use five short answers to check the volume, control, access, and economics.</p><div className={styles.modalTrust}><span><ShieldCheck aria-hidden="true" /> No obligation</span><span><Check aria-hidden="true" /> No live customer data</span><span>45-day acceptance commitment</span></div></div>
    <div className={styles.formPanel}>
      <div className={styles.progress}><span>0{step + 1} / 0{steps.length}</span><i><b style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></i><span>{steps[step].key}</span></div>
      <form onSubmit={advance}>
        <h3>{steps[step].title}</h3>
        {step === 0 && <div className={styles.fields}><label>Your name<input required autoComplete="name" value={assessment.name} onChange={(event) => update("name", event.target.value)} /></label><label>Work email<input required type="email" autoComplete="email" value={assessment.email} onChange={(event) => update("email", event.target.value)} /></label><label>Mobile phone<input required type="tel" autoComplete="tel" value={assessment.phone} onChange={(event) => update("phone", event.target.value)} /></label><label>Company<input required autoComplete="organization" value={assessment.business} onChange={(event) => update("business", event.target.value)} /></label><label className={styles.wide}>Website<input type="url" placeholder="https://" value={assessment.website} onChange={(event) => update("website", event.target.value)} /></label></div>}
        {step === 1 && <div className={styles.fields}><label>Operation<select required value={assessment.industry} onChange={(event) => update("industry", event.target.value)}><option value="">Select one</option><option>Commercial HVAC service</option><option>Furniture delivery</option><option>Equipment service or rental</option><option>Home or field services</option><option>Other appointment-based operation</option><option>Not sure</option></select></label><label>Appointment type<input required value={assessment.appointmentType} onChange={(event) => update("appointmentType", event.target.value)} placeholder="Maintenance, delivery, inspection…" /></label><label className={styles.wide}>Where is the queue today?<select required value={assessment.backlog} onChange={(event) => update("backlog", event.target.value)}><option value="">Select one</option><option>Unscheduled records or work orders</option><option>Missed and after-hours inbound calls</option><option>Manual outbound scheduling list</option><option>Reschedules and follow-up</option><option>Several of these</option></select></label></div>}
        {step === 2 && <div className={styles.fields}><label>Monthly opportunities<select required value={assessment.monthlyOpportunities} onChange={(event) => update("monthlyOpportunities", event.target.value)}><option value="">Select one</option><option>Under 100</option><option>100–299</option><option>300–599</option><option>600–999</option><option>1,000+</option><option>Not sure</option></select></label><label>Typical completed appointment value<input required value={assessment.averageValue} onChange={(event) => update("averageValue", event.target.value)} placeholder="$ amount or range" /></label></div>}
        {step === 3 && <div className={styles.fields}><label className={styles.wide}>Current CRM, FSM, ERP, or scheduling system<input required value={assessment.currentSystem} onChange={(event) => update("currentSystem", event.target.value)} placeholder="ServiceTitan, Epicor, CSV export, custom system…" /></label><label>Who owns exceptions and final scheduling?<select required value={assessment.schedulingOwner} onChange={(event) => update("schedulingOwner", event.target.value)}><option value="">Select one</option><option>Named dispatcher or manager</option><option>Shared responsibility</option><option>No owner yet</option><option>Not sure</option></select></label><label>Are approved data and system access ready?<select required value={assessment.access} onChange={(event) => update("access", event.target.value)}><option value="">Select one</option><option>Yes</option><option>No</option><option>Not sure</option></select></label></div>}
        {step === 4 && <div className={styles.fields}><label>Desired start<select required value={assessment.timeline} onChange={(event) => update("timeline", event.target.value)}><option value="">Select one</option><option>Within 30 days</option><option>Within 60 days</option><option>Within 90 days</option><option>Researching for later</option></select></label><label className={styles.wide}>What result would make this worth implementing?<textarea required rows={4} value={assessment.goal} onChange={(event) => update("goal", event.target.value)} placeholder="Reduce dispatcher hours, clear a backlog, recover missed calls…" /></label><p className={styles.consent}>By submitting, you agree to be contacted about this assessment. Message frequency varies; message and data rates may apply. Reply STOP to opt out. <Link href="/appointrelay/terms/">Terms</Link> and <Link href="/appointrelay/privacy/">Privacy</Link>.</p></div>}
        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.formActions}>{step > 0 && <button type="button" className={styles.back} onClick={() => setStep((value) => value - 1)}>Back</button>}<button type="submit" className={styles.primaryButton} disabled={saving}>{saving ? "Saving…" : step === steps.length - 1 ? "See my next step" : "Continue"}<ArrowRight aria-hidden="true" /></button></div>
      </form>
    </div>
  </section></div>;
}

export function AppointRelayLandingPage() {
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  useEffect(() => { trackFunnelEvent("appointrelay", "appointrelay_landing_viewed"); }, []);
  useEffect(() => {
    if (!assessmentOpen) return;
    const prior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setAssessmentOpen(false); };
    window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = prior; window.removeEventListener("keydown", close); };
  }, [assessmentOpen]);
  const start = () => { trackFunnelEvent("appointrelay", "appointrelay_assessment_started"); setAssessmentOpen(true); };
  return <main className={styles.shell}>
    <Header />
    <section className={styles.hero}>
      <div className={styles.heroCopy}><p className={styles.eyebrow}>FOR COMMERCIAL HVAC AND OTHER RULE-DRIVEN OPERATIONS</p><h1>I’ll turn one approved appointment queue into a controlled follow-up system within 45 days.</h1><p className={styles.lede}>The Controlled Relay Method™ collects usable customer preferences, records every exception, and hands the final decision back to dispatch.</p><div className={styles.commitmentBadge}><ShieldCheck aria-hidden="true" /><span><strong>My 45-day commitment</strong>All 12 critical implementation checks pass with zero open critical defects, or I keep working without another implementation fee.</span></div><div className={styles.proofLine}><span><Check aria-hidden="true" /> Built through a paid commercial HVAC pilot</span><span><Check aria-hidden="true" /> Your team controls final scheduling</span></div></div>
      <VslSection onStart={start} />
    </section>
    <section className={styles.mechanism}>
      <div className={styles.sectionHeading}><p className={styles.eyebrow}>THE CONTROLLED RELAY METHOD™</p><h2>Your software stores the queue. I build the follow-up layer around it.</h2></div>
      <ol><li><span>01</span><div><strong>Approve the records</strong><p>Define the queue, exclusions, contact rules, and one clean data source.</p></div></li><li><span>02</span><div><strong>Collect a usable answer</strong><p>Run phone-first outreach, capture the first valid preference, and document every exception.</p></div></li><li><span>03</span><div><strong>Return control to dispatch</strong><p>Hand over a clean scheduling request. Your team makes the final appointment.</p></div></li></ol>
      <div className={styles.methodBadge}><ShieldCheck aria-hidden="true" /><span><strong>12 critical checks. Zero open critical defects.</strong> One workflow. One approved data source. Human control at the final step.</span></div>
    </section>
    <section className={styles.scopeGrid}><div><p className={styles.eyebrow}>WHAT I BUILD</p><h2>One focused operating system. Not another software replacement.</h2><ul>{["Workflow and field mapping", "Phone-first scripts and retry rules", "Data checks and duplicate handling", "Exception routing and status history", "Acceptance testing and staff training", "Managed monitoring after activation"].map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul></div><div className={styles.boundaryCard}><p className={styles.eyebrow}>WHAT STAYS WITH YOUR TEAM</p><h3>Dispatch keeps the decisions that require judgment.</h3><ul>{["Technician and capacity choices", "Diagnosis and pricing", "Unclear customer requests", "The final appointment in your system"].map((item) => <li key={item}>{item}</li>)}</ul><p>Deeper integrations and added workflows are scoped separately.</p></div></section>
    <section className={styles.faq}><div><p className={styles.eyebrow}>BEFORE YOU APPLY</p><h2>Straight answers to the expensive questions.</h2></div><div>{[
      ["What is the Controlled Relay Method™?", "It is the three-part operating model behind AppointRelay: approve the queue, collect a usable customer preference, and return a documented request to the person who controls final scheduling."],
      ["Does this replace our dispatcher?", "No. AppointRelay™ removes repetitive contact and documentation work. Dispatch retains final scheduling, routing, and exception authority."],
      ["Do we need to replace our CRM or field-service software?", "No. The initial implementation works from one approved export, staging table, or scoped data connection. Deeper integrations are quoted separately."],
      ["Is this only for HVAC?", "Commercial HVAC is the primary launch market because the pilot and operating pattern are strongest there. Furniture delivery and other rule-driven appointment queues can qualify when the economics and workflow fit."],
      ["What does acceptance-ready mean?", "All 12 critical checks must pass: mapping, grouping, approval gates, contact rules, conflict protection, dispatcher handoff, human final control, master stop, suppression, webhook safety, audit reconciliation, and dispatcher operation. The test requires zero open critical defects."],
      ["Do you guarantee booked revenue?", "No. Contact rates, customer availability, dispatch decisions, and completed work are outside one system’s control. The commitment covers the numbered implementation checks, not business outcomes."],
    ].map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown aria-hidden="true" /></summary><p>{answer}</p></details>)}</div></section>
    <section className={styles.finalCta}><p className={styles.eyebrow}>YOUR MOVE</p><h2>If the queue is real, I’ll tell you whether the workflow is worth building.</h2><button type="button" className={styles.lightButton} onClick={start}><span>Check Your Workflow Fit<small>Five short steps · no live customer data</small></span><ArrowRight aria-hidden="true" /></button></section>
    <Footer />
    {assessmentOpen ? <AssessmentForm onClose={() => setAssessmentOpen(false)} /> : null}
  </main>;
}

function ResultPage({ review = false }: { review?: boolean }) {
  useEffect(() => { trackFunnelEvent("appointrelay", review ? "appointrelay_review_viewed" : "appointrelay_disqualified_viewed"); }, [review]);
  return <main className={styles.shell}><Header /><section className={styles.result}><span>{review ? "REVIEW" : "NOT YET"}</span><h1>{review ? "Your workflow needs a human fit review." : "AppointRelay™ is probably early for this queue."}</h1><p>{review ? "I have your answers. I’ll review the appointment type, volume, current system, and handoff requirements before recommending a call or a simpler next step." : "The system makes sense when there is enough repeatable appointment work, approved system access, and a person who owns final scheduling. Starting before those pieces exist would add software before it reduces the work."}</p><div><Link href="/appointrelay/queue-audit/">Use the free queue audit</Link><Link href="/appointrelay/">Review AppointRelay</Link><a href="mailto:help@daytongrowth.co">Ask a question</a></div></section><Footer /></main>;
}

export function AppointRelayReviewPage() { return <ResultPage review />; }
export function AppointRelayNotFitPage() { return <ResultPage />; }

export function AppointRelayContactPage() {
  useEffect(() => { trackFunnelEvent("appointrelay", "appointrelay_contact_viewed"); }, []);
  return <main className={styles.shell}><Header /><section className={styles.result}><span>CONTACT</span><h1>Ask a specific AppointRelay™ question.</h1><p>Email is best for workflow, data-source, security, and implementation questions. Call during normal Eastern business hours when the issue is time-sensitive.</p><div><a href="mailto:help@daytongrowth.co">help@daytongrowth.co</a><a href="tel:+19373690829">(937) 369-0829</a></div></section><Footer /></main>;
}

export function AppointRelayQueueAuditPage() {
  return <main className={styles.shell}><Header /><article className={styles.guide}><p className={styles.eyebrow}>FREE APPOINTMENT-QUEUE AUDIT</p><h1>Find out whether the queue is ready before you automate it.</h1><p>Use one recent month. Do not upload customer data. You only need totals and process notes.</p><ol><li><strong>Count the queue.</strong><span>How many approved records needed a call, callback, reschedule, or preference?</span></li><li><strong>Count the touches.</strong><span>How many calls, voicemails, emails, and manual follow-ups did the team make?</span></li><li><strong>List the exceptions.</strong><span>Wrong numbers, opt-outs, linked work orders, special requests, and anything dispatch had to decide.</span></li><li><strong>Measure the handoff.</strong><span>How many records ended with a usable customer preference and a clear owner?</span></li><li><strong>Check the economics.</strong><span>Compare monthly staff time and completed-appointment value with the cost of a managed workflow.</span></li></ol><div><Link href="/appointrelay/">Return to AppointRelay</Link><a href="mailto:help@daytongrowth.co?subject=Appointment%20queue%20audit">Ask about your audit</a></div></article><Footer /></main>;
}

export function AppointRelayLegalPage({ type }: { type: "terms" | "privacy" }) {
  const terms = type === "terms";
  return <main className={styles.shell}><Header /><article className={styles.legalPage}><p className={styles.eyebrow}>DAYTONGROWTHCO. LLC · APPOINTRELAY™</p><h1>{terms ? "AppointRelay terms" : "AppointRelay privacy"}</h1><p className={styles.updated}>Last updated: August 19, 2026</p>{terms ? <div className={styles.legalCopy}><h2>Service scope</h2><p>AppointRelay is a productized implementation and managed-operation service for approved appointment queues. A signed statement of work controls the specific workflow, data source, acceptance tests, implementation fee, managed fee, usage charges, and client responsibilities.</p><h2>Human-controlled scheduling</h2><p>AppointRelay may contact approved customers, collect scheduling preferences, record responses, and route exceptions. Unless a signed scope says otherwise, it does not choose technicians, change capacity, diagnose equipment, quote prices, promise arrival times, or finalize unclear appointments. The client controls final scheduling.</p><h2>45-day acceptance commitment</h2><p>The commitment begins after the required data, access, communication approvals, compliance decisions, test contacts, and timely feedback are supplied. The signed scorecard uses 12 critical checks with numerical pass conditions and requires zero open critical defects. If DaytonGrowthCo misses that acceptance milestone within 45 calendar days for a reason it controls, the final implementation payment is not due and work continues without another professional-service charge until the milestone is delivered. The client may end the project and receive any unearned prepaid implementation balance.</p><h2>No outcome guarantee</h2><p>The commitment does not guarantee customer answer rates, customer availability, booked volume, completed appointments, completed work, or revenue. Third-party voice, telephony, email, hosting, and vendor usage may be billed separately as stated in the written scope.</p><h2>Authorized data and communications</h2><p>The client must provide a lawful, approved source of customer records and accurate instructions for calling hours, consent, opt-outs, retries, escalation, and retention. Do not submit live customer data through the public workflow-fit assessment.</p><h2>Contact</h2><p>Questions may be sent to <a href="mailto:help@daytongrowth.co">help@daytongrowth.co</a> or <a href="tel:+19373690829">(937) 369-0829</a>. A signed project agreement controls if it conflicts with these public terms.</p></div> : <div className={styles.legalCopy}><h2>Information collected</h2><p>The public assessment may collect your name, business contact information, company, website, industry, appointment type, approximate queue volume, completed-appointment value, current system, access readiness, scheduling ownership, timeline, goals, attribution, and session information. Do not submit customer records, patient information, payment-card data, passwords, or other sensitive operational data through the public assessment.</p><h2>How it is used</h2><p>We use the information to evaluate workflow fit, respond to your request, prepare for a call, improve the funnel, maintain business records, prevent abuse, and comply with law. If you become a client, a separate agreement and security plan will govern implementation data.</p><h2>Service providers</h2><p>We may use hosting, CRM, analytics, email, telephony, and scheduling providers to operate the assessment and respond. We do not sell personal information or share mobile opt-in consent with third parties or affiliates for their marketing.</p><h2>Communications</h2><p>By submitting the assessment, you agree to receive communications about your request. Message frequency varies. Message and data rates may apply. Reply STOP to eligible text messages to opt out or HELP for help. Marketing consent is not a condition of purchase.</p><h2>Security, retention, and choices</h2><p>We use reasonable safeguards, but no system is completely secure. We keep records as reasonably needed for sales follow-up, service delivery, accounting, dispute resolution, security, and legal obligations. To request access, correction, or deletion where applicable, email <a href="mailto:help@daytongrowth.co?subject=Privacy%20request">help@daytongrowth.co</a>.</p></div>}</article><Footer /></main>;
}
