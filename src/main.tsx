import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  Database,
  FileInput,
  FileText,
  Gauge,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  MapPin,
  PanelTop,
  Phone,
  Radar,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { AnimatedHeroPhrase } from "@/components/ui/animated-hero";
import { ContainerScrollShowcase } from "@/components/ui/container-scroll-showcase";
import "./index.css";

type WorkflowStep = {
  label: string;
  title: string;
  description: string;
  status: string;
  output: string;
  score: string;
  rows: Array<{ label: string; value: string; tone?: "accent" | "success" | "muted" }>;
};

const segments = [
  {
    label: "Website + SEO setup",
    title: "A clean, mobile-friendly website with clearer service pages, better local search basics, and simple calls to action.",
    action: "Price my website",
    items: ["Clear service pages", "Local SEO basics", "Contact paths"],
  },
  {
    label: "Tech integration",
    title: "Forms, booking pages, notifications, calendars, and follow-up tools connected so the website feeds the business.",
    action: "Implement my system",
    items: ["Booking flow", "Notifications", "Follow-up setup"],
  },
];

const workflowSteps: WorkflowStep[] = [
  {
    label: "Understand",
    title: "We learn where leads get lost.",
    description:
      "We learn how customers currently contact you and where leads get lost.",
    status: "Reviewing current flow",
    output: "Lead gaps mapped",
    score: "94%",
    rows: [
      { label: "Business", value: "Dayton service team" },
      { label: "Updated", value: "Jun 17, 2026" },
      { label: "Focus", value: "Website + lead flow" },
    ],
  },
  {
    label: "Build",
    title: "We set up the system you need.",
    description:
      "We set up the website, form, booking, notifications, or tracking you need.",
    status: "Building setup",
    output: "System in progress",
    score: "87%",
    rows: [
      { label: "Website", value: "Service pages", tone: "accent" },
      { label: "Routing", value: "Forms + calendar" },
      { label: "Follow-up", value: "Notifications" },
    ],
  },
  {
    label: "Launch",
    title: "We test the full flow and go live.",
    description:
      "We test the full flow and get the system live.",
    status: "Launch checklist ready",
    output: "Ready to launch",
    score: "91%",
    rows: [
      { label: "Mobile", value: "Checked", tone: "success" },
      { label: "Forms", value: "Tested" },
      { label: "Follow-up", value: "Verified" },
    ],
  },
  {
    label: "Use it",
    title: "You leave with a cleaner way to follow up.",
    description:
      "You leave with a cleaner way to capture and follow up with leads.",
    status: "Workflow complete",
    output: "Lead system live",
    score: "100%",
    rows: [
      { label: "Status", value: "Live", tone: "success" },
      { label: "Next step", value: "Use it" },
      { label: "Owner", value: "Your team" },
    ],
  },
];

const features = [
  {
    icon: FileInput,
    title: "Website + SEO Setup",
    text: "Mobile-friendly website, local SEO basics, and clear contact paths.",
  },
  {
    icon: Radar,
    title: "Tech Integration",
    text: "Booking, forms, calendars, and follow-up — connected.",
  },
  {
    icon: Route,
    title: "Custom Systems",
    text: "Custom dashboards, portals, and workflow tools.",
  },
  {
    icon: ShieldCheck,
    title: "Lead Flow",
    text: "Faster follow-up with less manual work.",
  },
  {
    icon: Gauge,
    title: "Local Visibility",
    text: "Local SEO and Google Business Profile cleanup.",
  },
  {
    icon: LockKeyhole,
    title: "One-Time Setups",
    text: "Set up once. No monthly contract.",
  },
];

const metrics = [
  { value: "Dayton", label: "based in Ohio", detail: "Built for Dayton-area small and mid-sized businesses" },
  { value: "24h", label: "response window", detail: "Response guaranteed within 24 hours" },
  { value: "3", label: "setup paths", detail: "Website + SEO Setup, Tech Integration, and Custom Systems" },
];

const pageSections = [
  { id: "top", label: "Hero" },
  { id: "workflow", label: "Workflow" },
  { id: "platform", label: "Platform" },
  { id: "outcomes", label: "Outcomes" },
  { id: "cta", label: "Demo" },
];

const logoUrl = "https://i.ibb.co/CsT0FbMq/Zoomed-Out-Logo.png";
const formAction =
  "https://script.google.com/macros/s/AKfycbxEUav9QVm2D2tOX3zIJednJl3t23DCeKNV2OW8MErA2BC2njJJpAkeH25sacvceX82rg/exec";
const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/daytongrowthco/" },
  { label: "Instagram", href: "https://www.instagram.com/daytongrowthco/" },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61582225267724" },
];
const videos = {
  hero: {
    src: "https://cdn.sceneai.art/Hero%20Section%20Video/060c6237-0a73-45f0-aea2-80291c52641d.mp4",
  },
  about: {
    poster: "https://image.mux.com/r6pXRAJb3005XEEbl1hYU1x01RFJDSn7KQApwNGgAHHbU/thumbnail.jpg?time=0",
    stream: "https://stream.mux.com/r6pXRAJb3005XEEbl1hYU1x01RFJDSn7KQApwNGgAHHbU.m3u8",
  },
  form: {
    poster: "https://image.mux.com/r6pXRAJb3005XEEbl1hYU1x01RFJDSn7KQApwNGgAHHbU/thumbnail.jpg?time=0",
    stream: "https://stream.mux.com/r6pXRAJb3005XEEbl1hYU1x01RFJDSn7KQApwNGgAHHbU.m3u8",
  },
};

const pricingCards = [
  {
    label: "Website foundation",
    title: "Website + SEO Setup",
    price: "Website pricing",
    bestFor: "An outdated or hard-to-use website",
    bullets: [
      "Mobile-friendly website",
      "Local SEO basics",
      "Contact or quote form",
    ],
    outcome: "A site that earns trust and leads",
    action: "Price My Website",
  },
  {
    label: "Implemented for you",
    title: "Tech Integration",
    price: "Project-based",
    bestFor: "A process to connect or automate",
    bullets: [
      "Booking, forms, calendars",
      "CRM and tool connections",
      "Notifications and follow-up",
    ],
    outcome: "A connected, lower-effort lead flow",
    action: "Implement My System",
  },
  {
    label: "Most flexible",
    title: "Custom Systems",
    price: "Custom quote",
    bestFor: "Work that doesn’t fit a standard setup",
    bullets: [
      "Dashboards or portals",
      "Workflow automation",
      "Tool integrations",
    ],
    outcome: "A tool built around your operations",
    action: "Scope My System",
    featured: true,
  },
];

// Completes the rotating hero headline: "Cleaner ___."
const heroPhrases = ["websites", "lead systems", "follow-up", "booking flows", "local presence"];

function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Primary">
        <a href="#top" className="logo-lockup" aria-label="DaytonGrowthCo home">
          <img
            className="logo-image"
            src={logoUrl}
            alt=""
            width="32"
            height="32"
          />
          <span>
            Dayton<span>Growth</span><b>Co.</b>
          </span>
        </a>
        <div className="header-nav" aria-label="Sections">
          <a href="#platform">Services</a>
          <a href="#outcomes">Pricing</a>
          <a href="#about">About</a>
          <a href="#cta">Contact</a>
        </div>
        <div className="header-actions">
          <a className="header-phone" href="tel:+19373677089">
            <Phone size={14} aria-hidden="true" />
            <span>(937) 367-7089</span>
          </a>
          <a className="button button-primary" href="#cta">
            Start a Project
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      </nav>
    </header>
  );
}

function useRecaptchaProtection() {
  useEffect(() => {
    const form = document.getElementById("auditForm") as HTMLFormElement | null;
    const key = document.querySelector<HTMLMetaElement>('meta[name="recaptcha-site-key"]')?.content.trim();
    if (!form || !key) return;

    const loadRecaptcha = () =>
      new Promise<any>((resolve) => {
        const win = window as unknown as { grecaptcha?: any };
        if (win.grecaptcha?.execute) {
          resolve(win.grecaptcha);
          return;
        }

        const existing = document.querySelector<HTMLScriptElement>("script[data-dgc-recaptcha]");
        if (existing) {
          existing.addEventListener("load", () => resolve(win.grecaptcha), { once: true });
          return;
        }

        const script = document.createElement("script");
        script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(key)}`;
        script.async = true;
        script.defer = true;
        script.dataset.dgcRecaptcha = "true";
        script.onload = () => resolve(win.grecaptcha);
        document.head.appendChild(script);
      });

    let submittingWithToken = false;
    let submittedToIframe = false;
    const onSubmit = async (event: SubmitEvent) => {
      if (submittingWithToken) {
        submittingWithToken = false;
        return;
      }

      event.preventDefault();
      const tokenField = document.getElementById("recaptchaToken") as HTMLInputElement | null;
      const actionField = document.getElementById("recaptchaAction") as HTMLInputElement | null;
      const status = document.getElementById("auditStatus");
      if (status) status.textContent = "Securing submission...";

      const grecaptcha = await loadRecaptcha();
      grecaptcha.ready(async () => {
        try {
          const token = await grecaptcha.execute(key, { action: "quick_recommendation" });
          if (tokenField) tokenField.value = token;
          if (actionField) actionField.value = "quick_recommendation";
          if (status) status.textContent = "Sending...";
          submittingWithToken = true;
          submittedToIframe = true;
          form.requestSubmit();
        } catch {
          if (status) status.textContent = "Sending...";
          submittingWithToken = true;
          submittedToIframe = true;
          form.requestSubmit();
        }
      });
    };

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[name="hidden_iframe"]');
    const onIframeLoad = () => {
      if (!submittedToIframe) return;
      const status = document.getElementById("auditStatus");
      if (status) status.textContent = "Request received. We will respond within 24 hours.";
    };

    form.addEventListener("submit", onSubmit);
    iframe?.addEventListener("load", onIframeLoad);
    return () => {
      form.removeEventListener("submit", onSubmit);
      iframe?.removeEventListener("load", onIframeLoad);
    };
  }, []);
}

function useActiveSection() {
  const [activeSection, setActiveSection] = useState(pageSections[0].id);

  useEffect(() => {
    const ids = pageSections.map((section) => section.id);

    const update = () => {
      // The section is "active" once its top has scrolled above a reference
      // line near the upper third of the viewport. Walking top-to-bottom and
      // keeping the last one that has crossed the line gives a deterministic
      // mapping that never skips sections (unlike intersection-ratio sorting).
      const line = window.innerHeight * 0.35;
      let current = ids[0];

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) {
          current = id;
        }
      }

      // Snap to the final section once the page is scrolled to the bottom.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = ids[ids.length - 1];
      }

      setActiveSection((prev) => (prev === current ? prev : current));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return activeSection;
}

function ScrollDots() {
  const activeSection = useActiveSection();

  return (
    <nav className="scroll-dots" aria-label="Page sections">
      {pageSections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={activeSection === section.id ? "active" : ""}
          aria-label={`Jump to ${section.label}`}
          aria-current={activeSection === section.id ? "location" : undefined}
        />
      ))}
    </nav>
  );
}

function BackgroundVideo({
  className,
  src,
  poster,
  stream,
}: {
  className: string;
  src?: string;
  poster?: string;
  stream?: string;
}) {
  return (
    <video
      className={className}
      src={src}
      poster={poster}
      data-mux-stream={stream}
      autoPlay
      muted
      loop
      playsInline
      preload={src ? "auto" : "none"}
      aria-hidden="true"
    />
  );
}

function StatusPill({ text, complete = false }: { text: string; complete?: boolean }) {
  return (
    <span className={`status-pill ${complete ? "is-complete" : ""}`}>
      {complete ? <CheckCircle2 size={13} aria-hidden="true" /> : <Sparkles size={13} aria-hidden="true" />}
      {text}
    </span>
  );
}

function DottedPanel({
  children,
  className = "",
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div className={`dotted-panel ${className}`} aria-label={label}>
      <div className="panel-fade top" aria-hidden="true" />
      {children}
      <div className="panel-fade bottom" aria-hidden="true" />
    </div>
  );
}

function SegmentCard({ segment, index }: { segment: (typeof segments)[number]; index: number }) {
  const flowLabels =
    index === 0
      ? ["Site visit", "Service page", "Lead form"]
      : ["Form sent", "Calendar", "Follow-up"];

  return (
    <a className="segment-card group" href="#workflow">
      <DottedPanel className="segment-stage">
        <div className={`mini-board mini-system mini-system-${index + 1}`} aria-hidden="true">
          <div className="mini-board-header">
            <span>{index === 0 ? "Lead path" : "System route"}</span>
            <Sparkles size={13} aria-hidden="true" />
          </div>
          <div className="mini-flow">
            {flowLabels.map((label, flowIndex) => (
              <React.Fragment key={label}>
                <span className={`mini-node ${flowIndex === 2 ? "is-final" : ""}`}>
                  <i />
                  {label}
                </span>
                {flowIndex < flowLabels.length - 1 ? <b /> : null}
              </React.Fragment>
            ))}
          </div>
          <div className="mini-signal-row">
            {segment.items.map((item, itemIndex) => (
              <span key={item} style={{ transitionDelay: `${itemIndex * 70}ms` }}>
                {item}
              </span>
            ))}
          </div>
          <div className="mini-metric-strip">
            <strong>{index === 0 ? "3.2x" : "24h"}</strong>
            <span>{index === 0 ? "clearer path" : "response window"}</span>
          </div>
        </div>
      </DottedPanel>
      <div className="segment-copy">
        <span className="eyebrow">{segment.label}</span>
        <h3>{segment.title}</h3>
        <span className="link-arrow">
          {segment.action}
          <ArrowRight size={15} aria-hidden="true" />
        </span>
      </div>
    </a>
  );
}

function ClayLandscape({
  scene = "warm",
  videoSrc,
  posterSrc,
}: {
  scene?: "warm" | "cool" | "pearl";
  videoSrc?: string;
  posterSrc?: string;
}) {
  return (
    <div className={`clay-landscape clay-${scene}`} aria-hidden="true">
      {videoSrc ? (
        <video className="clay-video" src={videoSrc} poster={posterSrc} autoPlay muted loop playsInline />
      ) : null}
      <div className="clay-hill clay-hill-back" />
      <div className="clay-hill clay-hill-mid" />
      <div className="clay-hill clay-hill-front" />
      <div className="clay-peak clay-peak-one" />
      <div className="clay-peak clay-peak-two" />
      <div className="clay-peak clay-peak-three" />
    </div>
  );
}

function ProductSceneCard({ step, index, active = true }: { step: WorkflowStep; index: number; active?: boolean }) {
  return (
    <div className={`scene-stack ${active ? "is-active" : ""}`}>
      <div className="ghost-card ghost-card-one" aria-hidden="true" />
      <div className="ghost-card ghost-card-two" aria-hidden="true" />
      <article className="product-card">
        <header className="product-card-header">
          <div className="product-card-title">
            <span className="source-icon" aria-hidden="true">
              <PanelTop size={15} />
            </span>
            <div>
              <span className="meta-label">{step.label}</span>
              <strong>Workflow record {String(index + 1).padStart(2, "0")}</strong>
            </div>
          </div>
          <StatusPill text={step.status} complete={step.label === "Result"} />
        </header>

        <div className="product-card-body">
          <div className="record-grid">
            {step.rows.map((row) => (
              <div className={`record-row ${row.tone ? `tone-${row.tone}` : ""}`} key={`${step.label}-${row.label}`}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>

          <div className="insight-box">
            <div>
              <span className="meta-label">System found</span>
              <strong>{step.output}</strong>
            </div>
            <div className="score-orb">
              <span>{step.score}</span>
              <small>score</small>
            </div>
          </div>
        </div>

        <footer className="product-card-footer">
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: step.score }} />
          </div>
          <button className="button button-secondary" type="button">
            Review setup
          </button>
          <button className="button button-primary compact" type="button">
            Launch
          </button>
        </footer>
      </article>
    </div>
  );
}

function SystemDashboardPreview() {
  const pipeline = [
    { label: "New", value: "Website lead", icon: Sparkles },
    { label: "Contacted", value: "Auto-reply sent", icon: Mail },
    { label: "Booked", value: "Calendar request", icon: Calendar },
    { label: "Followed up", value: "Reminder queued", icon: Bell },
  ];

  return (
    <div className="system-dashboard" aria-label="Lead workflow dashboard preview">
      <header className="system-dashboard-header">
        <div>
          <span className="meta-label">Lead system</span>
          <strong>Website visit to booked lead</strong>
        </div>
        <StatusPill text="Workflow live" complete />
      </header>
      <div className="system-dashboard-body">
        <div className="system-lead-card">
          <span className="meta-label">New website lead</span>
          <h3>Intake form received</h3>
          <p>Service request routed to CRM, calendar, and follow-up queue.</p>
          <div className="system-lead-fields">
            <span>Source: Service page</span>
            <span>Need: Website + SEO Setup</span>
            <span>Status: Ready to contact</span>
          </div>
        </div>
        <div className="system-pipeline">
          {pipeline.map((item, index) => {
            const Icon = item.icon;
            return (
              <article className="system-pipeline-step" key={item.label}>
                <span aria-hidden="true">
                  <Icon size={15} strokeWidth={1.9} />
                </span>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.value}</p>
                </div>
                {index < pipeline.length - 1 ? <i aria-hidden="true" /> : null}
              </article>
            );
          })}
        </div>
        <div className="system-dashboard-footer">
          <div>
            <span className="meta-label">Next action</span>
            <strong>Follow-up scheduled for today</strong>
          </div>
          <button type="button" className="button button-primary compact">
            Review flow
          </button>
        </div>
      </div>
    </div>
  );
}

function SystemShowcase() {
  return (
    <ContainerScrollShowcase
      kicker="System preview"
      title="See the system behind the website."
      text="A cleaner site matters most when the lead path behind it is connected: forms, booking, CRM context, reminders, and follow-up in one practical workflow."
    >
      <SystemDashboardPreview />
    </ContainerScrollShowcase>
  );
}

const leadSignals = [
  { icon: Phone, label: "Missed calls", value: "After hours", tone: "amber" as const },
  { icon: Bell, label: "Follow-up", value: "Manual", tone: "" as const },
  { icon: FileText, label: "Website CTA", value: "Unclear", tone: "" as const },
];

function DecisionSupport() {
  return (
    <section className="section-shell decision-section" id="recommendation">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div className="section-heading compact-heading" data-reveal>
          <span className="section-kicker">How we scope it</span>
          <h2>
            We read the signals.
            <span>Then recommend the setup.</span>
          </h2>
          <p>We find where leads slip, then point you at the smallest setup that fixes it.</p>
        </div>

        <div className="scene-stack is-active" data-reveal>
          <div className="ghost-card ghost-card-one" aria-hidden="true" />
          <div className="ghost-card ghost-card-two" aria-hidden="true" />
          <article className="product-card">
            <header className="product-card-header">
              <div className="product-card-title">
                <span className="source-icon" aria-hidden="true">
                  <Radar size={15} />
                </span>
                <div>
                  <span className="meta-label">Lead flow review</span>
                  <strong>Dayton service business</strong>
                </div>
              </div>
              <StatusPill text="Reviewing" />
            </header>

            <div className="product-card-body">
              <div className="record-grid">
                {leadSignals.map((signal) => {
                  const Icon = signal.icon;
                  return (
                    <div className={`record-row ${signal.tone ? `tone-${signal.tone}` : ""}`} key={signal.label}>
                      <span className="signal-label">
                        <span className="signal-ico" aria-hidden="true">
                          <Icon size={13} strokeWidth={1.9} />
                        </span>
                        {signal.label}
                      </span>
                      <strong>{signal.value}</strong>
                    </div>
                  );
                })}
              </div>

              <div className="insight-box">
                <div>
                  <span className="meta-label">Recommended setup</span>
                  <strong>Website + SEO Setup</strong>
                </div>
                <div className="score-orb">
                  <span>92%</span>
                  <small>fit</small>
                </div>
              </div>
            </div>

            <footer className="product-card-footer">
              <div className="progress-track" aria-hidden="true">
                <span style={{ width: "92%" }} />
              </div>
              <button type="button" className="button button-secondary compact">
                Adjust
              </button>
              <a href="#cta" className="button button-primary compact">
                Use this setup
              </a>
            </footer>
          </article>
        </div>
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section id="top" className="hero-section">
      <BackgroundVideo className="hero-product-video" src={videos.hero.src} />
      <div className="hero-product-video-mask" aria-hidden="true" />
      <div className="sky-glow" aria-hidden="true" />
      <ClayLandscape scene="warm" />
      <div className="mx-auto max-w-7xl px-5 pt-20 sm:px-8 lg:pt-24">
        <div className="clay-hero-copy hero-entrance">
          <span className="hero-label">DaytonGrowthCo. / automation system setup</span>
          <h1 className="hero-title">
            <span data-scroll-words>Cleaner</span>{" "}
            <span className="hero-audience-line">
              <AnimatedHeroPhrase phrases={heroPhrases} />
            </span>
          </h1>
          <p>
            We build websites and lead systems for Dayton businesses — so visitors trust you, contact you, and become
            leads.
          </p>
          <div className="hero-actions">
            <a className="button button-primary large" href="#cta">
              Start a Project
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a className="button button-secondary large" href="#outcomes">
              View One-Time Packages
            </a>
          </div>
          <ul className="hero-services" aria-label="What we set up">
            <li>Website + SEO</li>
            <li>Tech Integration</li>
            <li>Custom Systems</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function ServiceModes() {
  return (
    <section className="service-modes" aria-label="Ways to start">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="segment-grid" aria-label="Product modes">
          {segments.map((segment, index) => (
            <SegmentCard key={segment.label} segment={segment} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function useActiveWorkflowStep() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const section = document.querySelector<HTMLElement>("#workflow");
    if (!section) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(0.999, Math.max(0, -rect.top / scrollable));
      setActiveStep(Math.min(workflowSteps.length - 1, Math.floor(progress * workflowSteps.length)));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return activeStep;
}

function StickyWorkflow() {
  const activeStep = useActiveWorkflowStep();
  const active = workflowSteps[activeStep];

  return (
    <section id="workflow" className="workflow-section">
      <div className="desktop-workflow">
        <div className="sticky-workflow">
          <div className="mx-auto grid h-full max-w-7xl grid-cols-[5fr_6fr] items-center gap-16 px-8 xl:gap-24">
            <div className="workflow-copy" aria-live="polite">
              <span className="section-kicker">Workflow story</span>
              <p className="step-count">
                {String(activeStep + 1).padStart(2, "0")} / {String(workflowSteps.length).padStart(2, "0")}
              </p>
              <h2>{active.title}</h2>
              <p>{active.description}</p>
              <div className="workflow-dots" aria-label="Workflow progress">
                {workflowSteps.map((step, index) => (
                  <button
                    key={step.label}
                    type="button"
                    className={index === activeStep ? "active" : ""}
                    aria-label={`Step ${index + 1}: ${step.label}`}
                    aria-current={index === activeStep ? "step" : undefined}
                  />
                ))}
              </div>
            </div>
            <DottedPanel className="workflow-stage" label="Animated workflow product scene">
              {workflowSteps.map((step, index) => (
                <div className={`scene-layer ${index === activeStep ? "active" : ""}`} key={step.label}>
                  <ProductSceneCard step={step} index={index} active={index === activeStep} />
                </div>
              ))}
            </DottedPanel>
          </div>
        </div>
      </div>

      <div className="mobile-workflow mx-auto max-w-3xl px-5 sm:px-8">
        <div className="section-heading" data-reveal>
          <span className="section-kicker">Workflow story</span>
          <h2>
            Simple. Clear.
            <span>Done for you.</span>
          </h2>
        </div>
        {workflowSteps.map((step, index) => (
          <article className="mobile-step" key={step.label} data-reveal>
            <span className="step-count">{String(index + 1).padStart(2, "0")}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
            <DottedPanel className="mobile-stage">
              <ProductSceneCard step={step} index={index} />
            </DottedPanel>
          </article>
        ))}
      </div>
    </section>
  );
}

function WebsiteMockup({ variant }: { variant: "before" | "after" }) {
  const isAfter = variant === "after";
  const serviceCards = isAfter
    ? ["Emergency repairs", "Maintenance plans", "Free estimate"]
    : ["Service one", "Service two", "More"];

  return (
    <div className={`website-mockup ${variant}`}>
      <div className="browser-bar" aria-hidden="true">
        <span />
        <span />
        <span />
        <small>{isAfter ? "daytonserviceco.com" : "old-business-site.net"}</small>
      </div>
      <div className="mockup-body">
        <header className="mockup-nav">
          <strong>{isAfter ? "Dayton Service Co." : "ACME HOME SERVICES"}</strong>
          <nav aria-hidden="true">
            <span>{isAfter ? "Services" : ""}</span>
            <span>{isAfter ? "Reviews" : ""}</span>
            <span>{isAfter ? "Contact" : ""}</span>
          </nav>
        </header>
        <div className="mockup-hero">
          <div>
            <div className="mockup-trust-row" aria-hidden="true">
              {isAfter ? (
                <>
                  <span>4.9 rated locally</span>
                  <span>24h response</span>
                </>
              ) : (
                <>
                  <span>Last updated 2017</span>
                  <span>Desktop only</span>
                </>
              )}
            </div>
            <h3>{isAfter ? "Fast help from a trusted local team." : "Welcome to our website"}</h3>
            <p>
              {isAfter
                ? "Clear services, proof, and one obvious path to request help."
                : "Old copy, unclear services, and no strong reason to contact."}
            </p>
            <div className="mockup-cta-strip" aria-hidden="true">
              <strong>{isAfter ? "Request a quote" : "Click here"}</strong>
              <span>{isAfter ? "Typical reply: same day" : "Contact form buried below"}</span>
            </div>
          </div>
          <div className="mockup-visual" aria-hidden="true">
            {isAfter ? (
              <>
                <div className="mockup-phone-card">
                  <Phone size={13} aria-hidden="true" />
                  <span>3 new inquiries</span>
                </div>
                <div className="mockup-review-card">5.0 rating</div>
              </>
            ) : (
              <>
                <div className="mockup-alert-bar" />
                <div className="mockup-dead-button" />
              </>
            )}
          </div>
        </div>
        <div className="mockup-content">
          {serviceCards.map((card, index) => (
            <div className={`mockup-card ${index === 0 ? "primary" : ""}`} key={card}>
              <span>{card}</span>
              <i />
            </div>
          ))}
        </div>
        <footer className="mockup-footer" aria-hidden="true">
          <span>{isAfter ? "Lead captured + routed" : "Missing CTA"}</span>
          <i />
        </footer>
      </div>
    </div>
  );
}

function WebsiteTransformation() {
  const [position, setPosition] = useState(58);

  return (
    <section className="transformation-section" aria-labelledby="transformation-heading">
      <div className="shader-field" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div className="section-heading compact-heading" data-reveal>
          <span className="section-kicker">Website transformation</span>
          <h2 id="transformation-heading">
            From outdated site
            <span>to lead-ready system.</span>
          </h2>
          <p>We turn outdated websites into clean sites that build trust and turn visitors into leads.</p>
        </div>
        <div className="transformation-showcase" data-reveal>
          <div className="comparison-labels" aria-hidden="true">
            <span>Before</span>
            <span>After</span>
          </div>
          <div className="comparison-frame" style={{ "--split": `${position}%` } as React.CSSProperties}>
            <WebsiteMockup variant="before" />
            <div className="after-layer" aria-hidden="true">
              <WebsiteMockup variant="after" />
            </div>
            <div className="comparison-handle" aria-hidden="true" />
            <input
              className="comparison-range"
              type="range"
              min="5"
              max="95"
              value={position}
              aria-label="Compare outdated website and modern website"
              onChange={(event) => setPosition(Number(event.currentTarget.value))}
            />
          </div>
          <div className="transformation-notes">
            <span>Cleaner message</span>
            <span>Stronger trust</span>
            <span>Clearer lead path</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="about-section" id="about">
      <BackgroundVideo className="about-section-video" poster={videos.about.poster} stream={videos.about.stream} />
      <div className="about-section-video-mask" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div className="founder-card" data-reveal>
          <div className="founder-photo-shell">
            <img
              src="/samuel-caruso-320.jpg"
              alt="Samuel Caruso, Founder of DaytonGrowthCo."
              width="320"
              height="480"
              loading="lazy"
            />
          </div>
        </div>
        <div className="section-heading about-copy" data-reveal>
          <span className="section-kicker">About</span>
          <h2>
            Meet the founder.
            <span>Built in Dayton.</span>
          </h2>
          <p>
            Samuel Caruso started DaytonGrowthCo. after watching local businesses get stuck with websites that looked
            fine but didn’t bring in leads.
          </p>
          <p>We build websites and systems Dayton businesses actually use.</p>
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  return (
    <section className="section-shell" id="platform">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="section-heading" data-reveal>
          <span className="section-kicker">Types of tools</span>
          <h2>
            Simple sites.
            <span>Serious systems.</span>
          </h2>
          <p>Different businesses, different bottlenecks. Start with a website, add what you need.</p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className="feature-cell" key={feature.title}>
                <span className="feature-icon" aria-hidden="true">
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                <h3 data-scroll-words>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function OutcomeSection() {
  return (
    <section className="section-shell outcome-section" id="outcomes">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="outcome-grid">
          <div className="section-heading compact-heading" data-reveal>
            <span className="section-kicker">Pricing</span>
            <h2>
              Pricing for websites
              <span>and systems.</span>
            </h2>
            <p>Scoped to what you need. Pick a starting point below.</p>
          </div>
          <PricingCards />
        </div>
      </div>
    </section>
  );
}

// Pricing card CTAs map to the form's "Setup package" radio values by index.
const packageValues = ["Website and SEO setup", "Tech integration", "Custom systems"];

function selectPackageAndScroll(event: React.MouseEvent, index: number) {
  event.preventDefault();
  const value = packageValues[index];
  if (value) {
    document.querySelectorAll<HTMLInputElement>('input[name="serviceTier"]').forEach((radio) => {
      if (radio.value === value) {
        radio.checked = true;
        radio.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  }
  document.getElementById("cta")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function PricingCards() {
  return (
    <div className="pricing-grid">
      {pricingCards.map((card, index) => (
        <article
          className={`pricing-card ${card.featured ? "featured" : ""}`}
          key={card.title}
          data-reveal
          style={{ "--reveal-delay": `${index * 110}ms` } as React.CSSProperties}
        >
          <span className="eyebrow">{card.label}</span>
          <h3>{card.title}</h3>
          <strong>{card.price}</strong>
          <p className="pricing-fit">
            <span>Best for</span>
            {card.bestFor}
          </p>
          <ul>
            {card.bullets.map((bullet) => (
              <li key={bullet}>✓ {bullet}</li>
            ))}
          </ul>
          <div className="pricing-result">
            <span>Primary outcome</span>
            <strong>{card.outcome}</strong>
          </div>
          <a
            className={`button ${card.featured ? "button-primary" : "button-secondary"}`}
            href="#cta"
            onClick={(event) => selectPackageAndScroll(event, index)}
          >
            {card.action}
          </a>
        </article>
      ))}
    </div>
  );
}

function ProjectForm() {
  return (
    <div className="form-card" data-reveal>
      <form id="auditForm" method="POST" action={formAction} target="hidden_iframe" className="project-form">
        <input type="hidden" id="recaptchaToken" name="recaptchaToken" value="" readOnly />
        <input type="hidden" id="recaptchaAction" name="recaptchaAction" value="quick_recommendation" readOnly />

        <div className="form-step-heading">
          <span>1</span>
          <strong>Your details</strong>
        </div>
        <div className="form-grid">
          <label className="form-field" htmlFor="contactName">
            <span>Your Name *</span>
            <input id="contactName" name="yourName" type="text" autoComplete="name" required />
          </label>
          <label className="form-field" htmlFor="bizName">
            <span>Business Name *</span>
            <input id="bizName" name="businessName" type="text" autoComplete="organization" required />
          </label>
          <label className="form-field" htmlFor="email">
            <span>Email Address *</span>
            <input id="email" name="emailAddress" type="email" autoComplete="email" required />
          </label>
          <label className="form-field" htmlFor="website">
            <span>Current Website</span>
            <input id="website" name="currentDomain" type="text" inputMode="url" autoComplete="url" />
          </label>
        </div>

        <div className="form-step-heading">
          <span>2</span>
          <strong>What you need</strong>
        </div>
        <fieldset className="form-choice-group">
          <legend>Your main goal *</legend>
          {["Build or improve my website", "Improve local SEO", "Implement a system I need", "Build something custom"].map(
            (goal, index) => (
              <label className="choice-option" key={goal}>
                <input name="mainGoal" type="radio" value={goal} required defaultChecked={index === 0} />
                <span>{goal}</span>
              </label>
            ),
          )}
        </fieldset>

        <fieldset className="form-choice-group package-group">
          <legend>Setup package *</legend>
          {["Website and SEO setup", "Tech integration", "Custom systems"].map((tier, index) => (
            <label className="choice-option" key={tier}>
              <input name="serviceTier" type="radio" value={tier} required defaultChecked={index === 1} />
              <span>{tier}</span>
            </label>
          ))}
        </fieldset>

        <div className="form-step-heading">
          <span>3</span>
          <strong>Project details</strong>
        </div>
        <label className="form-field full" htmlFor="details">
          <span>What do you want implemented?</span>
          <textarea id="details" name="notes" rows={2} />
        </label>

        <button type="submit" className="button button-primary large form-submit">
          Start a Project
          <ArrowRight size={16} aria-hidden="true" />
        </button>
        <div id="auditStatus" aria-live="polite" className="form-status" />
        <p className="form-microcopy">Response guaranteed within 24 hours</p>
      </form>
      <iframe name="hidden_iframe" title="Form submission status" className="hidden-iframe" />
    </div>
  );
}

function FinalCTA() {
  return (
    <section id="cta" className="final-cta">
      <BackgroundVideo className="form-background-video" poster={videos.form.poster} stream={videos.form.stream} />
      <div className="form-video-mask" aria-hidden="true" />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="final-cta-copy text-center lg:text-left">
          <span className="section-kicker">Start a project</span>
          <h2>Let’s build the system your business needs.</h2>
          <p>
            Website and SEO improvements, tech integrations, and custom systems — built around how your business runs.
          </p>
          <ul className="intake-list" aria-label="What we set up">
            <li>Website + SEO Setup</li>
            <li>Tech Integration</li>
            <li>Custom Systems</li>
          </ul>
          <a className="text-link phone-link" href="tel:+19373677089">
            (937) 367-7089
          </a>
        </div>
        <ProjectForm />
      </div>
    </section>
  );
}

function SplashScreen() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.body.classList.add("splash-lock");
    // This effect runs after the React splash is committed to the DOM (same
    // frame), so removing the inline boot overlay now hands off seamlessly.
    document.getElementById("boot-splash")?.remove();
    const timer = window.setTimeout(() => {
      setDone(true);
      document.body.classList.remove("splash-lock");
    }, 1650);
    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove("splash-lock");
    };
  }, []);

  return (
    <div className={`splash-screen ${done ? "is-done" : ""}`} aria-hidden="true">
      <div className="splash-inner">
        <div className="splash-mark">
          <img src={logoUrl} alt="" className="splash-logo" />
        </div>
        <div className="splash-wordmark">
          Dayton<span className="splash-growth">Growth</span><span className="splash-co">Co.</span>
        </div>
      </div>
    </div>
  );
}

function useMotionSystem() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const wordTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-words]"));

    wordTargets.forEach((target) => {
      if (target.dataset.scrollWordsReady === "true") return;
      target.dataset.scrollWordsReady = "true";
      const source = target.textContent?.trim();
      if (!source) return;
      target.textContent = "";
      source.split(/(\s+)/).forEach((piece, index) => {
        if (/^\s+$/.test(piece)) {
          target.appendChild(document.createTextNode(piece));
          return;
        }
        const span = document.createElement("span");
        span.className = "scroll-word";
        span.textContent = piece;
        span.style.setProperty("--word-index", String(index));
        target.appendChild(span);
      });
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealTargets.forEach((target) => target.classList.add("visible"));
      wordTargets.forEach((target) => target.classList.add("scroll-words-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          entry.target.classList.add("scroll-words-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    );

    [...revealTargets, ...wordTargets].forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);
}

function useMuxVideos() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const videoEls = Array.from(document.querySelectorAll<HTMLVideoElement>("video[data-mux-stream]"));
    if (!videoEls.length || reduceMotion) return;

    const playQuietly = (video: HTMLVideoElement) => {
      video.muted = true;
      video.playsInline = true;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    };

    const loadNativeHls = (video: HTMLVideoElement) => {
      const src = video.dataset.muxStream;
      if (!src || !video.canPlayType("application/vnd.apple.mpegurl")) return false;
      video.src = src;
      video.addEventListener("loadedmetadata", () => playQuietly(video), { once: true });
      video.load();
      return true;
    };

    const hlsVideos = videoEls.filter((video) => !loadNativeHls(video));
    if (!hlsVideos.length) return;

    const attachHls = () => {
      const hlsGlobal = (window as unknown as { Hls?: any }).Hls;
      if (!hlsGlobal?.isSupported?.()) return;
      hlsVideos.forEach((video) => {
        const src = video.dataset.muxStream;
        if (!src || video.dataset.hlsAttached === "true") return;
        video.dataset.hlsAttached = "true";
        const hls = new hlsGlobal({
          capLevelToPlayerSize: true,
          maxBufferLength: 18,
          backBufferLength: 12,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(hlsGlobal.Events.MANIFEST_PARSED, () => playQuietly(video));
      });
    };

    if ((window as unknown as { Hls?: any }).Hls) {
      attachHls();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>("script[data-hls-loader]");
    if (existingScript) {
      existingScript.addEventListener("load", attachHls, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
    script.async = true;
    script.dataset.hlsLoader = "true";
    script.onload = attachHls;
    document.head.appendChild(script);
  }, []);
}

function App() {
  const year = useMemo(() => new Date().getFullYear(), []);
  useMotionSystem();
  useMuxVideos();
  useRecaptchaProtection();

  return (
    <>
      <SplashScreen />
      <div id="scroll-progress-bar" aria-hidden="true" />
      <Header />
      <main>
        <Hero />
        <ServiceModes />
        <StickyWorkflow />
        <SystemShowcase />
        <WebsiteTransformation />
        <DecisionSupport />
        <FeatureGrid />
        <AboutSection />
        <OutcomeSection />
        <FinalCTA />
      </main>
      <footer className="site-footer">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 text-sm sm:px-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="footer-brand">
            <a href="#top" className="footer-logo" aria-label="DaytonGrowthCo home">
              <img src={logoUrl} alt="" width="32" height="32" />
              <span>Dayton<span>Growth</span><b>Co.</b></span>
            </a>
            <p>A Dayton vibecoding firm helping local businesses improve websites, local SEO, tech integrations, and the systems behind daily work.</p>
            <a
              className="client-portal-link"
              href="https://billing.stripe.com/p/login/28E6oG91M4fq77o4oAaMU00"
              target="_blank"
              rel="noopener noreferrer"
            >
              Client Portal
            </a>
            <div className="social-links" aria-label="Social media">
              {socialLinks.map((link) => (
                <a href={link.href} key={link.label} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <nav className="footer-links" aria-label="Services">
            <a href="/website-design/">Website Design</a>
            <a href="/local-seo/">Local SEO</a>
            <a href="/website-maintenance/">Maintenance</a>
            <a href="/aboutus.html">About Us</a>
            <a href="#workflow">How It Works</a>
          </nav>
          <nav className="footer-links" aria-label="Legal and contact">
            <a href="mailto:help@daytongrowth.co">help@daytongrowth.co</a>
            <a href="tel:+19373677089">(937) 367-7089</a>
            <a href="/privacy-policy/">Privacy</a>
            <a href="/terms-of-service/">Terms</a>
            <a href="/disclaimer/">Disclaimer</a>
            <a href="/accessibility/">Accessibility</a>
          </nav>
        </div>
        <div className="footer-bottom">© {year} DaytonGrowthCo. All rights reserved.</div>
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
