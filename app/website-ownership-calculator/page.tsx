import type { Metadata } from "next";
import HomeApp from "../../src/main";

const url = "https://www.daytongrowth.co/website-ownership-calculator/";

export const metadata: Metadata = {
  title: "Website Ownership ROI Calculator | DaytonGrowthCo.",
  description: "Compare the cost of continuing to rent your website with moving to a self-owned static site.",
  alternates: { canonical: url },
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Website Ownership ROI Calculator",
    url,
    description: "An editable calculator that compares platform subscription costs with owning a static website.",
    isPartOf: { "@id": "https://www.daytongrowth.co/#website" },
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><HomeApp initialPath="/website-ownership-calculator" /></>;
}
