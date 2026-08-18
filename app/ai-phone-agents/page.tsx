import type { Metadata } from "next";
import HomeApp from "../../src/main";

const url = "https://www.daytongrowth.co/ai-phone-agents/";

export const metadata: Metadata = {
  title: "24/7 Phone Answering & Booking | DaytonGrowthCo.",
  description: "24/7 phone answering and booking that captures job details, handles routine questions, and routes each caller to a useful next step.",
  alternates: { canonical: url },
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "24/7 Phone Answering & Booking",
    url,
    description: "24/7 phone answering and booking that captures inbound requests, handles routine questions, and routes callers for small businesses.",
    provider: { "@id": "https://www.daytongrowth.co/#organization" },
    areaServed: [{ "@type": "City", name: "Dayton", addressRegion: "OH", addressCountry: "US" }, { "@type": "Country", name: "United States" }],
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><HomeApp initialPath="/ai-phone-agents" /></>;
}
