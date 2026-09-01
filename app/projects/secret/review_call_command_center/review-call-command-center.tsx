"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Clipboard, ExternalLink, MessageCircleQuestion, Phone, PhoneCall, Search } from "lucide-react";
import { legacyProspects } from "./prospects";
import { replacementProspects } from "./replacement-prospects";
import { partTwoProspects } from "./part-two-prospects";
import { ObjectionPlaybook } from "./objection-playbook";
import styles from "./review-call-command-center.module.css";

type Outcome = "Not called" | "Voicemail left" | "No answer" | "Callback" | "Landline / no-go" | "Wrong number" | "Skip";
type RecordState = { outcome: Outcome; notes: string; updatedAt: number };
type Records = Record<number, RecordState>;

const outcomes: Outcome[] = ["Voicemail left", "No answer", "Callback", "Landline / no-go", "Wrong number", "Skip"];
const storageKey = "dgc-secret-review-voicemail-command-center-v1";
const directoryVersionKey = "dgc-secret-review-voicemail-directory-version";
const directoryVersion = 3;
const recordsEndpoint = "/projects/secret/review_call_command_center/api";
const validOutcomes = new Set<Outcome>(["Not called", ...outcomes]);

function normalizeRecords(value: unknown): Records {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const normalized: Records = {};
  for (const [key, value] of Object.entries(source)) {
    const id = Number(key);
    if (!Number.isInteger(id) || !value || typeof value !== "object") continue;
    const raw = value as Partial<RecordState>;
    if (!raw.outcome || !validOutcomes.has(raw.outcome)) continue;
    normalized[id] = {
      outcome: raw.outcome,
      notes: typeof raw.notes === "string" ? raw.notes : "",
      updatedAt: typeof raw.updatedAt === "number" && Number.isFinite(raw.updatedAt) ? raw.updatedAt : 1,
    };
  }
  return normalized;
}

function mergeRecords(left: Records, right: Records) {
  const merged = { ...left };
  for (const [key, record] of Object.entries(right)) {
    const id = Number(key);
    if (!merged[id] || record.updatedAt >= merged[id].updatedAt) merged[id] = record;
  }
  return merged;
}

function timeLabel() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function directoryProspects(records: Records) {
  const contacted = legacyProspects.filter((prospect) => records[prospect.id] && records[prospect.id].outcome !== "Not called");
  return [...contacted, ...replacementProspects, ...partTwoProspects];
}

function telValue(phone: string) {
  return `+1${phone.replace(/\D/g, "").slice(-10)}`;
}

function makeScript() {
  return "Hi, this is Sam Caruso with DaytonGrowthCo, we’re local here in Dayton. We built a system that gets businesses more organic Google reviews so they rank higher and pull in more customers. Most businesses using it pick up 8 to 12 new reviews a month without spending a dime on ads. Call or text me at 937-369-0829. Again, 937-369-0829.";
}

export function ReviewCallCommandCenter() {
  const [view, setView] = useState<"calls" | "objections">("calls");
  const [records, setRecords] = useState<Records>({});
  const [currentId, setCurrentId] = useState(replacementProspects[0].id);
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("All industries");
  const [status, setStatus] = useState<"All" | "Remaining" | "Completed">("All");
  const [copied, setCopied] = useState(false);
  const [syncState, setSyncState] = useState("Loading saved progress…");
  const recordsRef = useRef<Records>({});
  const syncInFlightRef = useRef(false);
  const syncRequestedRef = useRef(false);

  const applyRecords = useCallback((next: Records) => {
    recordsRef.current = next;
    setRecords(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch (error) {
      console.error("[review-call-command-center] Unable to update the device backup.", error);
    }
  }, []);

  const syncLatest = useCallback(async () => {
    if (syncInFlightRef.current) {
      syncRequestedRef.current = true;
      return;
    }

    syncInFlightRef.current = true;
    setSyncState("Saving to shared records…");
    try {
      do {
        syncRequestedRef.current = false;
        const response = await fetch(recordsEndpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ records: recordsRef.current, directoryVersion }),
        });
        if (!response.ok) throw new Error(`Sync failed with ${response.status}`);
        const payload = await response.json() as { records?: unknown };
        applyRecords(mergeRecords(recordsRef.current, normalizeRecords(payload.records)));
      } while (syncRequestedRef.current);
      setSyncState(`Synced ${timeLabel()}`);
    } catch (error) {
      console.error("[review-call-command-center] Unable to sync records.", error);
      syncRequestedRef.current = false;
      setSyncState("Offline — saved on this device");
    } finally {
      syncInFlightRef.current = false;
      if (syncRequestedRef.current) window.setTimeout(() => void syncLatest(), 0);
    }
  }, [applyRecords]);

  useEffect(() => {
    let local: Records = {};
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) local = normalizeRecords(JSON.parse(saved));
      const savedDirectoryVersion = Number(window.localStorage.getItem(directoryVersionKey) || 1);
      if (savedDirectoryVersion < 2) {
        for (let id = 1001; id <= 1100; id += 1) delete local[id];
      }
      if (savedDirectoryVersion < 3) {
        for (let id = 1061; id <= 1100; id += 1) delete local[id];
      }
      window.localStorage.setItem(directoryVersionKey, String(directoryVersion));
    } catch {
      window.localStorage.removeItem(storageKey);
    }
    applyRecords(local);

    let cancelled = false;
    async function loadSharedRecords() {
      try {
        const response = await fetch(recordsEndpoint, { cache: "no-store" });
        if (!response.ok) throw new Error(`Load failed with ${response.status}`);
        const payload = await response.json() as { records?: unknown; resetReplacementRecords?: boolean };
        if (cancelled) return;
        const localRecords = { ...recordsRef.current };
        if (payload.resetReplacementRecords) {
          for (let id = 1001; id <= 1100; id += 1) delete localRecords[id];
        }
        const merged = mergeRecords(localRecords, normalizeRecords(payload.records));
        applyRecords(merged);
        const next = directoryProspects(merged).find((prospect) => !merged[prospect.id] || merged[prospect.id].outcome === "Not called");
        if (next) setCurrentId(next.id);
        await syncLatest();
      } catch (error) {
        console.error("[review-call-command-center] Unable to load shared records.", error);
        if (!cancelled) {
          applyRecords(local);
          const next = directoryProspects(local).find((prospect) => !local[prospect.id] || local[prospect.id].outcome === "Not called");
          if (next) setCurrentId(next.id);
          setSyncState("Offline — saved on this device");
        }
      }
    }

    void loadSharedRecords();
    const refresh = window.setInterval(() => void loadSharedRecords(), 30000);
    const retry = () => void syncLatest();
    window.addEventListener("online", retry);
    window.addEventListener("focus", loadSharedRecords);
    return () => {
      cancelled = true;
      window.clearInterval(refresh);
      window.removeEventListener("online", retry);
      window.removeEventListener("focus", loadSharedRecords);
    };
  }, [applyRecords, syncLatest]);

  const activeProspects = useMemo(() => directoryProspects(records), [records]);
  const current = activeProspects.find((prospect) => prospect.id === currentId) ?? activeProspects[0];
  const record = records[current.id] ?? { outcome: "Not called" as Outcome, notes: "", updatedAt: 0 };
  const completed = activeProspects.filter((prospect) => records[prospect.id]?.outcome && records[prospect.id].outcome !== "Not called").length;
  const industries = useMemo(() => ["All industries", ...Array.from(new Set(activeProspects.map((prospect) => prospect.industry))).sort()], [activeProspects]);
  const voicemail = makeScript();
  const currentPosition = activeProspects.findIndex((prospect) => prospect.id === current.id) + 1;

  const filtered = useMemo(() => activeProspects.filter((prospect) => {
    const result = records[prospect.id]?.outcome ?? "Not called";
    const isDone = result !== "Not called";
    const text = `${prospect.business} ${prospect.cityArea} ${prospect.industry}`.toLowerCase();
    return text.includes(query.toLowerCase())
      && (industry === "All industries" || prospect.industry === industry)
      && (status === "All" || (status === "Completed" ? isDone : !isDone));
  }), [activeProspects, industry, query, records, status]);

  function persistRecords(next: Records) {
    applyRecords(next);
    void syncLatest();
  }

  function updateRecord(update: Partial<RecordState>) {
    const latest = recordsRef.current[current.id] ?? record;
    persistRecords({ ...recordsRef.current, [current.id]: { ...latest, ...update, updatedAt: Date.now() } });
  }

  function moveNext(sourceRecords: Records, skipId?: number) {
    const index = activeProspects.findIndex((prospect) => prospect.id === current.id);
    const isRemaining = (prospect: typeof current) => prospect.id !== skipId && (sourceRecords[prospect.id]?.outcome ?? "Not called") === "Not called";
    const next = activeProspects.slice(index + 1).find(isRemaining) ?? activeProspects.find(isRemaining);
    if (next) setCurrentId(next.id);
  }

  function saveOutcomeAndNext(outcome: Outcome) {
    const latest = recordsRef.current[current.id] ?? record;
    const next = { ...recordsRef.current, [current.id]: { ...latest, outcome, updatedAt: Date.now() } };
    persistRecords(next);
    moveNext(next, current.id);
  }

  function saveVoicemailAndNext() {
    saveOutcomeAndNext("Voicemail left");
  }

  async function copyScript() {
    await navigator.clipboard.writeText(voicemail);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.brand}><span>DG</span><div><strong>Sales Command Center</strong><small>DaytonGrowthCo. · Secret Project</small></div></div>
        <div className={styles.topbarCenter}>
          <nav className={styles.modeSwitch} aria-label="Sales tools">
            <button className={view === "calls" ? styles.activeMode : ""} onClick={() => setView("calls")}><PhoneCall size={14} /> Call Center</button>
            <button className={view === "objections" ? styles.activeMode : ""} onClick={() => setView("objections")}><MessageCircleQuestion size={14} /> Objections</button>
          </nav>
          {view === "calls" ? <div className={styles.progress}><div><span style={{ width: `${completed / activeProspects.length * 100}%` }} /></div><small>{completed} of {activeProspects.length} complete</small></div> : <small className={styles.liveReference}>Live-call reference</small>}
        </div>
        <a className={styles.backLink} href="/projects/secret-projects"><ArrowLeft size={15} /> Back to Secret Projects</a>
      </header>

      {view === "objections" ? <ObjectionPlaybook /> : <div className={styles.layout}>
        <aside className={styles.directory}>
          <div className={styles.directoryHeading}><p>PROSPECT DIRECTORY</p><strong>{filtered.length} showing</strong></div>
          <label className={styles.search}><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search businesses" aria-label="Search businesses" /></label>
          <select value={industry} onChange={(event) => setIndustry(event.target.value)} aria-label="Filter by industry">
            {industries.map((value) => <option key={value}>{value}</option>)}
          </select>
          <div className={styles.filters}>{(["All", "Remaining", "Completed"] as const).map((value) => <button key={value} className={status === value ? styles.activeFilter : ""} onClick={() => setStatus(value)}>{value}</button>)}</div>
          <div className={styles.prospectList}>
            {filtered.map((prospect, index) => {
              const result = records[prospect.id]?.outcome ?? "Not called";
              return <button key={prospect.id} className={`${styles.prospectRow} ${current.id === prospect.id ? styles.currentRow : ""}`} onClick={() => setCurrentId(prospect.id)}>
                <span className={result !== "Not called" ? styles.doneMark : ""}>{result !== "Not called" ? <Check size={13} /> : index + 1}</span>
                <span><strong>{prospect.business}</strong><small>{prospect.industry} · {prospect.cityArea}</small></span>
                <em>{prospect.phone ?? "No phone"}</em>
              </button>;
            })}
          </div>
        </aside>

        <section className={styles.workspace}>
          <div className={styles.kicker}>
            <span>VOICEMAIL {currentPosition} OF {activeProspects.length}</span>
            <div className={styles.kickerActions}>
              <span>{current.industry}</span>
              <div className={styles.quickOutcomes}>
                <button onClick={saveVoicemailAndNext}>Voicemail left <span>Next →</span></button>
                <button className={styles.landlineNext} onClick={() => saveOutcomeAndNext("Landline / no-go")}>Landline / no-go <span>Next →</span></button>
              </div>
            </div>
          </div>
          <article className={styles.prospectCard}>
            <div className={styles.prospectTitle}><div><p>{current.cityArea} · Priority {current.priority}</p><h1>{current.business}</h1></div><span className={`${styles.confidence} ${styles[`confidence${current.confidence}`]}`}>{current.confidence} confidence</span></div>
            <div className={styles.phoneBlock}>
              {current.phone ? <><a href={`tel:${telValue(current.phone)}`}><Phone size={18} /><span><small>CALL & LEAVE VOICEMAIL</small><strong>{current.phone}</strong></span></a>{current.phoneSource ? <a className={styles.sourceLink} href={current.phoneSource} target="_blank" rel="noreferrer">Phone source <ExternalLink size={12} /></a> : null}</> : <div className={styles.missingPhone}><strong>Phone not publicly verified</strong><span>Check the prospect source before dialing. No number was guessed.</span></div>}
            </div>
            <dl className={styles.prospectNotes}>
              <div><dt>Why it fits</dt><dd>{current.fitReason}</dd></div>
              <div><dt>Before calling</dt><dd>{current.qualificationNote}</dd></div>
            </dl>
            <a className={styles.prospectSource} href={current.prospectSource} target="_blank" rel="noreferrer">Open original prospect source <ExternalLink size={13} /></a>
          </article>

          <article className={styles.scriptCard}>
            <div className={styles.scriptHeader}><div><p>DEFAULT VOICEMAIL</p><span>Tailored for {current.industry.toLowerCase()}</span></div><button onClick={copyScript}><Clipboard size={15} /> Copy</button></div>
            <blockquote>“{voicemail}”</blockquote>
            <p className={styles.deliveryNote}><strong>Read it naturally.</strong> Pause after the question, then say the number slowly twice.</p>
          </article>

          <article className={styles.resultCard}>
            <div className={styles.resultHeading}><div><p>LOG THE RESULT</p><h2>What happened?</h2></div><div className={styles.saveState}><span>{record.outcome}</span><small>{syncState}</small></div></div>
            <div className={styles.outcomes}>{outcomes.map((outcome) => <button key={outcome} className={record.outcome === outcome ? styles.selectedOutcome : ""} onClick={() => updateRecord({ outcome })}>{outcome}</button>)}</div>
            <label className={styles.notes}>Notes<textarea value={record.notes} onChange={(event) => updateRecord({ notes: event.target.value })} placeholder="Name, callback time, correction, or next step…" /></label>
            <div className={styles.resultActions}><button className={styles.clear} onClick={() => updateRecord({ outcome: "Not called", notes: "" })}>Clear</button><button className={styles.saveNext} onClick={saveVoicemailAndNext}>Mark voicemail & next <span>→</span></button></div>
          </article>

          <p className={styles.guardrail}>Manual outreach only. Ask eligible customers for honest reviews and follow healthcare, privacy, consent, and professional rules for each industry.</p>
        </section>
      </div>}
      {copied ? <div className={styles.toast}>Script copied</div> : null}
    </main>
  );
}
