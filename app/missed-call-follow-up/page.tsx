import type { Metadata } from "next";
import HomeApp from "../../src/main";

const url = "https://www.daytongrowth.co/missed-call-follow-up/";

export const metadata: Metadata = {
  title: "Automated Follow-Up and Scheduling for Trades | DaytonGrowthCo.",
  description: "Automated follow-up and scheduling tools for mechanics, contractors, and trade businesses, covering missed calls, web leads, estimates, and booking requests.",
  alternates: { canonical: url },
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Automated Follow-Up and Scheduling for Trades",
    url,
    description: "Automated follow-up and scheduling systems for mechanics, contractors, and other trade businesses handling missed calls, web leads, sent estimates, and booking requests.",
    provider: { "@id": "https://www.daytongrowth.co/#organization" },
    areaServed: [{ "@type": "City", name: "Dayton", addressRegion: "OH", addressCountry: "US" }, { "@type": "Country", name: "United States" }],
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><HomeApp initialPath="/missed-call-follow-up" /></>;
}
