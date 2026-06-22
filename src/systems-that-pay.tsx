import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Bot,
  Calculator,
  Check,
  ChevronRight,
  Clock3,
  FileSpreadsheet,
  Globe2,
  PhoneCall,
  Search,
  TrendingDown,
  Wrench,
} from "lucide-react";
import "./systems-that-pay.css";

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

function App() {
  return (
    <main>
      <header className="campaign-header">
        <a className="wordmark" href="/" aria-label="Dayton Growth Company home">
          <span>Dayton</span><b>Growth</b><span>Co.</span>
        </a>
        <div className="header-context"><Wrench size={14} /> Built in Dayton for businesses that build things</div>
        <a className="header-link" href="/#cta">Start building <ArrowRight size={15} /></a>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">An operating case for modern systems</p>
          <h1>Your best people are too expensive for <em>copy, paste, repeat.</em></h1>
          <p className="hero-lede">
            We help Dayton-area trades replace slow quoting, scattered job information, constant call
            interruptions, and disconnected marketing with systems that recover time and protect margin.
          </p>
          <div className="hero-actions">
            <a className="primary-cta" href="/#cta">Start building <ArrowRight size={17} /></a>
            <a className="text-link" href="#model">Calculate the drag <ChevronRight size={16} /></a>
          </div>
          <p className="quiet-proof">Local strategy. Technical execution. No software theater.</p>
        </div>

        <div className="cost-sheet" aria-label="Example cost of a manual quoting process">
          <div className="sheet-top">
            <span>PROCESS COST SHEET</span>
            <span>DGC / 001</span>
          </div>
          <div className="sheet-title">
            <span>Example: manual quoting</span>
            <small>Conservative operating estimate</small>
          </div>
          <div className="sheet-row"><span>3 people</span><span>affected</span></div>
          <div className="sheet-row"><span>5 hrs / week</span><span>rework + entry</span></div>
          <div className="sheet-row"><span>$38 / hour</span><span>loaded labor</span></div>
          <div className="sheet-rule" />
          <div className="sheet-total">
            <span>Annual drag</span>
            <strong>$28,500</strong>
          </div>
          <div className="sheet-recovery">
            <TrendingDown size={17} />
            <span>Recover half the time:</span>
            <b>$14,250 / year</b>
          </div>
          <p>Before counting faster quotes, fewer errors, or additional jobs handled.</p>
        </div>
      </section>

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
        <p className="eyebrow">The question is not whether the old way still works.</p>
        <h2>It is whether you should keep paying for it.</h2>
        <p>
          Show us the task your team repeats, the handoff that breaks, or the system everyone works around.
          We will help you price the drag and identify the smallest useful fix.
        </p>
        <a className="primary-cta light" href="/#cta">Start building <ArrowRight size={17} /></a>
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
