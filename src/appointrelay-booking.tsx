"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, PhoneCall } from "lucide-react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { BrandWordmark } from "@/src/brand-wordmark";
import { trackFunnelEvent } from "@/src/funnel-analytics";
import styles from "./appointrelay-booking.module.css";

function Header() {
  return <header className={styles.header}><Link href="/appointrelay/" aria-label="AppointRelay home"><BrandWordmark /></Link><span>AppointRelay<sup>™</sup></span><a href="tel:+19373690829"><PhoneCall aria-hidden="true" /> <b>(937) 369-0829</b></a></header>;
}

function Footer() {
  return <footer className={styles.footer}><BrandWordmark onDark /><p>Human-controlled appointment automation for operational teams.</p><nav><Link href="/appointrelay/terms/">Terms</Link><Link href="/appointrelay/privacy/">Privacy</Link><a href="mailto:help@daytongrowth.co">Contact</a></nav></footer>;
}

function Calendar() {
  const router = useRouter();
  const [calendarReady, setCalendarReady] = useState(false);
  const [slow, setSlow] = useState(false);
  const calLink = process.env.NEXT_PUBLIC_APPOINTRELAY_CAL_LINK || "daytongrowthco/appointrelay-workflow-fit";
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    const timer = window.setTimeout(() => setSlow(true), 8000);
    (async function () {
      const cal = await getCalApi({ namespace: "appointrelay-workflow-fit" });
      if (!active) return;
      const onReady = () => { if (active) { setCalendarReady(true); window.clearTimeout(timer); } };
      cal("on", { action: "linkReady", callback: onReady });
      cal("ui", { theme: "dark", hideEventTypeDetails: true, layout: "month_view" });
      const onBooked = (event: CustomEvent<{ data: { status?: string; paymentRequired: boolean } }>) => {
        if (!active || event.detail.data.status?.toUpperCase() !== "ACCEPTED" || event.detail.data.paymentRequired) return;
        trackFunnelEvent("appointrelay", "appointrelay_appointment_booked");
        router.push("/appointrelay/confirmed/");
      };
      cal("on", { action: "bookingSuccessfulV2", callback: onBooked });
      unsubscribe = () => { cal("off", { action: "linkReady", callback: onReady }); cal("off", { action: "bookingSuccessfulV2", callback: onBooked }); };
    })().catch(() => { if (active) setSlow(true); });
    return () => { active = false; window.clearTimeout(timer); unsubscribe?.(); };
  }, [router]);
  return <div className={styles.embeddedCalendar}>{!calendarReady && <div className={styles.calendarLoading} role="status"><span>{slow ? "The calendar is taking longer to load." : "Finding the available dates…"}</span><p>{slow ? "You can use the full calendar link above, or contact us for help." : "Choose your timezone, then a day and time that work for you."}</p></div>}<Cal namespace="appointrelay-workflow-fit" calLink={calLink} style={{ width: "100%", height: "100%", overflow: "scroll" }} config={{ layout: "month_view", useSlotsViewOnSmallScreen: "true", theme: "dark" }} /></div>;
}

export function AppointRelayBookingPage() {
  useEffect(() => { trackFunnelEvent("appointrelay", "appointrelay_calendar_viewed"); }, []);
  return <main className={styles.shell}><Header /><section className={styles.intro}><p>WORKFLOW FIT CALL</p><h1>Put the appointment workflow review on your calendar.</h1><span>We’ll map the queue, economics, current system, exception rules, and the smallest implementation that can produce a clean dispatcher handoff.</span><div><em><Check aria-hidden="true" /> 30 minutes</em><em><Check aria-hidden="true" /> Operational numbers</em><em><Check aria-hidden="true" /> No generic AI demo</em></div></section><p className={styles.calendarHelp}><a href={`https://cal.com/${process.env.NEXT_PUBLIC_APPOINTRELAY_CAL_LINK || "daytongrowthco/appointrelay-workflow-fit"}`} target="_blank" rel="noreferrer">Open the calendar in a new tab ↗</a><a href="mailto:help@daytongrowth.co">Need help finding a time?</a></p><section className={styles.calendar} aria-label="Schedule an AppointRelay workflow fit call"><Calendar /></section><Footer /></main>;
}

export function AppointRelayConfirmedPage() {
  useEffect(() => { trackFunnelEvent("appointrelay", "appointrelay_confirmation_viewed"); }, []);
  return <main className={styles.shell}><Header /><section className={styles.confirmed}><i><Check aria-hidden="true" /></i><p>YOU’RE ON THE CALENDAR</p><h1>Bring one real appointment queue.</h1><span>We’ll use it to determine whether the volume, value, rules, and handoff justify an AppointRelay™ implementation.</span></section><section className={styles.prep}><article><b>01</b><h2>Queue volume</h2><p>Know roughly how many unscheduled records, inbound calls, or delivery appointments appear each month.</p></article><article><b>02</b><h2>Current workflow</h2><p>Bring the system name, export format, and the steps a dispatcher follows from first contact to final booking.</p></article><article><b>03</b><h2>Appointment value</h2><p>Estimate the labor saved or contribution from a completed appointment so we can test payback honestly.</p></article></section><p className={styles.reschedule}>Need to reschedule? <a href="mailto:help@daytongrowth.co">Email help@daytongrowth.co</a> or <a href="tel:+19373690829">call (937) 369-0829</a>.</p><Footer /></main>;
}
