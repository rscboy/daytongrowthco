import type { Metadata } from "next";
import { BetterQuoteNotFitPage } from "@/src/better-quote-funnel";
export const metadata: Metadata = { title: "Quote Review | The Better Quote Program™", robots: { index: false, follow: false } };
export default function QuoteNotFitPage() { return <BetterQuoteNotFitPage />; }
