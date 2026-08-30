"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
  const calLink = process.env.NEXT_PUBLIC_APPOINTRELAY_CAL_LINK || "daytongrowthco/appointrelay-workflow-fit";
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "appointrelay-workflow-fit" });
      cal("ui", { theme: "dark", hideEventTypeDetails: true, layout: "month_view" });
      cal("on", { action: "bookingSuccessfulV2", callback: () => {
        trackFunnelEvent("appointrelay", "appointrelay_appointment_booked");
        router.push("/appointrelay/confirmed/");
      } });
    })();
  }, [router]);
  return <Cal namespace="appointrelay-workflow-fit" calLink={calLink} style={{ width: "100%", height: "100%", overflow: "scroll" }} config={{ layout: "month_view", useSlotsViewOnSmallScreen: "true", theme: "dark" }} />;
}

export function AppointRelayBookingPage() {
  useEffect(() => { trackFunnelEvent("appointrelay", "appointrelay_calendar_viewed"); }, []);
  return <main className={styles.shell}><Header /><section className={styles.intro}><p>WORKFLOW FIT CALL</p><h1>Put the appointment workflow review on your calendar.</h1><span>We’ll map the queue, economics, current system, exception rules, and the smallest implementation that can produce a clean dispatcher handoff.</span><div><em><Check aria-hidden="true" /> 30 minutes</em><em><Check aria-hidden="true" /> Operational numbers</em><em><Check aria-hidden="true" /> No generic AI demo</em></div></section><section className={styles.calendar} aria-label="Schedule an AppointRelay workflow fit call"><Calendar /></section><Footer /></main>;
}

export function AppointRelayConfirmedPage() {
  useEffect(() => { trackFunnelEvent("appointrelay", "appointrelay_confirmation_viewed"); }, []);
  return <main className={styles.shell}><Header /><section className={styles.confirmed}><i><Check aria-hidden="true" /></i><p>YOU’RE ON THE CALENDAR</p><h1>Bring one real appointment queue.</h1><span>We’ll use it to determine whether the volume, value, rules, and handoff justify an AppointRelay™ implementation.</span></section><section className={styles.prep}><article><b>01</b><h2>Queue volume</h2><p>Know roughly how many unscheduled records, inbound calls, or delivery appointments appear each month.</p></article><article><b>02</b><h2>Current workflow</h2><p>Bring the system name, export format, and the steps a dispatcher follows from first contact to final booking.</p></article><article><b>03</b><h2>Appointment value</h2><p>Estimate the labor saved or contribution from a completed appointment so we can test payback honestly.</p></article></section><p className={styles.reschedule}>Need to reschedule? <a href="mailto:help@daytongrowth.co">Email help@daytongrowth.co</a> or <a href="tel:+19373690829">call (937) 369-0829</a>.</p><Footer /></main>;
}
