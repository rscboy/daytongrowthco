"use client";

import { useState } from "react";
import { calculateBetterQuoteSavings } from "./better-quote-pricing";
import "./better-quote-savings-calculator.css";

function amount(value: string) { return Math.max(0, Number.parseFloat(value.replace(/[^0-9.]/g, "")) || 0); }
function money(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value); }

/** A light, standalone explainer for the homepage — intentionally not part of the quote funnel. */
export function BetterQuoteSavingsCalculator() {
  const [current, setCurrent] = useState("10000");
  const [alternative, setAlternative] = useState("7000");
  const result = calculateBetterQuoteSavings(amount(current), amount(alternative));
  return <section className="bq-savings-calculator" aria-labelledby="bq-savings-title"><div className="bq-savings-shell"><header><h2 id="bq-savings-title">See how the Better Quote fee works.</h2><p>Illustrative only. Enter two quote amounts to see the program fee and what you keep.</p></header><div className="bq-calculator-card"><div className="bq-calculator-inputs"><label>Current quote<div><span>$</span><input inputMode="decimal" value={current} onChange={(event) => setCurrent(event.target.value)} /></div></label><label>Comparable lower quote<div><span>$</span><input inputMode="decimal" value={alternative} onChange={(event) => setAlternative(event.target.value)} /></div></label></div><div className="bq-savings-results" aria-live="polite"><article><span>We save you</span><strong>{money(result.grossSavings)}</strong></article><article><span>Our fee</span><strong>{money(result.fee)}</strong></article><article><span>You keep</span><strong>{money(result.netSavings)}</strong></article></div><p className="bq-calculator-note">If we don’t save you money, you don’t pay. <a href="/quote/pricing">See the full fee schedule.</a></p></div></div></section>;
}
