"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Clipboard, RotateCcw, Share2 } from "lucide-react";
import "./calculator.css";

type PresetKey = "river" | "general" | "ceiling" | "riverStress" | "generalStress";

type CalculatorState = {
  campaign: "River Cruise" | "General Travel";
  monthlySpend: number;
  cpa: number;
  showRate: number;
  closeRate: number;
  commission: number;
  programFee: number;
  horizon: number;
  targetRoi: number;
  monthOneMultiplier: number;
  upsideEnabled: boolean;
  repeatRate: number;
  repeatCommission: number;
  referralRate: number;
  referralCommission: number;
};

type ProjectionRow = {
  month: number;
  qualified: number;
  calls: number;
  clients: number;
  gross: number;
  adSpend: number;
  net: number;
  cumulative: number;
  cumulativeAfterFee: number;
};

type Model = {
  qualified: number;
  calls: number;
  clients: number;
  monthlyGross: number;
  grossCommission: number;
  totalAdSpend: number;
  totalCost: number;
  netProfit: number;
  roi: number;
  roas: number;
  costPerClient: number;
  requiredSpend: number | null;
  projection: ProjectionRow[];
  recoveryMonth: number | null;
  recoveryState: "within" | "over" | "not-reached";
};

const RIVER_BASELINE: CalculatorState = {
  campaign: "River Cruise",
  monthlySpend: 600,
  cpa: 30.9,
  showRate: 60,
  closeRate: 20,
  commission: 1500,
  programFee: 3000,
  horizon: 12,
  targetRoi: 100,
  monthOneMultiplier: 1.35,
  upsideEnabled: false,
  repeatRate: 20,
  repeatCommission: 1000,
  referralRate: 10,
  referralCommission: 1000,
};

const PRESETS: Record<PresetKey, { label: string; description: string; state: Partial<CalculatorState> }> = {
  river: { label: "River Cruise", description: "$30.90 CPA baseline", state: { ...RIVER_BASELINE } },
  general: { label: "General Travel", description: "$32.57 CPA baseline", state: { ...RIVER_BASELINE, campaign: "General Travel", cpa: 32.57 } },
  ceiling: { label: "Observed Ceiling", description: "$40.00 CPA", state: { ...RIVER_BASELINE, cpa: 40 } },
  riverStress: { label: "River Stress Test", description: "$61.80 doubled-cost model", state: { ...RIVER_BASELINE, cpa: 61.8 } },
  generalStress: { label: "General Stress Test", description: "$65.14 doubled-cost model", state: { ...RIVER_BASELINE, campaign: "General Travel", cpa: 65.14 } },
};

function currency(value: number, decimals = 0) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(Number.isFinite(value) ? value : 0);
}

function number(value: number, decimals = 1) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: decimals }).format(Number.isFinite(value) ? Number(value.toFixed(decimals)) : 0);
}

function percent(value: number) {
  return `${number(value, 1)}%`;
}

function readNumber(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function calculate(state: CalculatorState): Model {
  const horizon = Math.max(1, Math.round(state.horizon));
  const monthlyQualified = Math.max(0, state.monthlySpend) / Math.max(0.01, state.cpa);
  const calls = monthlyQualified * (state.showRate / 100);
  const clients = calls * (state.closeRate / 100);
  const monthlyGross = clients * state.commission;
  const maxProjectionMonth = Math.max(36, horizon);
  const projection: ProjectionRow[] = [];
  let cumulative = 0;
  let cumulativeAfterFee = -state.programFee;

  for (let month = 1; month <= maxProjectionMonth; month += 1) {
    const learningFactor = month === 1 ? Math.max(0.1, state.monthOneMultiplier) : 1;
    const qualified = monthlyQualified / learningFactor;
    const monthCalls = qualified * (state.showRate / 100);
    const monthClients = monthCalls * (state.closeRate / 100);
    const repeatGross = state.upsideEnabled ? monthClients * (state.repeatRate / 100) * state.repeatCommission : 0;
    const referralGross = state.upsideEnabled ? monthClients * (state.referralRate / 100) * state.referralCommission : 0;
    const gross = monthClients * state.commission + repeatGross + referralGross;
    const net = gross - state.monthlySpend;
    cumulative += net;
    cumulativeAfterFee = cumulative - state.programFee;
    projection.push({ month, qualified, calls: monthCalls, clients: monthClients, gross, adSpend: state.monthlySpend, net, cumulative, cumulativeAfterFee });
  }

  let recoveryMonth: number | null = null;
  for (let index = 0; index < projection.length; index += 1) {
    const current = projection[index];
    const previous = index === 0 ? -state.programFee : projection[index - 1].cumulativeAfterFee;
    if (current.cumulativeAfterFee >= 0) {
      const distance = current.cumulativeAfterFee - previous;
      recoveryMonth = distance > 0 ? current.month - Math.max(0, previous) / distance : current.month;
      break;
    }
  }

  const horizonRows = projection.slice(0, horizon);
  const grossCommission = horizonRows.reduce((total, row) => total + row.gross, 0);
  const totalAdSpend = state.monthlySpend * horizon;
  const totalCost = totalAdSpend + state.programFee;
  const netProfit = grossCommission - totalCost;
  const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
  const roas = state.monthlySpend > 0 ? monthlyGross / state.monthlySpend : 0;
  const costPerClient = clients > 0 ? state.monthlySpend / clients : 0;

  const totalGrossPerSpendDollar = grossCommission / Math.max(0.01, state.monthlySpend);
  const targetMultiplier = 1 + state.targetRoi / 100;
  const solverDenominator = totalGrossPerSpendDollar - targetMultiplier * horizon;
  const requiredSpend = solverDenominator > 0 ? (targetMultiplier * state.programFee) / solverDenominator : null;
  const recoveryState = recoveryMonth === null ? "not-reached" : recoveryMonth > 12 ? "over" : "within";

  return { qualified: monthlyQualified, calls, clients, monthlyGross, grossCommission, totalAdSpend, totalCost, netProfit, roi, roas, costPerClient, requiredSpend, projection, recoveryMonth, recoveryState };
}

function stateFromQuery() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if (![...params.keys()].length) return null;
  const value = (key: keyof CalculatorState, fallback: number) => readNumber(params.get(key) || "", fallback);
  return {
    ...RIVER_BASELINE,
    campaign: params.get("campaign") === "General Travel" ? "General Travel" : "River Cruise",
    monthlySpend: value("monthlySpend", RIVER_BASELINE.monthlySpend),
    cpa: value("cpa", RIVER_BASELINE.cpa),
    showRate: value("showRate", RIVER_BASELINE.showRate),
    closeRate: value("closeRate", RIVER_BASELINE.closeRate),
    commission: value("commission", RIVER_BASELINE.commission),
    programFee: value("programFee", RIVER_BASELINE.programFee),
    horizon: value("horizon", RIVER_BASELINE.horizon),
    targetRoi: value("targetRoi", RIVER_BASELINE.targetRoi),
    monthOneMultiplier: value("monthOneMultiplier", RIVER_BASELINE.monthOneMultiplier),
    upsideEnabled: params.get("upsideEnabled") === "true",
    repeatRate: value("repeatRate", RIVER_BASELINE.repeatRate),
    repeatCommission: value("repeatCommission", RIVER_BASELINE.repeatCommission),
    referralRate: value("referralRate", RIVER_BASELINE.referralRate),
    referralCommission: value("referralCommission", RIVER_BASELINE.referralCommission),
  } as CalculatorState;
}

function Field({ label, hint, value, min, max, step = 1, prefix, suffix, onChange }: { label: string; hint?: string; value: number; min: number; max: number; step?: number; prefix?: string; suffix?: string; onChange: (value: number) => void }) {
  const id = `taa-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return <div className="taa-field">
    <div className="taa-field-heading"><label htmlFor={id}>{label}</label>{hint && <span>{hint}</span>}</div>
    <div className="taa-number-wrap">{prefix && <span className="taa-input-affix">{prefix}</span>}<input id={id} className="taa-number" type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(readNumber(event.target.value, value))} />{suffix && <span className="taa-input-affix">{suffix}</span>}</div>
    <input className="taa-range" aria-label={`${label} slider`} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(readNumber(event.target.value, value))} />
  </div>;
}

function formatRecovery(model: Model) {
  if (model.recoveryState === "not-reached") return "Not reached";
  if (model.recoveryState === "over") return "Over 12 months";
  if (!model.recoveryMonth || model.recoveryMonth < 1) return "Under 1 month";
  return `${number(model.recoveryMonth, 1)} months`;
}

function CashFlowChart({ rows, fee }: { rows: ProjectionRow[]; fee: number }) {
  const visibleRows = rows.slice(0, 12);
  const values = [-fee, ...visibleRows.map((row) => row.cumulativeAfterFee)];
  const min = Math.min(-fee, ...values, 0);
  const max = Math.max(fee, ...values, 0);
  const range = Math.max(1, max - min);
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${100 - ((value - min) / range) * 100}`).join(" ");
  const zeroY = 100 - ((0 - min) / range) * 100;
  return <div className="taa-chart" aria-label="Cumulative cash flow chart" role="img">
    <div className="taa-chart-legend"><span><i className="taa-legend-line" />Cumulative cash flow</span><span><i className="taa-legend-zero" />Break-even</span></div>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line className="taa-zero-line" x1="0" x2="100" y1={zeroY} y2={zeroY} /><polyline className="taa-flow-line" points={points} /><polyline className="taa-flow-fill" points={`0,${zeroY} ${points} 100,${zeroY}`} /></svg>
    <div className="taa-chart-axis"><span>Start</span><span>Month 6</span><span>Month 12</span></div>
  </div>;
}

function TimingMap({ model }: { model: Model }) {
  const marker = model.recoveryMonth === null ? 100 : Math.min(100, (model.recoveryMonth / 12) * 100);
  const label = model.recoveryState === "within" ? formatRecovery(model) : model.recoveryState === "over" ? "Over 12 months" : "Not reached";
  return <div className="taa-timing" aria-label="ROI recovery timing map" role="img">
    <div className="taa-timing-track"><span className="taa-timing-start">Start</span><span className="taa-timing-marker" style={{ left: `${marker}%` }}><b>{label}</b><i /></span><span className="taa-timing-end">12 months</span></div>
    <p>{model.recoveryState === "within" ? "The model reaches break-even within the selected first-year scale." : model.recoveryState === "over" ? `The modeled recovery point is approximately ${number(model.recoveryMonth || 0, 1)} months, so it sits beyond the first-year scale.` : "Cumulative commission does not cover the one-time program fee under the current assumptions."}</p>
  </div>;
}

function Metric({ label, value, detail, tone = "default" }: { label: string; value: string; detail?: string; tone?: "default" | "positive" | "negative" }) {
  return <div className={`taa-metric taa-metric-${tone}`}><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div>;
}

export function TaaCalculator() {
  const [state, setState] = useState<CalculatorState>(RIVER_BASELINE);
  const [copied, setCopied] = useState<"link" | "summary" | null>(null);
  const model = useMemo(() => calculate(state), [state]);

  useEffect(() => {
    const queryState = stateFromQuery();
    if (queryState) setState(queryState);
  }, []);

  const update = useCallback(<K extends keyof CalculatorState>(key: K, value: CalculatorState[K]) => {
    setState((current) => ({ ...current, [key]: value }));
  }, []);

  const loadPreset = (preset: PresetKey) => setState((current) => ({ ...current, ...PRESETS[preset].state }));
  const reset = () => setState(RIVER_BASELINE);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    (Object.keys(state) as Array<keyof CalculatorState>).forEach((key) => params.set(key, String(state[key])));
    return params.toString();
  }, [state]);

  const summary = useMemo(() => [
    `Travel Agent Academy — ${state.campaign}`,
    `Monthly ad spend: ${currency(state.monthlySpend)}`,
    `Cost per qualified appointment: ${currency(state.cpa, 2)}`,
    `Appointments / month: ${number(model.qualified)}`,
    `Clients / month: ${number(model.clients)}`,
    `Monthly gross commission: ${currency(model.monthlyGross)}`,
    `Net profit over ${state.horizon} months: ${currency(model.netProfit)}`,
    `ROI: ${percent(model.roi)}`,
    `Estimated recovery: ${formatRecovery(model)}`,
  ].join("\n"), [model, state]);

  const copyText = async (kind: "link" | "summary") => {
    const text = kind === "link" ? `${window.location.origin}${window.location.pathname}?${queryString}` : summary;
    try { await navigator.clipboard.writeText(text); } catch { const area = document.createElement("textarea"); area.value = text; document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove(); }
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1800);
  };

  return <main className="taa-calculator">
    <div className="taa-shell">
      <header className="taa-header">
        <div className="taa-title-block">
          <div className="taa-brand-lockup" aria-label="The Travel Agents Academy">
            <span className="taa-brand-mark" aria-hidden="true">TA</span>
            <strong>THE TRAVEL<br />AGENTS ACADEMY</strong>
          </div>
          <p className="taa-kicker">Private growth tool / live model</p>
          <h1>LEAD-GENERATION <em>ROI</em></h1>
          <p className="taa-subtitle">Run the numbers behind the bookings: traffic, conversations, clients, and payback.</p>
        </div>
        <div className="taa-header-actions"><button className="taa-quiet-button" type="button" onClick={() => copyText("link")}><Share2 size={15} />{copied === "link" ? "Link copied" : "Copy scenario link"}</button><button className="taa-quiet-button" type="button" onClick={() => copyText("summary")}><Clipboard size={15} />{copied === "summary" ? "Summary copied" : "Copy summary"}</button></div>
      </header>

      <div className="taa-preset-bar" aria-label="Scenario presets"><span className="taa-preset-label">Load scenario</span>{(Object.keys(PRESETS) as PresetKey[]).map((key) => <button key={key} type="button" className={`taa-preset ${state.cpa === PRESETS[key].state.cpa && state.campaign === PRESETS[key].state.campaign ? "is-selected" : ""}`} onClick={() => loadPreset(key)}><strong>{PRESETS[key].label}</strong><small>{PRESETS[key].description}</small></button>)}<button className="taa-reset" type="button" onClick={reset}><RotateCcw size={14} />Reset baseline</button></div>

      <div className="taa-layout">
        <section className="taa-panel taa-input-panel" aria-labelledby="scenario-heading">
          <div className="taa-panel-heading"><div><p className="taa-eyebrow">Inputs</p><h2 id="scenario-heading">Scenario controls</h2></div><span className="taa-live-dot">Live model</span></div>
          <div className="taa-fields">
            <Field label="Monthly ad spend" hint="Media budget" value={state.monthlySpend} min={0} max={100000} step={50} prefix="$" onChange={(value) => update("monthlySpend", value)} />
            <Field label="Cost per qualified appointment" hint="CPA" value={state.cpa} min={1} max={500} step={0.01} prefix="$" onChange={(value) => update("cpa", value)} />
            <div className="taa-field-pair"><Field label="Show rate" value={state.showRate} min={0} max={100} step={1} suffix="%" onChange={(value) => update("showRate", value)} /><Field label="Close rate" value={state.closeRate} min={0} max={100} step={1} suffix="%" onChange={(value) => update("closeRate", value)} /></div>
            <div className="taa-field-pair"><Field label="Commission per client" value={state.commission} min={0} max={50000} step={50} prefix="$" onChange={(value) => update("commission", value)} /><Field label="One-time program fee" value={state.programFee} min={0} max={100000} step={100} prefix="$" onChange={(value) => update("programFee", value)} /></div>
            <div className="taa-field-pair"><Field label="Evaluation window" value={state.horizon} min={1} max={60} step={1} suffix="mo" onChange={(value) => update("horizon", value)} /><Field label="Target ROI" value={state.targetRoi} min={-100} max={1000} step={5} suffix="%" onChange={(value) => update("targetRoi", value)} /></div>
            <Field label="Month-one CPA multiplier" hint="Learning period" value={state.monthOneMultiplier} min={1} max={3} step={0.05} suffix="×" onChange={(value) => update("monthOneMultiplier", value)} />
          </div>

          <div className="taa-upside"><label className="taa-switch-row"><input type="checkbox" checked={state.upsideEnabled} onChange={(event) => update("upsideEnabled", event.target.checked)} /><span className="taa-switch" /><span><strong>Model repeat + referral upside</strong><small>Optional upside is excluded from the baseline.</small></span></label>{state.upsideEnabled && <div className="taa-upside-fields"><Field label="Repeat bookings" value={state.repeatRate} min={0} max={100} suffix="%" onChange={(value) => update("repeatRate", value)} /><Field label="Repeat commission" value={state.repeatCommission} min={0} max={50000} step={50} prefix="$" onChange={(value) => update("repeatCommission", value)} /><Field label="Referral rate" value={state.referralRate} min={0} max={100} suffix="%" onChange={(value) => update("referralRate", value)} /><Field label="Referral commission" value={state.referralCommission} min={0} max={50000} step={50} prefix="$" onChange={(value) => update("referralCommission", value)} /></div>}</div>
        </section>

        <section className="taa-results" aria-labelledby="results-heading">
          <div className="taa-results-heading"><div><p className="taa-eyebrow">Outputs</p><h2 id="results-heading">What this scenario produces</h2></div><span className="taa-campaign-tag">{state.campaign}{state.cpa >= 60 && " / stress test"}</span></div>
          <div className="taa-metric-grid taa-metric-grid-top"><Metric label="Qualified appointments / month" value={number(model.qualified)} detail={`at ${currency(state.monthlySpend)} spend`} /><Metric label="Clients / month" value={number(model.clients)} detail={`${number(model.calls)} calls held`} /><Metric label="Monthly gross commission" value={currency(model.monthlyGross)} detail="before ad spend" tone="positive" /><Metric label="ROI" value={percent(model.roi)} detail={`over ${state.horizon} months`} tone={model.roi >= 0 ? "positive" : "negative"} /></div>

          <div className="taa-recovery-card"><div><p className="taa-eyebrow">ROI recovery timing</p><strong>{formatRecovery(model)}</strong><p>{model.recoveryState === "within" ? "The modeled contribution crosses the one-time program fee within the first year." : model.recoveryState === "over" ? `The model reaches recovery around month ${number(model.recoveryMonth || 0, 1)}.` : "The one-time program fee is not recovered within the long-range model."}</p></div><TimingMap model={model} /></div>

          <div className="taa-metric-grid taa-metric-grid-detail"><Metric label="Net profit" value={currency(model.netProfit)} detail={`after ${currency(model.totalCost)} total cost`} tone={model.netProfit >= 0 ? "positive" : "negative"} /><Metric label="Gross commission" value={currency(model.grossCommission)} detail={`over ${state.horizon} months`} /><Metric label="Cost per acquired client" value={currency(model.costPerClient)} detail="monthly ad spend / clients" /><Metric label="ROAS / revenue per ad dollar" value={`${number(model.roas, 2)}×`} detail="monthly gross commission" /><Metric label="Required monthly spend" value={model.requiredSpend === null ? "Not solvable" : currency(model.requiredSpend)} detail={`for ${percent(state.targetRoi)} target ROI`} /><Metric label="Program fee" value={currency(state.programFee)} detail="one-time investment" /></div>

          <div className="taa-visual-grid"><section className="taa-subpanel"><div className="taa-subpanel-heading"><div><p className="taa-eyebrow">Cash flow</p><h3>Cumulative contribution</h3></div><span>12-month view</span></div><CashFlowChart rows={model.projection} fee={state.programFee} /></section><section className="taa-subpanel"><div className="taa-subpanel-heading"><div><p className="taa-eyebrow">Funnel</p><h3>Monthly movement</h3></div><span>at current inputs</span></div><div className="taa-funnel"><div><span>Qualified appointments</span><strong>{number(model.qualified)}</strong><i style={{ width: "100%" }} /></div><div><span>Calls held</span><strong>{number(model.calls)}</strong><i style={{ width: `${model.qualified ? (model.calls / model.qualified) * 100 : 0}%` }} /></div><div><span>Clients generated</span><strong>{number(model.clients)}</strong><i style={{ width: `${model.qualified ? (model.clients / model.qualified) * 100 : 0}%` }} /></div><div><span>Commission generated</span><strong>{currency(model.monthlyGross)}</strong><i style={{ width: `${model.monthlyGross ? Math.min(100, (model.monthlyGross / Math.max(model.monthlyGross, state.monthlySpend * 2)) * 100) : 0}%` }} /></div></div></section></div>

          <section className="taa-subpanel taa-projection"><div className="taa-subpanel-heading"><div><p className="taa-eyebrow">Projection</p><h3>Month-by-month model</h3></div><span>first {Math.min(state.horizon, 12)} months</span></div><div className="taa-table-wrap"><table><thead><tr><th>Month</th><th>Qualified</th><th>Calls held</th><th>Clients</th><th>Gross commission</th><th>Net contribution</th><th>After fee</th></tr></thead><tbody>{model.projection.slice(0, Math.min(state.horizon, 12)).map((row) => <tr key={row.month}><th scope="row">{row.month}</th><td>{number(row.qualified)}</td><td>{number(row.calls)}</td><td>{number(row.clients)}</td><td>{currency(row.gross)}</td><td className={row.net >= 0 ? "taa-positive" : "taa-negative"}>{currency(row.net)}</td><td className={row.cumulativeAfterFee >= 0 ? "taa-positive" : "taa-negative"}>{currency(row.cumulativeAfterFee)}</td></tr>)}</tbody></table></div></section>

          <footer className="taa-footnote"><span><Check size={15} />Inputs update every result immediately.</span><span>Scenario links encode the current inputs only.</span></footer>
        </section>
      </div>
    </div>
  </main>;
}
