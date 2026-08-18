import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Footer, Header } from "@/src/better-quote-funnel";

export const metadata: Metadata = { title: "Payment Received | The Better Quote Program™", robots: { index: false, follow: false } };

export default function Page() {
  return <main className="quote-shell"><Header /><section className="quote-result"><div className="quote-result-icon is-qualified"><Check size={28} aria-hidden="true" /></div><p className="quote-eyebrow">Payment submitted</p><h1>Stripe is confirming your payment.</h1><p>Your complete Better Quote result is released only after Stripe confirms the payment to DaytonGrowthCo. Watch your email for the private PDF link.</p><div className="quote-next-card"><h2>What happens next</h2><p>01 · Stripe confirms the payment.</p><p>02 · The current paid result is unlocked.</p><p>03 · Your private PDF link is emailed to you.</p><strong>If the email does not arrive, reply to your payment message or contact quotes@daytongrowth.co.</strong></div></section><Footer /></main>;
}
