import type { Metadata } from "next";
import HomeApp from "../../src/main";

const url = "https://www.daytongrowth.co/local-search/";

export const metadata: Metadata = {
  title: "Get Found on Google and AI Search | DaytonGrowthCo.",
  description: "Clear service information, local proof, and practical Google and AI search improvements for local service businesses.",
  alternates: { canonical: url },
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Get Found on Google and AI Search",
    url,
    description: "Practical Google and AI search improvements that help local customers understand a business and take the next step.",
    provider: { "@id": "https://www.daytongrowth.co/#organization" },
    areaServed: [{ "@type": "City", name: "Dayton", addressRegion: "OH", addressCountry: "US" }, { "@type": "Country", name: "United States" }],
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><HomeApp initialPath="/local-search" /></>;
}
