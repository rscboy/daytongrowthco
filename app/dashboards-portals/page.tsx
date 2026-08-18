import type { Metadata } from "next";
import HomeApp from "../../src/main";

const url = "https://www.daytongrowth.co/dashboards-portals/";

export const metadata: Metadata = {
  title: "Business Dashboards and Customer Portals | DaytonGrowthCo.",
  description: "Focused business dashboards and customer portals that replace scattered updates, spreadsheets, and repeated handoffs.",
  alternates: { canonical: url },
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Business Dashboards and Customer Portals",
    url,
    description: "Focused business dashboards and customer portals for keeping requests, work, information, and next steps in one place.",
    provider: { "@id": "https://www.daytongrowth.co/#organization" },
    areaServed: [{ "@type": "City", name: "Dayton", addressRegion: "OH", addressCountry: "US" }, { "@type": "Country", name: "United States" }],
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><HomeApp initialPath="/dashboards-portals" /></>;
}
