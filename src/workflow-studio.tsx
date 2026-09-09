"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, FileText, Phone, RotateCcw } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import styles from "./workflow-studio.module.css";

const journey = ["Request captured", "Quote prepared", "Visit requested", "Team informed"];

/** One finite sequence. The completed illustration remains useful without JS or motion. */
export function WorkflowScene({ compact = false, stage }: { compact?: boolean; stage?: number }) {
  const reduced = useReducedMotion();
  const [replay, setReplay] = useState(0);
  return <div className={styles.scene} data-compact={compact} data-stage={stage} data-motion={reduced ? "off" : "on"}>
    <div className={styles.sceneHeading}><span><i /> A clearer way to work</span><span>Illustrative workflow</span></div>
    <div className={styles.sceneCanvas} key={replay}>
      <div className={styles.sceneOrbit} aria-hidden="true" />
      <article className={`${styles.request} ${styles.sceneCard}`}>
        <span className={styles.cardLabel}><Phone size={14} /> Incoming request</span>
        <p>“Can you help with a<br />service visit?”</p>
        <span className={styles.cardFoot}>One conversation. Details captured.</span>
      </article>
      <div className={styles.sceneConnection} aria-hidden="true"><span /><ArrowRight size={16} /></div>
      <article className={`${styles.record} ${styles.sceneCard}`}>
        <div className={styles.recordTop}><span className={styles.cardLabel}>Shared job record</span><span className={styles.recordNumber}>DGC / 024</span></div>
        <h3>From request<br />to ready.</h3>
        <ol>{journey.map((item, index) => <li key={item} data-complete={stage === undefined || index <= stage}><span className={styles.check}><Check size={12} /></span><span>{item}</span><small>{String(index + 1).padStart(2, "0")}</small></li>)}</ol>
        <div className={styles.recordFooter}><span>Next owner</span><strong>Service team <ArrowUpRight size={13} /></strong></div>
      </article>
      <div className={styles.handoff}><span className={styles.check}><Check size={12} /></span><div><strong>Everything in one place.</strong><span>The next step is clear.</span></div></div>
    </div>
    {!compact && stage === undefined && <button className={styles.replay} type="button" onClick={() => setReplay((value) => value + 1)}><RotateCcw size={12} /> Replay workflow</button>}
  </div>;
}

const demoContent: Record<string, { label: string; title: string; stages: string[]; detail: string[] }> = {
  appointments: { label: "Appointment queue", title: "Preferences captured. Dispatch in control.", stages: ["Approve", "Contact", "Relay"], detail: ["The workflow begins with a queue of approved customers.", "Usable scheduling preferences and exceptions are documented.", "Dispatch receives a clean handoff and confirms the actual appointment."] },
  calls: { label: "Call intake", title: "A useful answer. A clean handoff.", stages: ["Answer", "Capture", "Hand off"], detail: ["A routine service call is answered using approved business information.", "The service, urgency, and callback details become one working record.", "The team receives the context. Urgent calls go to a person."] },
  estimates: { label: "Estimate studio", title: "Your rates. A ready-to-review quote.", stages: ["Choose scope", "Apply rates", "Review quote"], detail: ["Start with the job and the scope your team already understands.", "Apply your approved labor, material, and markup rules.", "Review the prepared proposal before it reaches the customer."] },
  dashboards: { label: "Shared workspace", title: "One record everyone can work from.", stages: ["Gather", "Organize", "Assign"], detail: ["The customer request, quote, and job notes start in separate places.", "Related information comes together in one shared job record.", "Each open item has a visible status, next action, and owner."] },
  website: { label: "Website transformation", title: "A clearer path to your business.", stages: ["Before", "After"], detail: ["An illustrative starting point: services and contact details compete for attention.", "A focused service hierarchy and a clear next step help customers find their way."] },
  followup: { label: "Follow-up workspace", title: "Keep the next conversation moving.", stages: ["Flag", "Prepare", "Route"], detail: ["An unanswered request enters the follow-up queue.", "The system prepares the approved message and timing.", "Replies and exceptions go to a person who can help."] },
  reviews: { label: "Review workflow", title: "The right request, at the right time.", stages: ["Complete", "Check", "Request"], detail: ["An eligible completed job starts the review workflow.", "Timing, opt-outs, and duplicate checks are applied.", "The customer receives a request for honest feedback."] },
  search: { label: "Local presence", title: "Make the essentials easy to find.", stages: ["Services", "Area", "Proof"], detail: ["Explain the specific services customers are looking for.", "Show where you work and how to reach your team.", "Connect genuine project work and customer feedback to the service."] },
};

export function ServiceDemo({ product = "dashboards" }: { product?: string }) {
  const content = demoContent[product] ?? demoContent.dashboards;
  const [step, setStep] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const changeStep = (index: number, pointer: boolean) => {
    if (index === step) return;
    setStep(index);
    if (!pointer || reduced) return;
    viewportRef.current?.getAnimations().forEach((animation) => animation.cancel());
    viewportRef.current?.animate([{ opacity: .65 }, { opacity: 1 }], { duration: 160, easing: "ease-out" });
  };
  const id = useId();
  return <section className={styles.demo} aria-label={`${content.label} demonstration`}>
    <div className={styles.demoTop}><span>{content.label}</span><span>Interactive example</span></div>
    <h2>{content.title}</h2>
    <div className={styles.demoViewport} data-step={step} ref={viewportRef}>
      {product === "calls" ? <div className={styles.callDemo}>
        <div className={styles.callDisc}><Phone size={24} /></div>
        <div className={styles.wave} aria-hidden="true">{Array.from({ length: 25 }, (_, i) => <i key={i} style={{ height: `${12 + ((i * 17) % 35)}px` }} />)}</div>
        <span className={styles.demoCaption}>{["Routine service inquiry", "Service · urgency · callback", "Summary ready for your team"][step]}</span>
        <div className={styles.demoReceipt}><Check size={16} />{["Approved answers", "Details captured once", "Human handoff ready"][step]}</div>
      </div> : product === "website" ? <div className={styles.websiteDemo} data-after={step === 1}>
        <div className={styles.browserBar}><i /><i /><i /><span>Illustrative service website</span></div>
        {step === 0 ? <div className={styles.websiteBefore}><small>HOME · ABOUT · NEWS · MORE</small><h3>Welcome to our website</h3><p>Services. Updates. Information.</p><div><span>Latest news</span><span>Our services</span><span>Contact us</span></div></div> : <div className={styles.websiteAfter}><small>LOCAL SERVICE. CLEAR NEXT STEPS.</small><h3>Good work.<br />One call away.</h3><span>Tell us what you need <ArrowRight size={13} /></span></div>}
      </div> : product === "estimates" ? <div className={styles.estimateDemo}><FileText size={23} /><span className={styles.cardLabel}>Service proposal / preview</span><h3>{["Define the work", "Apply your pricing", "Ready for review"][step]}</h3>{["Scope of work", "Labor & materials", "Approval"].map((label, i) => <div key={label}><span>{label}</span><strong>{i <= step ? <Check size={14} /> : "—"}</strong></div>)}</div>
      : product === "search" ? <div className={styles.searchDemo}><span>Local service business</span><h3>{["What we do", "Where we work", "Work you can see"][step]}</h3><p>{["Specific services. Clear answers.", "Dayton & the Miami Valley", "Real projects. Useful context."][step]}</p><div><Check size={15} /> Consistent across your website and listing</div></div>
      : product === "reviews" || product === "followup" || product === "appointments" ? <div className={styles.messageDemo}><div><span>{product === "reviews" ? "Completed service" : product === "appointments" ? "Approved customer queue" : "Open request"}</span><Check size={15} /></div><p>{product === "appointments" ? ["Only approved contacts enter the workflow.", "Usable preferences captured. Exceptions documented.", "Preference: weekday morning. Dispatch confirms the appointment."][step] : step === 0 ? "A customer is ready for the next step." : step === 1 ? "Approved timing and contact preferences checked." : product === "reviews" ? "Thanks for choosing us. Would you share your honest feedback?" : "Thanks for getting in touch. How can we help with your service request?"}</p><small>{step === 2 ? "Example message · no message is sent" : "Example workflow"}</small></div>
      : <div className={styles.boardDemo}>{["Request", "Quote", "Job notes"].map((item, i) => <div key={item} data-connected={step > 0}><span>{item}</span><strong>{step === 0 ? ["Inbox", "Spreadsheet", "Text message"][i] : step === 1 ? "Job 024" : ["Office team", "Estimator", "Service team"][i]}</strong><span className={styles.check}><Check size={12} /></span></div>)}<p>{step === 0 ? "Three sources. One piece of work." : step === 1 ? "Connected to the same record." : "A clear owner for every next step."}</p></div>}
    </div>
    <div className={styles.demoTabs} role="group" aria-label="Choose a demonstration step">{content.stages.map((label, i) => <button key={label} type="button" aria-pressed={step === i} aria-controls={`${id}-detail`} onClick={(event) => changeStep(i, event.detail > 0)}><span>{String(i + 1).padStart(2, "0")}</span>{label}</button>)}</div>
    <p id={`${id}-detail`} className={styles.demoDescription} aria-live="polite">{content.detail[step]}</p>
  </section>;
}

const projects = [
  { id: "waibel", name: "Waibel Energy Solutions", image: "/client-logos/waibel.jpg", field: "Website migration", description: "A clearer service structure that is easier for the team to keep current.", href: "/website", scope: "Service structure & website migration" },
  { id: "khan", name: "Khan Construction", image: "", field: "Clearer service visibility", description: "Operational information organized around the work already in motion.", href: "/dashboards-portals", scope: "Operational information & visibility" },
  { id: "flightfix", name: "FlightFix", image: "/client-logos/flightfix.jpg", field: "Workflow simplification", description: "A focused workflow that makes handoffs and next steps easier to see.", href: "/systems-that-pay", scope: "Workflow clarity & handoffs" },
  { id: "shmus", name: "Shmu’s Automotive", image: "/client-logos/shmus.png", field: "Review growth", description: "Consistent customer follow-up without relying on the team to remember it.", href: "/google-review-texting", scope: "Customer follow-up & review requests" },
];

export function ProjectStudies({ compact = false }: { compact?: boolean }) {
  return <section className={`${styles.studies} homepage-component`} data-studio="work" id="selected-work" aria-labelledby="selected-work-heading">
    <div className={styles.sectionShell}>
      <header className={styles.sectionHeading}><div><span className={styles.eyebrow}>Selected work / DaytonGrowthCo.</span><h2 id="selected-work-heading">Real businesses.<br />Practical improvements.</h2></div><p>A closer look at the work behind the names.<br />Focused projects, built around the team.</p></header>
      <div className={styles.projectGrid}>{projects.slice(0, compact ? 2 : 4).map((project, index) => <article className={styles.project} id={`project-${project.id}`} key={project.id}>
        <div className={styles.projectMark}><span className={styles.projectIndex}>0{index + 1} / Project brief</span>{project.image ? <img src={project.image} alt={`${project.name} logo`} width="200" height="100" loading="lazy" /> : <span className={styles.projectMonogram}>KC</span>}<span>{project.field}</span></div>
        <div className={styles.projectCopy}><h3>{project.name}</h3><p>{project.description}</p><dl><dt>Project focus</dt><dd>{project.scope}</dd></dl><Link href={project.href}>Explore the service <ArrowUpRight size={16} /></Link></div>
      </article>)}</div>
      {compact && <Link className={styles.textLink} href="/examples#selected-work">Explore all project briefs <ArrowRight size={16} /></Link>}
    </div>
  </section>;
}

const process = [
  { title: "Map the work.", description: "We follow a real request through your team: where it arrives, what gets copied, and where the next step gets lost.", output: "A clear starting point", caption: "The request and the people behind it." },
  { title: "Connect the right pieces.", description: "We configure what fits and build what is missing. Your rules, information, and people stay at the center of the system.", output: "A working system to test", caption: "The details follow the work." },
  { title: "Put it to work. Stay close.", description: "We test the handoffs, help your team get comfortable, and refine the system as the real work changes.", output: "A useful tool, with support", caption: "A clear handoff to the next person." },
];

const deliverables = [
  { name: "01 / Agreed workflow map", title: "Know where the work goes.", items: ["Request arrives → Intake owner", "Details checked → Shared record", "Exception found → Team decision"], handoff: "Inputs, owners, and the next action agreed." },
  { name: "02 / Working system to test", title: "Make each handoff usable.", items: ["Approved inputs → Connected tool", "Your business rules → Draft output", "Team review → Ready for a real trial"], handoff: "A reviewable build, connected to your process." },
  { name: "03 / Launch & support handoff", title: "Give the team a clear start.", items: ["Test cases → Checked together", "Team walkthrough → Named owner", "Follow-up review → Improvements logged"], handoff: "A tested workflow and an agreed support plan." },
];
function ProcessArtifact({ stage }: { stage: number }) {
  const item = deliverables[stage];
  return <div className={styles.processArtifact}><span>{item.name}</span><small>Illustrative deliverable</small><h3>{item.title}</h3><ol>{item.items.map((line, i) => <li key={line}><span>0{i + 1}</span>{line}</li>)}</ol><p><Check size={16} />{item.handoff}</p></div>;
}

export function ProcessStory({ title = "Technology that fits the work." }: { title?: string }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const query = window.matchMedia("(min-width: 900px) and (prefers-reduced-motion: no-preference)");
    let observer: IntersectionObserver | undefined;
    const setup = () => {
      observer?.disconnect();
      if (!query.matches) return;
      observer = new IntersectionObserver(() => {
        // Compare every step, including those whose threshold did not change.
        const focusLine = window.innerHeight * .475;
        const visible = Array.from(element.querySelectorAll<HTMLElement>("[data-process-step]"))
          .map((step) => ({ step, rect: step.getBoundingClientRect() }))
          .filter(({ rect }) => rect.bottom > window.innerHeight * .25 && rect.top < window.innerHeight * .7)
          .sort((a, b) => Math.abs((a.rect.top + a.rect.bottom) / 2 - focusLine) - Math.abs((b.rect.top + b.rect.bottom) / 2 - focusLine))[0];
        if (visible) setActive(Number(visible.step.dataset.processStep));
      }, { rootMargin: "-25% 0px -30% 0px", threshold: [0, .2, .5] });
      element.querySelectorAll("[data-process-step]").forEach((item) => observer?.observe(item));
    };
    setup(); query.addEventListener("change", setup);
    return () => { observer?.disconnect(); query.removeEventListener("change", setup); };
  }, []);
  return <section className={`${styles.process} homepage-component`} data-studio="process" ref={root} aria-labelledby="workflow-process-heading">
    <div className={styles.sectionShell}>
      <header className={styles.sectionHeading}><div><span className={styles.eyebrow}>The way we work</span><h2 id="workflow-process-heading">{title}</h2></div><p>One operating problem. One useful system.<br />A clear handoff at every step.</p></header>
      <div className={styles.processGrid}><div className={styles.processSticky}><ProcessArtifact stage={active} /><p className={styles.processCaption}>{process[active].caption}</p><div className={styles.processProgress} aria-hidden="true"><span style={{ transform: `scaleX(${(active + 1) / process.length})` }} /></div></div><ol className={styles.processSteps}>{process.map((step, index) => <li key={step.title} data-process-step={index} data-active={active === index}><span className={styles.stepNumber}>0{index + 1}</span><h3>{step.title}</h3><p>{step.description}</p><span className={styles.processOutput}><Check size={14} />{step.output}</span><div className={styles.mobileArtifact}><ProcessArtifact stage={index} /></div></li>)}</ol></div>
      <Link href="/#cta" className={styles.textLink}>Talk through the first step <ArrowRight size={16} /></Link>
    </div>
  </section>;
}

const migrationSlides = [
  { label: "The starting point", title: "Move your website.\nKeep what works.", description: "A practical migration plan for the pages, forms, search foundations, and lead paths your business already relies on.", points: ["Useful pages", "Customer inquiries", "Your domain"] },
  { label: "The plan", title: "Every important detail,\naccounted for.", description: "We review your current platform and agree on the scope before the move begins.", points: ["Pages & content", "Forms & integrations", "Redirects & tracking"] },
  { label: "The build", title: "Test the new site.\nThen make the move.", description: "The new website is built and tested before launch. Your team can review the work while the existing site remains in place.", points: ["Review the build", "Check the lead paths", "Prepare the launch"] },
  { label: "Your ownership", title: "A clear scope.\nA site you own.", description: "Standard Migration starts at $1,500. The one-time investment and recurring ownership costs are documented separately in writing.", points: ["Written scope", "Transparent costs", "Post-launch review"] },
];

export function MigrationPresentation() {
  const [slide, setSlide] = useState(0);
  const content = migrationSlides[slide];
  return <section className={styles.presentation} aria-label="Website migration overview">
    <div className={styles.presentationBody} aria-live="polite"><div className={styles.presentationTop}><span>DaytonGrowthCo.</span><span>Website migration / 0{slide + 1}</span></div><span className={styles.eyebrow}>{content.label}</span><h2>{content.title}</h2><p>{content.description}</p><ul>{content.points.map((point) => <li key={point}><Check size={15} />{point}</li>)}</ul></div>
    <div className={styles.presentationControls}><span>{String(slide + 1).padStart(2, "0")} <span>/ 04</span></span><div><button aria-label="Previous overview slide" type="button" disabled={slide === 0} onClick={() => setSlide((value) => value - 1)}><ChevronLeft size={18} /></button><button aria-label="Next overview slide" type="button" disabled={slide === migrationSlides.length - 1} onClick={() => setSlide((value) => value + 1)}><ChevronRight size={18} /></button></div><a href="#assessment">Plan your migration <ArrowRight size={15} /></a></div>
  </section>;
}
