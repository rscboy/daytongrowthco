"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, MessageCircleQuestion, Search, ShieldAlert } from "lucide-react";
import { callPhases, objections, type ObjectionCategory } from "./objections";
import styles from "./objection-playbook.module.css";

const categories: Array<"All" | ObjectionCategory> = ["All", "Decision", "Investment", "Trust", "Timing", "Authority", "Fit"];

export function ObjectionPlaybook() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [activeId, setActiveId] = useState(objections[0].id);
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => objections.filter((objection) => {
    const haystack = `${objection.title} ${objection.category} ${objection.signal} ${objection.say}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (category === "All" || objection.category === category);
  }), [category, query]);
  const active = filtered.find((objection) => objection.id === activeId) ?? filtered[0] ?? objections[0];

  async function copyResponse() {
    await navigator.clipboard.writeText(active.say);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className={styles.playbook}>
      <div className={styles.hero}>
        <div>
          <p>LIVE SALES ASSIST</p>
          <h1>Stay curious.<br />Find the real objection.</h1>
          <span>Keep this open during phone and video calls. Talk 30%. Listen 70%.</span>
        </div>
        <div className={styles.mindset}>
          <strong>Before you answer</strong>
          <ol>
            <li><b>1</b><span><em>Validate</em> Lower the tension.</span></li>
            <li><b>2</b><span><em>Isolate</em> Find the real concern.</span></li>
            <li><b>3</b><span><em>Resolve</em> Use their facts.</span></li>
            <li><b>4</b><span><em>Confirm</em> Ask if it is answered.</span></li>
          </ol>
        </div>
      </div>

      <div className={styles.toolbar}>
        <label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search what they said…" aria-label="Search objections" /></label>
        <div className={styles.categories}>{categories.map((value) => <button key={value} className={category === value ? styles.activeCategory : ""} onClick={() => setCategory(value)}>{value}</button>)}</div>
      </div>

      <div className={styles.guideLayout}>
        <aside className={styles.objectionList} aria-label="Objections">
          <div className={styles.listHeading}><span>WHAT THEY SAID</span><strong>{filtered.length}</strong></div>
          {filtered.length ? filtered.map((objection) => (
            <button key={objection.id} onClick={() => setActiveId(objection.id)} className={active.id === objection.id ? styles.activeObjection : ""}>
              <span>{objection.category}</span><strong>“{objection.title}”</strong>
            </button>
          )) : <p className={styles.empty}>No matching objection. Try a broader phrase.</p>}
        </aside>

        <article className={styles.responseCard}>
          <header>
            <div><span>{active.category}</span><h2>“{active.title}”</h2><p>{active.signal}</p></div>
            <MessageCircleQuestion aria-hidden="true" />
          </header>
          <section className={styles.sayThis}>
            <div><span>SAY THIS</span><button onClick={copyResponse}>{copied ? <Check size={15} /> : <Clipboard size={15} />}{copied ? "Copied" : "Copy response"}</button></div>
            <blockquote>“{active.say}”</blockquote>
          </section>
          <div className={styles.responseGrid}>
            <section><span>THEN ASK</span>{active.questions.map((question) => <p key={question}>“{question}”</p>)}</section>
            <section><span>LISTEN FOR</span><p>{active.listenFor}</p></section>
            <section><span>NEXT MOVE</span><p>{active.nextMove}</p></section>
            <section className={styles.avoid}><span><ShieldAlert size={13} /> AVOID</span><p>{active.avoid}</p></section>
          </div>
          <footer><strong>Finish with:</strong> “Does that answer the concern, or is there another part we should work through?”</footer>
        </article>
      </div>

      <section className={styles.discovery}>
        <div className={styles.discoveryHeading}><div><p>PREVENT OBJECTIONS EARLIER</p><h2>The six-phase call map</h2></div><span>Questions do the selling. The pitch comes after the diagnosis.</span></div>
        <div className={styles.phaseGrid}>{callPhases.map((phase) => <article key={phase.number}><b>{phase.number}</b><strong>{phase.title}</strong><p>{phase.detail}</p></article>)}</div>
      </section>

      <section className={styles.followUp}>
        <div><p>AFTER THE CALL</p><h2>Keep the decision moving.</h2><span>A verbal yes cools off, a “not yet” needs structure, and a no still deserves respect.</span></div>
        <article><b>YES</b><strong>Send it within 30 minutes</strong><p>Agreement, payment link, welcome note, and onboarding link. Confirm receipt within 24 hours if it is not completed.</p></article>
        <article><b>THINKING</b><strong>Run a three-touch follow-up</strong><p>Same-day recap in their words, a short check-in on day two, and a gracious final note on day four with a real decision date.</p></article>
        <article><b>NO</b><strong>Leave the door open</strong><p>Thank them. Ask permission to check back in three months. Never punish honesty or burn the relationship.</p></article>
      </section>

      <div className={styles.truthBar}><strong>Doctor, not debater.</strong><span>Use real proof. State only guarantees that apply. If the fit is wrong, say so.</span></div>
    </section>
  );
}
