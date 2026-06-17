import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  CheckCircle2,
  FileInput,
  Gauge,
  Layers3,
  LockKeyhole,
  MapPin,
  PanelTop,
  Phone,
  Radar,
  Route,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
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
    text: "A cleaner website, stronger local search basics, and clear contact or quote paths.",
  },
  {
    icon: Radar,
    title: "Tech Integration",
    text: "Implement a booking page, form flow, calendar connection, notifications, or follow-up system.",
  },
  {
    icon: Route,
    title: "Custom Systems",
    text: "A custom tool, dashboard, portal, or workflow built around how your business runs.",
  },
  {
    icon: ShieldCheck,
    title: "Lead Flow Improvements",
    text: "Practical follow-up, reminder, and handoff improvements help your team respond faster with less manual work.",
  },
  {
    icon: Gauge,
    title: "Local Visibility",
    text: "Basic local SEO, Google Maps, and Google Business Profile cleanup options help nearby customers understand and contact you.",
  },
  {
    icon: LockKeyhole,
    title: "One-Time Setup Packages",
    text: "Clear website, form, booking, and lead tracking improvements set up without a required monthly contract.",
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
    text: "For businesses that need a cleaner website, stronger local search basics, service pages, contact paths, and a more professional online presence.",
    bullets: [
      "Mobile-friendly website setup",
      "Local SEO basics",
      "Clear service pages and calls to action",
      "Contact or quote form setup",
    ],
    action: "Price My Website",
  },
  {
    label: "Implemented for you",
    title: "Tech Integration",
    price: "Project-based",
    text: "For businesses that already know they need a system implemented, like salon booking, intake forms, calendar routing, reminders, or tool connections.",
    bullets: [
      "Booking page or request flow",
      "Calendar, form, and CRM connections",
      "Notifications and follow-up setup",
      "Testing and launch support",
    ],
    action: "Implement My System",
  },
  {
    label: "Most flexible",
    title: "Custom Systems",
    price: "Custom quote",
    text: "For more complicated work: custom dashboards, portals, lead systems, internal workflows, and tools built around how your business actually runs.",
    bullets: [
      "Custom dashboards or portals",
      "Workflow automation",
      "Existing tool integrations",
      "Built, tested, and launched",
    ],
    action: "Scope My System",
    featured: true,
  },
];

const preservedCopy = [
  "DaytonGrowthCo helps Dayton-area businesses set up clearer websites, smarter forms, booking flows, follow-up tools, and simple lead organization systems.",
  "One-time setups that automate workflow, integrate your website with the tools you use, and build custom tools for local businesses.",
  "DaytonGrowthCo automates manual workflow, integrates websites with the tools businesses already use, and builds custom tools so local businesses save time and win more work.",
  "The setups help reduce confusing websites, missed form submissions, scattered messages, slow follow-up, manual handoffs, and leads that disappear into inboxes or spreadsheets.",
  "Born and raised in Dayton, Ohio, Samuel Caruso has always loved building things.",
  "After seeing how many local businesses struggled with outdated websites, Samuel realized the problem was not design. The problem was that their websites did not actually do anything.",
  "He founded DaytonGrowthCo. to fix that, giving business owners a reliable partner focused on building practical systems for growth.",
  "Helping Dayton-area businesses improve websites, local SEO, tech integrations, and the systems behind daily work.",
];

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
            src="https://www.daytongrowth.co/favicon.png?v=2"
            alt=""
            width="28"
            height="28"
          />
          <span>
            Dayton<span>Growth</span><b>Co.</b>
          </span>
        </a>
        <a className="button button-primary" href="#cta">
          Start a Project
          <ArrowRight size={15} aria-hidden="true" />
        </a>
      </nav>
    </header>
  );
}

function useActiveSection() {
  const [activeSection, setActiveSection] = useState(pageSections[0].id);

  useEffect(() => {
    const sections = pageSections
      .map((section) => document.getElementById(section.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!("IntersectionObserver" in window) || sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: [0.08, 0.2, 0.45, 0.7] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
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
  return (
    <a className="segment-card group" href="#workflow">
      <DottedPanel className="segment-stage">
        <div className="mini-board" aria-hidden="true">
          <div className="mini-board-header">
            <span>{index === 0 ? "Review queue" : "Action lane"}</span>
            <Sparkles size={13} aria-hidden="true" />
          </div>
          <div className="mini-board-rows">
            {segment.items.map((item, itemIndex) => (
              <span key={item} className="mini-row" style={{ transitionDelay: `${itemIndex * 70}ms` }}>
                <i />
                {item}
              </span>
            ))}
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

function Hero() {
  return (
    <section id="top" className="hero-section">
      <BackgroundVideo className="hero-product-video" src={videos.hero.src} />
      <div className="hero-product-video-mask" aria-hidden="true" />
      <div className="sky-glow" aria-hidden="true" />
      <ClayLandscape scene="warm" />
      <div className="mx-auto max-w-7xl px-5 pt-28 sm:px-8 lg:pt-32">
        <div className="clay-hero-copy hero-entrance">
          <span className="hero-label">DaytonGrowthCo. / automation system setup</span>
          <h1 className="hero-title">
            <span data-scroll-words>Automating the workflow</span>
            <span data-scroll-words>for small businesses.</span>
          </h1>
          <p>
            We automate the systems behind the website and daily workflow so leads, follow-ups, and next steps move
            without you babysitting every handoff.
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
        </div>

        <div className="segment-grid" aria-label="Product modes">
          {segments.map((segment, index) => (
            <SegmentCard key={segment.label} segment={segment} index={index} />
          ))}
        </div>
      </div>
      <div className="hero-product-float" aria-label="Product workflow preview">
        <DottedPanel className="hero-product-stage">
          <ProductSceneCard step={workflowSteps[3]} index={3} />
        </DottedPanel>
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

function LiquidGlassMoment() {
  return (
    <section className="glass-moment" aria-labelledby="glass-heading">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div className="section-heading compact-heading" data-reveal>
          <span className="section-kicker">Version two cue</span>
          <h2 id="glass-heading">
            Lead system preview.
            <span>Form, notify, follow up.</span>
          </h2>
          <p>
            The original site used polished product-motion scenes instead of generic screenshots. This redesign keeps
            that idea with a calmer material stage and a clear customer handoff.
          </p>
        </div>
        <div className="glass-stage" aria-hidden="true">
          <ClayLandscape scene="pearl" />
          <div className="glass-word">Flow</div>
          <div className="glass-chip">Follow-up queued</div>
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
            <div className="portal-status">
              <span />
              <div>
                <small>Portal Status</small>
                <strong>100% Operational</strong>
              </div>
            </div>
          </div>
        </div>
        <div className="section-heading about-copy" data-reveal>
          <span className="section-kicker">About DaytonGrowthCo.</span>
          <h2>
            Meet the Founder.
            <span>Built in Dayton, Ohio.</span>
          </h2>
          <p>
            Born and raised in Dayton, Ohio, Samuel Caruso has always loved building things. He earned his undergraduate
            degree in History from the University of Michigan and later completed a Master's in Entrepreneurship and
            Emerging Technology.
          </p>
          <blockquote>
            After seeing how many local businesses struggled with outdated websites, Samuel realized the problem was not
            design. The problem was that their websites did not actually do anything.
          </blockquote>
          <p>
            He founded DaytonGrowthCo. to fix that, giving business owners a reliable partner focused on building
            practical systems for growth.
          </p>
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
          <p>
            Every business has different bottlenecks. Some need a better website or local SEO cleanup. Others need a
            booking page, intake flow, dashboard, or a whole operating system that finally matches how the business
            works.
          </p>
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
              Pricing for websites and systems.
              <span>Scoped around what you need implemented.</span>
            </h2>
            <p>
              Some projects are straightforward website and SEO improvements. Others are deeper tech integrations or
              custom systems. The right setup depends on what you need implemented.
            </p>
          </div>
          <div className="pricing-grid">
            {pricingCards.map((card) => (
              <article className={`pricing-card ${card.featured ? "featured" : ""}`} key={card.title} data-reveal>
                <span className="eyebrow">{card.label}</span>
                <h3>{card.title}</h3>
                <strong>{card.price}</strong>
                <p>{card.text}</p>
                <ul>
                  {card.bullets.map((bullet) => (
                    <li key={bullet}>✓ {bullet}</li>
                  ))}
                </ul>
                <a className={card.featured ? "button button-primary" : "button button-secondary"} href="#cta">
                  {card.action}
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section id="cta" className="final-cta">
      <BackgroundVideo className="form-background-video" poster={videos.form.poster} stream={videos.form.stream} />
      <div className="form-video-mask" aria-hidden="true" />
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <span className="section-kicker">Start a project</span>
        <h2>DaytonGrowthCo. helps small to mid-sized companies improve profitability by increasing digital impact.</h2>
        <p>
          We handle simple website and SEO improvements, tech integrations, and more complex custom systems.
        </p>
        <div className="intake-options" aria-label="Setup package options">
          <span>Website + SEO Setup</span>
          <span>Tech Integration</span>
          <span>Custom Systems</span>
        </div>
        <div className="cta-actions">
          <a className="button button-primary large" href="mailto:help@daytongrowth.co">
            Start a Project
            <ArrowRight size={16} aria-hidden="true" />
          </a>
          <a className="text-link" href="tel:+19373677089">
            (937) 367-7089
          </a>
        </div>
      </div>
    </section>
  );
}

function CopyArchive() {
  return (
    <section className="copy-archive" aria-labelledby="copy-archive-heading">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="section-heading compact-heading" data-reveal>
          <span className="section-kicker">Original DaytonGrowthCo. copy preserved</span>
          <h2 id="copy-archive-heading">
            Same business.
            <span>New presentation system.</span>
          </h2>
        </div>
        <div className="archive-grid">
          {preservedCopy.map((copy) => (
            <p key={copy}>{copy}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

function SplashScreen() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.body.classList.add("splash-lock");
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
          <img src="https://www.daytongrowth.co/favicon.png?v=2" alt="" className="splash-logo" />
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

  return (
    <>
      <SplashScreen />
      <div id="scroll-progress-bar" aria-hidden="true" />
      <Header />
      <ScrollDots />
      <main>
        <Hero />
        <StickyWorkflow />
        <LiquidGlassMoment />
        <FeatureGrid />
        <AboutSection />
        <OutcomeSection />
        <CopyArchive />
        <FinalCTA />
      </main>
      <footer className="site-footer">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© {year} DaytonGrowthCo. All rights reserved.</span>
          <span>
            Dayton, OH · <a href="mailto:help@daytongrowth.co">help@daytongrowth.co</a> ·{" "}
            <a href="tel:+19373677089">(937) 367-7089</a>
          </span>
        </div>
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
