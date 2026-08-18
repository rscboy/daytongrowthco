"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import styles from "./prototype-homepage-hero.module.css";

const principles = [
  ["Fix the expensive bottleneck first.", "Start where time, errors, or lost work cost the most."],
  ["Use existing software when it fits.", "Set up the tools that already work. Build only what is unique."],
  ["Build custom where it creates an advantage.", "Reserve custom work for the parts of your process that are genuinely different."],
  ["Measure what improves.", "Success is less time and fewer errors—not more features."],
] as const;

type Variant = { name: string; render: () => ReactNode };

function SiteFrame({ children, direction }: { children: ReactNode; direction: "cascade" | "focus" | "trace" }) {
  return (
    <main className={`${styles.page} ${styles[direction]}`}>
      <header className={styles.header}>
        <a href="/" className={styles.wordmark}>DaytonGrowthCo<span>.</span></a>
        <span className={styles.context}>HOW IT WORKS · PRINCIPLES</span>
        <a href="/book-call" className={styles.headerCta}>Book a call <span aria-hidden="true">↗</span></a>
      </header>
      <section className={styles.section} aria-labelledby={`${direction}-title`}>
        <div className={styles.film} aria-hidden="true" />
        <div className={styles.sectionInner}>{children}</div>
      </section>
      <section className={styles.after} aria-label="Following section preview">
        <span>THE NEXT STEP</span><strong>Recommend the smallest useful fix.</strong>
      </section>
    </main>
  );
}

function Heading({ id }: { id: string }) {
  return (
    <div className={styles.heading}>
      <p className={styles.eyebrow}>A PRACTICAL WAY TO BUILD</p>
      <h2 id={id}>Find the bottleneck.<br /><em>Replace it. Improve it.</em></h2>
    </div>
  );
}

function PrincipleCards({ active = -1, onSelect, className = "" }: { active?: number; onSelect?: (index: number) => void; className?: string }) {
  return (
    <ol className={`${styles.cards} ${className}`}>
      {principles.map(([title, text], index) => (
        <li key={title} className={`${index === 0 ? styles.first : ""} ${index === active ? styles.active : ""}`}>
          <button type="button" onClick={() => onSelect?.(index)} aria-pressed={onSelect ? index === active : undefined}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><strong>{title}</strong><p>{text}</p></div>
          </button>
        </li>
      ))}
    </ol>
  );
}

function Cascade() {
  return (
    <SiteFrame direction="cascade">
      <Heading id="cascade-title" />
      <PrincipleCards className={styles.cascadeCards} />
    </SiteFrame>
  );
}

function ReadingFocus() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % principles.length), 2600);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <SiteFrame direction="focus">
      <Heading id="focus-title" />
      <p className={styles.instruction}>Hover or select a principle to follow the reasoning.</p>
      <PrincipleCards active={active} onSelect={setActive} className={styles.focusCards} />
    </SiteFrame>
  );
}

function GuidedTrace() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % principles.length), 2100);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <SiteFrame direction="trace">
      <Heading id="trace-title" />
      <div className={styles.traceIntro}><span>THE BUILDING LOGIC</span><p>Each decision earns the next one.</p></div>
      <PrincipleCards active={active} onSelect={setActive} className={styles.traceCards} />
      <div className={styles.traceLine} aria-hidden="true"><i style={{ width: `${(active / (principles.length - 1)) * 100}%` }} /></div>
    </SiteFrame>
  );
}

export default function PrototypeHomepageHero() {
  const variants = useMemo<Variant[]>(() => [
    { name: "Cascade", render: () => <Cascade /> },
    { name: "Reading Focus", render: () => <ReadingFocus /> },
    { name: "Guided Trace", render: () => <GuidedTrace /> },
  ], []);
  const [current, setCurrent] = useState(0);
  const [instance, setInstance] = useState(0);
  const picker = useRef<HTMLElement>(null);
  const highlight = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const setActive = (next: number) => {
    if (next < 0 || next >= variants.length) return;
    setCurrent(next);
    const url = new URL(window.location.href);
    url.searchParams.set("v", String(next + 1));
    window.history.replaceState(null, "", url);
  };

  const moveHighlight = () => {
    const item = itemRefs.current[current];
    if (!item || !highlight.current) return;
    highlight.current.style.width = `${item.offsetWidth}px`;
    highlight.current.style.transform = `translateX(${item.offsetLeft}px)`;
  };

  useLayoutEffect(() => { moveHighlight(); }, [current]);

  useEffect(() => {
    const selected = Number(new URLSearchParams(window.location.search).get("v"));
    if (selected >= 1 && selected <= variants.length) setCurrent(selected - 1);
    const onResize = () => moveHighlight();
    window.addEventListener("resize", onResize);
    requestAnimationFrame(() => requestAnimationFrame(() => picker.current?.setAttribute("data-ready", "")));
    return () => window.removeEventListener("resize", onResize);
  }, [variants.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable || event.metaKey || event.ctrlKey || event.altKey) return;
      const number = Number(event.key);
      if (number >= 1 && number <= variants.length) setActive(number - 1);
      else if (event.key === "ArrowRight") setActive((current + 1) % variants.length);
      else if (event.key === "ArrowLeft") setActive((current - 1 + variants.length) % variants.length);
      else if (event.key.toLowerCase() === "r") setInstance((value) => value + 1);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [current, variants.length]);

  return (
    <div className={styles.prototype}>
      <div key={`${current}-${instance}`}>{variants[current].render()}</div>
      <nav className="proto-picker" aria-label="Prototype variants" ref={picker}>
        <span className="proto-picker-highlight" aria-hidden="true" ref={highlight} />
        {variants.map((variant, index) => <button key={variant.name} ref={(node) => { itemRefs.current[index] = node; }} className="proto-picker-item" data-active={index === current || undefined} aria-current={index === current ? "true" : undefined} onClick={() => setActive(index)}>{variant.name}</button>)}
        <span className="proto-picker-divider" aria-hidden="true" />
        <button className="proto-picker-item proto-picker-replay" aria-label="Replay animation (R)" onClick={() => setInstance((value) => value + 1)}>↻</button>
      </nav>
    </div>
  );
}
