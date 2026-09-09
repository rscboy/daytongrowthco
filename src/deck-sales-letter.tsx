"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

function PresentationEmbed({ url, title }: { url: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (loaded) return;
    const timer = window.setTimeout(() => setSlow(true), 8000);
    return () => window.clearTimeout(timer);
  }, [loaded]);
  return <div className="deck-embed-shell" data-loaded={loaded}>
    {!loaded && <div className="deck-embed-preview"><span>DaytonGrowthCo. / Program overview</span><h2>{title}</h2><p role="status">{slow ? "The presentation is taking a little longer to load." : "Preparing your presentation…"}</p><a href={url} target="_blank" rel="noopener noreferrer">Open presentation in a new tab</a></div>}
    <iframe src={url} title={`${title} presentation`} allowFullScreen onLoad={() => setLoaded(true)} onError={() => setSlow(true)} />
    <p className="deck-embed-hint">Use the presentation arrows to move between slides.</p>
  </div>;
}

export function DeckSalesLetter({ eyebrow, title, deckId, className = "", legalBase = "", media, mediaLabel, children }: DeckSalesLetterProps) {
  const presentationUrl = `https://docs.google.com/presentation/d/${deckId}/embed?start=false&loop=false&delayms=3000`;
  return <main className={`deck-sales-shell ${className}`}>
    <header className="deck-sales-header"><Link href="/" className="deck-sales-brand" aria-label="DaytonGrowthCo home"><BrandWordmark onDark /></Link><a className="deck-sales-phone" href="tel:+19373690829"><Phone aria-hidden="true" /><span>(937) 369-0829</span></a></header>
    <section className="deck-sales-intro">{eyebrow && <p>{eyebrow}</p>}<h1>{title.split("™").map((part, index, parts) => <span key={`${part}-${index}`}>{part}{index < parts.length - 1 && <sup className="deck-sales-trademark">™</sup>}</span>)}</h1></section>
    <section className={`deck-sales-frame ${media ? "deck-sales-frame-media" : ""}`} aria-label={mediaLabel || `${title} presentation`}>{media || <PresentationEmbed url={presentationUrl} title={title} />}</section>
    <section className="deck-sales-next">{children}</section>
    <footer className="deck-sales-footer"><div><BrandWordmark onDark /></div><p>Copyright 2026, DaytonGrowthCo., All rights reserved. This site is not a part of the Facebook™ website or Facebook™ Inc. Additionally, this site is NOT endorsed by Facebook™ in any way. FACEBOOK™ is a trademark of FACEBOOK™, Inc.</p><nav><Link href={legalBase ? `${legalBase}#terms` : "/terms"}>Terms</Link><Link href={legalBase ? `${legalBase}#privacy` : "/privacy"}>Privacy</Link></nav></footer>
  </main>;
}
