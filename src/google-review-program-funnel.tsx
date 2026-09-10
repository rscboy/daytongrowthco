"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, Mail, MessageSquareText, PhoneCall, ShieldCheck, X } from "lucide-react";
import { BrandWordmark } from "@/src/brand-wordmark";
import { AppointRelayVslPlayer, readGoogleReviewProgramVslLead } from "@/src/appointrelay-vsl-player";
import { captureAttribution, getFunnelSessionId, trackFunnelEvent } from "@/src/funnel-analytics";
import styles from "./appointrelay-funnel.module.css";

type Assessment = {
  name: string;
  email: string;
  phone: string;
  business: string;
  website: string;
  industry: string;
  monthlyCompletions: string;
  googleProfile: string;
  currentSystem: string;
  nativeReviewAutomation: string;
  completionSource: string;
  messagingPermission: string;
  smsConsent: string;
  decisionAuthority: string;
  timeline: string;
  goal: string;
};

const emptyAssessment: Assessment = {
  name: "", email: "", phone: "", business: "", website: "", industry: "",
  monthlyCompletions: "", googleProfile: "", currentSystem: "", nativeReviewAutomation: "", completionSource: "",
  messagingPermission: "", smsConsent: "", decisionAuthority: "", timeline: "", goal: "",
};

const steps = [
  { key: "contact", title: "Who should I build the review system around?" },
  { key: "volume", title: "Is there enough completed work for the program?" },
  { key: "stack", title: "Can we identify a completed HVAC service call reliably?" },
  { key: "readiness", title: "Is the business ready to launch responsibly?" },
] as const;

function classify(a: Assessment): "qualified" | "manual-review" | "disqualified" {
  if (a.googleProfile === "No" || a.messagingPermission === "No" || a.decisionAuthority === "No" || a.completionSource === "No reliable completion record" || a.industry === "HVAC installation or new construction only" || a.nativeReviewAutomation === "Yes, and we are satisfied with it") return "disqualified";
  if (a.timeline === "Researching for later" || a.monthlyCompletions === "Under 100" || [a.googleProfile, a.monthlyCompletions, a.completionSource, a.messagingPermission, a.nativeReviewAutomation].includes("Not sure")) return "manual-review";
  if (a.industry !== "Residential HVAC service and repair") return "manual-review";
  return "qualified";
}

function Header() {
  return <header className={styles.header}>
    <Link href="/google-reviews/" aria-label="Google Review Program home"><BrandWordmark /></Link>
    <div className={styles.productMark}><span>HVAC Google Review Growth Program™</span></div>
    <a href="tel:+19373690829"><PhoneCall aria-hidden="true" /> <span>(937) 369-0829</span></a>
  </header>;
}

function Footer() {
  return <footer className={styles.footer}>
    <div><BrandWordmark onDark /><p>The fully managed Google review growth program for residential HVAC companies.</p></div>
    <nav aria-label="Google Review Program legal and contact links"><Link href="/google-reviews/contact/">Contact</Link><Link href="/google-reviews/terms/">Terms</Link><Link href="/google-reviews/privacy/">Privacy</Link></nav>
  </footer>;
}

function WorkflowPreview({ onStart }: { onStart: () => void }) {
  const videoSource = process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_VSL_URL;
  const captionSource = process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_VSL_CAPTIONS_URL;
  const configuredGate = Number(process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_VSL_GATE_SECONDS || "60");
  const gateAt = Number.isFinite(configuredGate) && configuredGate > 0 ? configuredGate : 60;
  return <section className={styles.vsl} aria-labelledby="review-workflow-title">
    <p className={styles.watchBar}>{videoSource ? "STEP 1 · WATCH" : "30-SECOND OVERVIEW"} · THE HVAC GOOGLE REVIEW GROWTH PROGRAM™</p>
    {videoSource ? <div className={styles.vslFrame}><AppointRelayVslPlayer src={videoSource} captions={captionSource} gateAt={gateAt} mode="google-review-program" /></div> : <div className={styles.workflowGraphic}>
      <div className={styles.graphicTop}><span>CLIENT WORKFLOW</span><span className={styles.live}><i /> RUNNING</span></div>
      <div className={styles.queueRow}><span className={styles.initial}>01</span><div><strong>Service call marked complete</strong><small>Approved dispatch, CRM, or invoicing event</small></div><em>detected</em></div>
      <div className={styles.queueRow}><span className={styles.initial}>02</span><div><strong>Eligibility checked</strong><small>Duplicates, opt-outs, and exclusions suppressed</small></div><em className={styles.ready}>clear</em></div>
      <div className={styles.queueRow}><span className={styles.initial}>03</span><div><strong>Personalized request sent</strong><small>Registered SMS number + authenticated email</small></div><em className={styles.ready}>sent</em></div>
      <div className={styles.relayLine}><MessageSquareText aria-hidden="true" /><i /><Mail aria-hidden="true" /></div>
      <div className={styles.graphicFooter}><span><Check aria-hidden="true" /> Direct Google review link</span><span><ShieldCheck aria-hidden="true" /> Portal monitored by DaytonGrowthCo</span></div>
    </div>}
    <p className={styles.vslLine} id="review-workflow-title">Your technician finishes the service call. The managed system handles the review request and shows you what happened.</p>
    <div className={styles.ctaStack}>
      <button type="button" className={styles.primaryButton} onClick={onStart}><span>Check Your Program Fit<small>Four short steps · no customer data</small></span><ArrowRight aria-hidden="true" /></button>
      <Link className={styles.secondaryButton} href="/google-reviews/book-call/"><span>Schedule a Demo<small>Choose a time that works for you</small></span><ArrowRight aria-hidden="true" /></Link>
    </div>
  </section>;
}

function AssessmentForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [assessment, setAssessment] = useState(() => ({ ...emptyAssessment, ...readGoogleReviewProgramVslLead() }));
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const result = useMemo(() => classify(assessment), [assessment]);
  const update = <K extends keyof Assessment>(key: K, value: Assessment[K]) => setAssessment((current) => ({ ...current, [key]: value }));

  useEffect(() => { if (step === 0) return; trackFunnelEvent("google-review-program", "google_review_assessment_step_viewed", { step_number: step + 1, step_name: steps[step].key }); }, [step]);

  async function advance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    trackFunnelEvent("google-review-program", "google_review_assessment_step_completed", { step_number: step + 1, step_name: steps[step].key });
    if (step < steps.length - 1) { setStep((value) => value + 1); return; }
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/funnel-lead", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          funnel: "google-review-program", sessionId: getFunnelSessionId("google-review-program"), qualification: result,
          ...assessment, source: "HVAC Google Review Growth Program fit assessment", attribution: captureAttribution("google_review_program"),
        }),
      });
      if (!response.ok) throw new Error("Lead handoff failed");
      trackFunnelEvent("google-review-program", "google_review_assessment_submitted", { qualification: result, industry: assessment.industry });
      router.push(result === "qualified" ? "/google-reviews/book-call/" : result === "manual-review" ? "/google-reviews/review/" : "/google-reviews/not-a-fit/");
    } catch { setError("We couldn’t save the assessment yet. Please try again."); setSaving(false); }
  }

  return <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className={styles.assessment} role="dialog" aria-modal="true" aria-labelledby="review-assessment-title">
    <button className={styles.modalClose} type="button" onClick={onClose} aria-label="Close program-fit assessment"><X aria-hidden="true" /></button>
    <div className={styles.assessmentIntro}><p className={styles.eyebrow}>HVAC PROGRAM-FIT ASSESSMENT · ABOUT 2 MINUTES</p><h2 id="review-assessment-title">Let’s see if this is ready to install.</h2><p>I’ll check paid service-call volume, the source system, current review automation, Google profile readiness, and the compliance basics.</p><div className={styles.modalTrust}><span><ShieldCheck aria-hidden="true" /> No obligation</span><span><Check aria-hidden="true" /> No customer data</span><span>Standard program: $2,500/year + usage</span></div><div className={styles.priceMini}><strong>$2,500/year</strong><span>managed system and service</span><small>Actual SMS, email, number, carrier, and registration costs are billed separately.</small></div></div>
    <div className={styles.formPanel}><div className={styles.progress}><span>0{step + 1} / 0{steps.length}</span><i><b style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></i><span>{steps[step].key}</span></div><form onSubmit={advance}>
      <h3>{steps[step].title}</h3>
      {step === 0 && <div className={styles.fields}><label>Your name<input required autoComplete="name" value={assessment.name} onChange={(event) => update("name", event.target.value)} /></label><label>Work email<input required type="email" autoComplete="email" value={assessment.email} onChange={(event) => update("email", event.target.value)} /></label><label>Mobile phone<input required type="tel" autoComplete="tel" value={assessment.phone} onChange={(event) => update("phone", event.target.value)} /></label><label>Company<input required autoComplete="organization" value={assessment.business} onChange={(event) => update("business", event.target.value)} /></label><label className={styles.wide}>Website<input type="url" placeholder="https://" value={assessment.website} onChange={(event) => update("website", event.target.value)} /></label></div>}
      {step === 1 && <div className={styles.fields}><label>Business type<select required value={assessment.industry} onChange={(event) => update("industry", event.target.value)}><option value="">Select one</option><option>Residential HVAC service and repair</option><option>Residential and commercial HVAC service</option><option>Commercial HVAC service</option><option>HVAC installation or new construction only</option><option>Another local-service category</option></select></label><label>Eligible residential jobs per month<select required value={assessment.monthlyCompletions} onChange={(event) => update("monthlyCompletions", event.target.value)}><option value="">Select one</option><option>Under 100</option><option>100–199</option><option>200–399</option><option>400–599</option><option>600+</option><option>Not sure</option></select></label><label className={styles.wide}>Verified Google Business Profile?<select required value={assessment.googleProfile} onChange={(event) => update("googleProfile", event.target.value)}><option value="">Select one</option><option>Yes</option><option>No</option><option>Not sure</option></select></label></div>}
      {step === 2 && <div className={styles.fields}><label className={styles.wide}>Dispatch, CRM, or scheduling system<input required value={assessment.currentSystem} onChange={(event) => update("currentSystem", event.target.value)} placeholder="ServiceTitan, Housecall Pro, Jobber, FieldEdge, custom CRM…" /></label><label className={styles.wide}>Does it already send review requests automatically?<select required value={assessment.nativeReviewAutomation} onChange={(event) => update("nativeReviewAutomation", event.target.value)}><option value="">Select one</option><option>No, it still depends on staff</option><option>Yes, but it is inactive or unreliable</option><option>Yes, but we want it fully managed</option><option>Yes, and we are satisfied with it</option><option>Not sure</option></select></label><label className={styles.wide}>How is a paid service call recorded as finished?<select required value={assessment.completionSource} onChange={(event) => update("completionSource", event.target.value)}><option value="">Select one</option><option>Completed or closed status with API or integration</option><option>Paid invoice with API or integration</option><option>Completion status with scheduled export</option><option>Structured spreadsheet or report</option><option>No reliable completion record</option><option>Not sure</option></select></label></div>}
      {step === 3 && <div className={styles.fields}><label>Can you document customer messaging permission?<select required value={assessment.messagingPermission} onChange={(event) => update("messagingPermission", event.target.value)}><option value="">Select one</option><option>Yes</option><option>No</option><option>Not sure</option></select></label><label>Can you approve access, DNS, and templates?<select required value={assessment.decisionAuthority} onChange={(event) => update("decisionAuthority", event.target.value)}><option value="">Select one</option><option>Yes</option><option>No</option></select></label><label>Desired start<select required value={assessment.timeline} onChange={(event) => update("timeline", event.target.value)}><option value="">Select one</option><option>Within 30 days</option><option>Within 60 days</option><option>Within 90 days</option><option>Researching for later</option></select></label><label>How may DaytonGrowthCo follow up?<select required value={assessment.smsConsent} onChange={(event) => update("smsConsent", event.target.value)}><option value="">Select one</option><option value="No">Email only, no text-message consent</option><option value="Yes">Email and text, I agree to SMS follow-up</option></select></label><label className={styles.wide}>What would make this program worthwhile?<textarea required rows={4} value={assessment.goal} onChange={(event) => update("goal", event.target.value)} placeholder="Make review requests consistent, reduce staff follow-up, improve visibility…" /></label><p className={styles.consent}>By submitting, you agree to be contacted by email about this assessment. If you choose email and text, you also agree to SMS about this request and any booked call. Message frequency varies; message and data rates may apply. Reply STOP to opt out or HELP for help. SMS consent is not a condition of purchase. Do not submit customer records here. <Link href="/google-reviews/terms/">Terms</Link> and <Link href="/google-reviews/privacy/">Privacy</Link>.</p></div>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.formActions}>{step > 0 && <button type="button" className={styles.back} onClick={() => setStep((value) => value - 1)}>Back</button>}<button type="submit" className={styles.primaryButton} disabled={saving}>{saving ? "Saving…" : step === steps.length - 1 ? "See my next step" : "Continue"}<ArrowRight aria-hidden="true" /></button></div>
    </form></div>
  </section></div>;
}

export function GoogleReviewProgramLandingPage() {
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  useEffect(() => { trackFunnelEvent("google-review-program", "google_review_landing_viewed"); }, []);
  useEffect(() => {
    if (!assessmentOpen) return;
    const prior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setAssessmentOpen(false); };
    window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = prior; window.removeEventListener("keydown", close); };
  }, [assessmentOpen]);
  const start = () => { trackFunnelEvent("google-review-program", "google_review_assessment_started"); setAssessmentOpen(true); };

  return <main className={styles.shell}><Header />
    <section className={styles.hero}><div className={styles.heroCopy}><p className={styles.eyebrow}>THE HVAC GOOGLE REVIEW GROWTH PROGRAM™</p><h1>20 new Google reviews within 30 days. Or your $2,500 program fee back.</h1><p className={styles.lede}>We connect to the dispatch system or CRM you already use and automatically request an honest Google review after each eligible completed job, without your technicians or office staff having to remember.</p><button type="button" className={`${styles.primaryButton} ${styles.heroMobileCta}`} onClick={start}><span>Check Your Program Fit<small>Four short steps · no customer data</small></span><ArrowRight aria-hidden="true" /></button><div className={styles.commitmentBadge}><ShieldCheck aria-hidden="true" /><span><strong>Performance guarantee for qualifying HVAC companies</strong>Eligibility is confirmed before enrollment. Companies that do not qualify for the review-count guarantee can still use the same managed program with a system-launch guarantee.</span></div><div className={styles.proofLine}><span><Check aria-hidden="true" /> $2,500/year + actual usage</span><span><Check aria-hidden="true" /> Fully installed and managed for you</span></div></div><WorkflowPreview onStart={start} /></section>
    <section className={styles.mechanism}><div className={styles.sectionHeading}><p className={styles.eyebrow}>HOW THE PROGRAM WORKS</p><h2>Your technician closes the service call. The review request stops depending on memory.</h2></div><ol><li><span>01</span><div><strong>Detect the approved completion</strong><p>Connect one reliable paid-service completion event from your dispatch system, CRM, scheduler, API, webhook, or structured export.</p></div></li><li><span>02</span><div><strong>Protect the customer and the business</strong><p>Apply the approved delay, quiet hours, duplicate prevention, exclusions, opt-outs, and frequency rules before anything sends.</p></div></li><li><span>03</span><div><strong>Ask for an honest Google review</strong><p>Send a personalized SMS and email from registered, branded infrastructure with the business’s direct Google review link.</p></div></li><li><span>04</span><div><strong>Monitor the system</strong><p>Show delivery, failures, suppressions, opt-outs, integration status, and system health in the client portal while DaytonGrowthCo maintains the underlying workflow.</p></div></li></ol><div className={styles.methodBadge}><ShieldCheck aria-hidden="true" /><span><strong>Honest requests sent by a consistent rule.</strong> Every customer who meets the approved rule is treated the same. No review gating, incentives, five-star asks, or purchased or fabricated reviews.</span></div></section>
    <section className={styles.scopeGrid}><div><p className={styles.eyebrow}>WHAT THE ANNUAL PROGRAM INCLUDES</p><h2>Installed infrastructure, not another login your team has to run.</h2><ul>{["One completion-source connection", "Customer and field mapping", "Local SMS number when available", "A2P 10DLC registration support", "Branded email sending subdomain", "SMS and email request sequence", "Duplicate and opt-out protection", "Secure client portal", "Testing and 12-check acceptance", "Ongoing monitoring and maintenance"].map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul></div><div className={styles.boundaryCard}><p className={styles.eyebrow}>ONE STANDARD INSTALLATION</p><h3>One entity. One location. One profile. One completion workflow.</h3><ul>{["Additional locations or Google profiles", "Additional CRMs or completion sources", "Custom workflows, brands, or languages", "Review-response management"].map((item) => <li key={item}>{item}</li>)}</ul><p>Those items can be scoped separately after the standard system is working.</p></div></section>
    <section className={styles.investment}><div><p className={styles.eyebrow}>SIMPLE ANNUAL PRICE</p><h2>The system costs less than asking an employee to remember forever.</h2><p>You are paying for the installation, registered and authenticated sending infrastructure, portal, monitoring, maintenance, and an accountable operator who runs the system for you.</p></div><div className={styles.price}><span>THE HVAC GOOGLE REVIEW GROWTH PROGRAM™</span><strong>$2,500 <small>/ year</small></strong><p>Paid annually for the managed system and service.</p><hr /><strong className={styles.usagePrice}>Usage at cost</strong><p>Actual SMS, email, phone-number, carrier, and registration charges are billed separately so usage stays transparent.</p><div className={styles.guarantee}><ShieldCheck aria-hidden="true" /><p><strong>Your guarantee is confirmed before you enroll.</strong> Qualifying companies receive 20 new Google reviews within 30 days of launch or the $2,500 program fee is refunded. Other companies receive the documented 12-point system-launch guarantee.</p></div></div></section>
    <section className={styles.qualification}><div><p className={styles.eyebrow}>WHO THIS IS FOR</p><h2>A strong HVAC fit has steady service volume and one clean operational finish line.</h2></div><ul>{["Established U.S. residential HVAC service company", "Active, verified, unrestricted Google Business Profile", "Completed-job history available for a guarantee check", "Dispatch system or CRM records a reliable closed or paid event", "Valid customer phone or email records", "Documented permission for customer messaging", "Willing to ask every eligible customer neutrally", "Able to approve system access, DNS, and templates"].map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul></section>
    <section className={styles.faq}><div><p className={styles.eyebrow}>STRAIGHT ANSWERS</p><h2>What the program does and what it does not promise.</h2></div><div>{[
      ["What is The HVAC Google Review Growth Program™?", "It is a fully managed review-generation service for HVAC companies. DaytonGrowthCo connects to an approved completed-job event, handles the SMS and email infrastructure, sends honest review requests, prevents duplicate or ineligible outreach, and monitors the system through the client portal."],
      ["Does this replace our CRM or scheduling software?", "No. The program connects to one approved completion source and adds a managed review-request layer around it."],
      ["What if ServiceTitan, Housecall Pro, or Jobber already offers reviews?", "If its built-in review request is active, reliable, monitored, and your team is satisfied, you probably do not need this program. It is for HVAC companies where that feature is unavailable, inactive, poorly configured, unreliable, or still leaves the operating burden on staff."],
      ["Will we get a local texting number?", "A dedicated local 10DLC number matching the business area code is provisioned when inventory permits. A suitable alternative may be used when local inventory or registration constraints require it."],
      ["How does the 20-review guarantee work?", "If your previous 90 days of data confirms at least 100 eligible residential jobs per month and your Google Business Profile is active, verified, and unrestricted, the 30-day period begins after production activation. If fewer than 20 legitimate reviews are published during that period, DaytonGrowthCo refunds the $2,500 program fee. Third-party usage and registration charges are not included in the refund."],
      ["What if we complete fewer than 100 eligible jobs per month?", "You can still purchase the same $2,500 annual program. Instead of the review-count guarantee, you receive the documented 12-point system-launch guarantee because lower customer volume cannot support the same projection."],
      ["Do you only ask happy customers?", "No. The workflow uses a neutral, pre-approved completion rule and asks every eligible customer for an honest review. It does not use a sentiment gate to route only happy customers to Google."],
      ["What happens when a customer opts out?", "The system records SMS STOP replies and email unsubscribes, suppresses future requests on that channel, and makes the event visible in the activity history."],
      ["What is not included in the $2,500 annual fee?", "Actual SMS, email, phone-number, carrier, registration, and related third-party usage charges are separate. Additional locations, profiles, source systems, workflows, or custom logic also require a separate scope."],
    ].map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown aria-hidden="true" /></summary><p>{answer}</p></details>)}</div></section>
    <section className={styles.finalCta}><p className={styles.eyebrow}>YOUR NEXT STEP</p><h2>If your dispatch system knows when a paid service call is finished, let’s see whether the program fits.</h2><div className={styles.finalActions}><button type="button" className={styles.lightButton} onClick={start}><span>Check Your Program Fit<small>Four short steps · standard price shown upfront</small></span><ArrowRight aria-hidden="true" /></button><Link className={styles.outlineLightButton} href="/google-reviews/book-call/"><span>Schedule a Demo<small>Choose a time that works for you</small></span><ArrowRight aria-hidden="true" /></Link></div></section>
    <Footer />{assessmentOpen ? <AssessmentForm onClose={() => setAssessmentOpen(false)} /> : null}
  </main>;
}

function ResultPage({ review = false }: { review?: boolean }) {
  useEffect(() => { trackFunnelEvent("google-review-program", review ? "google_review_manual_review_viewed" : "google_review_disqualified_viewed"); }, [review]);
  return <main className={styles.shell}><Header /><section className={styles.result}><span>{review ? "HUMAN REVIEW" : "NOT YET"}</span><h1>{review ? "Your answers need a quick human fit review." : "The managed program is probably early for this business."}</h1><p>{review ? "I have your answers. I’ll review the completed-customer volume, source system, Google profile, messaging readiness, and timing before recommending a call or a simpler next step." : "The program needs a verified Google profile, a reliable completion event, lawful customer messaging permission, and an owner who can approve access and setup. Installing it before those pieces exist would add infrastructure before it removes work."}</p><div><Link href="/google-reviews/">Review the program</Link><a href="mailto:help@daytongrowth.co?subject=Google%20Review%20Program%20question">Ask a question</a></div></section><Footer /></main>;
}

export function GoogleReviewProgramReviewPage() { return <ResultPage review />; }
export function GoogleReviewProgramNotFitPage() { return <ResultPage />; }

export function GoogleReviewProgramContactPage() {
  useEffect(() => { trackFunnelEvent("google-review-program", "google_review_contact_viewed"); }, []);
  return <main className={styles.shell}><Header /><section className={styles.result}><span>CONTACT</span><h1>Ask a specific HVAC Google Review Growth Program™ question.</h1><p>Email is best for CRM compatibility, messaging registration, DNS, compliance, scope, and onboarding questions. Call during normal Eastern business hours when the issue is time-sensitive.</p><div><a href="mailto:help@daytongrowth.co">help@daytongrowth.co</a><a href="tel:+19373690829">(937) 369-0829</a></div></section><Footer /></main>;
}

export function GoogleReviewProgramLegalPage({ type }: { type: "terms" | "privacy" }) {
  const terms = type === "terms";
  return <main className={styles.shell}><Header /><article className={styles.legalPage}>
    <p className={styles.eyebrow}>DAYTONGROWTHCO. LLC · THE HVAC GOOGLE REVIEW GROWTH PROGRAM™</p>
    <h1>{terms ? "Program terms" : "Program privacy"}</h1><p className={styles.updated}>Last updated: August 24, 2026</p>
    {terms ? <div className={styles.legalCopy}>
      <h2>Service scope</h2><p>The HVAC Google Review Growth Program™ is a productized implementation and managed-operation service for one approved completed-customer workflow. A signed statement of work controls the specific entity, location, Google profile, source system, completion rule, channels, acceptance tests, annual fee, usage charges, and client responsibilities.</p>
      <h2>Price and third-party usage</h2><p>The standard annual program fee is $2,500 paid upfront. Actual SMS, email, phone-number, carrier, A2P registration, and related third-party usage charges are separate. Additional locations, profiles, source systems, workflows, brands, languages, or custom logic require a written change order.</p>
      <h2>Performance-guarantee qualification</h2><p>The 20-new-reviews-in-30-days guarantee is available only when the previous 90 days of actual data confirms at least 100 eligible residential jobs per month with valid customer contact information and the client has an active, verified, unrestricted Google Business Profile. The 30-day period begins only after the program is fully activated in production; integration, DNS, registration, approval, and testing time is excluded.</p>
      <h2>Performance-guarantee refund</h2><p>If a qualified company receives fewer than 20 new legitimate, published Google reviews during the 30-day performance period, DaytonGrowthCo refunds the annual program fee paid to DaytonGrowthCo. The refund does not include SMS, email, phone-number, carrier, registration, or other third-party charges.</p>
      <h2>System-launch guarantee</h2><p>Companies below the performance-guarantee volume may still purchase the same program. Their installed program must pass the documented 12-point launch test with zero critical defects within the agreed implementation period. If DaytonGrowthCo fails to deliver that working system for a reason it controls, the program fee is refunded according to the signed agreement.</p>
      <h2>Other outcomes</h2><p>The program does not guarantee a rating, ranking, review-removal decision, lead volume, revenue, or any other customer or platform outcome. Google and each customer control their own decisions.</p>
      <h2>Neutral solicitation and client responsibilities</h2><p>The client must supply a lawful, approved customer source and accurate instructions for consent, quiet hours, eligibility, exclusions, opt-outs, retention, and review destinations. The client agrees not to use the system for review gating, incentives, selective positive-review solicitation, or five-star requests. DaytonGrowthCo configures and documents the system but does not provide legal advice.</p>
      <h2>Contact</h2><p>Questions may be sent to <a href="mailto:help@daytongrowth.co">help@daytongrowth.co</a> or <a href="tel:+19373690829">(937) 369-0829</a>. A signed project agreement controls if it conflicts with these public terms.</p>
    </div> : <div className={styles.legalCopy}>
      <h2>Information collected</h2><p>The public assessment may collect your name, business contact information, company, website, industry, approximate completed-customer volume, Google profile readiness, current system, completion-source type, messaging-permission status, decision authority, timeline, goals, attribution, and session information. Do not submit customer records, patient information, payment-card data, passwords, or other sensitive data through the public assessment.</p>
      <h2>How it is used</h2><p>We use the information to evaluate program fit, respond to your request, prepare for a call, improve the funnel, maintain business records, prevent abuse, and comply with law. If you become a client, a separate agreement and implementation security plan will govern customer and system data.</p>
      <h2>Service providers</h2><p>We may use hosting, CRM, analytics, email, telephony, scheduling, and infrastructure providers to operate the assessment and respond. We do not sell personal information or share mobile opt-in consent with third parties or affiliates for their marketing.</p>
      <h2>Communications</h2><p>By submitting the assessment, you agree to receive communications about your request. Message frequency varies. Message and data rates may apply. Reply STOP to eligible text messages to opt out or HELP for help. Marketing consent is not a condition of purchase.</p>
      <h2>Security, retention, and choices</h2><p>We use reasonable safeguards, but no system is completely secure. We keep records as reasonably needed for sales follow-up, service delivery, accounting, dispute resolution, security, and legal obligations. To request access, correction, or deletion where applicable, email <a href="mailto:help@daytongrowth.co?subject=Privacy%20request">help@daytongrowth.co</a>.</p>
    </div>}
  </article><Footer /></main>;
}
