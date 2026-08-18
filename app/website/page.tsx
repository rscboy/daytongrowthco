import type { Metadata } from "next";
import { ConversionLandingPage } from "@/src/conversion-funnel";

const url = "https://www.daytongrowth.co/website/";

export const metadata: Metadata = {
  title: "The Website Migration Program™ | DaytonGrowthCo.",
  description:
    "Move your website without losing the pages, leads, or tracking that make it work. Get a practical migration plan before launch.",
  alternates: { canonical: url, types: { "text/markdown": "/md/website-migration.md" } },
  openGraph: {
    type: "website",
    url,
    siteName: "DaytonGrowthCo.",
    title: "The Website Migration Program™ | DaytonGrowthCo.",
    description:
      "Move your website without losing the pages, leads, or tracking that make it work.",
    images: [
      {
        url: "https://www.daytongrowth.co/vsl/website-migration-program-share.jpg",
        width: 1200,
        height: 630,
        alt: "The Website Migration Program™ — move your website without losing what already works.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Website Migration Program™ | DaytonGrowthCo.",
    description:
      "Move your website without losing the pages, leads, or tracking that make it work.",
    images: [
      "https://www.daytongrowth.co/vsl/website-migration-program-share.jpg",
    ],
  },
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: "The Website Migration Program™",
        url,
        serviceType: "Website migration to a self-owned static site",
        description: "A structured website migration that reviews the current site, plans the move, migrates or rebuilds required components, tests critical functionality, launches, and completes a post-launch review.",
        provider: { "@id": "https://www.daytongrowth.co/#organization" },
        audience: { "@type": "BusinessAudience", audienceType: "Businesses moving from a recurring website platform" },
        areaServed: { "@type": "Country", name: "United States" },
        offers: { "@type": "Offer", url, name: "Standard Website Migration", price: "1500", priceCurrency: "USD", description: "One-time Standard Migration investment. Recurring ownership cost is documented separately from the migration fee." },
      },
      { "@type": "WebPage", "@id": `${url}#webpage`, url, name: "The Website Migration Program™", description: "Move an existing business website into a self-owned static site.", isPartOf: { "@id": "https://www.daytongrowth.co/#website" }, inLanguage: "en-US", dateModified: "2026-08-07" },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://www.daytongrowth.co/" }, { "@type": "ListItem", position: 2, name: "The Website Migration Program™", item: url }] },
    ],
  };
  return <><script id="dgc-website-migration-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><ConversionLandingPage /></>;
}
