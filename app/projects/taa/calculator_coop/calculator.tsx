"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Clipboard, Maximize2, Minimize2, RotateCcw, Share2 } from "lucide-react";
import "./calculator.css";
import "./calculator-overhaul.css";

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

function Field({ label, hint, value, min, max, rangeMax = max, step = 1, prefix, suffix, onChange }: { label: string; hint?: string; value: number; min: number; max: number; rangeMax?: number; step?: number; prefix?: string; suffix?: string; onChange: (value: number) => void }) {
  const id = `taa-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return <div className="taa-field">
    <div className="taa-field-heading"><div><label htmlFor={id}>{label}</label>{hint && <span>{hint}</span>}</div><div className="taa-number-wrap">{prefix && <span className="taa-input-affix">{prefix}</span>}<input id={id} className="taa-number" type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(readNumber(event.target.value, value))} />{suffix && <span className="taa-input-affix">{suffix}</span>}</div></div>
    <input className="taa-range" aria-label={`${label} slider`} type="range" min={min} max={rangeMax} step={step} value={Math.min(value, rangeMax)} onChange={(event) => onChange(readNumber(event.target.value, value))} />
  </div>;
}

function formatRecovery(model: Model) {
  if (model.recoveryState === "not-reached") return "Not reached";
  if (model.recoveryState === "over") return "Over 12 months";
  if (!model.recoveryMonth || model.recoveryMonth < 1) return "Under 1 month";
  const recoveryMonth = Number(model.recoveryMonth.toFixed(1));
  return `${number(recoveryMonth, 1)} ${recoveryMonth === 1 ? "month" : "months"}`;
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

function Metric({ label, value, detail, tone = "default" }: { label: string; value: string; detail?: string; tone?: "default" | "positive" | "negative" }) {
  return <div className={`taa-metric taa-metric-${tone}`}><span>{label}</span><strong key={value}>{value}</strong>{detail && <small>{detail}</small>}</div>;
}

export function TaaCalculator() {
  const [state, setState] = useState<CalculatorState>(RIVER_BASELINE);
  const [copied, setCopied] = useState<"link" | "summary" | null>(null);
  const [presentationMode, setPresentationMode] = useState(false);
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

  const togglePresentation = () => setPresentationMode((current) => !current);

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

  const selectedPreset = (Object.keys(PRESETS) as PresetKey[]).find((key) => state.cpa === PRESETS[key].state.cpa && state.campaign === PRESETS[key].state.campaign) || "river";
  const resultKey = `${state.monthlySpend}-${state.cpa}-${state.closeRate}-${state.commission}-${state.showRate}-${state.programFee}`;

  return <main className={`taa-calculator ${presentationMode ? "is-presenting" : ""}`}>
    <div className="taa-ambient" aria-hidden="true"><i /><i /></div>
    <div className="taa-shell">
      <header className="taa-header">
        <div className="taa-brand-lockup" aria-label="The Travel Agents Academy">
          <span className="taa-brand-mark" aria-hidden="true">TA</span>
          <span><strong>The Travel Agents Academy</strong><small>Lead-generation ROI</small></span>
        </div>
        <span className="taa-live-status"><i />Live model</span>
        <div className="taa-header-actions"><button className="taa-icon-button" type="button" onClick={() => copyText("link")} aria-label="Copy scenario link" title="Copy scenario link"><Share2 size={17} />{copied === "link" && <span>Copied</span>}</button><button className="taa-icon-button" type="button" onClick={() => copyText("summary")} aria-label="Copy summary" title="Copy summary"><Clipboard size={17} />{copied === "summary" && <span>Copied</span>}</button><button className="taa-presentation-button" type="button" onClick={togglePresentation}>{presentationMode ? <Minimize2 size={17} /> : <Maximize2 size={17} />}<span>{presentationMode ? "Exit" : "Present"}</span></button></div>
      </header>

      <div className="taa-layout">
        <aside className="taa-input-panel" aria-labelledby="scenario-heading">
          <div className="taa-input-heading"><div><p className="taa-eyebrow">Build the case</p><h1 id="scenario-heading">Change four numbers.</h1></div><span>01</span></div>
          <label className="taa-scenario-select"><span>Starting scenario</span><select value={selectedPreset} onChange={(event) => loadPreset(event.target.value as PresetKey)}>{(Object.keys(PRESETS) as PresetKey[]).map((key) => <option key={key} value={key}>{PRESETS[key].label}</option>)}</select></label>
          <div className="taa-fields">
            <Field label="Monthly ad spend" hint="What you invest" value={state.monthlySpend} min={0} max={100000} rangeMax={10000} step={50} prefix="$" onChange={(value) => update("monthlySpend", value)} />
            <Field label="Cost per appointment" hint="Qualified CPA" value={state.cpa} min={1} max={500} rangeMax={100} step={0.01} prefix="$" onChange={(value) => update("cpa", value)} />
            <Field label="Close rate" hint="Booked calls that convert" value={state.closeRate} min={0} max={100} step={1} suffix="%" onChange={(value) => update("closeRate", value)} />
            <Field label="Commission per client" hint="Average booking" value={state.commission} min={0} max={50000} rangeMax={10000} step={50} prefix="$" onChange={(value) => update("commission", value)} />
          </div>

          <details className="taa-advanced">
            <summary><span>Fine-tune assumptions</span><small>Fee, show rate, time, and upside</small></summary>
            <div className="taa-advanced-fields">
              <Field label="One-time program fee" value={state.programFee} min={0} max={100000} rangeMax={20000} step={100} prefix="$" onChange={(value) => update("programFee", value)} />
              <div className="taa-field-pair"><Field label="Evaluation window" value={state.horizon} min={1} max={60} step={1} suffix="mo" onChange={(value) => update("horizon", value)} /><Field label="Target ROI" value={state.targetRoi} min={-100} max={1000} step={5} suffix="%" onChange={(value) => update("targetRoi", value)} /></div>
              <div className="taa-field-pair"><Field label="Show rate" value={state.showRate} min={0} max={100} step={1} suffix="%" onChange={(value) => update("showRate", value)} /><Field label="Month-one CPA multiplier" hint="Learning period" value={state.monthOneMultiplier} min={1} max={3} step={0.05} suffix="×" onChange={(value) => update("monthOneMultiplier", value)} /></div>
              <div className="taa-upside"><label className="taa-switch-row"><input type="checkbox" checked={state.upsideEnabled} onChange={(event) => update("upsideEnabled", event.target.checked)} /><span className="taa-switch" /><span><strong>Model repeat + referral upside</strong><small>Optional upside is excluded from the baseline.</small></span></label>{state.upsideEnabled && <div className="taa-upside-fields"><Field label="Repeat bookings" value={state.repeatRate} min={0} max={100} suffix="%" onChange={(value) => update("repeatRate", value)} /><Field label="Repeat commission" value={state.repeatCommission} min={0} max={50000} step={50} prefix="$" onChange={(value) => update("repeatCommission", value)} /><Field label="Referral rate" value={state.referralRate} min={0} max={100} suffix="%" onChange={(value) => update("referralRate", value)} /><Field label="Referral commission" value={state.referralCommission} min={0} max={50000} step={50} prefix="$" onChange={(value) => update("referralCommission", value)} /></div>}</div>
            </div>
          </details>
          <button className="taa-reset" type="button" onClick={reset}><RotateCcw size={14} />Reset to baseline</button>
        </aside>

        <section className="taa-results" aria-labelledby="results-heading">
          <section className="taa-result-hero" aria-describedby="forecast-summary">
            <div className="taa-result-topline"><p className="taa-eyebrow">Your live forecast</p><span className="taa-campaign-tag">{state.campaign}{state.cpa >= 60 && " · stress test"}</span></div>
            <h2 id="results-heading" key={resultKey}><span>{currency(state.monthlySpend)}</span> in.<br /><em>{currency(model.monthlyGross)}</em> back <i>each month.</i></h2>
            <p id="forecast-summary" className="taa-result-summary">That is about <strong>{number(model.clients)} new clients every month</strong>, based on the assumptions in this model.</p>

            <div className="taa-path" aria-label="Monthly conversion path">
              <div><span>Invest</span><strong key={state.monthlySpend}>{currency(state.monthlySpend)}</strong></div><i aria-hidden="true" />
              <div><span>Appointments</span><strong key={model.qualified}>{number(model.qualified)}</strong></div><i aria-hidden="true" />
              <div><span>Clients</span><strong key={model.clients}>{number(model.clients)}</strong></div><i aria-hidden="true" />
              <div className="taa-path-result"><span>Commission</span><strong key={model.monthlyGross}>{currency(model.monthlyGross)}</strong></div>
            </div>

            <div className="taa-outcomes">
              <Metric label={`${state.horizon}-month ROI`} value={percent(model.roi)} detail={`Every $1 returns ${currency(1 + model.roi / 100, 2)}`} tone={model.roi >= 0 ? "positive" : "negative"} />
              <Metric label="Payback" value={formatRecovery(model)} detail={model.recoveryMonth ? `Fee recovered in month ${Math.ceil(model.recoveryMonth)}` : "Outside the model"} />
              <Metric label={`${state.horizon}-month net gain`} value={currency(model.netProfit)} detail="After ad spend and program fee" tone={model.netProfit >= 0 ? "positive" : "negative"} />
            </div>

            <div className="taa-present-chart"><div><span>Cumulative profit</span><strong>Break-even at {formatRecovery(model)}</strong></div><CashFlowChart rows={model.projection} fee={state.programFee} /></div>
          </section>

          <div className="taa-detail-stack">
            <details className="taa-detail-drawer">
              <summary><span><b>02</b><span><strong>See the business case</strong><small>Cash flow, funnel, and financial detail</small></span></span><i /></summary>
              <div className="taa-detail-body">
                <div className="taa-visual-grid"><section className="taa-subpanel taa-cashflow-panel"><div className="taa-subpanel-heading"><div><p className="taa-eyebrow">Investment → profit</p><h3>Your break-even moment</h3></div><span>{formatRecovery(model)}</span></div><CashFlowChart rows={model.projection} fee={state.programFee} /><p className="taa-chart-caption">Cumulative profit crosses break-even at <strong>{formatRecovery(model)}</strong>.</p></section><section className="taa-subpanel taa-funnel-panel"><div className="taa-subpanel-heading"><div><p className="taa-eyebrow">Monthly funnel</p><h3>From spend to revenue</h3></div></div><div className="taa-funnel"><div><span>Qualified appointments</span><strong>{number(model.qualified)}</strong><i style={{ width: "100%" }} /></div><div><span>Calls held</span><strong>{number(model.calls)}</strong><i style={{ width: `${model.qualified ? (model.calls / model.qualified) * 100 : 0}%` }} /></div><div><span>Clients generated</span><strong>{number(model.clients)}</strong><i style={{ width: `${model.qualified ? (model.clients / model.qualified) * 100 : 0}%` }} /></div><div><span>Commission generated</span><strong>{currency(model.monthlyGross)}</strong><i style={{ width: "100%" }} /></div></div></section></div>
                <div className="taa-metric-grid-detail"><Metric label="Net profit" value={currency(model.netProfit)} detail={`after ${currency(model.totalCost)} total cost`} tone={model.netProfit >= 0 ? "positive" : "negative"} /><Metric label="Gross commission" value={currency(model.grossCommission)} detail={`over ${state.horizon} months`} /><Metric label="Cost per client" value={currency(model.costPerClient)} detail="ad spend / clients" /><Metric label="Revenue per ad dollar" value={`${number(model.roas, 2)}×`} detail="monthly gross commission" /><Metric label="Spend for target ROI" value={model.requiredSpend === null ? "Not solvable" : currency(model.requiredSpend)} detail={`${percent(state.targetRoi)} target ROI`} /><Metric label="Program fee" value={currency(state.programFee)} detail="one-time investment" /></div>
              </div>
            </details>

            <details className="taa-detail-drawer taa-projection">
              <summary><span><b>03</b><span><strong>View month by month</strong><small>First {Math.min(state.horizon, 12)} months</small></span></span><i /></summary>
              <div className="taa-table-wrap"><table><thead><tr><th>Month</th><th>Qualified</th><th>Calls held</th><th>Clients</th><th>Gross commission</th><th>Net contribution</th><th>After fee</th></tr></thead><tbody>{model.projection.slice(0, Math.min(state.horizon, 12)).map((row) => <tr key={row.month}><th scope="row">{row.month}</th><td>{number(row.qualified)}</td><td>{number(row.calls)}</td><td>{number(row.clients)}</td><td>{currency(row.gross)}</td><td className={row.net >= 0 ? "taa-positive" : "taa-negative"}>{currency(row.net)}</td><td className={row.cumulativeAfterFee >= 0 ? "taa-positive" : "taa-negative"}>{currency(row.cumulativeAfterFee)}</td></tr>)}</tbody></table></div>
            </details>
          </div>

          <footer className="taa-footnote"><div className="taa-footnote-meta"><span><Check size={15} />Inputs update every result immediately.</span><span>Scenario links encode the current inputs only.</span></div><p className="taa-disclaimer"><strong>Important:</strong> This calculator is provided for illustrative purposes only. Projections are based on sample data and the most recently available information collected; they may be incomplete, inaccurate, or not applicable to your circumstances. Actual results will vary and are not guaranteed. This tool is not financial advice.</p></footer>
        </section>
      </div>
    </div>
  </main>;
}
