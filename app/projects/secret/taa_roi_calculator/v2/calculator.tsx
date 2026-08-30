"use client";

import { Check, Clipboard, RotateCcw, Share2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import "../../../taa/calculator_coop/calculator.css";

type ScenarioKey = "current" | "ceiling" | "stress";

type CalculatorState = {
  desiredNet: number;
  commission: number;
  showRate: number;
  closeRate: number;
  scenario: ScenarioKey;
};

const BASELINE: CalculatorState = {
  desiredNet: 200000,
  commission: 1500,
  showRate: 60,
  closeRate: 20,
  scenario: "current",
};

const SCENARIOS: Record<ScenarioKey, { label: string; cpa: number; description: string }> = {
  current: { label: "Current data", cpa: 30.9, description: "$30.90 cost per qualified appointment" },
  ceiling: { label: "Observed ceiling", cpa: 40, description: "$40.00 cost per qualified appointment" },
  stress: { label: "Stress level", cpa: 61.8, description: "$61.80 cost per qualified appointment" },
};

type Plan = {
  cpa: number;
  clientAcquisitionCost: number;
  profitPerClient: number;
  clientsNeeded: number | null;
  qualifiedNeeded: number | null;
  annualSpend: number | null;
  monthlySpend: number | null;
  grossCommission: number | null;
  netIncome: number | null;
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

function calculate(state: CalculatorState, cpa: number): Plan {
  const conversionRate = Math.max(0, state.showRate / 100) * Math.max(0, state.closeRate / 100);
  const clientAcquisitionCost = conversionRate > 0 ? cpa / conversionRate : Infinity;
  const profitPerClient = state.commission - clientAcquisitionCost;
  const viable = state.desiredNet >= 0 && profitPerClient > 0 && Number.isFinite(clientAcquisitionCost);
  if (!viable) {
    return { cpa, clientAcquisitionCost, profitPerClient, clientsNeeded: null, qualifiedNeeded: null, annualSpend: null, monthlySpend: null, grossCommission: null, netIncome: null, viable: false };
  }
  const clientsNeeded = state.desiredNet / profitPerClient;
  const qualifiedNeeded = clientsNeeded / conversionRate;
  const annualSpend = qualifiedNeeded * cpa;
  const grossCommission = clientsNeeded * state.commission;
  return { cpa, clientAcquisitionCost, profitPerClient, clientsNeeded, qualifiedNeeded, annualSpend, monthlySpend: annualSpend / 12, grossCommission, netIncome: grossCommission - annualSpend, viable: true };
}

function stateFromQuery(): CalculatorState | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if (![...params.keys()].length) return null;
  const value = (key: "desiredNet" | "commission" | "showRate" | "closeRate") => readNumber(params.get(key) || "", BASELINE[key]);
  const scenario = params.get("scenario");
  return { desiredNet: value("desiredNet"), commission: value("commission"), showRate: value("showRate"), closeRate: value("closeRate"), scenario: scenario === "ceiling" || scenario === "stress" ? scenario : "current" };
}

function Field({ label, hint, value, min, max, step = 1, prefix, suffix, onChange }: { label: string; hint?: string; value: number; min: number; max: number; step?: number; prefix?: string; suffix?: string; onChange: (value: number) => void }) {
  const id = `taa-v2-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return <div className="taa-field">
    <div className="taa-field-heading"><label htmlFor={id}>{label}</label>{hint && <span>{hint}</span>}</div>
    <div className="taa-number-wrap">{prefix && <span className="taa-input-affix">{prefix}</span>}<input id={id} className="taa-number" type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(readNumber(event.target.value, value))} />{suffix && <span className="taa-input-affix">{suffix}</span>}</div>
    <input className="taa-range" aria-label={`${label} slider`} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(readNumber(event.target.value, value))} />
  </div>;
}

function Metric({ label, value, detail, tone = "default" }: { label: string; value: string; detail?: string; tone?: "default" | "positive" | "negative" }) {
  return <div className={`taa-metric taa-metric-${tone}`}><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div>;
}

export function TaaAnnualProfitCalculator() {
  const [state, setState] = useState<CalculatorState>(BASELINE);
  const [copied, setCopied] = useState<"link" | "summary" | null>(null);
  const plans = useMemo(() => (Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => ({ key, ...SCENARIOS[key], plan: calculate(state, SCENARIOS[key].cpa) })), [state]);
  const selected = plans.find((item) => item.key === state.scenario) || plans[0];

  useEffect(() => {
    const queryState = stateFromQuery();
    if (queryState) setState(queryState);
  }, []);

  const update = useCallback(<K extends keyof CalculatorState>(key: K, value: CalculatorState[K]) => setState((current) => ({ ...current, [key]: value })), []);
  const reset = () => setState(BASELINE);
  const queryString = useMemo(() => new URLSearchParams(Object.entries(state).map(([key, value]) => [key, String(value)])).toString(), [state]);
  const summary = useMemo(() => [
    "Travel Agent Academy — annual profit plan",
    `Desired annual net income: ${currency(state.desiredNet)}`,
    `Commission per client: ${currency(state.commission)}`,
    ...plans.map(({ label, plan }) => `${label}: spend ${currency(plan.annualSpend)} / year (${currency(plan.monthlySpend)} monthly) to create ${currency(plan.grossCommission)} in gross commission.`),
  ].join("\n"), [plans, state]);
  const copyText = async (kind: "link" | "summary") => {
    const text = kind === "link" ? `${window.location.origin}${window.location.pathname}?${queryString}` : summary;
    try { await navigator.clipboard.writeText(text); } catch { const area = document.createElement("textarea"); area.value = text; document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove(); }
    setCopied(kind); window.setTimeout(() => setCopied(null), 1800);
  };

  return <main className="taa-calculator">
    <div className="taa-shell">
      <header className="taa-header">
        <div className="taa-title-block">
          <div className="taa-brand-lockup" aria-label="The Travel Agents Academy"><span className="taa-brand-mark" aria-hidden="true">TA</span><strong>THE TRAVEL<br />AGENTS ACADEMY</strong></div>
          <p className="taa-kicker">Private growth tool / annual planning</p>
          <h1>PROFIT <em>PLANNER</em></h1>
          <p className="taa-subtitle">Set the take-home income you want. See the ad investment and gross commission required to get there.</p>
        </div>
        <div className="taa-header-actions"><button className="taa-quiet-button" type="button" onClick={() => copyText("link")}><Share2 size={15} />{copied === "link" ? "Link copied" : "Copy scenario link"}</button><button className="taa-quiet-button" type="button" onClick={() => copyText("summary")}><Clipboard size={15} />{copied === "summary" ? "Summary copied" : "Copy summary"}</button></div>
      </header>

      <div className="taa-preset-bar" aria-label="Data scenario"><label className="taa-scenario-select"><span>Focus view</span><select value={state.scenario} onChange={(event) => update("scenario", event.target.value as ScenarioKey)}>{plans.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}</select></label><span className="taa-scenario-note">All three data levels remain visible below.</span><button className="taa-reset" type="button" onClick={reset}><RotateCcw size={14} />Reset plan</button></div>

      <div className="taa-layout">
        <section className="taa-panel taa-input-panel" aria-labelledby="goal-heading">
          <div className="taa-panel-heading"><div><p className="taa-eyebrow">Your target</p><h2 id="goal-heading">Profit goal</h2></div><span className="taa-live-dot">Live model</span></div>
          <div className="taa-fields">
            <Field label="Desired annual net income" hint="After ad spend" value={state.desiredNet} min={0} max={5000000} step={5000} prefix="$" onChange={(value) => update("desiredNet", value)} />
            <Field label="Commission per client" hint="Your earnings" value={state.commission} min={0} max={50000} step={50} prefix="$" onChange={(value) => update("commission", value)} />
          </div>
          <details className="taa-advanced">
            <summary><span>Conversion assumptions</span><small>Uses the same lead data as the ROI model</small></summary>
            <div className="taa-advanced-fields"><div className="taa-field-pair"><Field label="Show rate" value={state.showRate} min={0} max={100} step={1} suffix="%" onChange={(value) => update("showRate", value)} /><Field label="Close rate" value={state.closeRate} min={0} max={100} step={1} suffix="%" onChange={(value) => update("closeRate", value)} /></div></div>
          </details>
        </section>

        <section className="taa-results" aria-labelledby="results-heading">
          <div className="taa-results-heading"><div><p className="taa-eyebrow">Your required investment</p><h2 id="results-heading">The path to {currency(state.desiredNet)}</h2></div><span className="taa-campaign-tag">{selected.label}</span></div>
          <div className="taa-sales-story">
            <section className="taa-story-funnel"><p className="taa-eyebrow">How the math works</p><div className="taa-story-step"><span>Annual ad investment</span><strong>{currency(selected.plan.annualSpend)}</strong></div><div className="taa-story-step"><span>Gross commission</span><strong>{currency(selected.plan.grossCommission)}</strong></div><div className="taa-story-step"><span>Annual net income</span><strong>{currency(selected.plan.netIncome)}</strong><small>after ad spend</small></div></section>
            <section className="taa-headline-outcomes"><div className="taa-headline-metric"><span>Average monthly ad spend</span><strong>{currency(selected.plan.monthlySpend)}</strong><small>to reach your annual target</small></div><div className="taa-headline-metric"><span>Clients needed</span><strong>{number(selected.plan.clientsNeeded)}</strong><small>over the next 12 months</small></div><div className="taa-headline-metric"><span>Profit per new client</span><strong>{currency(selected.plan.profitPerClient)}</strong><small>commission less acquisition cost</small></div></section>
          </div>

          <section className="taa-comparison"><div><p className="taa-eyebrow">Three data levels</p><h3>What your target requires</h3></div><div className="taa-comparison-values">{plans.map(({ key, label, plan }) => <div key={key}><span>{label}</span><strong>{currency(plan.monthlySpend)}</strong><small>{plan.viable ? `${currency(plan.annualSpend)} annual spend` : "Not profitable at these inputs"}</small></div>)}</div></section>

          <section className="taa-subpanel taa-projection"><div className="taa-subpanel-heading"><div><p className="taa-eyebrow">Scenario detail</p><h3>Net income versus total commission</h3></div><span>12-month plan</span></div><div className="taa-table-wrap"><table><thead><tr><th>Data level</th><th>Cost / qualified appointment</th><th>Cost / client</th><th>Ad spend / year</th><th>Gross commission</th><th>Net income</th></tr></thead><tbody>{plans.map(({ key, label, cpa, plan }) => <tr key={key}><th scope="row">{label}</th><td>{currency(cpa, 2)}</td><td>{currency(plan.clientAcquisitionCost)}</td><td>{currency(plan.annualSpend)}</td><td>{currency(plan.grossCommission)}</td><td className={plan.viable ? "taa-positive" : "taa-negative"}>{plan.viable ? currency(plan.netIncome) : "Not profitable"}</td></tr>)}</tbody></table></div></section>

          <details className="taa-financial-details"><summary>View the planning assumptions</summary><div className="taa-metric-grid taa-metric-grid-detail"><Metric label="Show rate" value={`${number(state.showRate)}%`} detail="qualified appointments that attend" /><Metric label="Close rate" value={`${number(state.closeRate)}%`} detail="attended appointments that convert" /><Metric label="Current cost / client" value={currency(plans[0].plan.clientAcquisitionCost)} detail="at current data" /><Metric label="Current annual ad spend" value={currency(plans[0].plan.annualSpend)} detail="to hit your net goal" /><Metric label="Current gross commission" value={currency(plans[0].plan.grossCommission)} detail="before ad spend" /><Metric label="Current annual net" value={currency(plans[0].plan.netIncome)} detail="after ad spend" tone="positive" /></div></details>

          <footer className="taa-footnote"><div className="taa-footnote-meta"><span><Check size={15} />Every result updates immediately.</span><span>Scenario links encode your current inputs only.</span></div><p className="taa-disclaimer"><strong>Important:</strong> Net income in this planner means gross commission less ad spend. It uses the same qualified-appointment cost, show-rate, and close-rate assumptions as the original ROI calculator. Actual results will vary and are not guaranteed. This tool is not financial advice.</p></footer>
        </section>
      </div>
    </div>
  </main>;
}
