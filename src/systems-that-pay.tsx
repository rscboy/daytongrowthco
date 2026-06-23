import React, { FormEvent, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowRight, Check, CheckCircle2, PenTool, Phone, Send, ShieldCheck, ThumbsUp } from "lucide-react";
import "./systems-that-pay.css";

const formAction =
  "https://script.google.com/macros/s/AKfycbxEUav9QVm2D2tOX3zIJednJl3t23DCeKNV2OW8MErA2BC2njJJpAkeH25sacvceX82rg/exec";

const logoUrl = "https://i.ibb.co/CsT0FbMq/Zoomed-Out-Logo.png";

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/daytongrowthco/" },
  { label: "Instagram", href: "https://www.instagram.com/daytongrowthco/" },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61582225267724" },
];

const steps = [
  {
    icon: Send,
    title: "Send us your site",
    body: "Share your current website and a sentence about what the business does. That is all we need to start.",
  },
  {
    icon: PenTool,
    title: "We design a concept",
    body: "We build a custom homepage direction that makes the business clearer, more credible, and easier to contact.",
  },
  {
    icon: ThumbsUp,
    title: "You decide",
    body: "Review the concept on your own time. No obligation and no automatic sales call. Keep it or take it further with us.",
  },
];

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`lp-wordmark ${className}`.trim()}>
      <span className="wm-dayton">Dayton</span>
      <span className="wm-growth">Growth</span>
      <b>Co.</b>
    </span>
  );
}

function SiteHeader() {
  return (
    <header className="lp-header">
      <div className="lp-header-inner">
        <a className="lp-logo" href="/" aria-label="DaytonGrowthCo home">
          <Wordmark />
        </a>
        <nav className="lp-nav" aria-label="Primary">
          <a href="/what-we-build/">What We Build</a>
          <a href="/examples/">Examples</a>
          <a href="/how-it-works/">How It Works</a>
          <a href="/aboutus.html">About</a>
          <a href="/#cta">Contact</a>
        </nav>
        <div className="lp-header-actions">
          <a className="lp-header-phone" href="tel:+19373677089">
            <Phone size={15} aria-hidden="true" />
            (937) 367-7089
          </a>
          <a className="lp-button" href="#free-redesign">
            Get my free redesign
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="lp-footer">
      <div className="lp-footer-inner">
        <div className="lp-footer-brand">
          <a className="lp-footer-logo" href="/" aria-label="DaytonGrowthCo home">
            <img src={logoUrl} alt="" width={32} height={32} />
            <Wordmark />
          </a>
          <p>DaytonGrowthCo builds practical business tools around the way small teams already work.</p>
          <div className="lp-social" aria-label="Social media">
            {socialLinks.map((link) => (
              <a href={link.href} key={link.label} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <nav className="lp-footer-col" aria-label="Explore">
          <span className="lp-footer-label">Explore</span>
          <a href="/what-we-build/">What We Build</a>
          <a href="/examples/">Examples</a>
          <a href="/how-it-works/">How It Works</a>
          <a href="/aboutus.html">About Us</a>
          <a href="/#cta">Start a Conversation</a>
        </nav>
        <nav className="lp-footer-col" aria-label="Legal and contact">
          <span className="lp-footer-label">Contact</span>
          <a href="mailto:help@daytongrowth.co">help@daytongrowth.co</a>
          <a href="tel:+19373677089">(937) 367-7089</a>
          <a href="/privacy-policy/">Privacy</a>
          <a href="/terms-of-service/">Terms</a>
          <a href="/accessibility/">Accessibility</a>
        </nav>
      </div>
      <div className="lp-footer-bottom">© {year} DaytonGrowthCo. LLC. All rights reserved.</div>
    </footer>
  );
}

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

function normalizeWebsiteUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

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
    const websiteInput = form.elements.namedItem("websiteUrl") as HTMLInputElement | null;
    const website = normalizeWebsiteUrl(String(input.get("websiteUrl") || ""));
    const business = String(input.get("businessName") || "");
    const customerEmail = String(input.get("emailAddress") || "");

    try {
      new URL(website);
      websiteInput?.setCustomValidity("");
    } catch {
      websiteInput?.setCustomValidity("Enter a website such as yourbusiness.com.");
      websiteInput?.reportValidity();
      return;
    }

    const payload = new FormData();
    payload.set("yourName", String(input.get("yourName") || ""));
    payload.set("emailAddress", customerEmail);
    payload.set("email", customerEmail);
    payload.set("customerEmail", customerEmail);
    payload.set("mainGoal", "Free website redesign");
    payload.set("serviceTier", "Free website redesign campaign");
    payload.set("requestType", "free_website_redesign");
    payload.set("sendCustomerConfirmation", "true");
    payload.set("customerConfirmationTemplate", "free_website_redesign_received");
    payload.set("businessName", business);
    payload.set("websiteUrl", website);
    payload.set(
      "notes",
      `Free website redesign request\nBusiness: ${business}\nCurrent website: ${website}\nSource: Free website redesign landing page`,
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
    <section className="lp-hero" id="free-redesign" aria-labelledby="redesign-title">
      <div className="lp-hero-copy">
        <h1 id="redesign-title">We’ll redesign your website. Free.</h1>
        <p className="lp-lede">
          Send us your current site and we’ll create a custom homepage direction that makes the business clearer,
          more credible, and easier to contact. No obligation.
        </p>
        <ul className="lp-checklist">
          <li><Check size={15} /> A redesigned homepage concept</li>
          <li><Check size={15} /> Stronger message, structure, and call to action</li>
          <li><Check size={15} /> Mobile-first recommendations</li>
          <li><Check size={15} /> No obligation and no automatic sales call</li>
        </ul>
        <p className="lp-fineprint">
          This is a custom visual concept and strategic direction, not a complete production website.
        </p>
      </div>

      <div className="lp-card">
        {status === "sent" ? (
          <div className="lp-success" role="status">
            <span><CheckCircle2 size={30} /></span>
            <h2>Your site is in the redesign queue.</h2>
            <p>We’ll review it and follow up by email within 2 business days with the next step.</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="lp-card-head">
              <span>Free redesign</span>
              <strong>Claim your concept</strong>
            </div>
            <div className="lp-field-pair">
              <label><span>Your name</span><input name="yourName" autoComplete="name" placeholder="Jane Smith" required /></label>
              <label><span>Business name</span><input name="businessName" autoComplete="organization" placeholder="Smith HVAC" required /></label>
            </div>
            <label>
              <span>Current website</span>
              <input
                name="websiteUrl"
                type="text"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="yourbusiness.com"
                onInput={(event) => event.currentTarget.setCustomValidity("")}
                onBlur={(event) => {
                  if (event.currentTarget.value.trim()) {
                    event.currentTarget.value = normalizeWebsiteUrl(event.currentTarget.value);
                  }
                }}
                required
              />
              <small>No https:// needed.</small>
            </label>
            <label><span>Where should we send it?</span><input name="emailAddress" type="email" autoComplete="email" placeholder="jane@yourbusiness.com" required /></label>
            <div ref={widgetRef} className="lp-turnstile" aria-label="Security verification" />
            {status === "error" ? <p className="lp-error">The request did not send. Try again or email help@daytongrowth.co.</p> : null}
            <button type="submit" disabled={!token || status === "sending"}>
              {status === "sending" ? "Sending…" : "Get my free redesign"}
              {status !== "sending" ? <ArrowRight size={16} /> : null}
            </button>
            <p className="lp-privacy">
              <ShieldCheck size={13} /> Your information stays private. <a href="/privacy-policy/">Privacy policy</a>
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

function App() {
  return (
    <>
      <SiteHeader />
      <main>
        <FreeRedesignOffer />

        <section className="lp-steps" aria-labelledby="steps-title">
          <div className="lp-section-head">
            <h2 id="steps-title">How the free redesign works.</h2>
            <p>Three short steps. You stay in control the whole way, and there’s nothing to pay.</p>
          </div>
          <ol className="lp-step-grid">
            {steps.map(({ icon: Icon, title, body }, index) => (
              <li className="lp-step" key={title}>
                <span className="lp-step-mark"><Icon size={18} /></span>
                <span className="lp-step-num">Step {index + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="lp-proof" aria-labelledby="proof-title">
          <div className="lp-proof-copy">
            <h2 id="proof-title">The work should feel specific to the business.</h2>
            <p>
              We combine clear messaging, interface design, and customer-facing communication. See a recent
              trade-business project or the broader portfolio on our main site.
            </p>
          </div>
          <div className="lp-proof-links">
            <a href="/watson-roofing.html">
              <span>Trade business project</span>
              <strong>Watson Roofing <ArrowRight size={18} /></strong>
            </a>
            <a href="/examples/">
              <span>Capabilities + examples</span>
              <strong>View our work <ArrowRight size={18} /></strong>
            </a>
          </div>
        </section>

        <section className="lp-final">
          <h2>Let us redesign the homepage. You decide if the old one is still good enough.</h2>
          <p>One custom concept. Clearer positioning. A stronger path to contact. No obligation.</p>
          <a className="lp-button lp-button-light" href="#free-redesign">
            Get my free redesign <ArrowRight size={16} />
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

createRoot(document.getElementById("roi-root")!).render(<App />);
