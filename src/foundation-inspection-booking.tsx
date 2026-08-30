"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Check, PhoneCall } from "lucide-react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { BrandWordmark } from "@/src/brand-wordmark";
import { trackFunnelEvent } from "@/src/funnel-analytics";
import "./hvac-funnel.css";
import "./funnel-type-polish.css";
import "./calcom-booking.css";
import "./calcom-shell-override.css";

function FoundationHeader() {
  return <header className="funnel-header">
    <a href="https://www.daytongrowth.co" aria-label="Dayton Growth Co home" className="funnel-brand"><BrandWordmark /></a>
    <a className="funnel-header-call" href="tel:+19373690829"><PhoneCall aria-hidden="true" /> (937) 369-0829</a>
  </header>;
}

function FoundationFooter() {
  return <footer className="funnel-footer">
    <BrandWordmark onDark />
    <p>Practical growth systems for service businesses.</p>
    <nav aria-label="Legal and contact links">
      <Link href="/terms">Terms</Link>
      <Link href="/privacy">Privacy</Link>
      <a href="mailto:help@daytongrowth.co">help@daytongrowth.co</a>
    </nav>
  </footer>;
}

function FoundationCalEmbed() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "foundation-inspection-growth-strategy" });
      cal("ui", { theme: "dark", hideEventTypeDetails: true, layout: "month_view" });
      cal("on", { action: "bookingSuccessfulV2", callback: () => {
        trackFunnelEvent("foundation-inspections", "foundation_appointment_booked");
        window.location.assign("/foundation-inspections/confirmed/");
      } });
    })();
  }, []);

  return <Cal
    namespace="foundation-inspection-growth-strategy"
    calLink="daytongrowthco/foundation-inspection-growth-strategy"
    style={{ width: "100%", height: "100%", overflow: "scroll" }}
    config={{ layout: "month_view", useSlotsViewOnSmallScreen: "true", theme: "dark" }}
  />;
}

export function FoundationBookingPage() {
  useEffect(() => { trackFunnelEvent("foundation-inspections", "foundation_calendar_viewed"); }, []);
  return <main className="funnel-shell booking-shell">
    <FoundationHeader />
    <section className="funnel-intro booking-intro hvac-booking-title">
      <p className="funnel-kicker">Foundation Inspection Growth Strategy</p>
      <h1>Put the inspection-growth strategy call on your calendar.</h1>
      <p>Pick a time that works. We’ll review your current inspection volume, available capacity, territory, and where appointments are being lost.</p>
      <div className="booking-expectations" aria-label="What to expect">
        <span><Check aria-hidden="true" /> 30 minutes</span>
        <span><Check aria-hidden="true" /> Practical numbers</span>
        <span><Check aria-hidden="true" /> No generic pitch</span>
      </div>
    </section>
    <section className="calcom-booking-shell" aria-label="Schedule a foundation inspection growth strategy call"><FoundationCalEmbed /></section>
    <FoundationFooter />
  </main>;
}

export function FoundationConfirmedPage() {
  useEffect(() => { trackFunnelEvent("foundation-inspections", "foundation_confirmation_viewed"); }, []);
  return <main className="funnel-shell">
    <FoundationHeader />
    <section className="funnel-intro confirmed-intro">
      <div className="confirmation-mark"><Check aria-hidden="true" /></div>
      <p className="funnel-kicker">You’re on the calendar</p>
      <h1>Bring the last 30 days of inspection numbers.</h1>
      <p>We’ll use the call to see whether your market, capacity, and economics support a dependable inspection-growth plan.</p>
    </section>
    <section className="prep-grid" aria-label="How to prepare">
      <article><span>01</span><h2>Current capacity</h2><p>Know how many inspections your team completes now and how many open slots you can realistically fill.</p></article>
      <article><span>02</span><h2>Lead sources</h2><p>Bring a rough breakdown of where inquiries come from, what you spend, and which sources produce real appointments.</p></article>
      <article><span>03</span><h2>Sales handoff</h2><p>Be ready to explain who confirms each inspection, who runs it, and what happens after the visit.</p></article>
    </section>
    <section className="simple-contact"><p>Need to reschedule?</p><a href="mailto:help@daytongrowth.co">Email help@daytongrowth.co</a><span>or</span><a href="tel:+19373690829">call (937) 369-0829</a></section>
    <FoundationFooter />
  </main>;
}
