import React, { FormEvent, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Gauge,
  Globe2,
  LoaderCircle,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import "./systems-that-pay.css";

const formAction =
  "https://script.google.com/macros/s/AKfycbxEUav9QVm2D2tOX3zIJednJl3t23DCeKNV2OW8MErA2BC2njJJpAkeH25sacvceX82rg/exec";

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

function AuditForm() {
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
        action: "free_website_audit",
        theme: "light",
        callback: (value: string) => setToken(value),
        "expired-callback": () => setToken(""),
      });
    };

    if ((window as unknown as { turnstile?: TurnstileApi }).turnstile) {
      renderWidget();
    } else {
      const existing = document.querySelector<HTMLScriptElement>("script[data-audit-turnstile]");
      if (existing) {
        existing.addEventListener("load", renderWidget, { once: true });
      } else {
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        script.defer = true;
        script.dataset.auditTurnstile = "true";
        script.addEventListener("load", renderWidget, { once: true });
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      if (turnstileRef.current && widgetIdRef.current) {
        turnstileRef.current.remove(widgetIdRef.current);
      }
    };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || status === "sending") return;

    const form = event.currentTarget;
    const input = new FormData(form);
    const businessName = String(input.get("businessName") || "");
    const websiteUrl = String(input.get("websiteUrl") || "");
    const concern = String(input.get("auditConcern") || "");

    const payload = new FormData();
    payload.set("yourName", String(input.get("yourName") || ""));
    payload.set("emailAddress", String(input.get("emailAddress") || ""));
    payload.set("mainGoal", "Free website audit");
    payload.set("serviceTier", "Campaign lead magnet");
    payload.set(
      "notes",
      `Business: ${businessName}\nWebsite: ${websiteUrl}\nMain concern: ${concern || "Not provided"}\nSource: Systems That Pay landing page`,
    );
    payload.set("businessName", businessName);
    payload.set("websiteUrl", websiteUrl);
    payload.set("cf-turnstile-response", token);

    setStatus("sending");
    try {
      await fetch(formAction, { method: "POST", mode: "no-cors", body: payload });
      form.reset();
      setStatus("sent");
      setToken("");
    } catch {
      setStatus("error");
      turnstileRef.current?.reset(widgetIdRef.current);
      setToken("");
    }
  };

  if (status === "sent") {
    return (
      <div className="audit-success" role="status">
        <span><CheckCircle2 size={30} /></span>
        <p className="form-kicker">Request received</p>
        <h2>Your audit is in the queue.</h2>
        <p>We’ll review the site and send the findings to your email. No sales call is required.</p>
        <a href="/">Explore DaytonGrowthCo. <ArrowRight size={15} /></a>
      </div>
    );
  }

  return (
    <form className="audit-form" onSubmit={submit}>
      <div className="form-head">
        <p className="form-kicker">Free website audit</p>
        <h2>Find out where your site is costing you.</h2>
        <p>Four quick details. We’ll do the technical review.</p>
      </div>

      <div className="field-pair">
        <label>
          <span>Your name</span>
          <input name="yourName" autoComplete="name" placeholder="Jane Smith" required />
        </label>
        <label>
          <span>Business name</span>
          <input name="businessName" autoComplete="organization" placeholder="Smith HVAC" required />
        </label>
      </div>
      <label>
        <span>Website URL</span>
        <input name="websiteUrl" type="url" inputMode="url" placeholder="https://yourbusiness.com" required />
      </label>
      <label>
        <span>Email for the audit</span>
        <input name="emailAddress" type="email" autoComplete="email" placeholder="jane@yourbusiness.com" required />
      </label>
      <label>
        <span>What concerns you most? <small>Optional</small></span>
        <select name="auditConcern" defaultValue="">
          <option value="">Choose one</option>
          <option>Not enough calls or quote requests</option>
          <option>The site looks outdated</option>
          <option>We are hard to find on Google</option>
          <option>The site is slow or confusing</option>
          <option>I am not sure what is wrong</option>
        </select>
      </label>

      <div ref={widgetRef} className="turnstile-slot" aria-label="Security verification" />
      {status === "error" ? (
        <p className="form-error">The request did not send. Try again or email help@daytongrowth.co.</p>
      ) : null}
      <button type="submit" disabled={!token || status === "sending"}>
        {status === "sending" ? <LoaderCircle className="spin" size={17} /> : null}
        {status === "sending" ? "Requesting audit…" : "Get my free audit"}
        {status !== "sending" ? <ArrowRight size={17} /> : null}
      </button>
      <p className="privacy-note"><ShieldCheck size={13} /> No spam. No automatic sales call. Your audit arrives by email.</p>
    </form>
  );
}

const auditItems = [
  {
    icon: Gauge,
    title: "Speed + mobile",
    copy: "Where slow loading, layout shifts, or weak mobile behavior create friction before a customer calls.",
  },
  {
    icon: Search,
    title: "Search visibility",
    copy: "What keeps Google from understanding your services, locations, authority, and most valuable pages.",
  },
  {
    icon: Sparkles,
    title: "AI answer readiness",
    copy: "Whether ChatGPT, Google AI, and other answer engines can interpret and confidently reference the business.",
  },
  {
    icon: Globe2,
    title: "Conversion clarity",
    copy: "Where unclear services, weak proof, hidden calls to action, or trust gaps suppress quote requests.",
  },
];

function SampleAudit() {
  return (
    <div className="sample-audit" aria-label="Example website audit report">
      <div className="report-top"><span>Website audit</span><span>DGC / FREE</span></div>
      <div className="report-title">
        <span>Sample finding report</span>
        <h3>Local trade company</h3>
        <p>Technical + conversion review</p>
      </div>
      <div className="score-row">
        <div><span>Performance</span><strong>54</strong><i className="is-warning" /></div>
        <div><span>Search structure</span><strong>61</strong><i className="is-warning" /></div>
        <div><span>Conversion clarity</span><strong>48</strong><i className="is-risk" /></div>
      </div>
      <div className="finding-list">
        <p><span>01</span><strong>Primary services are unclear above the fold.</strong><em>High impact</em></p>
        <p><span>02</span><strong>Mobile quote path requires too many decisions.</strong><em>High impact</em></p>
        <p><span>03</span><strong>Location and expertise signals are incomplete.</strong><em>Medium</em></p>
      </div>
      <div className="report-priority">
        <TrendingDown size={18} />
        <span>First priority</span>
        <strong>Clarify service + quote path</strong>
      </div>
    </div>
  );
}

function App() {
  return (
    <main>
      <header className="campaign-header">
        <a className="wordmark" href="/" aria-label="Dayton Growth Company home">
          <span>Dayton</span><b>Growth</b><span>Co.</span>
        </a>
        <p><MapPin size={13} /> Dayton, Ohio</p>
        <a href="/">Visit our main site</a>
      </header>

      <section className="lead-hero" id="audit">
        <div className="lead-copy">
          <p className="eyebrow">For Dayton-area trades and service businesses</p>
          <h1>Your website may be quietly costing you work.</h1>
          <p className="lead-intro">
            Get a free, human-reviewed website audit that shows where your site is losing speed, search visibility,
            trust, and quote requests—and what to fix first.
          </p>
          <ul className="offer-list">
            <li><Check size={16} /> Technical and mobile review</li>
            <li><Check size={16} /> Google + AI visibility check</li>
            <li><Check size={16} /> Conversion and trust assessment</li>
            <li><Check size={16} /> Prioritized recommendations in plain English</li>
          </ul>
          <div className="offer-meta">
            <span><strong>$0</strong> cost</span>
            <span><strong>Human</strong> reviewed</span>
            <span><strong>No</strong> sales call required</span>
          </div>
        </div>
        <AuditForm />
      </section>

      <section className="deliverable">
        <div className="deliverable-copy">
          <p className="section-kicker">What you receive</p>
          <h2>Not a generic score. A short list of what matters.</h2>
          <p>
            Automated reports produce dozens of warnings. We interpret the site like a customer, a search engine,
            and an operator—then separate meaningful problems from technical noise.
          </p>
          <div className="delivery-note">
            <CheckCircle2 size={18} />
            <span><strong>Delivered by email.</strong> Clear findings, screenshots where useful, and the first fixes we would make.</span>
          </div>
        </div>
        <SampleAudit />
      </section>

      <section className="audit-scope" aria-labelledby="scope-title">
        <div className="scope-heading">
          <p className="section-kicker">The review</p>
          <h2 id="scope-title">Four places an old website leaks value.</h2>
        </div>
        <div className="scope-grid">
          {auditItems.map(({ icon: Icon, title, copy }) => (
            <article key={title}>
              <Icon size={19} />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="roi-reminder">
        <div>
          <p className="section-kicker">The economic case</p>
          <h2>Paid traffic is expensive. Sending it to a weak website is more expensive.</h2>
        </div>
        <div>
          <p>
            An outdated site can make good advertising, referrals, and local reputation work harder than necessary.
            The audit identifies the highest-friction points before you spend more on traffic or rebuild blindly.
          </p>
          <a href="#audit">Get the free website audit <ArrowRight size={16} /></a>
        </div>
      </section>

      <section className="final-cta">
        <p className="eyebrow">Free website audit</p>
        <h2>See what your website is asking customers to work around.</h2>
        <a href="#audit">Request my audit <ArrowRight size={17} /></a>
      </section>

      <footer>
        <a className="wordmark footer-wordmark" href="/"><span>Dayton</span><b>Growth</b><span>Co.</span></a>
        <p>Websites, search, and business systems for Dayton-area companies.</p>
        <a href="/">daytongrowth.co</a>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("roi-root")!).render(<App />);
