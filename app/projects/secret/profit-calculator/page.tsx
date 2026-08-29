"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Download, Info, Mail, Phone, Printer, RotateCcw, WalletCards } from "lucide-react";
import "./calculator.css";
import "./financial-summary.css";
import "./cost-visibility.css";

type Mode = "goal" | "forecast";
type PeriodView = "monthly" | "annual";
type Scenario = "conservative" | "expected" | "optimistic";
type State = {
  goalPeriod: PeriodView; targetProfit: number; annualMix: number; monthlyMix: number;
  emailsPerDay: number; daysPerMonth: number; delivery: number; reply: number; positive: number; booking: number; show: number; close: number;
  callsOn: boolean; dialsPerDay: number; connect: number; qualified: number; callBooking: number; callShow: number; callClose: number;
  monthlyCosts: number; annualCosts: number; onboarding: number; service: number; processing: number; tax: number; months: number;
};

const DEFAULTS: State = {
  goalPeriod: "annual", targetProfit: 120000, annualMix: 60, monthlyMix: 40, emailsPerDay: 150, daysPerMonth: 20,
  delivery: 96, reply: 4.5, positive: 35, booking: 55, show: 78, close: 32, callsOn: false,
  dialsPerDay: 0, connect: 18, qualified: 45, callBooking: 35, callShow: 72, callClose: 28,
  monthlyCosts: 245.45, annualCosts: 187.74, onboarding: 35, service: 42, processing: 2.9, tax: 22, months: 12,
};

const money = (value: number, decimals = 0) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(Number.isFinite(value) ? value : 0);
const number = (value: number, decimals = 0) => new Intl.NumberFormat("en-US", { maximumFractionDigits: decimals }).format(Number.isFinite(value) ? Number(value.toFixed(decimals)) : 0);
const rate = (value: number) => Math.max(0.001, value / 100);
const percent = (value: number) => `${number(value * 100, 1)}%`;

function calculate(state: State, scenario: Scenario) {
  const scenarioMultiplier = scenario === "conservative" ? 0.72 : scenario === "optimistic" ? 1.28 : 1;
  const delivery = Math.min(100, state.delivery * (scenario === "conservative" ? 0.98 : scenario === "optimistic" ? 1.01 : 1));
  const reply = state.reply * scenarioMultiplier;
  const positive = Math.min(100, state.positive * scenarioMultiplier);
  const booking = Math.min(100, state.booking * scenarioMultiplier);
  const show = Math.min(100, state.show * scenarioMultiplier);
  const close = Math.min(100, state.close * scenarioMultiplier);
  const mixTotal = Math.max(1, state.annualMix + state.monthlyMix);
  const annualShare = Math.max(0, state.annualMix) / mixTotal;
  const monthlyShare = 1 - annualShare;
  const emailClientRate = rate(delivery) * rate(reply) * rate(positive) * rate(booking) * rate(show) * rate(close);
  const callClientRate = rate(state.connect) * rate(state.qualified) * rate(state.callBooking) * rate(state.callShow) * rate(state.callClose);
  const emailClients = state.emailsPerDay * state.daysPerMonth * emailClientRate;
  const callClients = state.callsOn ? state.dialsPerDay * state.daysPerMonth * callClientRate : 0;
  const newClients = emailClients + callClients;
  const annualClients = newClients * annualShare;
  const monthlyClients = newClients * monthlyShare;
  const cashPerNewClient = annualShare * 2500 + monthlyShare * 250;
  const cashContribution = cashPerNewClient - state.onboarding - state.service - cashPerNewClient * rate(state.processing);
  const afterTaxCashContribution = Math.max(1, cashContribution * (1 - rate(state.tax)));
  const targetMonthly = state.goalPeriod === "annual" ? state.targetProfit / 12 : state.targetProfit;
  const monthlyFixedCosts = state.monthlyCosts + state.annualCosts / 12;
  const goalClients = Math.max(0, targetMonthly + monthlyFixedCosts * (1 - rate(state.tax))) / afterTaxCashContribution;
  return { annualShare, monthlyShare, emailClientRate, callClientRate, emailClients, callClients, newClients, annualClients, monthlyClients, cashPerNewClient, targetMonthly, goalClients, delivery, reply, positive, booking, show, close };
}

function cashMonth(state: State, model: ReturnType<typeof calculate>, monthIndex: number) {
  const activeMonths = monthIndex + 1;
  const annualCash = model.annualClients * 2500;
  const monthlyCash = model.monthlyClients * activeMonths * 250;
  const cashCollected = annualCash + monthlyCash;
  const recognizedAnnual = model.annualClients * activeMonths * (2500 / 12);
  const recognizedMonthly = monthlyCash;
  const recognizedRevenue = recognizedAnnual + recognizedMonthly;
  const operating = state.monthlyCosts;
  const onboarding = model.newClients * state.onboarding;
  const service = model.newClients * activeMonths * state.service;
  const processing = cashCollected * rate(state.processing);
  const annualAndSetup = monthIndex === 0 ? state.annualCosts : 0;
  const expensesBeforeTax = operating + annualAndSetup + onboarding + service + processing;
  const cashBeforeTax = cashCollected - expensesBeforeTax;
  const estimatedTax = Math.max(0, cashBeforeTax) * rate(state.tax);
  const cashProfit = cashBeforeTax - estimatedTax;
  return { month: activeMonths, clients: model.newClients, activeClients: model.newClients * activeMonths, cashCollected, recognizedRevenue, operating, annualAndSetup, onboarding, service, processing, expensesBeforeTax, estimatedTax, cashProfit, cashMargin: cashCollected ? cashProfit / cashCollected : 0 };
}

function reverseFunnel(state: State, model: ReturnType<typeof calculate>) {
  const held = model.goalClients / rate(model.close);
  const booked = held / rate(model.show);
  const positive = booked / rate(model.booking);
  const replies = positive / rate(model.positive);
  const delivered = replies / rate(model.reply);
  const emails = delivered / rate(model.delivery);
  const dials = state.callsOn ? model.goalClients / model.callClientRate : 0;
  return { held, booked, positive, replies, emails, dials, appointmentsPerDay: booked / Math.max(1, state.daysPerMonth) };
}

function sumPeriods(periods: ReturnType<typeof cashMonth>[]) {
  return periods.reduce((total, item) => ({ ...total, cashCollected: total.cashCollected + item.cashCollected, recognizedRevenue: total.recognizedRevenue + item.recognizedRevenue, operating: total.operating + item.operating, annualAndSetup: total.annualAndSetup + item.annualAndSetup, onboarding: total.onboarding + item.onboarding, service: total.service + item.service, processing: total.processing + item.processing, expensesBeforeTax: total.expensesBeforeTax + item.expensesBeforeTax, estimatedTax: total.estimatedTax + item.estimatedTax, cashProfit: total.cashProfit + item.cashProfit }), { cashCollected: 0, recognizedRevenue: 0, operating: 0, annualAndSetup: 0, onboarding: 0, service: 0, processing: 0, expensesBeforeTax: 0, estimatedTax: 0, cashProfit: 0 });
}

function Field({ label, value, min, max, step = 1, prefix, suffix, help, onChange }: { label: string; value: number; min: number; max: number; step?: number; prefix?: string; suffix?: string; help?: string; onChange: (value: number) => void }) {
  const id = `simple-calc-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return <div className="simple-field"><div className="field-label"><label htmlFor={id}>{label}</label>{help && <span title={help}><Info size={13} /></span>}</div><div className="simple-number"><span>{prefix}</span><input id={id} type="number" min={min} max={max} step={step} value={value} onChange={event => onChange(Number(event.target.value) || 0)} /><span>{suffix}</span></div><input aria-label={`${label} slider`} className="simple-range" type="range" min={min} max={max} step={step} value={Math.min(max, Math.max(min, value))} onChange={event => onChange(Number(event.target.value))} /></div>;
}

function Card({ title, children }: { title: string; children: ReactNode }) { return <section className="simple-card"><h2>{title}</h2>{children}</section>; }
function Result({ label, value, note, featured = false }: { label: string; value: string; note: string; featured?: boolean }) { return <div className={`simple-result ${featured ? "featured" : ""}`}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>; }

export default function ProfitCalculatorPage() {
  const [mode, setMode] = useState<Mode>("goal");
  const [forecastPeriod, setForecastPeriod] = useState<PeriodView>("monthly");
  const [scenario, setScenario] = useState<Scenario>("expected");
  const [state, setState] = useState<State>(DEFAULTS);
  useEffect(() => { try { const saved = localStorage.getItem("dgc-profit-calculator"); if (saved) { const restored = JSON.parse(saved) as Partial<State>; setState({ ...DEFAULTS, ...restored, monthlyCosts: restored.annualCosts === undefined && restored.monthlyCosts === 333.19 ? DEFAULTS.monthlyCosts : restored.monthlyCosts ?? DEFAULTS.monthlyCosts }); } } catch {} }, []);
  useEffect(() => { try { localStorage.setItem("dgc-profit-calculator", JSON.stringify(state)); } catch {} }, [state]);
  useEffect(() => { document.documentElement.style.setProperty("--dgc-annual-setup-cost", JSON.stringify(money(state.annualCosts))); }, [state.annualCosts]);
  const update = <K extends keyof State>(key: K, value: State[K]) => setState(current => ({ ...current, [key]: value }));
  const model = useMemo(() => calculate(state, scenario), [state, scenario]);
  const funnel = useMemo(() => reverseFunnel(state, model), [state, model]);
  const months = useMemo(() => Array.from({ length: state.months }, (_, index) => cashMonth(state, model, index)), [state, model]);
  const monthly = months[0];
  const annual = useMemo(() => sumPeriods(months), [months]);
  const selected = forecastPeriod === "monthly" ? monthly : annual;
  const maxChart = Math.max(1, ...months.map(item => Math.max(item.cashCollected, item.cashProfit)));
  const downloadCsv = () => { const rows = [["Month", "New clients", "Cash collected", "Recognized revenue", "Monthly operating costs", "Annual and setup costs", "Onboarding", "Service", "Processing", "Estimated tax", "Cash profit"], ...months.map(item => [item.month, item.clients.toFixed(2), item.cashCollected.toFixed(2), item.recognizedRevenue.toFixed(2), item.operating.toFixed(2), item.annualAndSetup.toFixed(2), item.onboarding.toFixed(2), item.service.toFixed(2), item.processing.toFixed(2), item.estimatedTax.toFixed(2), item.cashProfit.toFixed(2)])]; const blob = new Blob([rows.map(row => row.join(",")).join("\n")], { type: "text/csv" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "daytongrowthco-profit-forecast.csv"; link.click(); URL.revokeObjectURL(link.href); };
  const reset = () => { setState(DEFAULTS); setMode("goal"); setScenario("expected"); setForecastPeriod("monthly"); };

  const costs = <details className="simple-disclosure"><summary>Costs & pricing assumptions <ChevronDown size={15} /></summary><div className="simple-grid"><Field label="Annual plan share" value={state.annualMix} min={0} max={100} suffix="%" onChange={value => update("annualMix", value)} /><Field label="Monthly plan share" value={state.monthlyMix} min={0} max={100} suffix="%" onChange={value => update("monthlyMix", value)} /><Field label="Monthly operating costs" value={state.monthlyCosts} min={0} max={5000} step={10} prefix="$" help="Recurring monthly costs: Mailforge $180 and PlusVibe $65.45 by default." onChange={value => update("monthlyCosts", value)} /><Field label="Annual & setup costs" value={state.annualCosts} min={0} max={5000} step={5} prefix="$" help="Costs charged once in Month 1 and once in the first-year total." onChange={value => update("annualCosts", value)} /><Field label="Onboarding cost / client" value={state.onboarding} min={0} max={1000} step={5} prefix="$" onChange={value => update("onboarding", value)} /><Field label="Service cost / client / month" value={state.service} min={0} max={1000} step={5} prefix="$" onChange={value => update("service", value)} /><Field label="Payment processing" value={state.processing} min={0} max={10} step={0.1} suffix="%" onChange={value => update("processing", value)} /><Field label="Taxes" value={state.tax} min={0} max={50} suffix="%" onChange={value => update("tax", value)} /></div><p className="disclosure-note">Defaults: monthly — Mailforge $180 + PlusVibe $65.45; annual & setup — domains $87.74 + Mailforge connection $100. Annual & setup costs are included once in Month 1 and once in the first-year view.</p></details>;

  return <main className="simple-calculator"><header className="simple-header"><a className="simple-brand" href="/projects/secret-projects"><span className="simple-mark">DG</span><span><strong>DaytonGrowthCo.</strong><small>HVAC Review Growth Program</small></span></a><details className="more-options"><summary>More options <ChevronDown size={14} /></summary><div className="options-menu"><button onClick={downloadCsv}><Download size={14} /> Export CSV</button><button onClick={() => window.print()}><Printer size={14} /> Print summary</button><button onClick={reset}><RotateCcw size={14} /> Reset calculator</button></div></details></header>
    <div className="simple-wrap"><section className="simple-intro"><span className="simple-kicker">Private planning tool</span><h1>What will your<br /><em>outreach make?</em></h1><p>Plan the work you need to do, or see exactly where the money goes.</p></section>
      <nav className="simple-tabs" aria-label="Calculator mode"><button className={mode === "goal" ? "active" : ""} onClick={() => setMode("goal")}><span>01</span><strong>What do I need to do?</strong><small>Start with a profit goal</small></button><button className={mode === "forecast" ? "active" : ""} onClick={() => setMode("forecast")}><span>02</span><strong>What will this make?</strong><small>Start with your outreach</small></button></nav>
      <div className="scenario-line"><span>Planning with</span>{(["conservative", "expected", "optimistic"] as Scenario[]).map(option => <button key={option} className={scenario === option ? "selected" : ""} onClick={() => setScenario(option)}>{option[0].toUpperCase() + option.slice(1)}</button>)}<span className="scenario-help">{scenario === "expected" ? "Your current assumptions" : scenario === "conservative" ? "Conversion rates are reduced" : "Conversion rates are increased"}</span></div>
      {mode === "goal" ? <div className="simple-layout"><div className="simple-inputs"><Card title="Start with your profit goal"><p className="card-intro">How much cash profit do you want to make after expenses and estimated tax?</p><div className="period-switch"><button className={state.goalPeriod === "annual" ? "selected" : ""} onClick={() => update("goalPeriod", "annual")}>Per year</button><button className={state.goalPeriod === "monthly" ? "selected" : ""} onClick={() => update("goalPeriod", "monthly")}>Per month</button></div><Field label="Profit target" value={state.targetProfit} min={0} max={1000000} step={5000} prefix="$" suffix={state.goalPeriod === "annual" ? "/ year" : "/ month"} onChange={value => update("targetProfit", value)} /></Card><Card title="A few assumptions"><p className="card-intro">These are the levers that change the answer.</p><div className="simple-grid"><Field label="Annual plan share" value={state.annualMix} min={0} max={100} suffix="%" onChange={value => update("annualMix", value)} /><Field label="Monthly plan share" value={state.monthlyMix} min={0} max={100} suffix="%" onChange={value => update("monthlyMix", value)} /><Field label="Positive reply rate" value={state.positive} min={1} max={100} suffix="%" onChange={value => update("positive", value)} /><Field label="Appointment show rate" value={state.show} min={1} max={100} suffix="%" onChange={value => update("show", value)} /><Field label="Close rate" value={state.close} min={1} max={100} suffix="%" onChange={value => update("close", value)} /><Field label="Emails per day" value={state.emailsPerDay} min={1} max={2000} step={10} suffix="emails" onChange={value => update("emailsPerDay", value)} /><Field label="Outreach days / month" value={state.daysPerMonth} min={1} max={31} suffix="days" onChange={value => update("daysPerMonth", value)} /></div></Card>{costs}</div><div className="simple-output"><div className="output-heading"><span className="simple-kicker">Your action plan</span><h2>To make {money(model.targetMonthly)} cash profit per month</h2><p>Based on the money collected, expenses, and estimated tax.</p></div><div className="result-grid"><Result label="Clients needed" value={number(model.goalClients, 1)} note={`${number(model.goalClients * 12, 1)} clients / year`} featured /><Result label="Appointments held" value={number(funnel.held, 1)} note={`${number(funnel.booked, 1)} booked / month`} /><Result label="Positive replies" value={number(funnel.positive, 1)} note={`${number(funnel.replies, 1)} total replies`} /><Result label="Emails to send" value={number(funnel.emails, 0)} note={`${number(funnel.emails / Math.max(1, state.daysPerMonth), 0)} per workday`} featured /></div><div className="plain-callout">That means about <strong>{number(funnel.appointmentsPerDay, 1)} appointments per working day</strong> and {number(funnel.emails / Math.max(1, state.daysPerMonth), 0)} emails per day.</div><div className="simple-funnel"><span className="simple-kicker">The path, backwards</span><div className="funnel-step"><Mail size={17} /><div><strong>{number(funnel.emails, 0)} emails</strong><small>sent each month</small></div></div><div className="funnel-line" /><div className="funnel-step"><div><strong>{number(funnel.positive, 1)} positive replies</strong><small>from {number(funnel.replies, 1)} replies</small></div></div><div className="funnel-line" /><div className="funnel-step"><div><strong>{number(funnel.held, 1)} appointments held</strong><small>{number(funnel.booked, 1)} appointments booked</small></div></div><div className="funnel-line" /><div className="funnel-step final"><div><strong>{number(model.goalClients, 1)} clients</strong><small>closed each month</small></div></div></div><details className="simple-disclosure call-disclosure"><summary><Phone size={15} /> Add cold calls <ChevronDown size={15} /></summary><div className="call-summary"><p>To replace the email volume, you would need about <strong>{number(funnel.dials, 0)} dials per month</strong> — {number(funnel.dials / Math.max(1, state.daysPerMonth), 0)} per working day.</p><div className="simple-grid"><Field label="Connect rate" value={state.connect} min={1} max={100} suffix="%" onChange={value => update("connect", value)} /><Field label="Qualified conversation rate" value={state.qualified} min={1} max={100} suffix="%" onChange={value => update("qualified", value)} /><Field label="Booking rate" value={state.callBooking} min={1} max={100} suffix="%" onChange={value => update("callBooking", value)} /><Field label="Call show rate" value={state.callShow} min={1} max={100} suffix="%" onChange={value => update("callShow", value)} /><Field label="Call close rate" value={state.callClose} min={1} max={100} suffix="%" onChange={value => update("callClose", value)} /></div></div></details></div></div> : <div className="simple-layout forecast-layout"><div className="simple-inputs"><Card title="Start with your outreach"><p className="card-intro">What are you actually sending and how well is it converting?</p><div className="simple-grid"><Field label="Emails per day" value={state.emailsPerDay} min={0} max={2000} step={10} suffix="emails" onChange={value => update("emailsPerDay", value)} /><Field label="Outreach days / month" value={state.daysPerMonth} min={1} max={31} suffix="days" onChange={value => update("daysPerMonth", value)} /><Field label="Delivery rate" value={state.delivery} min={50} max={100} step={0.5} suffix="%" onChange={value => update("delivery", value)} /><Field label="Total reply rate" value={state.reply} min={0.1} max={30} step={0.1} suffix="%" onChange={value => update("reply", value)} /><Field label="Positive reply rate" value={state.positive} min={1} max={100} suffix="%" onChange={value => update("positive", value)} /><Field label="Appointment booking rate" value={state.booking} min={1} max={100} suffix="%" onChange={value => update("booking", value)} /><Field label="Appointment show rate" value={state.show} min={1} max={100} suffix="%" onChange={value => update("show", value)} /><Field label="Close rate" value={state.close} min={1} max={100} suffix="%" onChange={value => update("close", value)} /></div></Card>{costs}<details className="simple-disclosure"><summary><Phone size={15} /> Add cold calls <ChevronDown size={15} /></summary><div className="simple-grid"><Field label="Dials per day" value={state.dialsPerDay} min={0} max={500} step={5} suffix="dials" onChange={value => { update("dialsPerDay", value); update("callsOn", value > 0); }} /><Field label="Connect rate" value={state.connect} min={1} max={100} suffix="%" onChange={value => update("connect", value)} /><Field label="Qualified conversation rate" value={state.qualified} min={1} max={100} suffix="%" onChange={value => update("qualified", value)} /><Field label="Booking rate" value={state.callBooking} min={1} max={100} suffix="%" onChange={value => update("callBooking", value)} /><Field label="Call show rate" value={state.callShow} min={1} max={100} suffix="%" onChange={value => update("callShow", value)} /><Field label="Call close rate" value={state.callClose} min={1} max={100} suffix="%" onChange={value => update("callClose", value)} /></div><p className="disclosure-note">Cold calls join the forecast when you enter a dial volume above zero.</p></details></div><div className="simple-output financial-output"><div className="forecast-topline"><div><span className="simple-kicker">Your cash forecast</span><h2>See where the money goes</h2><p>Cash profit uses actual cash collected, actual expenses, and estimated tax.</p></div><div className="period-switch financial-period"><button className={forecastPeriod === "monthly" ? "selected" : ""} onClick={() => setForecastPeriod("monthly")}>Month 1</button><button className={forecastPeriod === "annual" ? "selected" : ""} onClick={() => setForecastPeriod("annual")}>First year</button></div></div><div className="cash-hero"><div><span>{forecastPeriod === "monthly" ? "Cash collected in month 1" : "Cash collected in the first year"}</span><strong>{money(selected.cashCollected)}</strong><small>{number(forecastPeriod === "monthly" ? model.newClients : model.newClients * 12, 1)} new clients {forecastPeriod === "monthly" ? "this month" : "across the year"}</small></div><WalletCards size={32} /></div><div className="money-flow"><div><span>Cash collected</span><strong>{money(selected.cashCollected)}</strong></div><b>−</b><div><span>Expenses & tax</span><strong>{money(selected.expensesBeforeTax + selected.estimatedTax)}</strong></div><b>=</b><div className="cash-profit"><span>Cash profit</span><strong>{money(selected.cashProfit)}</strong><small>{percent(selected.cashCollected ? selected.cashProfit / selected.cashCollected : 0)} of cash collected</small></div></div><div className="expense-breakdown"><div className="breakdown-head"><div><span className="simple-kicker">Where the cash goes</span><h3>Expense breakdown</h3></div><span>{forecastPeriod === "monthly" ? "Month 1" : "First year"}</span></div><div className="breakdown-list"><div><span>Operating tools</span><strong>{money(selected.operating)}</strong></div><div><span>Client onboarding</span><strong>{money(selected.onboarding)}</strong></div><div><span>Client service</span><strong>{money(selected.service)}</strong></div><div><span>Payment processing</span><strong>{money(selected.processing)}</strong></div><div><span>Estimated tax</span><strong>{money(selected.estimatedTax)}</strong></div></div></div><div className="accounting-note"><Info size={16} /><div><strong>Cash profit is the headline number.</strong><span>Recognized revenue is an accounting view: {money(selected.recognizedRevenue)} {forecastPeriod === "monthly" ? "in month 1" : "over the first year"}. Annual plans are paid upfront, then recognized gradually as service is delivered.</span></div></div><div className="forecast-chart"><div className="chart-title"><div><span className="simple-kicker">12-month cash view</span><h3>Cash collected and cash profit</h3></div><span><i className="revenue-dot" /> Cash collected <i className="profit-dot" /> Cash profit</span></div><div className="chart-bars">{months.map(item => <div className="chart-column" key={item.month}><div className="bar revenue-bar" style={{ height: `${Math.max(4, item.cashCollected / maxChart * 100)}%` }} title={`${money(item.cashCollected)} collected`} /><div className="bar profit-bar" style={{ height: `${Math.max(3, Math.max(0, item.cashProfit) / maxChart * 100)}%` }} title={`${money(item.cashProfit)} cash profit`} /><small>M{item.month}</small></div>)}</div></div></div></div>}
      <footer className="simple-footer">Private DaytonGrowthCo planning tool · Estimates are directional and depend on list quality, deliverability, offer fit, and sales execution.</footer>
    </div></main>;
}
