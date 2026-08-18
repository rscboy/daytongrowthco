import type { Metadata } from "next";
import HomeApp from "../../src/main";

const url = "https://www.daytongrowth.co/local-search";

export const metadata: Metadata = {
  title: "Local SEO & AI Search for Dayton Businesses | DaytonGrowthCo.",
  description: "Get found on Google and AI search with clearer service pages, local proof, Google Business Profile alignment, and practical local SEO for Dayton businesses.",
  alternates: { canonical: url },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url,
    title: "Local SEO & AI Search for Dayton Businesses",
    description: "Clear service information, local proof, and practical Google and AI search improvements for local businesses.",
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
        name: "Local SEO and AI Search Visibility",
        alternateName: "Get Found on Google and AI Search",
        serviceType: "Local SEO, Google Business Profile optimization, and AI search visibility",
        url,
        description: "Practical Google and AI search improvements that clarify services, service areas, local proof, and the next step for customers.",
        provider: { "@id": "https://www.daytongrowth.co/#organization" },
        audience: { "@type": "BusinessAudience", audienceType: "Dayton and Miami Valley local service businesses" },
        areaServed: [{ "@type": "City", name: "Dayton", addressRegion: "OH", addressCountry: "US" }, { "@type": "AdministrativeArea", name: "Miami Valley", addressRegion: "OH", addressCountry: "US" }],
      },
      { "@type": "WebPage", "@id": `${url}#webpage`, url, name: "Local SEO and AI Search for Dayton Businesses", isPartOf: { "@id": "https://www.daytongrowth.co/#website" }, mainEntity: { "@id": `${url}#service` }, inLanguage: "en-US", dateModified: "2026-08-18" },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://www.daytongrowth.co/" }, { "@type": "ListItem", position: 2, name: "Products", item: "https://www.daytongrowth.co/products" }, { "@type": "ListItem", position: 3, name: "Local SEO and AI Search", item: url }] },
    ],
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><HomeApp initialPath="/local-search" /></>;
}
