import type { Metadata } from "next";
import HomeApp from "../../src/main";

const url = "https://www.daytongrowth.co/quote-tools";

export const metadata: Metadata = {
  title: "Custom Quote & Estimate Tools | DaytonGrowthCo.",
  description: "Custom quote builders and estimate tools for small businesses that apply your real pricing rules and produce consistent, send-ready proposals faster.",
  alternates: { canonical: url },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url,
    title: "Custom Quote & Estimate Tools | DaytonGrowthCo.",
    description: "Turn your pricing rules and scope options into a consistent, send-ready quote.",
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
        name: "Custom Quote and Estimate Tools",
        serviceType: "Custom quote builder, estimate calculator, and proposal workflow development",
        url,
        description: "Custom quote tools and estimate builders that turn a business's pricing rules and scope options into send-ready proposals.",
        provider: { "@id": "https://www.daytongrowth.co/#organization" },
        audience: { "@type": "BusinessAudience", audienceType: "Small businesses that repeatedly build estimates or proposals by hand" },
        areaServed: [{ "@type": "City", name: "Dayton", addressRegion: "OH", addressCountry: "US" }, { "@type": "Country", name: "United States" }],
      },
      { "@type": "WebPage", "@id": `${url}#webpage`, url, name: "Custom Quote and Estimate Tools", isPartOf: { "@id": "https://www.daytongrowth.co/#website" }, mainEntity: { "@id": `${url}#service` }, inLanguage: "en-US", dateModified: "2026-08-18" },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://www.daytongrowth.co/" }, { "@type": "ListItem", position: 2, name: "Products", item: "https://www.daytongrowth.co/products" }, { "@type": "ListItem", position: 3, name: "Custom Quote and Estimate Tools", item: url }] },
    ],
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><HomeApp initialPath="/quote-tools" /></>;
}
