import type { Metadata } from "next";
import { BetterQuoteConfirmedPage } from "@/src/better-quote-funnel";
export const metadata: Metadata = { title: "Conversation Confirmed | The Better Quote Program™", robots: { index: false, follow: false } };
export default function QuoteConfirmedPage() { return <BetterQuoteConfirmedPage />; }
