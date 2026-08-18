"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { betterQuotePricing, calculateBetterQuoteSavings } from "./better-quote-pricing";
import "./better-quote-pricing-section.css";

const examples = [0, 250, 500, 1000, 2500, 3000, 5000, 7500, 10000];

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

export function BetterQuotePricingSection({ showCta = true, panelId, labelledBy }: { showCta?: boolean; panelId?: string; labelledBy?: string }) {
  const tiers = [
    { range: "No savings", fee: "$0", copy: "No fee." },
    { range: "Under $199 saved", fee: "$0", copy: "No fee." },
    { range: "$199–$494.99 saved", fee: "$99", copy: "You keep at least $100." },
    { range: "$495–$2,500 saved", fee: "20%", copy: "Of verified savings." },
    { range: "Above $2,500 saved", fee: "$500 + 10%", copy: "10% applies only above $2,500." },
  ];

  return <section className="bq-pricing" id={panelId || "pricing"} role={panelId ? "tabpanel" : undefined} aria-labelledby={labelledBy || "bq-pricing-title"}>
    <div className="bq-pricing-shell">
      <header className="bq-pricing-intro">
        <h2 id={labelledBy ? undefined : "bq-pricing-title"}>No savings. No fee.</h2>
        <p>No upfront search fee. If we find qualifying savings, you see the fee before you pay.</p>
        <div className="bq-pricing-promise"><CheckCircle2 aria-hidden="true" /><div><strong>You save first. We get paid second.</strong><span>Our fee is tied to verified savings from a comparable quote.</span></div></div>
        <a className="bq-pricing-top-cta button button-primary" href="/quote/start/">Upload My Quote <ArrowRight size={16} aria-hidden="true" /></a>
      </header>

      <section className="bq-pricing-schedule" aria-labelledby="bq-pricing-schedule-title">
        <div className="bq-pricing-section-heading"><div><h3 id="bq-pricing-schedule-title">Your fee follows the savings.</h3><p>Simple, progressive pricing. Not a contractor commission.</p></div></div>
        <div className="bq-pricing-tiers" aria-label="Success fee schedule">
          {tiers.map((tier, index) => <article key={tier.range} className={index === 4 ? "is-progressive" : ""}><span>{tier.range}</span><strong>{tier.fee}</strong><p>{tier.copy}</p></article>)}
        </div>
        <p className="bq-pricing-progressive-note"><strong>Above $2,500 is progressive:</strong> $500 for the first $2,500 saved, then 10% of each additional dollar.</p>
      </section>

      <div className="bq-pricing-table-wrap">
        <div className="bq-pricing-table-heading"><div><h3>Examples, not estimates.</h3><p>Illustrations of the fee calculation — not a promise of actual savings.</p></div><span>Version {betterQuotePricing.version}</span></div>
        <div className="bq-pricing-table-scroll"><table><thead><tr><th>We save you</th><th>Our fee</th><th>You keep</th></tr></thead><tbody>{examples.map((saved) => { const result = calculateBetterQuoteSavings(saved, 0); return <tr key={saved}><td>{money(result.grossSavings)}</td><td>{money(result.fee)}</td><td>{money(result.netSavings)}</td></tr>; })}</tbody></table></div>
      </div>

      <div className="bq-pricing-details">
        <article><h3>What counts as savings?</h3><p>The difference between your current quote and a qualifying comparable quote, subject to the Terms.</p><a href="/terms/">Read the terms <ArrowRight size={15} aria-hidden="true" /></a></article>
        <article><h3>When do I pay?</h3><ol><li>Send your quote — nothing is due.</li><li>We search and show the savings and fee.</li><li>Pay the fee, then receive provider details.</li></ol></article>
      </div>

      <details className="bq-pricing-policy"><summary>Refund policy</summary><p>If a delivered comparable quote is canceled before you can act, or its comparable base price increases by 20% or more within 24 hours, we refund the savings fee. Provider costs and scope changes are not covered. <a href="/terms/#better-quote-program-refund-policy">Read the full policy.</a></p></details>

      <section className="bq-pricing-faq" aria-labelledby="bq-pricing-faq-title"><h3 id="bq-pricing-faq-title">Questions</h3><div>
        <details><summary>Is there an upfront fee?</summary><p>No. There is no upfront search fee.</p></details>
        <details><summary>What if you don’t find a lower quote?</summary><p>You pay $0.</p></details>
        <details><summary>What if the savings are small?</summary><p>If gross savings are below $199, the fee is $0.</p></details>
        <details><summary>Why is there a $99 minimum?</summary><p>It applies only when savings are enough for you to retain at least $100.</p></details>
        <details><summary>Does 10% apply to all savings above $2,500?</summary><p>No. The first $2,500 is charged at 20%; only savings above that are charged at 10%.</p></details>
        <details><summary>Do I pay the contractor through you?</summary><p>No. You generally contract and pay the provider directly. Our fee is separate.</p></details>
      </div></section>

      {showCta ? <footer className="bq-pricing-cta"><div><h3>Got a quote? Let’s shop it.</h3><p>Upload the estimate you have. A real person will review it and make the calls.</p></div><a className="button button-primary" href="/quote/start/">Upload My Quote <ArrowRight size={16} aria-hidden="true" /></a></footer> : null}
    </div>
  </section>;
}
