import type { Metadata } from "next";
import HomeApp from "../../src/main";

const url = "https://www.daytongrowth.co/ai-automation";

export const metadata: Metadata = {
  title: "AI Automation Company in Dayton, Ohio | DaytonGrowthCo.",
  description: "Dayton-based AI automation and custom software for small businesses: custom AI agents, workflow automation, system integrations, CRM updates, scheduling, follow-up, and data entry.",
  alternates: { canonical: url },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url,
    title: "AI Automation Company in Dayton, Ohio | DaytonGrowthCo.",
    description: "Custom AI agents, workflow automation, system integrations, and practical custom software for small and midsized businesses.",
    images: ["/thumbnail.jpeg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Automation Company in Dayton, Ohio | DaytonGrowthCo.",
    description: "Practical AI automation and custom software built around the way your business already works.",
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
        name: "AI Automation and Custom Software",
        alternateName: "AI Automation Services in Dayton, Ohio",
        serviceType: "AI automation, custom AI agents, workflow automation, system integrations, operations automation, and custom software development",
        url,
        description: "DaytonGrowthCo designs practical AI-assisted workflows and custom software for lead qualification, CRM updates, appointment scheduling, customer support routing, follow-up, document handling, and repeated data entry.",
        provider: { "@id": "https://www.daytongrowth.co/#organization" },
        audience: { "@type": "BusinessAudience", audienceType: "Small and midsized businesses, contractors, local service companies, and professional offices" },
        areaServed: [
          { "@type": "City", name: "Dayton", addressRegion: "OH", addressCountry: "US" },
          { "@type": "AdministrativeArea", name: "Miami Valley", addressRegion: "OH", addressCountry: "US" },
          { "@type": "Country", name: "United States" },
        ],
        hasOfferCatalog: { "@id": "https://www.daytongrowth.co/#offer-catalog" },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: "AI Automation Company in Dayton, Ohio",
        description: "Custom AI agents, workflow automation, system integrations, and custom software for small and midsized businesses.",
        isPartOf: { "@id": "https://www.daytongrowth.co/#website" },
        mainEntity: { "@id": `${url}#service` },
        inLanguage: "en-US",
        dateModified: "2026-08-18",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.daytongrowth.co/" },
          { "@type": "ListItem", position: 2, name: "Products", item: "https://www.daytongrowth.co/products" },
          { "@type": "ListItem", position: 3, name: "AI Automation", item: url },
        ],
      },
    ],
  };

  return <><script id="dgc-ai-automation-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><HomeApp initialPath="/ai-automation" /></>;
}
