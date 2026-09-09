"use client";

import { useEffect, useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import { createInquiryJourneyStore, emptyInquiryJourney, type InquiryJourney, type InquiryService } from "./inquiry-journey";
import styles from "./homepage-experience.module.css";

export { inquiryServices, type InquiryService } from "./inquiry-journey";
const journeyStore = createInquiryJourneyStore(() => sessionStorage);
function notifyJourney(next: InquiryJourney) {
  window.dispatchEvent(new CustomEvent("dgc:inquiry-context", { detail: next }));
}
export const selectInquiryService = (service: InquiryService) => notifyJourney(journeyStore.select(service));
export function saveCalculatorScenario(service: InquiryService, text: string) {
  notifyJourney(journeyStore.saveScenario(service, text));
}
export function useInquiryJourney() {
  const [journey, setJourney] = useState<InquiryJourney>(emptyInquiryJourney);
  useEffect(() => {
    setJourney(journeyStore.read());
    const receive = (event: Event) => setJourney((event as CustomEvent<InquiryJourney>).detail);
    window.addEventListener("dgc:inquiry-context", receive);
    return () => window.removeEventListener("dgc:inquiry-context", receive);
  }, []);
  return journey;
}

export function ExactRange({ label, value, min, max, step = 1, unit = "", onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (value: number) => void }) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const parsed = Number(draft);
    const next = draft.trim() && Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : value;
    onChange(next); setDraft(String(next));
  };
  return <div className={`hero-roi-control ${styles.exactControl}`}>
    <div className={styles.inputHeading}><label htmlFor={id}>{label}</label><span>{unit}<input id={id} type="number" inputMode="decimal" min={min} max={max} step={step} value={draft} onChange={event => { setDraft(event.target.value); const n = Number(event.target.value); if (event.target.value && Number.isFinite(n) && n >= min && n <= max) onChange(n); }} onBlur={commit} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); commit(); } }} /></span></div>
    <input aria-label={`${label} slider`} type="range" min={min} max={max} step={step} value={value} onChange={event => onChange(Number(event.target.value))} style={{ "--roi-range-progress": `${(value - min) / (max - min) * 100}%` } as React.CSSProperties} />
  </div>;
}

const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
export function MigrationCostChart({ monthly, investment, years }: { monthly: number; investment: number; years: number }) {
  const months = years * 12, rented = monthly * months, owned = investment + years * 15;
  const breakEven = monthly > 1.25 ? investment / (monthly - 1.25) : null;
  const ceiling = Math.max(100, Math.ceil(Math.max(rented, owned) / 500) * 500);
  const x = (month: number) => 10 + month / months * 460;
  const y = (cost: number) => 160 - cost / ceiling * 140;
  return <figure className={styles.chart}>
    <figcaption>Cumulative website costs <span>Estimate · same time period</span></figcaption>
    <div className={styles.chartScale}><span>{money(ceiling)}</span><span>Total paid</span></div>
    <svg viewBox="0 0 480 180" role="img" aria-label={`Over ${years} years: current platform ${money(rented)}; migration plus domain ${money(owned)}. ${breakEven === null ? "No break-even at this monthly cost." : `Estimated break-even in month ${Math.ceil(breakEven)}.`}`}>
      {[0, .5, 1].map(fraction => <line key={fraction} x1="10" x2="470" y1={y(ceiling * fraction)} y2={y(ceiling * fraction)} stroke="currentColor" opacity=".13" />)}
      <path d={`M10,${y(0)} L470,${y(rented)}`} fill="none" stroke="#667d87" strokeWidth="3" strokeDasharray="7 5" />
      <path d={`M10,${y(investment)} L470,${y(owned)}`} fill="none" stroke="#174c64" strokeWidth="3" />
      {breakEven !== null && breakEven <= months && <g><line x1={x(breakEven)} x2={x(breakEven)} y1={y(breakEven * monthly)} y2="160" stroke="#174c64" opacity=".45" strokeDasharray="3 3" /><circle cx={x(breakEven)} cy={y(breakEven * monthly)} r="5" fill="#174c64" stroke="white" strokeWidth="2" /></g>}
    </svg>
    <div className={styles.chartScale}><span>$0 · Today</span><span>Year {years}</span></div>
    <dl className={styles.chartLegend}><div><dt>– – Current platform</dt><dd>{money(rented)}</dd></div><div><dt>━━ Migration + domain</dt><dd>{money(owned)}</dd></div></dl>
    <p>{breakEven === null ? "No break-even at this monthly platform cost." : `Break-even: around month ${Math.ceil(breakEven)}${breakEven > months ? " (beyond this comparison)" : " · marked by the dot"}.`} Starts with {money(investment)} upfront, then an assumed $15/year domain. Additional hosting, maintenance, and scope changes are excluded.</p>
  </figure>;
}

export function QuoteCostBreakdown({ original, savings, fee }: { original: number; savings: number; fee: number }) {
  const next = original - savings, net = savings - fee;
  return <figure className={styles.chart}>
    <figcaption>Where the savings go <span>Illustrative quote comparison</span></figcaption>
    <div className={styles.quoteBar} aria-hidden="true"><span style={{ flexGrow: next }} /><span style={{ flexGrow: fee }} /><span style={{ flexGrow: net }} /></div>
    <dl className={styles.quoteLedger}>{[["Original written quote", original], ["Comparable quote after savings", next], ["Success fee", fee], ["Estimated net savings", net]].map(([label, amount]) => <div key={label}><dt>{label}</dt><dd>{money(Number(amount))}</dd></div>)}</dl>
    <p>{money(savings)} qualifying savings − {money(fee)} fee = {money(net)} net savings. The fee applies only to qualifying savings under the published program terms.</p>
  </figure>;
}

function SiteConcept({ after }: { after: boolean }) {
  return <div className={styles.concept} data-after={after}>
    <div className={styles.conceptNav}>{after ? "LOCAL SERVICE CO." : "HOME · ABOUT · NEWS · MORE"}</div>
    <h4>{after ? <>Good work.<br />One call away.</> : <>Welcome to<br />our website.</>}</h4>
    <p>{after ? "Repairs, maintenance, and a clear next step." : "Updates. Information. Services. News."}</p>
    <div className={styles.conceptAction}>{after ? <>Tell us what you need <ArrowRight size={14} /></> : "Learn more"}</div>
    <div className={styles.conceptProof}>{after ? "SERVICES → PROJECT PROOF → CONTACT" : "LATEST NEWS · LINKS · INFORMATION"}</div>
  </div>;
}
export function WebsiteComparison() {
  const [position, setPosition] = useState(0);
  const id = useId();
  return <section className={styles.comparison} aria-label="Website before and after concept">
    <div className={styles.comparisonTitle}><span>Website clarity, made visible</span><small>Concept · not a client result</small></div>
    <div className={styles.comparisonCanvas}>
      <SiteConcept after={false} />
      <div className={styles.afterLayer} style={{ clipPath: `inset(0 0 0 ${position}%)` }}><SiteConcept after /></div>
      <div className={styles.divider} style={{ left: `${position}%` }} aria-hidden="true"><span>↔</span></div>
      <input id={id} className={styles.comparisonDrag} type="range" aria-label="Compare before and after website concepts" aria-valuetext={`${position}% before, ${100 - position}% after`} min="0" max="100" value={position} onChange={event => setPosition(Number(event.target.value))} />
    </div>
    <div className={styles.comparisonControls}><button type="button" aria-pressed={position === 100} onClick={() => setPosition(100)}>Before</button><button type="button" aria-pressed={position === 50} onClick={() => setPosition(50)}>Compare</button><button type="button" aria-pressed={position === 0} onClick={() => setPosition(0)}>After</button></div>
    <ol className={styles.annotations}><li><strong>Say what you do.</strong> Put specific services ahead of a generic welcome.</li><li><strong>Make proof findable.</strong> Give genuine project work a clear place in the journey.</li><li><strong>Show the next step.</strong> Use a direct invitation with one clear destination.</li></ol>
  </section>;
}
