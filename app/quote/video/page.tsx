import type { Metadata } from "next";
import { BetterQuoteVideoPage } from "@/src/better-quote-funnel";

const url = "https://www.daytongrowth.co/quote/video/";

export const metadata: Metadata = {
  title: "The Better Quote Program™ | Quote Review",
  description: "See how The Better Quote Program works, then send your quote for a human-led review.",
  alternates: { canonical: url },
  robots: { index: false, follow: false },
};

export default function BetterQuoteVideoVariantPage() { return <BetterQuoteVideoPage />; }
