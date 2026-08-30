"use client";

import React, { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getDomain } from "tldts";
import { Header } from "./site-header";
import { BrandWordmark } from "./brand-wordmark";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import {
  AppWindow,
  ArrowDown,
  ArrowRight,
  Calculator,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronsLeftRight,
  ClipboardList,
  Database,
  FileText,
  Gauge,
  Globe2,
  LayoutDashboard,
  MapPin,
  Megaphone,
  MessageSquare,
  MousePointer2,
  MoveRight,
  PanelTop,
  Phone,
  PhoneCall,
  Radar,
  Search,
  Send,
  Sparkles,
  StickyNote,
  Table,
  TrendingDown,
  TrendingUp,
  User,
  UserCheck,
  Workflow,
  Wrench,
  X,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type * as ThreeNS from "three";
import { DotMatrix } from "@/components/ui/dot-matrix";
import { KineticGrid } from "@/components/ui/kinetic-grid";
import { ClearInput } from "./clear-input";
import { socialLinks } from "./social-links";
import { BetterQuoteSavingsCalculator } from "./better-quote-savings-calculator";
import { websiteMigrationPricing } from "./website-migration-pricing";
import { captureAttribution, trackFunnelEvent } from "./funnel-analytics";
import {
  Accent,
  MiniDashboard,
  PositioningStatement,
  ProcessStepCard,
  ProofBand,
  ProofCard,
} from "./premium";
import clientProofStyles from "./client-proof.module.css";
import flagshipStyles from "./flagship-choice.module.css";
import homepageClarityStyles from "./homepage-clarity.module.css";
import appointRelayOfferStyles from "./appointrelay-offer.module.css";

// Register ScrollTrigger once for all scroll-driven sections. Safe in this
// client-rendered SPA (no SSR), and a no-op if called more than once.
gsap.registerPlugin(ScrollTrigger);

// The five services, in the order they assemble into a working system in the
// hero. Icons are Lucide; labels match the language used across the site.
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

const workflowSteps: WorkflowStep[] = [
  {
    label: "Inputs",
    title: "Calls, photos, and texts come in.",
    description: "Show us what arrives and what your team does with it by hand.",
    status: "Inputs mapped",
    output: "Working specification",
    progress: "20%",
    stage: "Mapped",
    rows: [
      { label: "Incoming", value: "Calls + photos" },
      { label: "Channel", value: "Texts + email" },
      { label: "Current file", value: "jobs.xlsx" },
    ],
  },
  {
    label: "Price sheet",
    title: "The pricing your team already uses.",
    description: "We load your real rates, materials, and markups as rules.",
    status: "Pricing loaded",
    output: "Pricing rules",
    progress: "40%",
    stage: "Loaded",
    rows: [
      { label: "Source", value: "Price sheet", tone: "accent" },
      { label: "Labor", value: "Hourly + crew" },
      { label: "Materials", value: "Cost + markup" },
    ],
  },
  {
    label: "Quote builder",
    title: "A quote builder for the estimator.",
    description: "We build the screen, the pricing rules, and the connections.",
    status: "Tool specified",
    output: "Quote builder",
    progress: "60%",
    stage: "Built",
    rows: [
      { label: "Screen", value: "Estimate builder", tone: "accent" },
      { label: "Rules", value: "Labor + materials" },
      { label: "Connects", value: "Customer record" },
    ],
  },
  {
    label: "Proposal",
    title: "A proposal the customer can read.",
    description: "The tool turns the estimate into a page they can review and approve.",
    status: "Proposal ready",
    output: "Proposal page",
    progress: "80%",
    stage: "Sent",
    rows: [
      { label: "Format", value: "Proposal page", tone: "success" },
      { label: "Customer", value: "Review + approve" },
      { label: "Delivery", value: "One link" },
    ],
  },
  {
    label: "Project",
    title: "Approved work becomes a project.",
    description: "An approval creates the job, with the details already in place.",
    status: "Project created",
    output: "Live project",
    progress: "100%",
    stage: "Live",
    rows: [
      { label: "Trigger", value: "Approval", tone: "success" },
      { label: "Created", value: "Project record" },
      { label: "Team", value: "Knows next step" },
    ],
  },
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
    area: "Quote & Proposal System",
    cost: "Rebuilding the same estimate from notes, price sheets, and memory.",
    system: "Turn your approved pricing, notes, photos, and scope into a consistent, send-ready quote.",
    return: "Faster response, consistent margins, less estimator time.",
  },
  {
    icon: Phone,
    area: "Phone Response System",
    cost: "Owners and field staff stopping work to answer routine calls or losing after-hours context.",
    system: "Answer routine calls, capture the details that matter, and hand your team a useful next step.",
    return: "Fewer interruptions and more appointments handled without adding a full shift.",
  },
  {
    icon: Workflow,
    area: "Operations Dashboard System",
    cost: "Copying details between texts, spreadsheets, PDFs, inboxes, and job folders.",
    system: "Keep intake, job details, approvals, files, and next actions in one working view.",
    return: "Less double entry, fewer missed details, more visible work.",
  },
  {
    icon: Sparkles,
    area: "Practical AI",
    cost: "Paying skilled people to summarize, sort, draft, classify, or search repetitive information.",
    system: "AI embedded at specific bottlenecks, with human review where judgment matters.",
    return: "Lower administrative load without handing control to a black box or paying custom-dev rates for repetitive work.",
  },
  {
    icon: Globe2,
    area: "Website Migration System",
    cost: "Sending paid traffic to an old site that makes the company look smaller or harder to trust.",
    system: "Move out of outdated platforms and plugin upkeep without losing the pages, search foundation, or inquiry flow worth keeping.",
    return: "More value from the traffic you already pay to earn.",
  },
  {
    icon: Search,
    area: "Discovery System",
    cost: "Depending on paid media while search engines and AI answers cannot interpret your expertise.",
    system: "Make your services easier for local customers, search engines, and AI answers to understand, then route inquiries into a cleaner intake process.",
    return: "A compounding discovery channel that reduces reliance on rented attention.",
  },
];

const logoUrl = "https://i.ibb.co/CsT0FbMq/Zoomed-Out-Logo.png";
const formAction =
  "https://script.google.com/macros/s/AKfycbxEUav9QVm2D2tOX3zIJednJl3t23DCeKNV2OW8MErA2BC2njJJpAkeH25sacvceX82rg/exec";
const videos = {
  hero: {
    src: "https://cdn.sceneai.art/Hero%20Section%20Video/060c6237-0a73-45f0-aea2-80291c52641d.mp4",
  },
  supportingFilm: {
    src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4",
  },
  process: {
    src: "https://pub-3592c0f33d62473e96882cebf2720dba.r2.dev/15404923_1920_1080_60fps.mp4",
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

// ---------------------------------------------------------------------------
// Visitor personalization
//
// A one-time, dismissible invitation collects the visitor's name, business,
// and team size. Once given, a few naturally occurring spots on the site quietly
// address the visitor and their business by name (the hero line, the AI-answer
// demo, and the contact form). It is stored in sessionStorage so a first-time
// visit gets the experience, but the same tab session is not nagged twice.
// ---------------------------------------------------------------------------

type VisitorProfile = {
  name: string;
  business: string;
  teamSize: string;
  email: string;
  domain: string;
};

const PROFILE_STORAGE_KEY = "dgc:visitor-profile";
const INVITE_DISMISSED_KEY = "dgc:personalize-dismissed";
const WORKFLOW_CHOICE_KEY = "dgc:workflow-choice";
const CONTACT_DRAFT_KEY = "dgc:contact-draft";

function readStoredProfile(): VisitorProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<VisitorProfile>;
    const name = typeof parsed.name === "string" ? parsed.name.trim() : "";
    const business = typeof parsed.business === "string" ? parsed.business.trim() : "";
    if (!name && !business) return null;
    return {
      name,
      business,
      teamSize: typeof parsed.teamSize === "string" ? parsed.teamSize : "",
      email: typeof parsed.email === "string" ? parsed.email.trim() : "",
      domain: typeof parsed.domain === "string" ? parsed.domain.trim() : "",
    };
  } catch {
    return null;
  }
}

function readStoredWorkflowChoice() {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(WORKFLOW_CHOICE_KEY) ?? "";
  } catch {
    return "";
  }
}

function firstNameOf(name: string) {
  return name.trim().split(/\s+/)[0] ?? "";
}

// A representative headcount for each friendly team-size band, used to seed the
// labor calculator. Conservative and clamped to the slider's 1–20 range.
function teamSizeToCount(teamSize: string): number | null {
  switch (teamSize) {
    case "Just me":
      return 1;
    case "2-10":
      return 5;
    case "11-50":
      return 18;
    case "50+":
      return 20;
    default:
      return null;
  }
}

// Turns a business name into a plausible domain for the AI-answer demo.
function businessToDomain(business: string) {
  const slug = business.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return `${slug || "yourbusiness"}.com`;
}

type PersonalizationValue = {
  profile: VisitorProfile | null;
  workflowChoice: string;
  save: (profile: VisitorProfile) => void;
  chooseWorkflow: (workflowId: string) => void;
  clear: () => void;
};

const PersonalizationContext = React.createContext<PersonalizationValue>({
  profile: null,
  workflowChoice: "",
  save: () => {},
  chooseWorkflow: () => {},
  clear: () => {},
});

function usePersonalization() {
  return useContext(PersonalizationContext);
}

function PersonalizationProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<VisitorProfile | null>(null);
  const [workflowChoice, setWorkflowChoice] = useState("");

  useEffect(() => {
    setProfile(readStoredProfile());
    setWorkflowChoice(readStoredWorkflowChoice());
  }, []);

  const save = useCallback((next: VisitorProfile) => {
    setProfile(next);
    try {
      window.sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch {
      /* Storage unavailable; the personalization lives for this page view only. */
    }
  }, []);

  const clear = useCallback(() => {
    setProfile(null);
    setWorkflowChoice("");
    try {
      window.sessionStorage.removeItem(PROFILE_STORAGE_KEY);
      window.sessionStorage.removeItem(INVITE_DISMISSED_KEY);
      window.sessionStorage.removeItem(WORKFLOW_CHOICE_KEY);
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
      window.localStorage.removeItem(INVITE_DISMISSED_KEY);
      window.localStorage.removeItem(WORKFLOW_CHOICE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const chooseWorkflow = useCallback((workflowId: string) => {
    setWorkflowChoice(workflowId);
    try {
      window.sessionStorage.setItem(WORKFLOW_CHOICE_KEY, workflowId);
      window.localStorage.removeItem(WORKFLOW_CHOICE_KEY);
    } catch {
      /* Storage unavailable; the selection still lives for this page view. */
    }
  }, []);

  const value = useMemo(
    () => ({ profile, workflowChoice, save, chooseWorkflow, clear }),
    [profile, workflowChoice, save, chooseWorkflow, clear],
  );
  return <PersonalizationContext.Provider value={value}>{children}</PersonalizationContext.Provider>;
}

const teamSizeOptions = ["Just me", "2-10", "11-50", "50+"];

function PersonalizationBrief({
  profile,
  workflowChoice,
  onEdit,
}: {
  profile: VisitorProfile;
  workflowChoice: string;
  onEdit: () => void;
}) {
  const firstName = firstNameOf(profile.name);
  const selectedWorkflow = workflowSimulationOptions.find((option) => option.id === workflowChoice);
  const teamLabel = profile.teamSize ? `${profile.teamSize} people` : "Team size to map";

  return (
    <div className="personalization-brief" role="region" aria-label="Your personalized working brief">
      <div className="personalization-brief-inner">
        <div className="personalization-brief-intro">
          <span className="personalization-brief-mark" aria-hidden="true"><Sparkles size={15} strokeWidth={1.8} /></span>
          <div>
            <strong>{firstName ? `${firstName}, your brief is ready for ${profile.business}.` : `Your brief is ready for ${profile.business}.`}</strong>
          </div>
        </div>
        <ol className="personalization-brief-points" key={`${profile.business}-${workflowChoice}`}>
          <li><span>Business</span><strong>{profile.business}</strong></li>
          <li><span>Team</span><strong>{teamLabel}</strong></li>
          <li className={selectedWorkflow ? "is-ready" : "is-pending"}>
            <span>Starting point</span>
            <strong>{selectedWorkflow ? selectedWorkflow.label : "Choose in the workflow map"}</strong>
          </li>
        </ol>
        <button type="button" className="personalization-brief-edit" onClick={onEdit}>
          Adjust details
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function PersonalizeInvite() {
  const { profile, workflowChoice, save, clear } = usePersonalization();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      setHidden(window.sessionStorage.getItem(INVITE_DISMISSED_KEY) === "1");
    } catch {
      setHidden(false);
    }
  }, []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessOverride, setBusinessOverride] = useState("");
  const [showBusinessOverride, setShowBusinessOverride] = useState(false);
  const [teamSize, setTeamSize] = useState("");
  const identity = useMemo(() => deriveBusinessIdentity(email), [email]);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile || hidden || open) return;
    let hasOpened = false;
    const openInvite = () => {
      if (hasOpened) return;
      hasOpened = true;
      setOpen(true);
    };
    const onScroll = () => {
      if (window.scrollY > Math.min(900, window.innerHeight * 1.1)) openInvite();
    };
    const timer = window.setTimeout(openInvite, 12000);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [profile, hidden, open]);

  // Keep the dialog entirely independent from the document beneath it. Saving
  // and restoring the exact coordinates prevents autofocus or scrollbar
  // changes from moving someone to a different section of the page.
  useLayoutEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const root = document.documentElement;
    const previousRootOverflow = root.style.overflow;
    const previousBody = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };

    document.body.classList.add("personalize-lock");
    root.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = `-${scrollX}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => nameInputRef.current?.focus({ preventScroll: true }), 80);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.classList.remove("personalize-lock");
      root.style.overflow = previousRootOverflow;
      document.body.style.position = previousBody.position;
      document.body.style.top = previousBody.top;
      document.body.style.left = previousBody.left;
      document.body.style.width = previousBody.width;
      document.body.style.overflow = previousBody.overflow;
      window.requestAnimationFrame(() => window.scrollTo({ left: scrollX, top: scrollY, behavior: "auto" }));
      previouslyFocused?.focus?.();
    };
  }, [open]);

  const dismiss = useCallback(() => {
    setOpen(false);
    setHidden(true);
    try {
      window.sessionStorage.setItem(INVITE_DISMISSED_KEY, "1");
      window.localStorage.removeItem(INVITE_DISMISSED_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim();
    const identity = deriveBusinessIdentity(email);
    const cleanEmail = email.trim().toLowerCase();
    const cleanBusiness = businessOverride.trim() || identity?.business || "";
    if (!cleanName && !cleanEmail) {
      dismiss();
      return;
    }
    save({ name: cleanName, business: cleanBusiness, teamSize, email: cleanEmail, domain: identity?.domain ?? "" });
    try {
      window.sessionStorage.setItem(INVITE_DISMISSED_KEY, "1");
      window.localStorage.removeItem(INVITE_DISMISSED_KEY);
    } catch {
      /* ignore */
    }
    setOpen(false);
    setHidden(true);
  };

  // Esc to close; a minimal focus trap keeps tabbing inside the card.
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      dismiss();
      return;
    }
    if (event.key !== "Tab") return;
    const focusables = cardRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (profile) {
    return (
      <PersonalizationBrief
        profile={profile}
        workflowChoice={workflowChoice}
        onEdit={() => {
          setName(profile.name);
          setEmail(profile.email);
          setBusinessOverride(profile.business);
          setTeamSize(profile.teamSize);
          setShowBusinessOverride(Boolean(profile.business));
          clear();
          setHidden(false);
          setOpen(true);
        }}
      />
    );
  }

  if (hidden) return null;

  return (
    <>
      <div className="personalize-inline" role="region" aria-labelledby="personalizeInlineTitle">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 id="personalizeInlineTitle">Make this less generic.</h2>
            <p>Three questions. No personality quiz. We promise.</p>
          </div>
          <div className="personalize-inline-actions">
            <button type="button" className="button button-primary" onClick={() => setOpen(true)}>
              Personalize this page
              <ArrowRight size={15} aria-hidden="true" />
            </button>
            <button type="button" className="personalize-skip" onClick={dismiss}>
              Not now
            </button>
          </div>
        </div>
      </div>
      {open && typeof document !== "undefined"
        ? createPortal(
          <div
          className="personalize-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) dismiss();
          }}
        >
          <div
            className="personalize-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="personalizeTitle"
            aria-describedby="personalizeBody"
            ref={cardRef}
            onKeyDown={onKeyDown}
          >
            <button type="button" className="personalize-close" aria-label="Close" onClick={dismiss}>
              <X size={18} aria-hidden="true" />
            </button>
            <h2 id="personalizeTitle" className="personalize-title">A more personal visit.</h2>
            <p id="personalizeBody" className="personalize-lead">
              Let’s make this about <span>your business.</span>
            </p>
            <form className="personalize-form" onSubmit={handleSubmit}>
              <label className="personalize-field">
                <span>Your name</span>
                <ClearInput
                  inputRef={nameInputRef}
                  type="text"
                  value={name}
                  autoComplete="given-name"
                  placeholder="Marcus"
                  onValueChange={setName}
                />
              </label>
              <label className="personalize-field">
                <span>Business email</span>
                <ClearInput
                  type="email"
                  value={email}
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@apple.com"
                  onValueChange={setEmail}
                  required
                  showClear={false}
                  wrapperClassName="email-favicon-input"
                  endAdornment={
                    identity ? <BusinessFavicon domain={identity.domain} /> : undefined
                  }
                />
              </label>
              {identity ? (
                <div className="personalize-derived-business" aria-live="polite">
                  <span>Personalizing for <strong>{businessOverride.trim() || identity.business}</strong></span>
                  <button type="button" onClick={() => setShowBusinessOverride((shown) => !shown)}>
                    {showBusinessOverride ? "Use domain name" : `Not ${identity.business}?`}
                  </button>
                </div>
              ) : email.trim() ? (
                <p className="personalize-email-note">Use a company email to personalize the page for your business.</p>
              ) : null}
              {showBusinessOverride ? (
                <label className="personalize-field personalize-override-field">
                  <span>Business name</span>
                  <ClearInput
                    type="text"
                    value={businessOverride}
                    autoComplete="organization"
                    placeholder={identity?.business ?? "Your business"}
                    onValueChange={setBusinessOverride}
                  />
                </label>
              ) : null}
              <div className="personalize-field">
                <span>Team size</span>
                <div className="personalize-chips" role="group" aria-label="Team size">
                  {teamSizeOptions.map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={`personalize-chip ${teamSize === option ? "is-active" : ""}`}
                      aria-pressed={teamSize === option}
                      onClick={() => setTeamSize((prev) => (prev === option ? "" : option))}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="button button-primary large personalize-submit">
                Personalize my visit
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              <button type="button" className="personalize-skip" onClick={dismiss}>
                Continue without personalizing
              </button>
            </form>
          </div>
          </div>,
          document.body,
        )
        : null}
    </>
  );
}

const workflowSimulationOptions = [
  {
    id: "calls",
    label: "24/7 phone answering",
    short: "Answer routine calls and book the next step.",
    icon: PhoneCall,
    before: ["Missed call", "Voicemail", "Callback", "Loose notes", "Maybe booked"],
    after: ["Call answered", "Job details", "Clean summary", "Route owner", "Book or escalate"],
    build: "24/7 phone answering & booking",
    href: "/ai-phone-agents/",
    need: "Common questions, service area, booking rules, and what should always go to a person.",
    notYet: "A new call center. Keep the people for the calls that need people.",
  },
  {
    id: "website",
    label: "Website migration",
    short: "Move platforms without losing what already works.",
    icon: Globe2,
    before: ["Old platform", "Plugin updates", "Hard-to-edit pages", "Lost context", "Lead flow at risk"],
    after: ["Useful pages kept", "Brand carried over", "Clear service pages", "Lead path checked", "Easy updates"],
    build: "Website migration",
    href: "/website-design/",
    need: "Your current site, the pages that matter, and a list of what cannot break.",
    notYet: "A blank replacement site that makes you start from scratch.",
  },
  {
    id: "followup",
    label: "Missed call & estimate follow-up",
    short: "Reply before the customer moves on.",
    icon: MessageSquare,
    before: ["Missed call", "Web lead", "Quote sent", "Busy day", "No next step"],
    after: ["Reply sent", "Lead captured", "Follow-up timed", "Owner alerted", "Reply recorded"],
    build: "Missed call text-back & estimate follow-up",
    href: "/missed-call-follow-up/",
    need: "Your follow-up timing, message tone, and when a person should take over.",
    notYet: "More messages than your customers want to receive.",
  },
  {
    id: "estimates",
    label: "Estimate & proposal tools",
    short: "Turn your pricing and job details into an approval.",
    icon: Calculator,
    before: ["Job photos", "Price sheet", "Notes", "Old proposal", "Manual follow-up"],
    after: ["Job details", "Pricing rules", "Draft proposal", "Online approval", "Deposit or next step"],
    build: "Estimate & proposal tool",
    href: "/quote-tools/",
    need: "A few real estimates, labor rates, materials, and the rules your team already trusts.",
    notYet: "A giant estimating platform with more tabs than your team needs.",
  },
  {
    id: "search",
    label: "Google & AI search",
    short: "Make it easier for homeowners to understand you.",
    icon: Search,
    before: ["Old service pages", "Thin Google listing", "Scattered proof", "Unclear service area", "Hard to verify"],
    after: ["Clear services", "Updated listing", "Useful proof", "Local signals", "Easy to understand"],
    build: "Google & AI search foundation",
    href: "/local-search/",
    need: "Your services, service areas, Google listing, and proof customers already trust.",
    notYet: "A pile of search jargon that does not help a homeowner choose you.",
  },
];

// The workflow and retainer pickers turn into horizontal scrollers on small
// screens. A quiet mobile-only "Swipe" cue signals the extra options exist,
// then fades the first time the track is actually scrolled.
function useSwipeHint<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollLeft > 6) setScrolled(true);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);
  return { ref, scrolled };
}

function SwipeHint({ hidden }: { hidden: boolean }) {
  return (
    <span className="picker-swipe-hint" data-hidden={hidden || undefined} aria-hidden="true">
      Swipe
      <ArrowRight size={13} aria-hidden="true" />
    </span>
  );
}

function WorkflowSimulation() {
  const { profile, workflowChoice, chooseWorkflow } = usePersonalization();
  const business = profile?.business?.trim() || "your business";
  const defaultId = workflowChoice || "calls";
  const [activeId, setActiveId] = useState(defaultId);
  const active = workflowSimulationOptions.find((option) => option.id === activeId) ?? workflowSimulationOptions[0];
  const ActiveIcon = active.icon;
  const briefLine = `${business}: ${active.build}`;
  const { ref: pickerRef, scrolled: pickerScrolled } = useSwipeHint<HTMLDivElement>();

  return (
    <section className={`workflow-sim${profile ? " is-personalized" : ""}`} id="workflow-sim" aria-labelledby="workflow-sim-title" data-reveal data-scroll-scene="workflow">
      <div className="workflow-sim-inner">
        <div className="workflow-sim-head">
          <div>
            <h2 id="workflow-sim-title" data-scroll-words>
              See one product in action.
            </h2>
          </div>
          <a className="workflow-sim-link" href={active.href}>
            Explore this product
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>

        <div className="workflow-sim-shell">
          <KineticGrid className="workflow-sim-grid" radius={220} strength={3} />
          <span className="grid-interaction-hint" aria-hidden="true">
            <MousePointer2 size={13} strokeWidth={1.8} />
            Move cursor over grid
          </span>
          <SwipeHint hidden={pickerScrolled} />
          <div className="workflow-sim-picker" ref={pickerRef} role="tablist" aria-label="Choose a workflow to simulate">
            {workflowSimulationOptions.map((option) => {
              const Icon = option.icon;
              const selected = active.id === option.id;
              return (
                <button
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`t-resize ${selected ? "is-active" : ""}`}
                  key={option.id}
                  onClick={() => {
                    setActiveId(option.id);
                    chooseWorkflow(option.id);
                  }}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>
                    <strong>{option.label}</strong>
                    <em>{option.short}</em>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="workflow-sim-board" key={active.id} role="tabpanel" aria-live="polite">
            <div className="workflow-sim-brief">
              <span className="workflow-sim-doc">
                <span className="workflow-sim-doc-mobile">Selected product</span>
              </span>
              <h3>
                <span className="workflow-sim-title-desktop">{briefLine}</span>
                <span className="workflow-sim-title-mobile">{active.build}</span>
              </h3>
              <p>A focused setup your team can review.</p>
            </div>

            <div className="workflow-lanes">
              <div className="workflow-lane workflow-lane-before">
                <span>Current setup</span>
                <ol>
                  {active.before.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
              <div className="workflow-lane workflow-lane-after">
                <span>When the product is in place</span>
                <ol>
                  {active.after.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="workflow-system-card">
              <span className="workflow-system-icon" aria-hidden="true">
                <ActiveIcon size={22} strokeWidth={1.8} />
              </span>
              <div>
                <span>Recommended product</span>
                <strong>{active.build}</strong>
              </div>
            </div>

            <div className="workflow-sim-notes">
              <div>
                <span>What we need</span>
                <p>{active.need}</p>
              </div>
              <div>
                <span>What you do not need</span>
                <p>{active.notYet}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RouteFocus() {
  const pathname = usePathname();

  useEffect(() => {
    const main = document.getElementById("main-content");
    if (!main) return;
    main.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}

function RouteTransition() {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    // Do not stack a page-entry animation over the existing section reveals.
    // The brief exit state is cleared once the new route is ready.
    document.documentElement.classList.remove("is-page-leaving");
  }, [pathname]);

  useEffect(() => {
    if (reduceMotion) return;
    let isNavigating = false;

    const handleDocumentClick = (event: MouseEvent) => {
      if (isNavigating || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download") || link.dataset.noPageTransition !== undefined) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.protocol !== window.location.protocol) return;
      const legalDocumentPaths = new Set(["/terms-of-service", "/terms-of-service/", "/privacy-policy", "/privacy-policy/", "/accessibility", "/accessibility/"]);
      // The legal overlay owns these links and preserves the reader's current
      // position. Do not turn them into a route transition first.
      if (legalDocumentPaths.has(destination.pathname)) return;
      if (destination.pathname === window.location.pathname) return;

      event.preventDefault();
      isNavigating = true;
      document.documentElement.classList.add("is-page-leaving");
      window.setTimeout(() => {
        router.push(`${destination.pathname}${destination.search}${destination.hash}`);
      }, 110);
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [reduceMotion, router]);

  return null;
}

function useTurnstileProtection() {
  useEffect(() => {
    const form = document.getElementById("auditForm") as HTMLFormElement | null;
    const configuredKey = document.querySelector<HTMLMetaElement>('meta[name="turnstile-site-key"]')?.content.trim();
    const isLocalPreview = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    // Cloudflare's documented always-pass key keeps local previews testable
    // without repeatedly rejecting the production hostname configuration.
    const key = isLocalPreview ? "1x00000000000000000000AA" : configuredKey;
    const container = document.getElementById("turnstileWidget");
    if (!form || !key || !container) return;

    const submitButton = form.querySelector<HTMLButtonElement>(".form-submit");
    const submitLabel = submitButton?.querySelector<HTMLElement>(".form-submit-label");
    const getStatus = () => document.getElementById("auditStatus");
    const successDialog = document.getElementById("formSuccessDialog") as HTMLDialogElement | null;
    const successPanel = document.getElementById("formSuccess");
    const closeSuccessDialog = document.getElementById("closeFormSuccess");
    let formStarted = false;
    const onFormFocus = () => {
      if (formStarted) return;
      formStarted = true;
      trackFunnelEvent("marketing-site", "marketing_contact_started");
    };
    form.addEventListener("focusin", onFormFocus);

    const setSubmitting = (isSubmitting: boolean) => {
      if (!submitButton) return;
      submitButton.disabled = isSubmitting;
      submitButton.dataset.loading = String(isSubmitting);
      submitButton.dataset.state = isSubmitting ? "sending" : submitButton.dataset.state === "sent" ? "sent" : "idle";
      submitButton.setAttribute("aria-busy", String(isSubmitting));
      if (submitLabel) {
        submitLabel.textContent = isSubmitting
          ? "Sending…"
          : submitButton.dataset.state === "sent"
            ? "Received"
            : "Send my request";
      }
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

    const playSuccessCheck = (root: ParentNode | null) => {
      root?.querySelectorAll<HTMLElement>(".t-success-check").forEach((icon) => {
        icon.dataset.state = "out";
        void icon.offsetWidth;
        icon.dataset.state = "in";
      });
    };

    const showCompletedState = () => {
      if (!successPanel) return;
      successPanel.hidden = false;
      playSuccessCheck(successPanel);
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

    // Field-level validation: instead of the browser's native bubbles, write a
    // specific message into the .field-error slot under each field and mark the
    // control aria-invalid. Errors clear as soon as the field becomes valid.
    type FieldControl = HTMLInputElement | HTMLTextAreaElement;
    const fieldConfig: Array<{ id: string; errorId: string; empty: string; invalid?: string }> = [
      { id: "contactName", errorId: "contactName-error", empty: "Tell us your name so we know who to reply to." },
      {
        id: "email",
        errorId: "email-error",
        empty: "Enter your email so we can send you next steps.",
        invalid: "Enter a valid email address, like name@company.com.",
      },
      { id: "details", errorId: "details-error", empty: "Tell us the workflow you want to fix, even one line helps." },
    ];

    const setFieldError = (control: FieldControl, errorEl: HTMLElement | null, message: string) => {
      if (message) {
        control.setAttribute("aria-invalid", "true");
        if (errorEl) errorEl.textContent = message;
      } else {
        control.removeAttribute("aria-invalid");
        if (errorEl) errorEl.textContent = "";
      }
    };

    const messageFor = (control: FieldControl, cfg: (typeof fieldConfig)[number]) => {
      if (control.validity.valid) return "";
      if (control.validity.valueMissing) return cfg.empty;
      if (control.validity.typeMismatch && cfg.invalid) return cfg.invalid;
      return cfg.invalid ?? cfg.empty;
    };

    const validateFields = (): FieldControl | null => {
      let firstInvalid: FieldControl | null = null;
      for (const cfg of fieldConfig) {
        const control = document.getElementById(cfg.id) as FieldControl | null;
        if (!control) continue;
        const message = messageFor(control, cfg);
        setFieldError(control, document.getElementById(cfg.errorId), message);
        if (message && !firstInvalid) firstInvalid = control;
      }
      return firstInvalid;
    };

    const clearAllFieldErrors = () => {
      for (const cfg of fieldConfig) {
        const control = document.getElementById(cfg.id) as FieldControl | null;
        if (control) setFieldError(control, document.getElementById(cfg.errorId), "");
      }
    };

    // Clear a field's error the moment it becomes valid while the user types.
    const clearFieldListeners: Array<() => void> = [];
    for (const cfg of fieldConfig) {
      const control = document.getElementById(cfg.id) as FieldControl | null;
      if (!control) continue;
      const onInput = () => {
        if (control.getAttribute("aria-invalid") === "true" && control.validity.valid) {
          setFieldError(control, document.getElementById(cfg.errorId), "");
        }
      };
      control.addEventListener("input", onInput);
      clearFieldListeners.push(() => control.removeEventListener("input", onInput));
    }

    const onSubmit = (event: SubmitEvent) => {
      event.preventDefault();
      const status = getStatus();

      const firstInvalid = validateFields();
      if (firstInvalid) {
        if (status) {
          status.dataset.variant = "error";
          status.textContent = "Please fix the highlighted fields before sending.";
        }
        firstInvalid.focus();
        return;
      }

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
      const crmPayload = {
        funnel: "marketing-site",
        name: String(payload.get("yourName") || ""),
        email: String(payload.get("emailAddress") || ""),
        business: String(payload.get("businessName") || ""),
        goal: String(payload.get("notes") || ""),
        serviceTier: String(payload.get("serviceTier") || ""),
        attribution: captureAttribution("marketing"),
      };

      fetch("/api/funnel-lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(crmPayload),
      })
        .then((response) => {
          if (!response.ok) throw new Error("CRM handoff failed");
          return fetch(form.action, { method: "POST", mode: "no-cors", body: payload });
        })
        .then(() => {
          trackFunnelEvent("marketing-site", "marketing_contact_submitted", {
            service_tier: crmPayload.serviceTier,
          });
          form.reset();
          try {
            window.sessionStorage.removeItem(CONTACT_DRAFT_KEY);
          } catch {
            /* The successful submission still stands if storage is unavailable. */
          }
          clearAllFieldErrors();
          if (submitButton) submitButton.dataset.state = "sent";
          if (submitLabel) submitLabel.textContent = "Received";
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
            playSuccessCheck(successDialog);
            closeSuccessDialog?.focus();
          } else if (successPanel) {
            showCompletedState();
          } else if (status) {
            status.dataset.variant = "success";
            status.textContent = "Request received. We’ll reply with next steps.";
          }
        })
        .catch(() => {
          if (submitButton) submitButton.dataset.state = "idle";
          if (status) {
            status.dataset.variant = "error";
            status.textContent = "Something went wrong. Try again, or email help@daytongrowth.co and we’ll follow up.";
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
      form.removeEventListener("focusin", onFormFocus);
      clearFieldListeners.forEach((remove) => remove());
      successDialog?.removeEventListener("close", onDialogClose);
      closeSuccessDialog?.removeEventListener("click", dismissSuccessDialog);
      if (turnstileApi && widgetId !== undefined) turnstileApi.remove(widgetId);
    };
  }, []);
}

function BackgroundVideo({
  className,
  src,
  poster,
  stream,
  playbackRate,
  preload = "auto",
  paused = false,
}: {
  className: string;
  src?: string;
  poster?: string;
  stream?: string;
  playbackRate?: number;
  preload?: "auto" | "metadata" | "none";
  paused?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduceMotion || paused) {
      video.pause();
      return;
    }

    const applyRate = () => {
      if (playbackRate) {
        try {
          video.playbackRate = playbackRate;
        } catch {
          /* ignore */
        }
      }
    };

    // Browsers may pause an offscreen, muted video to conserve resources.
    // Autoplay does not necessarily restart it when that video re-enters the
    // viewport, so explicitly resume it after a return from the CTA.
    let inView = true;
    let retryTimer: number | undefined;
    const resume = () => {
      if (document.hidden || !inView || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
      video.muted = true;
      video.playsInline = true;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          window.clearTimeout(retryTimer);
          retryTimer = window.setTimeout(resume, 250);
        });
      }
    };
    const onVisibilityChange = () => {
      if (!document.hidden) resume();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) resume();
      },
      { rootMargin: "160px 0px" },
    );

    applyRate(); // metadata may already be loaded
    observer.observe(video);
    video.addEventListener("loadedmetadata", applyRate);
    video.addEventListener("canplay", resume);
    video.addEventListener("stalled", resume);
    document.addEventListener("visibilitychange", onVisibilityChange);
    resume();

    return () => {
      window.clearTimeout(retryTimer);
      observer.disconnect();
      video.removeEventListener("loadedmetadata", applyRate);
      video.removeEventListener("canplay", resume);
      video.removeEventListener("stalled", resume);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [paused, playbackRate, reduceMotion]);

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      poster={poster}
      data-mux-stream={stream}
      autoPlay={!reduceMotion && !paused}
      muted
      loop
      playsInline
      preload={src ? preload : "none"}
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
  const before = ["Customer name", "Scope notes", "Quoted amount", "Next owner"];
  const after = ["One shared job record", "Approved estimate and scope", "Clear next action", "One accountable handoff"];

  return (
    <section id="case-study" className="spreadsheet-transform" aria-labelledby="spreadsheet-transform-heading">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="section-heading compact-heading spreadsheet-copy">
          <h2 id="spreadsheet-transform-heading">
            From scattered sheets to one working record.
          </h2>
          <p>For teams still running quotes, jobs, and customer work across disconnected files.</p>
        </div>
        <div className="record-contrast" aria-label="Illustrative before and after of a working record">
          <article className="record-contrast-before">
            <span className="record-kicker"><FileText size={16} aria-hidden="true" /> What is scattered</span>
            <h3>A spreadsheet is useful until the work moves.</h3>
            <ul>{before.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
          <div className="record-contrast-arrow" aria-hidden="true"><ArrowRight size={24} /></div>
          <article className="record-contrast-after">
            <span className="record-kicker"><LayoutDashboard size={16} aria-hidden="true" /> What the team uses</span>
            <h3>A shared record keeps the next decision visible.</h3>
            <ul>{after.map((item) => <li key={item}>{item}</li>)}</ul>
            <a href="/#cta">Talk through your current file <ArrowRight size={15} aria-hidden="true" /></a>
          </article>
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
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      setDisplay(value);
      return;
    }
    setDisplay(0);
    let frame = 0;
    const startCount = () => {
      if (started.current) return;
      started.current = true;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        // A crisp ease-out makes the value arrive quickly, then settle.
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(value * eased));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          startCount();
          observer.disconnect();
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
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
  const { profile } = usePersonalization();
  const business = profile?.business?.trim();
  const peopleAffected = teamSizeToCount(profile?.teamSize ?? "") ?? 3;
  // Short doc code from the business initials, e.g. "Watson Roofing" -> "WR".
  const sheetCode =
    business
      ? business
          .split(/\s+/)
          .map((word) => word[0])
          .join("")
          .toUpperCase()
          .replace(/[^A-Z]/g, "")
          .slice(0, 3) || "DGC"
      : "DGC";
  return (
    <section className="economic-case" id="economic-case" aria-labelledby="economic-case-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="economic-case-grid">
          <div className="economic-case-thesis" data-reveal>
            <h2 id="economic-case-title">
              Stop spending expert time on
              <span>copy, paste, repeat.</span>
            </h2>
            <p>
              Put skilled time back into customer work. Start with the repeat work that costs you most.
            </p>
          </div>

          <div className="homepage-cost-sheet-wrap" data-reveal>
            <div className="homepage-cost-sheet" aria-label="Example annual cost of a manual quoting process">
              <div className="homepage-sheet-top">
                <span>Process cost sheet</span>
                <span>{sheetCode} / 001</span>
              </div>
              <div className="homepage-sheet-title">
                <h3>Example: manual quoting</h3>
                <p>{business ? `For ${business} · conservative estimate` : "Conservative operating estimate"}</p>
                {profile?.teamSize ? <span className="homepage-sheet-profile">Starting model: {profile.teamSize} team</span> : null}
              </div>
              <dl className="homepage-sheet-inputs">
                <div><dt>{peopleAffected} {peopleAffected === 1 ? "person" : "people"}</dt><dd>affected</dd></div>
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
                Before counting faster quotes, fewer errors, additional jobs handled, or the lower build cost AI makes possible.
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

function LaborCostCalculator({ sectionId }: { sectionId?: string } = {}) {
  const { profile } = usePersonalization();
  const [people, setPeople] = useState(() => teamSizeToCount(profile?.teamSize ?? "") ?? 3);
  const [hours, setHours] = useState(5);
  const [rate, setRate] = useState(24);
  const [recovery, setRecovery] = useState(50);

  // A saved team band should meaningfully seed the estimate without taking
  // away the visitor's ability to tune any of the inputs afterward.
  useEffect(() => {
    const teamCount = teamSizeToCount(profile?.teamSize ?? "");
    if (teamCount) setPeople(teamCount);
  }, [profile?.teamSize]);

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
    <section className="labor-calculator" id={sectionId} aria-labelledby="labor-calculator-title">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div className="labor-calculator-copy" data-reveal>
          <h2 id="labor-calculator-title">What does manual work cost?</h2>
          <p>Estimate the recoverable labor tied up in one repeated workflow.</p>
          <div className="labor-formula">
            People × hours × rate × 50 weeks
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
            Directional estimate, not a magic number. We validate the assumptions before recommending a build.
          </p>
          <div className="labor-lead-bridge">
            <p>
              Seeing a number worth fixing? Send us the process. We’ll find the smallest useful build.
            </p>
            <a className="button button-primary" href="#cta">
              Send this estimate
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
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
  const { profile } = usePersonalization();
  const business = profile?.business?.trim();
  const queries = useMemo(() => {
    if (!business) return aiQueries;
    return [
      {
        topic: business,
        q: "Who should I hire for the work you do?",
        biz: business,
        domain: businessToDomain(business),
        personal: true,
      },
      ...aiQueries,
    ];
  }, [business]);

  const [active, setActive] = useState(0);
  const [optimized, setOptimized] = useState(true);
  const reduceMotion = useReducedMotion();

  // Keep the visitor's own business in focus whenever personalization changes.
  useEffect(() => {
    setActive(0);
  }, [business]);

  const query = queries[Math.min(active, queries.length - 1)];
  const isPersonal = "personal" in query && query.personal === true;

  return (
    <section className="section-shell ai-section" id="recommendation">
      <DotMatrix className="ai-section-dot-matrix" cellSize={26} frequency={0.72} speed={0.23} />
      <div className="ai-section-video-mask" aria-hidden="true" />
      <div className="ai-section-inner mx-auto max-w-6xl px-5 sm:px-8">
        <div className="section-heading ai-section-heading" data-reveal>
          <h2>
            Show up when customers
            <span>ask AI.</span>
          </h2>
          <p>
            Customers increasingly ask ChatGPT and Google AI who to hire. We help your business show up.
          </p>
        </div>

        <div className="ai-demo" data-reveal>
          <div className="ai-demo-bar">
            <div className="ai-chips" role="tablist" aria-label="Example questions">
              {queries.map((item, index) => (
                <button
                  key={item.topic}
                  type="button"
                  role="tab"
                  aria-selected={index === active}
                  className={`ai-chip ${index === active ? "is-active" : ""} ${
                    "personal" in item && item.personal ? "is-personal" : ""
                  }`}
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
                      {isPersonal ? (
                        <>
                          When customers ask for a recommendation, the clear top answer is <mark>{query.biz}</mark>, a
                          trusted business with fast scheduling and upfront pricing.
                        </>
                      ) : (
                        <>
                          For {query.topic.toLowerCase()} in Dayton, the clear top recommendation is{" "}
                          <mark>{query.biz}</mark>, a locally trusted business with fast scheduling and upfront pricing.
                        </>
                      )}
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
                      {isPersonal ? (
                        <>
                          There are a few options to consider, but I don’t have clear, current details to put{" "}
                          {query.biz} forward by name.
                        </>
                      ) : (
                        <>
                          There are a few {query.topic.toLowerCase()} options around Dayton, but I don’t have clear,
                          current details to recommend a specific local business.
                        </>
                      )}
                    </p>
                    <div className="ai-missing" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                      <em>{isPersonal ? `${query.biz} isn’t mentioned` : "Your business isn’t mentioned"}</em>
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

// A compact ROI model for the established programs. The migration tab
// compares platform rent with a self-owned site; Better Quote applies the
// published success-fee schedule; review growth keeps all value assumptions
// under the visitor's control and does not promise revenue or rankings.

type HeroRoiProduct = "website-migration" | "better-quote" | "review-growth";

const heroRoiProducts = {
  "website-migration": {
    tab: "Website migration",
    windowTitle: "website-migration · ROI",
    title: "Move your site without keeping the platform bill.",
    description: "Compare the cost of continuing to rent your website with moving it into a self-owned setup.",
  },
  "better-quote": {
    tab: "Better Quote Program",
    windowTitle: "better-quote · ROI",
    title: "Have an expensive quote? Let us shop it.",
    description: "Model the potential return after The Better Quote Program™ success fee is applied.",
  },
  "review-growth": {
    tab: "Review growth",
    windowTitle: "review-growth · ROI",
    title: "Make every eligible completed job a review opportunity.",
    description: "Model the cost and value of a consistent Google review request using your own assumptions.",
  },
} as const;

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function betterQuoteProgramFee(savings: number) {
  if (savings < 199) return 0;
  if (savings < 495) return 99;
  if (savings <= 2500) return savings * 0.2;
  return 500 + (savings - 2500) * 0.1;
}

function HeroRoiCalculator() {
  const [activeProduct, setActiveProduct] = useState<HeroRoiProduct>("website-migration");
  const [inputs, setInputs] = useState(() => ({
    "website-migration": {
      platformMonthly: 99,
      migrationCost: websiteMigrationPricing.standardMigration,
      years: 5,
    },
    "better-quote": {
      quoteValue: 12000,
      savingsRate: 15,
    },
    "review-growth": {
      eligibleJobs: 100,
      responseRate: 10,
      valuePerReview: 125,
    },
  }));
  const product = heroRoiProducts[activeProduct];
  const migrationInputs = inputs["website-migration"];
  const quoteInputs = inputs["better-quote"];
  const ownedDomainCost = migrationInputs.years * 15;
  const migrationOutlay = migrationInputs.migrationCost + ownedDomainCost;
  const platformCostAvoided = migrationInputs.platformMonthly * 12 * migrationInputs.years;
  const migrationNetSavings = platformCostAvoided - migrationOutlay;
  const migrationRoi = Math.round((migrationNetSavings / migrationOutlay) * 100);
  const monthlyPlatformSavings = migrationInputs.platformMonthly - 15 / 12;
  const migrationBreakEvenMonths = monthlyPlatformSavings > 0
    ? Math.ceil(migrationInputs.migrationCost / monthlyPlatformSavings)
    : 0;
  const qualifyingSavings = Math.round(quoteInputs.quoteValue * (quoteInputs.savingsRate / 100));
  const quoteProgramFee = Math.round(betterQuoteProgramFee(qualifyingSavings));
  const quoteNetSavings = qualifyingSavings - quoteProgramFee;
  const quoteRoi = quoteProgramFee > 0 ? Math.round((quoteNetSavings / quoteProgramFee) * 100) : null;
  const reviewInputs = inputs["review-growth"];
  const modeledReviewResponses = Math.round(reviewInputs.eligibleJobs * (reviewInputs.responseRate / 100));
  const modeledThirtyDayReviews = reviewInputs.eligibleJobs >= 100
    ? Math.max(20, modeledReviewResponses)
    : modeledReviewResponses;
  const annualModeledReviewValue = modeledThirtyDayReviews * 12 * reviewInputs.valuePerReview;
  const annualReviewProgramFee = 2500;
  const reviewRoi = Math.round(((annualModeledReviewValue - annualReviewProgramFee) / annualReviewProgramFee) * 100);
  const annualCostPerModeledReview = annualReviewProgramFee / Math.max(1, modeledThirtyDayReviews * 12);
  const results = activeProduct === "website-migration"
    ? [
        { label: "Estimated break-even", value: `${migrationBreakEvenMonths} mo` },
        { label: `${migrationInputs.years}-year net savings`, value: formatCompactCurrency(migrationNetSavings) },
        { label: `${migrationInputs.years}-year ROI`, value: `${migrationRoi > 0 ? "+" : ""}${migrationRoi}%`, primary: true },
      ]
    : activeProduct === "better-quote" ? [
        { label: "Qualifying savings", value: formatCompactCurrency(qualifyingSavings) },
        { label: "Program fee", value: formatCompactCurrency(quoteProgramFee) },
        { label: "ROI on the fee", value: quoteRoi === null ? "No fee" : `+${quoteRoi}%`, primary: true },
      ] : [
        { label: "30-day review model", value: `${modeledThirtyDayReviews} reviews` },
        { label: "Annual cost per modeled review", value: formatCompactCurrency(annualCostPerModeledReview) },
        { label: "Modeled annual ROI", value: `${reviewRoi > 0 ? "+" : ""}${reviewRoi}%`, primary: true },
      ];

  const updateMigrationValue = (key: "platformMonthly" | "migrationCost" | "years", value: number) => {
    setInputs((current) => ({
      ...current,
      "website-migration": { ...current["website-migration"], [key]: value },
    }));
  };

  const updateQuoteValue = (key: "quoteValue" | "savingsRate", value: number) => {
    setInputs((current) => ({
      ...current,
      "better-quote": { ...current["better-quote"], [key]: value },
    }));
  };

  const updateReviewValue = (key: "eligibleJobs" | "responseRate" | "valuePerReview", value: number) => {
    setInputs((current) => ({
      ...current,
      "review-growth": { ...current["review-growth"], [key]: value },
    }));
  };

  const selectProductFromKeyboard = (event: React.KeyboardEvent<HTMLButtonElement>, key: HeroRoiProduct) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const productKeys = Object.keys(heroRoiProducts) as HeroRoiProduct[];
    const currentIndex = productKeys.indexOf(key);
    const nextKey: HeroRoiProduct = event.key === "Home"
      ? productKeys[0]
      : event.key === "End"
        ? productKeys[productKeys.length - 1]
        : event.key === "ArrowRight"
          ? productKeys[(currentIndex + 1) % productKeys.length]
          : productKeys[(currentIndex - 1 + productKeys.length) % productKeys.length];
    setActiveProduct(nextKey);
    requestAnimationFrame(() => document.getElementById(`hero-roi-tab-${nextKey}`)?.focus());
  };

  return (
    <div className="hero-roi-card">
      <div className="hero-roi-windowbar">
        <span className="hero-roi-window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <strong>{product.windowTitle}</strong>
        <span className="hero-roi-live"><i aria-hidden="true" /> Live estimate</span>
      </div>

      <div className="hero-roi-tabs" role="tablist" aria-label="Choose a program to estimate">
        {(Object.keys(heroRoiProducts) as HeroRoiProduct[]).map((key) => (
          <button
            type="button"
            role="tab"
            id={`hero-roi-tab-${key}`}
            aria-controls="hero-roi-panel"
            aria-selected={activeProduct === key}
            tabIndex={activeProduct === key ? 0 : -1}
            className={activeProduct === key ? "is-active" : ""}
            onClick={() => setActiveProduct(key)}
            onKeyDown={(event) => selectProductFromKeyboard(event, key)}
            key={key}
          >
            {heroRoiProducts[key].tab}
          </button>
        ))}
      </div>

      <div
        className="hero-roi-panel"
        id="hero-roi-panel"
        role="tabpanel"
        aria-labelledby={`hero-roi-tab-${activeProduct}`}
      >
        <header className="hero-roi-copy">
          <h2>{product.title}</h2>
          <p>{product.description}</p>
        </header>

        {activeProduct === "website-migration" ? (
          <div className="hero-roi-controls">
            <label className="hero-roi-control">
              <span><b>Current website platform / month</b><output>{formatCompactCurrency(migrationInputs.platformMonthly)}</output></span>
              <input type="range" min="25" max="500" step="5" value={migrationInputs.platformMonthly} onInput={(event) => updateMigrationValue("platformMonthly", Number(event.currentTarget.value))} />
            </label>
            <label className="hero-roi-control">
              <span><b>Migration investment</b><output>{formatCompactCurrency(migrationInputs.migrationCost)}</output></span>
              <input type="range" min="1500" max="3000" step="500" value={migrationInputs.migrationCost} onInput={(event) => updateMigrationValue("migrationCost", Number(event.currentTarget.value))} />
            </label>
            <label className="hero-roi-control">
              <span><b>Years to compare</b><output>{migrationInputs.years} years</output></span>
              <input type="range" min="1" max="7" step="1" value={migrationInputs.years} onInput={(event) => updateMigrationValue("years", Number(event.currentTarget.value))} />
            </label>
          </div>
        ) : activeProduct === "better-quote" ? (
          <div className="hero-roi-controls hero-roi-controls-compact">
            <label className="hero-roi-control">
              <span><b>Current written quote</b><output>{formatCompactCurrency(quoteInputs.quoteValue)}</output></span>
              <input type="range" min="1000" max="50000" step="500" value={quoteInputs.quoteValue} onInput={(event) => updateQuoteValue("quoteValue", Number(event.currentTarget.value))} />
            </label>
            <label className="hero-roi-control">
              <span><b>Qualifying savings found</b><output>{quoteInputs.savingsRate}%</output></span>
              <input type="range" min="2" max="40" step="1" value={quoteInputs.savingsRate} onInput={(event) => updateQuoteValue("savingsRate", Number(event.currentTarget.value))} />
            </label>
          </div>
        ) : (
          <div className="hero-roi-controls">
            <label className="hero-roi-control">
              <span><b>Eligible residential jobs each month</b><output>{reviewInputs.eligibleJobs}</output></span>
              <input type="range" min="25" max="500" step="25" value={reviewInputs.eligibleJobs} onInput={(event) => updateReviewValue("eligibleJobs", Number(event.currentTarget.value))} />
            </label>
            <label className="hero-roi-control">
              <span><b>Published-review response rate</b><output>{reviewInputs.responseRate}%</output></span>
              <input type="range" min="1" max="25" step="1" value={reviewInputs.responseRate} onInput={(event) => updateReviewValue("responseRate", Number(event.currentTarget.value))} />
            </label>
            <label className="hero-roi-control">
              <span><b>Your value for one new review</b><output>{formatCompactCurrency(reviewInputs.valuePerReview)}</output></span>
              <input type="range" min="0" max="500" step="25" value={reviewInputs.valuePerReview} onInput={(event) => updateReviewValue("valuePerReview", Number(event.currentTarget.value))} />
            </label>
          </div>
        )}

        <div className="hero-roi-results" aria-live="polite" aria-atomic="true">
          {results.map((result) => <div className={result.primary ? "hero-roi-primary-result" : undefined} key={result.label}><span>{result.label}</span><strong>{result.value}</strong></div>)}
        </div>

        <p className="hero-roi-note">
          {activeProduct === "website-migration"
            ? "Illustrative estimate assumes about $15/year for a domain. Scope and pricing are confirmed in writing."
            : activeProduct === "better-quote"
              ? "Uses the published success-fee schedule. No qualifying savings means no fee; savings are not guaranteed."
              : "This is an illustrative model using your own value assumption. The 20-review guarantee applies only to qualifying HVAC companies after full production launch. No revenue, lead, rating, or ranking result is promised."}
        </p>
      </div>
    </div>
  );
}

function Hero() {
  const reduceMotion = useReducedMotion();
  const mediaRef = useRef<HTMLDivElement>(null);
  const { profile, clear } = usePersonalization();
  const business = profile?.business?.trim();

  // Keep the hero in its finished state through hydration. Adding a
  // visibility-changing class after the first paint made the complete hero
  // briefly disappear, then replay its entrance.

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
    <section id="top" className="hero-section homepage-motion-hero">
      <div className="hero-media" aria-hidden="true" ref={mediaRef}>
        <BackgroundVideo className="hero-product-video" src={videos.hero.src} playbackRate={0.75} />
        <div className="hero-product-video-mask" />
      </div>
      <div className="hero-content mx-auto max-w-7xl px-5 pt-28 sm:px-8 lg:pt-32">
        <div className="clay-hero-copy hero-entrance">
          <h1 className="hero-title" aria-label="Make repeated work simpler.">
            <span className="hero-line hero-line-primary" aria-hidden="true">Make repeated</span>
            <span className="hero-line hero-audience-line hero-statement-line" aria-hidden="true">
              <span className="hero-work-word">Work</span>
              <span className="hero-rotating-word">simpler.</span>
            </span>
          </h1>
          <p>
            Practical systems for local service businesses.
          </p>
          <div className="hero-actions">
            <a className="button button-primary large" href="#cta">
              Start a conversation
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a className="hero-flow-cue" href="#programs">
              <span>See how it fits together</span>
              <span className="hero-flow-cue-mark" aria-hidden="true">
                <ArrowDown size={14} />
              </span>
            </a>
          </div>
          {business ? (
            <p className="personalize-note">
              Tailored for {business}.{" "}
              <button type="button" className="personalize-note-reset" onClick={clear}>
                Reset
              </button>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function BusinessJourney() {
  const { profile } = usePersonalization();
  const business = profile?.business?.trim();
  return (
    <section className="business-journey" id="platform" aria-labelledby="business-journey-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="business-journey-heading" data-reveal>
          <h2 id="business-journey-title">
            From online presence
            <span>to the systems behind the work.</span>
          </h2>
          {business ? (
            <p className="business-journey-personal">A connected path, mapped for {business}.</p>
          ) : null}
        </div>

        <div className="business-journey-grid" aria-label="Four connected stages of the business" data-stagger>
          {businessJourney.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <article className="business-journey-card" key={stage.title} tabIndex={0}>
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

      </div>
    </section>
  );
}

function WebsiteMockup({ variant }: { variant: "before" | "after" }) {
  const isAfter = variant === "after";
  const { profile } = usePersonalization();
  const business = profile?.business?.trim();
  // The "after" mockup is the redesigned site. When we know the visitor's
  // business, show it there instead of the generic placeholder brand.
  const afterName = business || "Dayton Service Co.";
  const afterDomain = business ? businessToDomain(business) : "daytonserviceco.com";
  const serviceCards = isAfter
    ? ["Emergency repairs", "Maintenance plans", "Free estimate"]
    : ["Service one", "Service two", "More"];

  return (
    <div className={`website-mockup ${variant}`}>
      <div className="browser-bar" aria-hidden="true">
        <span />
        <span />
        <span />
        <small>{isAfter ? afterDomain : "old-business-site.net"}</small>
      </div>
      <div className="mockup-body">
        <header className="mockup-nav">
          <strong>{isAfter ? afterName : "ACME HOME SERVICES"}</strong>
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

function WebsiteTransformation() {
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
          <span className="section-eyebrow">01 — Website transformation</span>
          <h2 id="transformation-heading">From dated and unclear to focused and conversion-ready.</h2>
          <p>Keep what makes the business yours. Replace the outdated platform, unclear pages, and maintenance burden around it.</p>
          <ul className="transformation-outcomes">
            <li>Clearer service hierarchy</li>
            <li>Stronger primary action</li>
            <li>Mobile-first layout</li>
            <li>Easier content maintenance</li>
          </ul>
        </div>
        <div className="transformation-showcase">
          <KineticGrid className="comparison-grid" spacing={42} radius={210} strength={2.6} />
          <span className="grid-interaction-hint" aria-hidden="true">
            <MousePointer2 size={13} strokeWidth={1.8} />
            Move cursor over grid
          </span>
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
        </div>
      </div>
      <div className="website-migration-offer mx-auto max-w-7xl px-5 sm:px-8">
        <section className="migration-feature-grid" aria-labelledby="migration-feature-title">
          <article className="migration-feature-stack">
            <span className="migration-feature-eyebrow"><PanelTop size={15} aria-hidden="true" /> Current setup</span>
            <h3 id="migration-feature-title">Move the site forward without giving up control.</h3>
            <div className="migration-platforms" aria-label="Common website platforms">
              <span>WordPress</span><span>Wix</span><span>Squarespace</span>
            </div>
          </article>

          <article className="migration-feature-handoff">
            <span className="migration-feature-eyebrow"><Sparkles size={15} aria-hidden="true" /> One-off migration</span>
            <h3>A site your team can keep current without another dashboard.</h3>
            <p>Keep the services, search foundation, and lead flow that already work. Build a faster site your team can update in plain English, with support available when you want it.</p>
            <div className="migration-prompt-preview" aria-label="Example plain-English website update">
              <span>Update the spring service page</span>
              <strong>Published</strong>
            </div>
            <a className="link-arrow" href="#cta">Plan my migration <ArrowRight size={15} aria-hidden="true" /></a>
          </article>

          <article className="migration-feature-path">
            <span className="migration-feature-eyebrow"><Workflow size={15} aria-hidden="true" /> The Website Migration System</span>
            <ol>
              <li><span>01</span>Audit the pages, search foundations, and inquiry flow worth keeping.</li>
              <li><span>02</span>Turn the useful foundation into a clear migration blueprint.</li>
              <li><span>03</span>Build and test the new site before launch day.</li>
              <li><span>04</span>Launch without changing the business behind the domain.</li>
              <li><span>05</span>Show the team how to request simple updates in plain English.</li>
              <li><span>06</span>Keep improving the pages that matter as the business changes.</li>
            </ol>
          </article>

          <div className="migration-feature-benefits">
            <article>
              <Globe2 size={18} aria-hidden="true" />
              <strong>Keep the useful foundation</strong>
              <span>Services, search structure, and lead flow stay in scope.</span>
            </article>
            <article>
              <MessageSquare size={18} aria-hidden="true" />
              <strong>Make changes in plain English</strong>
              <span>Less plugin work. Fewer one-line change requests.</span>
            </article>
          </div>
        </section>
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
          <h2 id="margin-leak-title">Replace the friction that runs the business for you.</h2>
          <p>Start with the handoff, repeat task, or outdated system costing the most time. Then build the smallest system that gives your team control back.</p>
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
          {showAllFeatures ? "Hide systems" : "Explore the systems we build"}
          <ChevronDown size={16} aria-hidden="true" />
        </button>
        <div
          id="all-capabilities"
          className={`feature-all ${showAllFeatures ? "is-open" : ""}`}
          aria-hidden={!showAllFeatures}
        >
          <div className="feature-all-inner">
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
      </div>
    </section>
  );
}

function OutcomeSection() {
  return (
    <section className="section-shell outcome-section" id="outcomes">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="section-heading">
          <h2>Choose a bottleneck. See the first build.</h2>
          <p>Pick a common problem to see what a focused system could do.</p>
        </div>
        <ToolScenarioDemo />
      </div>
    </section>
  );
}

function PhoneAgentOffer() {
  const handoffs = [
    ["Answer", "Give callers a useful first response in your voice."],
    ["Capture", "Collect the service, urgency, and contact details once."],
    ["Hand off", "Send the right context to a person who can use it."],
  ];
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion ? undefined : { opacity: [0, 1], y: [10, 0] };

  return (
    <section id="appointrelay-system" className={appointRelayOfferStyles.section} aria-labelledby="phone-agent-offer-title">
      <div className={appointRelayOfferStyles.shell}>
        <motion.div
          className={appointRelayOfferStyles.copy}
          initial={false}
          whileInView={reveal}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.46, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 id="phone-agent-offer-title">Answer the call before it becomes a missed job.</h2>
          <p>
            The system handles the routine first response, captures the details your team needs, and sends the right work to a person when judgment matters.
          </p>
          <a className={appointRelayOfferStyles.action} href="/#cta">
            <span>Map my call flow</span>
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </motion.div>
        <ol className={appointRelayOfferStyles.steps} aria-label="Phone Response System handoff">
          {handoffs.map(([title, text], index) => (
            <motion.li
              key={title}
              className={appointRelayOfferStyles.step}
              initial={false}
              whileInView={reveal}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.42, delay: reduceMotion ? 0 : index * 0.075, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className={appointRelayOfferStyles.index} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <strong>{title}</strong>
              <p>{text}</p>
            </motion.li>
          ))}
        </ol>
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

// Pulls a likely domain out of whatever the visitor types (a bare domain, a full
// URL, with or without www) so we can show their site's favicon. Returns null for
// anything that is not a plausible domain, so nothing flickers mid-typing.
function extractDomain(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  let hostname = trimmed;
  try {
    hostname = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`).hostname;
  } catch {
    return null;
  }
  hostname = hostname.replace(/^www\./i, "");
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(hostname)) return null;
  if (!/\.[a-z]{2,}$/i.test(hostname)) return null;
  return hostname.toLowerCase();
}

// Consumer mailbox providers: their domain is the visitor's inbox, not their
// business, so we never show a favicon for these.
const CONSUMER_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "ymail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "gmx.com",
  "zoho.com",
  "mail.com",
  "yandex.com",
]);

// The domain after the "@" is, nine times out of ten, the visitor's business.
// Returns null for consumer mailboxes or anything that is not a real domain yet.
function extractEmailDomain(value: string): string | null {
  const at = value.lastIndexOf("@");
  if (at < 0) return null;
  const hostname = extractDomain(value.slice(at + 1));
  const domain = hostname ? getDomain(hostname, { allowPrivateDomains: true }) ?? hostname : null;
  if (!domain || CONSUMER_EMAIL_DOMAINS.has(domain)) return null;
  return domain;
}

type BusinessIdentity = {
  domain: string;
  business: string;
};

function formatBusinessName(domain: string) {
  const label = domain.split(".")[0] ?? "";
  const acronyms = new Map([
    ["ai", "AI"],
    ["hvac", "HVAC"],
    ["usa", "USA"],
    ["llc", "LLC"],
  ]);
  return label
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => acronyms.get(part.toLowerCase()) ?? `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

function deriveBusinessIdentity(email: string): BusinessIdentity | null {
  const domain = extractEmailDomain(email);
  if (!domain) return null;
  const business = formatBusinessName(domain);
  return business ? { domain, business } : null;
}

function BusinessFavicon({ domain, className = "" }: Pick<BusinessIdentity, "domain"> & { className?: string }) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const faviconSources = [
    `https://${domain}/favicon.ico`,
    `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`,
    `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(`https://${domain}`)}&sz=128`,
  ];
  const failed = sourceIndex >= faviconSources.length;

  useEffect(() => {
    setSourceIndex(0);
  }, [domain]);

  if (failed) return null;

  return (
    <span className={`business-favicon ${className}`.trim()} aria-hidden="true">
      <img
        key={`${domain}-${sourceIndex}`}
        src={faviconSources[sourceIndex]}
        alt=""
        width={22}
        height={22}
        onError={() => setSourceIndex((index) => index + 1)}
      />
    </span>
  );
}

function ProjectForm({ className = "" }: { className?: string }) {
  const { profile, workflowChoice } = usePersonalization();
  const selectedWorkflow = workflowSimulationOptions.find((option) => option.id === workflowChoice);
  const selectedOffer = coreProductOffers.find((offer) => offer.id === workflowChoice);

  // Seed the visible fields from the saved profile, but never overwrite what the
  // visitor types: once a field has been edited by hand it stops syncing.
  const [name, setName] = useState(profile?.name ?? "");
  const [business, setBusiness] = useState(profile?.business ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [details, setDetails] = useState("");
  const nameEdited = useRef(false);
  const businessEdited = useRef(false);
  const emailEdited = useRef(false);
  const draftHydrated = useRef(false);
  const hasSavedDetails = useRef(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(CONTACT_DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<{ name: string; business: string; email: string; details: string }>;
        if (typeof draft.name === "string") setName(draft.name);
        if (typeof draft.business === "string") setBusiness(draft.business);
        if (typeof draft.email === "string") setEmail(draft.email);
        if (typeof draft.details === "string") {
          hasSavedDetails.current = Boolean(draft.details.trim());
          setDetails(draft.details);
        }
      }
    } catch {
      /* The form remains usable without draft storage. */
    }
    draftHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!draftHydrated.current) return;
    try {
      window.sessionStorage.setItem(CONTACT_DRAFT_KEY, JSON.stringify({ name, business, email, details }));
    } catch {
      /* The form remains usable without draft storage. */
    }
  }, [business, details, email, name]);

  useEffect(() => {
    if (!draftHydrated.current || hasSavedDetails.current || !selectedOffer || details.trim()) return;
    setDetails(`I am interested in the ${selectedOffer.freeTitle}. Here is what is happening now: `);
  }, [details, selectedOffer]);

  // Derive a compact business favicon from a company email domain.
  const faviconDomain = useMemo(() => extractEmailDomain(email), [email]);

  useEffect(() => {
    if (profile?.name && !nameEdited.current) setName(profile.name);
    if (profile?.business && !businessEdited.current) setBusiness(profile.business);
    if (profile?.email && !emailEdited.current) setEmail(profile.email);
  }, [profile]);

  const detailsPlaceholder = "Estimates, follow-ups, scheduling, website updates...";

  return (
    <div className={`form-card ${className}`.trim()}>
      <form id="auditForm" method="POST" action={formAction} className="project-form" noValidate>
        <input type="hidden" name="mainGoal" value="Build a business tool" readOnly />
        <input type="hidden" name="serviceTier" value={selectedOffer ? selectedOffer.freeTitle : "Discuss the process"} readOnly />
        <input type="hidden" name="teamSize" value={profile?.teamSize ?? ""} readOnly />
        <input type="hidden" name="selectedWorkflow" value={selectedWorkflow?.label ?? "Not selected"} readOnly />
        <input type="hidden" name="suggestedFirstBuild" value={selectedWorkflow?.build ?? "Discuss the right first product"} readOnly />

        <label className="form-field" htmlFor="contactName">
          <span>Name *</span>
          <input
            id="contactName"
            name="yourName"
            type="text"
            autoComplete="name"
            placeholder="Marcus Reed"
            value={name}
            onChange={(event) => {
              nameEdited.current = true;
              setName(event.target.value);
            }}
            aria-describedby="contactName-error"
            required
          />
          <small className="field-error" id="contactName-error" role="alert" />
        </label>
        <label className="form-field" htmlFor="businessName">
          <span>Business</span>
          <input
            id="businessName"
            name="businessName"
            type="text"
            autoComplete="organization"
            placeholder="Dayton Roofing"
            value={business}
            onChange={(event) => {
              businessEdited.current = true;
              setBusiness(event.target.value);
            }}
          />
        </label>
        <label className="form-field email-form-field" htmlFor="email">
          <span>Email *</span>
          <div className="favicon-field">
            <input
              id="email"
              name="emailAddress"
              type="email"
              autoComplete="email"
              placeholder="marcus@company.com"
              value={email}
              onChange={(event) => {
                emailEdited.current = true;
                setEmail(event.target.value);
              }}
              aria-describedby="email-error"
              required
            />
            {faviconDomain ? <BusinessFavicon domain={faviconDomain} className="field-favicon" /> : null}
          </div>
          <small className="field-error" id="email-error" role="alert" />
        </label>
        <label className="form-field full project-details-field" htmlFor="details">
          <span>What’s taking too long? *</span>
          <textarea
            id="details"
            name="notes"
            rows={4}
            placeholder={detailsPlaceholder}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            aria-describedby="details-error"
            required
          />
          <small className="field-error" id="details-error" role="alert" />
        </label>
        <div id="turnstileWidget" className="turnstile-field" aria-label="Verification" />

        <button type="submit" className="button button-primary large form-submit">
          <span className="form-submit-label">Send request</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
        <p className="cta-trust form-cta-trust">Reply within 1 business day · No obligation</p>
        <a className="form-privacy-link" href="/privacy-policy/">Privacy policy</a>
        <div id="auditStatus" aria-live="assertive" className="form-status" />
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
        <span className="form-success-icon t-success-check" data-state="out" aria-hidden="true">
          <CheckCircle2 size={34} strokeWidth={2.25} />
        </span>
        <h3 id="formSuccessDialogTitle" className="form-success-title">Received</h3>
        <p id="formSuccessDialogMessage" className="form-success-message">
          We’ll reply within one business day with the next step for your selected product. Need to move sooner? <a href="/book-call">Book a call.</a>
        </p>
      </dialog>
      <div id="formSuccess" className="form-success" role="status" tabIndex={-1} hidden>
        <span className="form-success-icon t-success-check" data-state="out" aria-hidden="true">
          <CheckCircle2 size={34} strokeWidth={2.25} />
        </span>
        <h3 className="form-success-title">Received</h3>
        <p className="form-success-message">
          We’ll reply within one business day with the next step for your selected product. Need to move sooner? <a href="/book-call">Book a call.</a>
        </p>
      </div>
    </div>
  );
}

function FinalCTA() {
  const { profile } = usePersonalization();
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const firstName = firstNameOf(profile?.name ?? "");
  const business = profile?.business?.trim();
  return (
    <section id="cta" className="final-cta home-inquiry-repair">
      <BackgroundVideo className="home-inquiry-video" poster={videos.form.poster} stream={videos.form.stream} preload="metadata" paused={isVideoPaused} />
      <div className="home-inquiry-mask" aria-hidden="true" />
      <button
        type="button"
        className="home-inquiry-video-toggle"
        aria-pressed={isVideoPaused}
        onClick={() => setIsVideoPaused((paused) => !paused)}
      >
        {isVideoPaused ? "Play background video" : "Pause background video"}
      </button>
      <div className="home-inquiry-layout">
        <div className="final-cta-copy home-inquiry-copy">
          <h2>
            {firstName ? <span className="final-cta-greeting">{firstName},</span> : null}
            Tell us what repeats. We will help simplify it.
          </h2>
          <p>
            {business
              ? `Tell us what your team at ${business} still does by hand. We will identify the smallest useful automation and tell you if it is not worth building.`
              : "Tell us what your team still does by hand. We will identify the smallest useful automation and tell you if it is not worth building."}
          </p>
        </div>
        <ProjectForm className="home-inquiry-form" />
      </div>
    </section>
  );
}

// Cursor-tracking warm light on buttons: a soft highlight follows the pointer
// inside any .button via --mx/--my custom properties that the ::before glow reads.
// One delegated listener covers every button, including ones rendered later.
function useButtonGlow() {
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const button = target?.closest?.(".button") as HTMLElement | null;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      button.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      button.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);
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

// A one-shot choreography layer for explanatory sections. It only changes
// classes as sections cross the viewport; CSS owns the visual transitions so
// the motion remains smooth even while the page is busy.
function useScrollChoreography() {
  const pathname = usePathname();
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scenes = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-scene]"));
    if (!scenes.length) return;

    const itemSelector: Record<string, string> = {
      services: ".hover-card",
      process: ".process-step",
      workflow: ".workflow-sim-board > *",
      system: ".system-map-node",
      ledger: ".old-stack-row",
      audit: ".aoa-step",
    };
    const cleanups: Array<() => void> = [];

    scenes.forEach((scene) => {
      const key = scene.dataset.scrollScene ?? "";
      const items = Array.from(scene.querySelectorAll<HTMLElement>(itemSelector[key] ?? ":scope > *"));
      items.forEach((item, index) => item.style.setProperty("--scene-index", String(index)));

      if (reduceMotion || !("IntersectionObserver" in window)) {
        scene.classList.add("is-scroll-scene-ready");
        scene.classList.add("is-scene-active");
        items.forEach((item, index) => item.classList.toggle("is-current", index === 0));
        return;
      }

      // Two animation frames guarantee the browser paints the quiet starting
      // state before an intersection can activate the scene. Without that
      // separation, a fast observer callback can skip the transition entirely.
      let observeFrame = 0;
      const readyFrame = window.requestAnimationFrame(() => {
        scene.classList.add("is-scroll-scene-ready");
        observeFrame = window.requestAnimationFrame(() => {
          const sceneObserver = new IntersectionObserver(
            (entries) => {
              if (!entries.some((entry) => entry.isIntersecting)) return;
              scene.classList.add("is-scene-active");
              sceneObserver.disconnect();
            },
            { threshold: 0.18, rootMargin: "0px 0px -20% 0px" },
          );
          sceneObserver.observe(scene);
          cleanups.push(() => sceneObserver.disconnect());

          // Once a scene is active, the item nearest the reading line receives
          // a small persistent emphasis. This works for the service story,
          // process, system map, replacement rows, and mini-audit steps.
          if (key === "workflow") return;
          const itemObserver = new IntersectionObserver(
            (entries) => {
              const active = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0];
              if (!active) return;
              const activeIndex = items.indexOf(active.target as HTMLElement);
              if (activeIndex < 0) return;
              items.forEach((item, index) => {
                item.classList.toggle("is-current", index === activeIndex);
                item.classList.toggle("is-past", index < activeIndex);
              });
            },
            { threshold: 0.42, rootMargin: "-16% 0px -34% 0px" },
          );
          items.forEach((item) => itemObserver.observe(item));
          cleanups.push(() => itemObserver.disconnect());
        });
      });
      cleanups.push(() => {
        window.cancelAnimationFrame(readyFrame);
        window.cancelAnimationFrame(observeFrame);
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [pathname]);
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
      const isAppleNativeHls = navigator.vendor === "Apple Computer, Inc.";
      if (!src || !isAppleNativeHls || !video.canPlayType("application/vnd.apple.mpegurl")) return false;
      video.src = src;
      video.addEventListener("loadedmetadata", () => playQuietly(video), { once: true });
      video.load();
      return true;
    };

    const hlsInstances: Array<{ destroy: () => void }> = [];
    let cancelled = false;

    const attachHls = async (video: HTMLVideoElement) => {
      const { default: hlsGlobal } = await import("hls.js");
      if (cancelled) return;
      if (!hlsGlobal?.isSupported?.()) return;
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
      hlsInstances.push(hls);
    };

    // Begin loading a single video. Safari plays HLS natively; everyone else
    // gets hls.js, fetched on demand.
    const activate = (video: HTMLVideoElement) => {
      if (video.dataset.muxActivated === "true") return;
      video.dataset.muxActivated = "true";
      if (loadNativeHls(video)) return;
      void attachHls(video);
    };

    // Gate buffering on viewport proximity: a below-the-fold background video
    // (and the hls.js script) should not eat bandwidth until the visitor is
    // about to reach it. Matters most for the mobile, between-jobs audience.
    if (typeof IntersectionObserver === "undefined") {
      videoEls.forEach(activate);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          activate(entry.target as HTMLVideoElement);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "200px 0px" },
    );
    videoEls.forEach((video) => observer.observe(video));

    return () => {
      cancelled = true;
      observer.disconnect();
      hlsInstances.forEach((hls) => {
        try {
          hls.destroy();
        } catch {
          /* ignore */
        }
      });
    };
  }, []);
}

function useScrollProgressFallback() {
  useEffect(() => {
    const bar = document.getElementById("scroll-progress-bar");
    if (!bar) return;

    // Drive the bar with JS on every device rather than the CSS scroll-timeline.
    // On mobile, the scroll-timeline range shifts as the URL bar shows/hides,
    // which made the bar visibly regress when scrolling stopped. Recomputing the
    // real ratio inside requestAnimationFrame keeps it accurate and smooth.
    const doc = document.documentElement;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const max = doc.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? doc.scrollTop / max : 0;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    };
    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
}

function AdvancedSystemPreview({ sectionId = "outcomes" }: { sectionId?: string }) {
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
          <p>Connect customer details, pricing, and project updates without entering the same information twice.</p>
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

const serviceDetails = [
  {
    title: "Website Migration System",
    problem: "Your WordPress, Wix, Squarespace, or agency site is hard to keep current.",
    builds: "Move the useful foundation into a modern system your team can manage without another dashboard.",
    outcome: "A faster site you control, with support available when you want it.",
  },
  {
    title: "Discovery System",
    problem: "The right customers are searching, but they cannot find or understand your business.",
    builds: "Improve local visibility, clear service information, and the path from search to inquiry.",
    outcome: "More qualified discovery without depending only on paid ads.",
  },
  {
    title: "Phone Response System",
    problem: "Calls go unanswered or details get lost before the work is booked.",
    builds: "Capture the right information and give the team a clear next step.",
    outcome: "Faster replies and cleaner handoffs.",
  },
  {
    title: "Operations Dashboard System",
    problem: "Quotes, files, and project details are spread across too many tools.",
    builds: "Create one working flow that reduces re-entry and missed handoffs.",
    outcome: "Less re-entry, clearer handoffs, and more customer time.",
  },
];

function ServiceArchitecture() {
  return (
    <section className="service-architecture" aria-labelledby="service-architecture-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="dedicated-heading">
          <h2 id="service-architecture-title">One operating model. Focused systems for the work that creates friction.</h2>
        </div>
        <div className="service-detail-grid" data-stagger>
          {serviceDetails.map((item, index) => (
            <article key={item.title} data-index={String(index + 1).padStart(2, "0")}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <dl>
                <div><dt>When it hurts</dt><dd>{item.problem}</dd></div>
                <div><dt>What fixes it</dt><dd>{item.builds}</dd></div>
                <div><dt>Why it pays</dt><dd>{item.outcome}</dd></div>
              </dl>
              <a href="/#cta">Discuss this stage <ArrowRight size={14} aria-hidden="true" /></a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuoteWorkflowExample() {
  const quoteInputs = ["Approved labor rules", "Material markup", "Scope and exclusions"];
  return (
    <section className="quote-workflow-example" aria-labelledby="quote-workflow-title">
      <div className="section-film-media" aria-hidden="true">
        <BackgroundVideo className="section-film-video" src={videos.process.src} playbackRate={0.55} preload="metadata" />
      </div>
      <div className="section-film-mask" aria-hidden="true" />
      <div className="quote-workflow-shell mx-auto max-w-7xl px-5 sm:px-8">
        <div className="homepage-preview-copy">
          <h2 id="quote-workflow-title">Turn pricing rules into a send-ready quote.</h2>
          <p>Use the pricing your team has already approved, then make the next quote easier to review and send.</p>
          <a href="/#cta">
            Discuss your quoting process
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
        <div className="quote-workflow-demo" aria-label="Illustrative quote workflow">
          <div className="quote-workflow-source">
            <span>Inputs that already exist</span>
            <ul>{quoteInputs.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <ArrowRight className="quote-workflow-arrow" size={22} aria-hidden="true" />
          <div className="quote-workflow-result">
            <span>Quote ready to review</span>
            <strong>Clear scope. Consistent price. One next step.</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function BuildPrinciples() {
  const principles = [
    ["Fix the expensive bottleneck first.", "Start where time, errors, or lost work cost the most."],
    ["Use existing software when it fits.", "Set up the tools that already work. Build only what is unique."],
    ["Build custom where it creates an advantage.", "Reserve custom work for the parts of your process that are genuinely different."],
    ["Measure what improves.", "Success is less time and fewer errors—not more features."],
  ];

  return (
    <section className="build-principles" aria-labelledby="build-principles-title">
      <div className="build-principles-media" aria-hidden="true">
        <BackgroundVideo className="build-principles-video" src={videos.process.src} playbackRate={0.55} preload="metadata" />
      </div>
      <div className="build-principles-film-mask" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="dedicated-heading">
          <h2 id="build-principles-title">Find the bottleneck. Fix only what matters.</h2>
          <p>We start with the highest-cost friction, prove the economics, and build only what the work requires.</p>
        </div>
        <div className="build-principles-list" role="list">
          {principles.map(([title, text]) => (
            <article key={title} role="listitem">
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DiscoveryDiagnosis() {
  const steps = [
    ["Start with the constraint", "Find the repeated handoff, delay, or error that costs the most."],
    ["Follow the current work", "Review what comes in, who handles it, and what needs to come out."],
    ["Check the economics", "Estimate the time, missed work, and re-entry the current process creates."],
    ["Choose the smallest fix", "Use existing software when it fits. Build only the missing part."],
  ];

  return (
    <section className="engagement-process discovery-diagnosis" aria-labelledby="discovery-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="dedicated-heading">
          <h2 id="discovery-title">How we evaluate a process before building anything.</h2>
          <p>Before recommending software, we map the current workflow and determine the smallest useful intervention.</p>
        </div>
        <div className="discovery-path" role="list">
          {steps.map(([title, text], index) => <React.Fragment key={title}>
            <article role="listitem"><strong>{title}</strong><p>{text}</p></article>
            {index < steps.length - 1 ? <ArrowRight className="discovery-path-arrow" size={18} aria-hidden="true" /> : null}
          </React.Fragment>)}
        </div>
      </div>
    </section>
  );
}

function EngagementNotes() {
  const inputs = [
    ["Bring one real process", "Show us where work gets delayed, repeated, or handed off."],
    ["Include the people closest to it", "The people doing the work keep the solution grounded."],
    ["Share a useful example", "A form, spreadsheet, quote, or screenshot helps us see the work quickly."],
  ];

  const helpful = [
    "A current form or spreadsheet",
    "A pricing sheet",
    "A few real requests or notes",
    "The output you want",
  ];

  return (
    <section className="engagement-notes" aria-labelledby="engagement-notes-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="dedicated-heading">
          <h2 id="engagement-notes-title">What we need from your team.</h2>
          <p>You do not need a polished specification. We need enough real material to understand the work before we recommend a change.</p>
        </div>
        <div className="engagement-notes-grid" data-stagger>
          {inputs.map(([title, text]) => (
            <article key={title}>
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
  const [open, setOpen] = useState(0);
  const faqs = [
    ["Do we need custom software?", "Often no. Many problems are solved by setting up or connecting tools you already have. Custom is for the steps where your process is genuinely different."],
    ["How can custom work be this affordable?", "AI-assisted development reduces build hours. The work still starts with your process and ends with a tool your team can use."],
    ["Can we start with one small process?", "Yes. A focused first build is usually the best way to prove value and learn what should come next."],
    ["Do we need to replace our current tools?", "No. We aim to remove the friction around your tools, not force a migration you did not ask for."],
    ["How involved does our team need to be?", "Light but real involvement. Short feedback loops with the people who do the work keep the tool grounded and make adoption easier."],
    ["What happens after launch?", "We test with real work, fix what the first weeks reveal, and improve the tool as the process settles in."],
    ["How do you decide whether a project is worth building?", "We compare the cost of the current process with the likely value of fixing it. If the economics do not work, we tell you."],
  ];

  return (
    <section className="how-faq" aria-labelledby="how-faq-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="how-faq-intro">
          <div><h2 id="how-faq-title">Before we start, we make the next step clear.</h2><p>Bring what you have. We will tell you what is useful, what is not, and whether the work is worth pursuing.</p></div>
          <ul className="how-faq-prep" aria-label="Helpful preparation">
            <li><CheckCircle2 size={16} aria-hidden="true" />One current form or spreadsheet</li>
            <li><CheckCircle2 size={16} aria-hidden="true" />A few recent requests or notes</li>
            <li><CheckCircle2 size={16} aria-hidden="true" />The outcome your team needs</li>
          </ul>
        </div>
        <div className="engagement-faq" aria-label="Frequently asked questions">
          {faqs.map(([q, a], index) => {
            const isOpen = open === index;
            return (
              <div
                key={q}
                className={`engagement-faq-item t-acc ${isOpen ? "is-open" : ""}`}
                data-open={isOpen ? "true" : "false"}
              >
                <button
                  type="button"
                  className="engagement-faq-summary t-acc-head"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : index)}
                >
                  <span>{q}</span>
                  <ChevronDown className="t-acc-chevron" size={18} aria-hidden="true" />
                </button>
                <div className="engagement-faq-panel t-acc-panel">
                  <div className="engagement-faq-panel-inner t-acc-panel-inner">
                    <p>{a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PageCTA() {
  const { profile } = usePersonalization();
  const business = profile?.business?.trim();
  return (
    <section className="page-cta" id="cta">
      <BackgroundVideo className="page-cta-video" src={videos.supportingFilm.src} playbackRate={0.58} preload="metadata" />
      <div className="page-cta-film-mask" aria-hidden="true" />
      <h2>{business ? `Bring us the work ${business} still handles by hand.` : "Bring us the work still handled by hand."}</h2>
      <p>We’ll find the smallest useful fix.</p>
      <a className="button button-primary large" href="/#cta">Start your build <ArrowRight size={16} aria-hidden="true" /></a>
    </section>
  );
}

type ServicePageConfig = {
  eyebrow: string;
  title: string;
  description: string;
  productId?: string;
  productName?: string;
  bestFor?: string;
  whyItWorks?: string;
  freeStart?: {
    title: string;
    description: string;
    input: string;
    cta: string;
  };
  outcomes: string[];
  examples: string[];
  related: Array<{ href: string; label: string; description: string }>;
};

const servicePages: Record<string, ServicePageConfig> = {
  "/ai-phone-agents": {
    eyebrow: "24/7 Phone Answering & Booking",
    productId: "calls",
    productName: "24/7 Phone Answering & Booking",
    title: "Give every caller a useful next step.",
    description:
      "We answer routine calls, collect the job details your team needs, book the next step, and send urgent calls to a person.",
    bestFor: "Service businesses that miss calls while driving, working, or helping another customer.",
    whyItWorks: "A fast, useful answer keeps the customer moving before they call the next company.",
    freeStart: {
      title: "Free 7-Day Missed-Call Trial",
      description: "We handle missed calls for seven days so you can see the replies, captured job details, and handoffs on real calls.",
      input: "Your phone setup, trade, service area, and typical missed-call volume.",
      cta: "Start the 7-day trial",
    },
    outcomes: ["Capture the request while the caller is still engaged", "Answer routine questions from approved business information", "Send a clean summary to the right person", "Escalate exceptions instead of pretending every call is the same"],
    examples: ["New-lead intake and appointment requests", "After-hours call coverage", "Service-area, availability, and job-question routing"],
    related: [
      { href: "/quote-tools/", label: "Estimate & Proposal Tools", description: "Turn the details from a call into a consistent, send-ready estimate." },
      { href: "/dashboards-portals/", label: "Dashboards & Portals", description: "Give your team one place to see requests, jobs, and next steps." },
      { href: "/how-it-works/", label: "How It Works", description: "See how we map a workflow before deciding what to build." },
    ],
  },
  "/quote-tools": {
    eyebrow: "Estimate & Proposal Tools",
    productId: "estimates",
    productName: "Estimate & Proposal Tools",
    title: "Send clear quotes without rebuilding the same estimate.",
    description:
      "We turn your pricing rules, scope options, and customer details into a simple tool that creates a consistent, send-ready estimate.",
    bestFor: "Teams that price the same common jobs by hand or rebuild proposals from old files.",
    whyItWorks: "The tool uses the rates and rules your team already trusts, so speed does not come at the cost of accuracy.",
    freeStart: {
      title: "Free Quote Tool for One Common Job",
      description: "Send one price sheet and we will turn one recurring job into a working quote tool your team can try.",
      input: "Your trade, one common job type, price sheet, and pricing method.",
      cta: "Build one free quote tool",
    },
    outcomes: ["Apply your real pricing rules consistently", "Reduce slow back-and-forth before a quote goes out", "Keep scope, totals, and follow-up details together", "Make the next step obvious for your customer and team"],
    examples: ["Service estimates with labor and materials rules", "Proposal builders for recurring sales workflows", "Simple calculators that qualify a request before a call"],
    related: [
      { href: "/ai-phone-agents/", label: "24/7 Phone Answering & Booking", description: "Capture a caller's details before the quote process begins." },
      { href: "/dashboards-portals/", label: "Dashboards & Portals", description: "Track quotes, jobs, and follow-up after the estimate is sent." },
      { href: "/products/", label: "Products", description: "Explore the full set of practical systems we build for small teams." },
    ],
  },
  "/dashboards-portals": {
    eyebrow: "Dashboards and portals",
    title: "Put the right work, information, and next step in one place.",
    description:
      "We build focused dashboards and portals that replace scattered spreadsheets, status messages, and repeated handoffs. The goal is a usable view of the work—not another system people avoid.",
    outcomes: ["See requests, jobs, and owners without chasing updates", "Give customers or staff a simple, appropriate view", "Replace repeated spreadsheet cleanup with one dependable workflow", "Keep decisions tied to the information that supports them"],
    examples: ["Project and job-status dashboards", "Customer portals for updates and documents", "Internal staff dashboards and training libraries"],
    related: [
      { href: "/quote-tools/", label: "Estimate & Proposal Tools", description: "Move a completed estimate into the workflow your team already follows." },
      { href: "/ai-phone-agents/", label: "24/7 Phone Answering & Booking", description: "Route call details to a dashboard instead of losing them in messages." },
      { href: "/website-design/", label: "Website Redesign", description: "Connect a clear public website to the operational systems behind it." },
    ],
  },
  "/website-design": {
    eyebrow: "Website Redesign Services in Dayton, OH",
    productId: "website",
    productName: "Website Redesign",
    title: "Website redesign services for Dayton businesses that need a clearer path to the next customer.",
    description:
      "As a Dayton web design and website redesign partner, we rebuild business websites around the questions customers ask before they call: what you do, who you help, why they should trust you, and what happens next.",
    bestFor: "Dayton business owners whose current website is dated, slow, unclear, or not turning enough visitors into calls and quote requests.",
    whyItWorks: "A redesign starts with the offer, service pages, proof, and next step—not a decorative template. Useful content and lead paths are protected as the site becomes easier to understand and use.",
    freeStart: {
      title: "Free Homepage Rebuild Preview",
      description: "See how your homepage could make the service, proof, and next step clearer before deciding on a full redesign.",
      input: "Your website URL, business, main service, and the action you want more visitors to take.",
      cta: "Request a homepage preview",
    },
    outcomes: ["Explain your offer before visitors decide to leave", "Give every core service a dedicated, findable page", "Make calls, quote requests, and booking paths easier to act on", "Keep the useful content, domain, and analytics that already support the business"],
    examples: ["Website redesigns for Dayton service and field-service businesses", "Focused service pages with clear calls and quote paths", "Website rebuilds that preserve useful content and lead flow"],
    related: [
      { href: "/products/", label: "Products", description: "See how websites fit alongside tools, automation, and operational systems." },
      { href: "/ai-phone-agents/", label: "24/7 Phone Answering & Booking", description: "Make sure a new inquiry has a useful next step when it calls." },
      { href: "/how-it-works/", label: "How It Works", description: "Start with the constraint that is costing your team time or opportunities." },
    ],
  },
  "/missed-call-follow-up": {
    eyebrow: "Automated Follow-Up & Scheduling",
    productId: "followup",
    productName: "Automated Follow-Up & Scheduling",
    title: "Follow up and schedule the next job while your team is busy.",
    description:
      "We build practical follow-up and scheduling systems for mechanics, contractors, and other trades, so missed calls, web leads, and sent estimates get a useful next step before the opportunity goes cold.",
    bestFor: "Mechanics, contractors, and trade teams with open estimates, missed calls, or booking requests sitting without a clear next step.",
    whyItWorks: "Helpful follow-up and booking options arrive at the right time, while a person stays in control of the schedule, exceptions, and replies.",
    freeStart: {
      title: "Free Follow-Up Setup for 25 Open Estimates",
      description: "We prepare the timing, messages, and next steps for 25 real open estimates. You approve everything before it goes out.",
      input: "Your trade, average estimate, open-estimate count, and current software.",
      cta: "Set up 25 open estimates",
    },
    outcomes: ["Reply to missed calls while the customer is still engaged", "Offer a clear way to request or schedule the next step", "Follow up on sent estimates without chasing a spreadsheet", "Bring a person in when the conversation needs one"],
    examples: ["Missed-call text-back for mechanics and trade businesses", "Estimate follow-up with approved timing and messages", "Lead capture, scheduling links, and owner alerts for new requests"],
    related: [
      { href: "/ai-phone-agents/", label: "24/7 Phone Answering & Booking", description: "Answer and route routine calls before a text-back is needed." },
      { href: "/quote-tools/", label: "Estimate & Proposal Tools", description: "Turn a qualified request into a clear, send-ready estimate." },
      { href: "/dashboards-portals/", label: "Dashboards & Portals", description: "Keep follow-up work visible to the people who own it." },
    ],
  },
  "/local-search": {
    eyebrow: "Get Found on Google and AI Search",
    productId: "search",
    productName: "Get Found on Google and AI Search",
    title: "Make it easy for local customers to understand and choose you.",
    description:
      "We improve the service information, proof, and local signals people use when they search, so your business is clearer on Google and in AI-powered results.",
    bestFor: "Local businesses whose services, service area, or proof are incomplete or inconsistent online.",
    whyItWorks: "Clear, matching information gives customers and search systems fewer reasons to doubt what you do or where you work.",
    freeStart: {
      title: "Free Google Business Profile Cleanup",
      description: "We improve five important parts of your profile: services, categories, description, proof, and customer-visible business information.",
      input: "Your Google profile link, website, main service, and service area.",
      cta: "Request the free cleanup",
    },
    outcomes: ["Explain each core service in plain customer language", "Make service areas and contact paths easy to verify", "Connect real proof to the services people are considering", "Keep your website and local listing information aligned"],
    examples: ["Service pages that answer local customer questions", "Google Business Profile and website alignment", "Local proof, reviews, and service-area information that stays current"],
    related: [
      { href: "/website-design/", label: "Website Redesign", description: "Give local searchers clear pages and a dependable next step." },
      { href: "/ai-phone-agents/", label: "24/7 Phone Answering & Booking", description: "Make sure an inquiry can get a useful answer after it finds you." },
      { href: "/products/", label: "Products", description: "See how local discovery fits into a practical business system." },
    ],
  },
};

function CompactProductVisual({ service }: { service: ServicePageConfig }) {
  const visualByProduct: Record<string, { label: string; title: string; rows: string[]; icon: React.ReactNode }> = {
    calls: { label: "CALL INTAKE", title: "Every call gets a next step", rows: ["Caller details captured", "Appointment request routed", "Urgent call sent to a person"], icon: <PhoneCall size={22} aria-hidden="true" /> },
    estimates: { label: "QUOTE BUILDER", title: "A quote your team can send", rows: ["Scope selected", "Pricing rules applied", "Proposal ready to review"], icon: <Calculator size={22} aria-hidden="true" /> },
    website: { label: "REDESIGN PLAN", title: "A clearer website path", rows: ["Core services made easy to find", "Calls and forms checked", "Useful pages and tracking protected"], icon: <Globe2 size={22} aria-hidden="true" /> },
    followup: { label: "FOLLOW-UP QUEUE", title: "The next step stays visible", rows: ["Missed call flagged", "Estimate follow-up scheduled", "Owner alerted when needed"], icon: <MessageSquare size={22} aria-hidden="true" /> },
    reviews: { label: "REVIEW REQUEST", title: "The ask goes out on time", rows: ["Completed service received", "Personalized text scheduled", "Direct Google link included"], icon: <MessageSquare size={22} aria-hidden="true" /> },
    search: { label: "LOCAL PRESENCE", title: "Your services are easy to verify", rows: ["Services explained clearly", "Service area aligned", "Proof connected to the offer"], icon: <Search size={22} aria-hidden="true" /> },
    dashboards: { label: "WORK QUEUE", title: "The work in one place", rows: ["Requests grouped by owner", "Status visible at a glance", "Next action never buried"], icon: <LayoutDashboard size={22} aria-hidden="true" /> },
  };
  const visual = visualByProduct[service.productId ?? ""] ?? visualByProduct.dashboards;
  return (
    <div className="compact-product-visual" aria-label={`${visual.title} preview`}>
      <div className="compact-product-visual-top"><span className="compact-product-visual-icon">{visual.icon}</span><span>{visual.label}</span><i aria-hidden="true" /></div>
      <h2>{visual.title}</h2>
      <ul>{visual.rows.map((row) => <li key={row}><CheckCircle2 size={16} aria-hidden="true" />{row}</li>)}</ul>
      <div className="compact-product-visual-footer"><span>DaytonGrowthCo.</span><span>READY TO USE</span></div>
    </div>
  );
}

function ServicePage({ service }: { service: ServicePageConfig }) {
  const { chooseWorkflow } = usePersonalization();
  const chooseProduct = () => {
    if (!service.productId) return;
    chooseWorkflow(service.productId);
    trackFunnelEvent("marketing-site", "marketing_product_selected", {
      product_id: service.productId,
      placement: "product-detail",
    });
  };
  return (
    <>
      <PageChrome />
      <main id="main-content" tabIndex={-1} className="service-page compact-service-page">
        <section className="compact-service-hero">
          <div className="compact-service-hero-inner">
            <div>
              <h1>{service.title}</h1>
              <p>{service.description}</p>
              <a className="button button-primary" href="/#cta" onClick={chooseProduct}>Talk through this workflow <ArrowRight size={16} aria-hidden="true" /></a>
              {service.productId === "website" ? <Link className="ownership-roi-link" href="/website-ownership-calculator/">Calculate the cost of renting your website <ArrowRight size={15} aria-hidden="true" /></Link> : null}
            </div>
            <CompactProductVisual service={service} />
          </div>
        </section>
        <section className="compact-service-outcomes" aria-labelledby="compact-outcomes-title">
          <div className="compact-service-section-inner"><div><h2 id="compact-outcomes-title">What we build</h2>{service.whyItWorks ? <p>{service.whyItWorks}</p> : null}</div><ul>{service.outcomes.slice(0, 3).map((outcome) => <li key={outcome}><CheckCircle2 size={17} aria-hidden="true" />{outcome}</li>)}</ul></div>
        </section>
        <section className="compact-service-related" aria-labelledby="compact-related-title">
          <div className="compact-service-section-inner"><h2 id="compact-related-title">Related work</h2><div className="compact-related-grid">{service.related.slice(0, 3).map((item) => <Link href={item.href} key={item.href}><strong>{item.label}</strong><ArrowRight size={17} aria-hidden="true" /></Link>)}</div></div>
        </section>
        <PageCTA />
      </main>
      <SiteFooter />
    </>
  );
}

const publicPricingOffers = [
  {
    id: "website",
    category: "Website",
    shortName: "Website Migration",
    name: "Website Migration Program™",
    label: "One-time",
    price: `From $${websiteMigrationPricing.standardMigration.toLocaleString()}`,
    detail: "one-time investment",
    summary: "Move or rebuild your current website into a clean, self-owned setup.",
    features: ["Migration or rebuild", "Core pages and forms", "Redirects and tracking", "Self-owned setup"],
    bestFor: "Businesses replacing or moving an existing website",
    ongoing: "Typical domain renewal is about $15 per year",
    description: "Move an existing site into a self-owned setup while protecting the useful pages, forms, redirects, tracking, and lead paths.",
    includes: ["Standard Migration: $1,500", "Full Rebuild: $2,000", "Integrations: $500 each", "Typical ongoing domain renewal: about $15/year"],
    cta: "See website migration",
    href: "/website/",
  },
  {
    id: "reviews",
    category: "Reviews",
    shortName: "Review Growth",
    name: "HVAC Google Review Growth Program™",
    label: "Annual + usage",
    price: "$2,500/year + usage",
    detail: "fully managed annual program",
    summary: "Managed Google review generation for established HVAC businesses.",
    features: ["SMS and email requests", "Workflow integration", "Monitoring and reporting", "Fully managed setup"],
    bestFor: "HVAC companies that want review requests handled consistently",
    ongoing: "Actual messaging, number, carrier, and registration usage",
    description: "DaytonGrowthCo connects to your HVAC workflow and automatically asks every eligible completed customer for an honest Google review by text and email.",
    includes: ["CRM or dispatch integration", "SMS and email request sequences", "Reporting portal and ongoing monitoring", "20 reviews in 30 days guaranteed for qualifying HVAC companies"],
    cta: "Schedule a demo",
    href: "/google-reviews/book-call/",
  },
  {
    id: "quote",
    category: "Quote shopping",
    shortName: "Better Quote",
    name: "The Better Quote Program™",
    label: "Success fee",
    price: "$0 upfront",
    detail: "pay only when qualifying savings are found",
    summary: "Send us an estimate and we look for a better comparable local option.",
    features: ["Human-led quote search", "Comparable local options", "Clear recommendation", "No qualifying savings, no fee"],
    bestFor: "Anyone with an existing written service estimate",
    ongoing: "A success fee applies only when qualifying savings are found",
    description: "Have an expensive written service quote? We look for a qualifying, comparable local option. If there are no qualifying savings, the fee is $0.",
    includes: ["Under $199 in qualifying savings: $0", "$199–$494.99 saved: $99", "$495–$2,500 saved: 20%", "Above $2,500: $500 + 10% of savings above $2,500"],
    cta: "Upload your quote",
    href: "/quote/start/",
  },
];

const pricingComparisonRows = [
  { label: "Starting price", values: ["From $1,500", "$2,500/year + usage", "No upfront search fee"] },
  { label: "Best when", values: ["You want to own and control your website", "Your HVAC team completes recurring residential jobs and wants review requests handled automatically", "You have a written quote and want another local option"] },
  { label: "Ongoing cost", values: ["Typical domain renewal: about $15/year", "Actual SMS, email, number, carrier, and registration costs", "Fee only when qualifying savings are found"] },
  { label: "What you get", values: ["A migration or full rebuild into a self-owned site", "Integration, review requests, reporting, monitoring, and maintenance", "A search for a qualifying, comparable local service quote"] },
] as const;

// Release continuity marker: Clear pricing for the services with a defined starting point.
function PricingPage() {
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const selectedOffer = publicPricingOffers.find((offer) => offer.id === selectedOfferId) ?? null;
  const reduceMotion = useReducedMotion();
  const pricingNotes = [
    {
      title: "Are these fixed prices?",
      copy: "The cards above are the current public-priced offers. Work not listed with a price is custom-quoted based on your existing tools, workflow, and scope.",
    },
    {
      title: "What counts as usage?",
      copy: "For Review Growth, usage can include actual SMS, email, phone number, carrier, and registration charges. Those costs are explained before approval.",
    },
    {
      title: "What happens after I contact you?",
      copy: "We confirm fit, scope, price, and the next step in writing before work begins.",
    },
    {
      title: "How does the Better Quote fee work?",
      copy: "There is no upfront search fee. If qualifying savings are found, you see the savings calculation and success fee before payment. If there are no qualifying savings, the fee is $0.",
    },
  ];
  const selectOffer = (offerId: string) => {
    const nextId = selectedOfferId === offerId ? null : offerId;
    setSelectedOfferId(nextId);
    trackFunnelEvent("marketing-site", nextId ? "pricing_details_opened" : "pricing_details_closed", { service: offerId });
  };
  return (
    <>
      <PageChrome />
      <main id="main-content" className="site-pricing-page" tabIndex={-1}>
        <section className="site-pricing-services" id="priced-services" aria-labelledby="site-pricing-services-title">
          <div className="site-pricing-shell">
            <header className="site-pricing-section-head" data-reveal>
              <div><p>Pricing</p><h1 id="site-pricing-services-title">Clear pricing. Simple choices.</h1><p className="site-pricing-hero-summary">Start with a defined service or talk with us about something custom.</p></div>
              <a className="site-pricing-custom-link" href="#custom-pricing">Custom projects are scoped separately <ArrowRight size={15} aria-hidden="true" /></a>
            </header>
            <div className="site-pricing-assurances" aria-label="Pricing commitments">
              <span><Check size={14} aria-hidden="true" /> Written before work begins</span>
              <span><Check size={14} aria-hidden="true" /> No hidden platform tier</span>
            </div>
            <div className="site-pricing-selector" role="group" aria-label="Explore defined-price services" data-stagger>
              {publicPricingOffers.map((offer) => <button className={`site-pricing-selector-card${selectedOffer?.id === offer.id ? " is-active" : ""}`} type="button" key={offer.id} aria-expanded={selectedOffer?.id === offer.id} aria-controls="site-pricing-details" onClick={() => selectOffer(offer.id)}>
                <span className="site-pricing-card-top"><span className="site-pricing-card-category">{offer.category}</span><span className="site-pricing-card-label">{offer.label}</span></span>
                <span className="site-pricing-card-title"><strong>{offer.shortName}</strong></span>
                <span className="site-pricing-card-summary">{offer.summary}</span>
                <span className="site-pricing-card-price"><strong>{offer.price}</strong><small>{offer.detail}</small></span>
                <span className="site-pricing-card-features">{offer.features.map((item) => <span key={item}><Check size={15} aria-hidden="true" />{item}</span>)}</span>
                <span className="site-pricing-card-best"><small>Best for</small><strong>{offer.bestFor}</strong></span>
                <span className="site-pricing-card-action">{selectedOffer?.id === offer.id ? "Hide details" : "View details"} <ChevronDown size={15} aria-hidden="true" /></span>
              </button>)}
            </div>
            <AnimatePresence initial={false}>
              {selectedOffer ? <motion.section
                className="site-pricing-selection-panel"
                id="site-pricing-details"
                aria-labelledby="site-pricing-detail-title"
                key="pricing-details"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <button className="site-pricing-detail-close" type="button" aria-label={`Close ${selectedOffer.shortName} details`} onClick={() => setSelectedOfferId(null)}><X size={18} aria-hidden="true" /></button>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    className="site-pricing-selection-content"
                    key={selectedOffer.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="site-pricing-selection-copy">
                      <p className="site-pricing-card-label">{selectedOffer.name}</p>
                      <h2 id="site-pricing-detail-title">{selectedOffer.shortName}</h2>
                      <p>{selectedOffer.description}</p>
                      <div className="site-pricing-detail-meta"><span><small>Best for</small>{selectedOffer.bestFor}</span><span><small>Ongoing cost</small>{selectedOffer.ongoing}</span></div>
                    </div>
                    <div className="site-pricing-includes">
                      <p>Pricing details</p>
                      <ul>{selectedOffer.includes.map((item) => <li key={item}><CheckCircle2 size={15} aria-hidden="true" />{item}</li>)}</ul>
                      <a className="button button-primary" href={selectedOffer.href} onClick={() => trackFunnelEvent("marketing-site", "pricing_cta_clicked", { service: selectedOffer.id })}>{selectedOffer.cta} <ArrowRight size={15} aria-hidden="true" /></a>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.section> : null}
            </AnimatePresence>
            <div className="site-pricing-compare" data-reveal>
              <button className="site-pricing-compare-toggle" type="button" aria-expanded={comparisonOpen} aria-controls="site-pricing-comparison" onClick={() => { setComparisonOpen((open) => !open); trackFunnelEvent("marketing-site", "pricing_compare_toggled", { open: !comparisonOpen }); }}><span><small>Optional comparison</small><strong>Compare all services</strong></span><ChevronDown size={19} aria-hidden="true" /></button>
              <AnimatePresence initial={false}>
                {comparisonOpen ? <motion.div className="site-pricing-comparison" id="site-pricing-comparison" initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -4 }} transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}>
                  {pricingComparisonRows.map((row) => <section className="site-pricing-comparison-row" key={row.label}><h2>{row.label}</h2><div>{row.values.map((value, index) => <article key={publicPricingOffers[index].id}><strong>{publicPricingOffers[index].shortName}</strong><p>{value}</p></article>)}</div></section>)}
                </motion.div> : null}
              </AnimatePresence>
            </div>
          </div>
        </section>

        <section className="site-pricing-custom" id="custom-pricing" aria-labelledby="site-pricing-custom-title">
          <div className="site-pricing-shell" data-reveal>
            <div className="site-pricing-custom-head"><div><p>Custom projects</p><h2 id="site-pricing-custom-title">Need something built around your workflow?</h2><p>Phone agents, dashboards, quote systems, integrations, and custom workflow builds are scoped after we understand the work. The scope and price are confirmed in writing before the build begins.</p></div><a className="button button-primary" href="/#cta" onClick={() => trackFunnelEvent("marketing-site", "pricing_custom_project_clicked")}>Start a conversation <ArrowRight size={16} aria-hidden="true" /></a></div>
          </div>
        </section>

        <section className="site-pricing-notes" aria-labelledby="site-pricing-notes-title">
          <div className="site-pricing-shell" data-reveal>
            <div className="site-pricing-notes-heading"><p>Pricing questions</p><h2 id="site-pricing-notes-title">Useful details, when you need them.</h2></div>
            <div className="site-pricing-note-list">
              {pricingNotes.map((note) => <details key={note.title} onToggle={(event) => { if (event.currentTarget.open) trackFunnelEvent("marketing-site", "pricing_faq_opened", { question: note.title }); }}>
                <summary><h3>{note.title}</h3><ChevronDown size={18} aria-hidden="true" /></summary>
                <div><p>{note.copy}</p></div>
              </details>)}
            </div>
          </div>
        </section>
        <section className="site-pricing-final" aria-labelledby="site-pricing-final-title"><div className="site-pricing-shell"><div><p>Not sure which fits?</p><h2 id="site-pricing-final-title">Tell us what you are trying to improve.</h2></div><a className="button button-primary" href="/#cta">Start a conversation <ArrowRight size={16} aria-hidden="true" /></a></div></section>
      </main>
      <SiteFooter />
    </>
  );
}

const reviewTextingBenefits = [
  "Generate Google reviews more consistently with a clear, repeatable request process.",
  "Keep employees from having to remember who to ask and when to ask.",
  "Make it easier for happy customers to share their experience with a direct Google link.",
  "Build a stronger online reputation over time through steady, honest customer feedback.",
  "Give prospective customers more current proof when they research your business on Google.",
  "Keep the review-request process running automatically after setup.",
];

const reviewTextingSteps = [
  ["01", "Connect your workflow", "We connect the system to your existing appointment, customer, invoicing, or completed-service workflow."],
  ["02", "Automatically send the text", "After an appointment or service is completed, the system sends a personalized review request."],
  ["03", "Send customers directly to Google", "Each text includes a direct link to your Google review page, so it is easy to share their experience."],
  ["04", "Let the system keep running", "Once installed, requests keep going out without employees needing to manually send messages or remember to ask."],
] as const;

function ReviewTextingPage() {
  const { chooseWorkflow } = usePersonalization();
  const chooseReviewSystem = () => {
    chooseWorkflow("reviews");
    trackFunnelEvent("marketing-site", "marketing_product_selected", { product_id: "reviews", placement: "review-texting-page" });
  };
  const cta = <a className="button button-primary" href="/#cta" onClick={chooseReviewSystem}>Get Your Review System Set Up <ArrowRight size={16} aria-hidden="true" /></a>;
  return (
    <>
      <PageChrome />
      <main id="main-content" tabIndex={-1} className="review-texting-page compact-service-page">
        <section className="review-texting-overview"><div className="compact-service-section-inner"><div><p className="review-texting-eyebrow">Automated Google Review Texting</p><h1>Turn more customers into Google reviews—automatically.</h1><p>DaytonGrowthCo sets up a professional text-message follow-up system that asks customers for an honest Google review after an appointment or completed service.</p></div>{cta}</div></section>

        <section className="review-texting-intro" aria-labelledby="review-texting-intro-title"><div className="compact-service-section-inner"><div><h2 id="review-texting-intro-title">A review request that does not depend on memory.</h2></div><div><p>Your customers already have an opinion about your business. The problem is consistently asking them to share it.</p><p>Automated Google Review Texting runs in the background after completed appointments and services. <strong>You handle the customer. The system handles the follow-up.</strong></p></div></div></section>

        <section className="review-texting-steps" aria-labelledby="review-texting-steps-title"><div className="review-texting-shell"><header><p>How it works</p><h2 id="review-texting-steps-title">A clear path from completed work to an honest review.</h2></header><ol>{reviewTextingSteps.map(([number, title, description]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol></div></section>

        <section className="compact-service-outcomes review-texting-benefits" aria-labelledby="review-texting-benefits-title"><div className="compact-service-section-inner"><div><h2 id="review-texting-benefits-title">Built to make the process easier.</h2><p>Simple automation, clear customer communication, and a process your team does not have to chase.</p></div><ul>{reviewTextingBenefits.map((benefit) => <li key={benefit}><CheckCircle2 size={17} aria-hidden="true" />{benefit}</li>)}</ul></div></section>

        <section className="review-texting-fit" aria-labelledby="review-texting-fit-title"><div className="review-texting-shell"><div><p>Who it is for</p><h2 id="review-texting-fit-title">A practical fit for local service businesses.</h2></div><p>It works well for auto repair shops, barbershops, hair salons, contractors, HVAC companies, plumbers, electricians, cleaning companies, med spas, home-service businesses, and other appointment-based or service-based teams. The setup is shaped around the workflow you already use.</p></div></section>

        <section className="review-texting-pricing" aria-labelledby="review-texting-pricing-title"><div className="review-texting-shell"><div className="review-texting-pricing-heading"><p>Simple, transparent pricing</p><h2 id="review-texting-pricing-title"><strong>$499</strong> setup <span>+</span> <strong>$199/month</strong></h2><p>Stop relying on employees to remember to ask for reviews. Let DaytonGrowthCo handle it automatically.</p>{cta}</div><div className="review-texting-price-grid"><article><h3>Setup includes</h3><ul>{["Initial system setup", "Automation configuration", "Workflow integration", "Google review-link setup", "Personalized message configuration", "Testing and launch"].map((item) => <li key={item}><Check size={15} aria-hidden="true" />{item}</li>)}</ul></article><article><h3>Monthly service includes</h3><ul>{["Ongoing system management", "Automation hosting", "System monitoring", "Basic maintenance", "A reasonable monthly text-message allowance", "Minor workflow or message adjustments", "Support"].map((item) => <li key={item}><Check size={15} aria-hidden="true" />{item}</li>)}</ul></article></div></div></section>

        <section className="review-texting-final"><div><h2>Set up the review process once. Let it keep working.</h2><p>We will connect the workflow, configure the message and Google link, test it, and keep the system running.</p>{cta}</div></section>
      </main>
      <SiteFooter />
    </>
  );
}

const ownershipPresets = [
  { label: "WordPress", value: 300 },
  { label: "Wix", value: 228 },
  { label: "Squarespace", value: 300 },
];

function currency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Math.max(0, value));
}

function ownershipBreakEven(years: number) {
  if (!Number.isFinite(years) || years <= 0) return "Not available";
  const wholeYears = Math.floor(years);
  const months = Math.round((years - wholeYears) * 12);
  if (wholeYears === 0) return `${Math.max(1, months)} month${months === 1 ? "" : "s"}`;
  if (months === 12) return `${wholeYears + 1} year${wholeYears + 1 === 1 ? "" : "s"}`;
  return `${wholeYears} year${wholeYears === 1 ? "" : "s"}${months ? `, ${months} month${months === 1 ? "" : "s"}` : ""}`;
}

function WebsiteOwnershipCalculatorPage() {
  const [platformInput, setPlatformInput] = useState("300");
  const [domainInput, setDomainInput] = useState("15");
  const [investmentInput, setInvestmentInput] = useState(String(websiteMigrationPricing.standardMigration));
  const [selectedPreset, setSelectedPreset] = useState("WordPress");
  const [selectedInvestment, setSelectedInvestment] = useState("standard");
  const [years, setYears] = useState(10);

  const parseAmount = (value: string) => Math.max(0, Number.parseFloat(value.replace(/[^0-9.]/g, "")) || 0);
  const platformCost = parseAmount(platformInput);
  const domainCost = parseAmount(domainInput);
  const investment = parseAmount(investmentInput);
  const annualSavings = platformCost - domainCost;
  const hasSavings = annualSavings > 0;
  const breakEven = hasSavings ? investment / annualSavings : null;
  const oldCost = (year: number) => platformCost * year;
  const ownedCost = (year: number) => investment + domainCost * year;
  const netPocketed = (year: number) => oldCost(year) - ownedCost(year);
  const totalPocketed = netPocketed(years);
  const tableYears = Array.from(new Set([1, 2, 3, 5, 7, 10, years].filter((year) => year <= years))).sort((a, b) => a - b);

  const chartData = Array.from({ length: years + 1 }, (_, year) => ({ year, old: oldCost(year), owned: ownedCost(year) }));
  const chartMax = Math.max(1, ...chartData.flatMap((point) => [point.old, point.owned]));
  const chartX = (year: number) => 52 + (year / years) * 548;
  const chartY = (amount: number) => 25 + (1 - amount / chartMax) * 192;
  const oldPoints = chartData.map((point) => `${chartX(point.year)},${chartY(point.old)}`).join(" ");
  const ownedPoints = chartData.map((point) => `${chartX(point.year)},${chartY(point.owned)}`).join(" ");
  const visibleBreakEven = hasSavings && breakEven !== null && breakEven >= 0 && breakEven <= years ? breakEven : null;

  const setPreset = (label: string, value: number) => {
    setSelectedPreset(label);
    setPlatformInput(String(value));
  };
  const setInvestment = (type: "standard" | "rebuild", value: number) => {
    setSelectedInvestment(type);
    setInvestmentInput(String(value));
  };

  return (
    <>
      <PageChrome />
      <main id="main-content" className="ownership-calculator-page" tabIndex={-1}>
        <section className="ownership-calculator-intro">
          <div className="ownership-calculator-shell">
            <div className="ownership-calculator-intro">
              <h1>Stop renting your website.</h1>
              <p>See the difference between a one-time move and a recurring website bill: after launch, you typically renew only your domain instead of paying a CMS and hosting subscription every year.</p>
            </div>
            <div className="ownership-pricing-strip" aria-label="Website migration starting points">
              <span><strong>Standard Migration</strong> {currency(websiteMigrationPricing.standardMigration)}</span>
              <span><strong>Full Rebuild</strong> {currency(websiteMigrationPricing.fullRebuild)}</span>
              <span><strong>Integrations</strong> {currency(websiteMigrationPricing.integration)} each</span>
            </div>
          </div>
        </section>

        <section className="ownership-calculator-section" aria-labelledby="ownership-calculator-title">
          <div className="ownership-calculator-shell ownership-calculator-layout">
            <form className="ownership-controls" onSubmit={(event) => event.preventDefault()}>
              <div className="ownership-controls-heading">
                <h2 id="ownership-calculator-title">Your numbers</h2>
                <p>Use these as a starting estimate. You can change every number.</p>
              </div>
              <fieldset className="ownership-fieldset">
                <legend>Current platform cost per year</legend>
                <div className="ownership-presets" aria-label="Platform cost estimates">
                  {ownershipPresets.map((preset) => <button key={preset.label} type="button" aria-pressed={selectedPreset === preset.label} className={selectedPreset === preset.label ? "is-selected" : ""} onClick={() => setPreset(preset.label, preset.value)}>{preset.label}<small>{currency(preset.value)}/yr</small></button>)}
                </div>
                <label htmlFor="ownership-platform-cost">Average — edit if you know your actual cost</label>
                <div className="ownership-money-input"><span aria-hidden="true">$</span><input id="ownership-platform-cost" inputMode="decimal" value={platformInput} onChange={(event) => { setPlatformInput(event.target.value); setSelectedPreset(""); }} aria-describedby="platform-cost-note" /></div>
                <p id="platform-cost-note">Estimates include a typical plan, hosting, and domain. Plans and add-ons vary.</p>
              </fieldset>

              <div className="ownership-field">
                <label htmlFor="ownership-domain-cost">Domain cost per year</label>
                <div className="ownership-money-input"><span aria-hidden="true">$</span><input id="ownership-domain-cost" inputMode="decimal" value={domainInput} onChange={(event) => setDomainInput(event.target.value)} /></div>
                <p>Static hosting has no recurring charge from us. This is the typical ongoing domain cost once you own your site; optional third-party services are separate.</p>
              </div>

              <fieldset className="ownership-fieldset ownership-investment-options">
                <legend>One-time migration investment</legend>
                <div className="ownership-investment-toggle">
                  <button type="button" aria-pressed={selectedInvestment === "standard"} className={selectedInvestment === "standard" ? "is-selected" : ""} onClick={() => setInvestment("standard", websiteMigrationPricing.standardMigration)}><strong>Standard Migration</strong><span>{currency(websiteMigrationPricing.standardMigration)}</span></button>
                  <button type="button" aria-pressed={selectedInvestment === "rebuild"} className={selectedInvestment === "rebuild" ? "is-selected" : ""} onClick={() => setInvestment("rebuild", websiteMigrationPricing.fullRebuild)}><strong>Full Rebuild</strong><span>{currency(websiteMigrationPricing.fullRebuild)}</span></button>
                </div>
                <label htmlFor="ownership-investment">Or enter your quoted investment</label>
                <div className="ownership-money-input"><span aria-hidden="true">$</span><input id="ownership-investment" inputMode="decimal" value={investmentInput} onChange={(event) => { setInvestmentInput(event.target.value); setSelectedInvestment(""); }} /></div>
              </fieldset>

              <div className="ownership-field ownership-years-control">
                <div><label htmlFor="ownership-years">Projection window</label><output htmlFor="ownership-years">{years} years</output></div>
                <input id="ownership-years" type="range" min="1" max="15" step="1" value={years} onChange={(event) => setYears(Number(event.target.value))} />
                <div className="ownership-range-labels" aria-hidden="true"><span>1 year</span><span>15 years</span></div>
              </div>
            </form>

            <div className="ownership-results" aria-live="polite">
              <div className="ownership-stats" aria-label="Ownership savings summary">
                <article><span>Annual savings</span><strong>{hasSavings ? currency(annualSavings) : "—"}</strong><small>{hasSavings ? "every year you own it" : "check your numbers"}</small></article>
                <article><span>Break-even point</span><strong>{hasSavings && breakEven !== null ? ownershipBreakEven(breakEven) : "—"}</strong><small>{hasSavings ? "then the savings stay with you" : "not available"}</small></article>
                <article><span>Total pocketed after {years} years</span><strong className={totalPocketed >= 0 ? "is-positive" : "is-negative"}>{hasSavings ? currency(Math.abs(totalPocketed)) : "—"}</strong><small>{hasSavings ? (totalPocketed >= 0 ? "money back in your pocket" : "still paying down the switch") : "no ongoing savings yet"}</small></article>
              </div>
              {hasSavings ? <>
                <div className="ownership-chart-card">
                  <div className="ownership-chart-head"><div><h2>What ownership looks like over time</h2><p>One line keeps charging rent. The other becomes yours.</p></div><div className="ownership-legend" aria-label="Chart legend"><span><i className="ownership-old-key" />Continue renting</span><span><i className="ownership-new-key" />Own your site</span></div></div>
                  <svg className="ownership-chart" viewBox="0 0 640 260" role="img" aria-label={`Cumulative cost comparison over ${years} years. Continuing to rent costs ${currency(oldCost(years))}; owning your site costs ${currency(ownedCost(years))}.`}>
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => <line key={ratio} x1="52" x2="600" y1={25 + ratio * 192} y2={25 + ratio * 192} className="ownership-gridline" />)}
                    <text x="3" y="31">{currency(chartMax)}</text><text x="23" y="220">$0</text>
                    <polyline points={oldPoints} className="ownership-line ownership-line-old" /><polyline points={ownedPoints} className="ownership-line ownership-line-new" />
                    {visibleBreakEven !== null ? <g className="ownership-break-even"><line x1={chartX(visibleBreakEven)} x2={chartX(visibleBreakEven)} y1="20" y2="220" /><circle cx={chartX(visibleBreakEven)} cy={chartY(oldCost(visibleBreakEven))} r="5" /><text x={Math.min(530, chartX(visibleBreakEven) + 9)} y={Math.max(17, chartY(oldCost(visibleBreakEven)) - 10)}>Break-even</text></g> : null}
                    <text x="52" y="246">Now</text><text x="579" y="246">Year {years}</text>
                  </svg>
                </div>
                <div className="ownership-table-wrap">
                  <table><caption>Cost comparison by year</caption><thead><tr><th scope="col">Year</th><th scope="col">Continue renting</th><th scope="col">Own your site</th><th scope="col">Your position</th></tr></thead><tbody>{tableYears.map((year) => { const net = netPocketed(year); return <tr key={year}><th scope="row">{year}</th><td>{currency(oldCost(year))}</td><td>{currency(ownedCost(year))}</td><td className={net >= 0 ? "is-positive" : "is-negative"}>{net >= 0 ? `${currency(net)} back in your pocket` : `${currency(Math.abs(net))} still paying down`}</td></tr>; })}</tbody></table>
                </div>
                <p className="ownership-closing">After year {years}, every dollar you were paying in platform fees stays with you instead.</p>
              </> : <div className="ownership-empty-state" role="status"><h2>No ongoing savings to project yet.</h2><p>At this rate there’s no ongoing savings to project — check your numbers. Your current platform cost needs to be higher than the yearly domain cost.</p></div>}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function PageChrome() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div id="scroll-progress-bar" aria-hidden="true" />
      <Header />
      <RouteTransition />
      <RouteFocus />
    </>
  );
}

function SiteFooter() {
  const year = new Date().getFullYear();
  const { profile, clear } = usePersonalization();
  const business = profile?.business?.trim();
  return (
    <footer className="site-footer">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 text-sm sm:px-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="footer-brand">
          <Link href="/" className="footer-logo" aria-label="DaytonGrowthCo home">
            <img src={logoUrl} alt="" width="32" height="32" />
            <BrandWordmark onDark />
          </Link>
          <p>DaytonGrowthCo builds practical business tools around the way small teams already work.</p>
          <p className="footer-location">Serving Dayton &amp; the Miami Valley, Ohio.</p>
          <div className="footer-utilities">
            <a className="client-portal-link" href="https://billing.stripe.com/p/login/28E6oG91M4fq77o4oAaMU00" target="_blank" rel="noopener noreferrer">Client Portal</a>
            <div className="social-links" aria-label="Social media">
              {socialLinks.map(({ href, Icon, label }) => (
                <a
                  className="social-widget"
                  href={href}
                  key={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                >
                  <Icon />
                  <span className="sr-only">{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
        <nav className="footer-links footer-explore-links" aria-label="Explore">
          <span className="footer-section-label">Explore</span>
          <Link href="/products/">Products</Link>
          <Link href="/appointrelay/">AppointRelay™</Link>
          <Link href="/ai-phone-agents/">AI Phone Agents</Link>
          <Link href="/quote-tools/">Quote Tools</Link>
          <Link href="/dashboards-portals/">Dashboards &amp; Portals</Link>
          <Link href="/website-design/">Business Websites</Link>
          <Link href="/examples/">Examples</Link>
          <Link href="/how-it-works/">How It Works</Link>
          <Link href="/aboutus">About Us</Link>
          <Link href="/#cta">Start a Conversation</Link>
        </nav>
        <div className="footer-contact-stack">
          <div className="footer-contact-card" aria-label="Contact">
            <span className="footer-section-label">Contact</span>
            <a href="mailto:help@daytongrowth.co">help@daytongrowth.co</a>
            <a href="tel:+19373690829">(937) 369-0829</a>
          </div>
          <nav className="footer-legal-links" aria-label="Legal">
            <span className="footer-section-label">Legal</span>
            <a href="/privacy-policy/">Privacy</a>
            <a href="/terms-of-service/">Terms</a>
            <a href="/disclaimer/">Disclaimer</a>
            <a href="/accessibility/">Accessibility</a>
          </nav>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {year} DaytonGrowthCo. LLC. All rights reserved.</span>
        {business ? (
          <span className="footer-personalized">
            Personalized for {business}.{" "}
            <button type="button" className="footer-reset" onClick={clear}>
              Reset
            </button>
          </span>
        ) : null}
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// GSAP motion sections (#2 process map, #3 quote builder, #4 AI workflow,
// #6 spreadsheet). Each uses gsap.matchMedia() with a reduced-motion branch
// that sets the finished state, initial hidden state in CSS (no flash), and
// reverts on unmount. Transforms / opacity only.
// ---------------------------------------------------------------------------

// #3 Quote Builder Mini Demo. A send-ready estimate assembles on scroll-enter:
// customer details, then pricing rules toggle on, scope slides in, total counts.
function QuoteBuilderDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const totalRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = gsap.utils.selector(root);
    const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
    const total = totalRef.current;
    const mm = gsap.matchMedia();
    mm.add(
      {
        reduce: "(prefers-reduced-motion: reduce)",
        animate: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { reduce } = context.conditions as { reduce: boolean };
        if (reduce) {
          gsap.set(q(".qb-field, .qb-chip, .qb-ready"), { autoAlpha: 1, x: 0, y: 0 });
          gsap.set(q(".qb-toggle"), { backgroundColor: "#18174d" });
          gsap.set(q(".qb-toggle i"), { x: 14 });
          if (total) total.textContent = "$4,850";
          return;
        }
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: { trigger: root, start: "top 72%", once: true },
        });
        tl.fromTo(q(".qb-field"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05 });
        tl.to(q(".qb-toggle"), { backgroundColor: "#18174d", duration: 0.3, stagger: 0.05 }, "+=0.1");
        tl.to(q(".qb-toggle i"), { x: 14, duration: 0.3, stagger: 0.05 }, "<");
        tl.fromTo(q(".qb-chip"), { autoAlpha: 0, x: 14 }, { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.05 }, "+=0.1");
        if (total) {
          const counter = { v: 0 };
          tl.to(counter, {
            v: 4850,
            duration: 0.7,
            ease: "power1.out",
            onUpdate: () => {
              total.textContent = fmt(counter.v);
            },
          }, "+=0.05");
        }
        tl.fromTo(q(".qb-ready"), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.35 }, "-=0.2");
      },
      root,
    );
    return () => mm.revert();
  }, []);

  return (
    <section className="qbuilder" aria-labelledby="qbuilder-title" ref={rootRef}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="section-heading">
          <h2 id="qbuilder-title">A real quoting tool, not a slideshow.</h2>
          <p>Here is a send-ready estimate coming together the way the actual tool builds it.</p>
        </div>
        <DottedPanel className="qbuilder-stage" label="Preview of a quote builder producing a send-ready estimate">
          <div className="qbuilder-card">
            <div className="qbuilder-card__bar">
              <span>Estimate builder</span>
              <span className="qbuilder-card__tag">Miller Roofing</span>
            </div>
            <div className="qbuilder-card__body">
              <div className="qb-group">
                <p className="qb-group__label">Customer details</p>
                <p className="qb-field"><User size={14} aria-hidden="true" /><span>Miller Roofing</span></p>
                <p className="qb-field"><MapPin size={14} aria-hidden="true" /><span>1240 Wayne Ave, Dayton</span></p>
                <p className="qb-field"><FileText size={14} aria-hidden="true" /><span>Roof repair, north slope</span></p>
              </div>
              <div className="qb-group">
                <p className="qb-group__label">Pricing rules</p>
                <p className="qb-rule"><span>Labor rate</span><span className="qb-toggle"><i /></span></p>
                <p className="qb-rule"><span>Materials markup</span><span className="qb-toggle"><i /></span></p>
              </div>
              <div className="qb-group">
                <p className="qb-group__label">Scope</p>
                <span className="qb-chip">Tear-off</span>
                <span className="qb-chip">Underlayment</span>
                <span className="qb-chip">Cleanup + haul</span>
              </div>
            </div>
            <div className="qbuilder-card__foot">
              <span className="qb-total">Estimate <strong ref={totalRef}>$0</strong></span>
              <span className="qb-ready"><Check size={14} aria-hidden="true" />Ready to send</span>
            </div>
          </div>
        </DottedPanel>
      </div>
    </section>
  );
}

// #4 AI Workflow Reveal. Practical AI in the operating layer: a five-stage
// path revealed in sequence on scroll, with a human-review step in the middle.
const aiWorkflowStages = [
  { Icon: PhoneCall, label: "Incoming call", body: "“Roof leak over the garage, wants a quote this week.”" },
  { Icon: ClipboardList, label: "Extracted details", body: "Name, address, job type, and urgency, pulled from the call." },
  { Icon: Calculator, label: "Suggested scope", body: "A draft estimate scope, based on your pricing rules." },
  { Icon: UserCheck, label: "Human review", body: "Your estimator checks the scope and adjusts before anything is sent." },
  { Icon: Send, label: "Customer update", body: "The approved quote goes out, and the job is logged." },
] as const;

function AiWorkflowReveal() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add(
      {
        reduce: "(prefers-reduced-motion: reduce)",
        animate: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { reduce } = context.conditions as { reduce: boolean };
        if (reduce) {
          gsap.set(q(".aiflow-stage, .aiflow-arrow"), { autoAlpha: 1, y: 0, scale: 1 });
          return;
        }
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: { trigger: root, start: "top 70%", once: true },
        });
        tl.fromTo(q(".aiflow-stage"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.16 });
        tl.fromTo(q(".aiflow-arrow"), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.3, stagger: 0.16 }, 0.25);
      },
      root,
    );
    return () => mm.revert();
  }, []);

  return (
    <section className="aiflow" aria-labelledby="aiflow-title" ref={rootRef}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="section-heading">
          <h2 id="aiflow-title">AI handles the first draft. A person signs off.</h2>
          <p>AI prepares the work. Your team makes the decision.</p>
        </div>
        <ol className="aiflow-track">
          {aiWorkflowStages.map(({ Icon, label, body }, index) => (
            <li className="aiflow-item" key={label}>
              {index > 0 ? <MoveRight className="aiflow-arrow" size={18} aria-hidden="true" /> : null}
              <div className={`aiflow-stage${label === "Human review" ? " aiflow-stage--human" : ""}`}>
                <span className="aiflow-stage__head"><Icon size={16} aria-hidden="true" />{label}</span>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// #2 Interactive Process Map. Scattered real-world inputs snap into one clean
// system flow on click. Treated as a quiet architecture diagram.
const processInputs = [
  { Icon: Phone, label: "Calls", scatter: { x: -120, y: -36, rotate: -7 } },
  { Icon: MessageSquare, label: "Texts", scatter: { x: 130, y: -52, rotate: 6 } },
  { Icon: FileText, label: "PDFs", scatter: { x: -170, y: 30, rotate: 4 } },
  { Icon: StickyNote, label: "Notes", scatter: { x: 60, y: 44, rotate: -5 } },
  { Icon: Camera, label: "Photos", scatter: { x: 180, y: 26, rotate: 8 } },
  { Icon: Table, label: "Spreadsheets", scatter: { x: -40, y: -64, rotate: 5 } },
] as const;

function ProcessMap() {
  const rootRef = useRef<HTMLDivElement>(null);

  const scatterFor = (node: HTMLElement) =>
    JSON.parse(node.dataset.scatter || "{}") as { x: number; y: number; rotate: number };

  // Scroll-scrubbed: the inputs start scattered as the section enters view and
  // progressively settle into the system as the user scrolls through it. A
  // small per-node stagger makes them snap in as a wave rather than all at once.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nodes = gsap.utils.toArray<HTMLElement>(root.querySelectorAll(".pmap-node"));
    const result = root.querySelector(".pmap-result");
    const mm = gsap.matchMedia();
    mm.add(
      {
        reduce: "(prefers-reduced-motion: reduce)",
        animate: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { reduce } = context.conditions as { reduce: boolean };
        if (reduce) {
          gsap.set(nodes, { x: 0, y: 0, rotate: 0, autoAlpha: 1 });
          gsap.set(result, { autoAlpha: 1 });
          return;
        }
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root, start: "top 48%", end: "center 30%", scrub: true },
        });
        nodes.forEach((node, i) => {
          const s = scatterFor(node);
          tl.fromTo(
            node,
            { x: s.x, y: s.y, rotate: s.rotate, autoAlpha: 1 },
            { x: 0, y: 0, rotate: 0 },
            i * 0.08,
          );
        });
        tl.fromTo(result, { autoAlpha: 0 }, { autoAlpha: 1 }, ">-0.15");
      },
      root,
    );
    return () => mm.revert();
  }, []);

  return (
    <section className="pmap" aria-labelledby="pmap-title" ref={rootRef}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="section-heading">
          <h2 id="pmap-title">The mess is the input, not the problem.</h2>
          <p>Every business runs on scattered inputs. Scroll, and they map into one system.</p>
        </div>
        <DottedPanel className="pmap-stage" label="Scattered business inputs organizing into one system">
          <div className="pmap-grid">
            {processInputs.map(({ Icon, label, scatter }) => (
              <span className="pmap-node" key={label} data-scatter={JSON.stringify(scatter)}>
                <Icon size={16} aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
          <p className="pmap-result"><Workflow size={15} aria-hidden="true" />One system your team actually uses</p>
        </DottedPanel>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Input Constellation -> Workflow Core (#7). A restrained Three.js scene: the
// scattered inputs a small business runs on settle into a Capture -> Structure
// -> Build -> Output pipeline as the section is scrolled. HTML/CSS label
// overlays keep text crisp; reduced motion renders a static diagram instead.
// ---------------------------------------------------------------------------
const constellationStages = [
  { id: "capture", label: "Capture", desc: "Collect the work once." },
  { id: "structure", label: "Structure", desc: "Clean up the context." },
  { id: "build", label: "Build", desc: "Apply rules and workflow." },
  { id: "output", label: "Output", desc: "Send the next step." },
] as const;

type StageId = (typeof constellationStages)[number]["id"];

const constellationInputs: ReadonlyArray<{
  id: string;
  label: string;
  stage: StageId;
  desc: string;
  scatter: [number, number, number];
}> = [
  { id: "calls", label: "Calls", stage: "capture", desc: "Capture the request while it is fresh.", scatter: [-5.5, 2.6, 1.2] },
  { id: "texts", label: "Texts", stage: "capture", desc: "Pull scattered context into one place.", scatter: [4.9, 2.2, -1.4] },
  { id: "photos", label: "Photos", stage: "capture", desc: "Attach field evidence to the job.", scatter: [-2.8, -2.7, 1.3] },
  { id: "pdfs", label: "PDFs", stage: "structure", desc: "Extract details from documents.", scatter: [5.3, -1.7, 0.9] },
  { id: "notes", label: "Notes", stage: "structure", desc: "Turn informal knowledge into structure.", scatter: [-5.1, -0.8, -1.1] },
  { id: "spreadsheets", label: "Spreadsheets", stage: "build", desc: "Move pricing logic into the tool.", scatter: [1.2, 3.0, -1.8] },
  { id: "files", label: "Files", stage: "output", desc: "Produce the output the team can use.", scatter: [0.4, -3.0, 1.6] },
];

// Settled positions for the core and its inputs, in scene units. Horizontal
// pipeline on wide screens; vertical pipeline on narrow screens so labels stay
// readable with no horizontal scroll.
function constellationLayout(vertical: boolean) {
  const stagePos: Record<string, [number, number]> = {};
  const inputPos: Record<string, [number, number]> = {};
  if (vertical) {
    const ys: Record<StageId, number> = { capture: 3, structure: 1, build: -1, output: -3 };
    constellationStages.forEach((s) => (stagePos[s.id] = [1.1, ys[s.id]]));
    inputPos.calls = [-1.4, 3.6]; inputPos.texts = [-1.4, 3.0]; inputPos.photos = [-1.4, 2.4];
    inputPos.pdfs = [-1.4, 1.4]; inputPos.notes = [-1.4, 0.6];
    inputPos.spreadsheets = [-1.4, -1]; inputPos.files = [-1.4, -3];
  } else {
    const xs: Record<StageId, number> = { capture: -4.6, structure: -1.55, build: 1.55, output: 4.6 };
    constellationStages.forEach((s) => (stagePos[s.id] = [xs[s.id], -1.4]));
    inputPos.calls = [-5.6, 1.7]; inputPos.texts = [-4.6, 2.1]; inputPos.photos = [-3.6, 1.7];
    inputPos.pdfs = [-2.15, 1.9]; inputPos.notes = [-0.95, 1.9];
    inputPos.spreadsheets = [1.55, 1.9]; inputPos.files = [4.6, 1.9];
  }
  return { stagePos, inputPos };
}

function InputConstellation() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelEls = useRef<Record<string, HTMLButtonElement | null>>({});
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      return;
    }
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const initScene = (THREE: typeof ThreeNS) => {
    const palette = {
      indigo: 0x18174d,
      ice: 0xdde9fc,
      paleBlue: 0xdde9fc,
      charcoal: 0x1f211f,
      border: 0xededeb,
      line: 0xbcc0cf,
    };
    const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 12.5);
    const group = new THREE.Group();
    scene.add(group);

    const sphereGeo = new THREE.SphereGeometry(1, 24, 24);
    const disposables: Array<{ dispose: () => void }> = [sphereGeo];

    // Workflow stage nodes.
    const stageMeshes: Record<string, ThreeNS.Mesh> = {};
    constellationStages.forEach((s) => {
      const mat = new THREE.MeshBasicMaterial({ color: palette.indigo, transparent: true });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.scale.setScalar(0.26);
      group.add(mesh);
      stageMeshes[s.id] = mesh;
      disposables.push(mat);
    });

    // Input nodes + their route line into the mapped stage.
    type Node = {
      id: string;
      stage: StageId;
      mesh: ThreeNS.Mesh;
      mat: ThreeNS.MeshBasicMaterial;
      line: ThreeNS.Line;
      lineMat: ThreeNS.LineBasicMaterial;
      lineGeo: ThreeNS.BufferGeometry;
      scatter: ThreeNS.Vector3;
      settled: ThreeNS.Vector3;
    };
    const nodes: Node[] = constellationInputs.map((input) => {
      const mat = new THREE.MeshBasicMaterial({ color: palette.paleBlue, transparent: true });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.scale.setScalar(0.17);
      group.add(mesh);
      const lineMat = new THREE.LineBasicMaterial({ color: palette.line, transparent: true, opacity: 0 });
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
      const line = new THREE.Line(lineGeo, lineMat);
      group.add(line);
      disposables.push(mat, lineMat, lineGeo);
      return {
        id: input.id,
        stage: input.stage,
        mesh,
        mat,
        line,
        lineMat,
        lineGeo,
        scatter: new THREE.Vector3(...input.scatter),
        settled: new THREE.Vector3(),
      };
    });

    // Pipeline lines between consecutive stages.
    const pipelineMat = new THREE.LineBasicMaterial({ color: palette.indigo, transparent: true, opacity: 0 });
    const pipelineGeo = new THREE.BufferGeometry();
    pipelineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(constellationStages.length * 3), 3));
    const pipeline = new THREE.Line(pipelineGeo, pipelineMat);
    group.add(pipeline);
    disposables.push(pipelineMat, pipelineGeo);

    let vertical = false;
    const stageVec: Record<string, ThreeNS.Vector3> = {};
    const applyLayout = () => {
      vertical = section.clientWidth < 720;
      const { stagePos, inputPos } = constellationLayout(vertical);
      constellationStages.forEach((s) => {
        const [x, y] = stagePos[s.id];
        stageMeshes[s.id].position.set(x, y, 0);
        stageVec[s.id] = new THREE.Vector3(x, y, 0);
      });
      nodes.forEach((n) => {
        const [x, y] = inputPos[n.id];
        n.settled.set(x, y, 0);
      });
      const pp = pipelineGeo.getAttribute("position") as ThreeNS.BufferAttribute;
      constellationStages.forEach((s, i) => pp.setXYZ(i, stageVec[s.id].x, stageVec[s.id].y, 0));
      pp.needsUpdate = true;
    };

    const resize = () => {
      const w = section.clientWidth;
      const h = vertical ? 460 : 520;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.position.z = section.clientWidth < 720 ? 13.5 : 12.5;
      camera.updateProjectionMatrix();
    };
    applyLayout();
    resize();

    // Cursor parallax (desktop only); pointer fine = has a precise pointer.
    const hasPointer = window.matchMedia("(pointer: fine)").matches;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const r = section.getBoundingClientRect();
      pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    if (hasPointer) window.addEventListener("pointermove", onPointerMove, { passive: true });

    // Scroll progress drives the settle. ScrollTrigger is already registered.
    let progress = 0;
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top 58%",
      end: "top 8%",
      scrub: true,
      onUpdate: (self) => {
        progress = self.progress;
      },
    });

    // Hover state highlights a route or a stage's inputs.
    let activeId: string | null = null;
    const setActive = (id: string | null) => {
      activeId = id;
      const activeInput = nodes.find((n) => n.id === id);
      const activeStage = constellationStages.find((s) => s.id === id);
      nodes.forEach((n) => {
        const on =
          (activeInput && n.id === activeInput.id) ||
          (activeStage && n.stage === activeStage.id);
        n.mat.color.setHex(on ? palette.indigo : palette.paleBlue);
        n.lineMat.color.setHex(on ? palette.indigo : palette.line);
        n.line.renderOrder = on ? 1 : 0;
      });
      Object.entries(stageMeshes).forEach(([sid, mesh]) => {
        const on = activeStage?.id === sid || activeInput?.stage === sid;
        (mesh.material as ThreeNS.MeshBasicMaterial).color.setHex(on ? palette.ice : palette.indigo);
      });
    };

    // Attach hover/focus listeners to the HTML labels (accessible, crisp text).
    const cleanups: Array<() => void> = [];
    Object.entries(labelEls.current).forEach(([id, el]) => {
      if (!el) return;
      const enter = () => setActive(id);
      const leave = () => setActive(null);
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
      el.addEventListener("focus", enter);
      el.addEventListener("blur", leave);
      cleanups.push(() => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
        el.removeEventListener("focus", enter);
        el.removeEventListener("blur", leave);
      });
    });

    const tmp = new THREE.Vector3();
    const projectLabel = (worldY: ThreeNS.Object3D, id: string, opacity: number) => {
      const el = labelEls.current[id];
      if (!el) return;
      worldY.getWorldPosition(tmp);
      tmp.project(camera);
      const w = renderer.domElement.clientWidth;
      const h = renderer.domElement.clientHeight;
      const x = (tmp.x * 0.5 + 0.5) * w;
      const y = (-tmp.y * 0.5 + 0.5) * h;
      el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
      el.style.opacity = String(opacity);
      el.style.pointerEvents = opacity > 0.6 ? "auto" : "none";
    };

    let raf = 0;
    let running = false;
    const renderFrame = () => {
      const p = easeInOut(progress);
      // Smooth parallax.
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      group.rotation.y = pointer.x * 0.12;
      group.rotation.x = -pointer.y * 0.08;

      nodes.forEach((n) => {
        n.mesh.position.lerpVectors(n.scatter, n.settled, p);
        const sv = stageVec[n.stage];
        const pos = n.lineGeo.getAttribute("position") as ThreeNS.BufferAttribute;
        pos.setXYZ(0, n.mesh.position.x, n.mesh.position.y, n.mesh.position.z);
        pos.setXYZ(1, sv.x, sv.y, sv.z);
        pos.needsUpdate = true;
        const routeLit = activeId === n.id || activeId === n.stage;
        n.lineMat.opacity = p * (routeLit ? 0.95 : 0.7);
        n.mat.opacity = 0.55 + 0.45 * p;
      });
      constellationStages.forEach((s) => {
        const mesh = stageMeshes[s.id];
        (mesh.material as ThreeNS.MeshBasicMaterial).opacity = 0.25 + 0.75 * p;
        mesh.scale.setScalar(0.26 * (0.7 + 0.3 * p));
      });
      pipelineMat.opacity = p * 0.5;

      nodes.forEach((n) => projectLabel(n.mesh, n.id, 0.35 + 0.65 * p));
      constellationStages.forEach((s) => projectLabel(stageMeshes[s.id], s.id, 0.4 + 0.6 * p));

      renderer.render(scene, camera);
    };
    const loop = () => {
      renderFrame();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!running) {
        running = true;
        loop();
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    // Only run the loop while the section is on screen.
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
      { threshold: 0 },
    );
    io.observe(section);

    const onResize = () => {
      applyLayout();
      resize();
      renderFrame();
    };
    window.addEventListener("resize", onResize);
    renderFrame(); // paint one frame immediately so there is no blank canvas.

    return () => {
      stop();
      io.disconnect();
      st.kill();
      window.removeEventListener("resize", onResize);
      if (hasPointer) window.removeEventListener("pointermove", onPointerMove);
      cleanups.forEach((fn) => fn());
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
    };

    let disposeScene: (() => void) | null = null;
    let cancelled = false;
    // Lazy-load three.js only when the section nears the viewport, so the 3D
    // library stays out of the initial homepage bundle.
    const loadObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        loadObserver.disconnect();
        void import("three").then((THREE) => {
          if (cancelled) return;
          disposeScene = initScene(THREE);
        });
      },
      { rootMargin: "400px 0px" },
    );
    loadObserver.observe(section);

    return () => {
      cancelled = true;
      loadObserver.disconnect();
      disposeScene?.();
    };
  }, []);

  return (
    <section className="ic-section" aria-labelledby="ic-title" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="section-heading">
          <h2 id="ic-title">Scattered inputs become one workflow.</h2>
          <p>The same calls, texts, and files every small business runs on, routed into Capture, Structure, Build, and Output.</p>
        </div>
      </div>
      {reduced ? (
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <ol className="ic-static">
            {constellationStages.map((s) => (
              <li className="ic-static__stage" key={s.id}>
                <p className="ic-static__name">{s.label}</p>
                <p className="ic-static__desc">{s.desc}</p>
                <ul>
                  {constellationInputs.filter((i) => i.stage === s.id).map((i) => (
                    <li key={i.id}><span>{i.label}</span> {i.desc}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="ic-canvas-wrap">
          <canvas className="ic-canvas" ref={canvasRef} aria-hidden="true" />
          <div className="ic-overlay">
            {constellationInputs.map((i) => (
              <button
                type="button"
                className="ic-label ic-label--input"
                key={i.id}
                ref={(el) => { labelEls.current[i.id] = el; }}
              >
                {i.label}
                <span className="ic-tip">{i.desc}</span>
              </button>
            ))}
            {constellationStages.map((s) => (
              <button
                type="button"
                className="ic-label ic-label--stage"
                key={s.id}
                ref={(el) => { labelEls.current[s.id] = el; }}
              >
                {s.label}
                <span className="ic-tip">{s.desc}</span>
              </button>
            ))}
          </div>
          {/* Accessible description of the same mapping for screen readers. */}
          <ul className="sr-only">
            {constellationInputs.map((i) => (
              <li key={i.id}>{i.label} routes into {i.stage}. {i.desc}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Premium homepage sections (built on src/premium.tsx components).            */
/* -------------------------------------------------------------------------- */

const coreProductOffers = [
  {
    id: "calls",
    category: "Calls",
    icon: <PhoneCall size={22} strokeWidth={1.7} aria-hidden="true" />,
    name: "24/7 Phone Answering & Booking",
    problem: "Missed calls become missed jobs when no one can answer.",
    how: "We answer routine questions, collect job details, book the next step, and route urgent calls to a person.",
    why: "Customers get help while they are still ready to hire.",
    freeTitle: "Free 7-Day Missed-Call Trial",
    freeDetail: "We handle missed calls for seven days so you can see real replies, captured details, and handoffs.",
    whatWeDo: ["Learn your services and call rules", "Set up approved answers and booking", "Send summaries and urgent handoffs"],
    bestFor: "Busy service teams that cannot always reach the phone.",
    href: "/ai-phone-agents/",
    cta: "See the 7-day trial",
  },
  {
    id: "website",
    category: "Websites",
    icon: <Globe2 size={22} strokeWidth={1.7} aria-hidden="true" />,
    name: "Website Migration",
    problem: "An old website can be hard to update and unclear to customers.",
    how: "We move the site while protecting the useful content, brand, domain, and lead paths already working.",
    why: "You get a clearer site without starting from zero or risking the parts that earn trust.",
    freeTitle: "Free Homepage Rebuild Preview",
    freeDetail: "See a working version of your new homepage before deciding whether to move the full site.",
    whatWeDo: ["Review the current site and platform", "Rebuild the homepage direction", "Plan a careful full-site move"],
    bestFor: "WordPress, Wix, or Squarespace sites that feel stuck.",
    href: "/website-design/",
    cta: "See the homepage preview",
  },
  {
    id: "followup",
    category: "Follow-up",
    icon: <MessageSquare size={22} strokeWidth={1.7} aria-hidden="true" />,
    name: "Automated Follow-Up & Scheduling",
    problem: "Mechanics, contractors, and other trade businesses lose jobs when calls, estimates, and booking requests sit too long.",
    how: "We set up approved texts and emails, booking links, timing, owner alerts, and a clear handoff when a person should reply.",
    why: "Customers get a useful next step quickly while your team stays in control of the schedule.",
    freeTitle: "Free Follow-Up Setup for 25 Open Estimates",
    freeDetail: "We prepare the messages and timing for 25 real estimates. You approve everything before it goes out.",
    whatWeDo: ["Review calls, leads, and open estimates", "Write and time the follow-up", "Connect booking, alerts, and handoffs"],
    bestFor: "Mechanics, contractors, and trade teams with missed calls, web leads, or open estimates.",
    href: "/missed-call-follow-up/",
    cta: "See the 25-estimate setup",
  },
  {
    id: "estimates",
    category: "Estimates",
    icon: <Calculator size={22} strokeWidth={1.7} aria-hidden="true" />,
    name: "Estimate & Proposal Tools",
    problem: "Rebuilding the same quote wastes time and makes pricing inconsistent.",
    how: "We turn your labor, materials, options, and rules into a simple tool that produces a send-ready estimate.",
    why: "Your team moves faster while still using the pricing rules it trusts.",
    freeTitle: "Free Quote Tool for One Common Job",
    freeDetail: "Send one price sheet and we will build a working quote tool for one recurring job.",
    whatWeDo: ["Load your real pricing rules", "Build the quote screen", "Test the output with your team"],
    bestFor: "Businesses that price common jobs by hand.",
    href: "/quote-tools/",
    cta: "See the free quote tool",
  },
  {
    id: "search",
    category: "Local search",
    icon: <Search size={22} strokeWidth={1.7} aria-hidden="true" />,
    name: "Get Found on Google and AI Search",
    problem: "Customers move on when your services and service area are hard to verify.",
    how: "We align your Google profile, website, services, local proof, and customer-visible business information.",
    why: "Clear, matching information helps both people and search systems understand when you are a fit.",
    freeTitle: "Free Google Business Profile Cleanup",
    freeDetail: "We improve five important parts of your profile so customers can understand and trust what they see.",
    whatWeDo: ["Correct services and categories", "Clarify the business description", "Align proof and visible information"],
    bestFor: "Local businesses with incomplete or inconsistent listings.",
    href: "/local-search/",
    cta: "See the profile cleanup",
  },
  {
    id: "reviews",
    category: "Reputation",
    icon: <MessageSquare size={22} strokeWidth={1.7} aria-hidden="true" />,
    name: "HVAC Google Review Growth Program™",
    problem: "Completed HVAC jobs keep moving while the Google review request still depends on a technician or office employee remembering.",
    how: "We connect to your CRM or dispatch completion event and automatically send every eligible customer a personalized request for an honest Google review by text and email.",
    why: "The review request happens consistently, with duplicates, opt-outs, delivery, and system health handled for you.",
    freeTitle: "The HVAC Google Review Growth Program™",
    freeDetail: "$2,500 per year for a fully installed and managed review-generation system, plus actual third-party usage costs.",
    whatWeDo: ["Connect the completion workflow", "Set up registered SMS and authenticated email", "Launch, report on, monitor, and maintain the system"],
    bestFor: "Residential HVAC service companies; contractors with 100+ eligible jobs per month may qualify for the 20-review guarantee.",
    href: "/google-reviews/",
    cta: "Schedule a demo",
  },
];

const supportingServices = [
  {
    icon: <AppWindow size={22} strokeWidth={1.7} aria-hidden="true" />,
    title: "Software & AI Review",
    description: "We review the tools you already pay for and identify a simpler setup when one can do the same job.",
    points: ["Software costs worth cutting", "Tools worth keeping or connecting", "Practical AI tools worth setting up"],
  },
  {
    icon: <Wrench size={22} strokeWidth={1.7} aria-hidden="true" />,
    title: "Your Tech, Handled",
    description: "When software is broken or confusing, we work with the vendor and help your team get back to work.",
    points: ["One practical point of contact", "Vendor support and issue follow-up", "Help choosing the next right tool"],
  },
  {
    icon: <Megaphone size={22} strokeWidth={1.7} aria-hidden="true" />,
    title: "Social Media & Content Scheduling",
    description: "We turn approved ideas, offers, photos, and updates into a practical content calendar, then automate publishing so your business stays visible without posting by hand.",
    points: ["Content planned around the business", "Posts prepared for approval", "Publishing scheduled across channels"],
  },
];

function CoreProductOffers() {
  const { chooseWorkflow } = usePersonalization();

  return (
    <section className="core-products" id="services" aria-labelledby="core-products-title">
      <div className="core-products-inner">
        <header className="core-products-head core-products-compact-head">
          <h2 id="core-products-title" data-scroll-words>Additional tools and services</h2>
          <p>Useful support for the work around your business.</p>
        </header>
        <div className="core-products-list core-products-compact-list" data-stagger>
          {coreProductOffers.map((product, index) => (
            <Link
              className="core-product-card"
              href={product.href}
              key={product.id}
              onClick={() => {
                chooseWorkflow(product.id);
                trackFunnelEvent("marketing-site", "marketing_product_selected", {
                  product_id: product.id,
                  placement: "homepage-card",
                });
              }}
            >
              <article className="core-product-compact-row">
                <span className="core-product-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="core-product-icon" aria-hidden="true">{product.icon}</span>
                <div className="core-product-compact-copy"><h3>{product.name}</h3><p>{product.problem}</p></div>
                <span className="core-product-compact-link">View <ArrowRight size={15} aria-hidden="true" /></span>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function SupportingServices() {
  return (
    <section className="supporting-services" aria-labelledby="supporting-services-title" data-reveal>
      <div className="supporting-services-inner">
        <div className="supporting-services-head">
          <div>
            <p className="supporting-services-kicker">Beyond the core products</p>
            <h2 id="supporting-services-title" data-scroll-words>Help around the products you already use.</h2>
          </div>
        <p>These are supporting services, not another set of products to sort through.</p>
        </div>

        <div className="supporting-services-grid" data-stagger>
          {supportingServices.map((service) => (
            <article className="supporting-service-card" key={service.title}>
              <span className="supporting-service-icon" aria-hidden="true">{service.icon}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <ul>
                {service.points.map((point) => (
                  <li key={point}><Check size={15} aria-hidden="true" />{point}</li>
                ))}
              </ul>
              <a href="#cta" className="supporting-service-link">Ask for practical help <ArrowRight size={15} aria-hidden="true" /></a>
            </article>
          ))}
        </div>

        <p className="supporting-services-close">Not sure where the problem fits? Tell us what keeps getting in the way.</p>
      </div>
    </section>
  );
}

const premiumProcess = [
  {
    step: 1,
    phase: "Choose",
    title: "Start with one clear problem.",
    deliverables: ["Choose the matching product", "Share one real input from your business"],
    result: "Everyone agrees on the first useful result.",
  },
  {
    step: 2,
    phase: "Prove",
    title: "See a working result first.",
    deliverables: ["We set up the free starting result", "Your team reviews it with real work"],
    result: "You can judge the value before a larger decision.",
  },
  {
    step: 3,
    phase: "Continue",
    title: "Build out only what proves useful.",
    deliverables: ["Approve the paid implementation", "Test, train, and keep it current"],
    result: "The product grows from a result you already understand.",
  },
];

function ProcessSteps() {
  return (
    <section className="process-section" id="process" aria-labelledby="process-title" data-scroll-scene="process">
        <div className="process-section-media" aria-hidden="true">
          <BackgroundVideo className="process-section-video" src={videos.process.src} playbackRate={0.55} preload="metadata" />
        </div>
        <div className="process-section-film-mask" aria-hidden="true" />
        <div className="process-section-inner">
          <div className="process-section-head">
            <div>
              <h2 id="process-title" data-scroll-words>
                A simple path from problem to working product.
              </h2>
            </div>
          </div>
          <div className="process-section-track">
            {premiumProcess.map((step) => (
              <ProcessStepCard
                key={step.step}
                {...step}
              />
            ))}
          </div>
        </div>
    </section>
  );
}

const systemMapNodes = [
  { icon: <PhoneCall size={20} strokeWidth={1.7} aria-hidden="true" />, label: "Calls, texts & photos", sub: "Everything that comes in" },
  { icon: <ClipboardList size={20} strokeWidth={1.7} aria-hidden="true" />, label: "Captured & organized", sub: "One clean record" },
  { icon: <Workflow size={20} strokeWidth={1.7} aria-hidden="true" />, label: "Priced & automated", sub: "Quotes and follow-up" },
  { icon: <CheckCircle2 size={20} strokeWidth={1.7} aria-hidden="true" />, label: "Booked work", sub: "Less slips through" },
];

function SystemMap() {
  return (
    <section className="system-map" aria-labelledby="system-map-title" data-scroll-scene="system">
      <div className="system-map-inner">
        <div className="system-map-head">
          <h2 id="system-map-title" data-scroll-words>
            One connected path, end to end.
          </h2>
        </div>
        <ol className="system-map-flow" data-stagger>
          {systemMapNodes.map((node, i) => (
            <li className="system-map-node" key={node.label}>
              <span className="system-map-icon" aria-hidden="true">
                {node.icon}
              </span>
              <strong>{node.label}</strong>
              <span className="system-map-sub">{node.sub}</span>
              {i < systemMapNodes.length - 1 ? (
                <span className="system-map-arrow" aria-hidden="true">
                  <ArrowRight size={18} />
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const oldStackRows = [
  {
    icon: <Globe2 size={19} strokeWidth={1.7} aria-hidden="true" />,
    current: "WordPress updates, Wix edits, Squarespace workarounds",
    build: "Website migration",
    result: "Keep the content, brand, and lead flow worth keeping, then move to a site that is easier to manage.",
  },
  {
    icon: <PhoneCall size={19} strokeWidth={1.7} aria-hidden="true" />,
    current: "Voicemail, after-hours calls, missed-call workflows",
    build: "24/7 phone answering & booking",
    result: "Answer routine calls, capture the right details, and send emergencies to a person.",
  },
  {
    icon: <MessageSquare size={19} strokeWidth={1.7} aria-hidden="true" />,
    current: "Missed calls, web leads, sent estimates, loose reminders",
    build: "Missed call text-back & estimate follow-up",
    result: "Reply fast and keep the next step visible before a customer moves on.",
  },
  {
    icon: <Calculator size={19} strokeWidth={1.7} aria-hidden="true" />,
    current: "Price sheets, job photos, Word docs, copied proposals",
    build: "Estimate & proposal tools",
    result: "Use real rates and job details to make proposals customers can approve online.",
  },
  {
    icon: <Search size={19} strokeWidth={1.7} aria-hidden="true" />,
    current: "Old service pages, thin listings, scattered reviews and proof",
    build: "Get found on Google and AI search",
    result: "Make the business easier for homeowners and search tools to understand.",
  },
];

const upgradeRules = [
  ["Keep it", "When the current software is doing its job and only needs a better handoff around it."],
  ["Connect it", "When the tool is fine but calls, leads, estimates, or updates keep falling between systems."],
  ["Replace it", "When it is slow, expensive, or making simple work harder than it needs to be."],
];

function OldStackUpgrade() {
  const featuredRowIndexes = oldStackRows.map((_, index) => index);
  const featuredRows = featuredRowIndexes.map((index) => oldStackRows[index]);
  const additionalRows = oldStackRows.filter((_, index) => !featuredRowIndexes.includes(index));

  const renderOldStackRow = (row: (typeof oldStackRows)[number]) => (
    <div className="old-stack-row" role="row" key={row.current}>
      <div className="old-stack-current" role="cell">
        <span className="old-stack-icon" aria-hidden="true">
          {row.icon}
        </span>
        <strong>{row.current}</strong>
      </div>
      <p role="cell">{row.build}</p>
    </div>
  );

  return (
    <section className="old-stack" id="old-stack" aria-labelledby="old-stack-title" data-reveal data-scroll-scene="ledger">
      <div className="old-stack-inner">
        <div className="old-stack-head">
          <div>
            <h2 id="old-stack-title" data-scroll-words>
              Match the problem to the right product.
            </h2>
            <a className="old-stack-cta" href="#cta">
              Talk through your setup
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="old-stack-layout" data-stagger>
          <div className="old-stack-ledger" role="table" aria-label="Old business software and modern replacements">
            <div className="old-stack-ledger-head" role="row">
              <span role="columnheader">What is happening now</span>
              <span role="columnheader">The product that helps</span>
            </div>
            {featuredRows.map(renderOldStackRow)}
            {additionalRows.length > 0 ? <details className="old-stack-more">
              <summary>View all tools</summary>
              <div className="old-stack-more-rows">
                {additionalRows.map(renderOldStackRow)}
              </div>
            </details> : null}
          </div>

          <aside className="old-stack-decision" aria-label="How DaytonGrowthCo decides what to build">
            <h3>Keep what works. Fix what does not.</h3>
            <dl>
              {upgradeRules.map(([term, definition]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{definition}</dd>
                </div>
              ))}
            </dl>
            <a className="link-arrow" href="#cta">
              Get a recommendation
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </aside>
        </div>

      </div>
    </section>
  );
}

const retainerExamples = [
  {
    icon: PhoneCall,
    title: "24/7 phone answering & booking",
    short: "Keep call rules and booking details current.",
    problem: "The right response changes with service areas, hours, emergencies, and the people who should receive a call.",
    build: ["Call rules", "Booking details", "Emergency routing", "Team summaries"],
    monthly: "Update call handling as your services, schedule, or team changes.",
  },
  {
    icon: Globe2,
    title: "Website migration",
    short: "Keep pages, services, and lead paths accurate.",
    problem: "The site should keep up when a service changes, a new proof point matters, or a page needs attention.",
    build: ["Page updates", "Service information", "Lead paths", "Search checks"],
    monthly: "Make practical website updates without reopening a platform project every time.",
  },
  {
    icon: MessageSquare,
    title: "Missed call & estimate follow-up",
    short: "Tune timing, messages, and ownership.",
    problem: "Follow-up only works when it sounds like your business and knows when a person should step in.",
    build: ["Reply timing", "Message templates", "Owner alerts", "Lead stages"],
    monthly: "Adjust the follow-up around real replies, seasonality, and how your team works.",
  },
  {
    icon: Calculator,
    title: "Estimate & proposal tools",
    short: "Keep rates, options, and approval steps current.",
    problem: "Pricing changes, materials change, and proposals need to reflect the way your team sells the work.",
    build: ["Labor rates", "Materials", "Service options", "Approval flows"],
    monthly: "Update the real numbers and the proposal flow without rebuilding the tool.",
  },
  {
    icon: Search,
    title: "Google & AI search",
    short: "Keep services, proof, and local information clear.",
    problem: "Search information gets stale when service pages, reviews, photos, and your Google listing do not match the business today.",
    build: ["Service pages", "Google listing", "Local proof", "Helpful updates"],
    monthly: "Keep the information homeowners and search tools need accurate and useful.",
  },
];

function OneWorkflowRetainers() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = retainerExamples[activeIndex] ?? retainerExamples[0];
  const ActiveIcon = active.icon;
  const { ref: pickerRef, scrolled: pickerScrolled } = useSwipeHint<HTMLDivElement>();

  const moveSelection = (direction: -1 | 1) => {
    setActiveIndex((current) => (current + direction + retainerExamples.length) % retainerExamples.length);
  };

  return (
    <section className="retainer-section" id="ai-retainers" aria-labelledby="retainer-title" data-reveal>
      <div className="retainer-inner">
        <div className="retainer-head">
          <h2 id="retainer-title" data-scroll-words>
            The products stay useful after setup.
          </h2>
          <aside className="retainer-rule">
            <h3>We set it up, connect it, and help keep it working.</h3>
          </aside>
        </div>

        <div className="retainer-layout" data-stagger>
          <SwipeHint hidden={pickerScrolled} />
          <div className="retainer-picker" ref={pickerRef} role="tablist" aria-label="Products DaytonGrowthCo manages">
            {retainerExamples.map((example, index) => {
              const Icon = example.icon;
              const selected = index === activeIndex;
              return (
                <button
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="retainer-workflow-panel"
                  className={selected ? "is-active" : ""}
                  key={example.title}
                  onClick={() => setActiveIndex(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                      event.preventDefault();
                      moveSelection(1);
                    }
                    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                      event.preventDefault();
                      moveSelection(-1);
                    }
                  }}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>
                    <strong>{example.title}</strong>
                    <em>{example.short}</em>
                  </span>
                </button>
              );
            })}
          </div>

          <article id="retainer-workflow-panel" className="retainer-card" key={active.title} role="tabpanel" aria-live="polite">
            <div className="retainer-card-top">
              <span className="retainer-card-icon" aria-hidden="true">
                <ActiveIcon size={24} strokeWidth={1.8} />
              </span>
              <div>
                <span>Product</span>
                <h3>{active.title}</h3>
              </div>
            </div>

            <p className="retainer-problem">{active.problem}</p>

            <div className="retainer-build">
              <div>
                <span>What it handles</span>
                <ul>
                  {active.build.map((item) => (
                    <li key={item}>
                      <Check size={14} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span>What we manage after launch</span>
                <p>{active.monthly}</p>
              </div>
            </div>
          </article>

        </div>
      </div>
    </section>
  );
}

const aoaSteps = [
  {
    icon: ClipboardList,
    title: "Bring one real input",
    featured: true,
    items: [
      "A week of missed calls",
      "One homepage or profile",
      "Open estimates or one price sheet",
    ],
  },
  {
    icon: Wrench,
    title: "We set up the result",
    items: [
      "Built around your real information",
      "Small enough to review clearly",
      "Useful before a larger commitment",
    ],
  },
  {
    icon: CheckCircle2,
    title: "Decide after you see it",
    items: ["Keep the useful result", "Choose whether to continue", "Receive a proposal only when it makes sense"],
  },
];

function AiAuditOffer() {
  return (
    <section className="audit-offer working-start" id="working-start" aria-labelledby="audit-offer-title" data-reveal>
      <div className="audit-offer-inner">
        <div className="audit-offer-head">
          <h2 id="audit-offer-title" data-scroll-words>
            Start with something real.
          </h2>
          <p>No audit, PDF, or strategy session. We set up one useful piece of real work before you decide what comes next.</p>
        </div>

        <ol className="aoa-steps" data-stagger>
          {aoaSteps.map((step) => {
            const StepIcon = step.icon;
            return (
              <li className={`aoa-step ${step.featured ? "is-featured" : ""}`} key={step.title}>
                <div className="aoa-step-head">
                  <span className="aoa-step-icon" aria-hidden="true">
                    <StepIcon size={20} strokeWidth={1.8} />
                  </span>
                  <div className="aoa-step-titles">
                    <h3>{step.title}</h3>
                  </div>
                </div>
                {step.featured ? <span className="aoa-step-flag">Your starting point</span> : null}
                <ul>
                  {step.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>

        <aside className="audit-cta-band">
          <div className="audit-cta-intro">
            <strong>Choose the product that matches the problem you recognize.</strong>
          </div>
          <div className="audit-cta-body">
            <a className="button button-primary large" href="#services">
              Compare the core products
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}

function MissionStatement() {
  return (
    <PositioningStatement>
      Custom software should not cost five figures and three months. We use AI to build the exact tool your business needs for{" "}
      <Accent>up to 70% less</Accent>, shaped to <Accent>how you already work</Accent>, so the money you save{" "}
      <Accent>stays in your business</Accent>.
    </PositioningStatement>
  );
}

const orbitClients = [
  {
    name: "Waibel Energy Solutions",
    logo: "/client-logos/waibel.jpg",
    logoClassName: "waibel",
    href: "/website",
    project: "Website migration",
    outcome: "A clearer service structure that is easier for the team to keep current.",
  },
  {
    name: "Khan Construction",
    monogram: "KC",
    logoClassName: "khan",
    href: "/dashboards-portals",
    project: "Clearer service visibility",
    outcome: "Operational information organized around the work already in motion.",
  },
  {
    name: "FlightFix",
    logo: "/client-logos/flightfix.jpg",
    logoClassName: "flightfix",
    href: "/systems-that-pay",
    project: "Workflow simplification",
    outcome: "A focused workflow that makes handoffs and next steps easier to see.",
  },
  {
    name: "Shmu's Automotive",
    logo: "/client-logos/shmus.png",
    logoClassName: "shmus",
    href: "/google-review-texting",
    project: "Review growth",
    outcome: "Consistent customer follow-up without relying on the team to remember it.",
  },
];

function ProofAndVoices() {
  return (
    <div className="proof-wrap">
      <ProofBand
        background={<BackgroundVideo className="proof-band-video" poster={videos.form.poster} stream={videos.form.stream} />}
        stats={[
          { value: "5", label: "Focused products for the work that matters" },
          { value: "2 to 4 weeks", label: "For many focused setups to go live" },
          { value: "One person", label: "To help with the technology around the work" },
        ]}
        statement={
          <>
            “The goal is never more software. It is the right product, set up properly, with someone practical to call when it needs attention.”
          </>
        }
        attribution="DaytonGrowthCo."
      />
      {/* Testimonials section intentionally omitted until real client quotes are
          available. The TestimonialCard component lives in src/premium.tsx and
          can be dropped back in here when ready. */}
    </div>
  );
}

function BuiltForStrip() {
  const reduceMotion = useReducedMotion();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const lastPointerType = useRef("pointer");
  const activeIndex = previewIndex ?? selectedIndex;
  const activeClient = orbitClients[activeIndex];

  const isTouchInteraction = () => (
    lastPointerType.current === "touch" || (
      typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse)").matches
    )
  );

  const handleClientClick = (event: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    const compactSelectionMode = typeof window !== "undefined" && window.innerWidth < 700;

    if ((isTouchInteraction() || compactSelectionMode) && selectedIndex !== index) {
      event.preventDefault();
      setPreviewIndex(null);
      setSelectedIndex(index);
      event.currentTarget.blur();
      return;
    }

    trackFunnelEvent("marketing-site", "client_proof_clicked", {
      client: orbitClients[index].name,
      destination: orbitClients[index].href,
    });
  };

  return (
    <div className={clientProofStyles.band}>
      <div className={clientProofStyles.inner}>
        <div className={clientProofStyles.copy}>
          <h2 id="client-proof-title" className={clientProofStyles.heading}>
            A few companies we&apos;ve worked with.
          </h2>
          <p className={clientProofStyles.intro}>
            <span className={clientProofStyles.desktopInstruction}>Select a mark to see the work behind it.</span>
            <span className={clientProofStyles.mobileInstruction}>Tap a client to see the work.</span>
          </p>
        </div>

        <div className={clientProofStyles.proofSystem}>
          <ul
            className={clientProofStyles.logos}
            aria-label="Companies we have worked with"
          >
            {orbitClients.map((client, index) => {
              const active = activeIndex === index;
              const selected = selectedIndex === index;
              return (
                <li
                  className={`${clientProofStyles.logoItem} ${clientProofStyles[client.logoClassName]}`}
                  data-active={active ? "true" : "false"}
                  data-selected={selected ? "true" : "false"}
                  key={client.name}
                >
                  <a
                    className={clientProofStyles.logoLink}
                    data-client-proof-link="true"
                    href={client.href}
                    aria-label={`${client.name}: ${client.project}. ${client.outcome}`}
                    aria-describedby={`client-proof-label-${index}`}
                    onClickCapture={(event) => handleClientClick(event, index)}
                    onPointerDown={(event) => { lastPointerType.current = event.pointerType; }}
                    onKeyDown={() => { lastPointerType.current = "keyboard"; }}
                    onPointerEnter={(event) => {
                      if (event.pointerType !== "touch") setPreviewIndex(index);
                    }}
                    onPointerLeave={(event) => {
                      if (event.pointerType !== "touch") setPreviewIndex(null);
                    }}
                    onFocus={() => setPreviewIndex(index)}
                    onBlur={() => setPreviewIndex(null)}
                  >
                    <span className={clientProofStyles.markFrame}>
                      {client.logo ? (
                        <img
                          className={clientProofStyles.logoImage}
                          src={client.logo}
                          alt={`${client.name} logo`}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <span className={clientProofStyles.khanMark} role="img" aria-label={`${client.name} logo`}>
                          {client.monogram}
                        </span>
                      )}
                    </span>
                    <span className={clientProofStyles.projectLabel} id={`client-proof-label-${index}`}>
                      {client.project}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>

          <div className={clientProofStyles.selectionTrack} aria-hidden="true">
            <span style={{ transform: `translateX(${activeIndex * 100}%)` }} />
          </div>

          <div className={clientProofStyles.detailViewport} aria-live="polite" aria-atomic="true">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                className={clientProofStyles.detail}
                key={activeClient.name}
                initial={reduceMotion ? false : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -3 }}
                transition={{ duration: reduceMotion ? 0 : 0.16, ease: [0.16, 1, 0.3, 1] }}
              >
                <strong>{activeClient.name}</strong>
                <span>{activeClient.project}</span>
                <p>{activeClient.outcome}</p>
                <Link
                  className={clientProofStyles.detailLink}
                  href={activeClient.href}
                  onClick={() => trackFunnelEvent("marketing-site", "client_proof_detail_clicked", {
                    client: activeClient.name,
                    destination: activeClient.href,
                  })}
                >
                  View related work <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostHeroBridge() {
  return (
    <section className={`${clientProofStyles.bridge} post-hero-bridge`} aria-labelledby="client-proof-title">
      <BuiltForStrip />
    </section>
  );
}

const homepageOffers = [
  {
    id: "quote",
    prompt: "An expensive quote",
    category: "Quote comparison",
    name: "The Better Quote Program™",
    description: "A real person compares your written quote with legitimate local options.",
    detail: "No qualifying savings means no fee.",
    href: "/quote/start/",
    action: "Check my quote",
    icon: PhoneCall,
  },
  {
    id: "website",
    prompt: "Website platform costs",
    category: "Website migration",
    name: "The Website Migration Program™",
    description: "Plan, migrate, test, and launch the pieces of your existing site that still matter.",
    detail: "Keep the useful work. Leave the platform friction.",
    href: "/website/",
    action: "Plan my migration",
    icon: Globe2,
  },
  {
    id: "appointments",
    prompt: "An appointment backlog",
    category: "Appointment follow-up",
    name: "AppointRelay™",
    description: "Contact approved customers and hand useful scheduling context back to dispatch.",
    detail: "Your team keeps final scheduling control.",
    href: "/appointrelay/",
    action: "Explore AppointRelay",
    icon: Workflow,
  },
  {
    id: "reviews",
    prompt: "Missed review requests",
    category: "HVAC review growth",
    name: "The HVAC Google Review Growth Program™",
    description: "Request honest Google reviews after eligible completed jobs without relying on memory.",
    detail: "Managed setup, safeguards, reporting, and monitoring.",
    href: "/google-reviews/book-call/",
    action: "Review the program",
    icon: MessageSquare,
  },
] as const;

type HomepageOfferId = (typeof homepageOffers)[number]["id"];

function FlagshipOverview() {
  useEffect(() => { trackFunnelEvent("appointrelay", "appointrelay_home_offer_viewed"); }, []);
  const reduceMotion = useReducedMotion();
  const [activeOfferId, setActiveOfferId] = useState<HomepageOfferId>("quote");
  const activeOffer = homepageOffers.find((offer) => offer.id === activeOfferId) ?? homepageOffers[0];
  const ActiveIcon = activeOffer.icon;

  return (
    <section className={`${flagshipStyles.section} homepage-component`} id="programs" aria-labelledby="flagship-overview-title">
      <div className={flagshipStyles.shell}>
        <header className={flagshipStyles.intro}>
          <h2 id="flagship-overview-title">Start with the work that costs you most.</h2>
          <p>Choose the operating problem in front of you. We will show you the clearest next step.</p>
        </header>

        <div className={flagshipStyles.selector} role="group" aria-label="Choose the problem you want to solve">
          {homepageOffers.map((offer) => {
            const Icon = offer.icon;
            const active = offer.id === activeOffer.id;
            return (
              <button
                key={offer.id}
                type="button"
                className={flagshipStyles.choice}
                aria-pressed={active}
                aria-controls="homepage-offer-detail"
                onClick={() => setActiveOfferId(offer.id)}
              >
                <span className={flagshipStyles.choiceIcon} aria-hidden="true"><Icon size={19} /></span>
                <span>{offer.prompt}</span>
                <ArrowRight className={flagshipStyles.choiceArrow} size={16} aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <div className={flagshipStyles.resultGrid}>
          <div className={flagshipStyles.pathVisual} aria-hidden="true" key={`path-${activeOffer.id}`}>
            <span>Repeated friction</span>
            <span className={flagshipStyles.pathLine}><i /></span>
            <span className={flagshipStyles.pathNode}><ActiveIcon size={25} /></span>
            <span className={flagshipStyles.pathLine}><i /></span>
            <span>Clear next step</span>
          </div>

          <div className={flagshipStyles.detailViewport} id="homepage-offer-detail" aria-live="polite" aria-atomic="true">
            <AnimatePresence initial={false} mode="wait">
              <motion.article
                className={flagshipStyles.offerDetail}
                key={activeOffer.id}
                initial={reduceMotion ? false : { opacity: 0, transform: "translateY(8px)" }}
                animate={{ opacity: 1, transform: "translateY(0px)" }}
                exit={reduceMotion ? undefined : { opacity: 0, transform: "translateY(-4px)" }}
                transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.23, 1, 0.32, 1] }}
              >
                <span className={flagshipStyles.category}>{activeOffer.category}</span>
                <h3>{activeOffer.name}</h3>
                <p>{activeOffer.description}</p>
                <strong>{activeOffer.detail}</strong>
                <Link
                  className={flagshipStyles.primaryAction}
                  href={activeOffer.href}
                  onClick={() => {
                    if (activeOffer.id === "appointments") {
                      trackFunnelEvent("appointrelay", "appointrelay_home_offer_clicked");
                    }
                  }}
                >
                  {activeOffer.action} <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgramSteps({ items }: { items: Array<{ title: string; text: string }> }) {
  return <ol className="program-steps">{items.map((item, index) => <li key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item.title}</strong><p>{item.text}</p></div></li>)}</ol>;
}

function BetterQuoteProgram() {
  const steps = [
    { title: "Send your quote", text: "Upload the estimate you already have." },
    { title: "We make the calls", text: "A real person checks comparable local options." },
    { title: "Get a clear answer", text: "Usually within about 48 business hours." },
    { title: "Pay only if you save", text: "No qualifying savings? No fee." },
  ];
  return <section className="program-section better-quote-program" id="better-quote" aria-labelledby="better-quote-title">
    <div className="flagship-shell program-layout">
      <div className="program-copy">
        <span className="section-eyebrow">The Better Quote Program™</span>
        <h2 id="better-quote-title">Already have a quote? Let us shop it.</h2>
        <p>Send the estimate you already have. A real person checks comparable local options.</p>
        <p className="program-promise">If we don’t save you money, you don’t pay.</p>
        <a className="button button-primary large" href="/quote/start/">Upload Your Quote <ArrowRight size={16} aria-hidden="true" /></a>
        <p className="program-trust"><UserCheck size={17} aria-hidden="true" /> Human-led from start to finish.</p>
      </div>
      <div className="program-detail">
        <ProgramSteps items={steps} />
        <p className="program-note">Better comparable quotes, not a promise of the lowest price anywhere.</p>
      </div>
    </div>
  </section>;
}

function WebsiteMigrationProgram() {
  const steps = [
    { title: "Review", text: "We audit the pages, forms, analytics, and integrations that matter." },
    { title: "Plan", text: "You approve what moves, improves, and gets cleaned up." },
    { title: "Migrate", text: "We rebuild the necessary pieces and test the full experience." },
    { title: "Launch", text: "We move carefully, verify the site, and handle post-launch issues." },
  ];
  return <section className="program-section website-program" id="website-migration" aria-labelledby="website-program-title">
    <div className="flagship-shell program-layout program-layout-reverse">
      <div className="program-copy">
        <span className="section-eyebrow">Website Migration Program™</span>
        <h2 id="website-program-title">Move your website without the headache.</h2>
        <p>Keep the pages, forms, analytics, links, and integrations that matter. Leave the old platform friction behind.</p>
        <p className="program-fee"><strong>Clear pricing before work begins.</strong> Your written scope shows the migration fee and exactly what is included.</p>
        <Link className="button button-primary large" href="/website/">Start My Website Migration <ArrowRight size={16} aria-hidden="true" /></Link>
        <Link className="ownership-roi-link" href="/website-ownership-calculator/">Calculate your website ownership ROI <ArrowRight size={15} aria-hidden="true" /></Link>
      </div>
      <div className="program-detail"><ProgramSteps items={steps} /></div>
    </div>
  </section>;
}

function ReviewGrowthProgram() {
  const steps = [
    { title: "Connect the completed-job signal", text: "We connect one approved completion event from your CRM, dispatch system, scheduler, API, webhook, or structured export." },
    { title: "Apply the customer safeguards", text: "The program follows approved timing, exclusions, opt-outs, duplicate prevention, and frequency rules before a request is sent." },
    { title: "Request an honest Google review", text: "Eligible customers receive a personalized SMS and email with the business's direct Google review link." },
    { title: "Monitor and maintain the system", text: "DaytonGrowthCo monitors delivery, suppressions, integration health, and the ongoing workflow through the reporting portal." },
  ];
  return <section className="program-section review-growth-program" id="google-review-growth" aria-labelledby="review-growth-program-title">
    <div className="flagship-shell program-layout">
      <div className="program-copy">
        <span className="section-eyebrow">HVAC review growth</span>
        <h2 id="review-growth-program-title">Google reviews, requested automatically after every eligible job.</h2>
        <p>We install and manage the SMS and email workflow for established residential HVAC companies.</p>
        <p className="program-fee"><strong>$2,500/year + usage costs</strong><span>Integration, setup, reporting, monitoring, and maintenance included.</span></p>
        <p className="program-promise"><strong>20-review guarantee</strong><span>20 new Google reviews within 30 days of full launch for qualifying HVAC companies, or the $2,500 program fee is refunded.</span></p>
        <p className="program-trust"><CheckCircle2 size={17} aria-hidden="true" /> Qualification requires 100+ eligible residential jobs per month and an active, verified, unrestricted Google Business Profile.</p>
        <Link className="button button-primary large" href="/google-reviews/book-call/">Schedule a Demo <ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
      <div className="program-detail">
        <ProgramSteps items={steps} />
        <p className="program-note">Requests ask for honest feedback only. The program does not buy reviews, offer incentives, review-gate customers, or promise ratings, rankings, leads, or revenue.</p>
      </div>
    </div>
  </section>;
}

function ProgramMatch() {
  return <section className="program-match" aria-labelledby="program-match-title"><div className="flagship-shell"><header><h2 id="program-match-title">Which system do you need?</h2></header><div className="program-match-grid"><article><p>I’m trying to lower an expensive service quote.</p><strong>Use The Better Quote Program™</strong><a href="/quote/start/">Upload Your Quote <ArrowRight size={15} aria-hidden="true" /></a></article><article><p>I need to move, rebuild, or modernize an existing website.</p><strong>Use The Website Migration Program™</strong><Link href="/website/">Start My Migration <ArrowRight size={15} aria-hidden="true" /></Link></article><article><p>Our team has an approved appointment queue it cannot keep up with.</p><strong>Use AppointRelay™</strong><Link href="/appointrelay/">Review the Queue <ArrowRight size={15} aria-hidden="true" /></Link></article><article><p>Completed HVAC jobs are not consistently becoming Google reviews.</p><strong>Use The HVAC Google Review Growth Program™</strong><Link href="/google-reviews/book-call/">Schedule a Demo <ArrowRight size={15} aria-hidden="true" /></Link></article></div></div></section>;
}

function BetterQuotePreview() {
  const currentQuote = 10000;
  const comparisonQuote = 7000;
  const grossDifference = currentQuote - comparisonQuote;
  const estimatedNetSavings = grossDifference - betterQuoteProgramFee(grossDifference);

  return (
    <section className={`${homepageClarityStyles.quoteSection} homepage-component`} aria-labelledby="home-quote-preview-title">
      <div className={homepageClarityStyles.quoteShell}>
        <header className={homepageClarityStyles.quoteCopy}>
          <span className={homepageClarityStyles.eyebrow}>Better Quote example</span>
          <h2 id="home-quote-preview-title">See the decision, not another wall of numbers.</h2>
          <p>A real person reviews comparable written quotes. This example shows how the published fee would affect a qualifying comparison.</p>
          <a className={homepageClarityStyles.primaryLink} href="/quote/start/">
            Check my quote <ArrowRight size={16} aria-hidden="true" />
          </a>
        </header>

        <div className={homepageClarityStyles.quoteVisual} aria-label="Illustrative quote comparison">
          <div className={homepageClarityStyles.quoteBarRow}>
            <span>Current quote</span>
            <div><i style={{ inlineSize: "100%" }} /></div>
            <strong>{formatCompactCurrency(currentQuote)}</strong>
          </div>
          <div className={homepageClarityStyles.quoteBarRow}>
            <span>Comparable lower quote</span>
            <div><i style={{ inlineSize: "70%" }} /></div>
            <strong>{formatCompactCurrency(comparisonQuote)}</strong>
          </div>
          <div className={homepageClarityStyles.quoteResult}>
            <span>Estimated net savings after the program fee</span>
            <strong>{formatCompactCurrency(estimatedNetSavings)}</strong>
          </div>
          <p>Illustrative only. Quotes must be legitimate and comparable. Savings are not guaranteed.</p>
        </div>
      </div>

      <details className={homepageClarityStyles.calculatorDisclosure}>
        <summary>Use the interactive savings calculator</summary>
        <BetterQuoteSavingsCalculator />
      </details>
    </section>
  );
}

function HowWeWork() {
  const steps = [
    { title: "Map the work", text: "We find the handoffs, follow-ups, and bottlenecks worth fixing first." },
    { title: "Build the right system", text: "We configure the tools, rules, and connections around the way your team actually works." },
    { title: "Stay close after launch", text: "We test, refine, and remain available when the work changes." },
  ];

  return (
    <section className={`${homepageClarityStyles.processSection} homepage-component`} aria-labelledby="homepage-process-title">
      <div className={homepageClarityStyles.processShell}>
        <div className={homepageClarityStyles.processCopy}>
          <span className={homepageClarityStyles.eyebrow}>How the work moves</span>
          <h2 id="homepage-process-title">Technology that fits the work.</h2>
          <p>One operating problem. One useful system. A clear handoff at every step.</p>
        </div>
        <ol className={homepageClarityStyles.processDiagram} aria-label="How DaytonGrowthCo works with a team">
          {steps.map((step, index) => (
            <li key={step.title} className={homepageClarityStyles.processStep}>
              <span className={homepageClarityStyles.processNode} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
        <a className={homepageClarityStyles.textLink} href="#cta">Talk through the first step <ArrowRight size={15} aria-hidden="true" /></a>
      </div>
    </section>
  );
}

const homeFaqs = [
  {
    q: "What kind of problem should I bring?",
    a: "Start with work that repeats, stalls, gets missed, or costs more than it should. We will help identify the smallest useful next step.",
  },
  {
    q: "Do you replace the tools we already use?",
    a: "Not automatically. We keep what works, configure existing tools when they fit, and build only where the workflow needs something more specific.",
  },
  {
    q: "How are scope and pricing handled?",
    a: "You receive a written scope that explains what is included, what it costs, and what happens next before the work begins.",
  },
];

function HomeFaq() {
  const [open, setOpen] = useState(0);
  return (
    <section className={`${homepageClarityStyles.faqSection} homepage-component`} aria-labelledby="home-faq-title">
      <div className={homepageClarityStyles.faqShell}>
        <div className={homepageClarityStyles.faqIntro}>
          <span className={homepageClarityStyles.eyebrow}>Before we talk</span>
          <h2 id="home-faq-title">
            Questions, answered plainly.
          </h2>
        </div>
        <ul className={homepageClarityStyles.faqList}>
          {homeFaqs.map((item, index) => {
            const isOpen = open === index;
            const buttonId = `home-faq-button-${index}`;
            const panelId = `home-faq-panel-${index}`;
            return (
              <li
                key={item.q}
                className={homepageClarityStyles.faqItem}
                data-open={isOpen ? "true" : "false"}
              >
                <button
                  id={buttonId}
                  type="button"
                  className={homepageClarityStyles.faqQuestion}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? -1 : index)}
                >
                  <span>{item.q}</span>
                  <ChevronDown size={18} aria-hidden="true" />
                </button>
                <div
                  id={panelId}
                  className={homepageClarityStyles.faqAnswer}
                  role="region"
                  aria-labelledby={buttonId}
                >
                  <div>
                    <p>{item.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Homepage() {
  return (
    <>
      <PageChrome />
      <main id="main-content" className="homepage" tabIndex={-1}>
        <Hero />
        <PostHeroBridge />
        <FlagshipOverview />
        <BetterQuotePreview />
        <HowWeWork />
        <HomeFaq />
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}

type PageHubIntroProps = {
  title: string;
  summary: string;
};

function PageHubIntro({ title, summary }: PageHubIntroProps) {
  return (
    <header className="page-hub-intro">
      <div className="page-hub-intro-inner">
        <div className="page-hub-title-block">
          <h1>{title}</h1>
          <p>{summary}</p>
        </div>
      </div>
    </header>
  );
}

function ProductsPage() {
  const operatingProducts = coreProductOffers.filter((product) => product.id !== "website");
  return (
    <>
      <PageChrome />
      <main id="main-content" className="dedicated-page products-page" tabIndex={-1}>
        <PageHubIntro title="Products" summary="Focused systems for the work your team repeats, delays, or still handles by hand." />
        <section className="products-flagships" aria-labelledby="products-flagships-title"><div className="products-shell"><header><h2 id="products-flagships-title">Our core offers</h2></header><div className="products-flagship-grid"><article className="is-quote"><span>The Better Quote Program™</span><h3>Have an expensive quote? Let us shop it.</h3><p>Real people compare your written quote with legitimate local options. No qualifying savings? No fee.</p><a href="/quote/">Upload Your Quote <ArrowRight size={16} aria-hidden="true" /></a></article><article className="is-migration"><span>The Website Migration Program™</span><h3>Move your site without keeping the platform bill.</h3><p>A one-time migration into a self-owned site, with scope and annual-cost comparison confirmed in writing.</p><a href="/website/">Start My Migration <ArrowRight size={16} aria-hidden="true" /></a></article><article className="is-appointrelay"><span>AppointRelay™</span><h3>Work the appointment queue your team can’t keep up with.</h3><p>Approved customer outreach, usable preferences, documented exceptions, and a clean handoff while dispatch keeps final control.</p><Link href="/appointrelay/">See If AppointRelay Fits <ArrowRight size={16} aria-hidden="true" /></Link></article><article className="is-review-growth"><span>The HVAC Google Review Growth Program™</span><h3>Make the review request automatic after every eligible job.</h3><p>We install and manage the CRM trigger, SMS and email requests, protections, reporting, and monitoring for $2,500 per year plus usage.</p><Link href="/google-reviews/book-call/">Schedule a Demo <ArrowRight size={16} aria-hidden="true" /></Link></article></div></div></section>
        <section className="products-operating" aria-labelledby="products-operating-title"><div className="products-shell"><header><h2 id="products-operating-title">Operating products</h2><p>Focused tools for the work your team repeats every week.</p></header><div className="products-operating-grid">{operatingProducts.map((product) => <Link href={product.href} key={product.id}><span className="products-icon">{product.icon}</span><div><strong>{product.name}</strong><p>{product.problem}</p></div><ArrowRight size={17} aria-hidden="true" /></Link>)}</div></div></section>
        <section className="products-cta"><div className="products-shell"><div><h2>Not sure where to start?</h2><p>Tell us what is taking too long. We’ll point you to the right product.</p></div><a className="button button-primary" href="/#cta">Start a conversation <ArrowRight size={16} aria-hidden="true" /></a></div></section>
        <PageCTA />
      </main>
      <SiteFooter />
    </>
  );
}

function ExamplesPage() {
  return (
    <>
      <PageChrome />
      <main id="main-content" className="dedicated-page examples-page" tabIndex={-1}>
        <PageHubIntro title="Examples" summary="A closer look at the inputs, working artifacts, and useful outputs behind the systems we build." />
        <WebsiteTransformation />
        <PhoneAgentOffer />
        <OutcomeSection />
        <SpreadsheetTransformation />
        <QuoteWorkflowExample />
        <AdvancedSystemPreview sectionId="connected-example" />
        <PageCTA />
      </main>
      <SiteFooter />
    </>
  );
}

function HowItWorksPage() {
  return (
    <>
      <PageChrome />
      <main id="main-content" className="dedicated-page how-page" tabIndex={-1}>
        <PageHubIntro title="How It Works" summary="We narrow the problem, prove the economics, and build the smallest useful system first." />
        <BuildPrinciples />
        <DiscoveryDiagnosis />
        <EconomicCase />
        <LaborCostCalculator sectionId="process-cost" />
        <EngagementNotes />
        <HowItWorksFaq />
        <PageCTA />
      </main>
      <SiteFooter />
    </>
  );
}

function AboutPage() {
  return (
    <>
      <PageChrome />
      <main id="main-content" className="dedicated-page about-page" tabIndex={-1}>
        <PageHubIntro title="About DaytonGrowthCo." summary="Practical systems for small teams, built around the work already happening." />
        <section className="about-founder" aria-labelledby="about-founder-title">
          <div className="section-film-media" aria-hidden="true">
            <BackgroundVideo className="section-film-video" src={videos.process.src} playbackRate={0.55} preload="metadata" />
          </div>
          <div className="section-film-mask" aria-hidden="true" />
          <div className="about-founder-inner">
            <div className="about-founder-portrait" aria-hidden="true">
              <picture>
                <source media="(max-width: 700px)" srcSet="/samuel-caruso-320.jpg" width="320" height="480" />
                <img
                  src="/samuel-caruso-533.jpg"
                  srcSet="/samuel-caruso-320.jpg 320w, /samuel-caruso-533.jpg 533w"
                  sizes="(max-width: 700px) 176px, 352px"
                  alt=""
                  width="533"
                  height="800"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
            </div>
            <div className="about-founder-copy">
              <p className="about-founder-role">Founder, DaytonGrowthCo.</p>
              <h2 id="about-founder-title">Samuel Caruso</h2>
              <p>
                Founded in 2026 by Dayton native Samuel Caruso, DaytonGrowthCo. helps contractors, trades, and small
                businesses make the repeated work easier to run.
              </p>
              <blockquote className="about-reading-quote">
                The point is not more software. It is a better way to run the work already in front of you.
              </blockquote>
              <p>
                We start with the workflow, use existing tools when they fit, and build only what is missing. Dayton is
                our home; the work is available nationwide.
              </p>
              <a className="about-founder-cta" href="/#cta">Start a conversation <ArrowRight size={15} aria-hidden="true" /></a>
            </div>
          </div>
        </section>
        <section className="build-principles about-mission-native" aria-labelledby="about-mission-title">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="dedicated-heading">
              <div><span className="section-eyebrow">Our approach</span><h2 id="about-mission-title">Why DaytonGrowthCo.</h2></div>
              <p>Small businesses deserve capable technology without enterprise complexity or another system controlling the owner. We build around the work already happening, so teams spend less time managing software and more time using their judgment.</p>
            </div>
            <ol className="build-principles-list">
              <li>
                <span>01</span>
                <strong>Process first</strong>
                <p>We map the calls, files, data, handoffs, and repeated steps before recommending a tool.</p>
              </li>
              <li>
                <span>02</span>
                <strong>Use what fits</strong>
                <p>Existing software is configured when it can solve the problem cleanly.</p>
              </li>
              <li>
                <span>03</span>
                <strong>Build what is missing</strong>
                <p>Custom tools are reserved for the places where the business workflow needs something specific.</p>
              </li>
            </ol>
          </div>
        </section>
        <PageCTA />
      </main>
      <SiteFooter />
    </>
  );
}

const assistantFaqs = [
  ["Do I need custom software?", "Often, no. We first look for a practical setup or connection using tools you already have. Custom work is for the part of the process that truly needs it."],
  ["What can I try for free?", "Each product has a real working start: a seven-day missed-call trial, homepage rebuild preview, follow-up for 25 open estimates, quote tool for one common job, or Google Business Profile cleanup."],
  ["What are the core products?", "24/7 phone answering and booking, website migration, automated follow-up and scheduling, estimate and proposal tools, Google and AI search help, and automated Google review texting."],
  ["How much does a project cost?", "It depends on the product and your setup. You see a small working result first, then receive a proposal only if a larger implementation makes sense."],
  ["Can you move our existing website?", "Yes. Website Migration keeps the useful content, brand, domain, and lead paths while moving you to a clearer, easier-to-manage site."],
  ["Can you help with missed calls?", "Yes. Phone Answering handles routine calls and booking. Missed Call Follow-Up sends timely texts and keeps open estimates moving."],
  ["How quickly can we start?", "Choose the product that matches your problem and send the requested business information. We reply within one business day with the next step."],
  ["Do you work outside Dayton?", "Absolutely. Dayton is where the company is rooted; the work is available to small businesses and service teams nationwide."],
];

function QuickAnswers() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const timeoutRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const matches = assistantFaqs.filter(([question]) => question.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current); }, []);

  const close = useCallback(() => {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, open]);

  const ask = (question: string, nextAnswer: string) => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setLastQuestion(question);
    setShowSuggestions(false);
    setThinking(true);
    setAnswer(null);
    timeoutRef.current = window.setTimeout(() => {
      setThinking(false);
      setAnswer(nextAnswer);
    }, 420);
  };

  return (
    <aside className={`quick-answers ${open ? "is-open" : ""}`} aria-label="Quick answers">
      {open ? (
        <div id="quickAnswersPanel" className="quick-answers-panel" role="dialog" aria-modal="false" aria-label="Answers to common questions">
          <div className="quick-answers-head">
            <div><BrandWordmark /><span>Ask about a practical first step.</span></div>
            <button ref={closeButtonRef} type="button" onClick={close} aria-label="Close quick answers"><X size={17} aria-hidden="true" /></button>
          </div>
          <div className="quick-answers-thread" aria-live="polite">
            <div className="quick-answers-message quick-answers-message--bot">
              <span className="quick-answers-avatar" aria-hidden="true">D</span>
              <p>What are you trying to make easier?</p>
            </div>
            {lastQuestion ? (
              <div className="quick-answers-message quick-answers-message--user"><p>{lastQuestion}</p></div>
            ) : null}
            {thinking ? <div className="quick-answers-message quick-answers-message--bot"><p className="quick-answers-thinking">Thinking<span>…</span></p></div> : null}
            {answer && !thinking ? <div className="quick-answers-message quick-answers-message--bot"><p className="quick-answers-response">{answer}</p></div> : null}
          </div>
          {showSuggestions ? (
            <div className="quick-answers-suggestions">
              <span>Suggested questions</span>
              <div className="quick-answers-list" aria-label="Suggested questions">
                {(matches.length ? matches : assistantFaqs).map(([question, response]) => (
                  <button type="button" key={question} onClick={() => ask(question, response)}>{question}<ArrowRight size={14} /></button>
                ))}
              </div>
            </div>
          ) : (
            <button type="button" className="quick-answers-suggestions-toggle" onClick={() => setShowSuggestions(true)} aria-expanded="false">
              Show suggested questions <ChevronDown size={14} aria-hidden="true" />
            </button>
          )}
          <form className="quick-answers-search" onSubmit={(event) => {
            event.preventDefault();
            const next = matches[0] ?? assistantFaqs[0];
            if (query.trim()) ask(query.trim(), next[1]);
          }}>
            <label className="sr-only" htmlFor="quick-answers-input">Ask a question</label>
            <Search size={15} aria-hidden="true" />
            <input id="quick-answers-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type a question" />
            <button type="submit" aria-label="Send question" disabled={!query.trim()}><Send size={14} /></button>
          </form>
          <a href="/#cta" className="quick-answers-cta">Ask about your workflow <ArrowRight size={14} /></a>
        </div>
      ) : null}
      <button ref={triggerRef} type="button" className="quick-answers-trigger" onClick={() => setOpen((value) => !value)} aria-controls="quickAnswersPanel" aria-expanded={open} aria-label="Open quick answers">
        <MessageSquare size={19} aria-hidden="true" />
        <span>Questions?</span>
      </button>
    </aside>
  );
}

// Self-identification section: helps the right visitor see themselves and lets
// the wrong one opt out. Net-new (the brief's "who it's for"). Qualitative copy,
// no invented metrics, no eyebrow label, no pills, no em dashes.
function WhoItsFor() {
  const cards = [
    {
      icon: ClipboardList,
      title: "You quote on nights and weekends",
      body: "Intake, pricing, and follow-up keep landing on you after hours. A tool can carry that load instead of you.",
    },
    {
      icon: Wrench,
      title: "Your software does not fit how you work",
      body: "You keep bending the business around off-the-shelf tools. We build around your actual workflow, not the other way around.",
    },
    {
      icon: TrendingDown,
      title: "An agency quote made no sense for your size",
      body: "Custom development was priced for enterprises. AI lets us deliver custom-grade work for a fraction of that.",
    },
    {
      icon: Table,
      title: "The business runs on spreadsheets and memory",
      body: "The important steps live in your head or in scattered files. We turn them into one system that holds together.",
    },
  ];

  return (
    <section className="who-its-for" id="who-its-for" aria-labelledby="who-its-for-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="who-its-for-heading" data-reveal>
          <h2 id="who-its-for-title">
            This is built for you
            <span>if one of these is your week.</span>
          </h2>
        </div>
        <div className="who-its-for-grid" data-stagger>
          {cards.map(({ icon: Icon, title, body }) => (
            <article className="who-its-for-card" key={title} tabIndex={0}>
              <span className="who-its-for-icon" aria-hidden="true">
                <Icon size={20} strokeWidth={1.8} />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function App({ initialPath = "/" }: { initialPath?: string }) {
  useMotionSystem();
  useScrollChoreography();
  useButtonGlow();
  useMuxVideos();
  useTurnstileProtection();
  useScrollProgressFallback();

  const path = initialPath.replace(/\/+$/, "") || "/";
  useEffect(() => {
    if (path !== "/") {
      const bootSplash = document.getElementById("boot-splash");
      if (bootSplash) {
        bootSplash.hidden = true;
        bootSplash.setAttribute("aria-hidden", "true");
      }
      try {
        window.localStorage.setItem("dgc:splash-seen", "1");
        window.sessionStorage.setItem("dgc:splash-seen", "1");
      } catch {
        /* Ignore unavailable storage; non-home pages still force-hide splash. */
      }
      document.documentElement.classList.add("dgc-splash-seen");
      document.documentElement.classList.remove("dgc-splash-pending");
      document.body.classList.remove("splash-lock");
    }

    const titles: Record<string, string> = {
      "/": "DaytonGrowthCo. | Practical Business Tools and Digital Systems",
      "/products": "Products | DaytonGrowthCo.",
      "/examples": "Examples | DaytonGrowthCo.",
      "/how-it-works": "How It Works | DaytonGrowthCo.",
      "/aboutus": "About DaytonGrowthCo. | Tools and Digital Systems",
      "/ai-phone-agents": "24/7 Phone Answering & Booking | DaytonGrowthCo.",
      "/quote-tools": "Estimate & Proposal Tools | DaytonGrowthCo.",
      "/dashboards-portals": "Business Dashboards and Customer Portals | DaytonGrowthCo.",
      "/website-design": "Website Redesign Services in Dayton, OH | DaytonGrowthCo.",
      "/website-ownership-calculator": "Website Ownership ROI Calculator | DaytonGrowthCo.",
      "/missed-call-follow-up": "Automated Follow-Up and Scheduling for Trades | DaytonGrowthCo.",
      "/google-review-texting": "Automated Google Review Texting | DaytonGrowthCo.",
      "/local-search": "Get Found on Google and AI Search | DaytonGrowthCo.",
      "/quote/pricing": "Pricing | DaytonGrowthCo.",
    };
    document.title = titles[path] || titles["/"];
  }, [path]);

  let page: React.ReactNode = <Homepage />;
  if (path === "/products" || path === "/what-we-build") page = <ProductsPage />;
  if (path === "/examples") page = <ExamplesPage />;
  if (path === "/how-it-works") page = <HowItWorksPage />;
  if (path === "/aboutus") page = <AboutPage />;
  if (path === "/website-ownership-calculator") page = <WebsiteOwnershipCalculatorPage />;
  if (path === "/quote/pricing") page = <PricingPage />;
  if (path === "/google-review-texting") page = <ReviewTextingPage />;
  if (path in servicePages) page = <ServicePage service={servicePages[path]} />;

  return (
    <PersonalizationProvider>
      {page}
      <QuickAnswers />
      <Analytics />
      <SpeedInsights />
    </PersonalizationProvider>
  );
}
