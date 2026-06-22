import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import {
  AppWindow,
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronsLeftRight,
  Database,
  FileInput,
  FileText,
  Gauge,
  Globe2,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  MapPin,
  Megaphone,
  PanelTop,
  Phone,
  Radar,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Workflow,
  Wrench,
  X,
} from "lucide-react";
import { AnimatedHeroPhrase } from "@/components/ui/animated-hero";
import "./index.css";

type WorkflowStep = {
  label: string;
  title: string;
  description: string;
  status: string;
  output: string;
  progress: string;
  stage: string;
  rows: Array<{ label: string; value: string; tone?: "accent" | "success" | "muted" }>;
};

const segments = [
  {
    label: "Tools for the work",
    title: "Phone agents, quote tools, dashboards, portals, and internal systems built around your work.",
    action: "See how we build",
    items: ["Calls", "Quotes", "Projects"],
  },
  {
    label: "Tools for the sale",
    title: "Sales pages, proposal pages, product videos, visuals, and interactive decks.",
    action: "Explore the tools",
    items: ["Sales pages", "Videos", "Visuals"],
  },
];

const workflowSteps: WorkflowStep[] = [
  {
    label: "Inputs",
    title: "Calls, notes, photos, and pricing.",
    description: "Show us what comes in and what your team does with it.",
    status: "Inputs mapped",
    output: "Working specification",
    progress: "34%",
    stage: "Mapped",
    rows: [
      { label: "Incoming", value: "Calls + photos" },
      { label: "Reference", value: "Price sheet" },
      { label: "Current file", value: "jobs.xlsx" },
    ],
  },
  {
    label: "Tool",
    title: "A quote builder for the estimator.",
    description: "We define the screens, pricing rules, and connections.",
    status: "Tool specified",
    output: "Quote builder",
    progress: "68%",
    stage: "Defined",
    rows: [
      { label: "Screen", value: "Estimate builder", tone: "accent" },
      { label: "Rules", value: "Labor + materials" },
      { label: "Connects", value: "Customer record" },
    ],
  },
  {
    label: "Output",
    title: "An estimate that is ready to send.",
    description: "The tool produces the document, update, or next step your team needs.",
    status: "Output ready",
    output: "Shareable estimate",
    progress: "100%",
    stage: "Live",
    rows: [
      { label: "Format", value: "Proposal page", tone: "success" },
      { label: "Customer", value: "Review + approve" },
      { label: "Team", value: "Project created" },
    ],
  },
];

const buildPrinciples = [
  "Fix the expensive bottleneck first.",
  "Use existing software when it fits.",
  "Build custom only where your process creates an advantage.",
  "Measure time removed, errors avoided, and capacity recovered.",
];

const features = [
  {
    icon: Phone,
    title: "Phone Agents",
    text: "Answer calls, collect details, handle common questions, and send clear summaries.",
  },
  {
    icon: Workflow,
    title: "Custom Business Apps",
    text: "Focused tools built around the way your team already works.",
  },
  {
    icon: AppWindow,
    title: "App Development",
    text: "Web and mobile apps built for customers, staff, or a specific business process.",
  },
  {
    icon: Gauge,
    title: "Quote & Pricing Tools",
    text: "Calculators, estimate builders, and service pricing your team can use fast.",
  },
  {
    icon: LayoutDashboard,
    title: "Project Dashboards",
    text: "Track jobs, notes, photos, files, and status in one view.",
  },
  {
    icon: Database,
    title: "Customer Portals",
    text: "Give customers one place for requests, updates, documents, and uploads.",
  },
  {
    icon: FileText,
    title: "Training Systems",
    text: "Turn repeat procedures, videos, and SOPs into a library people can find.",
  },
  {
    icon: PanelTop,
    title: "Sales Materials",
    text: "Sales pages, proposal pages, pricing pages, and interactive decks.",
  },
  {
    icon: Sparkles,
    title: "Video & Visual Content",
    text: "Short videos, product visuals, explainers, and ecommerce content.",
  },
  {
    icon: Globe2,
    title: "Modern Websites",
    text: "Fast, polished websites built with a modern tech stack to turn visits into real opportunities.",
  },
  {
    icon: Search,
    title: "SEO",
    text: "Technical and local search improvements that help customers find your business.",
  },
  {
    icon: Radar,
    title: "AEO",
    text: "Clear, structured content that helps your business appear in AI answers and recommendation tools.",
  },
  {
    icon: Megaphone,
    title: "Social Media Campaigns",
    text: "Focused social campaigns with modern creative, landing pages, tracking, and reporting.",
  },
  {
    icon: Wrench,
    title: "Website Care",
    text: "Ongoing updates, performance improvements, and technical support that keep your website dependable.",
  },
  {
    icon: TrendingUp,
    title: "Campaign Analytics",
    text: "Connected measurement that shows which pages, searches, and campaigns are creating results.",
  },
];

const businessJourney = [
  {
    number: "01",
    icon: Globe2,
    title: "Build your presence",
    description: "Create a credible foundation that makes the business easy to understand and trust.",
    services: ["Modern websites", "Online presence", "Website care"],
  },
  {
    number: "02",
    icon: Search,
    title: "Get discovered",
    description: "Help the right customers find you across search, AI answers, social, and campaigns.",
    services: ["SEO + AEO", "Social media", "Content + campaigns"],
  },
  {
    number: "03",
    icon: Phone,
    title: "Capture and schedule",
    description: "Respond consistently, collect the right details, and turn demand into booked appointments.",
    services: ["Phone agents", "Lead intake", "Email + text follow-up"],
  },
  {
    number: "04",
    icon: Workflow,
    title: "Run the work",
    description: "Connect quoting, customer updates, project information, and repeatable internal processes.",
    services: ["Quote tools", "Dashboards + portals", "Custom systems"],
  },
];

const marginLeaks = [
  {
    icon: Gauge,
    area: "Quoting",
    cost: "Rebuilding the same estimate from notes, price sheets, and memory.",
    system: "A guided quote builder that applies your pricing logic and produces a send-ready estimate.",
    return: "Faster response, consistent margins, less estimator time.",
  },
  {
    icon: Phone,
    area: "Call agents",
    cost: "Owners and field staff stopping work to answer routine calls or losing after-hours context.",
    system: "A phone agent that answers, collects the right details, schedules appointments, and sends a clean summary.",
    return: "Fewer interruptions and more appointments handled without adding a full shift.",
  },
  {
    icon: Workflow,
    area: "Operating systems",
    cost: "Copying details between texts, spreadsheets, PDFs, inboxes, and job folders.",
    system: "One focused workflow for intake, job data, approvals, files, and next actions.",
    return: "Less double entry, fewer missed details, more visible work.",
  },
  {
    icon: Sparkles,
    area: "Practical AI",
    cost: "Paying skilled people to summarize, sort, draft, classify, or search repetitive information.",
    system: "AI embedded at specific bottlenecks, with human review where judgment matters.",
    return: "Lower administrative load without handing control to a black box.",
  },
  {
    icon: Globe2,
    area: "Website + ads",
    cost: "Sending paid traffic to an old site that makes the company look smaller or harder to trust.",
    system: "A fast website and campaign pages aligned to the service, location, and buyer’s decision.",
    return: "More value from the traffic you already pay to earn.",
  },
  {
    icon: Search,
    area: "SEO + AEO",
    cost: "Depending on paid media while search engines and AI answers cannot interpret your expertise.",
    system: "Technical structure, local pages, useful content, and machine-readable business signals.",
    return: "A compounding discovery channel that reduces reliance on rented attention.",
  },
];

const metrics = [
  { value: "Nationwide", label: "Dayton roots", detail: "Built for small and midsized businesses across the United States" },
  { value: "24h", label: "response window", detail: "Response guaranteed within 24 hours" },
  { value: "3", label: "setup paths", detail: "Website + SEO Setup, Tech Integration, and Custom Systems" },
];

const pageSections = [
  { id: "top", label: "Hero" },
  { id: "platform", label: "What we build" },
  { id: "outcomes", label: "Examples" },
  { id: "workflow", label: "How it works" },
  { id: "cta", label: "Contact" },
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
  form: {
    poster: "https://image.mux.com/r6pXRAJb3005XEEbl1hYU1x01RFJDSn7KQApwNGgAHHbU/thumbnail.jpg?time=0",
    stream: "https://stream.mux.com/r6pXRAJb3005XEEbl1hYU1x01RFJDSn7KQApwNGgAHHbU.m3u8",
  },
};

const toolScenarios = [
  {
    id: "calendar",
    label: "Plan our content",
    hint: "A month mapped out",
    need: "We need a content calendar.",
    title: "A month of content takes shape.",
    icon: Calendar,
  },
  {
    id: "calls",
    label: "Answer after hours",
    hint: "Never miss a call",
    need: "We need to respond to customers after hours.",
    title: "A call system comes online.",
    icon: Phone,
  },
  {
    id: "social",
    label: "Create social posts",
    hint: "Show up everywhere",
    need: "We need a stronger social media presence.",
    title: "Content starts publishing.",
    icon: Megaphone,
  },
  {
    id: "search",
    label: "Show up in AI",
    hint: "Found in AI answers",
    need: "We need our company to appear in AI answers.",
    title: "The business becomes easier to find.",
    icon: Search,
  },
];

// Completes the rotating hero headline: "We build ___."
const heroPhrases = ["phone agents", "quote tools", "dashboards", "customer portals", "custom apps"];

function InteractiveWordmark() {
  return (
    <span className="nav-wordmark interactive-wordmark" aria-hidden="true">
      <span className="nav-wordmark-dayton">
        <span className="wordmark-initial">D</span><span className="wordmark-rest">ayton</span>
      </span>
      <span className="nav-wordmark-growth">
        <span className="wordmark-initial">G</span><span className="wordmark-rest">rowth</span>
      </span>
      <b>
        <span className="wordmark-initial">C</span><span className="wordmark-rest">o.</span>
      </b>
    </span>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const isHome = window.location.pathname === "/";

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <a className="site-offer-banner" href="/systems-that-pay/">
        <span className="site-offer-copy">
          <strong>We’ll redesign your homepage. Free.</strong>
          <span>Custom concept · No obligation</span>
        </span>
        <span className="site-offer-action">
          Claim free redesign
          <ArrowRight size={14} aria-hidden="true" />
        </span>
      </a>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Primary">
        <a href={isHome ? "#top" : "/"} className="logo-lockup" aria-label="DaytonGrowthCo home">
          <InteractiveWordmark />
        </a>
        <div className="header-nav" aria-label="Sections">
          <a href="/what-we-build/">What We Build</a>
          <a href="/examples/">Examples</a>
          <a href="/how-it-works/">How It Works</a>
          <a href="/aboutus.html">About</a>
          <a href={isHome ? "#cta" : "/#cta"}>Contact</a>
        </div>
        <div className="header-actions">
          <a className="button button-primary" href={isHome ? "#cta" : "/#cta"}>
            Start Building.
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      </nav>
    </header>
  );
}

function useTurnstileProtection() {
  useEffect(() => {
    const form = document.getElementById("auditForm") as HTMLFormElement | null;
    const key = document.querySelector<HTMLMetaElement>('meta[name="turnstile-site-key"]')?.content.trim();
    const container = document.getElementById("turnstileWidget");
    if (!form || !key || !container) return;

    const submitButton = form.querySelector<HTMLButtonElement>(".form-submit");
    const submitLabel = submitButton?.querySelector<HTMLElement>(".form-submit-label");
    const getStatus = () => document.getElementById("auditStatus");
    const successDialog = document.getElementById("formSuccessDialog") as HTMLDialogElement | null;
    const successPanel = document.getElementById("formSuccess");
    const closeSuccessDialog = document.getElementById("closeFormSuccess");

    const setSubmitting = (isSubmitting: boolean) => {
      if (!submitButton) return;
      submitButton.disabled = isSubmitting;
      submitButton.dataset.loading = String(isSubmitting);
      submitButton.setAttribute("aria-busy", String(isSubmitting));
      if (submitLabel) submitLabel.textContent = isSubmitting ? "Sending…" : "Start Building";
    };

    type Turnstile = {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      getResponse: (id?: string) => string | undefined;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };

    const loadTurnstile = () =>
      new Promise<Turnstile>((resolve, reject) => {
        const win = window as unknown as { turnstile?: Turnstile };
        if (win.turnstile) {
          resolve(win.turnstile);
          return;
        }

        const existing = document.querySelector<HTMLScriptElement>("script[data-dgc-turnstile]");
        if (existing) {
          existing.addEventListener("load", () => win.turnstile && resolve(win.turnstile), { once: true });
          existing.addEventListener("error", reject, { once: true });
          return;
        }

        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        script.defer = true;
        script.dataset.dgcTurnstile = "true";
        script.onload = () => (win.turnstile ? resolve(win.turnstile) : reject(new Error("Turnstile unavailable")));
        script.onerror = reject;
        document.head.appendChild(script);
      });

    let cancelled = false;
    let widgetId: string | undefined;
    let turnstileApi: Turnstile | undefined;

    const showCompletedState = () => {
      if (!successPanel) return;
      successPanel.hidden = false;
      successPanel.focus();
    };

    const onDialogClose = () => {
      showCompletedState();
    };

    const dismissSuccessDialog = () => {
      if (successDialog?.open) {
        successDialog.close();
      } else {
        showCompletedState();
      }
    };

    successDialog?.addEventListener("close", onDialogClose);
    closeSuccessDialog?.addEventListener("click", dismissSuccessDialog);

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled) return;
        turnstileApi = turnstile;
        widgetId = turnstile.render(container, {
          sitekey: key,
          action: "quick_recommendation",
          theme: "light",
        });
      })
      .catch(() => {
        const status = getStatus();
        if (status) status.textContent = "Verification failed to load. Please refresh and try again.";
      });

    const onSubmit = (event: SubmitEvent) => {
      event.preventDefault();
      const status = getStatus();

      const token = turnstileApi?.getResponse(widgetId);
      if (!token) {
        if (status) {
          status.dataset.variant = "error";
          status.textContent = "Please complete the verification below.";
        }
        return;
      }

      setSubmitting(true);
      if (status) {
        status.dataset.variant = "pending";
        status.textContent = "Sending…";
      }

      // Apps Script answers a POST with a 302 to a Google page served with
      // X-Frame-Options: SAMEORIGIN, which the browser refuses to render in a
      // hidden iframe (the navigation is aborted and its load event never
      // fires). A no-cors fetch delivers the data without needing to read the
      // framed response, so the UI can resolve on the request settling instead.
      const payload = new FormData(form);
      payload.set("cf-turnstile-response", token);

      fetch(form.action, { method: "POST", mode: "no-cors", body: payload })
        .then(() => {
          form.reset();
          if (status) {
            status.dataset.variant = "";
            status.textContent = "";
          }
          // Keep the confirmation hidden until the request has settled
          // successfully. Show it as a dismissible modal first, then leave the
          // compact completed state in the form section after dismissal.
          form.hidden = true;
          if (successDialog?.showModal) {
            successDialog.showModal();
            closeSuccessDialog?.focus();
          } else if (successPanel) {
            showCompletedState();
          } else if (status) {
            status.dataset.variant = "success";
            status.textContent = "Request received. We’ll reply with next steps.";
          }
        })
        .catch(() => {
          if (status) {
            status.dataset.variant = "error";
            status.textContent = "Something went wrong. Please email help@daytongrowth.co and we’ll follow up.";
          }
        })
        .finally(() => {
          setSubmitting(false);
          turnstileApi?.reset(widgetId);
        });
    };

    form.addEventListener("submit", onSubmit);
    return () => {
      cancelled = true;
      form.removeEventListener("submit", onSubmit);
      successDialog?.removeEventListener("close", onDialogClose);
      closeSuccessDialog?.removeEventListener("click", dismissSuccessDialog);
      if (turnstileApi && widgetId !== undefined) turnstileApi.remove(widgetId);
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
  playbackRate,
}: {
  className: string;
  src?: string;
  poster?: string;
  stream?: string;
  playbackRate?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playbackRate) return;
    const applyRate = () => {
      try {
        video.playbackRate = playbackRate;
      } catch {
        /* ignore */
      }
    };
    applyRate(); // metadata may already be loaded
    video.addEventListener("loadedmetadata", applyRate);
    return () => video.removeEventListener("loadedmetadata", applyRate);
  }, [playbackRate]);

  return (
    <video
      ref={videoRef}
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
      ? ["Call or note", "Useful tool", "Clear next step"]
      : ["Product info", "Clear story", "Ready to send"];

  return (
    <a className="segment-card group" href="/how-it-works/">
      <DottedPanel className="segment-stage">
        <div className={`mini-board mini-system mini-system-${index + 1}`} aria-hidden="true">
          <div className="mini-board-header">
            <span>{index === 0 ? "Business workflow" : "Sales material"}</span>
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
            <strong>{index === 0 ? "1 place" : "Ready"}</strong>
            <span>{index === 0 ? "for the work" : "to share"}</span>
          </div>
        </div>
      </DottedPanel>
      <div className="segment-copy">
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
              <span className="meta-label">Build output</span>
              <strong>{step.output}</strong>
            </div>
            <div className="score-orb">
              <span>{step.stage}</span>
              <small>stage</small>
            </div>
          </div>
        </div>

        <footer className="product-card-footer">
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: step.progress }} />
          </div>
          <button className="button button-secondary" type="button">
            View spec
          </button>
          <button className="button button-primary compact" type="button">
            Open tool
          </button>
        </footer>
      </article>
    </div>
  );
}

function SpreadsheetTransformation() {
  const cells = ["Customer", "Job", "Status", "Price", "Miller", "Roof repair", "New", "Pending", "Davis", "Remodel", "Quoted", "$8,450"];

  return (
    <section className="spreadsheet-transform" aria-labelledby="spreadsheet-transform-heading">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
        <div className="section-heading compact-heading spreadsheet-copy">
          <h2 id="spreadsheet-transform-heading">
            The spreadsheet
            <span>becomes the tool.</span>
          </h2>
          <p>For small teams running calls, quotes, projects, and customer work through disconnected files.</p>
        </div>
        <div className="transform-stage spreadsheet-reveal" aria-label="Spreadsheet transforming into a project dashboard">
          <div className="sheet-view">
            <div className="transform-window-bar"><FileText size={15} /> jobs.xlsx</div>
            <div className="sheet-grid">
              {cells.map((cell, index) => <span key={`${cell}-${index}`}>{cell}</span>)}
            </div>
          </div>
          <div className="dashboard-view">
            <div className="transform-window-bar"><LayoutDashboard size={15} /> Miller roof repair</div>
            <div className="project-record">
              <header>
                <div><span>Customer</span><strong>Chris Miller</strong></div>
                <div><span>Address</span><strong>1842 Brown St, Dayton</strong></div>
              </header>
              <div className="estimate-lines">
                <p><span>Architectural shingles</span><strong>$5,860</strong></p>
                <p><span>Underlayment + flashing</span><strong>$1,420</strong></p>
                <p><span>Labor + disposal</span><strong>$2,170</strong></p>
              </div>
              <footer><span>Estimate total</span><strong>$9,450</strong></footer>
            </div>
          </div>
          <div className="transform-caption" aria-hidden="true">
            <span>Spreadsheet</span><ArrowRight size={15} /><strong>Working dashboard</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

// Animates an integer up from zero the first time it scrolls into view.
// Falls back to the final value immediately under reduced motion.
function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 1300,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      setDisplay(value);
      return;
    }
    setDisplay(0);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started.current) return;
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(value * eased));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        });
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration, reduceMotion]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

function EconomicCase() {
  return (
    <section className="economic-case" aria-labelledby="economic-case-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="economic-case-grid">
          <div className="economic-case-thesis" data-reveal>
            <h2 id="economic-case-title">
              Your best people are too expensive for
              <span>copy, paste, repeat.</span>
            </h2>
            <p>
              Skilled time should go toward judgment, customer work, and decisions, not rebuilding the same quote,
              moving the same details, or searching for the same file.
            </p>
            <blockquote>
              Old systems do not look expensive because their invoice is hidden in payroll.
            </blockquote>
          </div>

          <div className="homepage-cost-sheet-wrap" data-reveal>
            <p className="homepage-cost-prompt">What does the old way cost every year?</p>
            <div className="homepage-cost-sheet" aria-label="Example annual cost of a manual quoting process">
              <div className="homepage-sheet-top">
                <span>Process cost sheet</span>
                <span>DGC / 001</span>
              </div>
              <div className="homepage-sheet-title">
                <h3>Example: manual quoting</h3>
                <p>Conservative operating estimate</p>
              </div>
              <dl className="homepage-sheet-inputs">
                <div><dt>3 people</dt><dd>affected</dd></div>
                <div><dt>5 hrs / week</dt><dd>rework + entry</dd></div>
                <div><dt>$38 / hour</dt><dd>loaded labor</dd></div>
              </dl>
              <div className="homepage-sheet-total">
                <span>Annual drag</span>
                <strong><CountUp value={28500} prefix="$" /></strong>
              </div>
              <div className="homepage-sheet-recovery">
                <TrendingDown size={18} aria-hidden="true" />
                <span>Recover half the time:</span>
                <strong><CountUp value={14250} prefix="$" suffix=" / year" /></strong>
              </div>
              <p className="homepage-sheet-note">
                Before counting faster quotes, fewer errors, or additional jobs handled.
              </p>
            </div>
            <a className="economic-case-link" href="#cta">
              Show us the expensive task
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

const laborMoney = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function LaborCostCalculator() {
  const [people, setPeople] = useState(3);
  const [hours, setHours] = useState(5);
  const [rate, setRate] = useState(24);
  const [recovery, setRecovery] = useState(50);

  const results = useMemo(() => {
    const annualDrag = people * hours * rate * 50;
    const recoverable = annualDrag * (recovery / 100);
    return {
      annualDrag,
      recoverable,
      monthlyCeiling: recoverable / 12,
    };
  }, [hours, people, rate, recovery]);

  return (
    <section className="labor-calculator" aria-labelledby="labor-calculator-title">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div className="labor-calculator-copy" data-reveal>
          <h2 id="labor-calculator-title">What does the old way cost every year?</h2>
          <p>
            This model values only recoverable labor. It does not count faster response, fewer pricing errors,
            better close rates, or work completed with the capacity you get back.
          </p>
          <div className="labor-formula">
            People × weekly hours lost × loaded hourly cost × 50 working weeks
          </div>
        </div>

        <div className="labor-console" data-reveal>
          <div className="labor-controls">
            <label>
              <span><b>People affected</b><output>{people}</output></span>
              <input type="range" min="1" max="20" value={people} onChange={(event) => setPeople(Number(event.target.value))} />
            </label>
            <label>
              <span><b>Hours lost / person / week</b><output>{hours}</output></span>
              <input type="range" min="1" max="20" value={hours} onChange={(event) => setHours(Number(event.target.value))} />
            </label>
            <label>
              <span><b>Loaded hourly cost</b><output>{laborMoney.format(rate)}</output></span>
              <input type="range" min="20" max="100" step="2" value={rate} onChange={(event) => setRate(Number(event.target.value))} />
            </label>
            <label>
              <span><b>Realistic time recovered</b><output>{recovery}%</output></span>
              <input type="range" min="20" max="80" step="5" value={recovery} onChange={(event) => setRecovery(Number(event.target.value))} />
            </label>
          </div>

          <div className="labor-results" aria-live="polite">
            <div>
              <span>Annual process drag</span>
              <strong>{laborMoney.format(results.annualDrag)}</strong>
            </div>
            <div className="is-primary">
              <span>Potential annual capacity recovered</span>
              <strong>{laborMoney.format(results.recoverable)}</strong>
            </div>
            <div>
              <span>Monthly break-even ceiling</span>
              <strong>{laborMoney.format(results.monthlyCeiling)}</strong>
            </div>
          </div>
          <p className="labor-disclaimer">
            Directional estimate, not a guarantee. We validate assumptions against your actual workflow before recommending a build.
          </p>
        </div>
      </div>
    </section>
  );
}

const aiQueries = [
  { topic: "HVAC", q: "Best HVAC repair in Dayton, OH", biz: "Dayton Comfort Co.", domain: "daytoncomfort.co" },
  { topic: "Plumbing", q: "Emergency plumber near me in Dayton", biz: "Dayton Service Co.", domain: "daytonserviceco.com" },
  { topic: "Roofing", q: "Top-rated roofer in Dayton, Ohio", biz: "Miami Valley Roofing", domain: "miamivalleyroof.co" },
];

function AiVisibility() {
  const [active, setActive] = useState(0);
  const [optimized, setOptimized] = useState(true);
  const reduceMotion = useReducedMotion();
  const query = aiQueries[active];

  return (
    <section className="section-shell ai-section" id="recommendation">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div className="section-heading compact-heading" data-reveal>
          <h2>
            Show up when customers
            <span>ask AI.</span>
          </h2>
          <p>Customers ask ChatGPT and Google AI for a recommendation. We get your business named as the answer.</p>
        </div>

        <div className="ai-demo" data-reveal>
          <div className="ai-demo-bar">
            <div className="ai-chips" role="tablist" aria-label="Example questions">
              {aiQueries.map((item, index) => (
                <button
                  key={item.topic}
                  type="button"
                  role="tab"
                  aria-selected={index === active}
                  className={`ai-chip ${index === active ? "is-active" : ""}`}
                  onClick={() => setActive(index)}
                >
                  {item.topic}
                </button>
              ))}
            </div>
            <div className="ai-toggle" role="group" aria-label="Optimization state">
              <button type="button" className={!optimized ? "is-on" : ""} aria-pressed={!optimized} onClick={() => setOptimized(false)}>
                Before
              </button>
              <button type="button" className={optimized ? "is-on" : ""} aria-pressed={optimized} onClick={() => setOptimized(true)}>
                After
              </button>
            </div>
          </div>

          <div className="ai-window">
            <div className="ai-window-head">
              <span className="ai-mark" aria-hidden="true">
                <Sparkles size={13} strokeWidth={2} />
              </span>
              <span>AI Assistant</span>
            </div>

            <div className="ai-prompt">
              <Search size={14} aria-hidden="true" />
              <span>{query.q}</span>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                className="ai-answer"
                key={`${active}-${optimized}`}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
              >
                {optimized ? (
                  <>
                    <p className="ai-answer-text">
                      For {query.topic.toLowerCase()} in Dayton, the clear top recommendation is{" "}
                      <mark>{query.biz}</mark>, a locally trusted business with fast scheduling and upfront pricing.
                    </p>
                    <div className="ai-citation">
                      <span className="ai-rank">#1</span>
                      <div className="ai-citation-name">
                        <strong>{query.biz}</strong>
                        <span>{query.domain}</span>
                      </div>
                      <span className="ai-cited">
                        <CheckCircle2 size={13} aria-hidden="true" /> Cited
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="ai-answer-text is-muted">
                      There are a few {query.topic.toLowerCase()} options around Dayton, but I don’t have clear, current
                      details to recommend a specific local business.
                    </p>
                    <div className="ai-missing" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                      <em>Your business isn’t mentioned</em>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <footer className="ai-window-foot">
              <span className="ai-foot-label">{optimized ? "Optimized for AI answers" : "Not yet optimized"}</span>
              <a href="#cta" className="button button-primary compact">
                Get cited
              </a>
            </footer>
          </div>
        </div>
      </div>
    </section>
  );
}

function Hero() {
  const reduceMotion = useReducedMotion();
  const mediaRef = useRef<HTMLDivElement>(null);

  // Subtle cursor parallax on the hero film. Pointer-only (skips touch),
  // disabled under reduced motion. The media is scaled slightly so the
  // small translate never exposes an edge.
  useEffect(() => {
    const media = mediaRef.current;
    if (!media || reduceMotion) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth - 0.5) * 2;
        const y = (event.clientY / window.innerHeight - 0.5) * 2;
        media.style.transform = `scale(1.06) translate(${x * -1.4}%, ${y * -1.4}%)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      media.style.transform = "scale(1.06)";
    };

    media.style.transform = "scale(1.06)";
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      media.style.transform = "";
    };
  }, [reduceMotion]);

  return (
    <section id="top" className="hero-section">
      <div className="hero-media" aria-hidden="true" ref={mediaRef}>
        <BackgroundVideo className="hero-product-video" src={videos.hero.src} playbackRate={0.75} />
        <div className="hero-product-video-mask" />
      </div>
      <div className="hero-content mx-auto max-w-7xl px-5 pt-28 sm:px-8 lg:pt-32">
        <div className="clay-hero-copy hero-entrance">
          <span className="hero-label">Remove the manual work slowing down your business.</span>
          <h1 className="hero-title">
            <span data-scroll-words>We build</span>{" "}
            <span className="hero-audience-line">
              <AnimatedHeroPhrase phrases={heroPhrases} />
            </span>
          </h1>
          <p>
            Phone agents, quote calculators, dashboards, sales pages, training tools, and custom apps, built around
            the way your business already works.
          </p>
          <div className="hero-actions">
            <a className="button button-primary large" href="#cta">
              Start Building.
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a className="button button-secondary large" href="#platform">
              See the Tools
            </a>
          </div>
          <ul className="hero-services" aria-label="What we set up">
            <li>Business Tools</li>
            <li>Sales Materials</li>
            <li>Custom Workflows</li>
          </ul>
        </div>
        <a className="hero-scroll-cue" href="#platform" aria-label="Continue to what we build">
          <span>Explore</span>
          <i aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

function ServiceModes() {
  return (
    <section className="service-modes" aria-label="About DaytonGrowthCo">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="section-heading" data-reveal>
          <h2>
            Calls. Quotes. Projects.
            <span>Built into working systems.</span>
          </h2>
          <p>
            Small businesses run on calls, texts, spreadsheets, PDFs, notes, photos, and files. We turn those inputs
            into phone agents, calculators, dashboards, portals, training systems, pages, videos, and custom apps.
          </p>
          <p>
            We configure existing software when it fits. We build custom tools when it does not.
          </p>
        </div>
        <div className="segment-grid" aria-label="Product modes">
          {segments.map((segment, index) => (
            <SegmentCard key={segment.label} segment={segment} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BusinessJourney({ showDetailLink = true }: { showDetailLink?: boolean }) {
  return (
    <section className="business-journey" id="platform" aria-labelledby="business-journey-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="business-journey-heading" data-reveal>
          <h2 id="business-journey-title">
            From online presence
            <span>to the systems behind the work.</span>
          </h2>
          <div>
            <p>
              We modernize how small businesses get found, schedule customers, quote work, and run projects.
            </p>
            <strong>Start anywhere. We focus first on the constraint costing you the most.</strong>
          </div>
        </div>

        <div className="business-journey-grid" aria-label="Four connected stages of the business" data-stagger>
          {businessJourney.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <article className="business-journey-card" key={stage.title}>
                <header>
                  <span className="business-journey-number">{stage.number}</span>
                  <span className="business-journey-icon" aria-hidden="true">
                    <Icon size={19} strokeWidth={1.8} />
                  </span>
                </header>
                <h3>{stage.title}</h3>
                <p>{stage.description}</p>
                <ul>
                  {stage.services.map((service) => <li key={service}>{service}</li>)}
                </ul>
                {index < businessJourney.length - 1 ? (
                  <span className="business-journey-connector" aria-hidden="true">
                    <ArrowRight size={14} />
                  </span>
                ) : null}
              </article>
            );
          })}
        </div>

        <p className="business-journey-note">
          These stages can work independently. When they connect, information moves from the first customer touchpoint
          into the systems your team uses to deliver the work.
        </p>
        {showDetailLink ? (
          <a className="section-detail-link" href="/what-we-build/">
            Explore what we build
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </section>
  );
}

function useActiveWorkflowStep() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const section = document.querySelector<HTMLElement>("#workflow .desktop-workflow");
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
  const [mobileStep, setMobileStep] = useState(0);
  const mobileActive = workflowSteps[mobileStep];

  return (
    <section id="workflow" className="workflow-section">
      <div className="workflow-principles">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div className="workflow-principles-heading" data-reveal>
            <h2>Start with the constraint. Not the trend.</h2>
            <p>
              The right answer may be existing software, a focused automation, or a custom tool. The economics decide.
            </p>
          </div>
          <ul className="workflow-principles-list" data-reveal>
            {buildPrinciples.map((principle) => (
              <li key={principle}>
                <CheckCircle2 size={18} strokeWidth={2} aria-hidden="true" />
                <span>{principle}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="desktop-workflow">
        <div className="sticky-workflow">
          <div className="mx-auto grid h-full max-w-7xl grid-cols-[5fr_6fr] items-center gap-16 px-8 xl:gap-24">
            <div className="workflow-copy" aria-live="polite">
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
        <div className="section-heading">
          <h2>From input to output.</h2>
        </div>
        <div className="mobile-workflow-tabs" role="tablist" aria-label="Build process">
          {workflowSteps.map((step, index) => (
            <button
              key={step.label}
              type="button"
              role="tab"
              aria-selected={mobileStep === index}
              className={mobileStep === index ? "active" : ""}
              onClick={() => setMobileStep(index)}
            >
              {step.label}
            </button>
          ))}
        </div>
        <article className="mobile-step mobile-step-active">
          <h3>{mobileActive.title}</h3>
          <p>{mobileActive.description}</p>
          <DottedPanel className="mobile-stage">
            <div className="mobile-workflow-panel">
              <header>
                <span>{mobileActive.label}</span>
                <strong>{mobileActive.stage}</strong>
              </header>
              <div>
                {mobileActive.rows.map((row) => (
                  <p key={row.label}><span>{row.label}</span><strong>{row.value}</strong></p>
                ))}
              </div>
              <footer>
                <span>Output</span>
                <strong>{mobileActive.output}</strong>
              </footer>
            </div>
          </DottedPanel>
        </article>
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
          <span>{isAfter ? "Request captured + routed" : "Missing CTA"}</span>
          <i />
        </footer>
      </div>
    </div>
  );
}

function WebsiteTransformation({ showDetailLink = true }: { showDetailLink?: boolean }) {
  const [position, setPosition] = useState(50);
  const [interacted, setInteracted] = useState(false);
  const [nudging, setNudging] = useState(false);
  const reduceMotion = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const interactedRef = useRef(false);

  const markInteracted = () => {
    if (interactedRef.current) return;
    interactedRef.current = true;
    setInteracted(true);
    setNudging(false);
  };

  // On first scroll into view, wiggle the split once so it reads as draggable.
  // Skipped under reduced motion and cancelled the moment the user takes over.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || reduceMotion) return;

    const timers: number[] = [];
    let started = false;
    const runNudge = () => {
      if (started || interactedRef.current) return;
      started = true;
      setNudging(true);
      const steps = [38, 62, 50];
      steps.forEach((value, index) => {
        timers.push(
          window.setTimeout(() => {
            if (!interactedRef.current) setPosition(value);
          }, 360 + index * 460),
        );
      });
      timers.push(window.setTimeout(() => setNudging(false), 360 + steps.length * 460));
    };

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runNudge();
            observer.disconnect();
          }
        }),
      { threshold: 0.4 },
    );
    observer.observe(frame);
    return () => {
      observer.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, [reduceMotion]);

  const frameClassName = `comparison-frame ${nudging ? "is-hinting" : ""} ${
    interacted ? "is-interacted" : ""
  }`;

  return (
    <section className="transformation-section" aria-labelledby="transformation-heading">
      <div className="shader-field" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div className="section-heading compact-heading">
          <h2 id="transformation-heading">
            Before.
            <span>After.</span>
          </h2>
          <p>We redesign the site, rewrite the pages, and connect the request flow behind it.</p>
        </div>
        <div className="transformation-showcase">
          <div className="comparison-labels" aria-hidden="true">
            <span>Before</span>
            <span>After</span>
          </div>
          <div ref={frameRef} className={frameClassName} style={{ "--split": `${position}%` } as React.CSSProperties}>
            <WebsiteMockup variant="before" />
            <div className="after-layer" aria-hidden="true">
              <WebsiteMockup variant="after" />
            </div>
            <div className="comparison-handle" aria-hidden="true">
              <span className="comparison-grip">
                <ChevronsLeftRight size={15} aria-hidden="true" />
              </span>
            </div>
            {!interacted ? (
              <span className="comparison-hint" aria-hidden="true">
                Drag to compare
              </span>
            ) : null}
            <input
              className="comparison-range"
              type="range"
              min="5"
              max="95"
              value={position}
              aria-label="Compare outdated website and modern website"
              onPointerDown={markInteracted}
              onKeyDown={markInteracted}
              onChange={(event) => {
                markInteracted();
                setPosition(Number(event.currentTarget.value));
              }}
            />
          </div>
          <div className="transformation-notes">
            <span>Service pages</span>
            <span>Quote requests</span>
            <span>Connected workflow</span>
          </div>
          {showDetailLink ? (
            <a className="section-detail-link transformation-detail-link" href="/examples/">
              Explore more working examples
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  const [openFeature, setOpenFeature] = useState(-1);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  return (
    <section className="section-shell platform-section" aria-labelledby="margin-leak-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="margin-leak-heading">
          <h2 id="margin-leak-title">Modernize the work around the work.</h2>
          <p>
            Not another lead form. The operating layer behind how your company quotes, answers, organizes, markets,
            and grows.
          </p>
        </div>
        <div className="margin-leak-table">
          <div className="margin-leak-head" aria-hidden="true">
            <span>Area</span>
            <span>Current cost</span>
            <span>Better system</span>
            <span>Business return</span>
          </div>
          {marginLeaks.map((item) => {
            const Icon = item.icon;
            return (
              <article className="margin-leak-row" key={item.area}>
                <h3>
                  <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                  {item.area}
                </h3>
                <div><span>Current cost</span><p>{item.cost}</p></div>
                <div><span>Better system</span><p>{item.system}</p></div>
                <div className="margin-return"><span>Business return</span><p>{item.return}</p></div>
              </article>
            );
          })}
        </div>
        <button
          className="feature-view-all"
          type="button"
          aria-expanded={showAllFeatures}
          aria-controls="all-capabilities"
          onClick={() => setShowAllFeatures((current) => !current)}
        >
          {showAllFeatures ? "Hide capabilities" : "View all capabilities"}
          <ChevronDown size={16} aria-hidden="true" />
        </button>
        <div id="all-capabilities" className={`feature-all ${showAllFeatures ? "is-open" : ""}`}>
          <div className="feature-grid desktop-feature-grid">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article className="feature-cell" key={feature.title}>
                  <span className="feature-icon" aria-hidden="true">
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </article>
              );
            })}
          </div>
          <div className="feature-accordion">
            {features.map((feature, index) => {
              const isOpen = openFeature === index;
              return (
                <article className={isOpen ? "is-open" : ""} key={feature.title}>
                  <button type="button" onClick={() => setOpenFeature(isOpen ? -1 : index)} aria-expanded={isOpen}>
                    <span className="feature-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <strong>{feature.title}</strong>
                    <ChevronDown size={17} aria-hidden="true" />
                  </button>
                  {isOpen ? <p>{feature.text}</p> : null}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function OutcomeSection() {
  return (
    <section className="section-shell outcome-section" id="outcomes">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="section-heading">
          <h2>Choose a need. Build the right system.</h2>
          <p>Watch a focused tool take shape around what the business actually needs.</p>
        </div>
        <ToolScenarioDemo />
      </div>
    </section>
  );
}

function ToolScenarioDemo() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const resetTimer = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const scenario = toolScenarios[activeScenario];

  useEffect(() => () => {
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
  }, []);

  const chooseScenario = (index: number) => {
    if (index === activeScenario || isResetting) return;
    if (reduceMotion) {
      setActiveScenario(index);
      return;
    }

    setIsResetting(true);
    resetTimer.current = window.setTimeout(() => {
      setActiveScenario(index);
      setIsResetting(false);
      resetTimer.current = null;
    }, 320);
  };

  return (
    <div className="phone-agent-demo">
      <div className="phone-agent-demo-header">
        <div>
          <h3>{scenario.need}</h3>
        </div>
      </div>

      <div className="phone-agent-demo-layout">
        <div className="phone-agent-steps" role="tablist" aria-label="Business needs">
          {toolScenarios.map((item, index) => {
            const Icon = item.icon;
            return (
            <button
              type="button"
              role="tab"
              id={`tool-scenario-${index}`}
              aria-controls="tool-scenario-screen"
              aria-selected={activeScenario === index}
              className={activeScenario === index ? "is-active" : ""}
              onClick={() => chooseScenario(index)}
              key={item.label}
            >
              <span className="scenario-tab-icon"><Icon size={15} aria-hidden="true" /></span>
              <span className="scenario-tab-text">
                <strong>{item.label}</strong>
                <small>{item.hint}</small>
              </span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
            );
          })}
        </div>

        <div
          className={`phone-agent-screen scenario-screen scenario-${scenario.id} ${isResetting ? "is-resetting" : ""}`}
          id="tool-scenario-screen"
          role="tabpanel"
          aria-labelledby={`tool-scenario-${activeScenario}`}
          aria-live="polite"
        >
          <div className="phone-agent-screen-bar">
            <div>
              <span className="phone-agent-signal" aria-hidden="true" />
              <strong>{isResetting ? "Clearing workspace" : "System ready"}</strong>
            </div>
            <small>{scenario.label}</small>
          </div>

          {isResetting ? (
            <div className="scenario-reset" aria-label="Preparing the selected system">
              <span />
              <strong>Building…</strong>
            </div>
          ) : null}

          {!isResetting && scenario.id === "calendar" ? (
            <div className="scenario-calendar">
              <div className="scenario-calendar-head">
                <div><small>Content plan</small><strong>June</strong></div>
                <span>12 posts ready</span>
              </div>
              <div className="scenario-weekdays" aria-hidden="true">
                {["M", "T", "W", "T", "F"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
              </div>
              <div className="scenario-calendar-grid">
                {[
                  ["03", "Project video", "video"],
                  ["05", "Customer tip", "tip"],
                  ["09", "Before / after", "visual"],
                  ["12", "Team story", "story"],
                  ["17", "Service explainer", "video"],
                  ["20", "FAQ post", "tip"],
                  ["24", "Job spotlight", "visual"],
                  ["27", "Monthly recap", "story"],
                ].map(([date, title, tone]) => (
                  <div className={`scenario-calendar-item is-${tone}`} key={date}>
                    <span>{date}</span><strong>{title}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {!isResetting && scenario.id === "calls" ? (
            <div className="scenario-call-flow">
              <div className="phone-agent-call">
                <span className="phone-agent-call-icon"><Phone size={18} aria-hidden="true" /></span>
                <div>
                  <small>8:42 PM · Incoming call</small>
                  <strong>New customer request</strong>
                  <p>“There’s water coming through the ceiling near our back bedroom.”</p>
                </div>
              </div>
              <div className="phone-agent-capture is-visible">
                <div><span>Service</span><strong>Roof repair</strong></div>
                <div><span>Urgency</span><strong>Active leak</strong></div>
                <div><span>Location</span><strong>Dayton, OH</strong></div>
                <div><span>Appointment</span><strong>Tomorrow · 9:30 AM</strong></div>
              </div>
              <div className="phone-agent-summary is-visible">
                <div className="phone-agent-summary-title">
                  <CheckCircle2 size={17} aria-hidden="true" />
                  <div><small>Appointment scheduled</small><strong>Details sent to the team</strong></div>
                </div>
              </div>
            </div>
          ) : null}

          {!isResetting && scenario.id === "social" ? (
            <div className="scenario-social">
              <div className="scenario-social-copy">
                <small>Publishing this week</small>
                <strong>Six pieces of content. One clear voice.</strong>
              </div>
              <div className="scenario-post-stack">
                {[
                  ["Project walkthrough", "1.8k", "86"],
                  ["Three things to check", "2.4k", "124"],
                  ["Before and after", "3.1k", "208"],
                ].map(([title, views, clicks], index) => (
                  <article style={{ "--post-index": index } as React.CSSProperties} key={title}>
                    <div className="scenario-post-visual"><span>{String(index + 1).padStart(2, "0")}</span></div>
                    <strong>{title}</strong>
                    <div><span>{views} views</span><span>{clicks} clicks</span></div>
                  </article>
                ))}
              </div>
              <div className="scenario-click-chart">
                <span>Site clicks</span>
                <div aria-label="Clicks increasing across published content">
                  {[24, 38, 34, 58, 76, 92, 118, 146].map((height, index) => (
                    <i style={{ height: `${height / 1.7}px`, "--bar-index": index } as React.CSSProperties} key={height} />
                  ))}
                </div>
                <strong>+184%</strong>
              </div>
            </div>
          ) : null}

          {!isResetting && scenario.id === "search" ? (
            <div className="scenario-search">
              <div className="scenario-question">
                <span>Customer asks</span>
                <strong>“Who builds custom quote tools for small businesses?”</strong>
              </div>
              <div className="scenario-answer">
                <div className="scenario-answer-mark"><Sparkles size={18} aria-hidden="true" /></div>
                <div>
                  <small>AI answer</small>
                  <p><strong>DaytonGrowthCo</strong> builds quote calculators, dashboards, phone agents, and custom business apps for small businesses nationwide.</p>
                  <div className="scenario-source">
                    <Globe2 size={14} aria-hidden="true" />
                    <span>daytongrowthco.com</span>
                    <CheckCircle2 size={14} aria-hidden="true" />
                  </div>
                </div>
              </div>
              <div className="scenario-search-signals">
                <span>Clear services</span><span>Useful pages</span><span>Trusted sources</span>
              </div>
            </div>
          ) : null}

          <div className="phone-agent-screen-footer">
            <strong>{scenario.title}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectForm() {
  return (
    <div className="form-card">
      <form id="auditForm" method="POST" action={formAction} className="project-form">
        <input type="hidden" name="mainGoal" value="Build a business tool" readOnly />
        <input type="hidden" name="serviceTier" value="Discuss the process" readOnly />

        <label className="form-field" htmlFor="contactName">
          <span>Name *</span>
          <input id="contactName" name="yourName" type="text" autoComplete="name" placeholder="Jane Smith" required />
        </label>
        <label className="form-field" htmlFor="email">
          <span>Email *</span>
          <input id="email" name="emailAddress" type="email" autoComplete="email" placeholder="jane@company.com" required />
        </label>
        <label className="form-field full project-details-field" htmlFor="details">
          <span>What should we build? *</span>
          <small id="detailsHelp">Describe what comes in, what your team does, and what should come out.</small>
          <textarea
            id="details"
            name="notes"
            rows={5}
            placeholder="We receive X, our team does Y, and we need Z automated."
            aria-describedby="detailsHelp"
            required
          />
        </label>

        <div id="turnstileWidget" className="turnstile-field" aria-label="Verification" />

        <button type="submit" className="button button-primary large form-submit">
          <span className="form-submit-label">Start Building</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
        <div id="auditStatus" aria-live="polite" className="form-status" />
      </form>
      <dialog
        id="formSuccessDialog"
        className="form-success-dialog"
        aria-labelledby="formSuccessDialogTitle"
        aria-describedby="formSuccessDialogMessage"
      >
        <button id="closeFormSuccess" className="form-success-close" type="button" aria-label="Close confirmation">
          <X size={20} aria-hidden="true" />
        </button>
        <span className="form-success-icon" aria-hidden="true">
          <CheckCircle2 size={34} strokeWidth={2.25} />
        </span>
        <h3 id="formSuccessDialogTitle" className="form-success-title">Received</h3>
        <p id="formSuccessDialogMessage" className="form-success-message">
          Thanks, we’ve got your details. We’ll review your process and reply with next steps within 24 hours.
        </p>
      </dialog>
      <div id="formSuccess" className="form-success" role="status" tabIndex={-1} hidden>
        <span className="form-success-icon" aria-hidden="true">
          <CheckCircle2 size={34} strokeWidth={2.25} />
        </span>
        <h3 className="form-success-title">Received</h3>
        <p className="form-success-message">
          Thanks, we’ve got your details. We’ll review your process and reply with next steps within 24 hours.
        </p>
      </div>
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
          <h2>Bring us the process. We’ll build the tool.</h2>
          <p>
            Tell us what comes in, what your team does with it, and what needs to come out.
          </p>
          <ul className="intake-list" aria-label="What we set up">
            <li>Map the inputs</li>
            <li>Define the tool</li>
            <li>Build the system</li>
          </ul>
        </div>
        <ProjectForm />
      </div>
    </section>
  );
}

function FounderPreview() {
  return (
    <section className="founder-preview" aria-labelledby="founder-preview-title">
      <div className="founder-preview-layout mx-auto max-w-7xl px-5 sm:px-8">
        <figure className="founder-profile">
          <div className="founder-photo-frame">
            <img
              src="https://i.postimg.cc/B6wB2jNM/2025SUCWHeadshots-By-Rhine-Media-202.jpg"
              alt="Samuel Caruso, founder of DaytonGrowthCo"
            />
          </div>
          <figcaption>
            <strong>Samuel Caruso</strong>
            <span>Founder, DaytonGrowthCo.</span>
          </figcaption>
        </figure>
        <div className="founder-preview-copy">
          <h2 id="founder-preview-title">The person behind the tools.</h2>
          <p>
            Meet Samuel Caruso, founder of DaytonGrowthCo. He builds practical systems around the way your business
            already works, so your team can move faster without forcing a new process.
          </p>
          <blockquote>
            “Most businesses don’t need more software. They need tools that fit the process they already trust.”
          </blockquote>
        </div>
        <a className="founder-preview-link" href="/aboutus.html">
          Read the founder story
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

function SplashScreen() {
  const [skipSplash] = useState(() => {
    try {
      return window.sessionStorage.getItem("dgc:splash-seen") === "1";
    } catch {
      return false;
    }
  });
  const [done, setDone] = useState(skipSplash);

  useEffect(() => {
    document.getElementById("boot-splash")?.remove();
    if (skipSplash) {
      document.documentElement.classList.add("dgc-splash-seen");
      document.body.classList.remove("splash-lock");
      return;
    }

    try {
      window.sessionStorage.setItem("dgc:splash-seen", "1");
    } catch {
      /* Continue showing the splash when storage is unavailable. */
    }
    document.body.classList.add("splash-lock");
    // This effect runs after the React splash is committed to the DOM (same
    // frame), so removing the inline boot overlay now hands off seamlessly.
    const timer = window.setTimeout(() => {
      setDone(true);
      document.body.classList.remove("splash-lock");
    }, 2550);
    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove("splash-lock");
    };
  }, [skipSplash]);

  if (skipSplash) return null;

  return (
    <div className={`splash-screen ${done ? "is-done" : ""}`} aria-hidden="true">
      <div className="splash-inner">
        <div className="splash-mark">
          <img src={logoUrl} alt="" className="splash-logo" />
        </div>
        <div className="splash-wordmark">
          <span className="sp-ini">D</span><span className="sp-rest">ayton</span><span className="sp-ini sp-growth">G</span><span className="sp-rest sp-growth">rowth</span><span className="sp-ini sp-co">C</span><span className="sp-rest sp-co">o.</span>
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
    const staggerTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-stagger]"));

    // Index each direct child so its entrance can cascade via CSS.
    staggerTargets.forEach((group) => {
      Array.from(group.children).forEach((child, index) => {
        (child as HTMLElement).style.setProperty("--stagger-index", String(index));
      });
    });

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
      staggerTargets.forEach((target) => target.classList.add("stagger-in"));
      return;
    }

    const reveal = (target: Element) => {
      target.classList.add("visible");
      target.classList.add("scroll-words-visible");
      target.classList.add("stagger-in");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    );

    const allTargets = [...revealTargets, ...wordTargets, ...staggerTargets];
    allTargets.forEach((target) => observer.observe(target));

    // Fail open: never leave content stuck invisible if the observer misfires
    // (e.g. a section scrolled past before paint, or layout shifts mid-load).
    const failOpen = window.setTimeout(() => {
      allTargets.forEach((target) => {
        if (!target.classList.contains("visible")) reveal(target);
      });
    }, 3000);

    return () => {
      observer.disconnect();
      window.clearTimeout(failOpen);
    };
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

function useScrollProgressFallback() {
  useEffect(() => {
    const bar = document.getElementById("scroll-progress-bar");
    if (!bar) return;
    // Supporting browsers drive the bar purely in CSS via animation-timeline:
    // scroll(); only browsers without it need this JS fallback.
    if (window.CSS?.supports?.("animation-timeline: scroll()")) return;

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
}

const pageCopy = {
  whatWeBuild: {
    kicker: "What we build",
    title: "From online presence to the systems behind the work.",
    text: "We help small and midsized businesses nationwide improve how customers find them, how requests are handled, and how the team delivers the work.",
  },
  examples: {
    kicker: "Examples",
    title: "Choose a need. See the system take shape.",
    text: "These working demonstrations show how a specific business problem can become a focused, usable tool. Each one is built to make the idea concrete before a full engagement begins.",
  },
  howItWorks: {
    kicker: "How it works",
    title: "Start with the constraint. Not the trend.",
    text: "We map the work, measure what the current process costs, and choose the smallest useful fix before recommending a custom build.",
  },
};

const pageHeroTrust = ["Dayton, Ohio", "24-hour response", "No obligation"];

function PageHero({ title, text, kicker }: { title: string; text: string; kicker?: string }) {
  return (
    <section className="page-hero" id="top">
      <div className="page-hero-field" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {kicker ? (
          <span className="page-hero-kicker">
            <Sparkles size={13} aria-hidden="true" />
            {kicker}
          </span>
        ) : null}
        <h1>{title}</h1>
        <p>{text}</p>
        <a className="button button-primary large" href="#cta">
          Start a conversation
          <ArrowRight size={15} aria-hidden="true" />
        </a>
        <ul className="page-hero-trust" aria-label="Why work with us">
          {pageHeroTrust.map((item) => (
            <li key={item}>
              <CheckCircle2 size={14} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function AdvancedSystemPreview({
  linkHref = "/examples/",
  linkLabel = "Explore more examples",
  sectionId = "outcomes",
}: {
  linkHref?: string;
  linkLabel?: string;
  sectionId?: string;
}) {
  const stages = [
    {
      title: "Customer request",
      detail: "A call or form captures the right details once, while the customer is ready to move.",
      result: "Clean intake",
      icon: Phone,
    },
    {
      title: "Quote prepared",
      detail: "Approved pricing rules and customer information come together in a consistent quote.",
      result: "Faster response",
      icon: Gauge,
    },
    {
      title: "Project created",
      detail: "Accepted work becomes a usable project record without another round of manual entry.",
      result: "Clear handoff",
      icon: LayoutDashboard,
    },
  ];
  const [activeStage, setActiveStage] = useState(0);
  const ActiveIcon = stages[activeStage].icon;

  return (
    <section className="homepage-preview advanced-preview" id={sectionId} aria-labelledby={`${sectionId}-title`}>
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div className="homepage-preview-copy">
          <h2 id={`${sectionId}-title`}>A focused tool for the work between the work.</h2>
          <p>
            Calls, pricing rules, customer details, and project updates often live in separate places. We connect the
            parts that create repeated entry, slow handoffs, or missed context.
          </p>
          <a href={linkHref}>
            {linkLabel}
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
        <div className="advanced-preview-console">
          <div className="advanced-preview-tag" aria-hidden="true">
            <span>Connected workflow</span>
            <span>DGC / 002</span>
          </div>
          <div className="advanced-preview-flow" role="tablist" aria-label="Connected business workflow">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <React.Fragment key={stage.title}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeStage === index}
                    className={activeStage === index ? "is-active" : ""}
                    onClick={() => setActiveStage(index)}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{stage.title}</span>
                  </button>
                  {index < stages.length - 1 ? <ArrowRight size={16} aria-hidden="true" /> : null}
                </React.Fragment>
              );
            })}
          </div>
          <div className="advanced-preview-detail" role="tabpanel" aria-live="polite">
            <span className="advanced-preview-detail-icon"><ActiveIcon size={19} aria-hidden="true" /></span>
            <div>
              <strong>{stages[activeStage].result}</strong>
              <p>{stages[activeStage].detail}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowWeWorkPreview() {
  const steps = [
    {
      title: "Map",
      text: "Understand what comes in, what the team does, and where time is being lost.",
      icon: Route,
    },
    {
      title: "Define",
      text: "Choose the smallest useful fix and decide whether existing software can handle it.",
      icon: Search,
    },
    {
      title: "Build",
      text: "Set up, test, and improve the tool with the people who will use it.",
      icon: Wrench,
    },
  ];

  return (
    <section className="homepage-preview how-preview" id="workflow" aria-labelledby="how-preview-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="homepage-preview-heading">
          <h2 id="how-preview-title">How we work.</h2>
          <p>We map the process, identify the smallest useful fix, and build only where the workflow requires it.</p>
        </div>
        <ol className="how-preview-steps" data-stagger>
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.title}>
                <span className="how-preview-icon"><Icon size={18} aria-hidden="true" /></span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            );
          })}
        </ol>
        <a className="homepage-preview-link" href="/how-it-works/">
          See how an engagement works
          <ArrowRight size={15} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

const serviceDetails = [
  {
    title: "Build your presence",
    problem: "The business is difficult to understand or does not look as capable online as it is in person.",
    builds: "Modern websites, service pages, sales pages, and ongoing website care.",
    outcome: "A credible foundation that explains the offer and gives customers a clear next step.",
  },
  {
    title: "Get discovered",
    problem: "The right customers are searching, but the business is hard to find or hard for AI systems to interpret.",
    builds: "SEO, AEO, local search improvements, useful content, and focused campaigns.",
    outcome: "More qualified discovery without relying entirely on paid attention.",
  },
  {
    title: "Capture and schedule",
    problem: "Calls go unanswered, intake is inconsistent, or details are lost before the work is booked.",
    builds: "Phone agents, request forms, scheduling flows, and practical follow-up systems.",
    outcome: "Faster response and cleaner information before a team member takes over.",
  },
  {
    title: "Run the work",
    problem: "Quotes, files, customer updates, and project details are spread across too many tools.",
    builds: "Quote builders, dashboards, customer portals, training systems, and custom apps.",
    outcome: "Less repeated entry, clearer handoffs, and more capacity for customer work.",
  },
];

function ServiceArchitecture() {
  return (
    <section className="service-architecture" aria-labelledby="service-architecture-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="dedicated-heading">
          <h2 id="service-architecture-title">Start with the business problem.</h2>
          <p>Each engagement begins with the constraint, then moves to the appropriate tool or setup.</p>
        </div>
        <div className="service-detail-grid" data-stagger>
          {serviceDetails.map((item, index) => (
            <article key={item.title} data-index={String(index + 1).padStart(2, "0")}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <dl>
                <div><dt>Common problem</dt><dd>{item.problem}</dd></div>
                <div><dt>What we build</dt><dd>{item.builds}</dd></div>
                <div><dt>Business outcome</dt><dd>{item.outcome}</dd></div>
              </dl>
              <a href="/#cta">Discuss this stage <ArrowRight size={14} aria-hidden="true" /></a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ConnectedSystem() {
  const items = [
    { label: "Website request", icon: Globe2 },
    { label: "Phone agent", icon: Phone },
    { label: "Appointment", icon: Calendar },
    { label: "Quote", icon: Gauge },
    { label: "Project dashboard", icon: LayoutDashboard },
    { label: "Customer updates", icon: Bell },
  ];
  return (
    <section className="connected-system" aria-labelledby="connected-system-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="dedicated-heading">
          <h2 id="connected-system-title">
            The parts can
            <span>work together.</span>
          </h2>
          <p>A customer request should not need to be rebuilt at every step.</p>
        </div>
        <ol className="connected-flow" data-stagger>
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={item.label} className="connected-node">
                <span className="connected-node-rail" aria-hidden="true" />
                <span className="connected-node-orb" aria-hidden="true">
                  <Icon size={17} strokeWidth={1.75} />
                  <i>{String(index + 1).padStart(2, "0")}</i>
                </span>
                <strong>{item.label}</strong>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function EngagementProcess() {
  const stages = [
    "Initial conversation",
    "Process mapping",
    "Recommendation",
    "Build or setup",
    "Team testing",
    "Launch",
    "Ongoing improvement",
  ];
  return (
    <section className="engagement-process" aria-labelledby="engagement-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="dedicated-heading">
          <h2 id="engagement-title">A practical engagement from first conversation to launch.</h2>
          <p>You will know what is being decided, what we need from your team, and what happens next.</p>
        </div>
        <ol>
          {stages.map((stage, index) => (
            <li key={stage}><span>{String(index + 1).padStart(2, "0")}</span><strong>{stage}</strong></li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function QuoteWorkflowExample() {
  return (
    <section className="quote-workflow-example" aria-labelledby="quote-workflow-title">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
        <div className="homepage-preview-copy">
          <h2 id="quote-workflow-title">Turn pricing rules into a send-ready quote.</h2>
          <p>
            A focused quote builder can bring customer details, approved pricing, and scope options into one clear
            workflow. The team spends less time rebuilding documents and more time reviewing the work itself.
          </p>
          <a href="/#cta">
            Discuss your quoting process
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
        <div className="quote-workflow-demo">
          <ProductSceneCard step={workflowSteps[1]} index={1} />
        </div>
      </div>
    </section>
  );
}

function BuildPrinciples() {
  const principles = [
    ["Fix the expensive bottleneck first.", "We start where the current process costs the most in time, errors, or lost work."],
    ["Use existing software when it fits.", "If a tool you already trust can do the job, the right move is to set it up well, not rebuild it."],
    ["Build custom only where your process creates an advantage.", "Custom tools are reserved for the steps where the way you work is genuinely different."],
    ["Measure time removed, errors avoided, and capacity recovered.", "Success is a process that is faster and cleaner, not a longer list of features."],
  ];

  return (
    <section className="build-principles" aria-labelledby="build-principles-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="dedicated-heading">
          <h2 id="build-principles-title">A few principles decide what gets built.</h2>
          <p>The right answer may be existing software, a focused automation, or a custom tool. These keep that decision honest.</p>
        </div>
        <ol className="build-principles-list">
          {principles.map(([title, text], index) => (
            <li key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function DiscoveryDiagnosis() {
  const steps = [
    "Identify the expensive or frustrating constraint",
    "Map what comes in",
    "Map what the team currently does",
    "Define the required output",
    "Estimate the cost of the current process",
    "Determine whether existing software fits",
    "Recommend the smallest useful fix",
  ];

  return (
    <section className="engagement-process discovery-diagnosis" aria-labelledby="discovery-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="dedicated-heading">
          <h2 id="discovery-title">How we evaluate a process before building anything.</h2>
          <p>Diagnosis comes before tooling. We look at the real work first, then decide what, if anything, to build.</p>
        </div>
        <ol>
          {steps.map((step, index) => (
            <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function EngagementNotes() {
  const inputs = [
    ["A real process", "Bring the workflow that currently causes delay, repeated entry, or inconsistent handoffs."],
    ["The people doing the work", "We learn from the team members who know where the process bends and breaks."],
    ["Useful examples", "Existing forms, spreadsheets, quotes, and screenshots help us understand the work quickly."],
  ];

  const helpful = [
    "Current spreadsheets or forms",
    "Pricing sheets",
    "Sample calls, notes, or requests",
    "A list of the software you use today",
    "A short description of the current workflow",
    "The output you actually want",
    "Team members who can help test it",
  ];

  return (
    <section className="engagement-notes" aria-labelledby="engagement-notes-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="dedicated-heading">
          <h2 id="engagement-notes-title">What we need from your team.</h2>
          <p>You do not need a technical specification. We need a clear view of the work and access to the people who understand it.</p>
        </div>
        <div className="engagement-notes-grid" data-stagger>
          {inputs.map(([title, text], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="engagement-inputs">
          <span className="engagement-inputs-label">Helpful to have on hand</span>
          <ul>
            {helpful.map((item) => (
              <li key={item}><CheckCircle2 size={16} aria-hidden="true" />{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function HowItWorksFaq() {
  const faqs = [
    ["Do we need custom software?", "Often no. Many problems are solved by setting up or connecting tools you already have. Custom is for the steps where your process is genuinely different."],
    ["Can you configure existing software?", "Yes. Configuring and connecting trusted tools is frequently the fastest, lowest-risk fix and is where we look first."],
    ["Can we start with one small process?", "Yes. A focused first build is usually the best way to prove value and learn what should come next."],
    ["Do we need to replace our current tools?", "No. We aim to remove the friction around your tools, not force a migration you did not ask for."],
    ["How involved does our team need to be?", "Light but real involvement. Short feedback loops with the people who do the work keep the tool grounded and make adoption easier."],
    ["What happens after launch?", "We test with real work, fix what the first weeks reveal, and improve the tool as the process settles in."],
    ["Can the system grow later?", "Yes. We build the first useful piece in a way that leaves room for the next system when you are ready."],
    ["How do you decide whether a project is worth building?", "We estimate what the current process costs and compare it to the build. If the economics do not work, we tell you."],
  ];

  return (
    <section className="how-faq" aria-labelledby="how-faq-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="dedicated-heading">
          <h2 id="how-faq-title">Questions we hear before a build.</h2>
          <p>Straight answers about scope, tools, and what an engagement actually requires.</p>
        </div>
        <div className="engagement-faq">
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseStudyFuture() {
  return (
    <section className="case-study-future" aria-labelledby="case-study-future-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="case-study-future-card">
          <span className="case-study-future-tag">Case studies</span>
          <h2 id="case-study-future-title">Documented client results, coming soon.</h2>
          <p>
            The systems above are interactive demonstrations and representative builds. As current engagements
            reach measurable outcomes, we will publish them here as full case studies with real numbers.
          </p>
          <a href="/#cta">
            Talk to us about your process
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

function PageCTA() {
  return (
    <section className="page-cta" id="cta">
      <span className="page-cta-kicker">Start a conversation</span>
      <h2>Bring us the process that is still being handled by hand.</h2>
      <p>We will help determine whether the right answer is a better setup, a focused automation, or a custom tool.</p>
      <a className="button button-primary large" href="/#cta">Start Building <ArrowRight size={16} aria-hidden="true" /></a>
      <ul className="page-cta-trust" aria-label="What to expect">
        <li>Dayton roots, nationwide reach</li>
        <li>Reply within 24 hours</li>
        <li>No obligation</li>
      </ul>
    </section>
  );
}

function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 text-sm sm:px-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="footer-brand">
          <a href="/" className="footer-logo" aria-label="DaytonGrowthCo home">
            <img src={logoUrl} alt="" width="32" height="32" />
            <InteractiveWordmark />
          </a>
          <p>DaytonGrowthCo builds practical business tools around the way small teams already work.</p>
          <a className="client-portal-link" href="https://billing.stripe.com/p/login/28E6oG91M4fq77o4oAaMU00" target="_blank" rel="noopener noreferrer">Client Portal</a>
          <div className="social-links" aria-label="Social media">
            {socialLinks.map((link) => <a href={link.href} key={link.label} target="_blank" rel="noopener noreferrer">{link.label}</a>)}
          </div>
        </div>
        <nav className="footer-links" aria-label="Explore">
          <span className="footer-column-label">Explore</span>
          <a href="/what-we-build/">What We Build</a>
          <a href="/examples/">Examples</a>
          <a href="/how-it-works/">How It Works</a>
          <a href="/aboutus.html">About Us</a>
          <a href="/#cta">Start a Conversation</a>
        </nav>
        <nav className="footer-links" aria-label="Legal and contact">
          <span className="footer-column-label">Contact</span>
          <a href="mailto:help@daytongrowth.co">help@daytongrowth.co</a>
          <a href="tel:+19373677089">(937) 367-7089</a>
          <a href="/privacy-policy/">Privacy</a>
          <a href="/terms-of-service/">Terms</a>
          <a href="/disclaimer/">Disclaimer</a>
          <a href="/accessibility/">Accessibility</a>
        </nav>
      </div>
      <div className="footer-bottom">© {year} DaytonGrowthCo. LLC. All rights reserved.</div>
    </footer>
  );
}

function MetricsStrip() {
  return (
    <section className="metrics-strip" aria-label="At a glance">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <ul data-stagger>
          {metrics.map((metric) => (
            <li key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
              <small>{metric.detail}</small>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Homepage() {
  return (
    <>
      <SplashScreen />
      <div id="scroll-progress-bar" aria-hidden="true" />
      <ScrollDots />
      <Header />
      <main>
        <Hero />
        <BusinessJourney />
        <WebsiteTransformation />
        <AiVisibility />
        <EconomicCase />
        <HowWeWorkPreview />
        <MetricsStrip />
        <FounderPreview />
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}

function WhatWeBuildPage() {
  return (
    <>
      <div id="scroll-progress-bar" aria-hidden="true" />
      <Header />
      <main className="dedicated-page">
        <PageHero {...pageCopy.whatWeBuild} />
        <BusinessJourney showDetailLink={false} />
        <ServiceArchitecture />
        <FeatureGrid />
        <ConnectedSystem />
        <PageCTA />
      </main>
      <SiteFooter />
    </>
  );
}

function ExamplesPage() {
  return (
    <>
      <div id="scroll-progress-bar" aria-hidden="true" />
      <Header />
      <main className="dedicated-page">
        <PageHero {...pageCopy.examples} />
        <WebsiteTransformation showDetailLink={false} />
        <AiVisibility />
        <OutcomeSection />
        <SpreadsheetTransformation />
        <QuoteWorkflowExample />
        <AdvancedSystemPreview sectionId="connected-example" />
        <CaseStudyFuture />
        <PageCTA />
      </main>
      <SiteFooter />
    </>
  );
}

function HowItWorksPage() {
  return (
    <>
      <div id="scroll-progress-bar" aria-hidden="true" />
      <Header />
      <main className="dedicated-page">
        <PageHero {...pageCopy.howItWorks} />
        <BuildPrinciples />
        <DiscoveryDiagnosis />
        <StickyWorkflow />
        <EngagementProcess />
        <LaborCostCalculator />
        <EngagementNotes />
        <HowItWorksFaq />
        <PageCTA />
      </main>
      <SiteFooter />
    </>
  );
}

function App() {
  useMotionSystem();
  useMuxVideos();
  useTurnstileProtection();
  useScrollProgressFallback();

  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  useEffect(() => {
    if (path !== "/") {
      document.getElementById("boot-splash")?.remove();
      document.documentElement.classList.add("dgc-splash-seen");
      document.body.classList.remove("splash-lock");
    }

    const titles: Record<string, string> = {
      "/": "DaytonGrowthCo. | Practical Business Tools and Digital Systems",
      "/what-we-build": "What We Build | DaytonGrowthCo.",
      "/examples": "Examples | DaytonGrowthCo.",
      "/how-it-works": "How It Works | DaytonGrowthCo.",
    };
    document.title = titles[path] || titles["/"];
  }, [path]);

  let page: React.ReactNode = <Homepage />;
  if (path === "/what-we-build") page = <WhatWeBuildPage />;
  if (path === "/examples") page = <ExamplesPage />;
  if (path === "/how-it-works") page = <HowItWorksPage />;

  return <>{page}<Analytics /><SpeedInsights /></>;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
