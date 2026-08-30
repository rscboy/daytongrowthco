"use client";

import { Check, Clipboard, RotateCcw, Share2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import "../../../taa/calculator_coop/calculator.css";

type TierKey = "essential" | "custom" | "premium";

type CalculatorState = {
  desiredNet: number;
  acquisitionCost: number;
  annualCapacity: number;
  essentialFee: number;
  customFee: number;
  premiumFee: number;
  essentialMix: number;
  customMix: number;
  premiumMix: number;
};

const BASELINE: CalculatorState = {
  desiredNet: 200000,
  acquisitionCost: 250,
  annualCapacity: 180,
  essentialFee: 100,
  customFee: 250,
  premiumFee: 500,
  essentialMix: 20,
  customMix: 55,
  premiumMix: 25,
};

const TIERS: Array<{ key: TierKey; label: string; range: string; description: string }> = [
  { key: "essential", label: "Essential planning", range: "$300–$2,000 trips", description: "Shorter, lower-complexity bookings" },
  { key: "custom", label: "Custom itinerary", range: "$2,000–$20,000 trips", description: "The core full-service planning offer" },
  { key: "premium", label: "High-touch planning", range: "$20,000+ trips", description: "Complex, luxury, group, or multi-stop travel" },
];

type Plan = {
  mixTotal: number;
  averageFee: number | null;
  netPerClient: number | null;
  annualFeeRevenue: number | null;
  annualAdSpend: number | null;
  annualNet: number | null;
  targetGap: number | null;
  clientsNeeded: number | null;
  monthlyClientsNeeded: number | null;
  adSpendNeeded: number | null;
  monthlyAdSpendNeeded: number | null;
  feeRevenueNeeded: number | null;
  requiredAverageFee: number | null;
  multiplier: number | null;
  viable: boolean;
};

function currency(value: number | null, decimals = 0) {
  if (value === null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(value);
}

function number(value: number | null, decimals = 1) {
  if (value === null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: decimals }).format(Number(value.toFixed(decimals)));
}

function readNumber(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function calculate(state: CalculatorState): Plan {
  const mixTotal = Math.max(0, state.essentialMix) + Math.max(0, state.customMix) + Math.max(0, state.premiumMix);
  if (mixTotal <= 0 || state.annualCapacity <= 0) {
    return { mixTotal, averageFee: null, netPerClient: null, annualFeeRevenue: null, annualAdSpend: null, annualNet: null, targetGap: null, clientsNeeded: null, monthlyClientsNeeded: null, adSpendNeeded: null, monthlyAdSpendNeeded: null, feeRevenueNeeded: null, requiredAverageFee: null, multiplier: null, viable: false };
  }
  const averageFee = (state.essentialFee * state.essentialMix + state.customFee * state.customMix + state.premiumFee * state.premiumMix) / mixTotal;
  const netPerClient = averageFee - state.acquisitionCost;
  const annualFeeRevenue = averageFee * state.annualCapacity;
  const annualAdSpend = state.acquisitionCost * state.annualCapacity;
  const annualNet = annualFeeRevenue - annualAdSpend;
  const requiredAverageFee = state.acquisitionCost + state.desiredNet / state.annualCapacity;
  const multiplier = averageFee > 0 ? requiredAverageFee / averageFee : null;
  const viable = netPerClient > 0 && state.desiredNet >= 0;
  const clientsNeeded = viable ? state.desiredNet / netPerClient : null;
  const adSpendNeeded = clientsNeeded === null ? null : clientsNeeded * state.acquisitionCost;
  const feeRevenueNeeded = clientsNeeded === null ? null : clientsNeeded * averageFee;
  return { mixTotal, averageFee, netPerClient, annualFeeRevenue, annualAdSpend, annualNet, targetGap: annualNet - state.desiredNet, clientsNeeded, monthlyClientsNeeded: clientsNeeded === null ? null : clientsNeeded / 12, adSpendNeeded, monthlyAdSpendNeeded: adSpendNeeded === null ? null : adSpendNeeded / 12, feeRevenueNeeded, requiredAverageFee, multiplier, viable };
}

function stateFromQuery(): CalculatorState | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if (![...params.keys()].length) return null;
  const value = (key: keyof CalculatorState) => readNumber(params.get(key) || "", BASELINE[key]);
  return { desiredNet: value("desiredNet"), acquisitionCost: value("acquisitionCost"), annualCapacity: value("annualCapacity"), essentialFee: value("essentialFee"), customFee: value("customFee"), premiumFee: value("premiumFee"), essentialMix: value("essentialMix"), customMix: value("customMix"), premiumMix: value("premiumMix") };
}

function Field({ label, hint, value, min, max, step = 1, prefix, suffix, onChange }: { label: string; hint?: string; value: number; min: number; max: number; step?: number; prefix?: string; suffix?: string; onChange: (value: number) => void }) {
  const id = `taa-v3-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return <div className="taa-field"><div className="taa-field-heading"><label htmlFor={id}>{label}</label>{hint && <span>{hint}</span>}</div><div className="taa-number-wrap">{prefix && <span className="taa-input-affix">{prefix}</span>}<input id={id} className="taa-number" type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(readNumber(event.target.value, value))} />{suffix && <span className="taa-input-affix">{suffix}</span>}</div><input className="taa-range" aria-label={`${label} slider`} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(readNumber(event.target.value, value))} /></div>;
}

function Metric({ label, value, detail, tone = "default" }: { label: string; value: string; detail?: string; tone?: "default" | "positive" | "negative" }) {
  return <div className={`taa-metric taa-metric-${tone}`}><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div>;
}

export function TaaFeePlannerCalculator() {
  const [state, setState] = useState<CalculatorState>(BASELINE);
  const [copied, setCopied] = useState<"link" | "summary" | null>(null);
  const plan = useMemo(() => calculate(state), [state]);
  const update = useCallback(<K extends keyof CalculatorState>(key: K, value: CalculatorState[K]) => setState((current) => ({ ...current, [key]: value })), []);

  useEffect(() => {
    const queryState = stateFromQuery();
    if (queryState) setState(queryState);
  }, []);

  const queryString = useMemo(() => new URLSearchParams(Object.entries(state).map(([key, value]) => [key, String(value)])).toString(), [state]);
  const recommendedFees = useMemo(() => TIERS.map(({ key }) => {
    const fee = state[`${key}Fee`];
    return { key, value: plan.multiplier === null ? null : fee * plan.multiplier };
  }), [plan.multiplier, state]);
  const summary = useMemo(() => [
    "Travel Agent Academy — planning-fee income plan",
    `Desired annual net income: ${currency(state.desiredNet)}`,
    `Blended planning fee: ${currency(plan.averageFee)}`,
    `Cost to acquire a paid client: ${currency(state.acquisitionCost)}`,
    `At ${number(state.annualCapacity, 0)} clients/year: ${currency(plan.annualNet)} net after ${currency(plan.annualAdSpend)} in ads.`,
    `To reach the goal at that capacity, blended planning fees need to average ${currency(plan.requiredAverageFee)}.`,
  ].join("\n"), [plan, state]);
  const copyText = async (kind: "link" | "summary") => {
    const text = kind === "link" ? `${window.location.origin}${window.location.pathname}?${queryString}` : summary;
    try { await navigator.clipboard.writeText(text); } catch { const area = document.createElement("textarea"); area.value = text; document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove(); }
    setCopied(kind); window.setTimeout(() => setCopied(null), 1800);
  };

  return <main className="taa-calculator"><div className="taa-shell">
    <header className="taa-header"><div className="taa-title-block"><div className="taa-brand-lockup" aria-label="The Travel Agents Academy"><span className="taa-brand-mark" aria-hidden="true">TA</span><strong>THE TRAVEL<br />AGENTS ACADEMY</strong></div><p className="taa-kicker">Private growth tool / fee-first business</p><h1>PLANNING-FEE <em>PLANNER</em></h1><p className="taa-subtitle">Price the planning work. Set an income target, a client capacity, and a fee mix—then see the advertising and fee revenue required.</p></div><div className="taa-header-actions"><button className="taa-quiet-button" type="button" onClick={() => copyText("link")}><Share2 size={15} />{copied === "link" ? "Link copied" : "Copy scenario link"}</button><button className="taa-quiet-button" type="button" onClick={() => copyText("summary")}><Clipboard size={15} />{copied === "summary" ? "Summary copied" : "Copy summary"}</button></div></header>

    <div className="taa-preset-bar"><span className="taa-scenario-note">Independent fee-first model — no commission or V2 conversion assumptions.</span><button className="taa-reset" type="button" onClick={() => setState(BASELINE)}><RotateCcw size={14} />Reset plan</button></div>

    <div className="taa-layout"><section className="taa-panel taa-input-panel" aria-labelledby="goal-heading"><div className="taa-panel-heading"><div><p className="taa-eyebrow">Your business model</p><h2 id="goal-heading">Income inputs</h2></div><span className="taa-live-dot">Live model</span></div><div className="taa-fields"><Field label="Desired annual net income" hint="After ad spend" value={state.desiredNet} min={0} max={5000000} step={5000} prefix="$" onChange={(value) => update("desiredNet", value)} /><Field label="Cost to acquire a paid client" hint="Ad spend per new client" value={state.acquisitionCost} min={0} max={5000} step={25} prefix="$" onChange={(value) => update("acquisitionCost", value)} /><Field label="Annual planning capacity" hint="Clients you can serve" value={state.annualCapacity} min={1} max={5000} step={5} suffix="clients" onChange={(value) => update("annualCapacity", value)} /></div><details className="taa-advanced" open><summary><span>Planning-fee schedule</span><small>Fees and mix are fully adjustable</small></summary><div className="taa-advanced-fields">{TIERS.map(({ key, label, range }) => <div className="taa-field-pair" key={key}><Field label={label} hint={range} value={state[`${key}Fee`]} min={0} max={10000} step={25} prefix="$" onChange={(value) => update(`${key}Fee`, value)} /><Field label={`${label} mix`} hint="Share of clients" value={state[`${key}Mix`]} min={0} max={100} step={5} suffix="%" onChange={(value) => update(`${key}Mix`, value)} /></div>)}</div></details></section>

      <section className="taa-results" aria-labelledby="results-heading"><div className="taa-results-heading"><div><p className="taa-eyebrow">Your fee-based path</p><h2 id="results-heading">The path to {currency(state.desiredNet)}</h2></div><span className="taa-campaign-tag">{number(plan.mixTotal, 0)}% trip mix</span></div><div className="taa-sales-story"><section className="taa-story-funnel"><p className="taa-eyebrow">At your selected capacity</p><div className="taa-story-step"><span>Planning fees collected</span><strong>{currency(plan.annualFeeRevenue)}</strong></div><div className="taa-story-step"><span>Advertising investment</span><strong>{currency(plan.annualAdSpend)}</strong></div><div className="taa-story-step"><span>Annual net income</span><strong>{currency(plan.annualNet)}</strong><small>planning fees less ads</small></div></section><section className="taa-headline-outcomes"><div className="taa-headline-metric"><span>Blended planning fee</span><strong>{currency(plan.averageFee)}</strong><small>based on your chosen trip mix</small></div><div className="taa-headline-metric"><span>Net per paid client</span><strong>{currency(plan.netPerClient)}</strong><small>fee less acquisition cost</small></div><div className="taa-headline-metric"><span>Fee target at capacity</span><strong>{currency(plan.requiredAverageFee)}</strong><small>blended fee required per client</small></div></section></div>

        <section className="taa-comparison"><div><p className="taa-eyebrow">Decision support</p><h3>{plan.targetGap !== null && plan.targetGap >= 0 ? "Your current schedule meets the target" : "Recommended fee schedule"}</h3></div><div className="taa-comparison-values">{TIERS.map(({ key, label, range }, index) => <div key={key}><span>{label}</span><strong>{currency(recommendedFees[index]?.value)}</strong><small>{range} · keeps your current mix</small></div>)}</div></section>

        <section className="taa-subpanel taa-projection"><div className="taa-subpanel-heading"><div><p className="taa-eyebrow">What it takes</p><h3>Ads, fees, and the number of clients</h3></div><span>annual plan</span></div><div className="taa-table-wrap"><table><thead><tr><th>Planning model</th><th>Blended fee</th><th>Clients / year</th><th>Avg. clients / month</th><th>Ad spend / year</th><th>Fees collected</th><th>Annual net</th></tr></thead><tbody><tr><th scope="row">Current fee schedule</th><td>{currency(plan.averageFee)}</td><td>{number(plan.clientsNeeded)}</td><td>{number(plan.monthlyClientsNeeded)}</td><td>{currency(plan.adSpendNeeded)}</td><td>{currency(plan.feeRevenueNeeded)}</td><td className={plan.viable ? "taa-positive" : "taa-negative"}>{plan.viable ? currency(state.desiredNet) : "Not viable"}</td></tr><tr><th scope="row">At your capacity</th><td>{currency(plan.averageFee)}</td><td>{number(state.annualCapacity, 0)}</td><td>{number(state.annualCapacity / 12)}</td><td>{currency(plan.annualAdSpend)}</td><td>{currency(plan.annualFeeRevenue)}</td><td className={plan.annualNet !== null && plan.annualNet >= 0 ? "taa-positive" : "taa-negative"}>{currency(plan.annualNet)}</td></tr><tr><th scope="row">Fee target at capacity</th><td>{currency(plan.requiredAverageFee)}</td><td>{number(state.annualCapacity, 0)}</td><td>{number(state.annualCapacity / 12)}</td><td>{currency(plan.annualAdSpend)}</td><td>{currency(state.desiredNet + (plan.annualAdSpend || 0))}</td><td className="taa-positive">{currency(state.desiredNet)}</td></tr></tbody></table></div></section>

        <details className="taa-financial-details"><summary>View fee-planning guidance</summary><div className="taa-metric-grid taa-metric-grid-detail"><Metric label="Entry-fee starting point" value="$100–$250" detail="simple domestic or lower-complexity trips" /><Metric label="Custom-fee starting point" value="$250–$500" detail="international or multi-destination planning" /><Metric label="High-touch starting point" value="$500+" detail="complex, luxury, or group itineraries" /><Metric label="Capacity net today" value={currency(plan.annualNet)} detail={`${number(state.annualCapacity, 0)} clients at current fees`} tone={plan.annualNet !== null && plan.annualNet >= state.desiredNet ? "positive" : "negative"} /><Metric label="Income gap" value={currency(plan.targetGap === null ? null : Math.abs(plan.targetGap))} detail={plan.targetGap !== null && plan.targetGap >= 0 ? "above your target" : "remaining to target"} /><Metric label="Average fee lift" value={plan.multiplier === null ? "—" : `${number(Math.max(0, (plan.multiplier - 1) * 100), 0)}%`} detail="needed at current capacity" /></div></details>
        <footer className="taa-footnote"><div className="taa-footnote-meta"><span><Check size={15} />Every result updates immediately.</span><span>Scenario links encode your current inputs only.</span></div><p className="taa-disclaimer"><strong>Important:</strong> This independent planner models planning-fee revenue less paid-client acquisition cost only. It excludes commissions, taxes, labor, supplier costs, chargebacks, and other operating expenses. The suggested fee bands are market-informed starting points, not financial advice.</p></footer>
      </section></div>
  </div></main>;
}
