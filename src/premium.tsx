"use client";

/**
 * Premium UI kit for DaytonGrowthCo.
 *
 * Reusable, presentational components that layer the "premium SaaS landing"
 * polish onto the existing service-business site. They reuse the global motion
 * system (data-reveal / data-scroll-words / data-stagger from useMotionSystem)
 * and the design tokens in index.css, so nothing here owns its own animation
 * loop. Styling lives in index.css under the "PREMIUM UI KIT" section.
 *
 * Deliberately NO pill-shaped badges anywhere: floating labels and section
 * markers use plain uppercase text, per brand rules.
 */

import React from "react";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* RevealHeading: word-by-word fade-up via the global motion system.          */
/* -------------------------------------------------------------------------- */

type RevealHeadingProps = {
  as?: "h1" | "h2" | "h3";
  children: string;
  className?: string;
  id?: string;
};

export function RevealHeading({ as = "h2", children, className, id }: RevealHeadingProps) {
  const Tag = as;
  return (
    <Tag id={id} className={className} data-scroll-words>
      {children}
    </Tag>
  );
}

/* -------------------------------------------------------------------------- */
/* StatRow: muted label + bold value. Used inside proof/process cards.        */
/* -------------------------------------------------------------------------- */

export type Stat = { label: string; value: string; tone?: "accent" | "success" | "muted" };

export function StatRow({ label, value, tone }: Stat) {
  return (
    <div className="stat-row" data-tone={tone}>
      <span className="stat-row-label">{label}</span>
      <span className="stat-row-value">{value}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PremiumButton: thin wrapper over the existing .button system.              */
/* -------------------------------------------------------------------------- */

type PremiumButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "default" | "large";
  withArrow?: boolean;
  className?: string;
};

export function PremiumButton({
  href,
  children,
  variant = "primary",
  size = "large",
  withArrow = true,
  className = "",
}: PremiumButtonProps) {
  const classes = [
    "button",
    variant === "primary" ? "button-primary" : "button-secondary",
    size === "large" ? "large" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <a className={classes} href={href}>
      {children}
      {withArrow ? <ArrowRight size={16} aria-hidden="true" /> : null}
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/* ProofCard: hero/right-rail proof module. Visual + labels + stat rows.      */
/* -------------------------------------------------------------------------- */

type ProofCardProps = {
  tags?: string[];
  title: string;
  description: string;
  stats: Stat[];
  visual?: React.ReactNode;
  tone?: "glass" | "light";
  className?: string;
};

export function ProofCard({
  tags = [],
  title,
  description,
  stats,
  visual,
  tone = "glass",
  className = "",
}: ProofCardProps) {
  return (
    <article className={`proof-card proof-card-${tone} ${className}`.trim()}>
      {visual ? <div className="proof-card-visual">{visual}</div> : null}
      {tags.length > 0 ? (
        <div className="proof-card-tags">
          {tags.map((tag) => (
            <span key={tag} className="proof-card-tag">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <h3 className="proof-card-title">{title}</h3>
      <p className="proof-card-desc">{description}</p>
      <div className="proof-card-stats">
        {stats.map((stat) => (
          <StatRow key={stat.label} {...stat} />
        ))}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* MiniDashboard: small interface module (metric rows / progress / checklist).*/
/* -------------------------------------------------------------------------- */

type MiniDashboardProps = {
  title: string;
  caption?: string;
  rows?: Stat[];
  progress?: { label: string; value: number }[];
  checks?: string[];
  className?: string;
};

export function MiniDashboard({ title, caption, rows = [], progress = [], checks = [], className = "" }: MiniDashboardProps) {
  return (
    <div className={`mini-dash ${className}`.trim()} aria-hidden="true">
      <div className="mini-dash-head">
        <span className="mini-dash-dot" />
        <span className="mini-dash-dot" />
        <span className="mini-dash-dot" />
        <span className="mini-dash-title">{title}</span>
      </div>
      <div className="mini-dash-body">
        {caption ? <p className="mini-dash-caption">{caption}</p> : null}
        {rows.map((row) => (
          <div key={row.label} className="mini-dash-row" data-tone={row.tone}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
        {progress.map((bar) => (
          <div key={bar.label} className="mini-dash-progress">
            <div className="mini-dash-progress-top">
              <span>{bar.label}</span>
              <span>{bar.value}%</span>
            </div>
            <div className="mini-dash-track">
              <div className="mini-dash-fill" style={{ width: `${bar.value}%` }} />
            </div>
          </div>
        ))}
        {checks.length > 0 ? (
          <ul className="mini-dash-checks">
            {checks.map((c) => (
              <li key={c}>
                <Check size={13} aria-hidden="true" />
                {c}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* HoverRevealCard: name+icon at rest, explanation+CTA on hover.              */
/* Mobile shows the revealed content by default (CSS).                        */
/* -------------------------------------------------------------------------- */

type HoverRevealCardProps = {
  index: number;
  icon: React.ReactNode;
  name: string;
  summary: string;
  detail: string;
  mobileDetail?: string;
  href?: string;
  cta?: string;
};

export function HoverRevealCard({ index, icon, name, summary, detail, mobileDetail, href = "#cta", cta = "Start here" }: HoverRevealCardProps) {
  return (
    <article className="hover-card t-resize" tabIndex={0}>
      <div className="hover-card-glow" aria-hidden="true" />
      <span className="hover-card-index">{String(index).padStart(2, "0")}</span>
      <div className="hover-card-top">
        <span className="hover-card-icon" aria-hidden="true">
          {icon}
        </span>
        <h3 className="hover-card-name">{name}</h3>
        <p className="hover-card-summary">{summary}</p>
      </div>
      <div className="hover-card-reveal">
        <div className="hover-card-reveal-inner">
          <p className="hover-card-detail">
            <span className="hover-card-detail-desktop">{detail}</span>
            <span className="hover-card-detail-mobile">{mobileDetail ?? detail}</span>
          </p>
          <a className="hover-card-cta" href={href}>
            {cta}
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* ProcessStepCard: stepped process card with mini dashboard + result.        */
/* -------------------------------------------------------------------------- */

type ProcessStepCardProps = {
  step: number;
  phase: string;
  title: string;
  deliverables: string[];
  result: string;
  dashboard?: React.ReactNode;
};

export function ProcessStepCard({ step, phase, title, deliverables, result, dashboard }: ProcessStepCardProps) {
  return (
    <article className="process-step" data-reveal>
      <div className="process-step-main">
        <div className="process-step-head">
          <span className="process-step-num">{String(step).padStart(2, "0")}</span>
          <span className="process-step-phase">{phase}</span>
        </div>
        <h3 className="process-step-title">{title}</h3>
        <ul className="process-step-deliverables">
          {deliverables.map((d) => (
            <li key={d}>
              <Check size={14} aria-hidden="true" />
              {d}
            </li>
          ))}
        </ul>
        <p className="process-step-result">
          <span className="process-step-result-label">Result</span>
          {result}
        </p>
      </div>
      {dashboard ? <div className="process-step-visual">{dashboard}</div> : null}
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* StickyStorySection: sticky heading column + scrolling content column.      */
/* -------------------------------------------------------------------------- */

type StickyStorySectionProps = {
  id?: string;
  heading: string;
  intro: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
};

export function StickyStorySection({ id, heading, intro, aside, children }: StickyStorySectionProps) {
  return (
    <section className="sticky-story" id={id} aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="sticky-story-inner">
        <div className="sticky-story-rail">
          <div className="sticky-story-rail-inner">
            <h2 id={id ? `${id}-title` : undefined} className="sticky-story-heading" data-scroll-words>
              {heading}
            </h2>
            <p className="sticky-story-intro">{intro}</p>
            {aside}
          </div>
        </div>
        <div className="sticky-story-track" data-stagger>
          {children}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* CircularCTA: compact branded action object.                                */
/* -------------------------------------------------------------------------- */

export function CircularCTA({ href = "#cta", label = "Start building", sub = "Book a free consult" }: { href?: string; label?: string; sub?: string }) {
  return (
    <a className="circular-cta" href={href} aria-label={`${label}. ${sub}.`}>
      <span className="circular-cta-ring" aria-hidden="true" />
      <span className="circular-cta-core">
        <ArrowUpRight size={30} aria-hidden="true" />
      </span>
      <span className="circular-cta-text">
        <strong>{label}</strong>
        <span>{sub}</span>
      </span>
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/* PositioningStatement: large editorial belief with accent phrases.          */
/* -------------------------------------------------------------------------- */

export function PositioningStatement({ children }: { children: React.ReactNode }) {
  return (
    <section className="positioning" aria-labelledby="positioning-title">
      <AccentPath className="accent-path-positioning" />
      <div className="positioning-inner">
        <p id="positioning-title" className="positioning-statement" data-reveal>
          {children}
        </p>
      </div>
    </section>
  );
}

export function Accent({ children }: { children: React.ReactNode }) {
  return <em className="positioning-accent">{children}</em>;
}

/* -------------------------------------------------------------------------- */
/* ProofBand: big numbers + one strong statement.                             */
/* -------------------------------------------------------------------------- */

type ProofBandProps = {
  stats: { value: string; label: string }[];
  statement: React.ReactNode;
  attribution?: string;
  background?: React.ReactNode;
};

export function ProofBand({ stats, statement, attribution, background }: ProofBandProps) {
  return (
    <section className="proof-band" aria-labelledby="proof-band-title">
      {background ? <div className="proof-band-media" aria-hidden="true">{background}</div> : null}
      {background ? <div className="proof-band-media-mask" aria-hidden="true" /> : null}
      <div className="proof-band-inner">
        <div className="proof-band-grid" data-stagger>
          {stats.map((s) => (
            <div key={s.label} className="proof-band-stat">
              <span className="proof-band-value">{s.value}</span>
              <span className="proof-band-label">{s.label}</span>
            </div>
          ))}
        </div>
        <blockquote id="proof-band-title" className="proof-band-quote" data-reveal>
          {statement}
          {attribution ? <cite>{attribution}</cite> : null}
        </blockquote>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* TestimonialCard: product-interface style testimonial.                      */
/* -------------------------------------------------------------------------- */

type TestimonialCardProps = {
  initials: string;
  name: string;
  role: string;
  resultLabel: string;
  quote: string;
  outcome: string;
};

export function TestimonialCard({ initials, name, role, resultLabel, quote, outcome }: TestimonialCardProps) {
  return (
    <article className="member-card" data-reveal>
      <div className="member-card-top">
        <span className="member-avatar" aria-hidden="true">
          {initials}
        </span>
        <div className="member-id">
          <strong>{name}</strong>
          <span>{role}</span>
        </div>
        <span className="member-result">{resultLabel}</span>
      </div>
      <p className="member-quote">{quote}</p>
      <p className="member-outcome">
        <Check size={14} aria-hidden="true" />
        {outcome}
      </p>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* AccentPath: a slow, low-opacity flowing line used as a premium background   */
/* accent. Decorative only (aria-hidden, pointer-events none); the line draws  */
/* in a slow loop and a single dot travels along it. Hidden on small screens   */
/* and frozen under reduced motion (both handled in CSS).                      */
/* -------------------------------------------------------------------------- */

export function AccentPath({ className = "" }: { className?: string }) {
  // One shared path string so the stroke and the travelling dot follow the
  // exact same curve (the dot uses it via CSS offset-path).
  const d = "M-20 150 C 220 40, 380 250, 640 140 S 1080 40, 1340 170";
  return (
    <div className={`accent-path ${className}`.trim()} aria-hidden="true">
      <svg viewBox="0 0 1320 300" preserveAspectRatio="xMidYMid slice" fill="none">
        <defs>
          <linearGradient id="accent-path-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2a2880" stopOpacity="0" />
            <stop offset="35%" stopColor="#4744c4" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#f1d0b1" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f1d0b1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="accent-path-line" d={d} stroke="url(#accent-path-stroke)" strokeWidth="1.5" strokeLinecap="round" />
        {/* The spark travels in SVG user-space via SMIL, so it stays locked to
            the path at any container width (a CSS offset-path dot would drift
            as the viewBox scales). Frozen for reduced-motion in CSS. */}
        <circle className="accent-path-spark" r="3.5" fill="#f5deca">
          <animateMotion dur="14s" repeatCount="indefinite" rotate="auto" path={d} />
        </circle>
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TrustStrip: quiet "built for" row of text marks.                           */
/* -------------------------------------------------------------------------- */

export function TrustStrip({ label = "Built for", marks }: { label?: string; marks: string[] }) {
  return (
    <div className="trust-strip" aria-label={`${label}: ${marks.join(", ")}`}>
      <span className="trust-strip-label">{label}</span>
      <ul className="trust-strip-marks">
        {marks.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </div>
  );
}
