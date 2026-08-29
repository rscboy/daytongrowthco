"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Download, Info, Printer, RotateCcw, SlidersHorizontal, ArrowUpRight, PhoneCall, Mail, Sparkles } from "lucide-react";
import "./calculator.css";

type Mode = "goal" | "forecast";
type ScenarioKey = "conservative" | "expected" | "optimistic";

type CalculatorState = {
  goalType: "annual" | "monthly";
  profitGoal: number;
  annualMix: number;
  monthlyMix: number;
  newClientsPerMonth: number;
  churnRate: number;
  renewalRate: number;
  fixedExpenses: number;
  onboardingCost: number;
  serviceCost: number;
  processingRate: number;
  taxRate: number;
  forecastMonths: number;
  emailsPerDay: number;
  outreachDays: number;
  deliveryRate: number;
  replyRate: number;
  positiveRate: number;
  emailBookingRate: number;
  emailShowRate: number;
  emailCloseRate: number;
  dialsPerDay: number;
  connectRate: number;
  qualifiedRate: number;
  callBookingRate: number;
  callShowRate: number;
  callCloseRate: number;
  useCalls: boolean;
};

const DEFAULTS: CalculatorState = {
  goalType: "annual", profitGoal: 120000, annualMix: 60, monthlyMix: 40, newClientsPerMonth: 0,
  churnRate: 4, renewalRate: 75, fixedExpenses: 333.19, onboardingCost: 35, serviceCost: 42,
  processingRate: 2.9, taxRate: 22, forecastMonths: 12, emailsPerDay: 150, outreachDays: 20,
  deliveryRate: 96, replyRate: 4.5, positiveRate: 35, emailBookingRate: 55, emailShowRate: 78, emailCloseRate: 32,
  dialsPerDay: 40, connectRate: 18, qualifiedRate: 45, callBookingRate: 35, callShowRate: 72, callCloseRate: 28, useCalls: true,
};

const money = (n: number, digits = 0) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: digits, minimumFractionDigits: digits }).format(Number.isFinite(n) ? n : 0);
const num = (n: number, digits = 0) => new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(Number.isFinite(n) ? Number(n.toFixed(digits)) : 0);
const pct = (n: number) => `${num(n, 1)}%`;
const clampRate = (n: number) => Math.max(0.001, n / 100);

function model(s: CalculatorState, funnelMultiplier = 1) {
  const annualShare = Math.max(0, s.annualMix) / Math.max(1, s.annualMix + s.monthlyMix);
  const monthlyShare = 1 - annualShare;
  const annualValue = 2500;
  const monthlyValue = 250;
  const grossPerNewClient = annualShare * annualValue + monthlyShare * monthlyValue;
  const processingPerClient = grossPerNewClient * clampRate(s.processingRate);
  const contribution = grossPerNewClient - processingPerClient - s.onboardingCost - s.serviceCost;
  const monthlyFixed = s.fixedExpenses + (87.74 + 100) / 12;
  const targetMonthlyProfit = s.goalType === "annual" ? s.profitGoal / 12 : s.profitGoal;
  const targetClients = Math.max(0, targetMonthlyProfit + monthlyFixed) / Math.max(1, contribution * (1 - clampRate(s.taxRate)));
  const deliveredPerEmail = clampRate(s.deliveryRate);
  const positivePerEmail = deliveredPerEmail * clampRate(s.replyRate) * clampRate(s.positiveRate);
  const heldPerEmail = positivePerEmail * clampRate(s.emailBookingRate) * clampRate(s.emailShowRate);
  const clientPerEmail = heldPerEmail * clampRate(s.emailCloseRate);
  const targetFromEmails = targetClients / Math.max(0.0001, clientPerEmail) * funnelMultiplier;
  const callsClientRate = clampRate(s.connectRate) * clampRate(s.qualifiedRate) * clampRate(s.callBookingRate) * clampRate(s.callShowRate) * clampRate(s.callCloseRate);
  const targetDials = targetClients / Math.max(0.0001, callsClientRate) * funnelMultiplier;
  const emailVolume = s.emailsPerDay * s.outreachDays;
  const callVolume = s.dialsPerDay * s.outreachDays;
  const emailClients = emailVolume * clientPerEmail;
  const callClients = s.useCalls ? callVolume * callsClientRate : 0;
  const forecastClients = Math.max(0, s.newClientsPerMonth > 0 ? s.newClientsPerMonth : emailClients + callClients);
  const cashCollected = forecastClients * grossPerNewClient;
  const recognizedRevenue = forecastClients * (annualShare * annualValue / 12 + monthlyShare * monthlyValue);
  const expenses = monthlyFixed + forecastClients * (s.onboardingCost + s.serviceCost + processingPerClient);
  const preTaxProfit = recognizedRevenue - expenses;
  const profit = preTaxProfit * (1 - clampRate(s.taxRate));
  const bookedPerEmail = positivePerEmail * clampRate(s.emailBookingRate);
  const heldPerEmailFromBookings = bookedPerEmail * clampRate(s.emailShowRate);
  return { annualShare, monthlyShare, grossPerNewClient, contribution, monthlyFixed, targetMonthlyProfit, targetClients,
    deliveredPerEmail, positivePerEmail, bookedPerEmail, heldPerEmail: heldPerEmailFromBookings, clientPerEmail, targetFromEmails, callsClientRate, targetDials,
    emailVolume, callVolume, emailClients, callClients, forecastClients, cashCollected, recognizedRevenue, expenses, preTaxProfit, profit,
    mrr: forecastClients * monthlyShare * monthlyValue + forecastClients * annualShare * annualValue / 12,
    arr: (forecastClients * 12) * grossPerNewClient, margin: recognizedRevenue ? profit / recognizedRevenue : 0 };
}

function reverse(s: CalculatorState, m: ReturnType<typeof model>) {
  const clients = m.targetClients;
  const held = clients / Math.max(0.001, clampRate(s.emailCloseRate));
  const booked = held / Math.max(0.001, clampRate(s.emailShowRate));
  const positive = booked / Math.max(0.001, clampRate(s.emailBookingRate));
  const delivered = positive / Math.max(0.001, clampRate(s.positiveRate));
  const emails = delivered / Math.max(0.001, clampRate(s.deliveryRate));
  const dials = s.useCalls ? clients / Math.max(0.001, m.callsClientRate) : 0;
  return { clients, held, booked, positive, delivered, emails, dials, conversations: dials * clampRate(s.connectRate), appointmentsPerDay: booked / Math.max(1, s.outreachDays) };
}

function scenario(s: CalculatorState, key: ScenarioKey) {
  const factor = key === "conservative" ? 0.7 : key === "optimistic" ? 1.35 : 1;
  const tuned = { ...s, deliveryRate: Math.min(100, s.deliveryRate * (key === "conservative" ? .98 : key === "optimistic" ? 1.01 : 1)), replyRate: s.replyRate * factor, positiveRate: s.positiveRate * factor, emailBookingRate: s.emailBookingRate * factor, emailShowRate: s.emailShowRate * factor, emailCloseRate: s.emailCloseRate * factor };
  return model(tuned, 1);
}

function Field({ label, value, min, max, step = 1, prefix, suffix, hint, onChange }: { label: string; value: number; min: number; max: number; step?: number; prefix?: string; suffix?: string; hint?: string; onChange: (n: number) => void }) {
  const id = `calc-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return <div className="calc-field"><div className="calc-field-top"><label htmlFor={id}>{label}</label>{hint && <span className="hint" title={hint}><Info size={13} /></span>}</div><div className="calc-input"><span>{prefix}</span><input id={id} type="number" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value) || 0)} /><span>{suffix}</span></div><input className="calc-slider" aria-label={`${label} slider`} type="range" min={min} max={max} step={step} value={Math.min(max, Math.max(min, value))} onChange={e => onChange(Number(e.target.value))} /></div>;
}

function Section({ eyebrow, title, children, action }: { eyebrow: string; title: string; children: ReactNode; action?: ReactNode }) {
  return <section className="calc-section"><div className="section-head"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{action}</div>{children}</section>;
}

function Metric({ label, value, note, accent = false }: { label: string; value: string; note?: string; accent?: boolean }) {
  return <div className={`metric ${accent ? "metric-accent" : ""}`}><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>;
}

export default function ProfitCalculatorPage() {
  const [state, setState] = useState<CalculatorState>(DEFAULTS);
  const [mode, setMode] = useState<Mode>("goal");
  const [showCalls, setShowCalls] = useState(true);
  const [saved, setSaved] = useState(false);
  useEffect(() => { try { const raw = localStorage.getItem("dgc-profit-calculator"); if (raw) setState({ ...DEFAULTS, ...JSON.parse(raw) }); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem("dgc-profit-calculator", JSON.stringify(state)); } catch {} }, [state]);
  const update = <K extends keyof CalculatorState>(key: K, value: CalculatorState[K]) => setState(v => ({ ...v, [key]: value }));
  const m = useMemo(() => model(state), [state]);
  const r = useMemo(() => reverse(state, m), [state, m]);
  const current = useMemo(() => model(state), [state]);
  const monthly = useMemo(() => Array.from({ length: state.forecastMonths }, (_, i) => { const ramp = Math.min(1, (i + 1) / 4); const clients = (mode === "goal" ? m.targetClients : m.forecastClients) * ramp; const cash = clients * m.grossPerNewClient; const revenue = clients * (m.annualShare * 2500 / 12 + m.monthlyShare * 250); const expenses = m.monthlyFixed + clients * (state.onboardingCost + state.serviceCost + m.grossPerNewClient * clampRate(state.processingRate)); return { month: i + 1, clients, cash, revenue, expenses, profit: (revenue - expenses) * (1 - clampRate(state.taxRate)) }; }), [state, m, mode]);
  const maxProfit = Math.max(...monthly.map(x => x.profit), 1);
  const breakEven = monthly.findIndex(x => x.profit >= 0) + 1;
  const downloadCsv = () => { const rows = [["Month", "Clients", "Cash collected", "Recognized revenue", "Expenses", "Net profit"], ...monthly.map(x => [x.month, x.clients.toFixed(2), x.cash.toFixed(2), x.revenue.toFixed(2), x.expenses.toFixed(2), x.profit.toFixed(2)])]; const blob = new Blob([rows.map(row => row.join(",")).join("\n")], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "daytongrowthco-profit-forecast.csv"; a.click(); URL.revokeObjectURL(url); };
  const saveSnapshot = () => { setSaved(true); window.setTimeout(() => setSaved(false), 1800); };

  return <main className="calc-app"><header className="calc-header"><div className="calc-brand"><div className="brand-mark"><span>DG</span><i /></div><div><strong>DAYTONGROWTHCO</strong><span>HVAC REVIEW GROWTH PROGRAM</span></div></div><div className="header-actions"><button className="ghost-btn" onClick={() => window.print()}><Printer size={15} /> Print summary</button><button className="ghost-btn" onClick={downloadCsv}><Download size={15} /> Export CSV</button><button className="icon-btn" onClick={() => { setState(DEFAULTS); setMode("goal"); }} title="Reset calculator"><RotateCcw size={16} /></button></div></header>
    <div className="calc-shell"><div className="hero"><div className="hero-copy"><div className="live-pill"><span /> LIVE OPERATING MODEL</div><h1>Turn outreach<br /><em>into profit.</em></h1><p>See the exact volume of emails, conversations, and appointments it takes to make the HVAC Google Review Growth Program pay for itself.</p></div><div className="hero-signal"><div className="signal-grid" /><span>MONTHLY PROFIT TARGET</span><strong>{money(mode === "goal" ? m.targetMonthlyProfit : m.profit)}</strong><small>{mode === "goal" ? "working backwards from your goal" : "based on actual outreach"}</small><ArrowUpRight size={32} /></div></div>

      <div className="mode-switch" role="tablist"><button className={mode === "goal" ? "active" : ""} onClick={() => setMode("goal")} role="tab">Goal mode <small>Start with the outcome</small></button><button className={mode === "forecast" ? "active" : ""} onClick={() => setMode("forecast")} role="tab">Forecast mode <small>Start with your activity</small></button></div>
      <div className="workbench"><aside className="input-rail"><Section eyebrow="01 / OFFER ECONOMICS" title="Your inputs"><div className="input-grid"><Field label="Profit goal" value={state.profitGoal} min={0} max={1000000} step={5000} prefix="$" suffix={state.goalType === "annual" ? "/ yr" : "/ mo"} onChange={n => update("profitGoal", n)} /><div className="segmented"><span>Goal period</span><div><button className={state.goalType === "annual" ? "selected" : ""} onClick={() => update("goalType", "annual")}>Annual</button><button className={state.goalType === "monthly" ? "selected" : ""} onClick={() => update("goalType", "monthly")}>Monthly</button></div></div><Field label="New clients / month" value={state.newClientsPerMonth} min={0} max={50} step={1} suffix="clients" hint="Forecast mode uses this as the actual client count." onChange={n => update("newClientsPerMonth", n)} /></div><div className="subhead">Offer mix <span title="Annual payments are collected immediately but recognized over 12 months."><Info size={13} /></span></div><div className="input-grid two"><Field label="Annual plan · $2,500 upfront" value={state.annualMix} min={0} max={100} suffix="%" onChange={n => update("annualMix", n)} /><Field label="Monthly plan · $250 / month" value={state.monthlyMix} min={0} max={100} suffix="%" onChange={n => update("monthlyMix", n)} /></div><div className="mix-bar"><span style={{ width: `${Math.min(100, state.annualMix / Math.max(1, state.annualMix + state.monthlyMix) * 100)}%` }} /><small>{num(m.annualShare * 100)}% annual cash / {num(m.monthlyShare * 100)}% monthly recurring</small></div></Section>
          <Section eyebrow="02 / OUTREACH ENGINE" title="Email funnel" action={<Mail size={18} />}><div className="input-grid two"><Field label="Emails sent / day" value={state.emailsPerDay} min={0} max={2000} step={10} suffix="emails" onChange={n => update("emailsPerDay", n)} /><Field label="Outreach days / month" value={state.outreachDays} min={1} max={31} suffix="days" onChange={n => update("outreachDays", n)} /></div><div className="funnel-inputs"><Field label="Delivery rate" value={state.deliveryRate} min={50} max={100} step={0.5} suffix="%" onChange={n => update("deliveryRate", n)} /><Field label="Total reply rate" value={state.replyRate} min={0} max={30} step={0.1} suffix="%" onChange={n => update("replyRate", n)} /><Field label="Positive reply rate" value={state.positiveRate} min={0} max={100} step={1} suffix="%" onChange={n => update("positiveRate", n)} /><Field label="Positive → appointment" value={state.emailBookingRate} min={0} max={100} step={1} suffix="%" onChange={n => update("emailBookingRate", n)} /><Field label="Appointment show rate" value={state.emailShowRate} min={0} max={100} step={1} suffix="%" onChange={n => update("emailShowRate", n)} /><Field label="Close rate" value={state.emailCloseRate} min={0} max={100} step={1} suffix="%" onChange={n => update("emailCloseRate", n)} /></div></Section>
          <Section eyebrow="03 / OPTIONAL CHANNEL" title="Cold-call funnel" action={<button className={`toggle ${showCalls ? "on" : ""}`} onClick={() => { setShowCalls(!showCalls); update("useCalls", !showCalls); }} aria-label="Toggle cold call funnel"><i /></button>}>{showCalls && <div className="funnel-inputs"><div className="input-grid two"><Field label="Dials / day" value={state.dialsPerDay} min={0} max={500} step={5} suffix="dials" onChange={n => update("dialsPerDay", n)} /><Field label="Connect rate" value={state.connectRate} min={0} max={100} step={1} suffix="%" onChange={n => update("connectRate", n)} /></div><Field label="Qualified conversation rate" value={state.qualifiedRate} min={0} max={100} step={1} suffix="%" onChange={n => update("qualifiedRate", n)} /><Field label="Appointment booking rate" value={state.callBookingRate} min={0} max={100} step={1} suffix="%" onChange={n => update("callBookingRate", n)} /><Field label="Show rate" value={state.callShowRate} min={0} max={100} step={1} suffix="%" onChange={n => update("callShowRate", n)} /><Field label="Close rate" value={state.callCloseRate} min={0} max={100} step={1} suffix="%" onChange={n => update("callCloseRate", n)} /></div>}</Section>
          <Section eyebrow="04 / COSTS & TIMING" title="The fine print"><div className="input-grid two"><Field label="Fixed monthly expenses" value={state.fixedExpenses} min={0} max={5000} step={10} prefix="$" onChange={n => update("fixedExpenses", n)} /><Field label="Forecast period" value={state.forecastMonths} min={1} max={24} suffix="months" onChange={n => update("forecastMonths", n)} /><Field label="Onboarding cost / client" value={state.onboardingCost} min={0} max={1000} step={5} prefix="$" onChange={n => update("onboardingCost", n)} /><Field label="Service cost / client / mo" value={state.serviceCost} min={0} max={1000} step={5} prefix="$" onChange={n => update("serviceCost", n)} /><Field label="Payment processing" value={state.processingRate} min={0} max={10} step={0.1} suffix="%" onChange={n => update("processingRate", n)} /><Field label="Tax rate" value={state.taxRate} min={0} max={50} step={1} suffix="%" onChange={n => update("taxRate", n)} /></div><div className="expense-note"><span>Current baseline expenses</span><strong>Mailforge $180 · PlusVibe $65.45</strong><small>Domains $87.74 + connection $100 are spread across year one.</small></div></Section>
        </aside>

        <div className="results"><div className="result-banner"><div><span className="eyebrow">{mode === "goal" ? "REVERSE FUNNEL / TARGET" : "FORWARD FUNNEL / FORECAST"}</span><h2>{mode === "goal" ? `To make ${money(state.profitGoal)} ${state.goalType === "annual" ? "a year" : "a month"}` : "Your current motion projects"}</h2><p>{mode === "goal" ? "Here’s the outreach engine required at your current offer mix and conversion assumptions." : "Your activity volume flows through every conversion assumption into cash, revenue, and profit."}</p></div><div className="result-badge"><Sparkles size={16} /><span>{saved ? "Saved locally" : "Auto-saved"}</span></div></div>
          <div className="metric-grid"><Metric label="Clients needed / month" value={num(mode === "goal" ? r.clients : m.forecastClients, 1)} note={mode === "goal" ? `${num(r.clients * 12, 1)} / year` : "from current outreach"} accent /><Metric label="Recognized revenue / mo" value={money(mode === "goal" ? r.clients * (m.annualShare * 2500 / 12 + m.monthlyShare * 250) : m.recognizedRevenue)} note="annual plan amortized" /><Metric label="Net profit / month" value={money(mode === "goal" ? m.targetMonthlyProfit : m.profit)} note={`${pct(m.margin)} profit margin`} accent /><Metric label="Break-even month" value={breakEven ? `Month ${breakEven}` : "Beyond forecast"} note="after fixed costs & tax" /></div>
          <div className="two-panels"><div className="panel funnel-panel"><div className="panel-title"><div><span className="eyebrow">EMAIL REVERSE FUNNEL</span><h3>Required motion</h3></div><span className="panel-tag">{num(r.emails / Math.max(1, state.outreachDays), 0)} / day</span></div><div className="funnel-visual"><div className="funnel-row row-email"><span><Mail size={15} /> Emails sent</span><strong>{num(mode === "goal" ? r.emails : m.emailVolume)}</strong><small>/ month</small></div><div className="funnel-row row-delivered"><span>Delivered</span><strong>{num((mode === "goal" ? r.emails : m.emailVolume) * m.deliveredPerEmail)}</strong><small>{pct(state.deliveryRate)}</small></div><div className="funnel-row row-replies"><span>Replies</span><strong>{num((mode === "goal" ? r.emails : m.emailVolume) * clampRate(state.deliveryRate) * clampRate(state.replyRate))}</strong><small>{pct(state.replyRate)}</small></div><div className="funnel-row row-positive"><span>Positive replies</span><strong>{num((mode === "goal" ? r.emails : m.emailVolume) * m.positivePerEmail)}</strong><small>{pct(state.positiveRate)}</small></div><div className="funnel-row row-appts"><span>Appointments held</span><strong>{num(mode === "goal" ? r.held : m.emailVolume * m.heldPerEmail, 1)}</strong><small>{pct(state.emailShowRate)} show</small></div><div className="funnel-row row-closed"><span><ArrowUpRight size={15} /> Clients closed</span><strong>{num(mode === "goal" ? r.clients : m.emailClients, 1)}</strong><small>{pct(state.emailCloseRate)} close</small></div></div><div className="funnel-foot"><span>Appointments required / working day</span><strong>{num(mode === "goal" ? r.appointmentsPerDay : m.emailVolume * m.bookedPerEmail / Math.max(1, state.outreachDays), 1)}</strong></div></div>
            <div className="panel call-panel"><div className="panel-title"><div><span className="eyebrow">COLD-CALL OPTION</span><h3>Conversation math</h3></div><PhoneCall size={18} /></div><div className="call-score"><strong>{num(mode === "goal" ? r.dials : m.callVolume)}</strong><span>dials / month</span></div><div className="call-stats"><div><span>Conversations</span><strong>{num((mode === "goal" ? r.dials : m.callVolume) * clampRate(state.connectRate))}</strong></div><div><span>Appointments booked</span><strong>{num((mode === "goal" ? r.dials : m.callVolume) * clampRate(state.connectRate) * clampRate(state.qualifiedRate) * clampRate(state.callBookingRate), 1)}</strong></div><div><span>Clients closed</span><strong>{num(mode === "goal" ? r.dials * m.callsClientRate : m.callClients, 1)}</strong></div></div><div className="call-note"><span className="dot" /> Calls are optional. Toggle them off to see the email-only plan.</div></div></div>
          <div className="chart-panel panel"><div className="panel-title"><div><span className="eyebrow">CASH VS. RECOGNIZED REVENUE</span><h3>Profit ramp</h3></div><div className="legend"><span className="legend-cash" /> Cash collected <span className="legend-profit" /> Net profit</div></div><div className="chart"><div className="y-labels"><span>{money(maxProfit * 1.2)}</span><span>{money(maxProfit * .6)}</span><span>$0</span></div><div className="bars">{monthly.map(x => <div className="bar-group" key={x.month}><div className="bar-cash" style={{ height: `${Math.max(3, Math.min(100, x.cash / Math.max(1, maxProfit * 1.7) * 100))}%` }} title={`Month ${x.month}: ${money(x.cash)} cash`} /><div className="bar-profit" style={{ height: `${Math.max(2, Math.min(100, Math.max(0, x.profit) / maxProfit * 100))}%` }} title={`Month ${x.month}: ${money(x.profit)} profit`} /><span>M{x.month}</span></div>)}</div></div></div>
          <div className="scenario-block"><div className="panel-title"><div><span className="eyebrow">SENSITIVITY CHECK</span><h3>Three ways the same engine can perform</h3></div><span className="small-muted">Conversion rates are the lever</span></div><div className="scenario-grid">{(["conservative", "expected", "optimistic"] as ScenarioKey[]).map(key => { const x = scenario(state, key); return <div className={`scenario-card ${key}`} key={key}><div><span>{key}</span><small>{key === "conservative" ? "Room for misses" : key === "expected" ? "Your current assumptions" : "Strong-fit month"}</small></div><strong>{money(x.profit)}</strong><p>{num(x.forecastClients, 1)} clients · {pct(x.margin)} margin</p></div>; })}</div></div>
          <div className="lower-grid"><div className="panel economics"><div className="panel-title"><div><span className="eyebrow">UNIT ECONOMICS</span><h3>What each new client contributes</h3></div></div><div className="econ-rows"><div><span>Blended first-year value</span><strong>{money(m.grossPerNewClient)}</strong></div><div><span>Contribution after costs</span><strong>{money(m.contribution)}</strong></div><div><span>MRR at current forecast</span><strong>{money(m.mrr)}</strong></div><div><span>ARR run-rate</span><strong>{money(m.arr)}</strong></div></div><div className="cash-note"><strong>Cash flow ≠ recognized profit</strong><p>Annual-plan cash is collected on day one. For a clean monthly profit view, the $2,500 payment is recognized as $208.33/month across 12 months.</p></div></div><div className="panel assumptions"><div className="panel-title"><div><span className="eyebrow">MODEL STATUS</span><h3>What moves the answer</h3></div><SlidersHorizontal size={18} /></div><div className="assumption-list"><div><span>Offer mix</span><strong>{num(m.annualShare * 100)}% annual</strong></div><div><span>Email → client rate</span><strong>{pct(m.clientPerEmail * 100)}</strong></div><div><span>Call → client rate</span><strong>{pct(m.callsClientRate * 100)}</strong></div><div><span>Forecast period</span><strong>{state.forecastMonths} months</strong></div></div><button className="save-btn" onClick={saveSnapshot}>{saved ? "Scenario saved" : "Save this scenario"}</button></div></div>
          <div className="table-panel panel"><div className="panel-title"><div><span className="eyebrow">MONTH-BY-MONTH</span><h3>Revenue and profit forecast</h3></div><button className="text-btn" onClick={downloadCsv}><Download size={14} /> CSV</button></div><div className="table-scroll"><table><thead><tr><th>Month</th><th>New clients</th><th>Cash collected</th><th>Recognized revenue</th><th>Expenses</th><th>Net profit</th></tr></thead><tbody>{monthly.map(x => <tr key={x.month}><td>M{x.month}</td><td>{num(x.clients, 1)}</td><td>{money(x.cash)}</td><td>{money(x.revenue)}</td><td>{money(x.expenses)}</td><td className={x.profit >= 0 ? "positive" : "negative"}>{money(x.profit)}</td></tr>)}</tbody></table></div></div>
        </div></div>
      <footer className="calc-footer"><span>DaytonGrowthCo. / Internal planning tool</span><span>Numbers are directional. Actual results depend on list quality, deliverability, offer fit, and sales execution.</span></footer>
    </div></main>;
}
