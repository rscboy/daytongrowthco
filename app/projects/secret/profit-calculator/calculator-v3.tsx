"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Download, Printer, RotateCcw, Sparkles, Users } from "lucide-react";
import "./calculator-v3.css";

type Mode = "goal" | "forecast";
type Scenario = "conservative" | "expected" | "optimistic";
type Period = "monthly" | "annual";
type State = {
  target: number; targetPeriod: Period; annualMix: number;
  emails: number; days: number; delivery: number; reply: number; positive: number; booking: number; show: number; close: number;
  monthlyCosts: number; annualCosts: number; onboarding: number; service: number; processing: number; tax: number; teamCost: number;
};

const DEFAULTS: State = {
  target: 120000, targetPeriod: "annual", annualMix: 60,
  emails: 150, days: 20, delivery: 96, reply: 4.5, positive: 35, booking: 55, show: 78, close: 32,
  monthlyCosts: 245.45, annualCosts: 187.74, onboarding: 35, service: 42, processing: 2.9, tax: 22, teamCost: 0,
};

const rate = (n: number) => Math.max(.0001, n / 100);
const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0);
const num = (n: number, d = 0) => new Intl.NumberFormat("en-US", { maximumFractionDigits: d }).format(Number.isFinite(n) ? Number(n.toFixed(d)) : 0);

function calculate(s: State, scenario: Scenario) {
  const mult = scenario === "conservative" ? .72 : scenario === "optimistic" ? 1.28 : 1;
  const delivery = Math.min(100, s.delivery * (scenario === "conservative" ? .98 : scenario === "optimistic" ? 1.01 : 1));
  const reply = Math.min(100, s.reply * mult); const positive = Math.min(100, s.positive * mult);
  const booking = Math.min(100, s.booking * mult); const show = Math.min(100, s.show * mult); const close = Math.min(100, s.close * mult);
  const annualShare = s.annualMix / 100; const monthlyShare = 1 - annualShare;
  const conversion = rate(delivery) * rate(reply) * rate(positive) * rate(booking) * rate(show) * rate(close);
  const newClients = s.emails * s.days * conversion;
  const cashPerClient = annualShare * 2500 + monthlyShare * 250;
  const contribution = Math.max(1, (cashPerClient * (1 - rate(s.processing)) - s.onboarding - s.service) * (1 - rate(s.tax)));
  const monthlyTarget = s.targetPeriod === "annual" ? s.target / 12 : s.target;
  const fixed = s.monthlyCosts + s.annualCosts / 12 + s.teamCost;
  const clientsNeeded = (monthlyTarget + fixed * (1 - rate(s.tax))) / contribution;
  const held = clientsNeeded / rate(close); const booked = held / rate(show); const positives = booked / rate(booking);
  const replies = positives / rate(positive); const emailsNeeded = replies / rate(reply) / rate(delivery);
  return { annualShare, monthlyShare, delivery, reply, positive, booking, show, close, conversion, newClients, cashPerClient, clientsNeeded, held, booked, positives, replies, emailsNeeded, monthlyTarget };
}

function forecastMonth(s: State, m: ReturnType<typeof calculate>, index: number) {
  const active = index + 1;
  const annualClients = m.newClients * m.annualShare; const monthlyClients = m.newClients * m.monthlyShare;
  const cash = annualClients * 2500 + monthlyClients * active * 250;
  const recognized = annualClients * active * (2500 / 12) + monthlyClients * active * 250;
  const tools = s.monthlyCosts; const team = s.teamCost; const setup = index === 0 ? s.annualCosts : 0;
  const onboarding = m.newClients * s.onboarding; const service = m.newClients * active * s.service; const processing = cash * rate(s.processing);
  const expenses = tools + team + setup + onboarding + service + processing;
  const tax = Math.max(0, cash - expenses) * rate(s.tax); const profit = cash - expenses - tax;
  return { month: active, cash, recognized, tools, team, setup, onboarding, service, processing, expenses, tax, profit };
}

function total(months: ReturnType<typeof forecastMonth>[]) {
  return months.reduce((a, b) => ({ month: 12, cash: a.cash + b.cash, recognized: a.recognized + b.recognized, tools: a.tools + b.tools, team: a.team + b.team, setup: a.setup + b.setup, onboarding: a.onboarding + b.onboarding, service: a.service + b.service, processing: a.processing + b.processing, expenses: a.expenses + b.expenses, tax: a.tax + b.tax, profit: a.profit + b.profit }), { month: 0, cash: 0, recognized: 0, tools: 0, team: 0, setup: 0, onboarding: 0, service: 0, processing: 0, expenses: 0, tax: 0, profit: 0 });
}

function Slider({ label, value, min, max, step = 1, suffix = "", prefix = "", hint, onChange }: { label: string; value: number; min: number; max: number; step?: number; suffix?: string; prefix?: string; hint?: string; onChange: (n: number) => void }) {
  return <label className="v3-field"><span>{label}{hint && <small>{hint}</small>}</span><div className="v3-value"><i>{prefix}</i><input type="number" value={value} min={min} max={max} step={step} onChange={e => onChange(Number(e.target.value) || 0)} /><i>{suffix}</i></div><input aria-label={`${label} slider`} type="range" value={Math.min(max, Math.max(min, value))} min={min} max={max} step={step} onChange={e => onChange(Number(e.target.value))} /></label>;
}

function Drawer({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return <details className="v3-drawer"><summary><span>{icon}{title}</span><ChevronDown size={16} /></summary><div className="v3-drawer-body">{children}</div></details>;
}

export default function CalculatorV3() {
  const [mode, setMode] = useState<Mode>("goal"); const [scenario, setScenario] = useState<Scenario>("expected");
  const [period, setPeriod] = useState<Period>("monthly"); const [s, setState] = useState<State>(DEFAULTS);
  useEffect(() => { try { const saved = localStorage.getItem("dgc-profit-calculator-v3"); if (saved) setState({ ...DEFAULTS, ...JSON.parse(saved) }); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem("dgc-profit-calculator-v3", JSON.stringify(s)); } catch {} }, [s]);
  const set = <K extends keyof State>(key: K, value: State[K]) => setState(c => ({ ...c, [key]: value }));
  const m = useMemo(() => calculate(s, scenario), [s, scenario]);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => forecastMonth(s, m, i)), [s, m]);
  const selected = period === "monthly" ? months[0] : total(months); const max = Math.max(1, ...months.map(x => x.cash));
  const reset = () => { setState(DEFAULTS); setMode("goal"); setScenario("expected"); setPeriod("monthly"); };
  const csv = () => { const rows = [["Month", "Cash", "Expenses", "Tax", "Profit"], ...months.map(x => [x.month, x.cash.toFixed(2), x.expenses.toFixed(2), x.tax.toFixed(2), x.profit.toFixed(2)])]; const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "profit-forecast.csv"; a.click(); URL.revokeObjectURL(a.href); };

  const advanced = <><div className="v3-fields"><Slider label="Annual-plan mix" value={s.annualMix} min={0} max={100} suffix="%" onChange={v => set("annualMix", v)} /><Slider label="Delivery rate" value={s.delivery} min={50} max={100} suffix="%" onChange={v => set("delivery", v)} /><Slider label="Reply rate" value={s.reply} min={.1} max={30} step={.1} suffix="%" onChange={v => set("reply", v)} /><Slider label="Book after interest" value={s.booking} min={1} max={100} suffix="%" onChange={v => set("booking", v)} /></div><div className="v3-fields costs"><Slider label="Monthly tools" value={s.monthlyCosts} min={0} max={5000} prefix="$" onChange={v => set("monthlyCosts", v)} /><Slider label="Annual + setup" value={s.annualCosts} min={0} max={5000} prefix="$" onChange={v => set("annualCosts", v)} /><Slider label="Onboard each client" value={s.onboarding} min={0} max={1000} prefix="$" onChange={v => set("onboarding", v)} /><Slider label="Serve each client" value={s.service} min={0} max={1000} prefix="$" onChange={v => set("service", v)} /><Slider label="Processing" value={s.processing} min={0} max={10} step={.1} suffix="%" onChange={v => set("processing", v)} /><Slider label="Estimated tax" value={s.tax} min={0} max={50} suffix="%" onChange={v => set("tax", v)} /></div></>;

  return <main className="calc-v3"><div className="v3-aurora" aria-hidden="true"><i /><i /><i /></div><div className="v3-shell">
    <nav className="v3-nav" aria-label="Calculator mode"><div className="v3-mode"><button className={mode === "goal" ? "active" : ""} onClick={() => setMode("goal")}>Plan a goal</button><button className={mode === "forecast" ? "active" : ""} onClick={() => setMode("forecast")}>Forecast outreach</button></div><details className="v3-menu"><summary>•••</summary><button onClick={csv}><Download size={14} /> Export</button><button onClick={() => window.print()}><Printer size={14} /> Print</button><button onClick={reset}><RotateCcw size={14} /> Reset</button></details></nav>
    <div className="v3-scenarios">{(["conservative", "expected", "optimistic"] as Scenario[]).map(x => <button key={x} className={scenario === x ? "active" : ""} onClick={() => setScenario(x)}>{x}</button>)}</div>

    {mode === "goal" ? <section className="v3-experience">
      <div className="v3-answer"><span>To take home {money(m.monthlyTarget)} each month</span><h1>Close <em>{num(m.clientsNeeded, 1)}</em><br />new clients.</h1><p>{num(m.clientsNeeded * 12, 0)} clients a year. Everything below explains the path.</p></div>
      <div className="v3-goal-control"><div className="v3-period"><button className={s.targetPeriod === "monthly" ? "active" : ""} onClick={() => set("targetPeriod", "monthly")}>Monthly</button><button className={s.targetPeriod === "annual" ? "active" : ""} onClick={() => set("targetPeriod", "annual")}>Annual</button></div><Slider label="Profit goal" value={s.target} min={0} max={1000000} step={5000} prefix="$" onChange={v => set("target", v)} /></div>
      <div className="v3-path"><div><span>Send</span><strong>{num(m.emailsNeeded / s.days, 0)}</strong><small>emails / workday</small></div><b>→</b><div><span>Earn</span><strong>{num(m.positives / s.days, 1)}</strong><small>positive replies / day</small></div><b>→</b><div><span>Hold</span><strong>{num(m.held / s.days, 1)}</strong><small>appointments / day</small></div><b>→</b><div className="final"><span>Close</span><strong>{num(m.clientsNeeded, 1)}</strong><small>clients / month</small></div></div>
      <div className="v3-core"><Slider label="Interested replies" hint="Of replies, who wants to talk?" value={s.positive} min={1} max={100} suffix="%" onChange={v => set("positive", v)} /><Slider label="Show rate" hint="Who attends the call?" value={s.show} min={1} max={100} suffix="%" onChange={v => set("show", v)} /><Slider label="Close rate" hint="Who becomes a client?" value={s.close} min={1} max={100} suffix="%" onChange={v => set("close", v)} /><Slider label="Outreach days" value={s.days} min={1} max={31} suffix=" days" onChange={v => set("days", v)} /></div>
    </section> : <section className="v3-experience">
      <div className="v3-period floating"><button className={period === "monthly" ? "active" : ""} onClick={() => setPeriod("monthly")}>Month 1</button><button className={period === "annual" ? "active" : ""} onClick={() => setPeriod("annual")}>Year 1</button></div>
      <div className="v3-answer"><span>Your outreach should create</span><h1><em>{money(selected.profit)}</em><br />cash profit.</h1><p>{num(period === "monthly" ? m.newClients : m.newClients * 12, 1)} new clients · {Math.round(selected.cash ? selected.profit / selected.cash * 100 : 0)}% of cash kept</p></div>
      <div className="v3-money"><div><span>Cash in</span><strong>{money(selected.cash)}</strong></div><i>−</i><div><span>Costs + tax</span><strong>{money(selected.expenses + selected.tax)}</strong></div><i>=</i><div className="keep"><span>You keep</span><strong>{money(selected.profit)}</strong></div></div>
      <div className="v3-core forecast"><Slider label="Emails each day" value={s.emails} min={0} max={3000} step={10} onChange={v => set("emails", v)} /><Slider label="Outreach days" value={s.days} min={1} max={31} suffix=" days" onChange={v => set("days", v)} /><Slider label="Reply rate" value={s.reply} min={.1} max={30} step={.1} suffix="%" onChange={v => set("reply", v)} /><Slider label="Interested replies" value={s.positive} min={1} max={100} suffix="%" onChange={v => set("positive", v)} /><Slider label="Show rate" value={s.show} min={1} max={100} suffix="%" onChange={v => set("show", v)} /><Slider label="Close rate" value={s.close} min={1} max={100} suffix="%" onChange={v => set("close", v)} /></div>
      <div className="v3-chart"><div className="v3-chart-title"><span>12-month cash path</span><small><i /> cash <i /> profit</small></div><div className="v3-bars">{months.map(x => <div key={x.month}><i style={{ height: `${Math.max(3, x.cash / max * 100)}%` }} /><b style={{ height: `${Math.max(3, Math.max(0, x.profit) / max * 100)}%` }} /><small>{x.month}</small></div>)}</div></div>
      <div className="v3-cost-line"><span>Tools {money(selected.tools)}</span><span>Setup {money(selected.setup)}</span><span>Onboarding {money(selected.onboarding)}</span><span>Service {money(selected.service)}</span><span>Processing {money(selected.processing)}</span><span>Tax {money(selected.tax)}</span></div>
      <p className="v3-accounting">Annual plans arrive as cash upfront. {money(selected.recognized)} is the accounting view recognized as service is delivered.</p>
    </section>}

    <section className="v3-drawers"><Drawer title="Advanced assumptions">{advanced}</Drawer><Drawer title="Build the team" icon={<Users size={15} />}><p className="v3-drawer-copy">Add a closer, setter, or operations hire. Their monthly cost immediately changes the goal and forecast.</p><Slider label="New monthly payroll" value={s.teamCost} min={0} max={50000} step={500} prefix="$" onChange={v => set("teamCost", v)} /><div className="v3-team-answer"><Sparkles size={16} /> About {num(s.teamCost / Math.max(1, m.cashPerClient * (1 - rate(s.processing)) * (1 - rate(s.tax))), 1)} additional clients per month covers this team cost.</div></Drawer></section>
  </div></main>;
}
