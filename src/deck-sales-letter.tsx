"use client";

import Link from "next/link";
import { useState } from "react";
import { Phone } from "lucide-react";
import { BrandWordmark } from "@/src/brand-wordmark";
import "./deck-sales-letter.css";

type DeckSalesLetterProps = {
  eyebrow?: string;
  title: string;
  deckId: string;
  className?: string;
  legalBase?: string;
  media?: React.ReactNode;
  mediaLabel?: string;
  children: React.ReactNode;
};

function DeckNavigationHint() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return <button className="deck-sales-nudge" type="button" onClick={() => setDismissed(true)} aria-label="Presentation navigation hint: use the arrows in the presentation to advance slides">
    <span aria-hidden="true">›</span>
    <small>Next slide</small>
  </button>;
}

export function DeckSalesLetter({ eyebrow, title, deckId, className = "", legalBase = "", media, mediaLabel, children }: DeckSalesLetterProps) {
  const presentationUrl = `https://docs.google.com/presentation/d/${deckId}/embed?start=false&loop=false&delayms=3000`;
  return <main className={`deck-sales-shell ${className}`}>
    <header className="deck-sales-header"><a href="https://daytongrowth.co" className="deck-sales-brand" aria-label="DaytonGrowthCo home"><BrandWordmark onDarkGrowthOnly={className.includes("better-quote-dsl")} /></a><a className="deck-sales-phone" href="tel:+19373690829"><Phone aria-hidden="true" /><span>(937) 369-0829</span></a></header>
    <section className="deck-sales-intro">{eyebrow && <p>{eyebrow}</p>}<h1>{title.split("™").map((part, index, parts) => <span key={`${part}-${index}`}>{part}{index < parts.length - 1 && <sup className="deck-sales-trademark">™</sup>}</span>)}</h1></section>
    <section className={`deck-sales-frame ${media ? "deck-sales-frame-media" : ""}`} aria-label={mediaLabel || `${title} presentation`}>{media || <><iframe src={presentationUrl} title={`${title} presentation`} allowFullScreen /><DeckNavigationHint /></>}</section>
    <section className="deck-sales-next">{children}</section>
    <footer className="deck-sales-footer"><div><BrandWordmark onDarkGrowthOnly={className.includes("better-quote-dsl")} /></div><p>Copyright 2026, DaytonGrowthCo., All rights reserved. This site is not a part of the Facebook™ website or Facebook™ Inc. Additionally, this site is NOT endorsed by Facebook™ in any way. FACEBOOK™ is a trademark of FACEBOOK™, Inc.</p><nav><Link href={legalBase ? `${legalBase}#terms` : "/terms"}>Terms</Link><Link href={legalBase ? `${legalBase}#privacy` : "/privacy"}>Privacy</Link></nav></footer>
  </main>;
}
