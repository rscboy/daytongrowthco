import type { Metadata } from "next";
import HomeApp from "../../src/main";

const url = "https://www.daytongrowth.co/website-design/";

export const metadata: Metadata = {
  title: "Website Redesign Services in Dayton, OH | DaytonGrowthCo.",
  description:
    "Dayton website designer and redesign services for businesses that need a clearer offer, faster site, and an easier path for customers to call, request a quote, or book.",
  alternates: { canonical: url },
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Website Redesign Services",
    url,
    serviceType: "Website redesign",
    description:
      "Website redesign services for Dayton businesses that need a clearer offer, a faster site, and better paths from search to inquiry.",
    provider: { "@id": "https://www.daytongrowth.co/#organization" },
    areaServed: [{ "@type": "City", name: "Dayton", addressRegion: "OH", addressCountry: "US" }, { "@type": "Country", name: "United States" }],
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><HomeApp initialPath="/website-design" /></>;
}
