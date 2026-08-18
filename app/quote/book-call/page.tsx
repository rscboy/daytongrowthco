import type { Metadata } from "next";
import { BetterQuoteBookingPage } from "@/src/better-quote-funnel";
export const metadata: Metadata = { title: "Talk to a Real Person | The Better Quote Program™", robots: { index: false, follow: false } };
export default function QuoteBookingPage() { return <BetterQuoteBookingPage />; }
