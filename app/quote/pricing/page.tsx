import type { Metadata } from "next";
import HomeApp from "@/src/main";

export const metadata: Metadata = {
  title: "Pricing | DaytonGrowthCo.",
  description: "Clear public pricing for DaytonGrowthCo's Website Migration Program™, Automated Google Review Texting, and Better Quote Program™ success-fee schedule.",
  alternates: { canonical: "https://www.daytongrowth.co/quote/pricing" },
  openGraph: { title: "Pricing | DaytonGrowthCo.", description: "Clear public pricing for DaytonGrowthCo's defined service offers.", url: "https://www.daytongrowth.co/quote/pricing", images: ["/thumbnail.jpeg"] },
};

export default function QuotePricingPage() { return <HomeApp initialPath="/quote/pricing" />; }
