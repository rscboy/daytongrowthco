"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { BetterQuotePricingSection } from "./better-quote-pricing-section";
import { migrationOwnershipPaybackYears, websiteMigrationCostGuarantee, websiteMigrationTiers } from "./website-migration-pricing";
import "./program-pricing-section.css";

type Program = "migration" | "quote";

function years(value: number | null) {
  if (value === null) return "—";
  if (value < 2) return "under 2 years";
  return `about ${Math.round(value)} years`;
}

export function ProgramPricingSection({ initialProgram = "migration" }: { initialProgram?: Program }) {
  const [active, setActive] = useState<Program>(initialProgram);
  const activePanelId = active === "migration" ? "migration-pricing-panel" : "quote-pricing-panel";
  return <section className="program-pricing" id="program-pricing" aria-labelledby="program-pricing-title">
    <div className="program-pricing-shell">
      <header className="program-pricing-intro"><h1 id="program-pricing-title">Pricing, made clear.</h1><p>Choose the program that fits what you need.</p></header>
      <div className="program-pricing-tabs" role="tablist" aria-label="Choose a program">
        <button id="migration-pricing-tab" type="button" role="tab" aria-controls="migration-pricing-panel" aria-selected={active === "migration"} tabIndex={active === "migration" ? 0 : -1} className={active === "migration" ? "is-active" : ""} onClick={() => setActive("migration")}>Website Migration</button>
        <button id="quote-pricing-tab" type="button" role="tab" aria-controls="quote-pricing-panel" aria-selected={active === "quote"} tabIndex={active === "quote" ? 0 : -1} className={active === "quote" ? "is-active" : ""} onClick={() => setActive("quote")}>Better Quote</button>
      </div>
      <p className="program-pricing-context" aria-live="polite">{active === "migration" ? "Move an existing site into an owned, domain-only setup." : "Send us an expensive written quote. We charge only when we find qualifying savings."}</p>
      {active === "migration" ? <MigrationPricingPanel /> : <BetterQuotePricingSection showCta={false} panelId={activePanelId} labelledBy="quote-pricing-tab" />}
      <footer className="program-pricing-cta"><div><h2>{active === "migration" ? "Ready to own your website?" : "Got a quote? Let’s shop it."}</h2><p>{active === "migration" ? "We’ll review the site, scope the move, and confirm the one-time price before work begins." : "Upload the estimate you have. A real person will review it and make the calls."}</p></div><a className="button button-primary" href={active === "migration" ? "/website/" : "/quote/start/"}>{active === "migration" ? "Start the Migration Assessment" : "Upload My Quote"} <ArrowRight size={16} aria-hidden="true" /></a></footer>
    </div>
  </section>;
}

function MigrationPricingPanel() {
  const comparisonCosts = [150, 300, 900];
  return <div className="migration-pricing-panel" id="migration-pricing-panel" role="tabpanel" aria-labelledby="migration-pricing-tab">
    <header><h2>A one-time move. A site you own.</h2><p>Your project price is fixed before work begins. After launch, the annual comparison is simple: your current platform costs versus your domain-only renewal.</p></header>
    <div className="migration-pricing-tiers">{websiteMigrationTiers.map((tier) => <article key={tier.name}><span>{tier.name}</span><strong>${tier.price.toLocaleString()} {"suffix" in tier ? <small>{tier.suffix}</small> : null}</strong><p>{tier.description}</p></article>)}</div>
    <div className="migration-pricing-ownership"><strong>One-time project. No ongoing CMS bill.</strong><span>You own the code and content after launch.</span></div>
    <section className="migration-cost-guarantee"><CheckCircle2 aria-hidden="true" /><div><h3>Annual cost guarantee</h3><p>{websiteMigrationCostGuarantee.promise}</p><p><strong>This compares annual costs only.</strong> The migration fee pays for the project; it is not compared to one year of your current CMS bill.</p><small>Typically: current domain + CMS/hosting versus a domain renewal of about $15/year. Scope and assumptions are confirmed in writing.</small></div></section>
    <section className="migration-pricing-roi"><div><h3>See your ownership math</h3><p>Enter your current annual platform cost and compare it with your domain-only renewal.</p><a href="/website-ownership-calculator/">Calculate website ownership ROI <ArrowRight size={15} aria-hidden="true" /></a></div><dl>{comparisonCosts.map((cost) => <div key={cost}><dt>${cost}/yr current cost</dt><dd>{years(migrationOwnershipPaybackYears(cost))}</dd></div>)}</dl></section>
    <section className="migration-pricing-faq"><h3>Migration pricing FAQ</h3><details><summary>Is there an upfront fee?</summary><p>The migration is a one-time fixed project fee, confirmed in writing before work begins. It is separate from the annual-cost comparison.</p></details><details><summary>What exactly does the Annual Cost Guarantee compare?</summary><p>It compares your current annual domain, CMS/platform, and hosting costs with the expected annual cost after migration — typically only your domain registration. It does not compare the one-time migration fee with one year of your current subscription.</p></details><details><summary>What if the annual ownership cost is not lower?</summary><p>Then the Website Migration Program™ fee is not due. The comparison, included costs, and assumptions are documented before work begins.</p></details><details><summary>What if my site needs more than one integration?</summary><p>Each booking, CRM, payment, or other integration is $500 and is added to your fixed scope before you approve it.</p></details><details><summary>Do I own the new site afterward?</summary><p>Yes. It’s a one-time payment; there’s no ongoing CMS fee to us. You pay your domain renewal and any optional third-party services you choose.</p></details></section>
  </div>;
}
