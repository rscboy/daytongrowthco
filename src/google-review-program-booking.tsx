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
  return <header className={styles.header}><Link href="/google-reviews/" aria-label="Google Review Program home"><BrandWordmark /></Link><span>HVAC Google Review Growth Program™</span><a href="tel:+19373690829"><PhoneCall aria-hidden="true" /> <b>(937) 369-0829</b></a></header>;
}

function Footer() {
  return <footer className={styles.footer}><BrandWordmark onDark /><p>The fully managed Google review growth program for residential HVAC companies.</p><nav><Link href="/google-reviews/terms/">Terms</Link><Link href="/google-reviews/privacy/">Privacy</Link><a href="mailto:help@daytongrowth.co">Contact</a></nav></footer>;
}

function Calendar() {
  const router = useRouter();
  const calLink = process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_CAL_LINK || "daytongrowthco/google-review-program-fit";
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "google-review-program-fit" });
      cal("ui", { theme: "dark", hideEventTypeDetails: true, layout: "month_view" });
      cal("on", { action: "bookingSuccessfulV2", callback: () => {
        trackFunnelEvent("google-review-program", "google_review_appointment_booked");
        router.push("/google-reviews/confirmed/");
      } });
    })();
  }, [router]);
  return <Cal namespace="google-review-program-fit" calLink={calLink} style={{ width: "100%", height: "100%", overflow: "scroll" }} config={{ layout: "month_view", useSlotsViewOnSmallScreen: "true", theme: "dark" }} />;
}

export function GoogleReviewProgramBookingPage() {
  useEffect(() => { trackFunnelEvent("google-review-program", "google_review_calendar_viewed"); }, []);
  return <main className={styles.simpleBooking}><h1>Schedule your demo</h1><section className={styles.simpleCalendar} aria-label="Schedule an HVAC Google Review Growth Program demo"><Calendar /></section></main>;
}

export function GoogleReviewProgramConfirmedPage() {
  useEffect(() => { trackFunnelEvent("google-review-program", "google_review_confirmation_viewed"); }, []);
  return <main className={styles.shell}><Header /><section className={styles.confirmed}><i><Check aria-hidden="true" /></i><p>YOU’RE ON THE CALENDAR</p><h1>Bring one real HVAC service-call workflow.</h1><span>We’ll use it to determine whether your volume, source system, current automation, Google profile, consent records, and internal ownership are ready for The HVAC Google Review Growth Program™.</span></section><section className={styles.prep}><article><b>01</b><h2>Service volume</h2><p>Know roughly how many paid residential service calls your team closes in a typical month.</p></article><article><b>02</b><h2>Current system</h2><p>Bring your dispatch, CRM, or scheduler name, how it records a successful completion, and whether its review feature is active.</p></article><article><b>03</b><h2>Access and permission</h2><p>Know who can approve the integration, DNS records, message language, Google link, and customer messaging basis.</p></article></section><p className={styles.reschedule}>Need to reschedule? <a href="mailto:help@daytongrowth.co">Email help@daytongrowth.co</a> or <a href="tel:+19373690829">call (937) 369-0829</a>.</p><Footer /></main>;
}
