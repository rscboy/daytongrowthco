import type { Metadata } from "next";
import HomeApp from "../../src/main";

const url = "https://www.daytongrowth.co/ai-phone-agents";

export const metadata: Metadata = {
  title: "AI Phone Agents for Small Businesses | DaytonGrowthCo.",
  description: "AI phone agents for small businesses that answer routine calls 24/7, capture job details, book next steps, and route urgent callers to a person.",
  alternates: { canonical: url },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url,
    title: "AI Phone Agents for Small Businesses | DaytonGrowthCo.",
    description: "24/7 phone answering and booking built around your approved services, call rules, and handoffs.",
    images: ["/thumbnail.jpeg"],
  },
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: "AI Phone Agents for Small Businesses",
        serviceType: "AI phone agent, 24/7 phone answering, call intake, and appointment booking",
        url,
        description: "AI phone agents that answer routine calls, capture inbound requests, book next steps, and route urgent callers to a person.",
        provider: { "@id": "https://www.daytongrowth.co/#organization" },
        audience: { "@type": "BusinessAudience", audienceType: "Small businesses and local service teams that miss calls while working" },
        areaServed: [{ "@type": "City", name: "Dayton", addressRegion: "OH", addressCountry: "US" }, { "@type": "Country", name: "United States" }],
      },
      { "@type": "WebPage", "@id": `${url}#webpage`, url, name: "AI Phone Agents for Small Businesses", isPartOf: { "@id": "https://www.daytongrowth.co/#website" }, mainEntity: { "@id": `${url}#service` }, inLanguage: "en-US", dateModified: "2026-08-18" },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://www.daytongrowth.co/" }, { "@type": "ListItem", position: 2, name: "Products", item: "https://www.daytongrowth.co/products" }, { "@type": "ListItem", position: 3, name: "AI Phone Agents", item: url }] },
    ],
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><HomeApp initialPath="/ai-phone-agents" /></>;
}
