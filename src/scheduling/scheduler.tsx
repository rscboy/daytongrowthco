"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Mail, Video } from "lucide-react";
import { calendarFile, dateLabel, dayKey, isService, qualify, serviceContent, services, timeLabel, validTimezone, type BookingField, type BookingResult, type Meeting, type Receipt, type Scenario, type ServiceId } from "./catalog";
import { emptyContact, readSchedulerDraft, schedulerAttemptKey, schedulerDraftKey, type ContactDraft } from "./draft";
import { captureAttribution } from "../funnel-analytics";
import { readMigrationDraft, migrationDraftKey } from "../migration-assessment";
import { schedulerAnalytics } from "./analytics";
import styles from "./scheduler.module.css";

type Stage = "problem" | "fit" | "time" | "details" | "receipt";
type ApiResponse = { meeting?: Meeting; slots?: string[]; mode?: "live" | "preview"; message?: string; code?: string } & Partial<BookingResult>;
async function api(body: Record<string, unknown>, signal?: AbortSignal): Promise<ApiResponse> {
  const response = await fetch("/api/scheduler", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal, cache: "no-store" });
  const data: ApiResponse = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.message || "We couldn’t reach the calendar."), { code: data.code });
  return data;
}
const message = (error: unknown) => error instanceof Error ? error.message : "We couldn’t reach the calendar. Please try again.";
const monthStart = (date = new Date(), zone = "America/New_York") => new Date(`${dayKey(date.toISOString(), zone).slice(0, 7)}-01T00:00:00Z`);
const bumpMonth = (date: Date, amount: number) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1));

export default function Scheduler({ entry }: { entry: { service?: ServiceId; sequence: number } }) {
  const [service, setService] = useState<ServiceId>();
  const [stage, setStage] = useState<Stage>("problem");
  const [meeting, setMeeting] = useState<Meeting>();
  const [mode, setMode] = useState<"preview" | "live">();
  const [scenario, setScenario] = useState<Scenario>("ready");
  const [loadingMeeting, setLoadingMeeting] = useState(false);
  const [meetingError, setMeetingError] = useState("");
  const [reload, setReload] = useState(0);
  const [contact, setContact] = useState<ContactDraft>(emptyContact);
  const [draftReady, setDraftReady] = useState(false);
  const [fitIndex, setFitIndex] = useState(0);
  const [fitResult, setFitResult] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [zones, setZones] = useState<string[]>(["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "UTC"]);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [more, setMore] = useState(false);
  const [month, setMonth] = useState(() => monthStart());
  const [day, setDay] = useState("");
  const [selected, setSelected] = useState("");
  const [excluded, setExcluded] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [request, setRequest] = useState("");
  const [receipt, setReceipt] = useState<Receipt>();
  const panel = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const submitLock = useRef(false);
  const actionFocus = useRef(false);
  const contactRef = useRef(contact);
  useEffect(() => { contactRef.current = contact; }, [contact]);
  const locked = submitting || uncertain || !!receipt;
  const content = service ? serviceContent[service] : undefined;
  const answers = useMemo(() => service ? contact.answers[service] || {} : {}, [contact.answers, service]);

  function move(next: Stage) { actionFocus.current = true; setStage(next); setErrors({}); }
  function choose(next: ServiceId) {
    if (locked) return;
    if (service === next) {
      setFitResult(""); setFitIndex(0);
      if (!meeting) setReload(i => i + 1);
      move(qualify(next, contactRef.current.answers[next] || {}) === "qualified" ? "time" : "fit");
      return;
    }
    const changed = service && service !== next;
    setService(next); setMeeting(undefined); setSelected(""); setSlots([]); setSlotError(""); setMeetingError(""); setReceipt(undefined); setFitResult(""); setExcluded([]); setMore(false); setDay(""); setRequest("");
    setNotice(changed ? "Different service, different calendar. Choose a fresh time; your contact details are still saved." : "");
    const stored = contactRef.current.answers[next] || {};
    const missing = serviceContent[next].questions.findIndex(q => !q.options.includes(stored[q.key]));
    setFitIndex(Math.max(0, missing));
    move(qualify(next, stored) === "qualified" ? "time" : "fit");
    schedulerAnalytics("scheduler_service_selected", next, undefined, mode !== "live");
  }
  const chooseRef = useRef(choose);
  useEffect(() => { chooseRef.current = choose; });

  function receive(result: ApiResponse, selectedService = service) {
    setSubmitting(false); submitLock.current = false;
    if ((result.state === "confirmed" || result.state === "requested") && result.receipt) {
      setReceipt(result.receipt); setUncertain(false); setSelected(result.receipt.start); setTimezone(result.receipt.timezone); setMode(result.receipt.mode); setService(result.receipt.service); move("receipt"); setNotice("");
      try { sessionStorage.removeItem(schedulerDraftKey); } catch { /* Receipt is held in memory. */ }
      if (result.state === "confirmed") schedulerAnalytics("scheduler_booking_confirmed", selectedService, result.receipt.uid, result.receipt.mode === "preview");
      return;
    }
    if (result.state === "rejected") {
      setUncertain(false); setNotice(result.message || "The calendar couldn’t accept this request. Your details are saved.");
      schedulerAnalytics("scheduler_booking_failed", selectedService, undefined, mode !== "live");
      try { sessionStorage.removeItem(schedulerAttemptKey); } catch { /* Optional storage. */ }
      setRequest("");
      if (["slot-unavailable", "event-changed", "invalid-time"].includes(result.code || "")) {
        setExcluded(previous => selected ? [...previous, selected] : previous); setSelected(""); move("time"); setReload(i => i + 1);
      }
      return;
    }
    actionFocus.current = true;
    setUncertain(true); setNotice(result.message || "We’re still checking the calendar. Check the status before making another request.");
  }

  useEffect(() => {
    let alive = true;
    void fetch("/api/scheduler", { cache: "no-store" }).then(r => r.json()).then(data => { if (alive) setMode(data.mode); }).catch(() => {});
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (validTimezone(detected)) { setTimezone(detected); setMonth(monthStart(new Date(), detected)); }
      const supported = (Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.("timeZone") || [];
      if (supported.length) setZones([...new Set([detected, "UTC", ...supported])].sort());
      const restored = readSchedulerDraft(sessionStorage.getItem(schedulerDraftKey));
      if (restored) { setContact(restored); contactRef.current = restored; }
      else {
        const merged: ContactDraft = { ...emptyContact, fields: {}, answers: {} };
        // Only explicitly supplied contact values are carried forward; none enter URLs.
        for (const key of ["dgc:visitor-profile", "dgc:contact-draft", "dgc_appointrelay_vsl_lead", "dgc_google_review_program_vsl_lead"]) {
          try { const source = JSON.parse(sessionStorage.getItem(key) || "{}"); for (const field of ["name", "email"] as const) if (!merged[field] && typeof source[field] === "string") merged[field] = source[field].slice(0,254); } catch { /* Ignore malformed optional prefills. */ }
        }
        const migration = readMigrationDraft(sessionStorage.getItem(migrationDraftKey));
        if (migration) {
          merged.name ||= migration.assessment.name; merged.email ||= migration.assessment.email;
          merged.answers.website = { intent: migration.assessment.intent, budget: migration.assessment.budget };
        }
        setContact(merged); contactRef.current = merged;
      }
      const savedAttempt = JSON.parse(sessionStorage.getItem(schedulerAttemptKey) || "null");
      if (savedAttempt?.id && isService(savedAttempt.service) && Date.now() - savedAttempt.savedAt < 7 * 86400000) {
        setService(savedAttempt.service); setRequest(savedAttempt.id); setUncertain(true); setStage("details");
        setNotice("Checking the result of your earlier request. We won’t submit another appointment.");
        void api({ action: "status", requestId: savedAttempt.id }).then(result => { if (alive) receive(result, savedAttempt.service); }).catch(() => { if (alive) setNotice("We couldn’t check the earlier request yet. Check its status before booking again."); });
      }
    } catch { /* Storage is optional; current-page state still persists. */ }
    setDraftReady(true);
    return () => { alive = false; };
    // Initialize once. Status recovery never submits an appointment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!draftReady || locked) return;
    try {
      const previous = JSON.parse(sessionStorage.getItem("dgc:contact-draft") || "{}");
      setContact(current => ({ ...current, name: current.name || (typeof previous.name === "string" ? previous.name.slice(0,120) : ""), email: current.email || (typeof previous.email === "string" ? previous.email.slice(0,254) : "") }));
    } catch { /* Reuse only readable contact values. */ }
    if (entry.service) chooseRef.current(entry.service);
    // General entry preserves the visitor’s current choice and information.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.sequence, draftReady]);

  useEffect(() => {
    if (!draftReady || receipt) return;
    try { sessionStorage.setItem(schedulerDraftKey, JSON.stringify({ ...contact, savedAt: Date.now() })); } catch { /* Current-page state is enough. */ }
  }, [contact, draftReady, receipt]);

  useEffect(() => {
    if (mode !== "live" || !root.current) return;
    const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { schedulerAnalytics("scheduler_viewed"); observer.disconnect(); } }, { threshold: .15 });
    observer.observe(root.current); return () => observer.disconnect();
  }, [mode]);

  useEffect(() => {
    if (!actionFocus.current) return;
    actionFocus.current = false;
    const heading = panel.current?.querySelector<HTMLElement>("[data-step-heading]");
    heading?.focus({ preventScroll: true });
    if (window.matchMedia("(max-width: 760px)").matches) heading?.scrollIntoView({ block: "start", behavior: "instant" });
    else heading?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [stage, fitIndex, fitResult, service, uncertain, more]);

  useEffect(() => {
    if (!service) return;
    const controller = new AbortController();
    setLoadingMeeting(true); setMeetingError("");
    void fetch(`/api/scheduler?service=${service}`, { signal: controller.signal, cache: "no-store" }).then(async r => {
      const data: ApiResponse = await r.json();
      if (controller.signal.aborted) return;
      if (!r.ok || !data.meeting) throw new Error(data.message || "We couldn’t load this meeting.");
      setMode(data.mode); setMeeting(data.meeting);
    }).catch(error => { if (!controller.signal.aborted) setMeetingError(message(error)); }).finally(() => { if (!controller.signal.aborted) setLoadingMeeting(false); });
    return () => controller.abort();
  }, [service, reload]);

  useEffect(() => {
    if (!service || !meeting?.canBook || stage !== "time" || qualify(service, answers) !== "qualified") return;
    const controller = new AbortController();
    setSlotsLoading(true); setSlotError("");
    const now = Date.now();
    const start = more ? Math.max(month.getTime() - 86400000, now) : now;
    const end = more ? bumpMonth(month, 1).getTime() + 86400000 : now + 28 * 86400000;
    void api({ action: "availability", service, timezone, qualification: answers, start: new Date(start).toISOString(), end: new Date(end).toISOString(), scenario }, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      setSlots((data.slots || []).filter(slot => !excluded.includes(slot) && (!more || dayKey(slot, timezone).startsWith(month.toISOString().slice(0, 7)))));
      if (data.meeting && data.meeting.version !== meeting.version) {
        setMeeting(data.meeting); setSelected(""); setNotice("The calendar settings changed. We’ve refreshed the times for this meeting.");
      }
    }).catch(error => { if (!controller.signal.aborted) setSlotError(message(error)); }).finally(() => { if (!controller.signal.aborted) setSlotsLoading(false); });
    return () => controller.abort();
  }, [service, meeting, stage, answers, timezone, more, month, reload, scenario, excluded]);

  function advanceFit(event: FormEvent) {
    event.preventDefault();
    if (!service || !content) return;
    const question = content.questions[fitIndex];
    if (!question?.options.includes(answers[question.key])) {
      setErrors({ fit: "Choose the answer closest to your situation." });
      requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>("#scheduler-fit-answer")?.focus());
      return;
    }
    if (fitIndex < content.questions.length - 1) { actionFocus.current = true; setErrors({}); setFitIndex(i => i + 1); return; }
    const result = qualify(service, answers);
    if (result === "qualified") { setFitResult(""); move("time"); }
    else { actionFocus.current = true; setFitResult(result); }
  }
  function chooseTime(start: string) {
    setSelected(start); setNotice(""); setRequest(""); move("details");
    schedulerAnalytics("scheduler_time_selected", service, undefined, mode !== "live");
  }
  async function book(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current || locked || !service || !meeting || !selected) return;
    const nextErrors: Record<string, string> = {};
    if (contact.name.trim().length < 2) nextErrors.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) nextErrors.email = "Enter a valid email address, such as name@company.com.";
    const fields = contact.fields[service] || {};
    for (const field of meeting.fields) {
      const value = fields[field.key];
      if (field.required && (field.type === "checkbox" ? value !== true : typeof value !== "string" || !value.trim())) nextErrors[field.key] = `Please complete ${field.label.toLowerCase()}.`;
      else if (field.type === "tel" && !/^\+[1-9]\d{7,14}$/.test(String(value))) nextErrors[field.key] = "Include the country code, for example +19375550123.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return; }
    submitLock.current = true; setSubmitting(true); setNotice("");
    const id = request || crypto.randomUUID(); setRequest(id);
    try { sessionStorage.setItem(schedulerAttemptKey, JSON.stringify({ id, service, savedAt: Date.now() })); } catch { /* An in-memory request still cannot double-submit. */ }
    schedulerAnalytics("scheduler_booking_submitted", service, undefined, mode !== "live");
    try {
      const result = await api({ action: "book", requestId: id, service, start: selected, timezone, name: contact.name, email: contact.email, fields, qualification: answers, attribution: captureAttribution(), version: meeting.version, scenario });
      receive(result, service);
    } catch (error) {
      // A network interruption does not prove the appointment failed.
      const code = (error as { code?: string }).code;
      if (code && ["invalid-name", "invalid-email", "invalid-field", "event-changed", "invalid-time", "unsupported-event", "not-configured", "fit-incomplete", "fit-disqualified", "fit-manual-review"].includes(code)) receive({ state: "rejected", code, message: message(error) }, service);
      else { setSubmitting(false); submitLock.current = false; actionFocus.current = true; setUncertain(true); setNotice("We didn’t receive a final calendar response. Check the booking status before trying again; your details are saved."); }
    }
  }
  async function checkStatus() {
    if (!request || submitLock.current) return;
    submitLock.current = true; setSubmitting(true);
    try { receive(await api({ action: "status", requestId: request, scenario })); }
    catch { setNotice("We couldn’t check the result yet. Try checking again shortly, or email us before booking again."); setSubmitting(false); submitLock.current = false; }
  }
  async function resetPreview(next: Scenario) {
    if (mode !== "preview") return;
    await api({ action: "reset-preview" }).catch(() => {});
    try { sessionStorage.removeItem(schedulerAttemptKey); } catch { /* Optional storage. */ }
    setScenario(next); setReceipt(undefined); setUncertain(false); setSubmitting(false); submitLock.current = false; setRequest(""); setSelected(""); setExcluded([]); setNotice(""); setSlotError(""); setReload(i => i + 1);
    setStage(service ? qualify(service, answers) === "qualified" ? "time" : "fit" : "problem");
  }

  const days = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const slot of slots) (result[dayKey(slot, timezone)] ||= []).push(slot);
    return result;
  }, [slots, timezone]);
  const currentDay = day && days[day] ? day : Object.keys(days)[0] || "";
  const today = dayKey(new Date().toISOString(), timezone);
  const totalDays = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate();
  const monthTitle = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(month);
  const stepNumber = stage === "problem" || stage === "fit" ? 1 : stage === "time" ? 2 : 3;
  const changeFields = (key: string, value: string | boolean) => {
    if (!service) return;
    setContact(current => ({ ...current, fields: { ...current.fields, [service]: { ...current.fields[service], [key]: value } } }));
  };

  return <div ref={root} className={styles.experience}>
    {mode === "preview" && <div className={styles.previewBanner}><div><strong>Development preview</strong><span>Sample times and simulated results. No appointments or invitations are created.</span></div><details><summary>Preview controls</summary><label>Test a state<select aria-label="Test a state" value={scenario} onChange={event => void resetPreview(event.target.value as Scenario)}><option value="ready">Normal booking</option><option value="empty">No availability</option><option value="error">Calendar error</option><option value="stale">Time becomes unavailable</option><option value="uncertain">Interrupted confirmation</option><option value="requested">Host approval required</option></select></label><button type="button" onClick={() => void resetPreview(scenario)}>Reset preview</button></details></div>}
    <div className={styles.layout} data-stage={stage}>
      <aside className={styles.choices} aria-label="Choose the problem for your conversation">
        <span className={styles.smallLabel}>01 / Start with the work</span>
        <div className={styles.serviceList}>{services.map(id => <button key={id} type="button" aria-pressed={service === id} disabled={locked} onClick={() => choose(id)} className={styles.serviceChoice}><span><strong>{serviceContent[id].problem}</strong><small>{serviceContent[id].service}</small></span>{service === id ? <Check size={18} aria-hidden="true" /> : <ArrowUpRight size={17} aria-hidden="true" />}</button>)}</div>
        <div className={styles.quoteShortcut}><span>Already have a written quote?</span><Link href="/quote/start/">Start your quote comparison <ArrowUpRight size={15} aria-hidden="true" /></Link><p>The Better Quote Program can start with an upload.</p></div>
        <div className={styles.personalNote}><span className={styles.noteMark} aria-hidden="true">DGC.</span><p>One practical conversation.<br />Built around your business.</p></div>
      </aside>
      <div className={styles.panel} ref={panel} aria-busy={submitting}>
        {stage !== "receipt" && <div className={styles.stepRail} aria-label={`Step ${stepNumber} of 3`}><span data-current={stepNumber === 1}>01 <span>Problem</span></span><i /><span data-current={stepNumber === 2}>02 <span>Time</span></span><i /><span data-current={stepNumber === 3}>03 <span>Details</span></span></div>}
        {!service || stage === "problem" ? <div className={styles.welcome}><span className={styles.welcomeLine} aria-hidden="true" /><h3 tabIndex={-1} data-step-heading>A little clarity<br />goes a long way.</h3><p>Tell us which part of the work needs attention. We’ll shape the conversation around it.</p><span className={styles.mobilePrompt}>Choose a problem above to begin.</span></div> : stage === "receipt" && receipt ? <MeetingReceipt receipt={receipt} /> : <>
          <div className={styles.meetingHeading}>
            <div className={styles.selectedService}><span>{content?.service}</span><button type="button" disabled={locked} onClick={() => move("problem")}>Change problem</button></div>
            <h3>{content?.title}</h3><p>{content?.purpose}</p>
            {loadingMeeting ? <p className={styles.loadingText} role="status">Checking meeting details…</p> : meeting ? <div className={styles.meetingMeta}><span><Clock3 size={14} aria-hidden="true" />{meeting.duration} minutes</span><span><Video size={14} aria-hidden="true" />{meeting.format}</span><span>{meeting.priceLabel}</span></div> : null}
            {mode === "preview" && service === "custom" && <p className={styles.finePrint}>The custom-systems duration and format are proposed preview settings.</p>}
            <details className={styles.agenda}><summary>What we’ll cover</summary><ol>{content?.agenda.map(item => <li key={item}>{item}</li>)}</ol></details>
          </div>
          {notice && <p className={styles.notice} role="status">{notice}</p>}
          {uncertain ? <div className={styles.recovery}><h4 tabIndex={-1} data-step-heading>Let’s verify the result.</h4><p>Your request may have reached the calendar. Checking its status is safe and won’t create another appointment.</p><button type="button" className={styles.primary} disabled={submitting} onClick={() => void checkStatus()}>{submitting ? "Checking the calendar…" : "Check booking status"}<ArrowRight size={17} aria-hidden="true" /></button><a href="mailto:help@daytongrowth.co">Ask us to verify it <ArrowUpRight size={15} /></a></div> : <>
            {stage === "fit" && content && <form className={styles.fit} onSubmit={advanceFit} noValidate>
              <div className={styles.stepTitle}><span className={styles.smallLabel}>A quick fit check · {fitIndex + 1} of {content.questions.length}</span><h4 tabIndex={-1} data-step-heading>{fitResult ? "A different next step may help." : "Make sure this is the right conversation."}</h4></div>
              {fitResult ? <div className={styles.fitResult}><p>{fitResult === "manual-review" ? "A few details need a closer look before this program’s fit call. You can revisit your answers, contact us for a review, or choose a custom-systems conversation." : "Based on these answers, this program isn’t the right starting point yet. We can help you think through another approach."}</p><div className={styles.actions}><button type="button" className={styles.secondary} onClick={() => { actionFocus.current = true; setFitResult(""); setFitIndex(0); setErrors({}); }}>Review answers</button><button type="button" className={styles.primary} onClick={() => choose("custom")}>Explore another approach <ArrowRight size={16} /></button></div><a className={styles.textLink} href="mailto:help@daytongrowth.co">Email us for a review <ArrowUpRight size={15} /></a></div> : <>
                <p className={styles.finePrint}>These are the same service-fit requirements used in our existing program assessment. No customer records needed.</p>
                <label className={styles.field} htmlFor="scheduler-fit-answer">{content.questions[fitIndex]?.label}<select id="scheduler-fit-answer" aria-label={content.questions[fitIndex]?.label} required value={answers[content.questions[fitIndex]?.key] || ""} aria-invalid={!!errors.fit} aria-describedby={errors.fit ? "scheduler-fit-error" : undefined} onChange={event => { const key = content.questions[fitIndex].key; const value = event.target.value; setContact(current => ({ ...current, answers: { ...current.answers, [service]: { ...current.answers[service], [key]: value } } })); setErrors({}); }}><option value="">Choose an answer</option>{content.questions[fitIndex]?.options.map(option => <option key={option}>{option}</option>)}</select></label>
                {errors.fit && <p id="scheduler-fit-error" className={styles.fieldError} role="alert">{errors.fit}</p>}
                <div className={styles.actions}>{fitIndex > 0 && <button className={styles.secondary} type="button" onClick={() => { actionFocus.current = true; setFitIndex(i => i - 1); setErrors({}); }}><ArrowLeft size={16} />Back</button>}<button className={styles.primary} type="submit">{fitIndex === content.questions.length - 1 ? "Find a time" : "Continue"}<ArrowRight size={17} aria-hidden="true" /></button></div>
              </>}
            </form>}
            {stage === "time" && <div className={styles.availability}>
              <div className={styles.stepTitle}><span className={styles.smallLabel}>02 / Choose a time</span><h4 tabIndex={-1} data-step-heading>{more ? "Find a day that works." : "A few good times to talk."}</h4></div>
              <label className={styles.timezone}><span>Your timezone</span><select aria-label="Your timezone" value={timezone} onChange={event => { setTimezone(event.target.value); setMonth(monthStart(new Date(), event.target.value)); setDay(""); }}>{zones.map(zone => <option key={zone} value={zone}>{zone.replace(/_/g, " ")}</option>)}</select></label>
              {meetingError || (!loadingMeeting && meeting && !meeting.canBook) ? <Fallback error={meetingError || meeting?.reason || "This calendar is being connected."} service={service} retry={() => setReload(i => i + 1)} /> : loadingMeeting || slotsLoading ? <div className={styles.slotsSkeleton} role="status"><span>Checking available times…</span>{[0,1,2].map(i => <div className={styles.skeleton} key={i} />)}</div> : slotError ? <Fallback error={slotError} service={service} retry={() => setReload(i => i + 1)} /> : <>
                {more && <div className={styles.dateBrowser}><div className={styles.monthBar}><button type="button" aria-label="Previous month" disabled={month <= monthStart(new Date(), timezone)} onClick={() => { setMonth(date => bumpMonth(date, -1)); setDay(""); }}><ChevronLeft size={18} /></button><strong aria-live="polite">{monthTitle}</strong><button type="button" aria-label="Next month" disabled={month >= bumpMonth(monthStart(new Date(), timezone), 11)} onClick={() => { setMonth(date => bumpMonth(date, 1)); setDay(""); }}><ChevronRight size={18} /></button></div><div className={styles.calendar} aria-label={`Available dates in ${monthTitle}`}><div className={styles.weekdays} aria-hidden="true">{["S","M","T","W","T","F","S"].map((label,i) => <span key={i}>{label}</span>)}</div><div className={styles.dateGrid}>{Array.from({ length: month.getUTCDay() }, (_,i) => <span key={`blank-${i}`} />)}{Array.from({ length: totalDays }, (_,i) => { const key = `${month.getUTCFullYear()}-${String(month.getUTCMonth()+1).padStart(2,"0")}-${String(i+1).padStart(2,"0")}`; return <button key={key} type="button" disabled={!days[key] || key < today} aria-pressed={currentDay === key} aria-label={`${monthTitle} ${i+1}${days[key] ? ", times available" : ", no times available"}`} onClick={() => setDay(key)}>{i+1}</button>; })}</div></div>{currentDay && <p className={styles.dayLabel}>{dateLabel(days[currentDay][0], timezone)}</p>}</div>}
                {!slots.length ? <div className={styles.empty}><CalendarDays size={25} aria-hidden="true" /><h5>No times in this date range.</h5><p>Browse another month, or email us and we’ll help find a time.</p><a href="mailto:help@daytongrowth.co">help@daytongrowth.co <ArrowUpRight size={15} /></a></div> : <div className={more ? styles.timeGrid : styles.nextSlots} aria-label="Available appointment times">{(more ? days[currentDay] || [] : slots.slice(0,3)).map(slot => <button type="button" key={slot} onClick={() => chooseTime(slot)} className={styles.slot}><span>{!more && <small>{dateLabel(slot, timezone)}</small>}<strong>{timeLabel(slot, timezone)}</strong></span><ArrowUpRight size={17} aria-hidden="true" /></button>)}</div>}
                <button className={styles.moreTimes} type="button" onClick={() => { actionFocus.current = true; setMore(!more); if (!more) setMonth(monthStart(new Date(), timezone)); }}>{more ? "Back to the next available times" : "See more times"}<ArrowRight size={16} aria-hidden="true" /></button>
                <p className={styles.finePrint}>{mode === "preview" ? "These are sample appointments for reviewing the experience." : "Times come from the calendar. A time is confirmed only when you finish booking."}</p>
              </>}
              {content?.questions.length ? <button className={styles.textLink} type="button" onClick={() => { setFitIndex(0); move("fit"); }}>Review fit answers</button> : null}
            </div>}
            {stage === "details" && meeting && selected && <form className={styles.contactForm} onSubmit={book} noValidate>
              <div className={styles.stepTitle}><span className={styles.smallLabel}>03 / Your details</span><h4 tabIndex={-1} data-step-heading>Where should the invitation go?</h4></div>
              <div className={styles.selectionSummary}><CalendarDays size={21} aria-hidden="true" /><div><strong>{dateLabel(selected, timezone)}</strong><span>{timeLabel(selected, timezone)} · {meeting.duration} minutes</span><small>{timezone.replace(/_/g, " ")} · {meeting.format}</small></div><button type="button" disabled={submitting} onClick={() => move("time")}>Change time</button></div>
              <div className={styles.contactFields}><Field field={{ key: "name", label: "Your name", type: "text", required: true }} value={contact.name} error={errors.name} disabled={submitting} onChange={value => setContact(current => ({ ...current, name: String(value) }))} /><Field field={{ key: "email", label: "Email address", type: "email", required: true }} value={contact.email} error={errors.email} disabled={submitting} onChange={value => setContact(current => ({ ...current, email: String(value) }))} />{meeting.fields.map(field => <Field key={field.key} field={field} value={contact.fields[service]?.[field.key] || ""} error={errors[field.key]} disabled={submitting} onChange={value => changeFields(field.key, value)} />)}</div>
              <p className={styles.finePrint}>Your details are used to arrange this conversation. <Link href="/privacy-policy/">Privacy policy</Link>. No account needed.</p>
              <button type="submit" className={styles.primary} disabled={submitting}>{submitting ? "Confirming with the calendar…" : mode === "preview" ? "Preview booking confirmation" : "Confirm booking"}{!submitting && <ArrowRight size={17} aria-hidden="true" />}</button>
              <p className={styles.commitment}>{meeting.priceLabel}. {mode === "preview" ? "Nothing will be booked or sent." : "We’ll discuss any project scope before you commit to work."}</p>
            </form>}
          </>}
        </>}
      </div>
    </div>
  </div>;
}

function Field({ field, value, error, disabled, onChange }: { field: BookingField; value: string | boolean; error?: string; disabled: boolean; onChange: (value: string | boolean) => void }) {
  const id = `scheduler-field-${field.key}`;
  const props = { id, name: field.key, required: field.required, disabled, "aria-invalid": !!error, "aria-describedby": error ? `${id}-error` : field.type === "tel" ? `${id}-hint` : undefined };
  return <div className={styles.fieldWrap}><label className={styles.field} htmlFor={id}>{field.type !== "checkbox" && field.label}{field.type === "select" ? <select {...props} value={String(value)} onChange={e => onChange(e.target.value)}><option value="">Choose an answer</option>{field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.type === "textarea" ? <textarea {...props} rows={3} maxLength={2000} value={String(value)} onChange={e => onChange(e.target.value)} /> : field.type === "checkbox" ? <span className={styles.checkbox}><input {...props} type="checkbox" checked={value === true} onChange={e => onChange(e.target.checked)} />{field.label}</span> : <input {...props} type={field.type} maxLength={field.key === "name" ? 120 : field.type === "email" ? 254 : 2000} autoComplete={field.key === "name" ? "name" : field.type === "email" ? "email" : field.type === "tel" ? "tel" : "off"} inputMode={field.type === "tel" ? "tel" : field.type === "email" ? "email" : field.type === "number" ? "decimal" : "text"} value={String(value)} onChange={e => onChange(e.target.value)} />}</label>{field.type === "tel" && <small id={`${id}-hint`}>Include the country code, for example +19375550123.</small>}{error && <p className={styles.fieldError} id={`${id}-error`} role="alert">{error}</p>}</div>;
}
function Fallback({ error, service, retry }: { error: string; service: ServiceId; retry: () => void }) {
  return <div className={styles.fallback} role="status"><h5>Let’s find another way in.</h5><p>{error}</p><div className={styles.actions}><button type="button" className={styles.secondary} onClick={retry}>Try again</button><Link className={styles.textLink} href={serviceContent[service].fallback}>{service === "custom" ? "Send us a note" : "Use the existing booking flow"}<ArrowUpRight size={16} /></Link></div><a className={styles.textLink} href="mailto:help@daytongrowth.co">help@daytongrowth.co</a></div>;
}
function MeetingReceipt({ receipt }: { receipt: Receipt }) {
  const content = serviceContent[receipt.service];
  const confirmed = receipt.status === "confirmed";
  const download = () => {
    const url = URL.createObjectURL(new Blob([calendarFile(receipt)], { type: "text/calendar;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "DaytonGrowthCo-conversation.ics"; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <div className={styles.receipt}><div className={styles.receiptTop}><span className={styles.receiptMark}><Check size={25} aria-hidden="true" /></span><span className={styles.smallLabel}>{receipt.mode === "preview" ? confirmed ? "Sample meeting receipt" : "Sample request · approval required" : confirmed ? "Your conversation is confirmed" : "Awaiting your host’s approval"}</span></div><h3 tabIndex={-1} data-step-heading>{receipt.mode === "preview" ? confirmed ? "This is your next step." : "Your host reviews this request." : confirmed ? "You’re on the calendar." : "Your request is with us."}</h3><p>{receipt.mode === "preview" ? confirmed ? "This is a simulated receipt. No meeting has been booked and no invitation has been sent." : "This preview shows a request awaiting approval, not a confirmed appointment. Nothing has been booked or sent." : confirmed ? "Bring one challenge. We’ll take it from there." : "This time is requested, not yet confirmed. We’ll follow up after it’s reviewed."}</p><div className={styles.receiptMeeting}><span>{content.service}</span><h4>{receipt.title}</h4><dl><div><dt>Date</dt><dd>{dateLabel(receipt.start, receipt.timezone)}</dd></div><div><dt>Time</dt><dd>{timeLabel(receipt.start, receipt.timezone)}<small>{receipt.timezone.replace(/_/g," ")}</small></dd></div><div><dt>Duration</dt><dd>{receipt.duration} minutes</dd></div><div><dt>Meeting</dt><dd>{receipt.format}{receipt.meetingUrl && <a href={receipt.meetingUrl} target="_blank" rel="noreferrer">Join the meeting <ArrowUpRight size={14} /></a>}{!receipt.meetingUrl && receipt.mode === "live" && <small>{receipt.location && !receipt.location.startsWith("http") ? receipt.location : "Joining details will be provided with the calendar invitation."}</small>}</dd></div><div><dt>{receipt.invitationSent ? "Invitation sent to" : "Booking email"}</dt><dd>{receipt.email}</dd></div></dl></div><div className={styles.receiptPrep}><span className={styles.smallLabel}>A little preparation</span><p>{content.preparation}</p><ol>{content.agenda.map(item => <li key={item}>{item}</li>)}</ol></div>{receipt.mode === "live" && <div className={styles.receiptActions}>{confirmed && <button className={styles.primary} type="button" onClick={download}><CalendarDays size={17} />Add to calendar</button>}{receipt.rescheduleUrl && <a href={receipt.rescheduleUrl} target="_blank" rel="noreferrer">Reschedule <ArrowUpRight size={14} /></a>}{receipt.cancelUrl && <a href={receipt.cancelUrl} target="_blank" rel="noreferrer">Cancel <ArrowUpRight size={14} /></a>}</div>}<div className={styles.contextInvite}><Mail size={18} aria-hidden="true" /><div><a href="mailto:help@daytongrowth.co?subject=Context%20for%20our%20conversation">Show us what’s getting stuck <ArrowUpRight size={14} /></a><p>Optional. Send a little context by email, or simply bring it to the call.</p></div></div></div>;
}
