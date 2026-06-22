import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Bot,
  Calculator,
  Check,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  Globe2,
  PhoneCall,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import "./systems-that-pay.css";

const formAction =
  "https://script.google.com/macros/s/AKfycbxEUav9QVm2D2tOX3zIJednJl3t23DCeKNV2OW8MErA2BC2njJJpAkeH25sacvceX82rg/exec";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const systems = [
  {
    icon: Calculator,
    label: "Quoting",
    waste: "Rebuilding the same estimate from notes, price sheets, and memory.",
    system: "A guided quote builder that applies your pricing logic and produces a send-ready estimate.",
    return: "Faster response, consistent margins, less estimator time.",
  },
  {
    icon: PhoneCall,
    label: "Call agents",
    waste: "Owners and field staff stopping work to answer routine calls or losing after-hours context.",
    system: "A phone agent that answers, qualifies, documents, and routes calls using your rules.",
    return: "Fewer interruptions and cleaner handoffs without adding a full shift.",
  },
  {
    icon: FileSpreadsheet,
    label: "Operating systems",
    waste: "Copying details between texts, spreadsheets, PDFs, inboxes, and job folders.",
    system: "One focused workflow for intake, job data, approvals, files, and next actions.",
    return: "Less double entry, fewer missed details, more visible work.",
  },
  {
    icon: Bot,
    label: "Practical AI",
    waste: "Paying skilled people to summarize, sort, draft, classify, or search repetitive information.",
    system: "AI embedded at specific bottlenecks—with human review where judgment matters.",
    return: "Lower administrative load without handing control to a black box.",
  },
  {
    icon: Globe2,
    label: "Website + ads",
    waste: "Sending paid traffic to an old site that makes the company look smaller or harder to trust.",
    system: "A fast website and campaign pages aligned to the service, location, and buyer’s decision.",
    return: "More value from the traffic you already pay to earn.",
  },
  {
    icon: Search,
    label: "SEO + AEO",
    waste: "Depending entirely on paid media while search engines and AI answers cannot interpret your expertise.",
    system: "Technical structure, local pages, useful content, and machine-readable business signals.",
    return: "A compounding discovery channel that reduces reliance on rented attention.",
  },
];

const principles = [
  "Fix the expensive bottleneck first.",
  "Use existing software when it fits.",
  "Build custom only where your process creates an advantage.",
  "Measure time removed, errors avoided, and capacity recovered.",
];

function RoiModel() {
  const [people, setPeople] = useState(3);
  const [hours, setHours] = useState(5);
  const [rate, setRate] = useState(38);
  const [recovery, setRecovery] = useState(50);

  const result = useMemo(() => {
    const annualDrag = people * hours * rate * 50;
    const recoverable = annualDrag * (recovery / 100);
    const monthly = recoverable / 12;
    return { annualDrag, recoverable, monthly };
  }, [people, hours, rate, recovery]);

  return (
    <section className="roi-model" id="model" aria-labelledby="model-title">
      <div className="model-intro">
        <span className="section-kicker">Run the labor math</span>
        <h2 id="model-title">What does the old way cost every year?</h2>
        <p>
          This model values only recoverable labor. It does not count faster response, fewer pricing errors,
          better close rates, or work completed with the capacity you get back.
        </p>
        <div className="formula" aria-label="Calculation formula">
          People × weekly hours lost × loaded hourly cost × 50 working weeks
        </div>
      </div>

      <div className="model-console">
        <div className="control-grid">
          <label>
            <span><b>People affected</b><output>{people}</output></span>
            <input type="range" min="1" max="20" value={people} onChange={(e) => setPeople(Number(e.target.value))} />
          </label>
          <label>
            <span><b>Hours lost / person / week</b><output>{hours}</output></span>
            <input type="range" min="1" max="20" value={hours} onChange={(e) => setHours(Number(e.target.value))} />
          </label>
          <label>
            <span><b>Loaded hourly cost</b><output>{money.format(rate)}</output></span>
            <input type="range" min="20" max="100" step="2" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
          </label>
          <label>
            <span><b>Realistic time recovered</b><output>{recovery}%</output></span>
            <input type="range" min="20" max="80" step="5" value={recovery} onChange={(e) => setRecovery(Number(e.target.value))} />
          </label>
        </div>

        <div className="result-ledger">
          <div>
            <span>Annual process drag</span>
            <strong>{money.format(result.annualDrag)}</strong>
          </div>
          <div className="result-primary">
            <span>Potential annual capacity recovered</span>
            <strong>{money.format(result.recoverable)}</strong>
          </div>
          <div>
            <span>Monthly break-even ceiling</span>
            <strong>{money.format(result.monthly)}</strong>
          </div>
        </div>
        <p className="model-note">
          Directional estimate, not a guarantee. We validate assumptions against your actual workflow before recommending a build.
        </p>
      </div>
    </section>
  );
}

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

function FreeRedesignOffer() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [token, setToken] = useState("");
  const widgetRef = useRef<HTMLDivElement>(null);
  const turnstileRef = useRef<TurnstileApi>();
  const widgetIdRef = useRef<string>();

  useEffect(() => {
    let cancelled = false;
    const siteKey = document.querySelector<HTMLMetaElement>('meta[name="turnstile-site-key"]')?.content;

    const renderWidget = () => {
      const api = (window as unknown as { turnstile?: TurnstileApi }).turnstile;
      if (!api || !widgetRef.current || !siteKey || cancelled || widgetIdRef.current) return;
      turnstileRef.current = api;
      widgetIdRef.current = api.render(widgetRef.current, {
        sitekey: siteKey,
        action: "free_website_redesign",
        theme: "light",
        callback: (value: string) => setToken(value),
        "expired-callback": () => setToken(""),
      });
    };

    if ((window as unknown as { turnstile?: TurnstileApi }).turnstile) {
      renderWidget();
    } else {
      const existing = document.querySelector<HTMLScriptElement>("script[data-redesign-turnstile]");
      if (existing) {
        existing.addEventListener("load", renderWidget, { once: true });
      } else {
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        script.defer = true;
        script.dataset.redesignTurnstile = "true";
        script.addEventListener("load", renderWidget, { once: true });
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      if (turnstileRef.current && widgetIdRef.current) turnstileRef.current.remove(widgetIdRef.current);
    };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || status === "sending") return;
    const form = event.currentTarget;
    const input = new FormData(form);
    const website = String(input.get("websiteUrl") || "");
    const business = String(input.get("businessName") || "");
    const payload = new FormData();
    payload.set("yourName", String(input.get("yourName") || ""));
    payload.set("emailAddress", String(input.get("emailAddress") || ""));
    payload.set("mainGoal", "Free website redesign");
    payload.set("serviceTier", "Systems That Pay campaign");
    payload.set("businessName", business);
    payload.set("websiteUrl", website);
    payload.set(
      "notes",
      `Free website redesign request\nBusiness: ${business}\nCurrent website: ${website}\nSource: Systems That Pay landing page`,
    );
    payload.set("cf-turnstile-response", token);

    setStatus("sending");
    try {
      await fetch(formAction, { method: "POST", mode: "no-cors", body: payload });
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
      setToken("");
      turnstileRef.current?.reset(widgetIdRef.current);
    }
  };

  return (
    <section className="redesign-offer redesign-hero" id="free-redesign" aria-labelledby="redesign-title">
      <div className="redesign-copy">
        <span className="offer-tag">Limited local offer · $0</span>
        <p className="section-kicker">Free website redesign concept</p>
        <h2 id="redesign-title">We’ll redesign your website. Free.</h2>
        <p className="redesign-lede">
          Send us your current site. We’ll create a custom homepage direction that makes the business clearer,
          more credible, and easier to contact.
        </p>
        <ul>
          <li><Check size={16} /> A redesigned homepage concept</li>
          <li><Check size={16} /> Stronger message, structure, and call to action</li>
          <li><Check size={16} /> Mobile-first recommendations</li>
          <li><Check size={16} /> No obligation and no automatic sales call</li>
        </ul>
        <p className="offer-fineprint">
          This is a custom visual concept and strategic direction—not a complete production website.
        </p>
      </div>

      <div className="redesign-card">
        {status === "sent" ? (
          <div className="redesign-success" role="status">
            <span><CheckCircle2 size={32} /></span>
            <p className="section-kicker">Request received</p>
            <h3>Your site is in the redesign queue.</h3>
            <p>We’ll review it and follow up by email with the next step.</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="redesign-form-head">
              <span>DGC / FREE REDESIGN</span>
              <strong>Claim your concept</strong>
            </div>
            <div className="redesign-field-pair">
              <label><span>Your name</span><input name="yourName" autoComplete="name" placeholder="Jane Smith" required /></label>
              <label><span>Business name</span><input name="businessName" autoComplete="organization" placeholder="Smith HVAC" required /></label>
            </div>
            <label><span>Current website</span><input name="websiteUrl" type="url" placeholder="https://yourbusiness.com" required /></label>
            <label><span>Where should we send it?</span><input name="emailAddress" type="email" autoComplete="email" placeholder="jane@yourbusiness.com" required /></label>
            <div ref={widgetRef} className="redesign-turnstile" aria-label="Security verification" />
            {status === "error" ? <p className="redesign-error">The request did not send. Try again or email help@daytongrowth.co.</p> : null}
            <button type="submit" disabled={!token || status === "sending"}>
              {status === "sending" ? "Sending…" : "Get my free redesign"}
              {status !== "sending" ? <ArrowRight size={17} /> : null}
            </button>
            <p className="redesign-privacy"><ShieldCheck size={13} /> Your information stays private.</p>
          </form>
        )}
      </div>
    </section>
  );
}

function App() {
  return (
    <main>
      <header className="campaign-header">
        <a className="wordmark" href="/" aria-label="Dayton Growth Company home">
          <span>Dayton</span><b>Growth</b><span>Co.</span>
        </a>
        <div className="header-context"><Wrench size={14} /> Built in Dayton for businesses that build things</div>
        <a className="header-link" href="#free-redesign">Free redesign <ArrowRight size={15} /></a>
      </header>

      <FreeRedesignOffer />

      <section className="thesis">
        <span className="section-kicker">The economic argument</span>
        <div className="thesis-grid">
          <h2>Old systems do not look expensive because their invoice is hidden in payroll.</h2>
          <div>
            <p>
              The cost shows up as estimator hours, owner interruptions, duplicate entry, missed context,
              slow follow-up, and skilled employees doing clerical work.
            </p>
            <p>
              A useful system does not need to replace people. It needs to stop buying the same low-value task
              from them every week.
            </p>
          </div>
        </div>
      </section>

      <RoiModel />

      <section className="systems" aria-labelledby="systems-title">
        <div className="section-heading">
          <span className="section-kicker">Where margin leaks</span>
          <h2 id="systems-title">Modernize the work around the work.</h2>
          <p>Not another lead form. The operating layer behind how your company quotes, answers, organizes, markets, and grows.</p>
        </div>
        <div className="system-table">
          <div className="system-head"><span>Area</span><span>Current cost</span><span>Better system</span><span>Business return</span></div>
          {systems.map(({ icon: Icon, label, waste, system, return: roi }) => (
            <article className="system-row" key={label}>
              <h3><Icon size={18} />{label}</h3>
              <p>{waste}</p>
              <p>{system}</p>
              <p className="return-copy">{roi}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="decision">
        <div>
          <span className="section-kicker">How we decide what to build</span>
          <h2>Start with the constraint. Not the trend.</h2>
        </div>
        <ol>
          {principles.map((principle) => <li key={principle}><Check size={16} />{principle}</li>)}
        </ol>
      </section>

      <section className="proof" aria-labelledby="proof-title">
        <div className="proof-copy">
          <span className="section-kicker">See the standard</span>
          <h2 id="proof-title">The work should feel specific to the business.</h2>
          <p>
            We combine operating logic, interface design, automation, and clear customer-facing communication.
            Explore a recent trade-business project or see the broader portfolio on our main site.
          </p>
        </div>
        <div className="proof-links">
          <a href="/watson-roofing.html">
            <span>Trade business project</span>
            <strong>Watson Roofing <ArrowRight size={18} /></strong>
          </a>
          <a href="/#outcomes">
            <span>Capabilities + examples</span>
            <strong>View our work <ArrowRight size={18} /></strong>
          </a>
        </div>
      </section>

      <section className="final">
        <div className="final-mark"><Clock3 size={26} /></div>
        <p className="eyebrow">See the difference before you spend.</p>
        <h2>Let us redesign the homepage. You decide if the old one is still good enough.</h2>
        <p>
          One custom concept. Clearer positioning. A stronger path to contact. No obligation.
        </p>
        <a className="primary-cta light" href="#free-redesign">Get my free redesign <ArrowRight size={17} /></a>
      </section>

      <footer>
        <a className="wordmark footer-wordmark" href="/"><span>Dayton</span><b>Growth</b><span>Co.</span></a>
        <p>Business systems, websites, search, and practical AI for Dayton-area companies.</p>
        <a href="/">Visit daytongrowth.co</a>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("roi-root")!).render(<App />);
