import type { Metadata } from "next";
import { BetterQuoteDslPage } from "@/src/better-quote-funnel";
const url = "https://www.daytongrowth.co/quote";

export const metadata: Metadata = {
  title: "Quote Shopping Service | The Better Quote Program™",
  description: "Upload an expensive written service quote. Real people look for a better qualifying, comparable local option. No qualifying savings? No fee.",
  alternates: { canonical: url, types: { "text/markdown": "/md/quote.md" } },
  robots: { index: true, follow: true },
  openGraph: { title: "Quote Shopping Service | The Better Quote Program™", description: "Upload an expensive written quote. Real people shop it for a better qualifying, comparable local option.", url, images: ["/thumbnail.jpeg"] },
  twitter: { card: "summary_large_image", title: "The Better Quote Program™ | DaytonGrowthCo.", description: "Real people shop expensive written service quotes.", images: ["/thumbnail.jpeg"] },
};

const quoteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${url}#service`,
      name: "The Better Quote Program™",
      url,
      serviceType: "Human-led service quote shopping and consumer advocacy",
      description: "A human-led service that reviews an existing written service quote and contacts legitimate local providers for a better qualifying, comparable option.",
      provider: { "@id": "https://www.daytongrowth.co/#organization" },
      audience: { "@type": "Audience", audienceType: "Consumers with an existing expensive service quote" },
      areaServed: { "@type": "Country", name: "United States" },
      offers: { "@type": "Offer", name: "No-upfront-fee quote search", url: "https://www.daytongrowth.co/quote/pricing", description: "No upfront search fee. A success fee is due only if qualifying savings are found under the program terms." },
    },
    { "@type": "WebPage", "@id": `${url}#webpage`, url, name: "The Better Quote Program™", description: "Human-led quote shopping for an expensive service quote.", isPartOf: { "@id": "https://www.daytongrowth.co/#website" }, mainEntity: { "@id": `${url}#service` }, inLanguage: "en-US", dateModified: "2026-08-18" },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://www.daytongrowth.co/" }, { "@type": "ListItem", position: 2, name: "Products", item: "https://www.daytongrowth.co/products" }, { "@type": "ListItem", position: 3, name: "The Better Quote Program™", item: url }] },
  ],
};

export default function QuotePage() { return <><script id="dgc-quote-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(quoteSchema) }} /><BetterQuoteDslPage /></>; }
