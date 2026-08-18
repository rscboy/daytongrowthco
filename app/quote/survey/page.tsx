import type { Metadata } from "next";
import { BetterQuoteSurveyPage } from "@/src/better-quote-funnel";
export const metadata: Metadata = { title: "Check Your Quote | The Better Quote Program™", robots: { index: false, follow: false } };
export default function QuoteSurveyPage() { return <BetterQuoteSurveyPage />; }
