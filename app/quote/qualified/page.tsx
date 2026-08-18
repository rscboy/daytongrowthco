import type { Metadata } from "next";
import { BetterQuoteQualifiedPage } from "@/src/better-quote-funnel";
export const metadata: Metadata = { title: "Your Quote Looks Like a Fit | The Better Quote Program™", robots: { index: false, follow: false } };
export default function QuoteQualifiedPage() { return <BetterQuoteQualifiedPage />; }
