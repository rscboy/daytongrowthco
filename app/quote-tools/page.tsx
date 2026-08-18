import type { Metadata } from "next";
import HomeApp from "../../src/main";

const url = "https://www.daytongrowth.co/quote-tools/";

export const metadata: Metadata = {
  title: "Estimate & Proposal Tools | DaytonGrowthCo.",
  description: "Estimate and proposal tools for small businesses that apply your pricing rules and produce clear, consistent estimates faster.",
  alternates: { canonical: url },
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Estimate & Proposal Tools",
    url,
    description: "Custom quote tools and estimate builders that turn a business's pricing rules and scope options into send-ready estimates.",
    provider: { "@id": "https://www.daytongrowth.co/#organization" },
    areaServed: [{ "@type": "City", name: "Dayton", addressRegion: "OH", addressCountry: "US" }, { "@type": "Country", name: "United States" }],
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><HomeApp initialPath="/quote-tools" /></>;
}
